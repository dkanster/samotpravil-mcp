#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDocumentation } from "../dist/docs.js";
import { endpointApiPath, isSamotpravilApiEndpoint } from "../dist/endpointMeta.js";
import { SDK_TYPED_API_PATHS, SDK_TYPED_TOOL_COUNT } from "../dist/tools/sdkTyped.js";
import { SDK_TOOL_PATHS } from "./lib/tool-groups.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

process.env.SAMOTPRAVIL_DOCS_MODE = "snapshot";

const { endpoints } = await loadDocumentation();
const snapshotPaths = new Set(
  endpoints
    .filter(isSamotpravilApiEndpoint)
    .map((endpoint) => endpointApiPath(endpoint.url)),
);

let failed = false;
function fail(message) {
  console.error(message);
  failed = true;
}

if (Object.keys(SDK_TOOL_PATHS).length !== SDK_TYPED_TOOL_COUNT) {
  fail(`SDK_TOOL_PATHS count ${Object.keys(SDK_TOOL_PATHS).length} !== SDK_TYPED_TOOL_COUNT ${SDK_TYPED_TOOL_COUNT}`);
}

for (const path of SDK_TYPED_API_PATHS) {
  if (!snapshotPaths.has(path)) {
    fail(`SDK_TYPED_API_PATHS entry missing in snapshot: ${path}`);
  }
}

for (const [name, route] of Object.entries(SDK_TOOL_PATHS)) {
  if (!sdkPathMatches(route.path)) {
    fail(`SDK_TOOL_PATHS[${name}] path ${route.path} not covered by SDK_TYPED_API_PATHS`);
  }
}

function sdkPathMatches(path) {
  return SDK_TYPED_API_PATHS.some(
    (sdkPath) => path === sdkPath || path.startsWith(`${sdkPath}/`) || sdkPath.startsWith(`${path}/`),
  );
}

const wishlist = JSON.parse(readFileSync(join(ROOT, "data", "upstream-wishlist.json"), "utf8"));
for (const item of wishlist.items) {
  if (item.status === "stabilize" && snapshotPaths.has(item.path)) {
    continue;
  }
  if (item.status === "proposed" && !snapshotPaths.has(item.path)) {
    continue;
  }
}

if (failed) {
  process.exit(1);
}

console.log(`OK: SDK parity — ${SDK_TYPED_TOOL_COUNT} tools, ${SDK_TYPED_API_PATHS.length} paths aligned with snapshot`);
