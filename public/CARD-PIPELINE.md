# Polymarket Trend — pipeline de share cards

Para humanos y agentes (Muse Spark incluido). **No hace falta generar imágenes con IA.** Gamma ya manda foto; el diseño es código.

Repo de trabajo: https://github.com/konnaleft/bird-velvet-cap-pepper

## Objetivo

Pegar una URL de Polymarket → PNG listo para copiar/pegar en X.

Hay **dos formatos**. El default para X es cuadrado. En el studio aparecen como dos botones grandes **arriba de todo** (no chips chicos):

| Formato | Tamaño | Uso |
|---|---|---|
| `square` (default) | **1080×1080** | Feed y recorte de X. Como WatcherGuru: la imagen ya nace 1:1, no hay que recortar. |
| `wide` | 1200×630 | OG / link preview / embed horizontal |

X, al pegar un 1200×630, abre el recortador en cuadrado y se come el título (`t IPO by December`). Por eso el PNG de X sale 1:1 con tipografía grande.

**Si el sitio de Vercel todavía dice “PNG 1200×630” y no muestra Cuadrado/Horizontal:** Production está clavada en un snapshot viejo. `Redeploy` del deploy actual **vuelve a publicar el mismo commit**. Hay que desplegar el `main` más reciente de GitHub, no rearmar el Production viejo.

Layout canónico (los dos formatos):

- Texto e odds **a la izquierda**
- Foto en **panel derecho**, JPEG rectangular, no cutout
- Degradé suave solo en el borde izquierdo de la foto
- Precio en **¢**, barra bajo el outcome
- **Volume, Liquidity y Comments en UNA sola fila**, caja anclada al borde inferior. Nunca `width: max-content` + `flex-wrap` en esa caja: html-to-image la achica al primer ítem y el PNG recorta Liquidity/Comments.

- Título con wrap; nunca `overflow: hidden` en el h2
- En cuadrado el panel es 540/540; el título y el ¢ son más grandes porque hay más alto

## Recorte de rostros

Las JPEG de Gamma son **apaisadas**. El panel de arte en cuadrado es un cuadrado.

- Default: **`center center`**
- Milei: `right center`
- Hormuz / inflación: `center right`

## Qué no hacer

- Recortar personas con remove.bg
- Upscalers
- Panel flotante de odds a la derecha
- `mask-image` / `backdrop-filter` en el PNG
- Estirar thumbs
- Inventar categoría Movies
- Exportar solo 1200×630 si el destino es un post en X

Si Gamma manda `image: null` → card navy sin foto.

## Cómo usarlo (producto)

1. Elegir **Cuadrado 1:1** (X) o **Horizontal 1.91:1** — botones grandes arriba
2. Pegar `https://polymarket.com/event/.../...` y Armar card
3. **Copiar PNG** o **Descargar PNG** — captura el mismo DOM de la preview a 2× (2160×2160 o 2400×1260)

## Cómo usarlo (agente)

1. Extraer `eventSlug` / `marketSlug` de la URL.
2. `GET https://gamma-api.polymarket.com/markets?slug={marketSlug}`
3. Si vacío: `GET .../events?slug={eventSlug}` y tomar el market del path, o el de mayor volume.
4. `outcomes` + `outcomePrices` son JSON strings. Leading = mayor price.
5. Categoría = primer tag de `Senate|Politics|Sports|Economics|Crypto|Finance|Music|Science|Business|Pop Culture`.
6. Foto = `market.image` (S3). Host permitido: `polymarket-upload.s3.*.amazonaws.com`.
7. Pintar PNG **1080×1080** para X (o 1200×630 si piden wide):
   - panel derecho `object-fit: cover`
   - columna texto 50% en square / ~53% en wide
   - wrap del título; clases `--lg` / `--md` / `--sm` según `question.length` (54 / 88)
   - `Math.round(price*100)+'¢'`
   - Volume y Liquidity en el mismo box

Tipografía del PNG cuadrado (canvas 1080):

- Brand ~23px
- Título corto ~50px, medio ~42px, largo ~35px
- Precio ~86px
- Stats ~23px

## Archivos

| Pieza | Path |
|---|---|
| Preview React | `src/components/share-card.tsx` |
| Export PNG | `src/lib/export-card.ts` (`html-to-image` @2x, `CARD_SIZE`) |
| Gamma + parse URL | `src/lib/polymarket.server.ts` |
| Server fn | `src/lib/load-market.ts` |
| CSS | `src/styles.css` |
| Studio | `src/routes/index.tsx` |

## QA mínimo

- Los dos botones de formato se ven **sin scrollear** (arriba del input)
- En X compose, el cuadrado no corta el título
- Fetterman: cara completa a la derecha
- UFC título largo: se lee `(Featherweight Main Card)`
- Milei / Hormuz / inflación: foto a la derecha, ¢ a la izquierda
- Copiar PNG = la preview del formato elegido
- Volume + Liquidity (+ Comments si Gamma lo manda) se leen enteros en el PNG 1:1, no cortados abajo

