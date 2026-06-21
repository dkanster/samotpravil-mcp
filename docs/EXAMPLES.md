# Примеры конфигурации MCP

Рекомендуемый способ — **`npx`** (без clone и `setup.sh`).

Ключ API нужен только для инструмента `api_request`. Документационные tools работают без ключа.

Получить ключ: https://samotpravil.ru/get-access

> После создания org Samotpravil пакет переедет на `@samotpravil/mcp` — см. [ORG_MIGRATION.md](./ORG_MIGRATION.md).

---

## Cursor

Файл: `.cursor/mcp.json` в корне проекта (или глобально в Cursor Settings → MCP).

### Только документация (без API-ключа)

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

### С API-ключом

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

После правок: **Settings → MCP → Reload**.

---

## Claude Desktop

Файл: `claude_desktop_config.json`

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

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

Перезапустите Claude Desktop.

---

## VS Code (GitHub Copilot MCP)

Файл: `.vscode/mcp.json` в workspace или User settings (MCP section).

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

Требуется VS Code с поддержкой MCP (Copilot). Перезагрузите окно после изменений.

---

## Локальная разработка (из git clone)

Если вы разрабатываете сам пакет или используете `setup.sh`:

```json
{
  "mcpServers": {
    "samotpravil": {
      "command": "node",
      "args": ["/absolute/path/to/samotpravil-mcp/dist/index.js"],
      "env": {
        "SAMOTPRAVIL_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Или через launcher после `./setup.sh .`:

```json
{
  "mcpServers": {
    "samotpravil": {
      "command": ".cursor/samotpravil-mcp.sh",
      "args": []
    }
  }
}
```

---

## Проверка

Примеры запросов в чате:

- «Покажи обзор API СамОтправил»
- «Найди документацию по smtp_send»
- «Какие параметры у stop-list search?»

С ключом:

- «Проверь статус доставки для x_track_id …» (через `api_request` или будущие typed tools)

---

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| MCP не стартует | Node.js ≥ 18, `node -v` |
| `npx` долго первый раз | Нормально — скачивается пакет |
| `SAMOTPRAVIL_API_KEY не задан` | Только для `api_request`; docs tools работают без ключа |
| Старый кэш npx | `npx -y samotpravil-mcp@1.0.1` с явной версией |
