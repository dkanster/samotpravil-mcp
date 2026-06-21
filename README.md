# Samotpravil MCP

[![CI](https://github.com/dkanster/samotpravil-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/dkanster/samotpravil-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

MCP-сервер вокруг [документации API СамОтправил](https://documentation.samotpravil.ru/).

> **Хостинг:** репозиторий временно в [dkanster/samotpravil-mcp](https://github.com/dkanster/samotpravil-mcp).  
> **Планируется:** переезд в org **Samotpravil** на GitHub и npm `@samotpravil/mcp` — см. [docs/ORG_MIGRATION.md](./docs/ORG_MIGRATION.md).

Документация опубликована как Postman Documenter; сервер подтягивает коллекцию с `documentation.samotpravil.ru` и даёт агенту инструменты для поиска методов, параметров и примеров. Опционально — прокси к `api.samotpravil.ru`, если задан API-ключ.

## Roadmap

План v1.1 (milestones, issues, фазы): **[docs/ROADMAP.md](./docs/ROADMAP.md)**

| Milestone | Фокус |
|-----------|--------|
| [Phase 0](https://github.com/dkanster/samotpravil-mcp/milestone/1) | Подготовка, interim hosting |
| [Phase 1–6](https://github.com/dkanster/samotpravil-mcp/milestones) | npm, snapshot, typed tools, resources, docs, promo |
| [v1.1.0](https://github.com/dkanster/samotpravil-mcp/milestone/8) | Релиз |
| [Future](https://github.com/dkanster/samotpravil-mcp/milestone/9) | Org migration, v1.2 |

**GitHub Project:** создайте board «Samotpravil MCP v1.1» — см. [docs/ROADMAP.md#github-project](./docs/ROADMAP.md#github-project).

## Инструменты

| Tool | Нужен ключ | Описание |
|------|------------|----------|
| `get_overview` | нет | Авторизация, SMTP, лимиты, категории |
| `list_endpoints` | нет | Список всех методов API |
| `search_docs` | нет | Поиск по документации |
| `get_endpoint` | нет | Подробности по методу |
| `api_request` | да | HTTP-запрос к API |

## Быстрый старт (рекомендуется)

Добавьте в `.cursor/mcp.json` (или аналог в вашем MCP-клиенте):

```json
{
  "mcpServers": {
    "samotpravil": {
      "command": "npx",
      "args": ["-y", "samotpravil-mcp@latest"],
      "env": {
        "SAMOTPRAVIL_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

`SAMOTPRAVIL_API_KEY` можно опустить, если нужна только документация (без `api_request`).

В Cursor: **Settings → MCP → Reload**.

Подробнее: **[docs/EXAMPLES.md](./docs/EXAMPLES.md)** (Cursor, Claude Desktop, VS Code).

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

Ключ нужен только для `api_request`. Получить доступ: https://samotpravil.ru/get-access

## Локальная разработка

```bash
npm install
npm run build
npm run dev
```

## Источник документации

- Сайт: https://documentation.samotpravil.ru/
- Live JSON: публичный Postman collection endpoint
- **Offline:** bundled snapshot в `data/collection.snapshot.json` (fallback)
- Обновить snapshot: `npm run sync-docs`
- Режим загрузки: `SAMOTPRAVIL_DOCS_MODE=auto` (default) | `live` | `snapshot`
- API base URL: https://api.samotpravil.ru
- SMTP: `api.samotpravil.ru:1126` / `:1127` (TLS)

## Лицензия

MIT
