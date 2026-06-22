# Release v1.2.0

**Date:** 2026-06-22  
**npm:** `samotpravil-mcp@1.2.0`

## Highlights

- **56 MCP tools** — 14 manual + 42 auto-generated from Postman snapshot
- **4 MCP Prompts** — integration, send, stop-list, delivery workflows
- **HTTP transport** — `--http --port 3000` (Streamable HTTP, stateless)
- **OpenAPI** — `data/openapi.yaml` (51 operations)
- **MCP Registry** — `server.json`

## Install

```json
{
  "mcpServers": {
    "samotpravil": {
      "command": "npx",
      "args": ["-y", "samotpravil-mcp@1.2.0"]
    }
  }
}
```

## Roadmap

See [ROADMAP_v1.2.md](./ROADMAP_v1.2.md) for remaining registry/Smithery items.
