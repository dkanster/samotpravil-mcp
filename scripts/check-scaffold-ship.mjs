#!/usr/bin/env node
/**
 * When proposed upstream endpoints appear in snapshot, verify scaffolds exist
 * and typed tools are registered in sdkTyped.ts.
 *
 * Usage:
 *   npm run check-scaffold-ship
 *   node scripts/check-scaffold-ship.mjs --warn-only   # exit 0 with warnings
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const warnOnly = process.argv.includes("--warn-only");

if (!existsSync(join(ROOT, "dist/tools/sdkTyped.js"))) {
  console.error("Run npm run build before check-scaffold-ship");
  process.exit(1);
}

const report = JSON.parse(
  execSync("node scripts/check-upstream-wishlist.mjs --json", { cwd: ROOT, encoding: "utf8" }),
);
const { SDK_TYPED_API_PATHS } = await import(join(ROOT, "dist/tools/sdkTyped.js"));
const sdkPaths = new Set(SDK_TYPED_API_PATHS);

const shipped = report.items.filter((row) => row.trackingStatus === "shipped");
const actions = [];

for (const row of shipped) {
  const stubPath = join(ROOT, "scaffolds", `${row.id}.ts.stub`);
  const hasStub = existsSync(stubPath);
  const inSdk = sdkPaths.has(row.path);

  if (!hasStub) {
    actions.push({
      id: row.id,
      path: row.path,
      issue: "missing scaffold",
      fix: `npm run scaffold-typed-tool -- ${row.id} --write`,
    });
  } else if (!inSdk) {
    actions.push({
      id: row.id,
      path: row.path,
      issue: "scaffold not shipped to sdkTyped.ts",
      fix: `copy scaffolds/${row.id}.ts.stub → src/tools/sdkTyped.ts, register tool, bump SDK_TYPED_TOOL_COUNT`,
    });
  }
}

if (shipped.length === 0) {
  console.log("OK: no proposed upstream endpoints in snapshot yet");
  process.exit(0);
}

console.log(`Shipped in snapshot: ${shipped.length}`);
for (const row of shipped) {
  const stub = existsSync(join(ROOT, "scaffolds", `${row.id}.ts.stub`)) ? "stub" : "no-stub";
  const sdk = sdkPaths.has(row.path) ? "sdkTyped" : "not-in-sdk";
  console.log(`  ${row.id}: ${row.method} ${row.path} [${stub}, ${sdk}]`);
}

if (actions.length === 0) {
  console.log("OK: shipped endpoints have scaffolds and sdkTyped registration");
  process.exit(0);
}

console.error("\nACTION required before v1.9 typed-tool criterion:");
for (const action of actions) {
  console.error(`  ${action.id} (${action.path}): ${action.issue}`);
  console.error(`    → ${action.fix}`);
}
console.error("\nSee scaffolds/README.md and docs/RELEASE_v1.9.0.md");

if (warnOnly) {
  process.exit(0);
}
process.exit(1);
