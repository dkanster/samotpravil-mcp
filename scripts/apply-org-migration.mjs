#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "node:fs";
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

const apply = process.argv.includes("--write");
const dryRun = !apply;

let totalHits = 0;
const changedFiles = [];

for (const relativePath of replaceInFiles) {
  const path = join(ROOT, relativePath);
  if (!existsSync(path)) continue;

  let text = readFileSync(path, "utf8");
  let fileHits = 0;

  for (const [from, to] of REPLACEMENTS) {
    if (!text.includes(from)) continue;
    const count = text.split(from).length - 1;
    fileHits += count;
    text = text.split(from).join(to);
  }

  if (fileHits === 0) continue;
  totalHits += fileHits;
  changedFiles.push({ relativePath, fileHits });

  if (apply) {
    writeFileSync(path, text, "utf8");
    console.log(`WROTE ${relativePath} (${fileHits} replacements)`);
  } else {
    console.log(`WOULD UPDATE ${relativePath} (${fileHits} replacements)`);
  }
}

if (totalHits === 0) {
  console.log("No interim strings found — already migrated or nothing to replace.");
  process.exit(0);
}

console.log(`\n${dryRun ? "Dry-run" : "Applied"}: ${totalHits} replacements in ${changedFiles.length} files`);

if (dryRun) {
  console.log("\nTo apply after GitHub/npm transfer:");
  console.log("  node scripts/apply-org-migration.mjs --write");
  console.log("  npm run sync-versions && npm test && npm run pre-publish-check");
  process.exit(0);
}

console.log("\nNext:");
console.log("  npm run sync-versions");
console.log("  npm run check-org-migration -- --target");
console.log("  npm test");
