import type { StudioMarket } from "./markets";

const GAMMA = "https://gamma-api.polymarket.com";
const IMAGE_HOSTS = [
  "polymarket-upload.s3.us-east-2.amazonaws.com",
  "polymarket-upload.s3.amazonaws.com",
];

const LOCAL_SCENES: Array<{ test: RegExp; image: string; position: string }> = [
  { test: /milei/, image: "/scenes/milei.jpg", position: "right center" },
  { test: /hormuz/, image: "/scenes/hormuz.jpg", position: "center right" },
  {
    test: /inflation|inflacion/,
    image: "/scenes/argentina.jpg",
    position: "center right",
  },
  { test: /fetterman/, image: "/scenes/fetterman.jpg", position: "center center" },
];

const UFC_SCENE = {
  image: "/scenes/ufc.jpg",
  position: "center center",
  imageFit: "cover" as const,
};

const UFC_RE =
  /\bufc\b|ultimate fighting|contender series|dana white|mcmillen|rahiki/;

export type ParsedMarketRef = {
  eventSlug?: string;
  marketSlug?: string;
};

export function parsePolymarketInput(raw: string): ParsedMarketRef {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Pegá una URL o slug de Polymarket.");

  const asUrl = trimmed.startsWith("http")
    ? trimmed
    : trimmed.includes("/")
      ? `https://polymarket.com/${trimmed.replace(/^\/+/, "")}`
      : null;

  if (asUrl) {
    let url: URL;
    try {
      url = new URL(asUrl);
    } catch {
      throw new Error("URL inválida.");
    }
    const host = url.hostname.replace(/^www\./, "");
    if (host !== "polymarket.com") {
      throw new Error("Usá un link de polymarket.com.");
    }
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "event" && parts[1]) {
      return { eventSlug: parts[1], marketSlug: parts[2] };
    }
    if ((parts[0] === "market" || parts[0] === "markets") && parts[1]) {
      return { marketSlug: parts[1] };
    }
    if (parts.length === 1) return { marketSlug: parts[0] };
    throw new Error("No pude leer el mercado en esa URL.");
  }

  if (/^[a-z0-9-]+$/i.test(trimmed)) return { marketSlug: trimmed };
  throw new Error("Pegá la URL completa del mercado.");
}

export function formatCompact(value: number | string | null | undefined) {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  if (!Number.isFinite(n) || n <= 0) return "0";
  if (n >= 1_000_000) {
    const digits = n >= 10_000_000 ? 0 : 1;
    return `${Number((n / 1_000_000).toFixed(digits))}M`;
  }
  if (n >= 1000) {
    const digits = n >= 100_000 ? 0 : 1;
    return `${Number((n / 1000).toFixed(digits))}K`;
  }
  return `${Math.round(n)}`;
}

function parseJsonList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return [];
    }
  }
  return [];
}

function categoryFromTags(tags: unknown): string {
  const labels = Array.isArray(tags)
    ? tags
        .map((tag) =>
          tag && typeof tag === "object" && "label" in tag
            ? String((tag as { label: string }).label)
            : "",
        )
        .filter(Boolean)
    : [];
  const preferred = [
    "Senate",
    "Politics",
    "Sports",
    "Economics",
    "Crypto",
    "Finance",
    "Music",
    "Science",
    "Business",
    "Pop Culture",
    "Culture",
  ];
  const hit = preferred.find((label) =>
    labels.some((item) => item.toLowerCase() === label.toLowerCase()),
  );
  if (hit) return hit;
  if (labels.some((item) => /election/i.test(item))) return "Politics";
  return labels[0] || "Prediction market";
}

function leadingOutcome(market: Record<string, unknown>) {
  const names = parseJsonList(market.outcomes);
  const prices = parseJsonList(market.outcomePrices).map(Number);
  let best = 0;
  for (let i = 1; i < prices.length; i += 1) {
    if ((prices[i] || 0) > (prices[best] || 0)) best = i;
  }
  return {
    name: names[best] || "Yes",
    price: Number.isFinite(prices[best]) ? prices[best] : 0,
  };
}

function isUfc(...parts: Array<string | undefined | null>) {
  return UFC_RE.test(parts.filter(Boolean).join(" ").toLowerCase());
}

function sceneFor(haystack: string, fallback: string) {
  if (isUfc(haystack) || /ufc-logo/i.test(fallback)) return UFC_SCENE;
  const local = LOCAL_SCENES.find((item) => item.test.test(haystack));
  if (local) return { ...local, imageFit: "cover" as const };
  return { image: fallback, position: "center center", imageFit: "cover" as const };
}

