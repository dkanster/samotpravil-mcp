#!/usr/bin/env node
/**
 * Export OpenAPI 3.0 from bundled Postman snapshot.
 * Usage: npm run export-openapi
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCollection } from "../dist/docs.js";
import {
  bodyFieldsFromExample,
  endpointApiPath,
  isSamotpravilApiEndpoint,
  queryParamsFromUrl,
} from "../dist/endpointMeta.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SNAPSHOT = join(ROOT, "data", "collection.snapshot.json");
const OUTPUT = join(ROOT, "data", "openapi.yaml");

function yamlQuote(value) {
  if (/[:#{}[\],&*?]|^\s|\s$/.test(value)) return JSON.stringify(value);
  return value;
}

function schemaFromFields(fields) {
  if (fields.length === 0) {
    return { type: "object", additionalProperties: true };
  }
  const properties = Object.fromEntries(fields.map((field) => [field, { type: "string" }]));
  return { type: "object", properties };
}

const collection = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
const { endpoints } = parseCollection(collection, "snapshot");
const apiEndpoints = endpoints.filter(isSamotpravilApiEndpoint);

/** Folder names in Postman walk order (only folders with HTTP API ops). */
const tagOrder = [];
for (const endpoint of apiEndpoints) {
  if (!tagOrder.includes(endpoint.category)) {
    tagOrder.push(endpoint.category);
  }
}

/** path → method → operation, built in Postman order. */
const paths = new Map();

for (const endpoint of apiEndpoints) {
  const pathKey = endpointApiPath(endpoint.url);
  const method = endpoint.method.toLowerCase();
  if (!paths.has(pathKey)) {
    paths.set(pathKey, new Map());
  }

  const queryKeys = Object.keys(queryParamsFromUrl(endpoint.url));
  const bodyKeys = bodyFieldsFromExample(endpoint.bodyExample);

  const operation = {
    summary: endpoint.name,
    description: endpoint.description?.slice(0, 500) || endpoint.name,
    tags: [endpoint.category],
    parameters: queryKeys.map((name) => ({
      name,
      in: "query",
      schema: { type: "string" },
    })),
    responses: {
      "200": { description: "Successful response" },
    },
  };

  if (["post", "put", "patch"].includes(method) && bodyKeys.length > 0) {
    operation.requestBody = {
      required: false,
      content: {
        "application/json": {
          schema: schemaFromFields(bodyKeys),
        },
      },
    };
  }

  paths.get(pathKey).set(method, operation);
}

/** Emit paths in Postman endpoint order (stable within each folder). */
const pathOrder = [];
for (const endpoint of apiEndpoints) {
  const pathKey = endpointApiPath(endpoint.url);
  if (!pathOrder.includes(pathKey)) {
    pathOrder.push(pathKey);
  }
}

const lines = [
  "openapi: 3.0.3",
  "info:",
  "  title: Samotpravil API",
  "  description: |",
  "    HTTP API сервиса [СамОтправил](https://samotpravil.ru).",
  "    Сгенерировано из Postman snapshot (samotpravil-mcp).",
  "    Официальная документация: https://documentation.samotpravil.ru/",
  "  version: 1.0.0",
  "  contact:",
  "    name: Samotpravil",
  "    url: https://documentation.samotpravil.ru/",
  "servers:",
  "  - url: https://api.samotpravil.ru",
  "    description: Production API",
  "tags:",
  ...tagOrder.map((tag) => `  - name: ${yamlQuote(tag)}`),
  "components:",
  "  securitySchemes:",
  "    ApiKeyAuth:",
  "      type: apiKey",
  "      in: header",
  "      name: Authorization",
  "security:",
  "  - ApiKeyAuth: []",
  "paths:",
];

for (const pathKey of pathOrder) {
  const methods = paths.get(pathKey);
  if (!methods) continue;

  lines.push(`  ${yamlQuote(pathKey)}:`);
  for (const [method, operation] of methods) {
    lines.push(`    ${method}:`);
    lines.push("      tags:");
    for (const tag of operation.tags) {
      lines.push(`        - ${yamlQuote(tag)}`);
    }
    lines.push(`      summary: ${yamlQuote(operation.summary)}`);
    if (operation.description) {
      lines.push(`      description: ${yamlQuote(operation.description)}`);
    }
    if (operation.parameters.length) {
      lines.push("      parameters:");
      for (const param of operation.parameters) {
        lines.push(`        - name: ${param.name}`);
        lines.push("          in: query");
        lines.push("          schema:");
        lines.push("            type: string");
      }
    }
    if (operation.requestBody) {
      lines.push("      requestBody:");
      lines.push("        content:");
      lines.push("          application/json:");
      lines.push("            schema:");
      lines.push("              type: object");
    }
    lines.push("      responses:");
    lines.push('        "200":');
    lines.push("          description: Successful response");
  }
}

writeFileSync(OUTPUT, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote ${OUTPUT} (${apiEndpoints.length} operations, ${tagOrder.length} Postman folders)`);
