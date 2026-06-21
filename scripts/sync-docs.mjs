import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const COLLECTION_URL =
  "https://documentation.samotpravil.ru/api/collections/26779685/2s93RZM9in?segregateAuth=true&versionTag=latest";
const SNAPSHOT_PATH = join(ROOT, "data", "collection.snapshot.json");
const META_PATH = join(ROOT, "data", "snapshot.meta.json");

function countRequests(items, count = 0) {
  for (const item of items ?? []) {
    if (item.request) count += 1;
    if (item.item?.length) count = countRequests(item.item, count);
  }
  return count;
}

const response = await fetch(COLLECTION_URL, { headers: { Accept: "application/json" } });
if (!response.ok) {
  console.error(`Failed to fetch collection: HTTP ${response.status}`);
  process.exit(1);
}

const collection = await response.json();
mkdirSync(dirname(SNAPSHOT_PATH), { recursive: true });
writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(collection, null, 2)}\n`, "utf8");

const meta = {
  syncedAt: new Date().toISOString(),
  publishDate: collection.info?.publishDate ?? null,
  collectionName: collection.info?.name ?? null,
  endpointCount: countRequests(collection.item),
  source: COLLECTION_URL,
};

writeFileSync(META_PATH, `${JSON.stringify(meta, null, 2)}\n`, "utf8");
console.log(`Wrote ${SNAPSHOT_PATH}`);
console.log(`Endpoints: ${meta.endpointCount}, publishDate: ${meta.publishDate}`);
