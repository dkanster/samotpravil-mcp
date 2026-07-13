# Roadmap: samotpravil-mcp v1.9

После release **v1.8.0** — promo, org, upstream product sync.

**Базовая версия:** 1.8.0  
**Целевой релиз:** v1.9.0

---

## Phase 6b — Promo & visibility

| # | Задача | Статус |
|---|--------|--------|
| 1 | Documenter HTML block live | ⏳ [#51](https://github.com/dkanster/samotpravil-mcp/issues/51) · `npm run promo-handoff` |
| 2 | get-access snippet (marketing) | ✅ [get-access-snippet.md](./official/get-access-snippet.md) |
| 3 | Blog post (опционально) | ⏳ |
| 4 | `check-promo-versions` в CI | ✅ |
| 5 | `promo-handoff` tooling | ✅ [#68](https://github.com/dkanster/samotpravil-mcp/pull/68) |
| 6 | `check-promo-checklist` | ✅ |

---

## Phase 7 — Org & official

| # | Задача | Статус |
|---|--------|--------|
| 1 | Maintainer tooling (naming, tracker) | ✅ [#67](https://github.com/dkanster/samotpravil-mcp/pull/67) [#68](https://github.com/dkanster/samotpravil-mcp/pull/68) |
| 2 | Решение по именованию (A/B/C) | ✅ variant C · [REPO_NAMING.md](./REPO_NAMING.md) |
| 3 | GitHub org transfer | ⏳ [#65](https://github.com/dkanster/samotpravil-mcp/issues/65) |
| 4 | `apply-org-migration --write` | ⏳ `npm run org-migration-preflight` |
| 5 | `@samotpravil/mcp` npm scope | ⏳ |
| 6 | Branch protection on `main` | ⏳ `npm run check-branch-protection` |

Runbook: [ORG_MIGRATION_RUNBOOK.md](./ORG_MIGRATION_RUNBOOK.md)

---

## Phase 8 — Upstream v2 tools

| # | Задача | Статус |
|---|--------|--------|
| 1 | Ship typed tools из `scaffolds/` когда endpoint в snapshot | 🔲 `check-scaffold-ship` ✅ |
| 2 | Webhook/events tool | 🔲 |
| 3 | Upstream watch → issue (shipped) | ✅ |
| 4 | SDK_TYPED_TOOL_COUNT bump + release | 🔲 |

Scaffolds: [scaffolds/](../scaffolds/) · Watch: `upstream-wishlist-watch.yml`

---

## Phase 9 — Dependencies & docs site

| # | Задача | Статус |
|---|--------|--------|
| 1 | Scalar 0.9 visual QA | ✅ CI checks reference/ + openapi.yaml |
| 2 | dev-tools group (#60) | ⏳ deferred (typescript 7) |
| 3 | Docusaurus deploy smoke | ✅ weekly + PR workflow |
| 4 | Org preflight weekly | ✅ workflow |
| 5 | Maintainer status weekly | ✅ workflow |
| 6 | `check-v19-readiness` aggregator | ✅ |

---

## Критерии v1.9.0

- [ ] Documenter MCP block live OR org migration started
- [ ] Typed tool для ≥1 shipped v2 endpoint
- [ ] Promo checklist «Публикация на documenter» complete
- [ ] Закрыты superseded PR (#23–#37, #60) — `npm run check-superseded-prs`

---

## Phase 10 — Python MCP (v2.0, optional)

| # | Задача | Статус |
|---|--------|--------|
| 1 | Python MCP server + bridge ([PR #22](https://github.com/dkanster/samotpravil-mcp/pull/22)) | DRAFT · отдельно от v1.9 |
| 2 | Node SDK parity (typed tools) | ✅ v1.3+ |

Node `samotpravil-mcp` уже покрывает Python SDK через typed tools; отдельный Python MCP — опциональный трек v2.0.
