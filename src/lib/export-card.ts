import { toBlob } from "html-to-image";

function waitForImages(node: HTMLElement) {
  const images = Array.from(node.querySelectorAll("img"));
  return Promise.all(
    images.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            }),
    ),
  );
}

export async function captureShareCard(node: HTMLElement): Promise<Blob> {
  await waitForImages(node);
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

  const blob = await toBlob(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#081228",
    width: 1200,
    height: 630,
    skipAutoScale: true,
    style: {
      width: "1200px",
      height: "630px",
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
