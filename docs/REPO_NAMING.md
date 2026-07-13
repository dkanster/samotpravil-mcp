# Repo naming strategy

Три варианта имени GitHub-репозитория и MCP Registry. **Выберите один до transfer и republish MCP Registry.**

| Вариант | GitHub repo | MCP Registry | npm (сейчас) | Статус |
|---------|-------------|--------------|--------------|--------|
| **A. Текущий** | `dkanster/samotpravil-mcp` | `io.github.dkanster/samotpravil-mcp` | `samotpravil-mcp` | ✅ production |
| **B. Rename API** | `dkanster/samotpravil-api-mcp` | `io.github.dkanster/samotpravil-api-mcp` | `samotpravil-mcp` (без изменений) | Draft [PR #64](https://github.com/dkanster/samotpravil-mcp/pull/64) |
| **C. Org (runbook)** | `samotpravil/samotpravil-mcp` | `io.github.samotpravil/samotpravil-mcp` | `@samotpravil/mcp` | [#65](https://github.com/dkanster/samotpravil-mcp/issues/65) |

## Рекомендация

1. **Не мержить B и C одновременно** — разные имена репозитория (`samotpravil-api-mcp` vs `samotpravil-mcp`).
2. Если нужен суффикс `-api-` в URL GitHub → **B**, затем org transfer с сохранением имени `samotpravil-api-mcp`.
3. Если приоритет — единый бренд `samotpravil-mcp` → **C** (org runbook), закрыть [PR #64](https://github.com/dkanster/samotpravil-mcp/pull/64).

## Вариант B (PR #64)

Меняет только **GitHub URL** и **MCP Registry name**. npm-пакет остаётся `samotpravil-mcp`.

```bash
git fetch origin cursor/rename-repo-samotpravil-api-mcp-ef12
npm run plan-rename   # dry-run после merge PR #64
```

После GitHub rename (Settings → Repository name):

- Обновить `server.json` → `io.github.dkanster/samotpravil-api-mcp`
- Republish MCP Registry
- Docusaurus `baseUrl` → `/samotpravil-api-mcp/`

## Вариант C (org migration)

См. [ORG_MIGRATION_RUNBOOK.md](./ORG_MIGRATION_RUNBOOK.md).

```bash
npm run org-migration-preflight
node scripts/apply-org-migration.mjs --write
```

## Проверка текущего состояния

```bash
npm run maintainer-status
node scripts/check-org-migration.mjs
```

Если в interim-файлах появится `samotpravil-api-mcp` без принятого решения — `check-org-migration` упадёт.
