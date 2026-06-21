#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

bash -n "$ROOT/samotpravil-mcp.sh"
bash -n "$ROOT/setup.sh"
echo "OK: shell scripts syntax"

npm run build --prefix "$ROOT"
echo "OK: TypeScript build"

node "$ROOT/scripts/check-docs.mjs"
echo "OK: docs helpers"
