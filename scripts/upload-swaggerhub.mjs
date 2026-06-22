#!/usr/bin/env node
/**
 * Upload data/openapi.yaml to SwaggerHub.
 *
 * Env (process.env or .env.samotpravil):
 *   SWAGGERHUB_API_KEY  — https://app.swaggerhub.com/settings/apiKey
 *   SWAGGERHUB_OWNER    — your SwaggerHub username or org
 *   SWAGGERHUB_API_NAME — default: samotpravil-smtp-api
 *   SWAGGERHUB_VERSION  — default: 1.0.0 (must match info.version in the spec)
 *   SWAGGERHUB_IS_PRIVATE — default: false (public catalog)
 *
 * Usage:
 *   npm run export-openapi && npm run upload-swaggerhub
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OPENAPI = join(ROOT, "data", "openapi.yaml");
const API_BASE = "https://api.swaggerhub.com";

const ENV_KEYS = [
  "SWAGGERHUB_API_KEY",
  "SWAGGERHUB_OWNER",
  "SWAGGERHUB_API_NAME",
  "SWAGGERHUB_VERSION",
  "SWAGGERHUB_IS_PRIVATE",
];

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!ENV_KEYS.includes(key) || process.env[key]) continue;
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (value) process.env[key] = value;
  }
}

for (const file of [join(ROOT, ".env.samotpravil"), join(ROOT, ".env.swaggerhub")]) {
  loadEnvFile(file);
}

const apiKey = process.env.SWAGGERHUB_API_KEY?.trim();
const owner = process.env.SWAGGERHUB_OWNER?.trim();
const apiName = process.env.SWAGGERHUB_API_NAME?.trim() || "samotpravil-smtp-api";
const version = process.env.SWAGGERHUB_VERSION?.trim() || "1.0.0";
const isPrivate = process.env.SWAGGERHUB_IS_PRIVATE === "true";

if (!apiKey) {
  console.error("Missing SWAGGERHUB_API_KEY.");
  console.error("Get one at https://app.swaggerhub.com/settings/apiKey");
  console.error("Add to .env.samotpravil or .env.swaggerhub");
  process.exit(1);
}

if (!owner) {
  console.error("Missing SWAGGERHUB_OWNER (your SwaggerHub username or org).");
  process.exit(1);
}

if (!existsSync(OPENAPI)) {
  console.error(`Missing ${OPENAPI}. Run: npm run export-openapi`);
  process.exit(1);
}

const spec = readFileSync(OPENAPI, "utf8");
const url = new URL(`${API_BASE}/apis/${encodeURIComponent(owner)}/${encodeURIComponent(apiName)}`);
url.searchParams.set("version", version);
url.searchParams.set("isPrivate", String(isPrivate));
url.searchParams.set("force", "true");

console.log(`Uploading ${OPENAPI} → ${owner}/${apiName}@${version} (private=${isPrivate})`);

const response = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: apiKey,
    "Content-Type": "application/yaml",
  },
  body: spec,
});

const body = await response.text();

if (!response.ok) {
  console.error(`Upload failed: HTTP ${response.status}`);
  console.error(body.slice(0, 2000));
  process.exit(1);
}

console.log("Upload OK");
console.log(`View: https://app.swaggerhub.com/apis/${owner}/${apiName}/${version}`);
if (!isPrivate) {
  console.log(`Catalog: https://catalog.swaggerhub.com/apis/${owner}/${apiName}/${version}`);
}
