# Release checklist: v1.7.0

Чеклист публикации interim-пакета `samotpravil-mcp@1.7.0`.

**Merge strategy:** один squash-merge PR — см. [RELEASE_MERGE.md](./RELEASE_MERGE.md).

## Pre-flight

```bash
npm run release-prepare
```

Должно пройти: `sync-versions`, `pre-publish-check`, `npm test`.

## GitHub Secrets

| Secret | Назначение |
|--------|------------|
| `NPM_TOKEN` | npm publish (Automation token) |
| `SAMOTPRAVIL_API_KEY` | optional: nightly probe workflow |

## Tag и publish

```bash
git tag v1.7.0
git push origin v1.7.0
```

Автоматически:

1. `.github/workflows/publish.yml` → npm
2. `.github/workflows/mcp-registry.yml` → MCP Registry (после npm)
3. `.github/workflows/post-release.yml` → verify npm + MCP Registry (on `release: published`)

## Post-publish verification

```bash
npm run verify-publish -- 1.7.0
# или вручную:
npm view samotpravil-mcp@1.7.0 version
npx -y samotpravil-mcp@1.7.0
curl -s "https://registry.modelcontextprotocol.io/v0.1/servers?search=samotpravil-mcp" | head -c 400
```

Ручной запуск workflow: **Actions → Post-release verify → Run workflow** (version: `1.7.0`).

## После publish

- [ ] Обновить [PROMO_CHECKLIST.md](./official/PROMO_CHECKLIST.md) (npm version)
- [ ] Smithery rebuild (если подключён)
- [ ] Закрыть milestone v1.7.0 issues

## Цепочка PR перед release

Используйте **единый release PR** (squash merge). PR #23–#25, #37 — superseded.

См. [RELEASE_MERGE.md](./RELEASE_MERGE.md).
