# Roadmap: samotpravil-mcp v1.9

После release **v1.8.0** — promo, org, upstream product sync.

**Базовая версия:** 1.8.0  
**Целевой релиз:** v1.9.0

---

## Phase 6b — Promo & visibility

| # | Задача | Статус |
|---|--------|--------|
| 1 | Documenter HTML block live | ⏳ [#51](https://github.com/dkanster/samotpravil-mcp/issues/51) |
| 2 | get-access snippet (marketing) | ⏳ |
| 3 | Blog post (опционально) | ⏳ |
| 4 | `check-promo-versions` в CI | ✅ |

---

## Phase 7 — Org & official

| # | Задача | Статус |
|---|--------|--------|
| 1 | GitHub org transfer | ⏳ |
| 2 | `apply-org-migration --write` | ⏳ `npm run org-migration-preflight` |
| 3 | `@samotpravil/mcp` npm scope | ⏳ |
| 4 | Branch protection on `main` | ⏳ `npm run check-branch-protection` |

Runbook: [ORG_MIGRATION_RUNBOOK.md](./ORG_MIGRATION_RUNBOOK.md)

---

## Phase 8 — Upstream v2 tools

| # | Задача | Статус |
|---|--------|--------|
| 1 | Ship typed tools из `scaffolds/` когда endpoint в snapshot | 🔲 `check-scaffolds` ✅ |
| 2 | Webhook/events tool | 🔲 |
| 3 | Upstream watch → issue (shipped) | ✅ |
| 4 | SDK_TYPED_TOOL_COUNT bump + release | 🔲 |

Scaffolds: [scaffolds/](../scaffolds/) · Watch: `upstream-wishlist-watch.yml`

---

## Phase 9 — Dependencies & docs site

| # | Задача | Статус |
|---|--------|--------|
| 1 | Scalar 0.9 visual QA | ⏳ build OK |
| 2 | dev-tools group (#57) | ⏳ |
| 3 | Docusaurus deploy smoke | ⏳ |

---

## Критерии v1.9.0

- [ ] Documenter MCP block live OR org migration started
- [ ] Typed tool для ≥1 shipped v2 endpoint
- [ ] Promo checklist «Публикация на documenter» complete
- [ ] Закрыты superseded PR (#23–#37)
