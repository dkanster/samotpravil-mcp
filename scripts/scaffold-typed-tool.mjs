#!/usr/bin/env node
/**
 * Print a typed-tool scaffold from tool-catalog, upstream wishlist id, or API path.
 *
 * Usage:
 *   node scripts/scaffold-typed-tool.mjs send_package
 *   node scripts/scaffold-typed-tool.mjs v2_mail_package
 *   node scripts/scaffold-typed-tool.mjs --path POST /api/v2/mail/package
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pathParamsFromTemplate, toPascal, zodTypeForValue } from "./lib/scaffold-fields.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

let toolName;
let methodOverride;
let pathOverride;

if (args[0] === "--path") {
  methodOverride = args[1]?.toUpperCase();
  pathOverride = args[2];
  toolName = pathOverride
    ?.replace(/^\/api\//, "")
    .replace(/\{[^}]+\}/g, "id")
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
} else {
  toolName = args[0];
}

if (!toolName) {
  console.error("Usage: node scripts/scaffold-typed-tool.mjs <tool_name|wishlist_id>");
  console.error("       node scripts/scaffold-typed-tool.mjs --path POST /api/v2/mail/package");
  process.exit(1);
}

if (!existsSync(join(ROOT, "dist/docs.js"))) {
  console.error("Run npm run build before scaffolding (imports dist/docs.js).");
  process.exit(1);
}

const catalog = JSON.parse(readFileSync(join(ROOT, "data", "tool-catalog.json"), "utf8"));
const wishlist = JSON.parse(readFileSync(join(ROOT, "data", "upstream-wishlist.json"), "utf8"));

let tool = catalog.tools.find((entry) => entry.name === toolName);
let wishlistItem = wishlist.items.find((item) => item.id === toolName);

if (!tool && wishlistItem) {
  toolName = wishlistItem.id.replace(/^v2_/, "").replace(/_/g, "_");
  tool = {
    name: wishlistItem.id,
    method: wishlistItem.method,
    path: wishlistItem.path,
    group: "upstream",
    replaces: wishlistItem.replaces,
  };
}

if (!tool && methodOverride && pathOverride) {
  tool = { name: toolName, method: methodOverride, path: pathOverride, group: "custom" };
}

if (!tool) {
  console.error(`Tool not found in catalog or wishlist: ${args[0] ?? toolName}`);
  process.exit(1);
}

if (!tool.method || !tool.path) {
  console.error(`Tool ${tool.name} has no method/path`);
  process.exit(1);
}

process.env.SAMOTPRAVIL_DOCS_MODE = "snapshot";
const { loadDocumentation } = await import("../dist/docs.js");
const {
  bodyFieldsFromExample,
  endpointApiPath,
  parseJsonLoose,
  queryParamsFromUrl,
} = await import("../dist/endpointMeta.js");

const { endpoints } = await loadDocumentation();
const endpoint = endpoints.find(
  (entry) =>
    entry.method.toUpperCase() === tool.method.toUpperCase() &&
    endpointApiPath(entry.url) === tool.path,
);

const schemaName = `${toPascal(tool.name)}Schema`;
const handlerName = `handle${toPascal(tool.name)}`;
const pathParams = pathParamsFromTemplate(tool.path);
const queryExamples = endpoint ? queryParamsFromUrl(endpoint.url) : {};
const bodyFields = endpoint ? bodyFieldsFromExample(endpoint.bodyExample) : [];
let bodyExample = {};

if (endpoint?.bodyExample) {
  try {
    bodyExample = parseJsonLoose(endpoint.bodyExample);
    if (typeof bodyExample !== "object" || bodyExample === null || Array.isArray(bodyExample)) {
      bodyExample = {};
    }
  } catch {
    bodyExample = {};
  }
}

const schemaLines = [];

for (const param of pathParams) {
  schemaLines.push(`  ${param}: z.string().min(1).describe("Path: ${tool.path}"),`);
}

for (const [key, example] of Object.entries(queryExamples)) {
  schemaLines.push(`  ${key}: z.string().optional().describe("Query (пример: ${example})"),`);
}

for (const key of bodyFields) {
  const example = bodyExample[key];
  const zodType = zodTypeForValue(example);
  const optional = example === undefined ? ".optional()" : "";
  const desc =
    example !== undefined
      ? `.describe(${JSON.stringify(`Пример: ${JSON.stringify(example)}`)})`
      : "";
  schemaLines.push(`  ${key}: ${zodType}${optional}${desc},`);
}

if (schemaLines.length === 0) {
  schemaLines.push("  // TODO: add Zod fields from Postman body/query example");
}

const resolvedPath =
  pathParams.length > 0
    ? tool.path.replace(/\{([^}]+)\}/g, (_, key) => `\${params.${key}}`)
    : tool.path;

const usesQuery = Object.keys(queryExamples).length > 0 || tool.method === "GET";
const usesBody = bodyFields.length > 0 || (["POST", "PUT", "PATCH"].includes(tool.method) && !usesQuery);

console.log(`// Scaffold for ${tool.name} (${tool.group})`);
if (tool.replaces) console.log(`// Replaces: ${tool.replaces}`);
if (endpoint) console.log(`// Snapshot: ${endpoint.name}`);
if (!endpoint) console.log("// Snapshot: not found — fields are placeholders");

console.log(`export const ${schemaName} = dryRunSchema.extend({`);
for (const line of schemaLines) console.log(line);
console.log(`});`);
console.log("");
console.log(`export async function ${handlerName}(params: z.infer<typeof ${schemaName}>): Promise<string> {`);
console.log(`  const { dry_run${pathParams.length ? `, ${pathParams.join(", ")}` : ""}, ...rest } = params;`);

if (usesQuery && usesBody) {
  console.log(`  const queryKeys = new Set(${JSON.stringify(Object.keys(queryExamples))});`);
  console.log(`  const query: Record<string, string> = {};`);
  console.log(`  const body: Record<string, unknown> = {};`);
  console.log(`  for (const [key, value] of Object.entries(rest)) {`);
  console.log(`    if (value === undefined || value === null || value === "") continue;`);
  console.log(`    if (queryKeys.has(key)) query[key] = String(value);`);
  console.log(`    else body[key] = value;`);
  console.log(`  }`);
} else if (usesQuery) {
  console.log(`  const query = Object.fromEntries(`);
  console.log(`    Object.entries(rest).filter(([, v]) => v !== undefined && v !== ""),`);
  console.log(`  ) as Record<string, string>;`);
} else if (usesBody) {
  console.log(`  const body = rest;`);
}

const pathExpr = pathParams.length > 0 ? `\`${resolvedPath}\`` : `"${tool.path}"`;

console.log(`  return samotpravilRequest({`);
console.log(`    method: "${tool.method}",`);
console.log(`    path: ${pathExpr},`);
if (usesQuery) console.log(`    query,`);
if (usesBody) console.log(`    body,`);
console.log(`    dryRun: dry_run,`);
console.log(`  });`);
console.log(`}`);
console.log("");
console.log(`// Register in src/registerSdkTypedTools.ts`);
console.log(`// Add "${tool.path}" to SDK_TYPED_API_PATHS / safety.ts if needed`);
