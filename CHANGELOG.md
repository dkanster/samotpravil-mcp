# Changelog

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

[1.0.2]: https://github.com/dkanster/samotpravil-mcp/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/dkanster/samotpravil-mcp/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/dkanster/samotpravil-mcp/releases/tag/v1.0.0
