#!/usr/bin/env bash
# Локальная установка Samotpravil MCP из git clone (разработка / fork).
# Для production используйте npx — см. docs/EXAMPLES.md
#   ./setup.sh                  # текущая директория = проект
#   ./setup.sh /path/to/project # явный путь к проекту
set -euo pipefail

PACKAGE_ROOT="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "${1:-.}" && pwd)"

TEMPLATE="$PACKAGE_ROOT/samotpravil-mcp.sh"
LAUNCHER="$ROOT/.cursor/samotpravil-mcp.sh"
MCP_JSON="$ROOT/.cursor/mcp.json"
MCP_EXAMPLE="$PACKAGE_ROOT/mcp.json.example"
ENV_EXAMPLE="$PACKAGE_ROOT/.env.samotpravil.example"

if [[ -d "$ROOT/ai" ]]; then
  ENV_FILE="$ROOT/ai/.env.samotpravil"
else
  ENV_FILE="$ROOT/.env.samotpravil"
fi

info() { echo "→ $*"; }
ok() { echo "✓ $*"; }
fail() { echo "✗ $*" >&2; exit 1; }

info "Проект: $ROOT"
command -v node >/dev/null 2>&1 || fail "Node.js не найден: https://nodejs.org/"
command -v npm >/dev/null 2>&1 || fail "npm не найден."
ok "Node $(node -v)"

[[ -f "$TEMPLATE" ]] || fail "Не найден: $TEMPLATE"
mkdir -p "$ROOT/.cursor"
sed "s|__SAMOTPRAVIL_MCP_HOME__|$PACKAGE_ROOT|g" "$TEMPLATE" > "$LAUNCHER"
chmod +x "$LAUNCHER"
ok "Launcher: .cursor/samotpravil-mcp.sh"

python3 - "$MCP_JSON" "$MCP_EXAMPLE" <<'PY'
import json, sys
from pathlib import Path
mcp_path, example_path = Path(sys.argv[1]), Path(sys.argv[2])
entry = {"command": ".cursor/samotpravil-mcp.sh", "args": []}
if mcp_path.exists():
    data = json.loads(mcp_path.read_text(encoding="utf-8"))
elif example_path.exists():
    data = json.loads(example_path.read_text(encoding="utf-8"))
else:
    data = {"mcpServers": {}}
data.setdefault("mcpServers", {})["samotpravil"] = entry
mcp_path.parent.mkdir(parents=True, exist_ok=True)
mcp_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
PY
ok "MCP config: .cursor/mcp.json"

if [[ ! -f "$ENV_FILE" ]]; then
  mkdir -p "$(dirname "$ENV_FILE")"
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  ok "Env: ${ENV_FILE#$ROOT/}"
else
  ok "Env уже есть: ${ENV_FILE#$ROOT/}"
fi

info "Сборка samotpravil-mcp…"
npm install --prefix "$PACKAGE_ROOT" >/dev/null
npm run build --prefix "$PACKAGE_ROOT"
ok "Build OK"

echo ""
echo "Готово (local dev launcher). Для production см. docs/EXAMPLES.md (npx)."
echo "  1. Settings → MCP → Reload"
echo "  2. Для api_request добавьте SAMOTPRAVIL_API_KEY в ${ENV_FILE#$ROOT/}"
echo "  3. Проверка: «Покажи обзор API СамОтправил» или «Найди метод smtp_send»"
