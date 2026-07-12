# Promo checklist: MCP в official docs

Статус-борд для команды Samotpravil / maintainers репозитория.

**Материалы:** [docs/official/](./official/) · **Runbook org:** [ORG_MIGRATION_RUNBOOK.md](../ORG_MIGRATION_RUNBOOK.md)

---

## До публикации на documenter

| # | Задача | Owner | Статус |
|---|--------|-------|--------|
| 1 | HTML-блок `MCP_INSTALL_BLOCK.html` актуален (версия, npm, safety) | maintainer | ✅ |
| 2 | `npm test` green на `main` | maintainer | ✅ |
| 3 | npm publish актуальной версии | maintainer | ⏳ |
| 4 | MCP Registry entry visible | maintainer | ✅ |
| 5 | Issue/запрос в docs team ([REQUEST_FOR_DOCS_TEAM.md](./REQUEST_FOR_DOCS_TEAM.md)) | maintainer | ⏳ |

---

## Публикация на documentation.samotpravil.ru

| # | Задача | Owner | Статус |
|---|--------|-------|--------|
| 1 | Вставить HTML после «Готовые библиотеки» в Postman collection | docs team | ⏳ |
| 2 | Republish documenter | docs team | ⏳ |
| 3 | Проверить блок на live site | docs + maintainer | ⏳ |
| 4 | `npm run sync-docs` после republish | maintainer | ⏳ |
| 5 | PR с обновлённым snapshot (или дождаться weekly workflow) | maintainer | ⏳ |

---

## samotpravil.ru / get-access

| # | Задача | Owner | Статус |
|---|--------|-------|--------|
| 1 | Snippet из [get-access-snippet.md](./get-access-snippet.md) | marketing | ⏳ |
| 2 | Ссылка на GitHub + npm | marketing | ⏳ |
| 3 | (Опционально) blog post [blog-draft.md](./blog-draft.md) | marketing | ⏳ |

---

## После org migration

| # | Задача | Статус |
|---|--------|--------|
| 1 | Обновить URL в HTML-блоке → `samotpravil/samotpravil-mcp` | ⏳ |
| 2 | Заменить `samotpravil-mcp` → `@samotpravil/mcp` в install snippet | ⏳ |
| 3 | Republish documenter повторно | ⏳ |

---

## Как отметить прогресс

1. Создайте issue с label `docs-promo` или используйте template **Docs promo**.
2. При republish — укажите `publishDate` из `snapshot.meta.json` в комментарии к issue.
3. Закройте issue когда все пункты «Публикация на documenter» выполнены.
