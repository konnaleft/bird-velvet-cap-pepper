import { createFileRoute } from "@tanstack/react-router";
import { RectangleHorizontal, Square } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ShareCard, type CardFormat } from "@/components/share-card";
import {
  CARD_SIZE,
  captureShareCard,
  copyPng,
  downloadPng,
} from "@/lib/export-card";
import { loadMarket } from "@/lib/load-market";
import { MARKETS, type StudioMarket } from "@/lib/markets";

export const Route = createFileRoute("/")({ component: Studio });

const SAMPLE_URL =
  "https://polymarket.com/event/fetterman-leaves-the-democrats-before-the-midterms-20260720221037014/fetterman-leaves-the-democrats-by-december-31-2026";

// El preview muestra el MISMO nodo a tamaño real (1080 / 1200px) que luego
// captura Copiar/Descargar PNG, escalado solo visualmente. Así lo que se ve
// es lo que sale: antes el preview era fluido (clamp+vw en ~576px) y el
// export un nodo oculto con tamaños fijos, y el texto salía distinto.
function ScaledPreview({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(Math.min(1, w / width));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div
      ref={wrapRef}
      className="studio__preview-scale"
      style={{ height: Math.max(1, Math.round(height * scale)) }}
    >
      <div
        className="studio__preview-scale-inner"
        style={{
          width,
          height,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Studio() {
  const shotRef = useRef<HTMLElement>(null);
  const [url, setUrl] = useState(SAMPLE_URL);
  const [activeId, setActiveId] = useState(MARKETS[0].id);
  const [live, setLive] = useState<StudioMarket | null>(null);
  const [format, setFormat] = useState<CardFormat>("square");
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const market =
    live ?? MARKETS.find((item) => item.id === activeId) ?? MARKETS[0];
  const size = CARD_SIZE[format];
  const formatLabel =
    format === "square" ? "1:1 recorte de X" : "1.91:1 links / OG";

  async function onLoad(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const next = await loadMarket({ data: { url } });
      setLive(next);
      setMessage("Card lista. Copiá o descargá el PNG — es la misma que ves.");
    } catch (err) {
      setLive(null);
      setError(err instanceof Error ? err.message : "No pude cargar el mercado.");
    } finally {
      setBusy(false);
    }
  }

  async function exportBlob() {
    const node = shotRef.current;
    if (!node) throw new Error("La card todavía no está lista.");
    setExporting(true);
    setError("");
    try {
      return await captureShareCard(node, format);
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="studio">
      <header className="studio__header">
        <p className="studio__kicker">Share card studio</p>
        <h1 className="studio__heading">Polymarket Trend</h1>
        <p className="studio__lede">
          Pegá la URL. El PNG sale listo para X. Por defecto es{" "}
          <strong>cuadrado 1080×1080</strong> — el recorte que usa X al pegar.
        </p>
      </header>

      <section className="studio__format" aria-label="Formato de la card">
        <p className="studio__label" id="format-label">
          Formato
        </p>
        <div className="studio__format-row" role="group" aria-labelledby="format-label">
          <button
            type="button"
            className={
              format === "square"
                ? "studio__format-btn studio__format-btn--on"
                : "studio__format-btn"
            }
            aria-pressed={format === "square"}
            onClick={() => setFormat("square")}
          >
            <Square className="studio__format-icon" aria-hidden="true" />
            <span className="studio__format-copy">
              <strong>Cuadrado 1:1</strong>
              <em>1080×1080 · recorte de X</em>
            </span>
          </button>
          <button
            type="button"
            className={
              format === "wide"
                ? "studio__format-btn studio__format-btn--on"
                : "studio__format-btn"
            }
            aria-pressed={format === "wide"}
            onClick={() => setFormat("wide")}
          >
            <RectangleHorizontal className="studio__format-icon" aria-hidden="true" />
            <span className="studio__format-copy">
              <strong>Horizontal 1.91:1</strong>
              <em>1200×630 · links / OG</em>
            </span>
          </button>
        </div>
      </section>

      <form className="studio__form" onSubmit={onLoad}>
        <label className="studio__label" htmlFor="market-url">
          URL de Polymarket
        </label>
        <div className="studio__row">
          <input
            id="market-url"
            className="studio__input"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://polymarket.com/event/..."
            autoComplete="off"
          />
          <button className="studio__chip studio__chip--on" type="submit" disabled={busy}>
            {busy ? "Cargando…" : "Armar card"}
          </button>
        </div>
      </form>

      <nav className="studio__nav" aria-label="Ejemplos">
        {MARKETS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              !live && item.id === market.id
                ? "studio__chip studio__chip--on"
                : "studio__chip"
            }
            onClick={() => {
              setLive(null);
              setActiveId(item.id);
              setMessage("");
              setError("");
            }}
          >
            {item.id === "fetterman"
              ? "Fetterman"
              : item.id === "ufc"
                ? "UFC (título largo)"
                : item.id === "milei"
                  ? "Milei"
                  : item.id === "hormuz"
                    ? "Hormuz"
                    : "Inflación"}
          </button>
        ))}
      </nav>

      <p className="studio__preview-cap">
        PNG {size.width}×{size.height} · {formatLabel}
      </p>

      <ScaledPreview width={size.width} height={size.height}>
        <div
          className={
            format === "square"
              ? "share-card-shot share-card-shot--square"
              : "share-card-shot"
          }
        >
          <ShareCard market={market} format={format} shot ref={shotRef} />
        </div>
      </ScaledPreview>

      <div className="studio__actions">
        <button
          type="button"
          className="studio__chip studio__chip--on"
          disabled={exporting}
          onClick={async () => {
            try {
              const blob = await exportBlob();
              await copyPng(blob);
              setMessage(
                `PNG ${size.width}×${size.height} copiado — listo para pegar en X.`,
              );
            } catch (err) {
              setError(err instanceof Error ? err.message : "No pude copiar.");
            }
          }}
        >
          Copiar PNG
        </button>
        <button
          type="button"
          className="studio__chip"
          disabled={exporting}
          onClick={async () => {
            try {
              const blob = await exportBlob();
              await downloadPng(
                blob,
                `${market.id}-${format}-${size.width}.png`,
              );
              setMessage(`PNG ${size.width}×${size.height} descargado.`);
            } catch (err) {
              setError(err instanceof Error ? err.message : "No pude descargar.");
            }
          }}
        >
          Descargar PNG
        </button>
        <a className="studio__chip" href="/CARD-PIPELINE.md" download>
          Nota para agentes
        </a>
      </div>

      {message ? <p className="studio__ok">{message}</p> : null}
      {error ? <p className="studio__err">{error}</p> : null}
    </main>
  );
}
