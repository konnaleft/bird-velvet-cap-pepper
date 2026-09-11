# Share card — pipeline para LLM-X-POST

Para humanos y agentes (Muse Spark incluido). **No generar la imagen con IA.**

## App local

```bash
cd share-card
npm i
npx playwright install chromium
npm start
```

Abrí **http://127.0.0.1:5173** — pegá la URL, Armar card, Copiar PNG.

## CLI (agente / bot)

```
node share-card/src/cli.mjs "https://polymarket.com/event/.../..."
# escribe share-card/out/<slug>-card.png
```

## Layout

- Texto e odds a la **izquierda**
- Foto en panel **derecho**, JPEG rectangular, no cutout
- Precio en **¢**
- Volume y Liquidity juntos
- Título con wrap

## Recorte de rostros

| object-position | Resultado |
|---|---|
| `center right` | oreja / hombro |
| `left center` | fondo negro |
| **`center center`** | cara (default) |
| `right center` | Milei |

Fetterman usa `public/scenes/fetterman.jpg` (retrato ya recortado).

## Enganche al post de X

1. El LLM escribe el texto.
2. `node src/cli.mjs "$URL"` → PNG.
3. Adjuntar el PNG. No regenerar la card con IA.

## Qué no hacer

- Actualizar `polymarket-ui-kit`
- remove.bg, upscalers, Satori
- Copiar el workspace de Grok (auth, PWA)
