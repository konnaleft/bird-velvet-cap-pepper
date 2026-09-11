#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { renderCardHtml } from "./card-html.mjs";
import { loadStudioMarket } from "./gamma.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const url = process.argv[2];
const outArg = process.argv[3];

if (!url) {
  console.error("Uso: node src/cli.mjs <url-polymarket> [out.png]");
  process.exit(1);
}

const market = await loadStudioMarket(url);
const html = renderCardHtml(market);
const outDir = join(ROOT, "out");
mkdirSync(outDir, { recursive: true });
const out = outArg || join(outDir, `${market.id}-card.png`);

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
});
await page.setContent(html, { waitUntil: "load" });
await page.locator(".share-card").screenshot({ path: out, type: "png" });
await browser.close();

writeFileSync(
  join(outDir, `${market.id}.json`),
  JSON.stringify(
    {
      id: market.id,
      question: market.question,
      category: market.category,
      leading: market.leading,
      volume: market.volume,
      liquidity: market.liquidity,
      png: out,
    },
    null,
    2,
  ),
);

console.log(out);
