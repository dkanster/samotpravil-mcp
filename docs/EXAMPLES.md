# Примеры: конфигурация и сценарии

Рекомендуемый способ — **`npx`** (без clone и `setup.sh`).

- **Документация** (tools + resources) — без API-ключа
- **Typed API** — нужен `SAMOTPRAVIL_API_KEY`

Получить ключ: https://samotpravil.ru/get-access

> После создания org Samotpravil пакет переедет на `@samotpravil/mcp` — см. [ORG_MIGRATION.md](./ORG_MIGRATION.md).

---

## Конфигурация MCP

### Cursor

Файл: `.cursor/mcp.json` в корне проекта (или Settings → MCP).

**Только документация:**

```json
{
  "mcpServers": {
    "samotpravil": {
      "command": "npx",
      "args": ["-y", "samotpravil-mcp@latest"]
    }
  }
}
```

**С API и safety preset:**

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
        "SAMOTPRAVIL_DOCS_MODE": "auto"
      }
    }
  }
}
```

После правок: **Settings → MCP → Reload**.

### Swagger-MCP (OpenAPI tooling)

Для генерации MCP tool definitions из OpenAPI — [Vizioz/Swagger-MCP](https://github.com/Vizioz/Swagger-MCP):

```bash
npm run prepare-swagger-mcp   # clone + build (один раз)
```

Локальная разработка (через `setup.sh`):

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

Спецификация берётся из `data/openapi.yaml` (или SwaggerHub, если настроен `.env.swaggerhub`). См. **[docs/SWAGGERHUB.md](./SWAGGERHUB.md)**.

### Postman MCP Server

[Postman MCP Server](https://www.postman.com/product/mcp-server/) даёт агенту доступ к коллекциям, workspace, environments и Postman API. Полезно вместе с Samotpravil MCP для синхронизации документации и коллекций.

Как это соотносится с `samotpravil-mcp` и OpenAPI: **[ECOSYSTEM.md](./ECOSYSTEM.md)**.

**Локально (через `setup.sh`):**

```json
{
  "mcpServers": {
    "postman": {
      "command": ".cursor/postman-mcp.sh",
      "args": []
    }
  }
}
```

Ключ — в `.env.postman` (шаблон: `.env.postman.example`). Получить: https://go.postman.co/settings/me/api-keys

**Через npx (без clone):**

```json
{
  "mcpServers": {
    "postman": {
      "command": "npx",
      "args": ["-y", "@postman/postman-mcp-server", "--code"],
      "env": {
        "POSTMAN_API_KEY": "your_postman_api_key_here"
      }
    }
  }
}
```

Режимы: без флага — `minimal`, `--code` — поиск API и генерация клиента, `--full` — все инструменты. В `.env.postman` можно задать `POSTMAN_MCP_MODE=code|minimal|full`.

**Remote (OAuth, без API key в конфиге):**

```json
{
  "mcpServers": {
    "postman": {
      "url": "https://mcp.postman.com/code"
    }
  }
}
```

Для EU с API key: `https://mcp.eu.postman.com/code` и заголовок `Authorization: Bearer <POSTMAN_API_KEY>`.

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

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

### VS Code (Copilot MCP)

`.vscode/mcp.json`:

```json
{
  "servers": {
    "samotpravil": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "samotpravil-mcp@latest"],
      "env": {
        "SAMOTPRAVIL_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Локальная разработка

```json
{
  "mcpServers": {
    "samotpravil": {
      "command": "node",
      "args": ["/absolute/path/to/samotpravil-mcp/dist/index.js"],
      "env": {
        "SAMOTPRAVIL_API_KEY": "your_api_key_here",
        "SAMOTPRAVIL_DOCS_MODE": "snapshot"
      }
    }
  }
}
```

---

## Сценарий 1: Отправка транзакционного письма

**Цель:** отправить одно письмо через API v1 с трекингом.

**Шаги для агента:**

1. Прочитать resource `samotpravil://integration` (X-Track-ID, track_open)
2. Уточнить `email_from`, `email_to`, `subject`, HTML-тело
3. Вызвать tool `send_email` с `dry_run: true` — проверить payload
4. Убрать `dry_run` и отправить (нужен `SAMOTPRAVIL_ALLOW_SEND` ≠ 0)

**Пример параметров `send_email`:**

```json
{
  "dry_run": true,
  "email_from": "My App <noreply@yourdomain.ru>",
  "email_to": "user@example.com",
  "subject": "Заказ #123 подтверждён",
  "message_text": "<p>Спасибо за заказ!</p>",
  "x_track_id": "login-1719000000-order-123",
  "track_open": true,
  "track_click": true,
  "track_domain": "track.samotpravil.ru"
}
```

**Промпт в чате:**

> Найди в документации параметры smtp_send и подготовь dry_run отправку письма с темой «Тест» на test@example.com

---

## Сценарий 2: Стоп-лист

**Цель:** проверить, есть ли адрес в стоп-листе, и при необходимости удалить.

**Шаги:**

1. `search_stop_list` с `email`
2. При необходимости `remove_stop_list_email` с `mail_from` и `email`
3. Для добавления — `add_stop_list_email`

**Промпт:**

> Проверь, есть ли user@example.com в стоп-листе. Если да — покажи результат и объясни ошибку 550 bounced check filter

**Resource:** `samotpravil://errors` — расшифровка 550.

---

## Сценарий 3: Статус доставки

**Цель:** узнать, доставлено ли письмо по `x_track_id`.

**Шаги:**

1. `get_delivery_status` с `x_track_id` из вашей отправки
2. Для пакетной рассылки — `get_package_status` с `issuen`

**Промпт:**

> Покажи статус доставки для x_track_id `1234-1719000000-campaign-1` (только GET, read-only)

С `SAMOTPRAVIL_READ_ONLY=1` агент не сможет случайно отправить письмо.

---

## MCP Resources (без tools)

Агент может читать напрямую:

| URI | Когда использовать |
|-----|-------------------|
| `samotpravil://overview` | Первое знакомство с API |
| `samotpravil://endpoints` | Найти нужный метод |
| `samotpravil://endpoint/smtp_send` | Детали одного метода |
| `samotpravil://errors` | Разбор bounce / 429 |
| `samotpravil://integration` | SMTP, трекинг, лимиты |

---

## Переменные окружения

| Variable | Default | Описание |
|----------|---------|----------|
| `SAMOTPRAVIL_API_KEY` | — | Ключ API |
| `SAMOTPRAVIL_READ_ONLY` | off | Только GET/HEAD |
| `SAMOTPRAVIL_ALLOW_SEND` | on | Блок send/package |
| `SAMOTPRAVIL_DOCS_MODE` | `auto` | `live` \| `snapshot` \| `auto` |

---

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| MCP не стартует | Node ≥ 18, `node -v` |
| `npx` долго первый раз | Нормально — скачивается пакет |
| `SAMOTPRAVIL_API_KEY не задан` | Нужен для typed tools и `api_request` |
| Документация не грузится | `SAMOTPRAVIL_DOCS_MODE=snapshot` (offline) |
| Отправка заблокирована | `SAMOTPRAVIL_ALLOW_SEND=0` — снимите или используйте `dry_run` |
| Старый кэш npx | `npx -y samotpravil-mcp@1.0.4` |

---

## Дополнительно

- [CONTRIBUTING.md](../CONTRIBUTING.md) — разработка и PR
- [PUBLISH.md](./PUBLISH.md) — релиз в npm
- [ROADMAP.md](./ROADMAP.md) — план v1.1
