#!/usr/bin/env node
/**
 * Clone and build Vizioz/Swagger-MCP into vendor/swagger-mcp (once).
 * Usage: npm run prepare-swagger-mcp
 */
import { existsSync, copyFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const VENDOR = join(ROOT, "vendor", "swagger-mcp");
const BUILD_ENTRY = join(VENDOR, "build", "index.js");
const REPO = "https://github.com/Vizioz/Swagger-MCP.git";

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, { stdio: "inherit", ...options });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (existsSync(BUILD_ENTRY)) {
  process.exit(0);
}

if (!existsSync(VENDOR)) {
  console.log(`Cloning ${REPO} → vendor/swagger-mcp`);
  run("git", ["clone", "--depth", "1", REPO, VENDOR]);
}

const envExample = join(VENDOR, ".env.example");
const envFile = join(VENDOR, ".env");
if (existsSync(envExample) && !existsSync(envFile)) {
  copyFileSync(envExample, envFile);
}

console.log("Installing Swagger-MCP dependencies…");
run("npm", ["ci"], { cwd: VENDOR });

console.log("Building Swagger-MCP…");
run("npm", ["run", "build"], { cwd: VENDOR });

if (!existsSync(BUILD_ENTRY)) {
  console.error(`Build failed: missing ${BUILD_ENTRY}`);
  process.exit(1);
}

console.log("Swagger-MCP ready:", BUILD_ENTRY);
