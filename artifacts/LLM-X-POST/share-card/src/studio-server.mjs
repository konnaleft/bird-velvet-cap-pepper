#!/usr/bin/env node
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { renderCardHtml } from "./card-html.mjs";
import { loadStudioMarket } from "./gamma.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STUDIO = join(ROOT, "studio");
const PORT = Number(process.env.PORT || 5173);
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

async function renderPng(url) {
  const market = await loadStudioMarket(url);
  const html = renderCardHtml(market);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 2,
    });
    await page.setContent(html, { waitUntil: "load" });
    const png = await page.locator(".share-card").screenshot({ type: "png" });
    return { png, market };
  } finally {
    await browser.close();
  }
}

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "content-type": type });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);

  if (req.method === "POST" && url.pathname === "/api/png") {
    try {
      const raw = await readBody(req);
      let marketUrl = raw.trim();
      if (raw.startsWith("{")) {
        marketUrl = String(JSON.parse(raw).url || "");
      }
      const { png, market } = await renderPng(marketUrl);
      res.writeHead(200, {
        "content-type": "image/png",
        "x-market-id": market.id,
        "x-market-question": encodeURIComponent(market.question),
      });
      res.end(png);
    } catch (err) {
      send(res, 400, err instanceof Error ? err.message : "Error");
    }
    return;
  }

  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    send(res, 200, readFileSync(join(STUDIO, "index.html")), MIME[".html"]);
    return;
  }

  const rel = url.pathname.replace(/^\/+/, "");
  const file = join(rel.startsWith("CARD-PIPELINE") ? ROOT : STUDIO, rel);
  if (existsSync(file) && file.startsWith(ROOT)) {
    const type = MIME[extname(file)] || "application/octet-stream";
    send(res, 200, readFileSync(file), type);
    return;
  }

  send(res, 404, "Not found");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Studio: http://127.0.0.1:${PORT}`);
});
