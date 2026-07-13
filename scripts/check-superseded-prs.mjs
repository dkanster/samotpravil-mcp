#!/usr/bin/env node
/**
 * Report open superseded PRs (maintainer cleanup tracker).
 * Usage: npm run check-superseded-prs
 */
import { execSync } from "node:child_process";

const GROUPS = [
  {
    label: "feature (unified release #38)",
    prs: [23, 24, 25, 37],
    closeComment: "Superseded by #38 (v1.7.0 unified release, merged to main).",
  },
  {
    label: "dependabot dev-tools",
    prs: [60],
    closeComment: "Deferred — see docs/DEPENDENCY_DEFERRALS.md (typescript 7).",
  },
  {
    label: "rename draft (after naming decision — PR #67)",
    prs: [64],
    closeComment: "Superseded by org migration path (variant C) — see PR #67 and issue #65.",
  },
];

let openCount = 0;

console.log("# Superseded PR tracker\n");

for (const group of GROUPS) {
  console.log(`## ${group.label}`);
  for (const pr of group.prs) {
    let state = "UNKNOWN";
    let title = "";
    try {
      const out = execSync(`gh pr view ${pr} --json state,title,isDraft`, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      const data = JSON.parse(out);
      state = data.state;
      title = data.title;
      if (data.isDraft) title += " [DRAFT]";
    } catch {
      state = "NOT_FOUND";
    }

    if (state === "OPEN") {
      openCount += 1;
      console.log(`- OPEN #${pr}: ${title}`);
      console.log(`  gh pr close ${pr} --comment '${group.closeComment}'`);
    } else {
      console.log(`- ${state} #${pr}`);
    }
  }
  console.log("");
}

if (openCount > 0) {
  console.log(`${openCount} superseded PR(s) still open — run maintainer-pr-cleanup.sh`);
  process.exit(1);
}

console.log("OK: no tracked superseded PRs open");
