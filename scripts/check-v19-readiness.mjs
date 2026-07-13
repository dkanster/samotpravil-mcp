#!/usr/bin/env node
/**
 * Aggregate v1.9.0 release readiness checks.
 * Usage: npm run check-v19-readiness [-- --json] [-- --warn-only]
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const jsonOut = process.argv.includes("--json");
const warnOnly = process.argv.includes("--warn-only");

function run(cmd, { allowFail = false } = {}) {
  try {
    execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { ok: true };
  } catch (error) {
    if (allowFail) return { ok: false, output: error.stdout?.toString() ?? error.message };
    return { ok: false, output: error.stderr?.toString() ?? error.message };
  }
}

function ghIssueState(number) {
  try {
    const out = execSync(`gh issue view ${number} --json state,title`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return JSON.parse(out);
  } catch {
    return null;
  }
}

const targets = JSON.parse(readFileSync(join(ROOT, "data", "org-migration.targets.json"), "utf8"));
const version = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;

const criteria = [];

// 1. Naming
criteria.push({
  id: "naming",
  label: "Решение по именованию (variant C)",
  status: targets.decision?.variant === "C" ? "done" : "pending",
  detail: targets.decision?.label ?? "no decision in org-migration.targets.json",
  blocking: true,
});

// 2. Promo or org started
const issue51 = ghIssueState(51);
const issue65 = ghIssueState(65);
const orgStarted = issue65?.state === "OPEN";
const promoOpen = issue51?.state === "OPEN";
criteria.push({
  id: "promo_or_org",
  label: "Documenter live OR org migration started",
  status: orgStarted || !promoOpen ? "partial" : "pending",
  detail: orgStarted
    ? `org #65 open — ${issue65.title}`
    : promoOpen
      ? `promo #51 still open — ${issue51?.title ?? "?"}`
      : "promo issue closed",
  blocking: false,
});

// 3. Promo checklist (maintainer section)
let promoChecklistMaintainer = false;
let documenterPending = -1;
try {
  const out = execSync("node scripts/check-promo-checklist.mjs --json", {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const data = JSON.parse(out);
  promoChecklistMaintainer = data.maintainerReady;
  documenterPending = data.pendingDocumenterItems;
} catch (error) {
  try {
    const data = JSON.parse(error.stdout ?? "{}");
    promoChecklistMaintainer = data.maintainerReady ?? false;
    documenterPending = data.pendingDocumenterItems ?? -1;
  } catch {
    promoChecklistMaintainer = false;
  }
}
criteria.push({
  id: "promo_checklist_maintainer",
  label: "Promo checklist — maintainer items",
  status: promoChecklistMaintainer ? "done" : "pending",
  detail: promoChecklistMaintainer
    ? "npm run check-promo-checklist"
    : "promo materials or publish verify failed",
  blocking: false,
});
criteria.push({
  id: "promo_checklist_documenter",
  label: "Promo checklist — documenter live",
  status: documenterPending === 0 ? "done" : "pending",
  detail:
    documenterPending === 0
      ? "all documenter steps complete"
      : documenterPending > 0
        ? `${documenterPending} steps pending — issue #51`
        : "npm run check-promo-checklist",
  blocking: false,
});

// 4. Promo materials aligned
const promoOk = run("node scripts/check-promo-versions.mjs").ok;
criteria.push({
  id: "promo_materials",
  label: "Promo materials aligned with package",
  status: promoOk ? "done" : "pending",
  detail: promoOk ? `v${version}` : "run npm run check-promo-versions",
  blocking: false,
});

// 5. Superseded PRs
let supersededOpen = -1;
try {
  execSync("node scripts/check-superseded-prs.mjs", {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  supersededOpen = 0;
} catch (error) {
  const combined = `${error.stdout ?? ""}${error.stderr ?? ""}`;
  const match = combined.match(/(\d+) superseded PR\(s\) still open/);
  supersededOpen = match ? Number(match[1]) : -1;
}
criteria.push({
  id: "superseded_prs",
  label: "Superseded PR closed",
  status: supersededOpen === 0 ? "done" : "pending",
  detail:
    supersededOpen === 0
      ? "none open"
      : supersededOpen > 0
        ? `${supersededOpen} still open — maintainer-pr-cleanup.sh`
        : "could not query (gh auth?)",
  blocking: true,
});

// 6. Typed v2 tools
const scaffoldShip = run("node scripts/check-scaffold-ship.mjs", { allowFail: true });
criteria.push({
  id: "typed_v2",
  label: "Typed tool для shipped v2 endpoint",
  status: scaffoldShip.ok ? "done" : "pending",
  detail: scaffoldShip.ok
    ? "no shipped proposed endpoints or all registered"
    : "npm run check-scaffold-ship — action required",
  blocking: false,
});

// 7. Org interim state
const orgOk = run("node scripts/check-org-migration.mjs").ok;
criteria.push({
  id: "org_interim",
  label: "Org interim state valid",
  status: orgOk ? "done" : "pending",
  detail: orgOk ? "check-org-migration OK" : "check-org-migration failed",
  blocking: true,
});

// 8. Release Please PR
let releasePrStatus = "pending";
let releasePrDetail = "npm run check-release-please";
try {
  let rpExit = 0;
  try {
    execSync("node scripts/check-release-please.mjs", {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    rpExit = error.status ?? 1;
    releasePrDetail = error.stdout?.toString().includes("ACTION")
      ? "release PR missing — npm run release-pr-body -- --write"
      : "npm run check-release-please";
  }
  releasePrStatus = rpExit === 0 ? "done" : "pending";
} catch {
  releasePrStatus = "pending";
}
criteria.push({
  id: "release_pr",
  label: "Release Please PR open",
  status: releasePrStatus,
  detail: releasePrDetail,
  blocking: false,
});

const blockingPending = criteria.filter((c) => c.blocking && c.status !== "done");
const allDone = criteria.every((c) => c.status === "done");

if (jsonOut) {
  console.log(
    JSON.stringify(
      {
        version,
        ready: blockingPending.length === 0,
        criteria,
      },
      null,
      2,
    ),
  );
} else {
  console.log(`# v1.9.0 readiness — base v${version}\n`);
  for (const row of criteria) {
    const icon = row.status === "done" ? "✅" : row.status === "partial" ? "⏳" : "🔲";
    const block = row.blocking ? " [blocking]" : "";
    console.log(`${icon} ${row.label}${block}`);
    console.log(`   ${row.detail}`);
  }
  console.log("");
  if (blockingPending.length === 0) {
    console.log("OK: no blocking criteria pending — see docs/RELEASE_v1.9.0.md for full checklist");
  } else {
    console.log(`BLOCKING: ${blockingPending.map((c) => c.id).join(", ")}`);
    console.log("See: docs/RELEASE_v1.9.0.md");
  }
}

if (blockingPending.length > 0 && !warnOnly) {
  process.exit(1);
}
if (!allDone && !warnOnly && blockingPending.length === 0) {
  process.exit(0);
}
process.exit(0);
