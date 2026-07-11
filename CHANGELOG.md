# Changelog

All notable changes to this project are documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **Python SDK integration** (`samotpravil==1.0.0rc1`): отдельный MCP `samotpravil-mcp-python` (35 tools `py_*`), subprocess bridge, примеры, CI job, docs [PYTHON_SDK.md](./docs/PYTHON_SDK.md)
- Опциональные `py_*` tools в Node MCP при `SAMOTPRAVIL_ENABLE_PYTHON_SDK=1`
- `data/python-sdk-methods.json`, `data/python-sdk-schemas.json` — метаданные и схемы SDK-методов

## [1.2.0] - 2026-06-22

### Added

- Auto typed tools (`api_*`) для всех HTTP-методов `api.samotpravil.ru`, не покрытых ручными tools (~42)
- MCP Prompts: `integration_overview`, `send_transactional`, `stop_list_workflow`, `check_delivery`
- HTTP transport: `npx samotpravil-mcp --http [--port 3000]` (Streamable HTTP, stateless)
- `npm run export-openapi` → `data/openapi.yaml`
- SwaggerHub: upload/check scripts, [docs/SWAGGERHUB.md](./docs/SWAGGERHUB.md) (публично: `mailganer/samotpravil-smtp-api@1.0.0`)
- `server.json` для MCP Registry
- Уникальные endpoint slugs при коллизиях (`smtp_send` сохранён)
- [docs/ROADMAP_v1.2.md](./docs/ROADMAP_v1.2.md)

## [1.1.0] - 2026-06-21

### Added

- [docs/official/](./docs/official/) — HTML-блок, snippet для get-access, черновик блога, запрос для docs-команды
- Milestone v1.1.0: docs tools, typed API, resources, offline snapshot, safety, contributor docs

### Note

Публикация на documentation.samotpravil.ru требует правки Postman-коллекции командой Samotpravil — см. [docs/official/README.md](./docs/official/README.md).

## [1.0.5] - 2026-06-21

### Added

- [CONTRIBUTING.md](./CONTRIBUTING.md) — onboarding для контрибьюторов
- Расширенный [docs/EXAMPLES.md](./docs/EXAMPLES.md) — 3 сценария (send, stop-list, status)
- PR template и issue template «New API endpoint»

## [1.0.4] - 2026-06-21

### Added

- MCP Resources: `samotpravil://overview`, `endpoints`, `endpoint/{slug}`, `errors`, `integration`

## [1.0.3] - 2026-06-21

### Added

- 9 typed API tools: `send_email`, `send_mail_v2`, `get_delivery_status`, `get_package_status`, `search_stop_list`, `add_stop_list_email`, `remove_stop_list_email`, `validate_email`, `list_allowed_domains`
- Safety env: `SAMOTPRAVIL_READ_ONLY`, `SAMOTPRAVIL_ALLOW_SEND`
- `dry_run` on typed tools and `api_request`

## [1.0.2] - 2026-06-21

### Added

- Bundled Postman snapshot: `data/collection.snapshot.json`
- `npm run sync-docs` — обновление snapshot с documentation.samotpravil.ru
- Offline fallback: live → snapshot (`SAMOTPRAVIL_DOCS_MODE=auto|live|snapshot`)
- `get_overview`: источник документации, publishDate, syncedAt

## [1.0.1] - 2026-06-21

### Added

- Публикация в npm: установка через `npx -y samotpravil-mcp`
- [docs/EXAMPLES.md](./docs/EXAMPLES.md) — конфиги для Cursor, Claude Desktop, VS Code
- GitHub Actions workflow `publish.yml` — publish on tag `v*`
- README: npx как основной способ установки

### Changed

- `setup.sh` помечен как путь для local dev / fork

## [1.0.0] - 2026-06-21

- Initial release: docs tools + `api_request`
- Postman collection loader from documentation.samotpravil.ru

[1.1.0]: https://github.com/dkanster/samotpravil-mcp/compare/v1.0.5...v1.1.0
[1.0.5]: https://github.com/dkanster/samotpravil-mcp/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/dkanster/samotpravil-mcp/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/dkanster/samotpravil-mcp/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/dkanster/samotpravil-mcp/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/dkanster/samotpravil-mcp/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/dkanster/samotpravil-mcp/releases/tag/v1.0.0
