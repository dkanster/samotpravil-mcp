# Release Please

Автоматические release PR и версионирование через [release-please](https://github.com/googleapis/release-please).

**Конфиг:** `.github/release-please-config.json` · **Manifest:** `.github/.release-please-manifest.json`

## Как работает

1. Push в `main` → workflow `.github/workflows/release-please.yml`
2. Release Please открывает/обновляет PR `chore(main): release X.Y.Z`
3. Merge release PR → тег + GitHub Release (если настроен `release-type: node`)

## Обязательная настройка репозитория

GitHub **Settings → Actions → General → Workflow permissions**:

- ☑ **Read and write permissions**
- ☑ **Allow GitHub Actions to create and approve pull requests**

Без второго пункта:

```
release-please failed: GitHub Actions is not permitted to create or approve pull requests
```

Ветка `release-please--branches--main--components--samotpravil-mcp` обновляется, но PR не создаётся.

## Ручное создание release PR

Если workflow не смог открыть PR:

```bash
git fetch origin release-please--branches--main--components--samotpravil-mcp
gh pr create \
  --base main \
  --head release-please--branches--main--components--samotpravil-mcp \
  --title "chore(main): release 1.8.0" \
  --body "Release Please — см. CHANGELOG.md в ветке."
```

## После merge release PR

```bash
npm run check-v19-readiness    # gate перед tag v1.9+
npm run release-prepare
git pull --tags
npm run verify-publish -- <version>
```

Или дождаться tag push → `publish.yml` → `mcp-registry.yml` → `post-release.yml`.

## Ручной релиз (без Release Please)

См. [RELEASE_v1.7.0.md](./RELEASE_v1.7.0.md) — tag + push остаётся fallback.
