#!/usr/bin/env node
/**
 * Export OpenAPI 3.0 from bundled Postman snapshot.
 * Usage: npm run export-openapi
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildOpenApiFromSnapshot } from "./lib/openapi-from-snapshot.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SNAPSHOT = join(ROOT, "data", "collection.snapshot.json");
const OUTPUT = join(ROOT, "data", "openapi.yaml");

const collection = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
const { yaml, operationCount, tagCount } = buildOpenApiFromSnapshot(SNAPSHOT, collection, {
  fullDescriptions: false,
});

writeFileSync(OUTPUT, yaml, "utf8");
console.log(`Wrote ${OUTPUT} (${operationCount} operations, ${tagCount} Postman folders)`);
