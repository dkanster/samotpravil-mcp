#!/usr/bin/env node
/**
 * Verify Docusaurus build includes Scalar API reference page assets.
 * Run after docusaurus:build (see check-docusaurus.mjs).
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BUILD = join(ROOT, "docusaurus", "build");

const required = [
  join(BUILD, "index.html"),
  join(BUILD, "reference", "index.html"),
  join(BUILD, "openapi.yaml"),
];

let failed = false;

for (const path of required) {
  if (!existsSync(path)) {
    console.error(`ERROR: missing ${path.replace(ROOT + "/", "")}`);
    failed = true;
  }
}

if (!failed) {
  const referenceHtml = readFileSync(join(BUILD, "reference", "index.html"), "utf8");
  if (!referenceHtml.includes("API Reference") && !referenceHtml.includes("reference")) {
    console.error("ERROR: reference/index.html looks empty or misconfigured");
    failed = true;
  }

  const pkg = JSON.parse(
    readFileSync(join(ROOT, "docusaurus", "package.json"), "utf8"),
  );
  const scalarVersion = pkg.dependencies?.["@scalar/api-reference-react"] ?? "";
  if (!scalarVersion.includes("0.9")) {
    console.warn(`WARN: @scalar/api-reference-react is ${scalarVersion} (expected 0.9.x for v1.9)`);
  }
}

if (failed) {
  process.exit(1);
}

console.log("OK: Scalar reference page artifacts (reference/, openapi.yaml)");
