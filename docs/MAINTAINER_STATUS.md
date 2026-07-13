# Maintainer status

Быстрый отчёт о состоянии релиза, promo и org migration.

```bash
npm run maintainer-status
```

Проверяет:

- npm + MCP Registry (`verify-publish`)
- Promo materials (`check-promo-versions`)
- Org interim state + apply dry-run
- Upstream scaffolds

## Связанные команды

| Команда | Назначение |
|---------|------------|
| `npm run release-prepare` | Pre-flight перед tag |
| `npm run org-migration-preflight` | Полный org dry-run |
| `bash scripts/maintainer-pr-cleanup.sh` | Закрыть superseded PR |
| `npm run check-superseded-prs` | Открытые superseded PR |
| `npm run promo-handoff` | Текст handoff для [#51](https://github.com/dkanster/samotpravil-mcp/issues/51) |

## Открытые треки (v1.9)

- [#51](https://github.com/dkanster/samotpravil-mcp/issues/51) — documenter promo (`npm run promo-handoff`)
- [#67](https://github.com/dkanster/samotpravil-mcp/pull/67) — repo naming docs (ready for review)
- Org transfer — [ORG_MIGRATION_RUNBOOK.md](./ORG_MIGRATION_RUNBOOK.md)
- Superseded PR #23–#37, #60, #64 — `check-superseded-prs` + `maintainer-pr-cleanup.sh`
