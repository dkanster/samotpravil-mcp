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
- Scaffold ship readiness (`check-scaffold-ship`)

## Связанные команды

| Команда | Назначение |
|---------|------------|
| `npm run org-migration-preflight` | Полный org dry-run |
| `npm run release-prepare` | Pre-flight перед tag (v1.9: [RELEASE_v1.9.0.md](./RELEASE_v1.9.0.md)) |
| `bash scripts/maintainer-pr-cleanup.sh` | Закрыть superseded PR |
| `npm run plan-rename` | Dry-run rename (вариант B, PR #64) |
| `npm run plan-org-migration` | Dry-run org transfer (вариант C) |
| `npm run check-scaffold-ship` | Shipped upstream → sdkTyped readiness |
| `npm run check-superseded-prs` | Открытые superseded PR |
| `npm run promo-handoff` | Текст handoff для [#51](https://github.com/dkanster/samotpravil-mcp/issues/51) |
| `npm run org-handoff` | Текст handoff для [#65](https://github.com/dkanster/samotpravil-mcp/issues/65) |

## Открытые треки (v1.9)

- [#51](https://github.com/dkanster/samotpravil-mcp/issues/51) — documenter promo (`npm run promo-handoff -- --write`)
- Org transfer — [#65](https://github.com/dkanster/samotpravil-mcp/issues/65) · `npm run org-handoff -- --write`
- Именование — ✅ variant C · [REPO_NAMING.md](./REPO_NAMING.md)
- Superseded PR #23–#37, #60, #64 — `check-superseded-prs` + `maintainer-pr-cleanup.sh`
