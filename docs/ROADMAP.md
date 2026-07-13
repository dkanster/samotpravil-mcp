# Roadmap: samotpravil-mcp v1.1

План улучшений MCP для внешних разработчиков и внутренней команды Mailganer/Samotpravil.

**Текущий хостинг:** [dkanster/samotpravil-api-mcp](https://github.com/dkanster/samotpravil-api-mcp)  
**Целевой хостинг:** org `Samotpravil` на GitHub + npm scope `@samotpravil` (org ещё не создан — см. [ORG_MIGRATION.md](./ORG_MIGRATION.md))

**Релиз:** v1.1.0 · горизонт 1–2 недели

---

## GitHub tracking

| Milestone | Срок | Issues |
|-----------|------|--------|
| [Phase 0](https://github.com/dkanster/samotpravil-api-mcp/milestone/1) | 2026-06-23 | Подготовка, roadmap, interim hosting |
| [Phase 1](https://github.com/dkanster/samotpravil-api-mcp/milestone/2) | 2026-06-26 | npm + npx + конфиги IDE |
| [Phase 2](https://github.com/dkanster/samotpravil-api-mcp/milestone/3) | 2026-06-27 | Snapshot + offline fallback |
| [Phase 3](https://github.com/dkanster/samotpravil-api-mcp/milestone/4) | 2026-06-30 | Typed tools + safety |
| [Phase 4](https://github.com/dkanster/samotpravil-api-mcp/milestone/5) | 2026-07-01 | MCP Resources |
| [Phase 5](https://github.com/dkanster/samotpravil-api-mcp/milestone/6) | 2026-07-02 | CONTRIBUTING, EXAMPLES |
| [Phase 6](https://github.com/dkanster/samotpravil-api-mcp/milestone/7) | 2026-07-05 | Ссылка в official docs |
| [v1.1.0](https://github.com/dkanster/samotpravil-api-mcp/milestone/8) | 2026-07-05 | Релиз |
| [Future](https://github.com/dkanster/samotpravil-api-mcp/milestone/9) | — | Org migration, v1.2 |

### GitHub Project

Board: **Samotpravil MCP v1.1** — создайте вручную или через CLI:

```bash
gh auth refresh -s project
gh project create --owner dkanster --title "Samotpravil MCP v1.1"
# Добавить issues: gh project item-add <project-number> --owner dkanster --url <issue-url>
```

### Issues по фазам

| Phase | Issues |
|-------|--------|
| 0 | [#1](https://github.com/dkanster/samotpravil-api-mcp/issues/1), [#5](https://github.com/dkanster/samotpravil-api-mcp/issues/5) |
| 1 | [#6](https://github.com/dkanster/samotpravil-api-mcp/issues/6), [#7](https://github.com/dkanster/samotpravil-api-mcp/issues/7) |
| 2 | [#8](https://github.com/dkanster/samotpravil-api-mcp/issues/8) |
| 3 | [#9](https://github.com/dkanster/samotpravil-api-mcp/issues/9), [#10](https://github.com/dkanster/samotpravil-api-mcp/issues/10) |
| 4 | [#11](https://github.com/dkanster/samotpravil-api-mcp/issues/11) |
| 5 | [#12](https://github.com/dkanster/samotpravil-api-mcp/issues/12) |
| 6 | [#13](https://github.com/dkanster/samotpravil-api-mcp/issues/13) |
| v1.1.0 | [#14](https://github.com/dkanster/samotpravil-api-mcp/issues/14) |
| Future / org | [#2](https://github.com/dkanster/samotpravil-api-mcp/issues/2), [#3](https://github.com/dkanster/samotpravil-api-mcp/issues/3), [#4](https://github.com/dkanster/samotpravil-api-mcp/issues/4) |

---

## API-стратегия

- **Typed tools** для 8–10 частых методов (send, stop-list, status, validate…)
- **`api_request`** остаётся как escape hatch
- **Safety:** `SAMOTPRAVIL_READ_ONLY`, `SAMOTPRAVIL_ALLOW_SEND`, `dry_run`

---

## Фазы (кратко)

### Phase 0 — Подготовка
Roadmap, org migration checklist, interim `dkanster` hosting.

### Phase 1 — Установка за 30 секунд
`npx -y samotpravil-mcp` (позже `@samotpravil/mcp`), README для Cursor / Claude / VS Code.

### Phase 2 — Надёжная документация
`data/collection.snapshot.json`, `npm run sync-docs`, live → snapshot fallback.

### Phase 3 — Typed tools + безопасность
8 typed tools, env flags, понятные ошибки API.

### Phase 4 — MCP Resources
`samotpravil://overview`, `endpoints`, `endpoint/{slug}`, `errors`, `integration`.

### Phase 5 — DX для контрибьюторов
CONTRIBUTING, CHANGELOG, EXAMPLES, issue templates.

### Phase 6 — Официальная интеграция
Ссылка в [documentation.samotpravil.ru](https://documentation.samotpravil.ru/) — материалы: **[docs/official/](./official/)**

---

## v1.2 (по желанию)

См. **[ROADMAP_v1.2.md](./ROADMAP_v1.2.md)** — auto typed tools, MCP Prompts, OpenAPI, `--http`, MCP Registry.

- Typed tools для всех HTTP-методов
- MCP Registry / Smithery
- OpenAPI export
- HTTP transport (`--http`)
- MCP Prompts

---

## Критерии готовности v1.1

- [x] `npx` install в 3 строки
- [x] Документация работает offline
- [x] 8 typed tools + safety flags
- [x] 5 MCP resources
- [x] CI green, CHANGELOG, CONTRIBUTING
- [ ] Ссылка в official docs (или согласованная дата)