function allowedImage(url: string) {
  try {
    const host = new URL(url).hostname;
    return IMAGE_HOSTS.some((allowed) => host === allowed || host.endsWith(".amazonaws.com"));
  } catch {
    return false;
  }
}

async function fetchJson(path: string) {
  const res = await fetch(`${GAMMA}${path}`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Gamma ${res.status}`);
  return res.json() as Promise<unknown>;
}

async function fetchEventBySlug(slug: string) {
  const exact = await fetchJson(`/events?slug=${encodeURIComponent(slug)}`);
  const exactHit = Array.isArray(exact) ? asMarket(exact[0]) : asMarket(exact);
  if (exactHit) return exactHit;

  const queries = [slug, slug.replace(/-/g, " ")];
  for (const query of queries) {
    try {
      const search = await fetchJson(
        `/public-search?q=${encodeURIComponent(query)}`,
      );
      const events = Array.isArray(asMarket(search)?.events)
        ? (asMarket(search)?.events as unknown[])
        : [];
      const hit = events.find((item) => {
        const value = String(asMarket(item)?.slug || "");
        return value === slug || value.startsWith(`${slug}-`);
      });
      if (hit) return asMarket(hit);
    } catch {
      /* try next query */
    }
  }
  return null;
}

async function toDataUrl(url: string) {
  if (!allowedImage(url)) return "";
  const res = await fetch(url);
  if (!res.ok) return "";
  const mime = res.headers.get("content-type") || "image/jpeg";
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.byteLength > 2_500_000) return "";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

function asMarket(row: unknown): Record<string, unknown> | null {
  if (!row || typeof row !== "object") return null;
  return row as Record<string, unknown>;
}

export async function loadStudioMarket(rawUrl: string): Promise<StudioMarket> {
  const ref = parsePolymarketInput(rawUrl);
  let market: Record<string, unknown> | null = null;
  let tags: unknown = [];
  let commentCount: string | undefined;

  if (ref.marketSlug) {
    const list = await fetchJson(
      `/markets?slug=${encodeURIComponent(ref.marketSlug)}`,
    );
    market = Array.isArray(list) ? asMarket(list[0]) : asMarket(list);
  }

  if (ref.eventSlug) {
    const event = await fetchEventBySlug(ref.eventSlug);
    if (event) {
      tags = event.tags;
      commentCount = event.commentCount
        ? formatCompact(event.commentCount as number)
        : undefined;
      if (!market) {
        const markets = Array.isArray(event.markets) ? event.markets : [];
        const wanted = ref.marketSlug
          ? markets.find((item) => asMarket(item)?.slug === ref.marketSlug)
          : null;
        const ranked = [...markets].sort((a, b) => {
          const av = Number(asMarket(a)?.volumeNum ?? asMarket(a)?.volume ?? 0);
          const bv = Number(asMarket(b)?.volumeNum ?? asMarket(b)?.volume ?? 0);
          return bv - av;
        });
        market = asMarket(wanted) ?? asMarket(ranked[0]);
      }
      if (!String(market?.image || market?.icon || "") && event.image) {
        market = { ...(market ?? {}), image: event.image, icon: event.icon };
      }
    }
  }

  if (!market) throw new Error("No encontré ese mercado en Gamma.");

  if (!tags || (Array.isArray(tags) && tags.length === 0)) {
    const events = Array.isArray(market.events) ? market.events : [];
    tags = asMarket(events[0])?.tags ?? [];
  }

  const slug = String(market.slug || ref.marketSlug || "market");
  const question = String(market.question || "Untitled market");
  const remoteImage = String(market.image || market.icon || "");
  const scene = sceneFor(
    [rawUrl, ref.eventSlug, ref.marketSlug, slug, question, categoryFromTags(tags)].join(" "),
    remoteImage,
  );
  let image = scene.image;
  if (image.startsWith("http")) {
    image = (await toDataUrl(image)) || "";
  }

  return {
    id: slug,
    category: categoryFromTags(tags),
    question,
    leading: leadingOutcome(market),
    volume: formatCompact(
      (market.volumeNum ?? market.volume) as string | number | undefined,
    ),
    liquidity: formatCompact(
      (market.liquidityNum ?? market.liquidity) as string | number | undefined,
    ),
    comments: commentCount,
    image,
    objectPosition: scene.position,
    imageFit: scene.imageFit,
  };
}
