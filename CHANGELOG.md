# Changelog

All notable changes to this project are documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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

[1.0.5]: https://github.com/dkanster/samotpravil-mcp/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/dkanster/samotpravil-mcp/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/dkanster/samotpravil-mcp/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/dkanster/samotpravil-mcp/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/dkanster/samotpravil-mcp/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/dkanster/samotpravil-mcp/releases/tag/v1.0.0
