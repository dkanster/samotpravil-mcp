# Samotpravil Python SDK integration

Python MCP-сервер и bridge вокруг официального пакета [`samotpravil==1.0.0rc1`](https://pypi.org/project/samotpravil/1.0.0rc1/).

## Установка

```bash
cd python
pip install -e ".[async,dev]"
```

Требуется Python **3.10+**.

## MCP-сервер (stdio)

```bash
export SAMOTPRAVIL_API_KEY=your_key
python -m samotpravil_mcp
```

Регистрирует **35 tools** с префиксом `py_` (например `py_send_email`, `py_get_status`).

Общие параметры каждого tool:

- `dry_run` — preview без вызова API
- `async_mode` — использовать `AsyncSamotpravilClient` (нужен extra `[async]`)

## Safety flags

Те же env, что и в Node `samotpravil-mcp`:

| Переменная | По умолчанию | Эффект |
|------------|--------------|--------|
| `SAMOTPRAVIL_READ_ONLY` | `0` | Только read-методы SDK |
| `SAMOTPRAVIL_ALLOW_SEND` | `1` | Отправка (`send_*`) |
| `SAMOTPRAVIL_ALLOW_MUTATIONS` | `1` | Изменяющие операции |
| `SAMOTPRAVIL_ALLOW_WHITELABEL` | `1` | WhiteLabel-методы |

## Bridge (subprocess)

Для вызова из Node или shell:

```bash
python -m samotpravil_mcp.bridge --method send_email --params '{"email_from":"a@b.ru","email_to":"c@d.ru","subject":"Hi","message_text":"Hello"}' --dry-run
```

Или JSON на stdin:

```bash
echo '{"method":"get_domains","params":{},"dry_run":true}' | python -m samotpravil_mcp.bridge --stdin-json
```

## Примеры

См. `examples/`:

- `sync_send.py` — sync client
- `async_send.py` — async client
- `bridge_demo.py` — bridge payload

## Тесты

```bash
cd python && pytest
```
