"""Execute SDK methods (sync and async)."""

from __future__ import annotations

import base64
import json
import os
from typing import Any

from samotpravil import SamotpravilClient
from samotpravil.exceptions import SamotpravilError

from .methods import get_sdk_callable
from .safety import assert_method_allowed, format_dry_run_preview


def require_api_key() -> str:
    api_key = os.environ.get("SAMOTPRAVIL_API_KEY", "").strip()
    if not api_key:
        raise ValueError(
            "SAMOTPRAVIL_API_KEY не задан. Добавьте ключ в .env.samotpravil или env MCP.",
        )
    return api_key


def _serialize_result(result: Any) -> str:
    if hasattr(result, "status_code") and hasattr(result, "content"):
        payload = {
            "status_code": result.status_code,
            "headers": dict(result.headers),
        }
        if result.status_code == 200:
            payload["content_base64"] = base64.b64encode(result.content).decode("ascii")
            payload["content_type"] = result.headers.get("Content-Type", "application/octet-stream")
        elif result.status_code == 204:
            payload["message"] = "Файл ещё не готов (204 No Content)"
        else:
            payload["text"] = result.text
        return json.dumps(payload, ensure_ascii=False, indent=2)

    return json.dumps(result, ensure_ascii=False, indent=2, default=str)


def execute_sdk_method(
    method_name: str,
    params: dict[str, Any],
    *,
    dry_run: bool = False,
    async_mode: bool = False,
) -> str:
    assert_method_allowed(method_name)

    call_params = {key: value for key, value in params.items() if key not in {"dry_run", "async_mode"}}

    if dry_run:
        return format_dry_run_preview(method_name, call_params, async_mode)

    api_key = require_api_key()

    try:
        if async_mode:
            return _execute_async(method_name, call_params, api_key)
        return _execute_sync(method_name, call_params, api_key)
    except SamotpravilError as error:
        raise RuntimeError(str(error)) from error


def _execute_sync(method_name: str, params: dict[str, Any], api_key: str) -> str:
    client = SamotpravilClient(api_key)
    fn = get_sdk_callable(client, method_name)
    result = fn(**params)
    return _serialize_result(result)


def _execute_async(method_name: str, params: dict[str, Any], api_key: str) -> str:
    import asyncio

    try:
        from samotpravil.async_client import AsyncSamotpravilClient
    except ImportError as error:
        raise RuntimeError(
            "AsyncSamotpravilClient недоступен. Установите: pip install 'samotpravil-mcp-python[async]'",
        ) from error

    async def _run() -> Any:
        async with AsyncSamotpravilClient(api_key) as client:
            fn = get_sdk_callable(client, method_name)
            return await fn(**params)

    result = asyncio.run(_run())
    return _serialize_result(result)
