#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TARGETS_PATH = join(ROOT, "data", "org-migration.targets.json");
const { interim, target, replaceInFiles } = JSON.parse(readFileSync(TARGETS_PATH, "utf8"));

const REPLACEMENTS = [
  [interim.githubUrl, target.githubUrl],
  [interim.githubRepo, target.githubRepo],
  [interim.npmPackage, target.npmPackage],
  [interim.npmUrl, target.npmUrl],
  [interim.mcpRegistryName, target.mcpRegistryName],
  [interim.npxPackage, target.npxPackage],
  [`github.com/${interim.githubOwner}/`, `github.com/${target.githubOwner}/`],
  [`io.github.${interim.githubOwner}/`, `io.github.${target.githubOwner}/`],
];

const jsonMode = process.argv.includes("--json");
const rows = [];

for (const relativePath of replaceInFiles) {
  const path = join(ROOT, relativePath);
  if (!existsSync(path)) continue;

  const text = readFileSync(path, "utf8");
  let fileHits = 0;

  for (const [from, to] of REPLACEMENTS) {
    if (!text.includes(from)) continue;
    const count = text.split(from).length - 1;
    fileHits += count;
    rows.push({ file: relativePath, from, to, count });
  }
}

if (jsonMode) {
  console.log(JSON.stringify({ interim, target, rows, totalHits: rows.reduce((n, r) => n + r.count, 0) }, null, 2));
  process.exit(0);
}

console.log("# Org migration plan (dry-run)\n");
console.log(`Interim: ${interim.githubRepo} / ${interim.npmPackage}`);
console.log(`Target:  ${target.githubRepo} / ${target.npmPackage}\n`);

if (rows.length === 0) {
  console.log("No interim strings found in configured files.");
  process.exit(0);
}

for (const row of rows) {
  console.log(`${row.file}: ${row.count}× ${row.from} → ${row.to}`);
}

console.log(`\nTotal replacements: ${rows.reduce((n, row) => n + row.count, 0)}`);
console.log("\nRunbook: docs/ORG_MIGRATION_RUNBOOK.md");
