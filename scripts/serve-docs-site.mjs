#!/usr/bin/env node
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
const PORT = Number(process.env.DOCS_SITE_PORT ?? 8765);
const HOST = process.env.DOCS_SITE_HOST ?? "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".yaml": "text/yaml; charset=utf-8",
  ".yml": "text/yaml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

if (!existsSync(ROOT)) {
  console.error("site/ не найден. Сначала: npm run docs:build");
  process.exit(1);
}

createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${HOST}`);
  let pathname = decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html";
  if (pathname.endsWith("/")) pathname += "index.html";

  const filePath = join(ROOT, pathname);
  if (!filePath.startsWith(ROOT) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const ext = extname(filePath);
  res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
  res.end(readFileSync(filePath));
}).listen(PORT, HOST, () => {
  console.log(`Docs site: http://${HOST}:${PORT}/`);
  console.log(`API Reference: http://${HOST}:${PORT}/reference.html`);
});
