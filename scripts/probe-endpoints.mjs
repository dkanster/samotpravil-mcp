#!/usr/bin/env node
/**
 * Probe Samotpravil API endpoints against Postman snapshot examples.
 * Usage: node scripts/probe-endpoints.mjs [--json]
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCollection } from "../dist/docs.js";
import {
  endpointApiPath,
  isSamotpravilApiEndpoint,
  parseJsonLoose,
  queryParamsFromUrl,
} from "../dist/endpointMeta.js";
import { isSendPath } from "../dist/safety.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = "https://api.samotpravil.ru";
const TIMEOUT_MS = 25_000;
const jsonOut = process.argv.includes("--json");

function loadApiKey() {
  for (const file of [join(ROOT, ".env.samotpravil"), join(ROOT, "ai", ".env.samotpravil")]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      if (key !== "SAMOTPRAVIL_API_KEY") continue;
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (value) return value;
    }
  }
  throw new Error("SAMOTPRAVIL_API_KEY not found in .env.samotpravil");
}

const MUTATING_PREFIXES = [
  "/api/v2/stop-list/add",
  "/api/v2/stop-list/remove",
  "/api/v2/blist/domains/add",
  "/api/v2/blist/domains/remove",
  "/api/v2/blist/domains/verify",
  "/api/v2/blist/create",
  "/api/v2/blist/update",
  "/api/v2/authkey/create",
  "/api/v2/stop-list/export",
  "/api/v1/package_stop",
];

function skipReason(endpoint) {
  if (!isSamotpravilApiEndpoint(endpoint)) {
    if (endpoint.method === "SMTP") return "smtp";
    if (endpoint.url.includes("webhook")) return "webhook";
    return "not_api";
  }

  const path = endpointApiPath(endpoint.url);
  if (isSendPath(path)) return "send";
  if (endpoint.method === "DELETE") return "destructive";
  if (MUTATING_PREFIXES.some((p) => path.startsWith(p))) return "mutating";

  if (path.includes(":")) return "path_placeholder";

  if (endpoint.method === "POST" && path.startsWith("/api/v2/tickets")) return "mutating";

  return null;
}

function jsonKeys(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.keys(value).sort();
}

function parseBody(text, contentType) {
  if (!text?.trim()) return { kind: "empty", keys: [] };
  if (contentType?.includes("application/json")) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { kind: "json", keys: jsonKeys(parsed), parsed };
      }
      return { kind: "json", keys: [], parsed };
    } catch {
      return { kind: "text", keys: [] };
    }
  }
  return { kind: "text", keys: [] };
}

function documentedCodes(endpoint) {
  const codes = new Set();
  for (const ex of endpoint.examples ?? []) {
    if (typeof ex.code === "number") codes.add(ex.code);
  }
  return [...codes].sort((a, b) => a - b);
}

function documentedSuccessKeys(endpoint) {
  const keys = new Set();
  for (const ex of endpoint.examples ?? []) {
    if (ex.code !== 200 && ex.code !== 201) continue;
    if (!ex.body?.trim()) continue;
    try {
      const parsed = parseJsonLoose(ex.body);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        for (const k of Object.keys(parsed)) keys.add(k);
      }
    } catch {
      // ignore
    }
  }
  return [...keys].sort();
}

function classifyResult(endpoint, status, bodyInfo, skip) {
  if (skip) return { verdict: "skipped", reason: skip };

  const docCodes = documentedCodes(endpoint);
  const statusMatch = docCodes.length === 0 || docCodes.includes(status);

  const docKeys = documentedSuccessKeys(endpoint);
  let shapeMatch = true;
  let missingKeys = [];
  let extraKeys = [];

  if (docKeys.length > 0 && bodyInfo.kind === "json" && (status === 200 || status === 201)) {
    const actual = new Set(bodyInfo.keys);
    missingKeys = docKeys.filter((k) => !actual.has(k));
    extraKeys = bodyInfo.keys.filter((k) => !docKeys.includes(k));
    shapeMatch = missingKeys.length === 0;
  }

  if (!statusMatch) {
    return {
      verdict: "status_mismatch",
      docCodes,
      shapeMatch,
      missingKeys,
      extraKeys,
    };
  }

  if (!shapeMatch) {
    return {
      verdict: "shape_diff",
      docCodes,
      shapeMatch,
      missingKeys,
      extraKeys,
    };
  }

  if (docCodes.length === 0) {
    return { verdict: "no_doc_examples", docCodes };
  }

  return { verdict: "ok", docCodes, shapeMatch };
}

async function probeEndpoint(apiKey, endpoint) {
  const skip = skipReason(endpoint);
  const path = endpointApiPath(endpoint.url);
  const method = endpoint.method.toUpperCase();
  const query = queryParamsFromUrl(endpoint.url);

  if (skip) {
    return {
      name: endpoint.name,
      method,
      path,
      skip,
      classification: classifyResult(endpoint, null, null, skip),
    };
  }

  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }

  const headers = {
    Authorization: apiKey,
    Accept: "application/json",
  };

  let body;
  if (method !== "GET" && method !== "HEAD" && endpoint.bodyExample?.trim()) {
    try {
      body = JSON.stringify(parseJsonLoose(endpoint.bodyExample));
      headers["Content-Type"] = "application/json";
    } catch {
      body = endpoint.bodyExample;
      headers["Content-Type"] = "application/json";
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
    });

    const text = await response.text();
    const contentType = response.headers.get("content-type") ?? "";
    const bodyInfo = parseBody(text, contentType);
    const classification = classifyResult(endpoint, response.status, bodyInfo, null);

    return {
      name: endpoint.name,
      method,
      path,
      status: response.status,
      docCodes: documentedCodes(endpoint),
      bodyPreview: text.slice(0, 280).replace(/\s+/g, " "),
      bodyKeys: bodyInfo.keys,
      docSuccessKeys: documentedSuccessKeys(endpoint),
      classification,
    };
  } catch (error) {
    return {
      name: endpoint.name,
      method,
      path,
      error: error instanceof Error ? error.message : String(error),
      classification: { verdict: "error" },
    };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const apiKey = loadApiKey();
  const collection = JSON.parse(readFileSync(join(ROOT, "data", "collection.snapshot.json"), "utf8"));
  const { endpoints } = parseCollection(collection, "snapshot", { syncedAt: new Date().toISOString() });

  const results = [];
  for (const endpoint of endpoints) {
    results.push(await probeEndpoint(apiKey, endpoint));
  }

  const summary = {
    total: results.length,
    ok: 0,
    shape_diff: 0,
    status_mismatch: 0,
    no_doc_examples: 0,
    skipped: 0,
    error: 0,
  };

  for (const r of results) {
    const v = r.classification?.verdict ?? "error";
    if (summary[v] !== undefined) summary[v] += 1;
    else summary.error += 1;
  }

  if (jsonOut) {
    console.log(JSON.stringify({ summary, results }, null, 2));
    return;
  }

  console.log("Samotpravil API vs Postman snapshot\n");
  console.log(`Total endpoints: ${summary.total}`);
  console.log(
    `OK: ${summary.ok} | shape diff: ${summary.shape_diff} | status mismatch: ${summary.status_mismatch} | no examples: ${summary.no_doc_examples} | skipped: ${summary.skipped} | errors: ${summary.error}`,
  );
  console.log("");

  const groups = {
    status_mismatch: [],
    shape_diff: [],
    error: [],
    no_doc_examples: [],
    skipped: [],
  };

  for (const r of results) {
    const v = r.classification?.verdict;
    if (v === "ok") continue;
    if (groups[v]) groups[v].push(r);
  }

  if (groups.status_mismatch.length) {
    console.log("=== Status mismatch (actual not in documented codes) ===");
    for (const r of groups.status_mismatch) {
      console.log(`- ${r.method} ${r.path}`);
      console.log(`  ${r.name}`);
      console.log(`  actual: ${r.status} | documented: ${r.docCodes.join(", ") || "—"}`);
      if (r.bodyPreview) console.log(`  body: ${r.bodyPreview}`);
      console.log("");
    }
  }

  if (groups.shape_diff.length) {
    console.log("=== Shape diff (200/201 but JSON keys differ from doc examples) ===");
    for (const r of groups.shape_diff) {
      console.log(`- ${r.method} ${r.path} → ${r.status}`);
      console.log(`  ${r.name}`);
      console.log(`  doc keys: ${r.docSuccessKeys.join(", ")}`);
      console.log(`  actual keys: ${r.bodyKeys.join(", ")}`);
      if (r.classification.missingKeys?.length) {
        console.log(`  missing: ${r.classification.missingKeys.join(", ")}`);
      }
      console.log("");
    }
  }

  if (groups.error.length) {
    console.log("=== Errors ===");
    for (const r of groups.error) {
      console.log(`- ${r.method} ${r.path}: ${r.error}`);
    }
    console.log("");
  }

  if (groups.no_doc_examples.length) {
    console.log("=== Probed OK but no saved Postman response examples ===");
    for (const r of groups.no_doc_examples) {
      console.log(`- ${r.method} ${r.path} → ${r.status} | ${r.name}`);
    }
    console.log("");
  }

  if (groups.skipped.length) {
    console.log("=== Skipped ===");
    const byReason = {};
    for (const r of groups.skipped) {
      byReason[r.skip] = (byReason[r.skip] ?? 0) + 1;
    }
    console.log(byReason);
    for (const r of groups.skipped) {
      console.log(`- [${r.skip}] ${r.method} ${r.path} | ${r.name}`);
    }
  }

  const okResults = results.filter((r) => r.classification?.verdict === "ok");
  console.log(`\n=== Matched (${okResults.length}) ===`);
  for (const r of okResults) {
    console.log(`- ${r.method} ${r.path} → ${r.status}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
