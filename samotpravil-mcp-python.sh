#!/usr/bin/env bash
# Launcher Python MCP (samotpravil SDK) для Cursor.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SAMOTPRAVIL_MCP_HOME="${SAMOTPRAVIL_MCP_HOME:-__SAMOTPRAVIL_MCP_HOME__}"
if [[ "$SAMOTPRAVIL_MCP_HOME" == "__SAMOTPRAVIL_MCP_HOME__" ]]; then
  SAMOTPRAVIL_MCP_HOME="$ROOT"
fi

PYTHON_BIN="${SAMOTPRAVIL_PYTHON:-python3}"
PYTHON_DIR="$SAMOTPRAVIL_MCP_HOME/python"
PYTHON_SRC="$PYTHON_DIR/src"

read_env_value() {
  local key="$1"
  local file="$2"
  [[ -f "$file" ]] || return 1
  local line
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%%#*}"
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"
    [[ -n "$line" ]] || continue
    if [[ "$line" == "$key="* ]]; then
      local val="${line#*=}"
      val="${val#"${val%%[![:space:]]*}"}"
      val="${val%"${val##*[![:space:]]}"}"
      if [[ ${#val} -ge 2 && ( ( "$val" == \"*\" && "$val" == *\" ) || ( "$val" == \'*\' && "$val" == *\' ) ) ]]; then
        val="${val:1:${#val}-2}"
      fi
      printf '%s' "$val"
      return 0
    fi
  done < "$file"
  return 1
}

load_env() {
  local file
  for file in "$ROOT/.env.samotpravil" "$ROOT/ai/.env.samotpravil"; do
    if [[ -f "$file" ]]; then
      if [[ -z "${SAMOTPRAVIL_API_KEY:-}" ]]; then
        local key
        key="$(read_env_value SAMOTPRAVIL_API_KEY "$file" || true)"
        [[ -n "$key" ]] && export SAMOTPRAVIL_API_KEY="$key"
      fi
      return 0
    fi
  done
  return 1
}

load_env || true

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  echo "Samotpravil Python MCP: $PYTHON_BIN не найден." >&2
  echo "  Установите Python 3.10+ и зависимости:" >&2
  echo "  cd $PYTHON_DIR && pip install -e '.[async]'" >&2
  exit 1
fi

export PYTHONPATH="$PYTHON_SRC${PYTHONPATH:+:$PYTHONPATH}"
exec "$PYTHON_BIN" -m samotpravil_mcp
