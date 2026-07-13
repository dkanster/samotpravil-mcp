# Repo naming strategy

Три варианта имени GitHub-репозитория и MCP Registry.

## Принятое решение (2026-07-13, обновлено)

**Вариант B — rename API.** GitHub-репозиторий переименован в `samotpravil-api-mcp`; npm-пакет без изменений.

| Ресурс | Целевое значение |
|--------|------------------|
| GitHub | `dkanster/samotpravil-api-mcp` |
| npm | `samotpravil-mcp` |
| MCP Registry | `io.github.dkanster/samotpravil-api-mcp` |

Org migration (вариант C) остаётся в roadmap — см. [#65](https://github.com/dkanster/samotpravil-api-mcp/issues/65).

---

## Сравнение вариантов (архив)

| Вариант | GitHub repo | MCP Registry | npm | Статус |
|---------|-------------|--------------|-----|--------|
| **A. Legacy** | `dkanster/samotpravil-mcp` | `io.github.dkanster/samotpravil-mcp` | `samotpravil-mcp` | ❌ заменён |
| **B. Rename API** | `dkanster/samotpravil-api-mcp` | `io.github.dkanster/samotpravil-api-mcp` | `samotpravil-mcp` | ✅ **принят** |
| **C. Org (runbook)** | `samotpravil/samotpravil-mcp` | `io.github.samotpravil/samotpravil-mcp` | `@samotpravil/mcp` | ⏳ будущий |

## Вариант B (активный)

```bash
npm run plan-rename          # dry-run (должен показать 0 замен после применения)
npm run check-org-migration  # interim = samotpravil-api-mcp
```

После rename на GitHub: `git remote set-url origin https://github.com/dkanster/samotpravil-api-mcp.git`

## Вариант C (будущий)

См. [ORG_MIGRATION_RUNBOOK.md](./ORG_MIGRATION_RUNBOOK.md).

```bash
npm run org-migration-preflight
npm run org-handoff          # комментарий для issue #65
node scripts/apply-org-migration.mjs --write
```

## Проверка

```bash
npm run maintainer-status
node scripts/check-org-migration.mjs
```
