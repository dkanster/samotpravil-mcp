#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const smitheryPath = join(ROOT, "smithery.yaml");
const content = readFileSync(smitheryPath, "utf8");

const requiredMarkers = [
  "startCommand:",
  "type: stdio",
  "configSchema:",
  "commandFunction:",
  "exampleConfig:",
  "samotpravil-mcp@latest",
  "SAMOTPRAVIL_API_KEY",
];

for (const marker of requiredMarkers) {
  if (!content.includes(marker)) {
    throw new Error(`smithery.yaml missing required marker: ${marker}`);
  }
}

if (!content.includes("npx")) {
  throw new Error("smithery.yaml commandFunction should use npx");
}
