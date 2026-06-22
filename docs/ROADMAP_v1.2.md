# Roadmap: samotpravil-mcp v1.2

Расширение MCP после v1.1.0. Org migration (`@samotpravil/mcp`) остаётся опциональной — v1.2 можно выпускать с interim-пакетом `samotpravil-mcp`.

**Базовая версия:** 1.1.0 (npm)  
**Целевой релиз:** v1.2.0 · горизонт 2–4 недели

---

## Scope v1.2

| # | Направление | Статус |
|---|-------------|--------|
| 1 | Typed tools для всех HTTP-методов API | ✅ Phase 1 |
| 2 | MCP Prompts (сценарии интеграции) | ✅ Phase 1 |
| 3 | OpenAPI export из Postman snapshot | ✅ Phase 1 |
| 4 | HTTP transport (`--http`) | ✅ Phase 2 |
| 5 | MCP Registry / Smithery metadata | 🚧 Phase 2 (`server.json` готов) |
| 6 | Уникальные slug для endpoint resources | ✅ Phase 1 |

Не входит в v1.2 (Future milestone): GitHub/npm org migration (#2–#4).

---

## Phase 1 — Coverage & DX

### 1.1 Auto typed tools

- Динамическая регистрация tools для всех `api.samotpravil.ru` HTTP-методов, не покрытых ручными typed tools (8 шт.)
- Имена: `api_v1_add_json_package`, `api_v2_issue_ext_status`, …
- Схемы из query URL + `bodyExample` в snapshot
- Safety: `READ_ONLY`, `ALLOW_SEND`, `dry_run` — как у ручных tools

### 1.2 MCP Prompts

- `integration_overview` — обзор SMTP + HTTP + лимиты
- `send_transactional` — чеклист отправки одного письма
- `stop_list_workflow` — поиск / add / remove
- `check_delivery` — статус по X-Track-ID

### 1.3 OpenAPI export

```bash
npm run export-openapi   # → data/openapi.yaml
```

Генерация из `data/collection.snapshot.json` для внешних инструментов и документации.

### 1.4 Endpoint slugs

Уникальные slug для дубликатов (`status`, `fbl`, `unsubscribe`) — полный path-based ключ, обратная совместимость для `smtp_send`.

---

## Phase 2 — Deployment & discovery

### 2.1 HTTP transport

```bash
npx samotpravil-mcp --http --port 3000
# POST http://localhost:3000/mcp  (Streamable HTTP, stateless)
```

Env: `SAMOTPRAVIL_HTTP_PORT` (default 3000).

### 2.2 MCP Registry

- `server.json` в корне репозитория
- Smithery / registry metadata (после стабилизации Phase 1)

---

## Phase 3 — Release v1.2.0

- CHANGELOG, tag `v1.2.0`, npm publish
- README: prompts, `--http`, OpenAPI, полный список tools
- Обновить [docs/EXAMPLES.md](./EXAMPLES.md)

---

## Критерии готовности v1.2

- [x] ≥50 typed/auto tools (8 manual + ~42 auto)
- [x] 4 MCP prompts
- [x] `data/openapi.yaml` генерируется в CI
- [x] `--http` работает локально
- [x] `server.json` для registry
- [ ] CI green, npm `samotpravil-mcp@1.2.0`

---

## Связанные issues

Создайте issues с label `v1.2` или добавьте в milestone «v1.2.0»:

- feat: auto typed tools from snapshot
- feat: MCP prompts
- feat: OpenAPI export
- feat: HTTP transport
- chore: MCP Registry server.json
