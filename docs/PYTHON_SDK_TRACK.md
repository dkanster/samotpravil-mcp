# Python SDK track (v2.0)

Отдельный трек интеграции официального Python SDK — **не входит в v1.9.0**.

| | |
|---|---|
| **PR** | [#22](https://github.com/dkanster/samotpravil-api-mcp/pull/22) (DRAFT) |
| **Ветка** | `cursor/python-sdk-integration-4ad4` |
| **Пакет** | [samotpravil==1.0.0rc1](https://pypi.org/project/samotpravil/1.0.0rc1/) |
| **Roadmap** | [ROADMAP_v2.0.md](./ROADMAP_v2.0.md) |

## Зачем отдельный трек

Node `samotpravil-mcp` уже даёт **SDK parity** через typed tools (`check-sdk-parity`, 28+ tools). Python MCP добавляет:

- нативный Python MCP-сервер для Python-проектов;
- опциональный bridge `py_*` tools в Node MCP (`SAMOTPRAVIL_ENABLE_PYTHON_SDK=1`);
- примеры sync/async/bridge в `python/examples/`.

Это **дополнение**, не замена Node-сервера.

## Содержимое PR #22 (preview)

| Компонент | Описание |
|-----------|----------|
| `python/` | MCP server, 35 `py_*` tools, safety flags |
| `src/pythonBridge.ts` | subprocess bridge из Node |
| `scripts/check-python.mjs` | CI check для Python пакета |
| `samotpravil-mcp-python.sh` | launcher для Cursor |
| `docs/PYTHON_SDK.md` | setup guide (на ветке PR) |

~2290 строк, 37 файлов.

## Блокеры merge

1. **Rebase на `main`** — ~10 конфликтующих файлов (`merge-tree`)
2. **Milestone v2.0** — не смешивать с release 1.9.0
3. **CI** — добавить Python job в `.github/workflows/ci.yml` после merge
4. **Maintainer review** — dual-server DX, env flags, docs

## Проверка статуса

```bash
npm run check-python-sdk-pr
```

## План merge (v2.0)

```bash
git fetch origin cursor/python-sdk-integration-4ad4
git checkout -b cursor/python-sdk-rebase-dd21 origin/cursor/python-sdk-integration-4ad4
git rebase origin/main
# resolve conflicts → npm test && cd python && pytest
npm run check-python-sdk-pr
```

После rebase:

- [ ] `npm test` (Node + `check-python.mjs`)
- [ ] `cd python && pytest`
- [ ] Обновить `docs/ECOSYSTEM.md` — Python MCP в схеме
- [ ] Bump minor → v2.0.0 (отдельный release PR)
- [ ] Закрыть PR #22 или открыть новый с rebased branch

## Связь с Node parity

| Возможность | Node v1.x | Python MCP v2 |
|-------------|-----------|---------------|
| Typed API tools | ✅ `sdkTyped.ts` | — |
| `py_*` tools | опционально bridge | ✅ native |
| Docs search | ✅ | — |
| Postman sync | ✅ | — |

Prompt `python_sdk_parity` в Node MCP — см. [EXAMPLES.md](./EXAMPLES.md).
