# Миграция API: v1 → v2 (для интеграторов)

Практический гид по переходу с legacy v1 на современные v2-методы `api.samotpravil.ru`.

**Статус:** v1 и v2 сосуществуют; v2 — рекомендуемый путь для новых интеграций.  
**Полный wishlist для продукта:** [API_WISHLIST.md](./API_WISHLIST.md)

---

## Принципы

1. **Новые проекты** — начинайте с v2 (`/api/v2/...`).
2. **Существующие v1** — планируйте миграцию; sunset-даты уточняйте у поддержки.
3. **MCP** — typed tools покрывают оба слоя; Python SDK parity — в основном v2 + пакеты v1.

---

## Таблица миграции

| Сценарий | v1 (legacy) | v2 (рекомендуется) | MCP tool |
|----------|-------------|-------------------|----------|
| Отправка письма | `POST /api/v1/smtp_send` | `POST /api/v2/mail/send` *(stabilize)* | `send_email` / `send_mail_v2` |
| JSON-пакет | `POST /api/v1/add_json_package` | `POST /api/v2/mail/package` *(proposed)* | `send_package` |
| XML-пакет по URL | `GET /api/v1/add_package` | `POST /api/v2/mail/package/xml` *(proposed)* | `send_package_xml` |
| Остановка пакета | `GET /api/v1/package_stop` | `POST /api/v2/mail/package/{id}/stop` *(proposed)* | `stop_package` |
| Статус выпуска | `GET /api/v1/...` | `GET /api/v2/issue/status` | `get_delivery_status` |
| Статус пакета | `GET /api/v1/package_status` | `GET /api/v2/package/status` | `get_package_status` |
| Статистика | `GET /api/v1/get_smtp_issue_stat` | `GET /api/v2/issue/statistics` | `get_statistics` |
| FBL отчёт | `GET /api/v1/get_fbl_report` | `GET /api/v2/blist/report/fbl` | `get_fbl_report_by_date` |
| Non-delivery | `GET /api/v1/get_stop_report` | `GET /api/v2/blist/report/non-delivery` | `get_non_delivery_by_date` |
| Стоп-лист search | v1 reports | `GET /api/v2/stop-list/search` | `search_stop_list` |
| Домены | — | `POST /api/v2/blist/domains/add` | `domain_add` |

Строки с *(proposed)* — из [API_WISHLIST.md](./API_WISHLIST.md); endpoints могут ещё не существовать в API.

---

## Пошаговый план миграции

### Шаг 1 — инвентаризация

```bash
# В Cursor с samotpravil MCP:
# list_endpoints + search_docs "v1"
```

Или offline: `data/collection.snapshot.json`.

### Шаг 2 — замена read-only отчётов

Переведите отчёты и статусы на v2 GET-методы — без риска для отправки.

### Шаг 3 — отправка

1. Параллельный прогон `send_mail_v2` / `send_email` в staging с `dry_run: true`.
2. Сравнение ответов (`message_id`, `x_track_id`).
3. Переключение production traffic.

### Шаг 4 — пакеты

Мигрируйте `add_json_package` после появления v2 package API (см. wishlist).

### Шаг 5 — удаление v1

После sunset-даты — удалите v1 вызовы из кода и CI probe allowlist.

---

## MCP safety при миграции

```env
SAMOTPRAVIL_READ_ONLY=1        # только GET на этапе аудита
SAMOTPRAVIL_ALLOW_SEND=0       # блок отправки до готовности
```

Используйте `dry_run: true` на typed tools для preview запросов.

---

## Связанные ресурсы

- MCP Resource: `samotpravil://api-wishlist`
- MCP Resource: `samotpravil://sdk-mapping`
- Документация: https://documentation.samotpravil.ru/
