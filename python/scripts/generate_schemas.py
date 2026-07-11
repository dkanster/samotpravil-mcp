#!/usr/bin/env python3
"""Generate data/python-sdk-schemas.json for Node MCP tool registration."""

from __future__ import annotations

import json
from pathlib import Path

from samotpravil_mcp.methods import SDK_METHODS, build_input_schema


def main() -> None:
    root = Path(__file__).resolve().parents[2]
    out = root / "data" / "python-sdk-schemas.json"
    payload = {method.name: build_input_schema(method.name) for method in SDK_METHODS}
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {out} ({len(payload)} methods)")


if __name__ == "__main__":
    main()
