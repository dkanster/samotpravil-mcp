"""MCP server exposing all samotpravil SDK methods."""

from __future__ import annotations

import json
import sys
from typing import Any

from mcp import types
from mcp.server import Server
from mcp.server.stdio import stdio_server

from . import __version__
from .executor import execute_sdk_method
from .methods import SDK_METHODS, build_input_schema

TOOL_PREFIX = "py_"


def build_tools() -> list[types.Tool]:
    tools: list[types.Tool] = []
    for method in SDK_METHODS:
        whitelabel_note = " (WhiteLabel)" if method.whitelabel else ""
        tools.append(
            types.Tool(
                name=f"{TOOL_PREFIX}{method.name}",
                description=f"[Python SDK] {method.description}{whitelabel_note}",
                inputSchema=build_input_schema(method.name),
            ),
        )
    return tools


def create_server() -> Server:
    server = Server("samotpravil-mcp-python")

    @server.list_tools()
    async def handle_list_tools() -> list[types.Tool]:
        return build_tools()

    @server.call_tool()
    async def handle_call_tool(name: str, arguments: dict[str, Any] | None) -> list[types.TextContent]:
        if not name.startswith(TOOL_PREFIX):
            raise ValueError(f"Unknown tool: {name}")

        method_name = name[len(TOOL_PREFIX) :]
        args = arguments or {}
        dry_run = bool(args.get("dry_run", False))
        async_mode = bool(args.get("async_mode", False))

        try:
            text = execute_sdk_method(
                method_name,
                args,
                dry_run=dry_run,
                async_mode=async_mode,
            )
        except (PermissionError, ValueError, RuntimeError) as error:
            return [types.TextContent(type="text", text=str(error))]

        return [types.TextContent(type="text", text=text)]

    return server


async def run_stdio_server() -> None:
    server = create_server()
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


def main() -> None:
    import asyncio

    print(
        f"[samotpravil-mcp-python] v{__version__} (stdio). {len(SDK_METHODS)} SDK tools.",
        file=sys.stderr,
    )
    asyncio.run(run_stdio_server())


if __name__ == "__main__":
    main()
