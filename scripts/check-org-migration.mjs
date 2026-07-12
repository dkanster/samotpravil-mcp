#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TARGETS_PATH = join(ROOT, "data", "org-migration.targets.json");
const { interim, target } = JSON.parse(readFileSync(TARGETS_PATH, "utf8"));

let failed = false;

function fail(message) {
  console.error(message);
  failed = true;
}

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const server = JSON.parse(readFileSync(join(ROOT, "server.json"), "utf8"));

if (pkg.name !== interim.npmPackage) {
  fail(`package.json name expected ${interim.npmPackage}, got ${pkg.name}`);
}

if (server.name !== interim.mcpRegistryName) {
  fail(`server.json name expected ${interim.mcpRegistryName}, got ${server.name}`);
}

if (server.packages?.[0]?.identifier !== interim.npmPackage) {
  fail(`server.json npm identifier expected ${interim.npmPackage}`);
}

const actionablePatterns = [
  `npx -y ${target.npxPackage}`,
  `"args": ["-y", "${target.npxPackage}"]`,
  `"name": "${target.npmPackage}"`,
];

const allowedTargetMentions = new Set([
  "mcp.json.example.org",
  "data/org-migration.targets.json",
  "docs/ORG_MIGRATION.md",
  "docs/ORG_MIGRATION_RUNBOOK.md",
  "docs/ROADMAP_v1.4.md",
  "docs/ROADMAP_v1.6.md",
  "docs/MIGRATION_V1_TO_V2.md",
  "docs/official/PROMO_CHECKLIST.md",
]);

for (const file of ["README.md", "package.json", "server.json", "smithery.yaml", "mcp.json.example"]) {
  const relativePath = file;
  const text = readFileSync(join(ROOT, file), "utf8");

  if (file === "README.md" || file === "smithery.yaml" || file === "mcp.json.example") {
    if (!text.includes(interim.githubRepo) && !text.includes(interim.npmPackage)) {
      fail(`${file} missing interim github/npm references`);
    }
  }

  if (allowedTargetMentions.has(relativePath)) continue;

  for (const pattern of actionablePatterns) {
    if (text.includes(pattern)) {
      fail(`${file} contains post-migration install pattern: ${pattern}`);
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log(`OK: interim org state (${interim.githubRepo}, ${interim.npmPackage})`);
