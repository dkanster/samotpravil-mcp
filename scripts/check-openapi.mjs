#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OPENAPI_PATH = join(ROOT, "data", "openapi.yaml");
const committed = readFileSync(OPENAPI_PATH, "utf8");

execSync("node scripts/export-openapi.mjs", { cwd: ROOT, stdio: "pipe" });
const generated = readFileSync(OPENAPI_PATH, "utf8");
writeFileSync(OPENAPI_PATH, committed, "utf8");

if (generated !== committed) {
  console.error("data/openapi.yaml is out of date. Run: npm run export-openapi");
  process.exit(1);
}

console.log("OK: openapi.yaml matches generated output");
