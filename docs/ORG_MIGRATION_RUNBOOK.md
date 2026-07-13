# Runbook: миграция в org Samotpravil

Пошаговый план после создания GitHub org и npm scope `@samotpravil`.

**Подготовка в репозитории (уже сделано):**

- `data/org-migration.targets.json` — interim/target значения
- `npm run check-org-migration` — проверка interim-состояния
- `npm run plan-org-migration` — dry-run замен
- `mcp.json.example.org` — будущий конфиг Cursor

---

## 0. Перед стартом

```bash
npm test
npm run plan-org-migration
npm run check-org-migration
```

Убедитесь, что нет незакоммиченных изменений и CI green на `main`.

---

## 1. GitHub org

1. Создать org `samotpravil` (или согласованный slug).
2. Добавить maintainers с ролью Owner/Admin.
3. **Transfer repository:** `dkanster/samotpravil-mcp` → `samotpravil/samotpravil-mcp`.
4. Применить branch protection — см. `.github/branch-protection.example.json`.
5. Обновить secrets (`NPM_TOKEN`, `SAMOTPRAVIL_API_KEY` для probe).

---

## 2. Замена ссылок в репозитории

После transfer выполнить замены из `npm run plan-org-migration`:

| Interim | Target |
|---------|--------|
| `dkanster/samotpravil-mcp` | `samotpravil/samotpravil-mcp` |
| `samotpravil-mcp` | `@samotpravil/mcp` |
| `io.github.dkanster/samotpravil-mcp` | `io.github.samotpravil/samotpravil-mcp` |

**Критичные файлы:** `package.json`, `server.json`, `smithery.yaml`, `README.md`, `docs/official/*`.

```bash
# После ручной правки:
npm run sync-versions
npm test
npm run pre-publish-check
```

### package.json

```json
{
  "name": "@samotpravil/mcp",
  "repository": {
    "url": "https://github.com/samotpravil/samotpravil-mcp.git"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

Опционально: оставить bin `samotpravil-mcp` для обратной совместимости CLI.

---

## 3. npm

1. Создать org `@samotpravil` на npmjs.com.
2. Добавить maintainers.
3. Первый publish scoped-пакета:

```bash
npm publish --access public
```

4. Deprecate interim-пакет:

```bash
npm deprecate samotpravil-mcp@"<2.0.0" "Package moved to @samotpravil/mcp"
```

5. Обновить `mcp.json` примеры: `npx -y @samotpravil/mcp@latest`.

---

## 4. MCP Registry + Smithery

1. Обновить `server.json` → `name`, `repository.url`, `packages[0].identifier`.
2. Tag `v*` → workflow `Publish npm` + `Publish MCP Registry`.
3. Smithery: переподключить репозиторий org, обновить `smithery.yaml` args.

Проверка:

```bash
curl -s "https://registry.modelcontextprotocol.io/v0.1/servers?search=samotpravil-mcp" | head -c 400
```

---

## 5. Документация и promo

Чеклист: [docs/official/PROMO_CHECKLIST.md](./official/PROMO_CHECKLIST.md)

1. Обновить ссылки в `MCP_INSTALL_BLOCK.html` на org repo + `@samotpravil/mcp`.
2. Republish documenter.
3. `npm run sync-docs` → PR со snapshot.
4. Заметка на samotpravil.ru/get-access.

---

## 6. Post-migration

- [ ] README dkanster fork: «Moved to samotpravil/samotpravil-mcp» (опционально)
- [ ] GitHub redirect работает для старых issues/PR ссылок
- [ ] `npm run check-org-migration` — обновить скрипт под target-состояние (или invert checks)
- [ ] Release Please manifest на новую версию 2.0.0 (breaking: package rename)

---

## Откат

Если publish `@samotpravil/mcp` не удался:

1. Interim `samotpravil-mcp` остаётся на npm (не удалять).
2. Revert commit с rename в GitHub (или transfer обратно).
3. MCP Registry: опубликовать старый `server.json` с dkanster name.
