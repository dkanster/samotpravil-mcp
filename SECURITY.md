# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.5.x   | Yes       |
| 1.4.x   | Yes       |
| < 1.3   | No        |

## Reporting a Vulnerability

If you discover a security issue, please **do not** open a public GitHub issue.

1. Email the maintainer via the contact listed on [npm](https://www.npmjs.com/package/samotpravil-mcp) or open a **private** security advisory on GitHub (Security → Advisories → New draft).
2. Include: affected version, reproduction steps, impact assessment, and suggested fix if any.
3. Expect an initial response within **5 business days**.

## Scope

This policy covers the `samotpravil-mcp` npm package and its MCP server code in this repository.

**Out of scope:** vulnerabilities in `api.samotpravil.ru` itself — report those to Samotpravil/Mailganer support.

## Security Model

### API keys

- `SAMOTPRAVIL_API_KEY` and `POSTMAN_API_KEY` are secrets. Never commit them.
- Responses from API tools are passed through `src/redact.ts` to mask `api_key`, tokens, and `key=` query parameters.
- Use safety env flags (`SAMOTPRAVIL_READ_ONLY`, `SAMOTPRAVIL_ALLOW_SEND`, etc.) when running with AI agents.

### HTTP transport (`--http`)

- Binds to `127.0.0.1` by default (`SAMOTPRAVIL_HTTP_HOST`).
- For non-localhost deployment, set `SAMOTPRAVIL_HTTP_AUTH_TOKEN` and require `Authorization: Bearer <token>` on every request.
- Do not expose the HTTP endpoint to the public internet without authentication and TLS termination.

### Stdio transport (default)

- Secrets are passed via environment variables configured by the MCP host (Cursor, Claude Desktop, etc.).
- The server does not persist API keys to disk.

## Best Practices for Integrators

```env
SAMOTPRAVIL_READ_ONLY=1
SAMOTPRAVIL_ALLOW_SEND=0
SAMOTPRAVIL_ALLOW_MUTATIONS=0
```

Use `dry_run: true` on tools to preview requests before sending.
