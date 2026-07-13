# Roadmap: samotpravil-mcp v1.8

После release **v1.7.0** — execution и product alignment.

**Базовая версия:** 1.8.0  
**Целевой релиз:** v1.8.0 ✅ (release PR)

---

## Phase 6 — Post-release execution

| # | Задача | Статус |
|---|--------|--------|
| 1 | Merge unified PR #38 (squash) | ✅ |
| 2 | Tag `v1.7.0` + npm publish | ✅ |
| 3 | `verify-publish` workflow | ✅ |
| 4 | Promo HTML v1.8.0 в documenter | ⏳ [#51](https://github.com/dkanster/samotpravil-api-mcp/issues/51) |
| 5 | Закрыть superseded PR #23–#25, #37 | ⏳ `bash scripts/maintainer-pr-cleanup.sh` |

---

## Phase 7 — Org & official (blocked)

| # | Задача | Статус |
|---|--------|--------|
| 1 | GitHub org transfer | ⏳ |
| 2 | `@samotpravil/mcp` npm scope | ⏳ |
| 3 | MCP Registry rename | ⏳ |
| 4 | Branch protection on `main` | ⏳ [BRANCH_PROTECTION.md](./BRANCH_PROTECTION.md) |

Runbook: [ORG_MIGRATION_RUNBOOK.md](./ORG_MIGRATION_RUNBOOK.md)

---

## Phase 8 — Product sync (upstream)

| # | Задача | Статус |
|---|--------|--------|
| 1 | Typed tools для v2 package API (когда upstream ship) | 🔲 |
| 2 | Webhook/events tools | 🔲 |
| 3 | Авто-issue при `check-upstream-wishlist` → shipped | ✅ workflow |
| 4 | Codegen handlers из catalog (beyond scaffold) | ✅ snapshot-aware scaffold |

Wishlist: [API_WISHLIST.md](./API_WISHLIST.md) · Tracking: `npm run check-upstream-wishlist`

---

## Критерии v1.8.0

- [x] `samotpravil-mcp@1.7.0` на npm (или 1.8.0 patch)
- [x] MCP Registry verified
- [x] `samotpravil-mcp@1.8.0` publish
- [ ] Documenter HTML block live
- [ ] Org migration started OR promo complete без org
