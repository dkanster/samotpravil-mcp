"""Async client example (requires SAMOTPRAVIL_API_KEY and samotpravil[async])."""

from __future__ import annotations

import asyncio
import os

from samotpravil.async_client import AsyncSamotpravilClient


async def main() -> None:
    api_key = os.environ.get("SAMOTPRAVIL_API_KEY", "").strip()
    if not api_key:
        raise SystemExit("Set SAMOTPRAVIL_API_KEY")

    async with AsyncSamotpravilClient(api_key) as client:
        domains = await client.get_domains()
        print(domains)


if __name__ == "__main__":
    asyncio.run(main())
