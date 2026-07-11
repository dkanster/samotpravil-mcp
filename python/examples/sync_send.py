"""Sync client example (requires SAMOTPRAVIL_API_KEY)."""

from __future__ import annotations

import os

from samotpravil import SamotpravilClient


def main() -> None:
    api_key = os.environ.get("SAMOTPRAVIL_API_KEY", "").strip()
    if not api_key:
        raise SystemExit("Set SAMOTPRAVIL_API_KEY")

    client = SamotpravilClient(api_key)
    domains = client.get_domains()
    print(domains)


if __name__ == "__main__":
    main()
