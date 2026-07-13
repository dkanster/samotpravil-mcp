#!/usr/bin/env node
/**
 * Report Python SDK PR #22 merge readiness (v2.0 track).
 * Usage: npm run check-python-sdk-pr
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const track = JSON.parse(readFileSync(join(ROOT, "data", "python-sdk-track.json"), "utf8"));

function run(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function runOptional(cmd) {
  try {
    return run(cmd);
  } catch (error) {
    return { error, stdout: error.stdout?.toString() ?? "", stderr: error.stderr?.toString() ?? "" };
  }
}

runOptional(`git fetch origin ${track.branch}`);

let pr = null;
try {
  pr = JSON.parse(
    run(`gh pr view ${track.pr} --json state,title,isDraft,mergeable,additions,deletions,url`),
  );
} catch {
  pr = null;
}

let conflictCount = null;
const base = runOptional(`git merge-base origin/main origin/${track.branch}`);
if (typeof base === "string") {
  const tree = runOptional(`git merge-tree ${base} origin/main origin/${track.branch}`);
  const text = typeof tree === "string" ? tree : tree.stdout ?? "";
  conflictCount = (text.match(/^changed in both/gm) ?? []).length;
}

const commitsAhead = runOptional(`git rev-list --count origin/main..origin/${track.branch}`);
const pythonOnMain = existsSync(join(ROOT, "python"));

console.log(`# Python SDK track — PR #${track.pr}\n`);
console.log(`Milestone: ${track.targetMilestone}`);
console.log(`Doc: ${track.paths.doc}`);

if (pr) {
  console.log(`\nPR: ${pr.url}`);
  console.log(`State: ${pr.state}${pr.isDraft ? " [DRAFT]" : ""}`);
  console.log(`Diff: +${pr.additions} / -${pr.deletions}`);
  if (pr.mergeable) console.log(`Mergeable (GitHub): ${pr.mergeable}`);
}

console.log(`\nBranch: origin/${track.branch}`);
console.log(`Commits ahead of main: ${typeof commitsAhead === "string" ? commitsAhead : "?"}`);
console.log(`python/ on main: ${pythonOnMain ? "yes" : "no"}`);
console.log(`Estimated merge conflicts: ${conflictCount ?? "unknown"}`);

console.log("\n## Merge blockers");
for (const blocker of track.mergeBlockers) {
  console.log(`- ${blocker}`);
}

if (conflictCount && conflictCount > 0) {
  console.log(`\nACTION: rebase required (${conflictCount} conflicting files)`);
  console.log(`  git fetch origin ${track.branch}`);
  console.log(`  git checkout -b cursor/python-sdk-rebase-dd21 origin/${track.branch}`);
  console.log("  git rebase origin/main");
}

if (!pythonOnMain) {
  console.log("\nOK: Python MCP not on main — v2.0 track isolated from v1.9");
} else {
  console.log("\nOK: python/ present on main");
}

if (pr?.state === "OPEN" && conflictCount && conflictCount > 0) {
  process.exit(1);
}
process.exit(0);
