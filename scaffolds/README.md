# Typed tool scaffolds

Generated stubs from `npm run scaffold-typed-tool -- <name> --write`.

**Не компилируются** — copy-paste в `src/tools/sdkTyped.ts` и доработайте вручную.

```bash
npm run build
npm run scaffold-typed-tool -- v2_mail_package --write
```

Файлы обновляйте при изменении upstream wishlist или snapshot.

## Ship workflow (когда endpoint появился в snapshot)

```bash
npm run check-scaffold-ship          # fail если нужен action
npm run scaffold-typed-tool -- <id> --write
# copy scaffolds/<id>.ts.stub → src/tools/sdkTyped.ts
# register in src/registerSdkTypedTools.ts
# bump SDK_TYPED_TOOL_COUNT
npm test
```

Upstream watch создаёт issue автоматически — см. `.github/workflows/upstream-wishlist-watch.yml`.
