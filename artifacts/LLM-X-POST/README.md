# LLM-X-POST

URL de Polymarket → PNG 1200×630 → post en X.

La card no la genera un LLM. La dibuja `share-card/`.

## App local (studio)

```bash
cd share-card
npm i
npx playwright install chromium
npm start
```

Abrí **http://127.0.0.1:5173**

Pegá la URL del mercado → Armar card → Copiar PNG.

## CLI (bot / Muse)

```bash
node share-card/src/cli.mjs "https://polymarket.com/event/.../..."
# → share-card/out/<slug>-card.png
```

Ver [share-card/CARD-PIPELINE.md](share-card/CARD-PIPELINE.md).
