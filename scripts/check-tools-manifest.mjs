#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_PATH = join(ROOT, "data", "tools.manifest.json");

function normalizeManifest(raw) {
  const parsed = JSON.parse(raw);
  delete parsed.generatedAt;
  return `${JSON.stringify(parsed, null, 2)}\n`;
}

const committedRaw = readFileSync(MANIFEST_PATH, "utf8");
const committed = normalizeManifest(committedRaw);

execSync("node scripts/generate-tools-manifest.mjs", { cwd: ROOT, stdio: "pipe" });
const generatedRaw = readFileSync(MANIFEST_PATH, "utf8");
const generated = normalizeManifest(generatedRaw);

writeFileSync(MANIFEST_PATH, committedRaw, "utf8");

if (generated !== committed) {
  console.error("data/tools.manifest.json is out of date. Run: npm run generate-tools-manifest");
  process.exit(1);
}

console.log("OK: tools.manifest.json matches generated output");
