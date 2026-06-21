# Samotpravil MCP

[![CI](https://github.com/dkanster/samotpravil-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/dkanster/samotpravil-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

MCP-сервер вокруг [документации API СамОтправил](https://documentation.samotpravil.ru/).

Документация опубликована как Postman Documenter; сервер подтягивает коллекцию с `documentation.samotpravil.ru` и даёт агенту инструменты для поиска методов, параметров и примеров. Опционально — прокси к `api.samotpravil.ru`, если задан API-ключ.

## Инструменты

| Tool | Нужен ключ | Описание |
|------|------------|----------|
| `get_overview` | нет | Авторизация, SMTP, лимиты, категории |
| `list_endpoints` | нет | Список всех методов API |
| `search_docs` | нет | Поиск по документации |
| `get_endpoint` | нет | Подробности по методу |
| `api_request` | да | HTTP-запрос к API |

## Быстрый старт

```bash
git clone <repo> samotpravil-mcp
cd your-workspace
/path/to/samotpravil-mcp/setup.sh .
```

Или из корня репозитория:

```bash
./setup.sh /path/to/your-project
```

В Cursor: **Settings → MCP → Reload**.

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
- Postman collection JSON: публичный endpoint documenter
- API base URL: https://api.samotpravil.ru
- SMTP: `api.samotpravil.ru:1126` / `:1127` (TLS)

## Лицензия

MIT
