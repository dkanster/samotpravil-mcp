# Roadmap: samotpravil-mcp v1.8

После release **v1.7.0** — execution и product alignment.

**Базовая версия:** 1.7.0  
**Целевой релиз:** v1.8.0

---

## Phase 6 — Post-release execution

| # | Задача | Статус |
|---|--------|--------|
| 1 | Merge unified PR #38 (squash) | ⏳ |
| 2 | Tag `v1.7.0` + npm publish | ⏳ |
| 3 | `verify-publish` workflow | ✅ |
| 4 | Promo HTML v1.7.0 в documenter | ⏳ docs team |
| 5 | Закрыть superseded PR #23–#25, #37 | ⏳ |

---

## Phase 7 — Org & official (blocked)

| # | Задача | Статус |
|---|--------|--------|
| 1 | GitHub org transfer | ⏳ |
| 2 | `@samotpravil/mcp` npm scope | ⏳ |
| 3 | MCP Registry rename | ⏳ |
| 4 | Branch protection on `main` | ⏳ |

Runbook: [ORG_MIGRATION_RUNBOOK.md](./ORG_MIGRATION_RUNBOOK.md)

---

## Phase 8 — Product sync (upstream)

| # | Задача | Статус |
|---|--------|--------|
| 1 | Typed tools для v2 package API (когда upstream ship) | 🔲 |
| 2 | Webhook/events tools | 🔲 |
| 3 | Авто-PR при `check-upstream-wishlist` → shipped | 🔲 |
| 4 | Codegen handlers из catalog (beyond scaffold) | 🔲 |

Wishlist: [API_WISHLIST.md](./API_WISHLIST.md) · Tracking: `npm run check-upstream-wishlist`

---

## Критерии v1.8.0

- [ ] `samotpravil-mcp@1.7.0` на npm (или 1.8.0 patch)
- [ ] MCP Registry verified
- [ ] Documenter HTML block live
- [ ] Org migration started OR promo complete без org
