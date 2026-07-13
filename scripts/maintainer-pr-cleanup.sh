#!/usr/bin/env bash
# Maintainer helper: close superseded PRs and optional issue comments.
# Run locally with gh auth as repo admin (cloud agent lacks close permission).

set -euo pipefail

echo "=== Superseded feature PRs (close with comment) ==="
for pr in 23 24 25 37; do
  echo "gh pr close $pr --comment 'Superseded by #38 (v1.7.0 unified release, merged to main).'"
done

echo ""
echo "=== Superseded Dependabot PRs ==="
for pr in 39 40 41 42 43 46; do
  echo "gh pr close $pr --comment 'Consolidated in #52 (safe dependency bumps).'"
done
for pr in 44 48 47 49; do
  echo "gh pr close $pr --comment 'Merged or superseded — see docs/DEPENDENCY_DEFERRALS.md (#59 Scalar, #55 zod, #56 eslint).'"
done

echo ""
echo "=== Dependabot deferred ==="
echo "gh pr close 60 --comment 'Deferred — see docs/DEPENDENCY_DEFERRALS.md (typescript 7, stay on TS 5.x).'"

echo ""
echo "=== Rename draft PR #64 (after naming decision) ==="
echo "# Variant C (org): close #64 — see PR #67 and issue #65"
echo "gh pr close 64 --comment 'Superseded by org migration path (variant C) — see PR #67 and issue #65.'"
echo "# Variant B (rename): merge #64 instead of closing"

echo ""
echo "=== Docs promo issue #51 ==="
echo "npm run promo-handoff   # full comment body"
echo "gh issue comment 51 --body-file /tmp/promo-handoff.md   # after saving output"

echo ""
echo "=== Tracker ==="
echo "npm run check-superseded-prs"

echo ""
echo "Copy-paste gh pr close lines:"
echo "  bash scripts/maintainer-pr-cleanup.sh | grep '^gh pr' | bash"
