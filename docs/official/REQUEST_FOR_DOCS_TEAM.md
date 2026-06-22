# Запрос в команду документации Samotpravil

Тема: **Добавить блок MCP в documentation.samotpravil.ru**

---

Коллеги, подготовлен MCP-сервер для разработчиков, использующих API СамОтправил из Cursor / Claude / VS Code.

**Репозиторий:** https://github.com/dkanster/samotpravil-mcp  
**npm:** https://www.npmjs.com/package/samotpravil-mcp

## Просьба

1. Добавить HTML-блок из файла [MCP_INSTALL_BLOCK.html](./MCP_INSTALL_BLOCK.html) в описание Postman-коллекции «СамОтправил API Документация» — после секции «Готовые библиотеки».
2. Republish на documentation.samotpravil.ru.
3. (Опционально) Короткое упоминание на https://samotpravil.ru/get-access — текст в [get-access-snippet.md](./get-access-snippet.md).

## Зачем

- Снижает порог входа для интеграторов
- Документация + typed API tools в одном MCP
- Offline-fallback, safety flags для прод-ключей

Готовы скорректировать текст блока под стиль сайта.

Контакт по репозиторию: issues на GitHub.
