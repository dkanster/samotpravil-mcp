#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDocumentation } from "../dist/docs.js";
import { endpointApiPath, isSamotpravilApiEndpoint, MANUAL_API_PATHS } from "../dist/endpointMeta.js";
import {
  classifyTool,
  groupCounts,
  resolveToolRoute,
} from "./lib/tool-groups.mjs";
import { packageVersion } from "./lib/mcp-test-client.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_PATH = join(ROOT, "data", "tools.manifest.json");
const OUT_PATH = join(ROOT, "data", "tool-catalog.json");

process.env.SAMOTPRAVIL_DOCS_MODE = "snapshot";

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
const { endpoints } = await loadDocumentation();

const snapshotPaths = endpoints
  .filter(isSamotpravilApiEndpoint)
  .map((endpoint) => ({
    method: endpoint.method.toUpperCase(),
    path: endpointApiPath(endpoint.url),
    name: endpoint.name,
  }));

const catalogTools = manifest.tools.map((tool) => {
  const group = classifyTool(tool.name);
  const route = resolveToolRoute(tool.name, tool.description ?? "");
  return {
    name: tool.name,
    group,
    method: route?.method ?? null,
    path: route?.path ?? null,
    description: tool.description,
    annotations: tool.annotations,
  };
});

const coveredPathKeys = new Set();
for (const tool of catalogTools) {
  if (tool.method && tool.path) {
    coveredPathKeys.add(`${tool.method} ${normalizePath(tool.path)}`);
  }
}

const uncoveredSnapshot = snapshotPaths.filter((entry) => {
  const key = `${entry.method} ${normalizePath(entry.path)}`;
  if (MANUAL_API_PATHS.has(entry.path)) return false;
  return !catalogTools.some(
    (tool) =>
      tool.group === "auto" &&
      tool.method === entry.method &&
      pathsMatch(tool.path, entry.path),
  );
});

function normalizePath(path) {
  return path.toLowerCase().replace(/\/$/, "");
}

function pathsMatch(toolPath, snapshotPath) {
  if (!toolPath) return false;
  const a = normalizePath(toolPath);
  const b = normalizePath(snapshotPath);
  if (a === b) return true;
  const toolPattern = a.replace(/\{[^}]+\}/g, ":param");
  const snapPattern = b.replace(/:[^/]+/g, ":param");
  return toolPattern === snapPattern;
}

const catalog = {
  generatedAt: new Date().toISOString(),
  packageVersion: packageVersion(),
  toolCount: catalogTools.length,
  groups: groupCounts(catalogTools),
  tools: catalogTools,
  snapshot: {
    apiEndpointCount: snapshotPaths.length,
    uncoveredAutoCandidates: uncoveredSnapshot.map((entry) => ({
      method: entry.method,
      path: entry.path,
      name: entry.name,
    })),
  },
};

writeFileSync(OUT_PATH, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
console.log(`Wrote ${OUT_PATH} (${catalog.toolCount} tools, ${catalog.groups.auto ?? 0} auto)`);
