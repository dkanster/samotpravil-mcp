# Официальная интеграция MCP в документацию

Материалы для публикации на [documentation.samotpravil.ru](https://documentation.samotpravil.ru/) и samotpravil.ru.

**Статус:** подготовлено в репозитории; публикация на сайте — задача команды документации / маркетинга Samotpravil.

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

- GitHub: https://github.com/dkanster/samotpravil-mcp
- npm: https://www.npmjs.com/package/samotpravil-mcp
- Примеры: https://github.com/dkanster/samotpravil-mcp/blob/main/docs/EXAMPLES.md

> После создания org Samotpravil обновить URL на `github.com/samotpravil/samotpravil-mcp` и `@samotpravil/mcp`.

## Контакты для координации

- Поддержка: support@samotpravil.ru
- Issue в репо: https://github.com/dkanster/samotpravil-mcp/issues/13

## Чеклист публикации

- [ ] HTML-блок в Postman collection description
- [ ] Republish documenter
- [ ] Упоминание на samotpravil.ru/get-access (или blog)
- [ ] `npm run sync-docs` + tag в samotpravil-mcp после публикации
- [ ] Обновить ссылки при переезде в org Samotpravil
