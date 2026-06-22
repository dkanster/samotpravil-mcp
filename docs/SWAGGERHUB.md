# OpenAPI и SwaggerHub

Спека API генерируется из Postman snapshot (`data/collection.snapshot.json`) и публикуется на [SwaggerHub](https://app.swaggerhub.com).

## Публичная документация

| | URL |
|---|-----|
| Редактор | https://app.swaggerhub.com/apis/mailganer/samotpravil-smtp-api/1.0.0 |
| Каталог | https://catalog.swaggerhub.com/apis/mailganer/samotpravil-smtp-api/1.0.0 |
| Raw OpenAPI (JSON) | https://api.swaggerhub.com/apis/mailganer/samotpravil-smtp-api/1.0.0 |

Локальная копия: `data/openapi.yaml` (~51 операция, OpenAPI 3.0.3).

## Обновление спеки

После изменения Postman-коллекции:

```bash
npm run sync-docs          # подтянуть collection.snapshot.json
npm run export-openapi     # пересобрать data/openapi.yaml
npm run upload-swaggerhub  # опубликовать на SwaggerHub (нужен .env.swaggerhub)
```

`export-openapi` читает snapshot через `dist/docs.js` и `dist/endpointMeta.js` — перед экспортом выполняется `npm run build`.

## Настройка `.env.swaggerhub`

Файл в корне репозитория (в `.gitignore`, не коммитить). Шаблон: [`.env.swaggerhub.example`](../.env.swaggerhub.example).

```bash
cp .env.swaggerhub.example .env.swaggerhub
```

| Переменная | Обязательно | Описание |
|------------|-------------|----------|
| `SWAGGERHUB_API_KEY` | да | [app.swaggerhub.com/settings/apiKey](https://app.swaggerhub.com/settings/apiKey) |
| `SWAGGERHUB_OWNER` | да | Username или org slug (**регистр важен**, напр. `mailganer`, не `Mailganer`) |
| `SWAGGERHUB_API_NAME` | нет | Имя API (default: `samotpravil-smtp-api`) |
| `SWAGGERHUB_VERSION` | нет | Версия (default: `1.0.0`, должна совпадать с `info.version` в YAML) |
| `SWAGGERHUB_IS_PRIVATE` | нет | `true` / `false` (default: `false` — видно в каталоге) |

### Как узнать `SWAGGERHUB_OWNER`

1. **Автоматически** (по API key):

   ```bash
   npm run resolve-swaggerhub-owner
   ```

2. **Вручную** — URL после входа: `https://app.swaggerhub.com/apis/YOUR_USERNAME/...`

3. **Организация** — slug из My Hub в левом сайдбаре (нужны права на создание API).

## Проверка соединения

```bash
npm run check-swaggerhub          # API key + доступ к owner
npm run test-swagger-connection   # SwaggerHub + Swagger-MCP (полный smoke test)
```

Типичные ошибки:

| HTTP | Причина |
|------|---------|
| 401 | Неверный или отозванный API key |
| 403 | Нет прав создавать API под этим owner |
| 404 | Неверный `SWAGGERHUB_OWNER` (часто из‑за регистра букв) |

## Скрипты

| Команда | Скрипт | Назначение |
|---------|--------|------------|
| `npm run export-openapi` | `scripts/export-openapi.mjs` | Postman snapshot → `data/openapi.yaml` |
| `npm run upload-swaggerhub` | `scripts/upload-swaggerhub.mjs` | POST спеки в Registry API |
| `npm run check-swaggerhub` | `scripts/check-swaggerhub.mjs` | Проверка credentials |
| `npm run resolve-swaggerhub-owner` | `scripts/resolve-swaggerhub-owner.mjs` | Список owner'ов по API key |
| `npm run test-swagger-connection` | `scripts/test-swagger-connection.mjs` | SwaggerHub + Swagger-MCP |

Upload использует Registry API:

```
POST https://api.swaggerhub.com/apis/{owner}/{api}?version=…&isPrivate=…&force=true
Authorization: {SWAGGERHUB_API_KEY}
Content-Type: application/yaml
```

## Swagger-MCP

[Swagger-MCP](https://github.com/Vizioz/Swagger-MCP) может брать спецификацию с SwaggerHub, если API публичный и задан `.env.swaggerhub`:

```bash
npm run swagger-mcp
```

Приоритет URL в `scripts/swagger-mcp-launcher.mjs`:

1. `SAMOTPRAVIL_SWAGGER_URL`
2. Публичный SwaggerHub (`SWAGGERHUB_OWNER` + `SWAGGERHUB_API_NAME`)
3. Локальный HTTP → `data/openapi.yaml`

Подробнее: [README — Swagger-MCP](../README.md#swagger-mcp-viziozswagger-mcp).

## Сверка с живым API

Скрипт `scripts/probe-endpoints.mjs` вызывает эндпоинты `api.samotpravil.ru` и сравнивает ответы с примерами из Postman snapshot. Мутирующие и send-операции пропускаются.

```bash
npm run build
node scripts/probe-endpoints.mjs        # человекочитаемый отчёт
node scripts/probe-endpoints.mjs --json # машинный вывод
```

Требует `SAMOTPRAVIL_API_KEY` в `.env.samotpravil`.

## Ограничения экспорта

Текущий `export-openapi.mjs` — базовая конвертация из Postman:

- есть summary, description, query-параметры, схемы тел по полям примеров;
- нет saved responses, примеров ответов и полных JSON Schema;
- версия спеки фиксирована как `1.0.0` (не привязана к дате snapshot).

Улучшения экспорта — в [ROADMAP_v1.2.md](./ROADMAP_v1.2.md).
