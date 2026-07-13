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
echo "=== Naming (#64 closed — variant C) ==="
echo "# PR #64 already closed; decision in docs/REPO_NAMING.md"

echo ""
echo "=== Issue handoffs ==="
echo "npm run promo-handoff -- --write && gh issue comment 51 --body-file artifacts/promo-handoff-issue-51.md"
echo "npm run org-handoff -- --write && gh issue comment 65 --body-file artifacts/org-handoff-issue-65.md"

echo ""
echo "=== Tracker ==="
echo "npm run check-superseded-prs"

echo ""
echo "=== Python SDK v2.0 (NOT superseded — keep PR #22 open) ==="
echo "npm run check-python-sdk-pr"
echo "# Rebase plan: docs/PYTHON_SDK_TRACK.md"

echo ""
echo "Copy-paste gh pr close lines:"
echo "  bash scripts/maintainer-pr-cleanup.sh | grep '^gh pr' | bash"
