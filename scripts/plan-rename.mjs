#!/usr/bin/env node
/**
 * Dry-run plan for samotpravil-api-mcp rename (PR #64 alternative).
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TARGETS_PATH = join(ROOT, "data", "org-migration.targets.json");
const { interim, renameAlternative, replaceInFiles } = JSON.parse(readFileSync(TARGETS_PATH, "utf8"));

if (!renameAlternative) {
  console.error("renameAlternative not configured in org-migration.targets.json");
  process.exit(1);
}

const REPLACEMENTS = [
  [interim.githubUrl, renameAlternative.githubUrl],
  [interim.githubRepo, renameAlternative.githubRepo],
  [interim.mcpRegistryName, renameAlternative.mcpRegistryName],
  [`github.com/${interim.githubOwner}/samotpravil-mcp`, `github.com/${interim.githubOwner}/samotpravil-api-mcp`],
  [`io.github.${interim.githubOwner}/samotpravil-mcp`, renameAlternative.mcpRegistryName],
  ["/samotpravil-mcp/", renameAlternative.docusaurusBaseUrl],
];

const rows = [];

for (const relativePath of replaceInFiles) {
  const path = join(ROOT, relativePath);
  if (!existsSync(path)) continue;
  const text = readFileSync(path, "utf8");
  for (const [from, to] of REPLACEMENTS) {
    if (!text.includes(from)) continue;
    const count = text.split(from).length - 1;
    rows.push({ file: relativePath, from, to, count });
  }
}

console.log("# Rename plan: samotpravil-mcp → samotpravil-api-mcp (PR #64)\n");
console.log(`npm package unchanged: ${renameAlternative.npmPackage}`);
console.log(`See: ${renameAlternative.doc}\n`);

if (rows.length === 0) {
  console.log("No interim strings found (rename may already be applied).");
  process.exit(0);
}

for (const row of rows) {
  console.log(`${row.file}: ${row.count}× ${row.from} → ${row.to}`);
}

console.log(`\nTotal: ${rows.reduce((n, r) => n + r.count, 0)} replacements`);
console.log("\nConflicts with org target samotpravil/samotpravil-mcp — choose one strategy.");
