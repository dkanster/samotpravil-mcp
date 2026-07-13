#!/usr/bin/env node
/**
 * Generate copy-paste handoff comment for org migration issue #65.
 * Usage: npm run org-handoff [-- --write]
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const writeMode = process.argv.includes("--write");
const targets = JSON.parse(readFileSync(join(ROOT, "data", "org-migration.targets.json"), "utf8"));
const { decision, target } = targets;

let replacements = "?";
try {
  const plan = execSync("node scripts/apply-org-migration.mjs", { cwd: ROOT, encoding: "utf8" });
  const match = plan.match(/(\d+) replacements in (\d+) files/);
  if (match) replacements = `${match[1]} replacements in ${match[2]} files`;
} catch {
  replacements = "run npm run org-migration-preflight";
}

const body = `## Org handoff — variant ${decision?.variant ?? "C"}

Принято решение по именованию: **${decision?.label ?? target.githubRepo}** (см. docs/REPO_NAMING.md).

### Pre-flight статус

\`\`\`bash
npm run org-migration-preflight
# dry-run: ${replacements}
\`\`\`

### Следующие шаги maintainer

1. Создать GitHub org \`samotpravil\`
2. Transfer \`dkanster/samotpravil-api-mcp\` → \`${target.githubRepo}\`
3. \`node scripts/apply-org-migration.mjs --write\`
4. \`npm test\` + \`npm run pre-publish-check\`
5. Первый publish \`${target.npmPackage}\`
6. Republish MCP Registry → \`${target.mcpRegistryName}\`
7. Branch protection — docs/BRANCH_PROTECTION.md

### Блокеры

- [ ] GitHub org создан
- [ ] Repo transferred
- [ ] NPM org \`@samotpravil\`
- [ ] Secrets обновлены`;

const ghBlock = `# Org handoff — issue #65

Copy-paste (requires maintainer gh auth):

gh issue comment 65 --body-file - <<'EOF'
${body}
EOF`;

if (writeMode) {
  const dir = join(ROOT, "artifacts");
  mkdirSync(dir, { recursive: true });
  const outPath = join(dir, "org-handoff-issue-65.md");
  writeFileSync(outPath, body, "utf8");
  console.log(`Wrote ${outPath}`);
  console.log(`\ngh issue comment 65 --body-file ${outPath}`);
} else {
  console.log(ghBlock);
}
