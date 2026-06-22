#!/usr/bin/env node
/**
 * Test SwaggerHub + Swagger-MCP connectivity (no secrets in output).
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const API_BASE = "https://api.swaggerhub.com";

const ENV_KEYS = [
  "SWAGGERHUB_API_KEY",
  "SWAGGERHUB_OWNER",
  "SWAGGERHUB_API_NAME",
  "SWAGGERHUB_VERSION",
  "SWAGGERHUB_IS_PRIVATE",
  "SAMOTPRAVIL_SWAGGER_URL",
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

function ok(label, detail = "") {
  console.log(`✓ ${label}${detail ? `: ${detail}` : ""}`);
}

function fail(label, detail = "") {
  console.error(`✗ ${label}${detail ? `: ${detail}` : ""}`);
  process.exit(1);
}

console.log("Swagger connection test\n");

if (!apiKey) fail("SWAGGERHUB_API_KEY", "not set in .env.swaggerhub");
if (!owner) fail("SWAGGERHUB_OWNER", "not set in .env.swaggerhub");
ok("Config loaded", `owner=${owner}, api=${apiName}@${version}, private=${isPrivate}`);

// 1. SwaggerHub API — auth + spec fetch
const specUrl = new URL(
  `${API_BASE}/apis/${encodeURIComponent(owner)}/${encodeURIComponent(apiName)}`,
);
specUrl.searchParams.set("version", version);
specUrl.searchParams.set("resolved", "true");

const specRes = await fetch(specUrl, {
  headers: {
    Authorization: apiKey,
    Accept: "application/yaml, application/json",
  },
});

function looksLikeOpenApi(text) {
  const head = text.trimStart().slice(0, 200);
  return /^\s*openapi:/m.test(text) || head.startsWith("{") && text.includes('"openapi"');
}

async function tryFetchSpec(label, url, auth = true) {
  const res = await fetch(url, {
    headers: {
      ...(auth ? { Authorization: apiKey } : {}),
      Accept: "application/yaml, application/json",
    },
  });
  const text = await res.text();
  const valid = res.ok && looksLikeOpenApi(text);
  const paths = valid ? (text.match(/^\s{2}\/[^\s:]+:/gm) || []).length : 0;
  return { label, url, status: res.status, ok: res.ok, valid, paths, contentType: res.headers.get("content-type") };
}

let specResult = await tryFetchSpec("resolved query", specUrl.toString());

if (!specResult.valid) {
  const altUrl = `${API_BASE}/apis/${encodeURIComponent(owner)}/${encodeURIComponent(apiName)}/${encodeURIComponent(version)}`;
  const alt = await tryFetchSpec("path version", altUrl);
  if (alt.valid) specResult = alt;
}

if (!specResult.valid) {
  if (specResult.status === 401 || specResult.status === 403) {
    fail("SwaggerHub auth", `HTTP ${specResult.status} — проверьте SWAGGERHUB_API_KEY`);
  }
  if (specResult.status === 404) {
    fail(
      "SwaggerHub spec",
      `HTTP 404 — API ${owner}/${apiName}@${version} ещё не загружен. Выполните: npm run export-openapi && npm run upload-swaggerhub`,
    );
  }
  fail(
    "SwaggerHub spec",
    `HTTP ${specResult.status} (${specResult.contentType ?? "unknown type"}) — не OpenAPI`,
  );
}

ok("SwaggerHub API", `HTTP ${specResult.status}, ~${specResult.paths} paths (${specResult.label})`);

// 2. Public URL (used by Swagger-MCP when not private)
const publicUrl = `https://api.swaggerhub.com/apis/${encodeURIComponent(owner)}/${encodeURIComponent(apiName)}/${encodeURIComponent(version)}`;
if (!isPrivate) {
  const pubRes = await fetch(publicUrl, {
    headers: { Accept: "application/yaml, application/json" },
  });
  if (pubRes.ok) {
    ok("Swagger-MCP public URL", publicUrl);
  } else {
    console.log(`⚠ Public URL returned HTTP ${pubRes.status} — Swagger-MCP will use local data/openapi.yaml fallback`);
  }
} else {
  console.log("⚠ SWAGGERHUB_IS_PRIVATE=true — Swagger-MCP needs SAMOTPRAVIL_SWAGGER_URL or local fallback");
}

// 3. Swagger-MCP vendor build
const mcpEntry = join(ROOT, "vendor", "swagger-mcp", "build", "index.js");
if (!existsSync(mcpEntry)) {
  const prep = spawnSync("npm", ["run", "prepare-swagger-mcp"], { cwd: ROOT, stdio: "inherit" });
  if (prep.status !== 0) fail("Swagger-MCP build");
}
ok("Swagger-MCP binary", mcpEntry);

// 4. Swagger-MCP — verify spec URL is downloadable (same as server startup)
const testUrl = process.env.SAMOTPRAVIL_SWAGGER_URL?.trim() || (!isPrivate ? publicUrl : null);
if (testUrl) {
  const dl = await tryFetchSpec("swagger-mcp url", testUrl, !isPrivate);
  if (dl.valid) {
    ok("Swagger-MCP download", `${dl.paths} paths from ${testUrl}`);
  } else if (!isPrivate && dl.status === 401) {
    console.log(`⚠ Public URL requires auth (HTTP ${dl.status}) — launcher использует локальный data/openapi.yaml`);
    if (!existsSync(join(ROOT, "data", "openapi.yaml"))) {
      fail("Swagger-MCP fallback", "data/openapi.yaml отсутствует");
    }
    ok("Swagger-MCP fallback", "data/openapi.yaml (локальный HTTP)");
  } else if (existsSync(join(ROOT, "data", "openapi.yaml"))) {
    console.log(`⚠ URL недоступен (HTTP ${dl.status}) — launcher использует локальный data/openapi.yaml`);
    ok("Swagger-MCP fallback", "data/openapi.yaml (локальный HTTP)");
  } else {
    fail("Swagger-MCP download", `HTTP ${dl.status} — spec недоступен`);
  }
} else if (existsSync(join(ROOT, "data", "openapi.yaml"))) {
  ok("Swagger-MCP fallback", "data/openapi.yaml (локальный HTTP server)");
} else {
  fail("Swagger-MCP source", "нет URL и нет data/openapi.yaml");
}

console.log("\nAll checks passed.");
