# Roadmap: samotpravil-mcp v1.4

План после v1.3.x: инфраструктура репозитория, безопасность HTTP-режима, org migration и promo.

**Базовая версия:** 1.3.2  
**Целевой релиз:** v1.4.0

---

## Phase 1 — Repository hygiene (v1.4.0)

| # | Задача | Статус |
|---|--------|--------|
| 1 | Dependabot (npm + GitHub Actions) | ✅ |
| 2 | `SECURITY.md` | ✅ |
| 3 | `CODEOWNERS` | ✅ |
| 4 | ESLint + `npm run lint` в CI | ✅ |
| 5 | Unit-тесты `node:test` (safety, redact, endpointMeta) | ✅ |
| 6 | CI: openapi drift, snapshot age warning, npm audit | ✅ |
| 7 | Scheduled `sync-docs` workflow | ✅ |
| 8 | MCP Tool Annotations (`readOnlyHint`, `destructiveHint`) | ✅ |
| 9 | HTTP auth token (`SAMOTPRAVIL_HTTP_AUTH_TOKEN`) | ✅ |
| 10 | Docker image для `--http` | ✅ |
| 11 | `scripts/sync-versions.mjs` (package.json → server.json) | ✅ |
| 12 | MCP Resources: `sdk-mapping`, `changelog` | ✅ |
| 13 | Pre-commit hook (`.githooks/pre-commit`) | ✅ |

---

## Phase 2 — Discovery & official integration

| # | Задача | Статус |
|---|--------|--------|
| 1 | Ссылка MCP в [documentation.samotpravil.ru](https://documentation.samotpravil.ru/) | ⏳ blocked (docs team) |
| 2 | GitHub org **Samotpravil** + `@samotpravil/mcp` | ⏳ blocked (org) |
| 3 | Branch protection на `main` | ⏳ after org |
| 4 | Nightly `probe-endpoints` (optional, with API key secret) | ✅ |

Материалы для docs team: [docs/official/](./official/)  
Чеклист org: [ORG_MIGRATION.md](./ORG_MIGRATION.md)

---

## Phase 3 — DX & codegen (v1.5)

| # | Задача | Статус |
|---|--------|--------|
| 1 | `data/tools.manifest.json` — codegen typed tools из snapshot | ✅ |
| 2 | MCP integration test (in-process list_tools) | ✅ |
| 3 | Release Please / automated changelog | ✅ |
| 4 | Structured logging для HTTP transport | ✅ |
| 5 | Resource `samotpravil://rate-limits` | ✅ |

---

## Phase 4 — Upstream API (wishlist)

Рекомендации для HTTP API продукта: [API_WISHLIST.md](./API_WISHLIST.md)

Приоритеты для MCP после релиза upstream:

1. Консолидация v2 (`/api/v2/mail/send`, package endpoints)
2. Единый формат ошибок
3. Tickets API v2
4. Webhook/events API

---

## Критерии готовности v1.4

- [x] Dependabot + SECURITY + CODEOWNERS
- [x] ESLint green, unit tests in CI
- [x] OpenAPI drift check in CI
- [x] Tool annotations на всех tools
- [x] HTTP auth для non-localhost deploy
- [x] Dockerfile + docs
- [x] 7 MCP resources
- [ ] npm publish `samotpravil-mcp@1.4.0`

---

## Связанные milestones

- [Future](https://github.com/dkanster/samotpravil-mcp/milestone/9) — org migration
- Создать milestone **v1.4.0** для оставшихся publish-задач
