# Deferred dependency upgrades

Отложенные major/breaking обновления после v1.7.0. Dependabot PR закрываем с ссылкой на этот файл.

| Package | Current | Proposed | PR | Причина отложения |
|---------|---------|----------|-----|-------------------|
| `zod` | 4.x | — | #47 close | ✅ Migrated — `z.record(key, value)` two-arg form; ToolCallback casts for MCP SDK |
| `@eslint/js` | 9.x | 10.x | #48 | ESLint 10 flat config migration |
| `@scalar/api-reference-react` | 0.8.x | 0.9.x | #44 | Docusaurus-only; needs visual QA on API reference page |
| `dev-tools` group | mixed | latest | #45 | Includes eslint 10 — merge after ESLint migration |

## Safe to merge (consolidated)

- GitHub Actions: checkout v7, setup-node v6, pages artifacts v5, release-please v5
- Docusaurus patch: 3.10.1 → 3.10.2

## When to revisit

- v1.8.0 milestone: eslint 10 + dev-tools group (#45, #48)
- After org migration: fewer moving parts on `main`
