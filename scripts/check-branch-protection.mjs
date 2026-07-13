#!/usr/bin/env node
/**
 * Check branch protection on main (requires gh CLI + admin read).
 * Usage: node scripts/check-branch-protection.mjs [--json]
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const jsonOut = process.argv.includes("--json");
const strict = process.argv.includes("--strict");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const repoUrl = pkg.repository?.url ?? "";
const match = repoUrl.match(/github\.com[:/](.+?)(?:\.git)?$/);
const repo = match?.[1] ?? "dkanster/samotpravil-api-mcp";

let status = "unknown";
let contexts = [];
let detail = "";

try {
  const raw = execSync(`gh api "repos/${repo}/branches/main/protection"`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const protection = JSON.parse(raw);
  contexts = protection.required_status_checks?.contexts ?? [];
  const hasCheck = contexts.includes("check");
  status = hasCheck ? "ok" : "missing_check";
  detail = hasCheck
    ? `Branch protection active; required checks: ${contexts.join(", ")}`
    : `Protection exists but "check" not in required contexts: ${contexts.join(", ") || "(none)"}`;
} catch (error) {
  const stderr = error.stderr?.toString() ?? error.message ?? "";
  if (stderr.includes("404") || stderr.includes("Branch not protected")) {
    status = "not_configured";
    detail = "Branch protection not configured on main";
  } else if (stderr.includes("403") || stderr.includes("not accessible")) {
    status = "skipped";
    detail = "Cannot read protection (gh auth or permissions). Apply manually — docs/BRANCH_PROTECTION.md";
  } else {
    status = "error";
    detail = stderr.trim() || "gh api failed";
  }
}

const report = { repo, status, contexts, detail };

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(status === "ok" || status === "skipped" ? 0 : strict ? 1 : 0);
}

console.log(`Branch protection (${repo}): ${status}`);
console.log(detail);
if (status === "not_configured") {
  console.log("\nApply: docs/BRANCH_PROTECTION.md");
}

if (strict && status !== "ok" && status !== "skipped") {
  process.exit(1);
}
