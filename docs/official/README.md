# Официальная интеграция MCP в документацию

Материалы для публикации на [documentation.samotpravil.ru](https://documentation.samotpravil.ru/) и samotpravil.ru.

**Статус:** материалы готовы (v1.6+). Публикация HTML на documenter — задача команды Samotpravil.

**Чеклист:** [PROMO_CHECKLIST.md](./PROMO_CHECKLIST.md)

Общая схема: Postman → documenter → snapshot → MCP/OpenAPI — **[../ECOSYSTEM.md](../ECOSYSTEM.md)**.

## Что обновить

| Площадка | Файл | Действие |
|----------|------|----------|
| Postman collection (documenter) | [MCP_INSTALL_BLOCK.html](./MCP_INSTALL_BLOCK.html) | Вставить в `info.description` после блока «Готовые библиотеки» |
| samotpravil.ru / get-access | [get-access-snippet.md](./get-access-snippet.md) | Короткий блок + ссылка |
| Блог (опционально) | [blog-draft.md](./blog-draft.md) | Черновик заметки |

## Как обновить Postman Documenter

1. Открыть коллекцию **«СамОтправил API Документация»** в Postman (workspace Mailganer/Samotpravil).
2. Вкладка **Overview** → Description (HTML).
3. После секции `<h2 id="готовые-библиотеки">` вставить содержимое `MCP_INSTALL_BLOCK.html`.
4. Publish → Custom domain `documentation.samotpravil.ru`.
5. Проверить: на главной странице документации виден блок «MCP для Cursor и Claude».
6. Запустить `npm run sync-docs` в этом репозитории (или дождаться авто-обновления snapshot).

## Ссылки для публикации

- GitHub: https://github.com/dkanster/samotpravil-api-mcp
- npm: https://www.npmjs.com/package/samotpravil-mcp
- Примеры: https://github.com/dkanster/samotpravil-api-mcp/blob/main/docs/EXAMPLES.md

> После создания org Samotpravil обновить URL на `github.com/samotpravil/samotpravil-mcp` и `@samotpravil/mcp`.

## Контакты для координации

- Поддержка: support@samotpravil.ru
- Issue в репо: https://github.com/dkanster/samotpravil-api-mcp/issues/13

## Чеклист публикации

- [x] HTML-блок подготовлен (`MCP_INSTALL_BLOCK.html`, v1.2.1+)
- [x] npm `samotpravil-mcp@1.2.1` опубликован
- [x] MCP Registry: `io.github.dkanster/samotpravil-api-mcp`
- [ ] HTML-блок вставлен в Postman collection description
- [ ] Republish documenter
- [ ] Упоминание на samotpravil.ru/get-access (или blog)
- [ ] `npm run sync-docs` + tag в samotpravil-mcp после публикации на documenter
- [ ] Обновить ссылки при переезде в org Samotpravil
