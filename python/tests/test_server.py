from __future__ import annotations

import pytest

from samotpravil_mcp.server import TOOL_PREFIX, build_tools


def test_tool_names_prefixed() -> None:
    tools = build_tools()
    assert len(tools) == 35
    assert all(tool.name.startswith(TOOL_PREFIX) for tool in tools)
    assert any(tool.name == "py_send_email" for tool in tools)
    assert any(tool.name == "py_create_authkey" for tool in tools)


def test_tool_schemas_are_objects() -> None:
    for tool in build_tools():
        assert tool.inputSchema["type"] == "object"
