# Release checklist: v1.8.0

Чеклист публикации `samotpravil-mcp@1.8.0` (post-v1.7.0 maintenance release).

## Pre-flight

```bash
npm run release-prepare
```

## Tag и publish

```bash
git tag v1.8.0
git push origin v1.8.0
```

Workflows: `publish.yml` → `mcp-registry.yml` → `post-release.yml`

## Post-publish

```bash
npm run verify-publish -- 1.8.0
npx -y samotpravil-mcp@1.8.0
```

## Что вошло в 1.8.0

| Область | Изменения |
|---------|-----------|
| Infra | upstream watch, post-release verify, ESLint 10, zod 4 |
| Maintainer | org apply, branch protection docs, PR cleanup script |
| Codegen | snapshot-aware scaffold + `scaffolds/*.ts.stub` |

Полный changelog: [CHANGELOG.md](../CHANGELOG.md#180---2026-07-13)

## После publish

- [x] GitHub Release `v1.8.0` создан
- [x] npm `samotpravil-mcp@1.8.0` опубликован
- [x] MCP Registry обновлён
- [ ] Обновить documenter — [#51](https://github.com/dkanster/samotpravil-api-mcp/issues/51) · `npm run promo-handoff`
- [ ] `npm run check-superseded-prs` — superseded PR

Следующий milestone: [ROADMAP_v1.9.md](./ROADMAP_v1.9.md) · [RELEASE_v1.9.0.md](./RELEASE_v1.9.0.md)
