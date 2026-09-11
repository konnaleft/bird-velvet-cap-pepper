import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
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
          Pegá la URL de un mercado. Lo que ves es lo que se copia. Por defecto
          sale cuadrado 1080×1080 — el recorte que usa X al pegar la imagen.
        </p>
      </header>

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

      <nav className="studio__nav" aria-label="Formato">
        <button
          type="button"
          className={format === "square" ? "studio__chip studio__chip--on" : "studio__chip"}
          onClick={() => setFormat("square")}
        >
          Cuadrado 1:1
        </button>
        <button
          type="button"
          className={format === "wide" ? "studio__chip studio__chip--on" : "studio__chip"}
          onClick={() => setFormat("wide")}
        >
          Horizontal 1.91:1
        </button>
      </nav>

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

      <div className={format === "square" ? "studio__preview studio__preview--square" : "studio__preview"}>
        <ShareCard market={market} format={format} />
      </div>

      <div
        className={
          format === "square" ? "share-card-shot share-card-shot--square" : "share-card-shot"
        }
        aria-hidden="true"
      >
        <ShareCard market={market} format={format} ref={shotRef} />
      </div>

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
