"""Bridge demo without network calls."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    payload = {
        "method": "get_domains",
        "params": {},
        "dry_run": True,
        "async_mode": False,
    }
    proc = subprocess.run(
        [sys.executable, "-m", "samotpravil_mcp.bridge", "--stdin-json"],
        input=json.dumps(payload),
        text=True,
        capture_output=True,
        cwd=root,
        check=False,
    )
    print(proc.stdout)
    if proc.returncode != 0:
        print(proc.stderr, file=sys.stderr)
        raise SystemExit(proc.returncode)


if __name__ == "__main__":
    main()
