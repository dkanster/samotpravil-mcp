#!/usr/bin/env node
/**
 * Generate Release Please PR body with v1.9 readiness snapshot.
 * Usage: npm run release-pr-body [-- --write]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RP_BRANCH = "release-please--branches--main--components--samotpravil-mcp";
const writeMode = process.argv.includes("--write");

function run(cmd, { allowFail = false } = {}) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch (error) {
    if (allowFail) return null;
    throw error;
  }
}

run(`git fetch origin ${RP_BRANCH}`, { allowFail: true });
const mainVersion = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;

let rpVersion = mainVersion;
try {
  const pkg = run(`git show origin/${RP_BRANCH}:package.json`);
  rpVersion = JSON.parse(pkg).version;
} catch {
  rpVersion = "?.?.?";
}

let readinessSummary = "Run: npm run check-v19-readiness";
try {
  let out = null;
  try {
    out = run("node scripts/check-v19-readiness.mjs --json");
  } catch (error) {
    out = error.stdout?.toString()?.trim() || null;
  }
  if (out) {
    const data = JSON.parse(out);
    const lines = data.criteria.map((row) => {
      const mark = row.status === "done" ? "x" : " ";
      const block = row.blocking ? " (blocking)" : "";
      return `- [${mark}] ${row.label}${block}`;
    });
    readinessSummary = lines.join("\n");
  }
} catch {
  /* keep default */
}

const body = `## Release Please v${rpVersion}

Автоматический bump с ветки \`${RP_BRANCH}\` (main сейчас v${mainVersion}).

### Gate перед merge

\`\`\`bash
npm run check-v19-readiness
npm run release-prepare
\`\`\`

**Не мержить**, пока blocking criteria не закрыты (superseded PR).

### Readiness snapshot

${readinessSummary}

### После merge

- Tag \`v${rpVersion}\` → \`publish.yml\` → \`mcp-registry.yml\` → \`post-release.yml\`
- \`npm run verify-publish -- ${rpVersion}\`
- Обновить promo: \`npm run check-promo-versions\`

Чеклист: [RELEASE_v1.9.0.md](docs/RELEASE_v1.9.0.md) · [CHANGELOG.md](CHANGELOG.md) на release-please ветке.`;

if (writeMode) {
  const dir = join(ROOT, "artifacts");
  mkdirSync(dir, { recursive: true });
  const outPath = join(dir, "release-pr-body.md");
  writeFileSync(outPath, body, "utf8");
  console.log(`Wrote ${outPath}`);
  console.log(`\ngh pr create --base main --head ${RP_BRANCH} \\`);
  console.log(`  --title "chore(main): release ${rpVersion}" \\`);
  console.log(`  --body-file ${outPath}`);
} else {
  console.log("# Release PR body\n");
  console.log(body);
  console.log("\n---");
  console.log(`npm run release-pr-body -- --write`);
  console.log(`gh pr create --base main --head ${RP_BRANCH} --title "chore(main): release ${rpVersion}" --body-file artifacts/release-pr-body.md`);
}
