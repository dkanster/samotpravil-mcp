#!/usr/bin/env bash
# Rename GitHub repository: samotpravil-mcp → samotpravil-api-mcp
# Requires gh auth as repo admin (cloud agent token lacks administration:write).
set -euo pipefail

REPO="${1:-dkanster/samotpravil-mcp}"
NEW_NAME="${2:-samotpravil-api-mcp}"

echo "Renaming ${REPO} → ${NEW_NAME}…"
gh api -X PATCH "repos/${REPO}" -f name="${NEW_NAME}"

echo "Updating local remote…"
git remote set-url origin "https://github.com/${REPO%/*}/${NEW_NAME}.git"

echo "Done. Verify: gh repo view ${REPO%/*}/${NEW_NAME}"
