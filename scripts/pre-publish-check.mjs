#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

const pkg = readJson(join(ROOT, "package.json"));
const server = readJson(join(ROOT, "server.json"));
const version = pkg.version;

let failed = false;
function fail(message) {
  console.error(`ERROR: ${message}`);
  failed = true;
}

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  fail(`package.json version must be semver x.y.z, got ${version}`);
}

if (server.version !== version) {
  fail(`server.json version ${server.version} !== package.json ${version}`);
}

if (server.packages?.[0]?.version !== version) {
  fail(`server.json packages[0].version !== package.json ${version}`);
}

const changelog = readFileSync(join(ROOT, "CHANGELOG.md"), "utf8");
if (!changelog.includes(`## [${version}]`)) {
  fail(`CHANGELOG.md missing section ## [${version}]`);
}

const releasePleasePath = join(ROOT, ".github", ".release-please-manifest.json");
if (existsSync(releasePleasePath)) {
  const manifest = readJson(releasePleasePath);
  if (manifest["."] !== version) {
    fail(`.release-please-manifest.json version ${manifest["."]} !== package.json ${version}`);
  }
}

const manifestPath = join(ROOT, "data", "tools.manifest.json");
if (existsSync(manifestPath)) {
  const toolsManifest = readJson(manifestPath);
  if (toolsManifest.packageVersion !== version) {
    fail(`tools.manifest.json packageVersion ${toolsManifest.packageVersion} !== ${version}`);
  }
}

if (pkg.name !== "samotpravil-mcp") {
  fail(`Unexpected package name ${pkg.name} (interim publish expects samotpravil-mcp)`);
}

if (failed) {
  console.error("\nFix version alignment: npm run sync-versions");
  console.error("Update CHANGELOG before tagging.");
  process.exit(1);
}

console.log(`OK: pre-publish checks for v${version}`);
