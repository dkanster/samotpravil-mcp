# Roadmap: samotpravil-mcp v1.6

Следующий этап после v1.5: org migration execution, official promo, upstream API tracking.

**Базовая версия:** 1.5.0  
**Целевой релиз:** v1.6.0 (interim npm) / v2.0.0 (после org rename)

---

## Phase 4a — Org & promo prep (v1.6)

| # | Задача | Статус |
|---|--------|--------|
| 1 | `data/org-migration.targets.json` | ✅ |
| 2 | `check-org-migration` + `plan-org-migration` | ✅ |
| 3 | `ORG_MIGRATION_RUNBOOK.md` | ✅ |
| 4 | `pre-publish-check` + publish workflow | ✅ |
| 5 | `docs/official/PROMO_CHECKLIST.md` | ✅ |
| 6 | Issue template `docs_promo` | ✅ |
| 7 | `docs/MIGRATION_V1_TO_V2.md` | ✅ |
| 8 | MCP Resource `samotpravil://api-wishlist` | ✅ |
| 9 | `mcp.json.example.org` | ✅ |
| 10 | Branch protection template | ✅ |

---

## Phase 4b — Execution (blocked)

| # | Задача | Статус |
|---|--------|--------|
| 1 | GitHub org + repo transfer | ⏳ |
| 2 | npm `@samotpravil/mcp` + deprecate interim | ⏳ |
| 3 | MCP Registry rename | ⏳ |
| 4 | Official documenter HTML live | ⏳ |
| 5 | Branch protection on `main` | ⏳ after org |

Runbook: [ORG_MIGRATION_RUNBOOK.md](./ORG_MIGRATION_RUNBOOK.md)

---

## Phase 5 — Codegen & upstream (v1.7+)

| # | Задача | Статус |
|---|--------|--------|
| 1 | Typed tools codegen из `tools.manifest.json` | 🔲 |
| 2 | Авто-обновление SDK parity при изменении snapshot | 🔲 |
| 3 | Tracking upstream v2 endpoints (wishlist → typed tools) | 🔲 |
| 4 | Webhook/events tools (когда появится в API) | 🔲 |
| 5 | npm publish `samotpravil-mcp@1.6.0` | 🔲 |

Upstream wishlist: [API_WISHLIST.md](./API_WISHLIST.md)

---

## Критерии v1.6.0

- [x] Org migration tooling в репозитории
- [x] Pre-publish gate перед npm tag
- [x] Consumer migration guide v1→v2
- [ ] Promo checklist: documenter republish
- [ ] npm publish `samotpravil-mcp@1.6.0`
