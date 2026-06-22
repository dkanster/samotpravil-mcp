# Samotpravil MCP

[![CI](https://github.com/dkanster/samotpravil-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/dkanster/samotpravil-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

MCP-сервер вокруг [документации API СамОтправил](https://documentation.samotpravil.ru/).

> **Хостинг:** репозиторий временно в [dkanster/samotpravil-mcp](https://github.com/dkanster/samotpravil-mcp).  
> **Планируется:** переезд в org **Samotpravil** на GitHub и npm `@samotpravil/mcp` — см. [docs/ORG_MIGRATION.md](./docs/ORG_MIGRATION.md).

Документация опубликована как Postman Documenter; сервер подтягивает коллекцию с `documentation.samotpravil.ru` и даёт агенту инструменты для поиска методов, параметров и примеров. Опционально — прокси к `api.samotpravil.ru`, если задан API-ключ.

Как связаны Postman, `samotpravil-mcp`, OpenAPI, swagger-mcp и **static preview на Docusaurus**: **[docs/ECOSYSTEM.md](./docs/ECOSYSTEM.md)** · **[docs/DOCS_SITE.md](./docs/DOCS_SITE.md)** · live: **https://dkanster.github.io/samotpravil-mcp/**

## Roadmap

План v1.1 (milestones, issues, фазы): **[docs/ROADMAP.md](./docs/ROADMAP.md)**  
**v1.2 (в работе):** **[docs/ROADMAP_v1.2.md](./docs/ROADMAP_v1.2.md)** — auto typed tools, prompts, OpenAPI, `--http`

| Milestone | Фокус |
|-----------|--------|
| [Phase 0](https://github.com/dkanster/samotpravil-mcp/milestone/1) | Подготовка, interim hosting |
| [Phase 1–6](https://github.com/dkanster/samotpravil-mcp/milestones) | npm, snapshot, typed tools, resources, docs, promo |
| [v1.1.0](https://github.com/dkanster/samotpravil-mcp/milestone/8) | Релиз |
| [Future](https://github.com/dkanster/samotpravil-mcp/milestone/9) | Org migration |
| **v1.2** | Auto tools, prompts, OpenAPI, HTTP transport |

**GitHub Project:** создайте board «Samotpravil MCP v1.1» — см. [docs/ROADMAP.md#github-project](./docs/ROADMAP.md#github-project).

## Инструменты

### Документация (без API-ключа)

| Tool | Описание |
|------|----------|
| `get_overview` | Авторизация, SMTP, лимиты, категории |
| `list_endpoints` | Список всех методов API |
| `search_docs` | Поиск по документации |
| `get_endpoint` | Подробности по методу |

### Postman / документация (нужен `POSTMAN_API_KEY`)

| Tool | Описание |
|------|----------|
| `postman_get_collection` | Коллекция из Postman API (summary или full) |
| `postman_sync_snapshot` | Postman API → `data/collection.snapshot.json` |
| `postman_diff_snapshot` | Diff Postman vs локальный snapshot |
| `postman_search_requests` | Поиск запросов в Postman-коллекции |

Ключ — в `.env.samotpravil` (или legacy `.env.postman`). Отдельный Postman MCP больше не нужен.

### Typed API (нужен `SAMOTPRAVIL_API_KEY`)

| Tool | Описание |
|------|----------|
| `send_email` | POST `/api/v1/smtp_send` |
| `send_mail_v2` | POST `/api/v2/mail/send` |
| `get_delivery_status` | GET `/api/v2/issue/status` |
| `get_package_status` | GET `/api/v2/package/status` |
| `search_stop_list` | Поиск email в стоп-листах |
| `add_stop_list_email` / `remove_stop_list_email` | Управление стоп-листом |
| `validate_email` | Валидация адреса |
| `list_allowed_domains` | Разрешённые домены |
| `api_request` | Generic escape hatch |
| `api_{method}_{path}` | Auto tools для остальных HTTP-методов (~42), напр. `api_get_v2_issue_ext_status` |

### MCP Prompts

| Prompt | Описание |
|--------|----------|
| `integration_overview` | Обзор SMTP + HTTP + лимиты |
| `send_transactional` | Чеклист отправки письма |
| `stop_list_workflow` | Работа со стоп-листами |
| `check_delivery` | Статус по X-Track-ID / выпуску |

### HTTP transport (v1.2)

```bash
npx samotpravil-mcp --http --port 3000
# POST http://127.0.0.1:3000/mcp
```

### OpenAPI

```bash
npm run export-openapi        # → data/openapi.yaml
npm run upload-swaggerhub     # публикация на SwaggerHub (нужен .env.swaggerhub)
npm run check-swaggerhub      # проверка API key и owner
```

**Опубликовано:** [mailganer/samotpravil-smtp-api@1.0.0](https://app.swaggerhub.com/apis/mailganer/samotpravil-smtp-api/1.0.0) · Подробнее: **[docs/SWAGGERHUB.md](./docs/SWAGGERHUB.md)**

### Static preview (Docusaurus)

Альтернатива Postman Documenter для preview и GitHub Pages — из того же snapshot:

```bash
npm run docusaurus:install   # один раз
npm run docusaurus:start     # http://localhost:3000
```

Live: **https://dkanster.github.io/samotpravil-mcp/** · Подробнее: **[docs/DOCS_SITE.md](./docs/DOCS_SITE.md)**

### Swagger-MCP ([Vizioz/Swagger-MCP](https://github.com/Vizioz/Swagger-MCP))

MCP-сервер для работы с OpenAPI: список эндпоинтов, модели, генерация MCP tool definitions.

```bash
npm run prepare-swagger-mcp   # один раз: clone + build в vendor/swagger-mcp
npm run swagger-mcp           # запуск (stdio)
```

Источник спецификации (по приоритету):

1. `SAMOTPRAVIL_SWAGGER_URL` — явный URL
2. Публичный SwaggerHub (`SWAGGERHUB_OWNER` + `SWAGGERHUB_API_NAME`)
3. Локальный `data/openapi.yaml` (временный HTTP на 127.0.0.1)

**Cursor** — добавьте в `.cursor/mcp.json` (или через `setup.sh`):

```json
{
  "mcpServers": {
    "swagger-mcp": {
      "command": ".cursor/swagger-mcp.sh",
      "args": []
    }
  }
}
```

Инструменты: `listEndpoints`, `listEndpointModels`, `generateModelCode`, `generateEndpointToolCode`.

### Postman (встроено в samotpravil-mcp)

Tools `postman_*` работают в том же MCP-сервере при наличии `POSTMAN_API_KEY` в `.env.samotpravil`. Нужны maintainer'ам для синхронизации коллекции документации с snapshot. Подробнее: **[docs/EXAMPLES.md](./docs/EXAMPLES.md#postman-tools)** и **[docs/ECOSYSTEM.md](./docs/ECOSYSTEM.md)**.

### Безопасность

| Env | Эффект |
|-----|--------|
| `SAMOTPRAVIL_READ_ONLY=1` | Только безопасные GET/HEAD (без отправки и остановки пакетов) |
| `SAMOTPRAVIL_ALLOW_SEND=0` | Блок send/package endpoints |
| `SAMOTPRAVIL_ALLOW_MUTATIONS=0` | Блок stop-list, доменов, authkey и прочих изменений |
| `SAMOTPRAVIL_ALLOW_GENERIC_API=0` | Отключить инструмент `api_request` |
| `SAMOTPRAVIL_HTTP_HOST=127.0.0.1` | Адрес bind для `--http` (по умолчанию localhost) |
| `dry_run: true` | Preview запроса без отправки |

Ответы API с полями `api_key` и query-параметр `key=` автоматически маскируются в выводе MCP.

### MCP Resources (без tool calls)

| URI | Содержимое |
|-----|------------|
| `samotpravil://overview` | Обзор API |
| `samotpravil://endpoints` | Индекс методов |
| `samotpravil://endpoint/{slug}` | Один метод (напр. `smtp_send`) |
| `samotpravil://errors` | Популярные ошибки |
| `samotpravil://integration` | SMTP, X-Track-ID, трекинг |

## Быстрый старт (рекомендуется)

Добавьте в `.cursor/mcp.json` (или аналог в вашем MCP-клиенте):

```json
{
  "mcpServers": {
    "samotpravil": {
      "command": "npx",
      "args": ["-y", "samotpravil-mcp@latest"],
      "env": {
        "SAMOTPRAVIL_API_KEY": "your_api_key_here",
        "SAMOTPRAVIL_READ_ONLY": "1",
        "SAMOTPRAVIL_ALLOW_SEND": "0",
        "SAMOTPRAVIL_ALLOW_MUTATIONS": "0",
        "SAMOTPRAVIL_ALLOW_GENERIC_API": "0"
      }
    }
  }
}
```

`SAMOTPRAVIL_API_KEY` можно опустить для docs-only. Флаги `READ_ONLY` / `ALLOW_SEND` — опционально (безопасный preset выше).

В Cursor: **Settings → MCP → Reload**.

Подробнее: **[docs/EXAMPLES.md](./docs/EXAMPLES.md)** · Официальная публикация: **[docs/official/](./docs/official/)**

### npm

```bash
npx -y samotpravil-mcp@latest
```

Пакет: https://www.npmjs.com/package/samotpravil-mcp (после первого publish — см. [docs/PUBLISH.md](./docs/PUBLISH.md)).

### Из git clone (разработка / fork)

```bash
git clone https://github.com/dkanster/samotpravil-mcp.git
cd your-workspace
/path/to/samotpravil-mcp/setup.sh .
```

## Конфигурация

`.env.samotpravil` в корне проекта (или `ai/.env.samotpravil`):

```env
SAMOTPRAVIL_API_KEY=your_key_here
```

Ключ нужен для typed tools и `api_request`. Docs tools и resources работают без ключа. Получить доступ: https://samotpravil.ru/get-access

**SwaggerHub** (опционально, для `upload-swaggerhub` и Swagger-MCP): скопируйте [`.env.swaggerhub.example`](./.env.swaggerhub.example) → `.env.swaggerhub`. См. [docs/SWAGGERHUB.md](./docs/SWAGGERHUB.md).

## Локальная разработка

```bash
npm install
npm run build
npm run dev
npm test
```

Contributing: **[CONTRIBUTING.md](./CONTRIBUTING.md)** · Сценарии: **[docs/EXAMPLES.md](./docs/EXAMPLES.md)**

## Источник документации

- Сайт: https://documentation.samotpravil.ru/
- Live JSON: публичный Postman collection endpoint
- **Offline:** bundled snapshot в `data/collection.snapshot.json` (fallback)
- Обновить snapshot: `npm run sync-docs`
- OpenAPI: `npm run export-openapi` → `data/openapi.yaml`; публикация — [docs/SWAGGERHUB.md](./docs/SWAGGERHUB.md)
- **Static preview:** `npm run docusaurus:start` → [docs/DOCS_SITE.md](./docs/DOCS_SITE.md) · live: https://dkanster.github.io/samotpravil-mcp/
- Режим загрузки: `SAMOTPRAVIL_DOCS_MODE=auto` (default) | `live` | `snapshot`
- API base URL: https://api.samotpravil.ru
- SMTP: `api.samotpravil.ru:1126` / `:1127` (TLS)

## Лицензия

MIT
