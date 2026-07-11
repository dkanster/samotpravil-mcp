# Python SDK integration (samotpravil==1.0.0rc1)

Интеграция официального [Python-пакета samotpravil](https://pypi.org/project/samotpravil/1.0.0rc1/) в экосистему `samotpravil-mcp`.

## Три способа использования

| Способ | Когда | Tools |
|--------|-------|-------|
| **Отдельный Python MCP** | Python-проекты, Cursor с двумя серверами | 35 × `py_*` |
| **Bridge из Node MCP** | Один Node-сервер, вызовы через subprocess | +35 × `py_*` при `SAMOTPRAVIL_ENABLE_PYTHON_SDK=1` |
| **Прямой SDK** | Приложения, скрипты, Jupyter | `SamotpravilClient` / `AsyncSamotpravilClient` |

## Установка Python MCP

```bash
cd python
pip install -e ".[async,dev]"
export SAMOTPRAVIL_API_KEY=your_key
python -m samotpravil_mcp
```

Или через `./setup.sh` — добавится сервер `samotpravil-python` в `.cursor/mcp.json`.

## MCP-конфигурация (Cursor)

```json
{
  "mcpServers": {
    "samotpravil-python": {
      "command": ".cursor/samotpravil-mcp-python.sh",
      "env": {
        "SAMOTPRAVIL_API_KEY": "your_key",
        "SAMOTPRAVIL_READ_ONLY": "1",
        "SAMOTPRAVIL_ALLOW_SEND": "0",
        "SAMOTPRAVIL_ALLOW_MUTATIONS": "0"
      }
    }
  }
}
```

## Tools (`py_*`)

Каждый метод SDK — отдельный MCP tool:

- `py_send_email`, `py_get_status`, `py_stop_list_search`, …
- WhiteLabel: `py_get_blist`, `py_create_authkey`, …

Общие параметры:

- `dry_run` — preview без вызова API
- `async_mode` — `AsyncSamotpravilClient` (нужен `pip install samotpravil[async]`)

## Safety flags

Совпадают с Node `samotpravil-mcp`:

| Env | Default | Описание |
|-----|---------|----------|
| `SAMOTPRAVIL_READ_ONLY` | `0` | Только read-методы |
| `SAMOTPRAVIL_ALLOW_SEND` | `1` | `send_email`, `send_package`, … |
| `SAMOTPRAVIL_ALLOW_MUTATIONS` | `1` | Стоп-лист, домены, экспорт, … |
| `SAMOTPRAVIL_ALLOW_WHITELABEL` | `1` | WhiteLabel-методы |

## Bridge (subprocess)

Node и shell могут вызывать SDK без отдельного MCP:

```bash
echo '{"method":"get_domains","params":{},"dry_run":true}' \
  | python -m samotpravil_mcp.bridge --stdin-json
```

В Node MCP включите bridge-tools:

```bash
SAMOTPRAVIL_ENABLE_PYTHON_SDK=1
```

Тогда `samotpravil-mcp` регистрирует те же `py_*` tools, проксируя в Python bridge.

## Примеры

- `python/examples/sync_send.py` — sync client
- `python/examples/async_send.py` — async client
- `python/examples/bridge_demo.py` — bridge dry_run

## Тесты и CI

```bash
cd python && pytest
# или из корня:
node scripts/check-python.mjs
```

## Версия SDK

Зафиксирована: **`samotpravil==1.0.0rc1`** (см. `python/pyproject.toml`).

Схемы параметров для Node: `data/python-sdk-schemas.json` (генерация: `python/scripts/generate_schemas.py`).

## См. также

- [python/README.md](../python/README.md)
- [ECOSYSTEM.md](./ECOSYSTEM.md)
- [EXAMPLES.md](./EXAMPLES.md)
