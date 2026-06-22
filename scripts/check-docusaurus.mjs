#!/usr/bin/env node
/**
 * CI check: generate content and build Docusaurus (GitHub Pages config).
 */
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BUILD = join(ROOT, "docusaurus", "build", "index.html");

execSync("npm run docusaurus:generate", { cwd: ROOT, stdio: "inherit" });

execSync("npm run build --prefix docusaurus", {
  cwd: ROOT,
  stdio: "inherit",
  env: {
    ...process.env,
    DOCUSAURUS_URL: "https://dkanster.github.io",
    DOCUSAURUS_BASE_URL: "/samotpravil-mcp/",
  },
});

if (!existsSync(BUILD)) {
  console.error("Docusaurus build failed: index.html not found");
  process.exit(1);
}

console.log("OK: Docusaurus build");
