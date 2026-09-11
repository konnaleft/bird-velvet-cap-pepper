//#region node_modules/.nitro/vite/services/ssr/assets/polymarket.server-BIle1vNx.js
var GAMMA = "https://gamma-api.polymarket.com";
var IMAGE_HOSTS = ["polymarket-upload.s3.us-east-2.amazonaws.com", "polymarket-upload.s3.amazonaws.com"];
var LOCAL_SCENES = [
	{
		test: /milei/,
		image: "/scenes/milei.jpg",
		position: "right center"
	},
	{
		test: /hormuz/,
		image: "/scenes/hormuz.jpg",
		position: "center right"
	},
	{
		test: /inflation|inflacion/,
		image: "/scenes/argentina.jpg",
		position: "center right"
	},
	{
		test: /ufc|mcmillen|rahiki/,
		image: "/scenes/ufc.jpg",
		position: "center center"
	},
	{
		test: /fetterman/,
		image: "/scenes/fetterman.jpg",
		position: "center center"
	}
];
function parsePolymarketInput(raw) {
	const trimmed = raw.trim();
	if (!trimmed) throw new Error("Pegá una URL o slug de Polymarket.");
	const asUrl = trimmed.startsWith("http") ? trimmed : trimmed.includes("/") ? `https://polymarket.com/${trimmed.replace(/^\/+/, "")}` : null;
	if (asUrl) {
		let url;
		try {
			url = new URL(asUrl);
		} catch {
			throw new Error("URL inválida.");
		}
		if (url.hostname.replace(/^www\./, "") !== "polymarket.com") throw new Error("Usá un link de polymarket.com.");
		const parts = url.pathname.split("/").filter(Boolean);
		if (parts[0] === "event" && parts[1]) return {
			eventSlug: parts[1],
			marketSlug: parts[2]
		};
		if ((parts[0] === "market" || parts[0] === "markets") && parts[1]) return { marketSlug: parts[1] };
		if (parts.length === 1) return { marketSlug: parts[0] };
		throw new Error("No pude leer el mercado en esa URL.");
	}
	if (/^[a-z0-9-]+$/i.test(trimmed)) return { marketSlug: trimmed };
	throw new Error("Pegá la URL completa del mercado.");
}
function formatCompact(value) {
	const n = typeof value === "string" ? Number(value) : value ?? 0;
	if (!Number.isFinite(n) || n <= 0) return "0";
	if (n >= 1e6) {
		const digits = n >= 1e7 ? 0 : 1;
		return `${Number((n / 1e6).toFixed(digits))}M`;
	}
	if (n >= 1e3) {
		const digits = n >= 1e5 ? 0 : 1;
		return `${Number((n / 1e3).toFixed(digits))}K`;
	}
	return `${Math.round(n)}`;
}
function parseJsonList(value) {
	if (Array.isArray(value)) return value.map(String);
	if (typeof value === "string") try {
		const parsed = JSON.parse(value);
		if (Array.isArray(parsed)) return parsed.map(String);
	} catch {
		return [];
	}
	return [];
}
function categoryFromTags(tags) {
	const labels = Array.isArray(tags) ? tags.map((tag) => tag && typeof tag === "object" && "label" in tag ? String(tag.label) : "").filter(Boolean) : [];
	const hit = [
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
		"Culture"
	].find((label) => labels.some((item) => item.toLowerCase() === label.toLowerCase()));
	if (hit) return hit;
	if (labels.some((item) => /election/i.test(item))) return "Politics";
	return labels[0] || "Prediction market";
}
function leadingOutcome(market) {
	const names = parseJsonList(market.outcomes);
	const prices = parseJsonList(market.outcomePrices).map(Number);
	let best = 0;
	for (let i = 1; i < prices.length; i += 1) if ((prices[i] || 0) > (prices[best] || 0)) best = i;
	return {
		name: names[best] || "Yes",
		price: Number.isFinite(prices[best]) ? prices[best] : 0
	};
}
function sceneFor(slug, fallback) {
	const local = LOCAL_SCENES.find((item) => item.test.test(slug));
	if (local) return local;
	return {
		image: fallback,
		position: "center center"
	};
}
function allowedImage(url) {
	try {
		const host = new URL(url).hostname;
		return IMAGE_HOSTS.some((allowed) => host === allowed || host.endsWith(".amazonaws.com"));
	} catch {
		return false;
	}
}
async function fetchJson(path) {
	const res = await fetch(`${GAMMA}${path}`, { headers: { accept: "application/json" } });
	if (!res.ok) throw new Error(`Gamma ${res.status}`);
	return res.json();
}
async function toDataUrl(url) {
	if (!allowedImage(url)) return "";
	const res = await fetch(url);
	if (!res.ok) return "";
	const mime = res.headers.get("content-type") || "image/jpeg";
	const buf = Buffer.from(await res.arrayBuffer());
	if (buf.byteLength > 25e5) return "";
	return `data:${mime};base64,${buf.toString("base64")}`;
}
function asMarket(row) {
	if (!row || typeof row !== "object") return null;
	return row;
}
async function loadStudioMarket(rawUrl) {
	const ref = parsePolymarketInput(rawUrl);
	let market = null;
	let tags = [];
	let commentCount;
	if (ref.marketSlug) {
		const list = await fetchJson(`/markets?slug=${encodeURIComponent(ref.marketSlug)}`);
		market = Array.isArray(list) ? asMarket(list[0]) : asMarket(list);
	}
	if (ref.eventSlug) {
		const list = await fetchJson(`/events?slug=${encodeURIComponent(ref.eventSlug)}`);
		const event = Array.isArray(list) ? asMarket(list[0]) : asMarket(list);
		if (event) {
			tags = event.tags;
			commentCount = event.commentCount ? formatCompact(event.commentCount) : void 0;
			if (!market) {
				const markets = Array.isArray(event.markets) ? event.markets : [];
				const wanted = ref.marketSlug ? markets.find((item) => asMarket(item)?.slug === ref.marketSlug) : null;
				const ranked = [...markets].sort((a, b) => {
					const av = Number(asMarket(a)?.volumeNum ?? asMarket(a)?.volume ?? 0);
					return Number(asMarket(b)?.volumeNum ?? asMarket(b)?.volume ?? 0) - av;
				});
				market = asMarket(wanted) ?? asMarket(ranked[0]);
			}
		}
	}
	if (!market) throw new Error("No encontré ese mercado en Gamma.");
	if (!tags || Array.isArray(tags) && tags.length === 0) tags = asMarket((Array.isArray(market.events) ? market.events : [])[0])?.tags ?? [];
	const slug = String(market.slug || ref.marketSlug || "market");
	const scene = sceneFor(slug, String(market.image || market.icon || ""));
	let image = scene.image;
	if (image.startsWith("http")) image = await toDataUrl(image) || "";
	return {
		id: slug,
		category: categoryFromTags(tags),
		question: String(market.question || "Untitled market"),
		leading: leadingOutcome(market),
		volume: formatCompact(market.volumeNum ?? market.volume),
		liquidity: formatCompact(market.liquidityNum ?? market.liquidity),
		comments: commentCount,
		image,
		objectPosition: scene.position
	};
}
//#endregion
export { loadStudioMarket };
