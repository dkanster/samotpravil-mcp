#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG_PATH = join(ROOT, "data", "tool-catalog.json");

function normalizeCatalog(raw) {
  const parsed = JSON.parse(raw);
  delete parsed.generatedAt;
  return `${JSON.stringify(parsed, null, 2)}\n`;
}

const committedRaw = readFileSync(CATALOG_PATH, "utf8");
const committed = normalizeCatalog(committedRaw);

execSync("node scripts/generate-tool-catalog.mjs", { cwd: ROOT, stdio: "pipe" });
const generatedRaw = readFileSync(CATALOG_PATH, "utf8");
const generated = normalizeCatalog(generatedRaw);

writeFileSync(CATALOG_PATH, committedRaw, "utf8");

if (generated !== committed) {
  console.error("data/tool-catalog.json is out of date. Run: npm run generate-tool-catalog");
  process.exit(1);
}

console.log("OK: tool-catalog.json matches generated output");
