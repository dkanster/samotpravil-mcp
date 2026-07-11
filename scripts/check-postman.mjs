#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { diffCollections, formatCollectionDiff } from "../dist/postman/diff.js";
import { walkCollectionRequests, requestSignature, collectionSummary } from "../dist/postman/collectionUtils.js";
import { DEFAULT_POSTMAN_COLLECTION_UID } from "../dist/postman/config.js";
import { registerPostmanTools, POSTMAN_TOOL_COUNT } from "../dist/registerPostmanTools.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const snapshot = JSON.parse(readFileSync(join(ROOT, "data/collection.snapshot.json"), "utf8"));
const rows = walkCollectionRequests(snapshot.item);
if (rows.length < 50) {
  throw new Error(`Expected >=50 requests in snapshot, got ${rows.length}`);
}

const signature = requestSignature("GET", "https://api.samotpravil.ru/api/v2/issue/status");
if (!signature.includes("/api/v2/issue/status")) {
  throw new Error("requestSignature failed");
}

const summary = collectionSummary(snapshot, DEFAULT_POSTMAN_COLLECTION_UID);
if (!summary.name || Number(summary.endpointCount) < 50) {
  throw new Error("collectionSummary failed");
}

const remote = {
  info: { name: "Remote" },
  item: [
    {
      name: "New endpoint",
      request: { method: "GET", url: "https://api.samotpravil.ru/api/v2/new/method" },
    },
    ...snapshot.item,
  ],
};

const diff = diffCollections(remote, snapshot);
if (diff.added.length !== 1 || diff.removed.length !== 0) {
  throw new Error(`diffCollections failed: added=${diff.added.length}, removed=${diff.removed.length}`);
}

const formatted = formatCollectionDiff(diff);
if (!formatted.includes("Добавлено в Postman")) {
  throw new Error("formatCollectionDiff failed");
}

delete process.env.POSTMAN_API_KEY;
const serverWithoutKey = new McpServer({ name: "test", version: "0.0.0" });
if (registerPostmanTools(serverWithoutKey) !== 0) {
  throw new Error("Expected 0 postman tools without API key");
}

process.env.POSTMAN_API_KEY = "test-key";
const serverWithKey = new McpServer({ name: "test", version: "0.0.0" });
if (registerPostmanTools(serverWithKey) !== POSTMAN_TOOL_COUNT) {
  throw new Error(`Expected ${POSTMAN_TOOL_COUNT} postman tools with API key`);
}
