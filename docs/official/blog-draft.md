# Черновик: MCP для API СамОтправил

**Заголовок:** MCP-сервер СамОтправил: API в Cursor и Claude за 3 минуты

**Аудитория:** разработчики, интеграторы SaaS

---

Если вы подключаете SMTP или HTTP API СамОтправил, теперь не нужно вручную копировать эндпоинты из документации в чат с AI.

Мы опубликовали **samotpravil-mcp** — MCP-сервер вокруг [documentation.samotpravil.ru](https://documentation.samotpravil.ru/).

## Что умеет

- Искать методы и параметры API (55+ HTTP-эндпоинтов в snapshot)
- **58 MCP tools** + **9 resources** + **5 prompts**
- Работать offline — snapshot документации в пакете
- Typed tools: отправка, пакеты, стоп-листы, статус, WhiteLabel, Python SDK parity
- Safety: read-only режим, HTTP auth, `dry_run` перед реальной отправкой
- MCP Resources: обзор, лимиты, API wishlist, миграция v1→v2

## Быстрый старт

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

В Cursor: Settings → MCP → Reload.

## Ссылки

- GitHub: https://github.com/dkanster/samotpravil-api-mcp
- npm: https://www.npmjs.com/package/samotpravil-mcp
- Получить API-ключ: https://samotpravil.ru/get-access

---

*Примечание для редактора: после создания org Samotpravil обновить ссылки на GitHub/npm.*
