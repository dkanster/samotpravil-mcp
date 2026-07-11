"""Safety flags aligned with the TypeScript samotpravil-mcp server."""

from __future__ import annotations

import os

from .methods import SDK_METHOD_BY_NAME, MethodCategory


def _env_flag(name: str) -> bool:
    value = os.environ.get(name, "").strip().lower()
    return value in {"1", "true", "yes"}


def _env_flag_default_true(name: str) -> bool:
    if name not in os.environ:
        return True
    return _env_flag(name)


def is_read_only_mode() -> bool:
    return _env_flag("SAMOTPRAVIL_READ_ONLY")


def is_allow_send() -> bool:
    return _env_flag_default_true("SAMOTPRAVIL_ALLOW_SEND")


def is_allow_mutations() -> bool:
    return _env_flag_default_true("SAMOTPRAVIL_ALLOW_MUTATIONS")


def is_whitelabel_enabled() -> bool:
    return _env_flag_default_true("SAMOTPRAVIL_ALLOW_WHITELABEL")


def assert_method_allowed(method_name: str) -> None:
    meta = SDK_METHOD_BY_NAME.get(method_name)
    if meta is None:
        raise ValueError(f"Unknown SDK method: {method_name}")

    if meta.whitelabel and not is_whitelabel_enabled():
        raise PermissionError(
            "Запрос заблокирован: SAMOTPRAVIL_ALLOW_WHITELABEL=0 (WhiteLabel-методы отключены).",
        )

    category: MethodCategory = meta.category

    if is_read_only_mode() and category != "read":
        raise PermissionError(
            "Запрос заблокирован: SAMOTPRAVIL_READ_ONLY=1 (разрешены только read-методы SDK).",
        )

    if not is_allow_send() and category == "send":
        raise PermissionError(
            "Запрос заблокирован: SAMOTPRAVIL_ALLOW_SEND=0 (отправка писем и пакетов отключена).",
        )

    if not is_allow_mutations() and category == "mutation":
        raise PermissionError(
            "Запрос заблокирован: SAMOTPRAVIL_ALLOW_MUTATIONS=0 (изменяющие операции отключены).",
        )


def format_dry_run_preview(method_name: str, params: dict[str, object], async_mode: bool) -> str:
    client_type = "AsyncSamotpravilClient" if async_mode else "SamotpravilClient"
    param_lines = "\n".join(f"  {key}={value!r}" for key, value in params.items()) or "  (none)"
    return "\n".join(
        [
            "DRY RUN — SDK-вызов не выполнен",
            "",
            f"client = {client_type}(api_key)",
            f"result = client.{method_name}(",
            param_lines,
            ")",
        ],
    )
