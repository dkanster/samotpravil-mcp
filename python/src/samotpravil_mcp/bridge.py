"""CLI bridge for Node.js and other subprocess callers."""

from __future__ import annotations

import argparse
import json
import sys
from typing import Any

from .executor import execute_sdk_method


def run_bridge_payload(payload: dict[str, Any]) -> dict[str, Any]:
    method = payload.get("method")
    if not isinstance(method, str) or not method:
        raise ValueError("payload.method is required")

    params = payload.get("params", {})
    if not isinstance(params, dict):
        raise ValueError("payload.params must be an object")

    dry_run = bool(payload.get("dry_run", False))
    async_mode = bool(payload.get("async_mode", False))

    text = execute_sdk_method(method, params, dry_run=dry_run, async_mode=async_mode)
    return {"ok": True, "result": text}


def main() -> None:
    parser = argparse.ArgumentParser(description="Samotpravil Python SDK bridge")
    parser.add_argument("--stdin-json", action="store_true", help="Read JSON payload from stdin")
    parser.add_argument("--method", help="SDK method name")
    parser.add_argument("--params", default="{}", help="JSON object with method params")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--async", dest="async_mode", action="store_true")
    args = parser.parse_args()

    try:
        if args.stdin_json:
            payload = json.load(sys.stdin)
            response = run_bridge_payload(payload)
        else:
            if not args.method:
                raise ValueError("--method is required without --stdin-json")
            params = json.loads(args.params)
            response = run_bridge_payload(
                {
                    "method": args.method,
                    "params": params,
                    "dry_run": args.dry_run,
                    "async_mode": args.async_mode,
                },
            )
    except Exception as error:  # noqa: BLE001 — bridge returns structured errors to callers
        json.dump({"ok": False, "error": str(error)}, sys.stdout, ensure_ascii=False)
        sys.stdout.write("\n")
        sys.exit(1)

    json.dump(response, sys.stdout, ensure_ascii=False)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
