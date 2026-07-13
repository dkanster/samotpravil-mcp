# Альтернативный сайт документации

Статический preview документации **без Postman Documenter**: генерируется из `data/collection.snapshot.json` в репозитории.

**Production preview (Docusaurus):** https://dkanster.github.io/samotpravil-api-mcp/

---

## Быстрый старт

### Docusaurus (рекомендуется)

```bash
npm run docusaurus:install   # один раз
npm run docusaurus:start     # dev → http://localhost:3000
npm run docusaurus           # build + local preview
```

Подробнее: [docusaurus/README.md](../docusaurus/README.md).

### Scalar HTML (`site/` — минимальный POC)

```bash
npm run docs:build   # → site/
npm run docs:serve   # http://127.0.0.1:8765/
npm run docs         # build + serve
```

---

## Что внутри Docusaurus

| Путь | Содержимое |
|------|------------|
| `/` | Обзор из Postman collection (HTML description + MCP-блок) |
| `/reference` | [Scalar](https://scalar.com/) API Reference по OpenAPI |
| `static/openapi.yaml` | OpenAPI с **полными** описаниями |

Генерируется скриптом `scripts/generate-docusaurus-content.mjs` из того же snapshot, что и `samotpravil-mcp`.

---

## Обновление после правок в Postman

```bash
npm run sync-docs              # documenter → snapshot
npm run docusaurus:generate    # snapshot → docusaurus/
npm run docusaurus:start       # локальная проверка
git add data/collection.snapshot.json
git commit -m "docs: sync snapshot"
git push                       # → автодеплой на GitHub Pages
```

Альтернатива без git: **Actions → Deploy Docusaurus → Run workflow** (пересборка из текущего snapshot в `main`).

---

## Documenter vs static preview

| | Postman Documenter | Docusaurus (GitHub Pages) | `site/` (Scalar HTML) |
|--|-------------------|---------------------------|----------------------|
| URL | documentation.samotpravil.ru | dkanster.github.io/samotpravil-api-mcp | локально |
| Хостинг | Postman | GitHub Pages | любой static host |
| Редактирование | Postman UI | Postman → sync → push | Postman → sync → rebuild |
| Примеры ответов | ✅ богатые | ⚠️ OpenAPI (summary) | ⚠️ OpenAPI (summary) |
| MCP-блок | вручную в Postman | из `docs/official/` | из `docs/official/` |
| Навигация | Documenter | sidebar, navbar, footer | 2 HTML-страницы |
| CI/CD | republish в Postman | `.github/workflows/docusaurus.yml` | вручную |

Это **preview POC** для оценки замены Documenter. Канон по-прежнему: Postman → documenter → `sync-docs`. Для production на своём домене нужно решить: DNS, deep-link'и, SMTP-разделы вне OpenAPI.

---

## Деплой (GitHub Pages)

Автоматически при push в `main`, если менялись snapshot, `docusaurus/`, генератор или связанный код.

Workflow: [.github/workflows/docusaurus.yml](../.github/workflows/docusaurus.yml)

**Первичная настройка репозитория** (один раз):

1. **Settings → Pages → Build and deployment → Source:** GitHub Actions
2. Push workflow в `main` — первый деплой создаст environment `github-pages`

Ручная сборка для другого хоста:

```bash
DOCUSAURUS_URL=https://dkanster.github.io \
DOCUSAURUS_BASE_URL=/samotpravil-api-mcp/ \
npm run docusaurus:build
# артефакт: docusaurus/build/
```

Для корневого домена: `DOCUSAURUS_BASE_URL=/`.

---

## Связанные команды

| Команда | Результат |
|---------|-----------|
| `npm run export-openapi` | OpenAPI в `data/openapi.yaml` (краткие описания, SwaggerHub) |
| `npm run docs:build` | Scalar HTML в `site/` |
| `npm run docusaurus:generate` | контент в `docusaurus/` без сборки |
| `npm run docusaurus:build` | static site в `docusaurus/build/` |
| `npm test` | включает `check-docusaurus.mjs`, если установлен `docusaurus/node_modules` |

---

## Архитектура

```
Postman collection
       ↓ sync-docs / postman_sync_snapshot
data/collection.snapshot.json
       ↓ generate-docusaurus-content.mjs
docusaurus/docs/overview.mdx + static/openapi.yaml
       ↓ docusaurus build
docusaurus/build/  →  GitHub Pages
```

Схема экосистемы: [ECOSYSTEM.md](./ECOSYSTEM.md).
