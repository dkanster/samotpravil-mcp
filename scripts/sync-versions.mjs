#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const serverPath = join(ROOT, "server.json");
const server = JSON.parse(readFileSync(serverPath, "utf8"));

let changed = false;

if (server.version !== pkg.version) {
  server.version = pkg.version;
  changed = true;
}

for (const entry of server.packages ?? []) {
  if (entry.version !== pkg.version) {
    entry.version = pkg.version;
    changed = true;
  }
}

if (!changed) {
  console.log(`OK: server.json already at v${pkg.version}`);
  process.exit(0);
}

writeFileSync(serverPath, `${JSON.stringify(server, null, 2)}\n`, "utf8");
console.log(`Updated server.json to v${pkg.version}`);
