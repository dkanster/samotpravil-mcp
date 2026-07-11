from __future__ import annotations

import pytest

from samotpravil_mcp.methods import SDK_METHODS, build_input_schema
from samotpravil_mcp.safety import assert_method_allowed, format_dry_run_preview


def test_sdk_method_count() -> None:
    assert len(SDK_METHODS) == 35


def test_input_schema_has_dry_run_and_async_mode() -> None:
    schema = build_input_schema("send_email")
    assert "dry_run" in schema["properties"]
    assert "async_mode" in schema["properties"]
    assert "email_to" in schema["properties"]


def test_read_only_blocks_send() -> None:
    monkeypatch = pytest.MonkeyPatch()
    monkeypatch.setenv("SAMOTPRAVIL_READ_ONLY", "1")
    with pytest.raises(PermissionError):
        assert_method_allowed("send_email")


def test_read_only_allows_get_domains() -> None:
    monkeypatch = pytest.MonkeyPatch()
    monkeypatch.setenv("SAMOTPRAVIL_READ_ONLY", "1")
    assert_method_allowed("get_domains")


def test_allow_send_blocks_send_when_disabled() -> None:
    monkeypatch = pytest.MonkeyPatch()
    monkeypatch.setenv("SAMOTPRAVIL_ALLOW_SEND", "0")
    with pytest.raises(PermissionError):
        assert_method_allowed("send_email")


def test_whitelabel_flag() -> None:
    monkeypatch = pytest.MonkeyPatch()
    monkeypatch.setenv("SAMOTPRAVIL_ALLOW_WHITELABEL", "0")
    with pytest.raises(PermissionError):
        assert_method_allowed("get_blist")


def test_dry_run_preview() -> None:
    preview = format_dry_run_preview("get_domains", {}, async_mode=True)
    assert "DRY RUN" in preview
    assert "AsyncSamotpravilClient" in preview
