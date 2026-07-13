#!/usr/bin/env node
/**
 * Maintainer status report — version, publish, org preflight summary.
 * Usage: npm run maintainer-status
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const version = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;

console.log(`# Maintainer status — samotpravil-mcp v${version}\n`);

console.log("## Release");
try {
  const out = execSync(`node scripts/verify-publish.mjs ${version}`, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  for (const line of out.trim().split("\n")) {
    if (line.startsWith("OK:")) console.log(`- ${line.slice(3).trim()}`);
  }
} catch {
  console.log(`- npm/MCP Registry: not verified (run npm run verify-publish -- ${version})`);
}

console.log("\n## Promo");
try {
  execSync("node scripts/check-promo-versions.mjs", { cwd: ROOT, stdio: "pipe" });
  console.log("- Promo materials aligned with package version");
} catch {
  console.log("- Promo materials need update (npm run check-promo-versions)");
}
console.log("- Docs issue: https://github.com/dkanster/samotpravil-mcp/issues/51");

console.log("\n## Org migration");
try {
  execSync("node scripts/check-org-migration.mjs", { cwd: ROOT, stdio: "pipe" });
  console.log("- Interim org state OK");
} catch {
  console.log("- Org migration check failed");
}
const plan = execSync("node scripts/apply-org-migration.mjs", { cwd: ROOT, encoding: "utf8" });
const totalMatch = plan.match(/(\d+) replacements in (\d+) files/);
if (totalMatch) {
  console.log(`- Apply dry-run: ${totalMatch[1]} replacements in ${totalMatch[2]} files`);
}

console.log("\n## Upstream");
try {
  execSync("node scripts/check-scaffolds.mjs", { cwd: ROOT, stdio: "pipe" });
  console.log("- Wishlist scaffolds present");
} catch {
  console.log("- Missing wishlist scaffolds");
}
try {
  execSync("node scripts/check-scaffold-ship.mjs", { cwd: ROOT, stdio: "pipe" });
  console.log("- Scaffold ship readiness OK");
} catch {
  console.log("- Shipped endpoints need typed tools (npm run check-scaffold-ship)");
}

console.log("\n## Naming");
console.log("- Decision: variant C (org) — docs/REPO_NAMING.md");
console.log("- Issue #65: npm run org-handoff");

console.log("\n## Superseded PRs");
try {
  execSync("node scripts/check-superseded-prs.mjs", { cwd: ROOT, stdio: "inherit" });
} catch {
  console.log("- Run: npm run check-superseded-prs");
}

console.log("\n## Promo handoff");
console.log("- Issue #51: npm run promo-handoff -- --write");

console.log("\n## Promo checklist");
try {
  execSync("node scripts/check-promo-checklist.mjs", { cwd: ROOT, stdio: "inherit" });
} catch {
  console.log("- Run: npm run check-promo-checklist");
}

console.log("\n## Python SDK (v2.0)");
try {
  execSync("node scripts/check-python-sdk-pr.mjs", { cwd: ROOT, stdio: "inherit" });
} catch {
  console.log("- PR #22: npm run check-python-sdk-pr · docs/PYTHON_SDK_TRACK.md");
}

console.log("\n## v1.9 readiness");
try {
  execSync("node scripts/check-v19-readiness.mjs --warn-only", { cwd: ROOT, stdio: "inherit" });
} catch {
  console.log("- Run: npm run check-v19-readiness");
}

console.log("\n## Release Please");
try {
  execSync("node scripts/check-release-please.mjs", { cwd: ROOT, stdio: "inherit" });
} catch {
  console.log("- Run: npm run check-release-please");
}

console.log("\n## Manual");
console.log("- Full bundle: npm run maintainer-bundle");
console.log("- Close superseded PR: bash scripts/maintainer-pr-cleanup.sh | grep '^gh pr' | bash");
console.log("- Org transfer: docs/ORG_MIGRATION_RUNBOOK.md");
console.log("- Branch protection: docs/BRANCH_PROTECTION.md");
