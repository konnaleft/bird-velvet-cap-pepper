import { toBlob } from "html-to-image";

export type CardFormat = "wide" | "square";

export const CARD_SIZE = {
  wide: { width: 1200, height: 630 },
  square: { width: 1080, height: 1080 },
} as const;

function waitForImages(node: HTMLElement) {
  const images = Array.from(node.querySelectorAll("img"));
  return Promise.all(
    images.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          }),
    ),
  );
}

function parkForCapture(node: HTMLElement) {
  const inner =
    (node.closest(".studio__stage-inner") as HTMLElement | null) ??
    (node.closest(".share-card-shot") as HTMLElement | null);
  if (!inner) return () => {};
  inner.classList.add("is-capturing");
  return () => inner.classList.remove("is-capturing");
}

function blobToImage(blob: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    const href = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(href);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(href);
      reject(new Error("No pude leer el PNG."));
    };
    img.src = href;
  });
}

function canvasToPng(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("No pude capturar la card."));
      else resolve(blob);
    }, "image/png");
  });
}

export async function captureShareCard(
  node: HTMLElement,
  format: CardFormat = "square",
): Promise<Blob> {
  await waitForImages(node);
  const restore = parkForCapture(node);
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

  const { width, height } = CARD_SIZE[format];
  const pixelRatio = 2;

  try {
    const cardBlob = await toBlob(node, {
      cacheBust: true,
      pixelRatio,
      backgroundColor: "#081228",
      width,
      height,
      skipAutoScale: true,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        transform: "none",
        opacity: "1",
        left: "0",
        top: "0",
        right: "auto",
        bottom: "auto",
        margin: "0",
        position: "relative",
        overflow: "hidden",
      },
    });
    if (!cardBlob) throw new Error("No pude capturar la card.");

    const stats = node.querySelector(".share-card__stats") as HTMLElement | null;
    if (!stats) return cardBlob;

    const cardRect = node.getBoundingClientRect();
    const statsRect = stats.getBoundingClientRect();
    const statsBlob = await toBlob(stats, {
      cacheBust: true,
      pixelRatio,
      backgroundColor: "#081228",
      width: Math.ceil(statsRect.width),
      height: Math.ceil(statsRect.height),
      skipAutoScale: true,
      style: {
        transform: "none",
        opacity: "1",
        position: "relative",
        left: "0",
        top: "0",
        margin: "0",
      },
    });
    if (!statsBlob) return cardBlob;

    const cardImg = await blobToImage(cardBlob);
    const statsImg = await blobToImage(statsBlob);
    const canvas = document.createElement("canvas");
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return cardBlob;
    ctx.drawImage(cardImg, 0, 0, canvas.width, canvas.height);
    const scaleX = canvas.width / Math.max(cardRect.width, 1);
    const scaleY = canvas.height / Math.max(cardRect.height, 1);
    const x = (statsRect.left - cardRect.left) * scaleX;
    const y = (statsRect.top - cardRect.top) * scaleY;
    ctx.drawImage(
      statsImg,
      x,
      y,
      statsRect.width * scaleX,
      statsRect.height * scaleY,
    );
    return canvasToPng(canvas);
  } finally {
    restore();
  }
}

export async function downloadPng(blob: Blob, name: string) {
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = name;
  link.click();
  URL.revokeObjectURL(href);
}

export async function copyPng(blob: Blob) {
  if (!navigator.clipboard || !("ClipboardItem" in window)) {
    throw new Error("Este navegador no copia imágenes. Descargá el PNG.");
  }
  await navigator.clipboard.write([
    new ClipboardItem({ "image/png": blob }),
  ]);
}
