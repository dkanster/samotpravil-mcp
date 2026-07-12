#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDocumentation } from "../dist/docs.js";
import { endpointApiPath, isSamotpravilApiEndpoint } from "../dist/endpointMeta.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const jsonOut = process.argv.includes("--json");

process.env.SAMOTPRAVIL_DOCS_MODE = "snapshot";

const wishlist = JSON.parse(readFileSync(join(ROOT, "data", "upstream-wishlist.json"), "utf8"));
const { endpoints } = await loadDocumentation();

const snapshotPaths = new Set(
  endpoints
    .filter(isSamotpravilApiEndpoint)
    .map((endpoint) => endpointApiPath(endpoint.url)),
);

const report = wishlist.items.map((item) => {
  const inSnapshot = snapshotPaths.has(item.path);
  let trackingStatus = "pending";

  if (item.status === "stabilize" && inSnapshot) {
    trackingStatus = "in_snapshot_deprecated";
  } else if (item.status === "proposed" && inSnapshot) {
    trackingStatus = "shipped";
  } else if (item.status === "proposed" && !inSnapshot) {
    trackingStatus = "wishlist_pending";
  }

  return { ...item, inSnapshot, trackingStatus };
});

if (jsonOut) {
  console.log(JSON.stringify({ items: report }, null, 2));
  process.exit(0);
}

for (const row of report) {
  console.log(`${row.trackingStatus.padEnd(22)} ${row.method} ${row.path}`);
}

const pending = report.filter((row) => row.trackingStatus === "wishlist_pending").length;
console.log(`\nOK: upstream tracking — ${pending} proposed endpoints not in snapshot yet`);
