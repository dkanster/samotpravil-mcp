# Миграция на org Samotpravil

> **Статус:** org на GitHub **ещё не создан**. Репозиторий и npm временно под аккаунтом `dkanster`.

Целевое состояние:

| Ресурс | Сейчас | После миграции |
|--------|--------|----------------|
| GitHub | [dkanster/samotpravil-api-mcp](https://github.com/dkanster/samotpravil-api-mcp) | `samotpravil/samotpravil-mcp` |
| npm | `samotpravil-mcp` | `@samotpravil/mcp` |
| Документация | README + ROADMAP | + ссылка на org в official docs |

---

## Checklist: GitHub org

- [ ] Создать org **Samotpravil** на GitHub (или согласовать slug, например `samotpravil-ru`)
- [ ] Добавить maintainers (dev + marketing для docs)
- [ ] Transfer repository: Settings → Transfer ownership → org
- [ ] Обновить CI badges, `repository` в `package.json`, homepage
- [ ] Настроить branch protection на `main`
- [ ] Перенести GitHub Project «Samotpravil MCP v1.1» в org
- [ ] Redirect: в README dkanster fork оставить ссылку «Moved to org» (опционально)

---

## Checklist: npm

- [ ] Создать npm org `@samotpravil`
- [ ] Опубликовать `@samotpravil/mcp`
- [ ] Deprecate message на `samotpravil-mcp` → «use @samotpravil/mcp»
- [ ] Обновить примеры `mcp.json` и README

---

## Checklist: документация и промо

- [ ] Ссылка в [documentation.samotpravil.ru](https://documentation.samotpravil.ru/) → org repo + npm
- [ ] Заметка на samotpravil.ru / get-access
- [ ] Обновить install snippet после смены npm scope

---

## Interim (пока org нет)

- Issues и milestones ведём в `dkanster/samotpravil-api-mcp`
- npm v1.x можно публиковать как `samotpravil-mcp` без scope
- В README явно указано: «скоро переезд в org Samotpravil»
- Milestone [Future](https://github.com/dkanster/samotpravil-api-mcp/milestone/9) — задачи миграции

**Инструменты подготовки (v1.6+):**

```bash
npm run check-org-migration   # interim state OK
npm run plan-org-migration    # dry-run замен (вариант C — org)
npm run plan-rename           # dry-run rename (вариант B — PR #64)
```

- `npm run org-handoff` — handoff comment для [#65](https://github.com/dkanster/samotpravil-api-mcp/issues/65)

**Именование:** принят **вариант C** (org) — см. **[REPO_NAMING.md](./REPO_NAMING.md)**. PR #64 закрыт.

Runbook: **[ORG_MIGRATION_RUNBOOK.md](./ORG_MIGRATION_RUNBOOK.md)** · будущий MCP config: [`mcp.json.example.org`](../mcp.json.example.org)

---

## Связанные issues

Фильтр: [label:org-migration](https://github.com/dkanster/samotpravil-api-mcp/issues?q=label%3Aorg-migration)
