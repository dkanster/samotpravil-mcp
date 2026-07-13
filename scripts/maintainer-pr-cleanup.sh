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
echo "=== Optional: docs promo issue #51 comment ==="
echo "gh issue comment 51 --body 'v1.8.0 на npm. HTML-блок 1.8.0+ в docs/official/MCP_INSTALL_BLOCK.html — готов к вставке в documenter.'"

echo ""
echo "=== Optional: org migration issue (template) ==="
echo "gh issue create --title '[Org migration] Pre-flight complete' --template org_migration.yml"
echo "# Or: GitHub → New issue → Org migration tracking"

echo ""
echo "Copy-paste gh pr close lines:"
echo "  bash scripts/maintainer-pr-cleanup.sh | grep '^gh pr' | bash"
