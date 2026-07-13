# Release v1.2.1

**Дата:** 2026-07-11  
**npm:** [samotpravil-mcp@1.2.1](https://www.npmjs.com/package/samotpravil-mcp/v/1.2.1)  
**MCP Registry:** `io.github.dkanster/samotpravil-api-mcp`

## Highlights

- Встроенные `postman_*` tools для maintainer'ов документации
- CI green (`check-postman.mjs`)
- Документация синхронизирована с кодом

## Postman tools

При `POSTMAN_API_KEY`:

| Tool | Описание |
|------|----------|
| `postman_get_collection` | Коллекция из Postman API |
| `postman_sync_snapshot` | Запись `data/collection.snapshot.json` |
| `postman_diff_snapshot` | Diff Postman vs snapshot |
| `postman_search_requests` | Поиск в коллекции |

## Публикация на documenter

См. [docs/official/README.md](./official/README.md) — вставить `MCP_INSTALL_BLOCK.html` в Postman collection description.

## Upgrade

```bash
npx -y samotpravil-mcp@1.2.1
```

Cursor: Settings → MCP → Reload.
