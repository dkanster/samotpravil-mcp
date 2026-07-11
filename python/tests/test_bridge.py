from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def run_bridge(payload: dict) -> dict:
    proc = subprocess.run(
        [sys.executable, "-m", "samotpravil_mcp.bridge", "--stdin-json"],
        input=json.dumps(payload),
        text=True,
        capture_output=True,
        cwd=ROOT,
        check=False,
    )
    assert proc.returncode == 0, proc.stderr
    return json.loads(proc.stdout)


def test_bridge_dry_run() -> None:
    result = run_bridge({"method": "stop_list_search", "params": {"email": "a@b.ru"}, "dry_run": True})
    assert result["ok"] is True
    assert "DRY RUN" in result["result"]


def test_bridge_unknown_method() -> None:
    proc = subprocess.run(
        [sys.executable, "-m", "samotpravil_mcp.bridge", "--stdin-json"],
        input=json.dumps({"method": "not_a_method", "params": {}}),
        text=True,
        capture_output=True,
        cwd=ROOT,
        check=False,
    )
    assert proc.returncode == 1
    payload = json.loads(proc.stdout)
    assert payload["ok"] is False
