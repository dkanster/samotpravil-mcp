#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOKS_DIR="$ROOT/.githooks"
GIT_HOOKS="$(git -C "$ROOT" rev-parse --git-dir)/hooks"

mkdir -p "$GIT_HOOKS"
cp "$HOOKS_DIR/pre-commit" "$GIT_HOOKS/pre-commit"
chmod +x "$GIT_HOOKS/pre-commit"
echo "Installed pre-commit hook → $GIT_HOOKS/pre-commit"
