#!/usr/bin/env node
/**
 * Generate copy-paste handoff for docs team (issue #51).
 * Usage: npm run promo-handoff
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const version = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;
const blockPath = join(ROOT, "docs/official/MCP_INSTALL_BLOCK.html");
const block = readFileSync(blockPath, "utf8");
const blockLines = block.trim().split("\n").length;

const body = `## Handoff v${version} — MCP block для documenter

Материалы готовы к вставке в Postman collection «СамОтправил API Документация» (после «Готовые библиотеки»).

### Что публикуем

| Ресурс | Ссылка |
|--------|--------|
| HTML-блок | [MCP_INSTALL_BLOCK.html](https://github.com/dkanster/samotpravil-mcp/blob/main/docs/official/MCP_INSTALL_BLOCK.html) (${blockLines} строк) |
| Чеклист | [PROMO_CHECKLIST.md](https://github.com/dkanster/samotpravil-mcp/blob/main/docs/official/PROMO_CHECKLIST.md) |
| get-access snippet | [get-access-snippet.md](https://github.com/dkanster/samotpravil-mcp/blob/main/docs/official/get-access-snippet.md) |
| npm | \`samotpravil-mcp@${version}\` |
| MCP Registry | \`io.github.dkanster/samotpravil-mcp\` |

### Шаги docs team

1. Скопировать HTML из \`docs/official/MCP_INSTALL_BLOCK.html\` в Postman collection.
2. Republish на documentation.samotpravil.ru.
3. Подтвердить видимость блока на live site (скриншот в комментарий).
4. Maintainer выполнит \`npm run sync-docs\` после republish.

### Проверка maintainer

\`\`\`bash
npm run check-promo-versions
npm run verify-publish -- ${version}
\`\`\`

Обновите заголовок issue на \`[Docs promo] v${version} MCP block\` после republish.`;

console.log("# Promo handoff — issue #51\n");
console.log("Copy-paste (requires maintainer gh auth):\n");
console.log("gh issue comment 51 --body-file - <<'EOF'");
console.log(body);
console.log("EOF");
console.log("\nOptional title update:");
console.log(`gh issue edit 51 --title "[Docs promo] v${version} MCP block для documentation.samotpravil.ru"`);
