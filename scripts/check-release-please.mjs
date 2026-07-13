#!/usr/bin/env node
/**
 * Check Release Please branch vs main and whether release PR is open.
 * Usage: npm run check-release-please
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RP_BRANCH = "release-please--branches--main--components--samotpravil-mcp";

function run(cmd, { allowFail = false } = {}) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch (error) {
    if (allowFail) return null;
    throw error;
  }
}

const mainVersion = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;

run(`git fetch origin ${RP_BRANCH}`, { allowFail: true });

let rpVersion = null;
let rpAhead = null;
try {
  const pkg = run(`git show origin/${RP_BRANCH}:package.json`);
  rpVersion = JSON.parse(pkg).version;
  const behind = run(`git rev-list --count origin/main..origin/${RP_BRANCH}`, { allowFail: true });
  const ahead = run(`git rev-list --count origin/${RP_BRANCH}..origin/main`, { allowFail: true });
  rpAhead = { commitsOnRpBranch: behind ?? "?", mainAheadOfRp: ahead ?? "?" };
} catch {
  rpVersion = null;
}

let openPr = null;
try {
  const out = run(
    `gh pr list --head ${RP_BRANCH} --json number,title,state,url --limit 1`,
    { allowFail: true },
  );
  if (out) {
    const rows = JSON.parse(out);
    openPr = rows[0] ?? null;
  }
} catch {
  openPr = null;
}

console.log("# Release Please status\n");
console.log(`main: ${mainVersion}`);
console.log(`release-please branch: ${rpVersion ?? "not found"}`);

if (rpAhead) {
  console.log(`commits on RP branch not in main: ${rpAhead.commitsOnRpBranch}`);
  console.log(`commits on main not in RP branch: ${rpAhead.mainAheadOfRp}`);
}

if (openPr) {
  console.log(`\nOpen release PR: #${openPr.number} ${openPr.title}`);
  console.log(openPr.url);
} else if (rpVersion && rpVersion !== mainVersion) {
  console.log(`\nACTION: release PR missing for v${rpVersion}`);
  console.log("Maintainer (local gh auth):");
  console.log(`  gh pr create --base main --head ${RP_BRANCH} \\`);
  console.log(`    --title "chore(main): release ${rpVersion}" \\`);
  console.log('    --body-file artifacts/release-pr-body.md  # npm run release-pr-body -- --write');
} else if (rpVersion === mainVersion) {
  console.log("\nOK: release-please branch matches main version (no pending release PR needed)");
} else {
  console.log("\nWARN: could not determine release-please state — see docs/RELEASE_PLEASE.md");
}

if (rpVersion && rpVersion !== mainVersion && !openPr) {
  process.exit(1);
}
process.exit(0);
