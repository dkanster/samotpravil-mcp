import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCollection, stripHtml, searchEndpoints } from "../dist/docs.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const html = '<p>SMTP <code>1126</code> and <a href="https://samotpravil.ru">link</a></p>';
const text = stripHtml(html);
if (!text.includes("1126") || !text.includes("link")) {
  throw new Error("stripHtml failed");
}

const endpoints = [
  {
    id: "1",
    category: "Стоп-листы",
    name: "Поиск имейла",
    method: "GET",
    url: "https://api.samotpravil.ru/api/v2/stop-list/search",
    description: "search email in stop list",
    examples: [],
  },
];

const found = searchEndpoints(endpoints, "stop-list search", 1);
if (found.length !== 1 || found[0].name !== "Поиск имейла") {
  throw new Error("searchEndpoints failed");
}

const snapshotPath = join(ROOT, "data", "collection.snapshot.json");
const collection = JSON.parse(readFileSync(snapshotPath, "utf8"));
const parsed = parseCollection(collection, "snapshot", { syncedAt: "2026-01-01T00:00:00Z" });

if (parsed.endpoints.length < 50) {
  throw new Error(`Expected >=50 endpoints in snapshot, got ${parsed.endpoints.length}`);
}

if (parsed.overview.docsSource !== "snapshot") {
  throw new Error("parseCollection docsSource mismatch");
}

if (!parsed.overview.publishDate) {
  throw new Error("Expected publishDate in overview");
}

process.env.SAMOTPRAVIL_DOCS_MODE = "snapshot";
const { loadDocumentation } = await import("../dist/docs.js");
const loaded = await loadDocumentation();
if (loaded.endpoints.length !== parsed.endpoints.length) {
  throw new Error("loadDocumentation snapshot count mismatch");
}
