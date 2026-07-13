# Branch protection on `main`

Шаблон: [.github/branch-protection.example.json](../.github/branch-protection.example.json)

Применить **после** org transfer или сразу на `dkanster/samotpravil-mcp`, если репозиторий публичный.

## GitHub UI

1. **Settings → Branches → Add branch ruleset** (или classic protection)
2. Branch: `main`
3. Включить:
   - Require status check: `check` (CI workflow)
   - Require pull request before merging (1 approval)
   - Require conversation resolution
   - Do not allow bypassing (enforce for admins)
   - Restrict force pushes / deletions

## gh CLI (admin)

```bash
gh api repos/dkanster/samotpravil-mcp/branches/main/protection \
  --method PUT \
  --input .github/branch-protection.example.json
```

> Для rulesets API отличается — UI проще, если classic protection недоступен.

## Проверка

```bash
gh api repos/dkanster/samotpravil-mcp/branches/main/protection --jq '.required_status_checks.contexts'
# Ожидается: ["check"]
```

## Release Please

Workflow создаёт release PR автоматически. Требуется:

**Settings → Actions → General → Workflow permissions →**
☑ Allow GitHub Actions to create and approve pull requests

Без этой опции workflow падает с `GitHub Actions is not permitted to create or approve pull requests`.
См. [RELEASE_PLEASE.md](./RELEASE_PLEASE.md).
