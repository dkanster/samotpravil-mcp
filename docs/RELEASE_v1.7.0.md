# Release checklist: v1.7.0

Чеклист публикации interim-пакета `samotpravil-mcp@1.7.0`.

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

## Post-publish verification

```bash
npm view samotpravil-mcp@1.7.0 version
npx -y samotpravil-mcp@1.7.0
curl -s "https://registry.modelcontextprotocol.io/v0.1/servers?search=samotpravil-mcp" | head -c 400
```

## После publish

- [ ] Обновить [PROMO_CHECKLIST.md](./official/PROMO_CHECKLIST.md) (npm version)
- [ ] Smithery rebuild (если подключён)
- [ ] Закрыть milestone v1.7.0 issues

## Цепочка PR перед release

Рекомендуемый merge order:

1. #23 — v1.4.0 infra
2. #24 — v1.5.0 probe/manifest
3. #25 — v1.6.0 org prep
4. #26 — v1.7.0 codegen (этот release)

Или squash-merge одного объединённого PR, затем tag `v1.7.0`.
