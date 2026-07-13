# Repo naming strategy

Три варианта имени GitHub-репозитория и MCP Registry.

## Принятое решение (2026-07-13)

**Вариант C — org migration.** PR [#64](https://github.com/dkanster/samotpravil-mcp/pull/64) закрыт.

| Ресурс | Целевое значение |
|--------|------------------|
| GitHub | `samotpravil/samotpravil-mcp` |
| npm | `@samotpravil/mcp` |
| MCP Registry | `io.github.samotpravil/samotpravil-mcp` |

Трекинг: [#65](https://github.com/dkanster/samotpravil-mcp/issues/65) · `npm run org-handoff`

---

## Сравнение вариантов (архив)

| Вариант | GitHub repo | MCP Registry | npm | Статус |
|---------|-------------|--------------|-----|--------|
| **A. Текущий** | `dkanster/samotpravil-mcp` | `io.github.dkanster/samotpravil-mcp` | `samotpravil-mcp` | interim (до transfer) |
| **B. Rename API** | `dkanster/samotpravil-api-mcp` | `io.github.dkanster/samotpravil-api-mcp` | `samotpravil-mcp` | ❌ отклонён (PR #64 closed) |
| **C. Org (runbook)** | `samotpravil/samotpravil-mcp` | `io.github.samotpravil/samotpravil-mcp` | `@samotpravil/mcp` | ✅ **принят** |

## Вариант B (архив)

`npm run plan-rename` остаётся для справки — **не применять** после решения C.

## Вариант C (активный)

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

Interim-файлы не должны содержать `samotpravil-api-mcp` — `check-org-migration` упадёт.
