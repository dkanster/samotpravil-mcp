# Release v1.1.0

## Summary

Первый полнофункциональный релиз samotpravil-mcp для разработчиков и команды Mailganer/Samotpravil.

## Included (Phases 0–6)

- [x] Roadmap, org migration plan (interim: dkanster)
- [x] npm / npx install, IDE config examples
- [x] Postman snapshot + offline fallback
- [x] 9 typed API tools + safety flags
- [x] 5 MCP resources
- [x] CONTRIBUTING, EXAMPLES, issue/PR templates
- [x] Promo pack for documentation.samotpravil.ru

## Install

```json
{
  "mcpServers": {
    "samotpravil": {
      "command": "npx",
      "args": ["-y", "samotpravil-mcp@latest"]
    }
  }
}
```

## Before publish to npm

1. Add `NPM_TOKEN` to GitHub Secrets
2. `git tag v1.1.0 && git push origin v1.1.0`

## After publish

1. Forward [docs/official/REQUEST_FOR_DOCS_TEAM.md](./docs/official/REQUEST_FOR_DOCS_TEAM.md) to docs/marketing
2. `npm run sync-docs` after Postman description is updated

## Links

- https://github.com/dkanster/samotpravil-mcp
- https://documentation.samotpravil.ru/
