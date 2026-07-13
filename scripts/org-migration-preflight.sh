#!/usr/bin/env bash
# Org migration pre-flight — dry-run report for maintainers.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Org migration pre-flight"
echo ""

echo "--- Interim state ---"
node scripts/check-org-migration.mjs
echo ""

echo "--- Replacement plan (dry-run) ---"
node scripts/apply-org-migration.mjs 2>&1 | tail -6
echo ""

echo "--- Branch protection ---"
node scripts/check-branch-protection.mjs || true
echo ""

echo "--- Upstream scaffolds ---"
node scripts/check-scaffolds.mjs
echo ""

echo "--- Checklist ---"
echo "  [ ] GitHub org created"
echo "  [ ] Repo transferred to samotpravil/samotpravil-mcp"
echo "  [ ] NPM_TOKEN + SAMOTPRAVIL_API_KEY secrets updated"
echo "  [ ] node scripts/apply-org-migration.mjs --write"
echo "  [ ] npm run sync-versions && npm test && npm run pre-publish-check"
echo "  [ ] npm publish @samotpravil/mcp (first scoped publish)"
echo ""
echo "Runbook: docs/ORG_MIGRATION_RUNBOOK.md"
