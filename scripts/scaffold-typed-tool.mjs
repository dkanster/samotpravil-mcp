#!/usr/bin/env node
/**
 * Print a typed-tool scaffold from tool-catalog, upstream wishlist id, or API path.
 *
 * Usage:
 *   node scripts/scaffold-typed-tool.mjs send_package
 *   node scripts/scaffold-typed-tool.mjs v2_mail_package
 *   node scripts/scaffold-typed-tool.mjs --path POST /api/v2/mail/package
 *   node scripts/scaffold-typed-tool.mjs --write stop_package
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pathParamsFromTemplate, toPascal, zodTypeForValue } from "./lib/scaffold-fields.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const writeMode = args.includes("--write");
const filteredArgs = args.filter((arg) => arg !== "--write");
const arg0 = filteredArgs[0];

let toolName;
let methodOverride;
let pathOverride;

if (arg0 === "--path") {
  methodOverride = filteredArgs[1]?.toUpperCase();
  pathOverride = filteredArgs[2];
  toolName = pathOverride
    ?.replace(/^\/api\//, "")
    .replace(/\{[^}]+\}/g, "id")
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
} else {
  toolName = arg0;
}

if (!toolName) {
  console.error("Usage: node scripts/scaffold-typed-tool.mjs <tool_name|wishlist_id> [--write]");
  console.error("       node scripts/scaffold-typed-tool.mjs --path POST /api/v2/mail/package [--write]");
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
  console.error(`Tool not found in catalog or wishlist: ${arg0 ?? toolName}`);
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

const lines = [];
lines.push(`// Scaffold for ${tool.name} (${tool.group})`);
if (tool.replaces) lines.push(`// Replaces: ${tool.replaces}`);
if (endpoint) lines.push(`// Snapshot: ${endpoint.name}`);
if (!endpoint) lines.push("// Snapshot: not found — fields are placeholders");
lines.push(`export const ${schemaName} = dryRunSchema.extend({`);
lines.push(...schemaLines);
lines.push(`});`);
lines.push("");
lines.push(`export async function ${handlerName}(params: z.infer<typeof ${schemaName}>): Promise<string> {`);
lines.push(`  const { dry_run${pathParams.length ? `, ${pathParams.join(", ")}` : ""}, ...rest } = params;`);

if (usesQuery && usesBody) {
  lines.push(`  const queryKeys = new Set(${JSON.stringify(Object.keys(queryExamples))});`);
  lines.push(`  const query: Record<string, string> = {};`);
  lines.push(`  const body: Record<string, unknown> = {};`);
  lines.push(`  for (const [key, value] of Object.entries(rest)) {`);
  lines.push(`    if (value === undefined || value === null || value === "") continue;`);
  lines.push(`    if (queryKeys.has(key)) query[key] = String(value);`);
  lines.push(`    else body[key] = value;`);
  lines.push(`  }`);
} else if (usesQuery) {
  lines.push(`  const query = Object.fromEntries(`);
  lines.push(`    Object.entries(rest).filter(([, v]) => v !== undefined && v !== ""),`);
  lines.push(`  ) as Record<string, string>;`);
} else if (usesBody) {
  lines.push(`  const body = rest;`);
}

const pathExpr = pathParams.length > 0 ? `\`${resolvedPath}\`` : `"${tool.path}"`;

lines.push(`  return samotpravilRequest({`);
lines.push(`    method: "${tool.method}",`);
lines.push(`    path: ${pathExpr},`);
if (usesQuery) lines.push(`    query,`);
if (usesBody) lines.push(`    body,`);
lines.push(`    dryRun: dry_run,`);
lines.push(`  });`);
lines.push(`}`);
lines.push("");
lines.push(`// Register in src/registerSdkTypedTools.ts`);
lines.push(`// Add "${tool.path}" to SDK_TYPED_API_PATHS / safety.ts if needed`);

const output = `${lines.join("\n")}\n`;

if (writeMode) {
  const outDir = join(ROOT, "scaffolds");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `${tool.name}.ts.stub`);
  writeFileSync(outPath, output, "utf8");
  console.log(`Wrote ${outPath}`);
} else {
  process.stdout.write(output);
}
