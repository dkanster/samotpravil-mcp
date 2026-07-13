# Release checklist: v1.9.0

Чеклист публикации `samotpravil-mcp@1.9.0` — promo, org, upstream product sync.

**Базовая версия:** 1.8.0  
**Roadmap:** [ROADMAP_v1.9.md](./ROADMAP_v1.9.md)

---

## Критерии готовности (все или согласованное исключение)

| # | Критерий | Проверка |
|---|----------|----------|
| 1 | Documenter MCP block live **или** org migration started | [#51](https://github.com/dkanster/samotpravil-mcp/issues/51) / [#65](https://github.com/dkanster/samotpravil-mcp/issues/65) |
| 2 | Typed tool для ≥1 shipped v2 endpoint | `npm run check-scaffold-ship` |
| 3 | Promo checklist «Публикация на documenter» | `npm run check-promo-checklist` |
| 4 | Superseded PR закрыты | `npm run check-superseded-prs` → OK |
| 5 | Решение по именованию A/B/C | ✅ variant C — [REPO_NAMING.md](./REPO_NAMING.md) |

---

## Pre-flight

```bash
npm run maintainer-status
npm run release-prepare
npm run check-superseded-prs
npm run org-migration-preflight
npm run check-v19-readiness
```

Maintainer cleanup (если `check-superseded-prs` падает):

```bash
bash scripts/maintainer-pr-cleanup.sh | grep '^gh pr' | bash
npm run promo-handoff   # handoff для docs team (#51)
```

---

## Release Please / version bump

Release Please создаёт PR с bump версии и CHANGELOG. Альтернатива — ручной bump:

```bash
# после merge release-please PR или вручную:
npm run sync-versions
npm test
```

---

## Tag и publish

```bash
git tag v1.9.0
git push origin v1.9.0
```

Workflows: `publish.yml` → `mcp-registry.yml` → `post-release.yml`

---

## Post-publish

```bash
npm run verify-publish -- 1.9.0
npx -y samotpravil-mcp@1.9.0
npm run check-promo-versions
```

---

## Ожидаемое содержание 1.9.0

| Область | Изменения |
|---------|-----------|
| Promo | documenter HTML live, handoff tooling |
| Org | naming decision, preflight runbook progress |
| Upstream | ≥1 typed v2 tool shipped (если endpoint в snapshot) |
| Maintainer | plan-rename, promo-handoff, superseded PR tracker, weekly status |

---

## После publish

- [ ] GitHub Release `v1.9.0`
- [ ] npm `samotpravil-mcp@1.9.0`
- [ ] MCP Registry обновлён
- [ ] Promo checklist complete
- [ ] ROADMAP_v1.9 критерии отмечены
