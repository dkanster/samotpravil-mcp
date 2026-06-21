# Публикация в npm

Interim-пакет: **`samotpravil-mcp`** (аккаунт maintainer).  
Будущий scoped-пакет: **`@samotpravil/mcp`** — после создания npm org.

## Первый publish

1. Создайте [npm access token](https://www.npmjs.com/settings/~youraccount/tokens) (type: **Automation** для CI, или **Publish** для ручного).
2. В GitHub repo: **Settings → Secrets → Actions → New repository secret**
   - Name: `NPM_TOKEN`
   - Value: npm token
3. Убедитесь, что версия в `package.json` обновлена.
4. Создайте и запушьте tag:

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
