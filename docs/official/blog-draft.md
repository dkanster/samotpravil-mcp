# Черновик: MCP для API СамОтправил

**Заголовок:** MCP-сервер СамОтправил: API в Cursor и Claude за 3 минуты

**Аудитория:** разработчики, интеграторы SaaS

---

Если вы подключаете SMTP или HTTP API СамОтправил, теперь не нужно вручную копировать эндпоинты из документации в чат с AI.

Мы опубликовали **samotpravil-mcp** — MCP-сервер вокруг [documentation.samotpravil.ru](https://documentation.samotpravil.ru/).

## Что умеет

- Искать методы и параметры API (55 эндпоинтов)
- Работать offline — snapshot документации в пакете
- Typed tools: отправка письма, стоп-листы, статус доставки, валидация email
- Safety: read-only режим и `dry_run` перед реальной отправкой
- MCP Resources: обзор, ошибки, гайд по интеграции

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

- GitHub: https://github.com/dkanster/samotpravil-mcp
- npm: https://www.npmjs.com/package/samotpravil-mcp
- Получить API-ключ: https://samotpravil.ru/get-access

---

*Примечание для редактора: после создания org Samotpravil обновить ссылки на GitHub/npm.*
