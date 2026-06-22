#!/usr/bin/env node
/**
 * Static docs site (alternative to Postman Documenter).
 * Generates site/ from collection snapshot + OpenAPI (Scalar).
 *
 * Usage: npm run docs:build && npm run docs:serve
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildOpenApiFromSnapshot } from "./lib/openapi-from-snapshot.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SNAPSHOT = join(ROOT, "data", "collection.snapshot.json");
const SITE = join(ROOT, "site");
const MCP_BLOCK = join(ROOT, "docs", "official", "MCP_INSTALL_BLOCK.html");

function pageShell({ title, active, body }) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — СамОтправил API</title>
  <link rel="stylesheet" href="/assets/site.css" />
</head>
<body>
  <header class="topbar">
    <a class="brand" href="/">СамОтправил API</a>
    <nav>
      <a href="/" class="${active === "overview" ? "active" : ""}">Обзор</a>
      <a href="/reference.html" class="${active === "reference" ? "active" : ""}">API Reference</a>
      <a href="https://samotpravil.ru/get-access" target="_blank" rel="noopener">Получить доступ</a>
    </nav>
  </header>
  <main>${body}</main>
  <footer class="footer">
    Статический preview из Postman snapshot ·
    <a href="https://github.com/dkanster/samotpravil-mcp">samotpravil-mcp</a>
  </footer>
</body>
</html>`;
}

const collection = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
const overviewHtml = collection.info?.description ?? "<p>Документация API СамОтправил.</p>";
const mcpBlock = existsSync(MCP_BLOCK) ? readFileSync(MCP_BLOCK, "utf8") : "";

const { yaml, operationCount, tagCount, overview } = buildOpenApiFromSnapshot(SNAPSHOT, collection, {
  fullDescriptions: true,
  officialDocsUrl: "https://github.com/dkanster/samotpravil-mcp/tree/main/site",
});

mkdirSync(join(SITE, "assets"), { recursive: true });
writeFileSync(join(SITE, "openapi.yaml"), yaml, "utf8");

const indexHtml = pageShell({
  title: "Обзор",
  active: "overview",
  body: `
    <article class="prose">
      <p class="badge">Preview · ${operationCount} методов · ${tagCount} разделов</p>
      ${overviewHtml}
      ${mcpBlock}
      <p><a class="button" href="/reference.html">Открыть API Reference →</a></p>
    </article>`,
});

const referenceHtml = pageShell({
  title: "API Reference",
  active: "reference",
  body: `
    <div id="api-reference"></div>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    <script>
      Scalar.createApiReference('#api-reference', {
        url: '/openapi.yaml',
        theme: 'purple',
        layout: 'modern',
        hideDownloadButton: false,
        metaData: {
          title: '${overview.title.replace(/'/g, "\\'")}',
        },
      });
    </script>`,
});

writeFileSync(join(SITE, "index.html"), indexHtml, "utf8");
writeFileSync(join(SITE, "reference.html"), referenceHtml, "utf8");

const css = `:root {
  color-scheme: light dark;
  --bg: #0f1117;
  --surface: #171923;
  --text: #e8eaf0;
  --muted: #9aa3b2;
  --accent: #7c5cff;
  --border: #2a3040;
  --prose: #12151c;
}
@media (prefers-color-scheme: light) {
  :root {
    --bg: #f6f7fb;
    --surface: #ffffff;
    --text: #141824;
    --muted: #5c6475;
    --prose: #ffffff;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: Inter, system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  position: sticky;
  top: 0;
  z-index: 10;
}
.brand { font-weight: 700; color: var(--text); text-decoration: none; }
.topbar nav { display: flex; gap: 1rem; flex-wrap: wrap; }
.topbar a { color: var(--muted); text-decoration: none; font-size: 0.95rem; }
.topbar a.active, .topbar a:hover { color: var(--accent); }
main { min-height: calc(100vh - 120px); }
.prose {
  max-width: 920px;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
  background: var(--prose);
}
.prose :is(h1,h2,h3) { line-height: 1.25; }
.prose a { color: var(--accent); }
.prose pre, .prose code {
  background: rgba(124, 92, 255, 0.08);
  border-radius: 6px;
}
.badge {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background: rgba(124, 92, 255, 0.15);
  color: var(--accent);
  font-size: 0.85rem;
}
.button {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  background: var(--accent);
  color: white !important;
  text-decoration: none;
  font-weight: 600;
}
#api-reference { min-height: calc(100vh - 120px); }
.footer {
  padding: 1rem 1.25rem 1.5rem;
  text-align: center;
  color: var(--muted);
  font-size: 0.85rem;
  border-top: 1px solid var(--border);
}
.footer a { color: var(--accent); }
`;

writeFileSync(join(SITE, "assets", "site.css"), css, "utf8");

console.log(`Built docs site → ${SITE}`);
console.log(`  ${operationCount} operations, overview: ${overview.title}`);
console.log(`  Preview: npm run docs:serve → http://127.0.0.1:8765/`);
