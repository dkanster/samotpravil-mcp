#!/usr/bin/env node
/**
 * Print a typed-tool scaffold from tool-catalog entry.
 * Usage: node scripts/scaffold-typed-tool.mjs send_package
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const name = process.argv[2];

if (!name) {
  console.error("Usage: node scripts/scaffold-typed-tool.mjs <tool_name>");
  process.exit(1);
}

const catalog = JSON.parse(readFileSync(join(ROOT, "data", "tool-catalog.json"), "utf8"));
const tool = catalog.tools.find((entry) => entry.name === name);

if (!tool) {
  console.error(`Tool not found in catalog: ${name}`);
  process.exit(1);
}

if (!tool.method || !tool.path) {
  console.error(`Tool ${name} has no method/path in catalog`);
  process.exit(1);
}

const schemaName = `${toPascal(name)}Schema`;
const handlerName = `handle${toPascal(name)}`;

console.log(`// Scaffold for ${name} (${tool.group})`);
console.log(`export const ${schemaName} = dryRunSchema.extend({`);
console.log(`  // TODO: add Zod fields from Postman body/query example`);
console.log(`});`);
console.log("");
console.log(`export async function ${handlerName}(params: z.infer<typeof ${schemaName}>): Promise<string> {`);
console.log(`  const { dry_run, ...rest } = params;`);
console.log(`  return samotpravilRequest({`);
console.log(`    method: "${tool.method}",`);
console.log(`    path: "${tool.path}",`);
console.log(`    // query/body from rest`);
console.log(`    dryRun: dry_run,`);
console.log(`  });`);
console.log(`}`);
console.log("");
console.log(`// Register in src/registerSdkTypedTools.ts or src/index.ts`);
console.log(`// Add path to src/safety.ts if send/mutation`);

function toPascal(value) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
