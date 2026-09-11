# Polymarket Trend — pipeline de share cards

Para humanos y agentes (Muse Spark incluido). **No hace falta generar imágenes con IA.** Gamma ya manda foto; el diseño es código.

Repo de trabajo: https://github.com/konnaleft/bird-velvet-cap-pepper

## Objetivo

Pegar una URL de Polymarket → PNG listo para copiar/pegar en X.

Hay **dos formatos**. El default para X es cuadrado:

| Formato | Tamaño | Uso |
|---|---|---|
| `square` (default) | **1080×1080** | Feed y recorte de X. Como WatcherGuru: la imagen ya nace 1:1, no hay que recortar. |
| `wide` | 1200×630 | OG / link preview / embed horizontal |

X, al pegar un 1200×630, abre el recortador en cuadrado y se come el título. Por eso el PNG de X sale 1:1 con tipografía grande.

Layout: texto e odds a la izquierda, foto a la derecha. Precio en ¢. Título con wrap.

## Cómo usarlo

1. Pegar URL de Polymarket
2. Elegir Cuadrado 1:1 (X) o Horizontal 1.91:1
3. Armar card
4. Copiar o descargar PNG
