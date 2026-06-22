#!/usr/bin/env node
/**
 * Discover SwaggerHub owner names available to the API key.
 * Prints only usernames/orgs — no secrets or emails.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_FILE = join(ROOT, ".env.swaggerhub");
const API_BASE = "https://api.swaggerhub.com";

function loadApiKey() {
  if (!existsSync(ENV_FILE)) {
    console.error("Missing .env.swaggerhub");
    process.exit(1);
  }
  for (const line of readFileSync(ENV_FILE, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    if (trimmed.slice(0, eq).trim() !== "SWAGGERHUB_API_KEY") continue;
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (value) return value;
  }
  console.error("SWAGGERHUB_API_KEY is empty");
  process.exit(1);
}

async function fetchJson(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: apiKey, Accept: "application/json" },
  });
  if (res.status === 401) {
    console.error("FAIL: API key rejected (HTTP 401)");
    process.exit(1);
  }
  if (!res.ok) return { status: res.status, data: null };
  return { status: res.status, data: await res.json() };
}

const apiKey = loadApiKey();
const owners = new Set();

function collectOwnersFromSpecs(data) {
  const apis = data?.apis ?? data?.items ?? [];
  for (const entry of apis) {
    if (typeof entry?.owner === "string") owners.add(entry.owner);
    if (typeof entry?.name === "string" && typeof entry?.owner === "string") {
      owners.add(entry.owner);
    }
  }
}

function collectOwnersFromApisList(data) {
  const list = data?.apis ?? data?.apiList ?? data?.items ?? data ?? [];
  if (!Array.isArray(list)) return;
  for (const entry of list) {
    if (typeof entry === "string") {
      const slash = entry.indexOf("/");
      if (slash > 0) owners.add(entry.slice(0, slash));
      continue;
    }
    if (typeof entry?.owner === "string") owners.add(entry.owner);
    if (typeof entry?.name === "string" && typeof entry?.owner === "string") {
      owners.add(entry.owner);
    }
  }
}

console.log("Discovering SwaggerHub owners for your API key...\n");

const specs = await fetchJson("/specs?limit=100");
if (specs.data) collectOwnersFromSpecs(specs.data);

const apis = await fetchJson("/apis?limit=100");
if (apis.data) collectOwnersFromApisList(apis.data);

const orgs = await fetchJson("/user-management/v1/orgs?limit=100");
if (orgs.data) {
  for (const org of orgs.data?.items ?? orgs.data ?? []) {
    if (typeof org === "string") owners.add(org);
    if (typeof org?.name === "string") owners.add(org.name);
    if (typeof org?.slug === "string") owners.add(org.slug);
    if (typeof org?.id === "string") owners.add(org.id);
  }
}

if (owners.size === 0) {
  console.log("No owners found via /specs, /apis, or /orgs.");
  console.log("Your account may be new with no APIs yet.");
  console.log("\nTry opening https://app.swaggerhub.com/ — after login, check the URL or top-right menu.");
  console.log("Or set SWAGGERHUB_OWNER to the slug shown under My Hub in the left sidebar.");
  process.exit(1);
}

console.log("Available owners (use one as SWAGGERHUB_OWNER):\n");
for (const owner of [...owners].sort((a, b) => a.localeCompare(b))) {
  console.log(`  ${owner}`);
}
