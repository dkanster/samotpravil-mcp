#!/usr/bin/env bash
# One-shot maintainer workflow — reports + handoff artifacts + action commands.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Maintainer bundle"
echo ""

echo "--- Status ---"
npm run maintainer-status || true
echo ""

echo "--- Handoff artifacts ---"
npm run promo-handoff -- --write || true
npm run org-handoff -- --write || true
echo ""

echo "--- Release PR body ---"
npm run release-pr-body -- --write || true
echo ""

echo "--- Release Please ---"
node scripts/check-release-please.mjs || true
echo ""

echo "--- Manual gh commands ---"
echo "Close superseded PRs:"
bash scripts/maintainer-pr-cleanup.sh | grep '^gh pr' || true
echo ""
echo "Issue comments:"
echo "  gh issue comment 51 --body-file artifacts/promo-handoff-issue-51.md"
echo "  gh issue comment 65 --body-file artifacts/org-handoff-issue-65.md"
echo ""
echo "Release gate:"
echo "  npm run check-v19-readiness"
