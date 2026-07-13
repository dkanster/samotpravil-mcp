# Release merge strategy: v1.7.0

Единая стратегия публикации всех улучшений v1.4–v1.7 одним merge в `main`.

## Рекомендуемый путь

**Один PR** → squash merge → tag `v1.7.0` → npm publish.

| PR | Статус | Действие |
|----|--------|----------|
| #23 v1.4.0 | superseded | Закрыть после merge unified PR |
| #24 v1.5.0 | superseded | Закрыть |
| #25 v1.6.0 | superseded | Закрыть |
| #37 v1.7.0 | superseded | Закрыть |
| **Unified release PR** | **использовать** | Merge в `main` |

## Почему один PR

- 4 feature-ветки — линейная цепочка (4 коммита), без конфликтов
- Squash в один коммит упрощает историю `main` и changelog
- Один npm publish: `samotpravil-mcp@1.7.0` вместо 1.4→1.5→1.6→1.7

## Merge в GitHub UI

1. Открыть unified release PR
2. **Squash and merge** (не merge commit — иначе 4 коммита в main)
3. Удалить feature-ветки

## После merge

```bash
git checkout main && git pull
npm run release-prepare
git tag v1.7.0
git push origin v1.7.0
```

Workflows: `Publish npm` → `Publish MCP Registry`.

## Secrets (проверить до tag)

- `NPM_TOKEN` — обязателен
- `SAMOTPRAVIL_API_KEY` — опционально (probe workflow)

## Откат

Если publish failed:

```bash
npm deprecate samotpravil-mcp@1.7.0 "publish failed, use previous"
git tag -d v1.7.0 && git push origin :refs/tags/v1.7.0
```

Interim `samotpravil-mcp@1.3.2` на npm остаётся доступным.

## Что входит в v1.7.0 (сводка)

| Версия | Блок |
|--------|------|
| 1.4.0 | Dependabot, SECURITY, ESLint, unit tests, annotations, Docker, HTTP auth |
| 1.5.0 | probe workflow, tools.manifest, MCP integration test, HTTP JSON logs |
| 1.6.0 | org migration prep, promo checklist, v1→v2 guide, api-wishlist resource |
| 1.7.0 | tool-catalog codegen, SDK parity checks, release-prepare |

Полный changelog: [CHANGELOG.md](../CHANGELOG.md) секции 1.4.0–1.7.0.
