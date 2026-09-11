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

export async function captureShareCard(
  node: HTMLElement,
  format: CardFormat = "square",
): Promise<Blob> {
  await waitForImages(node);
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

  const { width, height } = CARD_SIZE[format];

  const blob = await toBlob(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#081228",
    width,
    height,
    skipAutoScale: true,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: "none",
      opacity: "1",
    },
  });

  if (!blob) throw new Error("No pude capturar la card.");
  return blob;
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
