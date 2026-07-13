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

## Открытые треки (v1.9)

- [#51](https://github.com/dkanster/samotpravil-mcp/issues/51) — documenter promo
- Org transfer — [ORG_MIGRATION_RUNBOOK.md](./ORG_MIGRATION_RUNBOOK.md)
- Superseded PR #23–#37 — `maintainer-pr-cleanup.sh`
