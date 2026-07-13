#!/usr/bin/env node
/**
 * Verify scaffolds/ covers all proposed upstream wishlist items.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const wishlist = JSON.parse(readFileSync(join(ROOT, "data", "upstream-wishlist.json"), "utf8"));

const proposed = wishlist.items.filter((item) => item.status === "proposed");
const missing = [];

for (const item of proposed) {
  const stubPath = join(ROOT, "scaffolds", `${item.id}.ts.stub`);
  if (!existsSync(stubPath)) {
    missing.push(item.id);
  }
}

if (missing.length > 0) {
  console.error(`ERROR: missing scaffolds for: ${missing.join(", ")}`);
  console.error("Run: npm run scaffold-typed-tool -- <id> --write");
  process.exit(1);
}

console.log(`OK: scaffolds for ${proposed.length} proposed upstream endpoints`);
