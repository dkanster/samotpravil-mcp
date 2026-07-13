# Публикация в npm

Interim-пакет: **`samotpravil-mcp`** (аккаунт maintainer).  
Будущий scoped-пакет: **`@samotpravil/mcp`** — после создания npm org.

## Первый publish

1. Создайте [npm access token](https://www.npmjs.com/settings/~youraccount/tokens) (type: **Automation** для CI, или **Publish** для ручного).
2. В GitHub repo: **Settings → Secrets → Actions → New repository secret**
   - Name: `NPM_TOKEN`
   - Value: npm token
3. Убедитесь, что версия в `package.json` обновлена и `CHANGELOG.md` содержит секцию версии.
4. Проверка перед tag:

```bash
npm run release-prepare
```

Или по шагам:

```bash
npm run sync-versions
npm run pre-publish-check
npm test
```

5. Создайте и запушьте tag:

```bash
git tag v1.0.1
git push origin v1.0.1
```

Workflow [.github/workflows/publish.yml](../.github/workflows/publish.yml) выполнит `npm test` и `npm publish`.

## Ручной publish (локально)

```bash
npm login
npm test
npm publish --access public
```

## Проверка после publish

```bash
npx -y samotpravil-mcp@latest --help 2>&1 | head -1
# или запуск через MCP config из docs/EXAMPLES.md
```

---

## MCP Registry

Метаданные сервера: [`server.json`](../server.json).  
`package.json` → `mcpName` **должен совпадать** с `server.json` → `name`.

### CI (рекомендуется)

При push tag `v*` workflow [.github/workflows/publish.yml](../.github/workflows/publish.yml) публикует в npm; после успешного завершения [.github/workflows/mcp-registry.yml](../.github/workflows/mcp-registry.yml) публикует в [registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io) (через `workflow_run`, с ожиданием появления пакета на npm).

Ручной запуск registry:

```bash
gh workflow run "Publish MCP Registry" --repo dkanster/samotpravil-api-mcp
```

### Smithery

Файл [`smithery.yaml`](../smithery.yaml) в корне — конфигурация install wizard на [smithery.ai](https://smithery.ai). После merge в main подключите репозиторий в Smithery Dashboard (Build from GitHub).

### Локально

```bash
brew install mcp-publisher
mcp-publisher validate server.json
mcp-publisher login github
mcp-publisher publish server.json
```

### Проверка

```bash
curl -s "https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.dkanster/samotpravil-api-mcp" | head -c 500
```
