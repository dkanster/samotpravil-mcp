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
| `npm run org-migration-preflight` | Полный org dry-run |
| `npm run release-prepare` | Pre-flight перед tag (v1.9: [RELEASE_v1.9.0.md](./RELEASE_v1.9.0.md)) |
| `bash scripts/maintainer-pr-cleanup.sh` | Закрыть superseded PR |
| `npm run plan-rename` | Dry-run rename (вариант B, PR #64) |
| `npm run plan-org-migration` | Dry-run org transfer (вариант C) |
| `npm run check-superseded-prs` | Открытые superseded PR |
| `npm run promo-handoff` | Текст handoff для [#51](https://github.com/dkanster/samotpravil-mcp/issues/51) |

## Открытые треки (v1.9)

- [#51](https://github.com/dkanster/samotpravil-mcp/issues/51) — documenter promo (`npm run promo-handoff`)
- Именование A/B/C — [REPO_NAMING.md](./REPO_NAMING.md) · PR [#64](https://github.com/dkanster/samotpravil-mcp/pull/64)
- Org transfer — [#65](https://github.com/dkanster/samotpravil-mcp/issues/65) · [ORG_MIGRATION_RUNBOOK.md](./ORG_MIGRATION_RUNBOOK.md)
- Superseded PR #23–#37, #60, #64 — `check-superseded-prs` + `maintainer-pr-cleanup.sh`
