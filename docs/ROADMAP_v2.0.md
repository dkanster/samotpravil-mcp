# Roadmap: samotpravil-mcp v2.0

Опциональный milestone после **v1.9.0** — Python SDK MCP и bridge.

**Базовая версия:** 1.9.0 (после release)  
**Трек:** [PYTHON_SDK_TRACK.md](./PYTHON_SDK_TRACK.md) · PR [#22](https://github.com/dkanster/samotpravil-api-mcp/pull/22)

---

## Phase 1 — Rebase & CI

| # | Задача | Статус |
|---|--------|--------|
| 1 | Rebase PR #22 на `main` | 🔲 `npm run check-python-sdk-pr` |
| 2 | `check-python.mjs` в CI | 🔲 на ветке PR |
| 3 | `npm test` + `pytest` green | 🔲 |

---

## Phase 2 — Python MCP server

| # | Задача | Статус |
|---|--------|--------|
| 1 | `python -m samotpravil_mcp` standalone | 🔲 PR branch |
| 2 | 35 `py_*` tools | 🔲 |
| 3 | Safety flags parity | 🔲 |
| 4 | `docs/PYTHON_SDK.md` merge | 🔲 |

---

## Phase 3 — Node bridge (optional)

| # | Задача | Статус |
|---|--------|--------|
| 1 | `SAMOTPRAVIL_ENABLE_PYTHON_SDK=1` | 🔲 |
| 2 | `registerPythonSdkTools.ts` | 🔲 |
| 3 | Dual-server docs в EXAMPLES | 🔲 |

---

## Phase 4 — Release v2.0.0

| # | Задача | Статус |
|---|--------|--------|
| 1 | ECOSYSTEM.md diagram update | 🔲 |
| 2 | npm minor bump 2.0.0 | 🔲 |
| 3 | Promo: Python MCP в documenter (опционально) | 🔲 |

---

## Критерии v2.0.0

- [ ] PR #22 rebased и merged (или successor PR)
- [ ] Python CI job green
- [ ] `pytest` + `npm test` green
- [ ] README + PYTHON_SDK.md published

**Не блокирует v1.9.0** — Node SDK parity уже в production.
