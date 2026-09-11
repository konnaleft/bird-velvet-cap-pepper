import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
import { ShareCard } from "@/components/share-card";
import { captureShareCard, copyPng, downloadPng } from "@/lib/export-card";
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
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const market =
    live ?? MARKETS.find((item) => item.id === activeId) ?? MARKETS[0];

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
      return await captureShareCard(node);
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
          Pegá la URL de un mercado. Lo que ves es lo que se copia: PNG 1200×630
          idéntico a la preview.
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

      <ShareCard market={market} />

      <div className="share-card-shot" aria-hidden="true">
        <ShareCard market={market} ref={shotRef} />
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
              setMessage("PNG copiado — es la misma card que ves arriba.");
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
              await downloadPng(blob, `${market.id}-card.png`);
              setMessage("PNG descargado — mismo diseño que la preview.");
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
