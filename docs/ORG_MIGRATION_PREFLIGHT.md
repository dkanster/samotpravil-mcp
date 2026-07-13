# Org migration pre-flight

Быстрая проверка готовности к transfer в org `samotpravil`.

```bash
npm run org-migration-preflight
```

## Что проверяется

| Шаг | Скрипт |
|-----|--------|
| Interim state OK | `check-org-migration` |
| Replacement dry-run | `apply-org-migration` |
| Branch protection | `check-branch-protection` (gh CLI) |
| Wishlist scaffolds | `check-scaffolds` |

## После transfer

```bash
node scripts/apply-org-migration.mjs --write
npm run sync-versions
npm run check-org-migration -- --target
npm test
npm run pre-publish-check
```

Полный runbook: [ORG_MIGRATION_RUNBOOK.md](./ORG_MIGRATION_RUNBOOK.md)

Issue template: **Org migration tracking** (`.github/ISSUE_TEMPLATE/org_migration.yml`)
