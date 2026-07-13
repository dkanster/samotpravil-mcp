#!/usr/bin/env node
/**
 * Verify promo materials reference the current package version.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const version = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;

const files = [
  {
    path: "docs/official/MCP_INSTALL_BLOCK.html",
    patterns: [`${version}+`, version],
  },
  {
    path: "docs/official/get-access-snippet.md",
    patterns: ["58 typed tools", "samotpravil-mcp@latest"],
  },
  {
    path: "docs/official/blog-draft.md",
    patterns: ["58 MCP tools", "9 resources", "1.8.0"],
  },
];

let failed = false;

for (const file of files) {
  const text = readFileSync(join(ROOT, file.path), "utf8");
  const ok = file.patterns.some((pattern) => text.includes(pattern));
  if (!ok) {
    console.error(`ERROR: ${file.path} missing expected promo markers for v${version}`);
    console.error(`  Expected one of: ${file.patterns.join(", ")}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(`OK: promo materials aligned with v${version}`);
