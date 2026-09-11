# Polymarket Trend — pipeline de share cards

Para humanos y agentes (Muse Spark incluido). **No hace falta generar imágenes con IA.** Gamma ya manda foto; el diseño es código.

## Objetivo

Pegar una URL de Polymarket → card 1200×630 lista para copiar/pegar en X.

Layout canónico:

- Texto e odds **a la izquierda**
- Foto en **panel derecho** (~42%), JPEG rectangular, no cutout
- Degradé suave solo en el borde izquierdo de la foto
- Precio en **¢**, barra bajo el outcome, Volume y Liquidity juntos (nunca cortados)
- Título con wrap; nunca `overflow: hidden` en el h2

## Recorte de rostros

Las JPEG de Gamma son **apaisadas** (Fetterman 768×512). El panel de arte es **vertical**.

- `object-position: center right` → oreja / hombro
- `object-position: left center` → fondo negro, cara fuera
- Default correcto: **`center center`**
- Fetterman: JPEG local ya recortada a retrato (cara al centro) en `public/scenes/fetterman.jpg`

QA Fetterman: frente + barba + ojos, Volume y Liquidity juntos. No el perfil.

| Tipo | object-position |
|---|---|
| Persona / default | `center center` |
| Milei (cara a la derecha del frame) | `right center` |
| Hormuz / inflación | `center right` |

## Qué no hacer

- Recortar personas con remove.bg
- Upscalers
- Panel flotante de odds a la derecha
- `mask-image` / `backdrop-filter` en el PNG
- Estirar thumbs a 2400px
- Inventar categoría Movies

Si Gamma manda `image: null` → card navy sin foto.

## Cómo usarlo (producto)

1. Pegar `https://polymarket.com/event/.../...`
2. Armar card
3. **Copiar PNG** o **Descargar PNG** — captura el **mismo DOM** de la preview a 2×.

## Cómo usarlo (agente)

1. Extraer `eventSlug` / `marketSlug` de la URL.
2. `GET https://gamma-api.polymarket.com/markets?slug={marketSlug}`
3. Si vacío: `GET .../events?slug={eventSlug}` y tomar el market del path, o el de mayor volume.
4. `outcomes` + `outcomePrices` son JSON strings. Leading = mayor price.
5. Categoría = primer tag de `Senate|Politics|Sports|Economics|Crypto|Finance|Music|Science|Business|Pop Culture`.
6. Foto = `market.image` (S3). Host permitido: `polymarket-upload.s3.*.amazonaws.com`.
7. Pintar PNG 1200×630:
   - panel derecho `object-fit: cover` + `object-position: left center` en retratos
   - columna texto ~58%
   - wrap del título; bajar font si `question.length > 54`
   - `Math.round(price*100)+'¢'`
   - Volume y Liquidity en el mismo box, `flex-shrink: 0`

## Archivos

| Pieza | Path |
|---|---|
| Preview React | `src/components/share-card.tsx` |
| Export PNG | `src/lib/export-card.ts` (`html-to-image` @2x) |
| Gamma + parse URL | `src/lib/polymarket.server.ts` |
| Server fn | `src/lib/load-market.ts` |
| CSS | `src/styles.css` |

## QA mínimo

- Fetterman: cara completa a la derecha
- UFC título largo: se lee `(Featherweight Main Card)`
- Milei / Hormuz / inflación: foto a la derecha, ¢ a la izquierda
- Copiar PNG = la preview
