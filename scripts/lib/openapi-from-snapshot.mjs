/**
 * Shared OpenAPI 3.0 export from Postman snapshot.
 * Used by export-openapi.mjs and build-docs-site.mjs.
 */
import { parseCollection } from "../../dist/docs.js";
import {
  bodyFieldsFromExample,
  endpointApiPath,
  isSamotpravilApiEndpoint,
  queryParamsFromUrl,
} from "../../dist/endpointMeta.js";

export function yamlQuote(value) {
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

function yamlDescription(text, indent = "      ") {
  if (!text) return `${indent}description: ""`;
  const cleaned = text.replace(/\r\n/g, "\n").trim().slice(0, 8000);
  if (cleaned.length <= 100 && !/[:#\n"'&]/.test(cleaned)) {
    return `${indent}description: ${yamlQuote(cleaned)}`;
  }
  const lines = cleaned.split("\n").map((line) => `${indent}  ${line}`);
  return `${indent}description: |\n${lines.join("\n")}`;
}

/**
 * @param {import("node:fs").PathLike} snapshotPath
 * @param {{ fullDescriptions?: boolean; officialDocsUrl?: string }} options
 */
export function buildOpenApiFromSnapshot(snapshotPath, collectionJson, options = {}) {
  const { fullDescriptions = false, officialDocsUrl = "https://documentation.samotpravil.ru/" } = options;
  const { endpoints, overview } = parseCollection(collectionJson, "snapshot");
  const apiEndpoints = endpoints.filter(isSamotpravilApiEndpoint);

  const tagOrder = [];
  for (const endpoint of apiEndpoints) {
    if (!tagOrder.includes(endpoint.category)) tagOrder.push(endpoint.category);
  }

  const paths = new Map();
  for (const endpoint of apiEndpoints) {
    const pathKey = endpointApiPath(endpoint.url);
    const method = endpoint.method.toLowerCase();
    if (!paths.has(pathKey)) paths.set(pathKey, new Map());

    const queryKeys = Object.keys(queryParamsFromUrl(endpoint.url));
    const bodyKeys = bodyFieldsFromExample(endpoint.bodyExample);
    const description = fullDescriptions
      ? endpoint.description || endpoint.name
      : (endpoint.description?.slice(0, 500) || endpoint.name);

    const operation = {
      summary: endpoint.name,
      description,
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

  const pathOrder = [];
  for (const endpoint of apiEndpoints) {
    const pathKey = endpointApiPath(endpoint.url);
    if (!pathOrder.includes(pathKey)) pathOrder.push(pathKey);
  }

  const infoDescription = fullDescriptions
    ? `${overview.description.slice(0, 2000)}\n\nСгенерировано из Postman snapshot (samotpravil-mcp docs site).`
    : `HTTP API сервиса [СамОтправил](https://samotpravil.ru).\nСгенерировано из Postman snapshot (samotpravil-mcp).\nОфициальная документация: ${officialDocsUrl}`;

  const infoLines = infoDescription.split("\n").map((line) => `    ${line}`);

  const lines = [
    "openapi: 3.0.3",
    "info:",
    "  title: Samotpravil API",
    "  description: |",
    ...infoLines,
    "  version: 1.0.0",
    "  contact:",
    "    name: Samotpravil",
    `    url: ${officialDocsUrl}`,
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
      lines.push(yamlDescription(operation.description));
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

  return {
    yaml: `${lines.join("\n")}\n`,
    operationCount: apiEndpoints.length,
    tagCount: tagOrder.length,
    overview,
  };
}
