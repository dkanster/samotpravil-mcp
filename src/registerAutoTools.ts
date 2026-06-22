import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { samotpravilRequest } from "./client.js";
import { loadDocumentation } from "./docs.js";
import {
  bodyFieldsFromExample,
  endpointApiPath,
  isSamotpravilApiEndpoint,
  MANUAL_API_PATHS,
  parseJsonLoose,
  queryParamsFromUrl,
  uniqueEndpointToolName,
} from "./endpointMeta.js";
import type { EndpointDoc } from "./types.js";

const dryRunField = z.boolean().optional().describe("Показать запрос без отправки на API");

function buildToolSchema(endpoint: EndpointDoc): z.ZodObject<z.ZodRawShape> {
  const shape: z.ZodRawShape = { dry_run: dryRunField };

  for (const [key, example] of Object.entries(queryParamsFromUrl(endpoint.url))) {
    shape[key] = z.string().optional().describe(`Query-параметр (пример: ${example})`);
  }

  const bodyFields = bodyFieldsFromExample(endpoint.bodyExample);
  if (bodyFields.length > 0 && endpoint.bodyExample) {
    try {
      const example = parseJsonLoose(endpoint.bodyExample) as Record<string, unknown>;
      for (const key of bodyFields) {
        shape[key] = z.unknown().optional().describe(`Поле тела (пример: ${JSON.stringify(example[key])})`);
      }
    } catch {
      shape.body = z.record(z.unknown()).optional().describe("JSON-тело запроса");
    }
  } else if (["POST", "PUT", "PATCH"].includes(endpoint.method.toUpperCase())) {
    shape.body = z.record(z.unknown()).optional().describe("JSON-тело запроса");
  }

  return z.object(shape);
}

function splitToolParams(
  endpoint: EndpointDoc,
  params: Record<string, unknown>,
): { query: Record<string, string>; body: Record<string, unknown> | undefined; dryRun?: boolean } {
  const { dry_run, body: bodyRecord, ...rest } = params;
  const queryKeys = new Set(Object.keys(queryParamsFromUrl(endpoint.url)));
  const bodyKeys = new Set(bodyFieldsFromExample(endpoint.bodyExample));

  const query: Record<string, string> = {};
  const body: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined || value === null || value === "") continue;
    if (queryKeys.has(key)) {
      query[key] = String(value);
    } else if (bodyKeys.has(key)) {
      body[key] = value;
    } else if (key !== "body") {
      body[key] = value;
    }
  }

  if (bodyRecord && typeof bodyRecord === "object" && !Array.isArray(bodyRecord)) {
    Object.assign(body, bodyRecord as Record<string, unknown>);
  }

  const method = endpoint.method.toUpperCase();
  const hasBody = Object.keys(body).length > 0;

  return {
    query: Object.keys(query).length > 0 ? query : {},
    body: hasBody && method !== "GET" && method !== "HEAD" ? body : undefined,
    dryRun: dry_run === true,
  };
}

export async function registerAutoTools(server: McpServer): Promise<number> {
  const { endpoints } = await loadDocumentation();
  const usedNames = new Set<string>();
  let count = 0;

  for (const endpoint of endpoints) {
    if (!isSamotpravilApiEndpoint(endpoint)) continue;

    const apiPath = endpointApiPath(endpoint.url);
    if (MANUAL_API_PATHS.has(apiPath)) continue;

    const schema = buildToolSchema(endpoint);
    const toolName = uniqueEndpointToolName(endpoint, usedNames);
    const description = `${endpoint.method} ${apiPath} — ${endpoint.name}`;

    server.tool(toolName, description, schema.shape, async (params) => {
      const { query, body, dryRun } = splitToolParams(endpoint, params as Record<string, unknown>);
      const text = await samotpravilRequest({
        method: endpoint.method,
        path: apiPath,
        query,
        body,
        dryRun,
      });
      return { content: [{ type: "text", text }] };
    });

    count += 1;
  }

  return count;
}
