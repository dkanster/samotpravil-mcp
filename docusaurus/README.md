# Docusaurus — документация СамОтправил API

Статический сайт на [Docusaurus 3](https://docusaurus.io/) из Postman snapshot.

**Live:** https://dkanster.github.io/samotpravil-api-mcp/

---

## Быстрый старт

```bash
# из корня репозитория
npm run docusaurus:install   # один раз
npm run docusaurus:start     # dev → http://localhost:3000
npm run docusaurus           # production build + preview
```

---

## Что генерируется

| Артефакт | Источник | Git |
|----------|----------|-----|
| `docs/overview.mdx` | обзор + MCP-блок | игнорируется, генерируется |
| `static/openapi.yaml` | OpenAPI, полные описания | игнорируется |
| `src/generated/overview.js` | HTML обзора | игнорируется |
| `/reference` | Scalar React по OpenAPI | исходник в `src/pages/reference.jsx` |

Генератор: `scripts/generate-docusaurus-content.mjs` (вызывается через `npm run docusaurus:generate`).

---

## Обновление контента

```bash
npm run sync-docs              # documenter → snapshot
npm run docusaurus:generate    # snapshot → docusaurus/
npm run docusaurus:start
```

После push в `main` сайт пересобирается автоматически (см. `.github/workflows/docusaurus.yml`).

---

## Конфигурация

| Переменная | Default (local) | CI / GitHub Pages |
|------------|-----------------|-------------------|
| `DOCUSAURUS_URL` | `http://localhost:3000` | `https://dkanster.github.io` |
| `DOCUSAURUS_BASE_URL` | `/` | `/samotpravil-api-mcp/` |

Файл: `docusaurus.config.js`.

---

## Структура

```
docusaurus/
├── docusaurus.config.js    # title, navbar, baseUrl
├── sidebars.js             # Обзор + ссылка на API Reference
├── docs/overview.mdx       # генерируется
├── src/
│   ├── components/OverviewContent/
│   ├── pages/reference.jsx # Scalar API Reference
│   └── css/custom.css
└── static/openapi.yaml     # генерируется
```

---

## Деплой

GitHub Actions: `.github/workflows/docusaurus.yml`

Триггеры: push в `main` (paths filter), `workflow_dispatch`.

Первый раз: **Settings → Pages → Source: GitHub Actions**.

Подробнее: [docs/DOCS_SITE.md](../docs/DOCS_SITE.md).

---

## Сравнение с `site/` (Scalar HTML)

| | `site/` | Docusaurus |
|--|---------|------------|
| Стек | plain HTML + CDN Scalar | React + Docusaurus + Scalar npm |
| Деплой | вручную | GitHub Pages CI |
| Расширение | вручную | MDX, плагины, версии, поиск |

Оба — preview POC; канон: Postman → documenter → `sync-docs`.
