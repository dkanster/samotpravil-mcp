#!/usr/bin/env node
/**
 * Verify automatable items from docs/official/PROMO_CHECKLIST.md.
 * Usage: npm run check-promo-checklist [-- --json]
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const jsonOut = process.argv.includes("--json");
const version = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;

function runOk(cmd) {
  try {
    execSync(cmd, { cwd: ROOT, stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function ghIssue(number) {
  try {
    const out = execSync(`gh issue view ${number} --json state,title,labels`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return JSON.parse(out);
  } catch {
    return null;
  }
}

const sections = [
  {
    id: "pre_publish",
    title: "До публикации на documenter (maintainer)",
    items: [],
  },
  {
    id: "documenter",
    title: "Публикация на documentation.samotpravil.ru (docs team)",
    items: [],
  },
];

// Pre-publish automatable
const promoVersions = runOk("node scripts/check-promo-versions.mjs");
sections[0].items.push({
  id: "html_block",
  label: "HTML-блок актуален (версия, npm)",
  status: promoVersions ? "done" : "pending",
  owner: "maintainer",
});

const npmVerified = runOk(`node scripts/verify-publish.mjs ${version}`);
sections[0].items.push({
  id: "npm_publish",
  label: `npm publish v${version}`,
  status: npmVerified ? "done" : "pending",
  owner: "maintainer",
});

sections[0].items.push({
  id: "mcp_registry",
  label: "MCP Registry entry visible",
  status: npmVerified ? "done" : "pending",
  owner: "maintainer",
});

const issue51 = ghIssue(51);
sections[0].items.push({
  id: "docs_issue",
  label: "Issue #51 для docs team",
  status: issue51?.state === "OPEN" ? "done" : issue51 ? "partial" : "pending",
  detail: issue51?.title,
  owner: "maintainer",
});

// Documenter — manual until issue closed or title mentions live
const documenterLive =
  issue51?.state === "CLOSED" ||
  (issue51?.title?.toLowerCase().includes("live") ?? false);
for (const [id, label] of [
  ["insert_html", "HTML вставлен в Postman collection"],
  ["republish", "Documenter republished"],
  ["live_check", "Блок виден на live site"],
  ["sync_docs", "npm run sync-docs после republish"],
  ["snapshot_pr", "Snapshot обновлён (PR или weekly)"],
]) {
  sections[1].items.push({
    id,
    label,
    status: documenterLive ? "done" : "pending",
    owner: "docs team / maintainer",
  });
}

const maintainerDone = sections[0].items.every((i) => i.status === "done");
const documenterDone = sections[1].items.every((i) => i.status === "done");
const pendingManual = sections[1].items.filter((i) => i.status !== "done").length;

if (jsonOut) {
  console.log(
    JSON.stringify(
      {
        version,
        maintainerReady: maintainerDone,
        documenterLive: documenterDone,
        pendingDocumenterItems: pendingManual,
        sections,
      },
      null,
      2,
    ),
  );
} else {
  console.log(`# Promo checklist — v${version}\n`);
  for (const section of sections) {
    console.log(`## ${section.title}`);
    for (const item of section.items) {
      const icon = item.status === "done" ? "✅" : item.status === "partial" ? "⏳" : "🔲";
      console.log(`${icon} ${item.label} (${item.owner})`);
      if (item.detail) console.log(`   ${item.detail}`);
    }
    console.log("");
  }
  if (maintainerDone && !documenterDone) {
    console.log(`Maintainer items OK — ${pendingManual} documenter step(s) pending`);
    console.log("Handoff: npm run promo-handoff -- --write");
  } else if (documenterDone) {
    console.log("OK: promo checklist complete");
  } else {
    console.log("Pending: maintainer promo items need update");
  }
}

if (!maintainerDone) {
  process.exit(1);
}
process.exit(0);
