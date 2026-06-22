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

function schemaFromFields(fields, required = false) {
  if (fields.length === 0) {
    return { type: "object", additionalProperties: true };
  }
  const properties = Object.fromEntries(fields.map((field) => [field, { type: "string" }]));
  return { type: "object", properties, ...(required ? {} : {}) };
}

const collection = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
const { endpoints } = parseCollection(collection, "snapshot");
const apiEndpoints = endpoints.filter(isSamotpravilApiEndpoint);

const paths = {};

for (const endpoint of apiEndpoints) {
  const pathKey = endpointApiPath(endpoint.url);
  const method = endpoint.method.toLowerCase();
  if (!paths[pathKey]) paths[pathKey] = {};

  const queryKeys = Object.keys(queryParamsFromUrl(endpoint.url));
  const bodyKeys = bodyFieldsFromExample(endpoint.bodyExample);

  const parameters = queryKeys.map((name) => ({
    name,
    in: "query",
    schema: { type: "string" },
  }));

  const operation = {
    summary: endpoint.name,
    description: endpoint.description?.slice(0, 500) || endpoint.name,
    tags: [endpoint.category.split(" / ").pop() ?? "API"],
    parameters,
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

  paths[pathKey][method] = operation;
}

const lines = [
  "openapi: 3.0.3",
  "info:",
  "  title: Samotpravil SMTP API",
  "  description: Generated from Postman snapshot (samotpravil-mcp)",
  "  version: 1.0.0",
  "  contact:",
  "    url: https://documentation.samotpravil.ru/",
  "servers:",
  "  - url: https://api.samotpravil.ru",
  "    description: Production API",
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

for (const [pathKey, methods] of Object.entries(paths).sort(([a], [b]) => a.localeCompare(b))) {
  lines.push(`  ${yamlQuote(pathKey)}:`);
  for (const [method, operation] of Object.entries(methods).sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`    ${method}:`);
    lines.push(`      summary: ${yamlQuote(operation.summary)}`);
    if (operation.description) {
      lines.push(`      description: ${yamlQuote(operation.description)}`);
    }
    if (operation.parameters?.length) {
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
console.log(`Wrote ${OUTPUT} (${apiEndpoints.length} operations)`);
