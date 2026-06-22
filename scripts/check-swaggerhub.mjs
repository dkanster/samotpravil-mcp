#!/usr/bin/env node
/**
 * Verify SwaggerHub credentials (no secrets in output).
 * Usage: node scripts/check-swaggerhub.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_FILE = join(ROOT, ".env.swaggerhub");

function loadEnv() {
  if (!existsSync(ENV_FILE)) {
    console.error("FAIL: .env.swaggerhub not found");
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(ENV_FILE, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (value) env[key] = value;
  }
  return env;
}

const env = loadEnv();
const key = env.SWAGGERHUB_API_KEY;
const owner = env.SWAGGERHUB_OWNER;

if (!key) {
  console.error("FAIL: SWAGGERHUB_API_KEY is empty");
  process.exit(1);
}
if (!owner) {
  console.error("FAIL: SWAGGERHUB_OWNER is empty");
  process.exit(1);
}

console.log(`Checking SwaggerHub for owner: ${owner}`);

const listUrl = `https://api.swaggerhub.com/apis/${encodeURIComponent(owner)}?limit=1`;
const listRes = await fetch(listUrl, { headers: { Authorization: key } });

if (listRes.status === 401) {
  console.error("FAIL: API key rejected (HTTP 401)");
  console.error("Regenerate at https://app.swaggerhub.com/settings/apiKey");
  process.exit(1);
}

if (listRes.status === 403) {
  console.error("FAIL: API key valid but no access to this owner (HTTP 403)");
  console.error("Use your personal username or an org where you can create APIs.");
  process.exit(1);
}

if (listRes.status === 404) {
  console.error(`FAIL: owner "${owner}" not found on SwaggerHub (HTTP 404)`);
  console.error("Check SWAGGERHUB_OWNER — use the exact username from your profile URL:");
  console.error("  https://app.swaggerhub.com/apis/YOUR_USERNAME/...");
  process.exit(1);
}

if (!listRes.ok) {
  console.error(`FAIL: unexpected HTTP ${listRes.status} when listing APIs`);
  process.exit(1);
}

console.log("OK: API key accepted, owner is accessible");
console.log("Run: npm run upload-swaggerhub");
