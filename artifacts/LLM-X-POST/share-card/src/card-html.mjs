import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CSS = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "card.css"),
  "utf8",
);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => {
    if (ch === "&") return "\u0026amp;";
    if (ch === "<") return "\u0026lt;";
    if (ch === ">") return "\u0026gt;";
    if (ch === '"') return "\u0026quot;";
    return "\u0026#39;";
  });
}

function titleClass(question) {
  if (question.length > 88) return "is-sm";
  if (question.length > 54) return "is-md";
  return "";
}

export function renderCardHtml(market) {
  const fill = `${Math.round(market.leading.price * 100)}%`;
  const cents = `${Math.round(market.leading.price * 100)}¢`;
  const comments = market.comments
    ? `<div><dt>Comments</dt><dd>${escapeHtml(market.comments)}</dd></div>`
    : "";
  const img = market.image
    ? `<img class="share-card__scene" src="${market.image}" alt="" style="object-position:${escapeHtml(market.objectPosition)}" />`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <style>${CSS}</style>
</head>
<body>
<article class="share-card">
  <div class="share-card__content">
    <div class="share-card__topline">
      <span class="share-card__brand">Polymarket Trend</span>
    </div>
    <p class="share-card__eyebrow">${escapeHtml(market.category)}</p>
    <h2 class="share-card__title ${titleClass(market.question)}">${escapeHtml(market.question)}</h2>
    <div class="share-card__quote">
      <span class="share-card__label">Leading outcome</span>
      <div class="share-card__quote-row">
        <strong>${escapeHtml(market.leading.name)}</strong>
        <span class="share-card__price">${cents}</span>
      </div>
      <div class="share-card__bar" aria-hidden="true"><span style="width:${fill}"></span></div>
    </div>
    <dl class="share-card__stats">
      <div><dt>Volume</dt><dd>${escapeHtml(market.volume)}</dd></div>
      <div><dt>Liquidity</dt><dd>${escapeHtml(market.liquidity)}</dd></div>
      ${comments}
    </dl>
  </div>
  <div class="share-card__art">
    ${img}
    <div class="share-card__scrim" aria-hidden="true"></div>
  </div>
</article>
</body>
</html>`;
}
