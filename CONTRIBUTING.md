# Contributing to samotpravil-mcp

Спасибо за интерес к проекту. Репозиторий временно под [dkanster/samotpravil-mcp](https://github.com/dkanster/samotpravil-mcp); после создания org Samotpravil переедет — см. [docs/ORG_MIGRATION.md](./docs/ORG_MIGRATION.md).

## Быстрый старт

```bash
git clone https://github.com/dkanster/samotpravil-mcp.git
cd samotpravil-mcp
npm install
npm test
npm run dev
```

Требования: **Node.js ≥ 18**.

## Структура проекта

```
src/
  index.ts              # MCP server entry, tools registration
  docs.ts               # Postman collection loader, search, format
  client.ts             # HTTP client to api.samotpravil.ru
  safety.ts             # READ_ONLY, ALLOW_SEND, dry_run
  resources.ts          # MCP Resources content
  registerResources.ts  # Resource registration
  tools/
    docs.ts             # Documentation tools
    api.ts              # api_request
    typed.ts            # Typed API tools
data/
  collection.snapshot.json
  snapshot.meta.json
scripts/
  sync-docs.mjs         # Update snapshot from documenter
  check*.mjs            # Offline tests
```

## Что можно улучшить

| Тип | Куда смотреть |
|-----|----------------|
| Новый typed tool | `src/tools/typed.ts`, `src/index.ts` |
| Новый resource | `src/resources.ts`, `src/registerResources.ts` |
| Парсинг документации | `src/docs.ts` |
| Safety / env | `src/safety.ts` |
| Примеры для пользователей | `docs/EXAMPLES.md` |

Перед PR откройте issue или укажите фазу из [docs/ROADMAP.md](./docs/ROADMAP.md).

## Добавить typed tool

1. Добавьте Zod-схему и handler в `src/tools/typed.ts`
2. Зарегистрируйте tool в `src/index.ts`
3. Если endpoint отправляет письма — путь должен попасть в `SEND_PATH_FRAGMENTS` в `src/safety.ts`
4. Обновите README и `docs/EXAMPLES.md` при необходимости
5. `npm test`

## Обновить snapshot документации

Когда изменилась коллекция на documentation.samotpravil.ru:

```bash
npm run sync-docs
git add data/collection.snapshot.json data/snapshot.meta.json
```

В PR укажите `publishDate` и число эндпоинтов из вывода `sync-docs`.

## Тесты

```bash
npm test
```

Включает: shell syntax, TypeScript build, docs helpers, safety, MCP resources (offline на snapshot).

Добавляйте проверки в `scripts/check-*.mjs`, не усложняйте без нужды.

## Стиль кода

- TypeScript strict, ESM (`"type": "module"`)
- Zod для схем tools
- Минимальный diff — не рефакторить несвязанное
- Комментарии только для неочевидной логики
- Сообщения об ошибках на русском (как в API tools)

## Коммиты и версии

[Keep a Changelog](https://keepachangelog.com/) + [SemVer](https://semver.org/):

- **patch** — bugfix, docs
- **minor** — новые tools/resources без breaking changes
- **major** — breaking changes в схемах tools или env

Обновляйте `CHANGELOG.md` и `package.json` version в PR, если меняется публичный API пакета.

## Релиз (maintainers)

См. [docs/PUBLISH.md](./docs/PUBLISH.md):

1. `NPM_TOKEN` в GitHub Secrets
2. Tag `v*`
3. Workflow `publish.yml` публикует в npm

## Issue templates

- **Bug** — воспроизведение, окружение
- **Feature** — фаза roadmap
- **New endpoint** — если в Postman появился новый метод

## Вопросы

- API СамОтправил: https://documentation.samotpravil.ru/
- Доступ к SMTP/API: https://samotpravil.ru/get-access
- Issues: https://github.com/dkanster/samotpravil-mcp/issues
