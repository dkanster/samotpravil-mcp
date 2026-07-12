import type { EndpointDoc } from "./types.js";
import { endpointApiPath } from "./endpointMeta.js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DOCS_BASE_URL,
  findEndpoint,
  formatEndpoint,
  formatOverview,
  loadDocumentation,
} from "./docs.js";

export const RESOURCE_URIS = {
  overview: "samotpravil://overview",
  endpoints: "samotpravil://endpoints",
  errors: "samotpravil://errors",
  integration: "samotpravil://integration",
  sdkMapping: "samotpravil://sdk-mapping",
  changelog: "samotpravil://changelog",
  endpointTemplate: "samotpravil://endpoint/{slug}",
} as const;

export function endpointSlug(endpoint: EndpointDoc, allEndpoints?: EndpointDoc[]): string {
  const apiPath = endpointApiPath(endpoint.url);
  const short = apiPath.match(/\/api\/(?:v\d+\/)?([^/?]+)/)?.[1];

  if (short && allEndpoints) {
    const duplicates = allEndpoints.filter((item) => {
      const match = endpointApiPath(item.url).match(/\/api\/(?:v\d+\/)?([^/?]+)/);
      return match?.[1] === short;
    });
    if (duplicates.length === 1) return short;
  }

  if (short && !allEndpoints) return short;

  if (apiPath.startsWith("/api/")) {
    return apiPath
      .replace(/^\/api\//, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase()
      .slice(0, 64);
  }

  return endpoint.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function findEndpointBySlug(endpoints: EndpointDoc[], slug: string): EndpointDoc | undefined {
  const needle = slug.trim().toLowerCase();
  return endpoints.find((endpoint) => endpointSlug(endpoint, endpoints).toLowerCase() === needle);
}

export async function readOverviewResource(): Promise<string> {
  const { overview } = await loadDocumentation();
  return formatOverview(overview);
}

export async function readEndpointsIndexResource(): Promise<string> {
  const { endpoints } = await loadDocumentation();
  const lines = endpoints.map((endpoint) => {
    const slug = endpointSlug(endpoint, endpoints);
    return `- [${slug}](samotpravil://endpoint/${slug}) — ${endpoint.method} ${endpoint.name} (${endpoint.category})`;
  });

  return [
    "# Индекс API методов СамОтправил",
    "",
    `Всего: ${endpoints.length}. Документация: ${DOCS_BASE_URL}`,
    "",
    ...lines,
  ].join("\n");
}

export function readErrorsResource(): string {
  return [
    "# Популярные ошибки СамОтправил",
    "",
    "| Ошибка | Причина | Что делать |",
    "|--------|---------|------------|",
    "| `550 bounced check filter` | Email в стоп-листе | Проверить stop-list, не отправлять повторно без обработки |",
    "| `501 from domain not trusted` | Домен отправителя не верифицирован | Добавить домен в разрешённые, настроить SPF/DKIM |",
    "| `421 SMTP command timeout` | Долгое SMTP-соединение без активности | Переиспользовать соединение или закрывать после отправки |",
    "| `450 ratelimit exceeded` | Превышен лимит отправки (100/5 мин по умолчанию) | Throttling, запрос увеличения лимита в поддержку |",
    "| HTTP `429` / `E429` | Превышен лимит API или пакетов | Подождать, exponential backoff |",
    "",
    "Подробнее: https://mailganer.com/ru/explanation/oshibki-nedostavki",
    "Стоп-листы: https://mailganer.com/ru/explanation/stop-listy-smtp",
  ].join("\n");
}

export function readIntegrationResource(): string {
  return [
    "# Интеграция с СамОтправил",
    "",
    "## SMTP",
    "- Host: `api.samotpravil.ru`",
    "- Ports: `1126` (plain), `1127` (TLS)",
    "- Auth: LOGIN, логин + API key",
    "",
    "## HTTP API",
    "- Base URL: `https://api.samotpravil.ru`",
    "- Header: `Authorization: {api_key}`",
    "",
    "## X-Track-ID",
    "Уникальный ID каждой отправки. Рекомендуемый формат:",
    "`{login}-{timestamp}-{campaign_id}-{email_id}`",
    "",
    "Передавайте в заголовке письма и в API-параметре `x_track_id`.",
    "",
    "## Трекинг открытий и кликов",
    "- Open pixel: `{domain}/open/{X-Track-ID}`",
    "- Click redirect: `{domain}/click/{X-Track-ID}?goto_url={url}`",
    "- Domain: `track.smtprvl.ru` или свой (через поддержку)",
    "",
    "В API: `track_open`, `track_click`, `track_domain`.",
    "",
    "## Лимиты (по умолчанию)",
    "- API: 10 000 req/min",
    "- Отправка: 100 писем / 5 мин",
    "- Пакеты: 40 / 5 мин",
    "- Размер письма: до 50 MB",
    "",
    "## SDK",
    "- Python: https://pypi.org/project/samotpravil/",
    "- PHP: https://github.com/kostikpenzin/samotpravil",
    "- Ruby: https://rubygems.org/gems/mailganer-client",
    "",
    `Документация: ${DOCS_BASE_URL}`,
  ].join("\n");
}

export async function readEndpointResource(slug: string): Promise<string> {
  const { endpoints } = await loadDocumentation();
  const endpoint = findEndpointBySlug(endpoints, slug) ?? findEndpoint(endpoints, slug);

  if (!endpoint) {
    throw new Error(`Endpoint not found for slug: ${slug}`);
  }

  return formatEndpoint(endpoint);
}

export async function listEndpointResources(): Promise<
  Array<{ uri: string; name: string; description?: string }>
> {
  const { endpoints } = await loadDocumentation();
  return endpoints.map((endpoint) => ({
    uri: `${RESOURCE_URIS.endpointTemplate.replace("{slug}", endpointSlug(endpoint, endpoints))}`,
    name: endpoint.name,
    description: `${endpoint.method} ${endpoint.url}`,
  }));
}

export function readSdkMappingResource(): string {
  const sdkTools = [
    "send_package → POST /api/v1/add_json_package",
    "send_package_xml → GET /api/v1/add_package",
    "stop_package → GET /api/v1/package_stop",
    "get_ext_status → GET /api/v2/issue/ext_status",
    "get_statistics → GET /api/v2/issue/statistics",
    "get_delivery_status → GET /api/v2/issue/status",
    "get_package_status → GET /api/v2/package/status",
    "search_stop_list → GET /api/v2/stop-list/search",
    "add_stop_list_email → POST /api/v2/stop-list/add",
    "remove_stop_list_email → POST /api/v2/stop-list/remove",
    "domain_add / domain_remove / domain_check_verification → blist domains",
    "create_blist / update_blist / get_blist → WhiteLabel",
    "create_authkey / get_authkey → authkey",
  ];

  return [
    "# Python SDK → MCP tools",
    "",
    "Имена typed tools в MCP совпадают с методами PyPI-пакета `samotpravil`.",
    "Полный список: prompt `python_sdk_parity` или docs/EXAMPLES.md#python-sdk-parity.",
    "",
    "## Основные соответствия",
    "",
    ...sdkTools.map((line) => `- ${line}`),
    "",
    "Python SDK: https://pypi.org/project/samotpravil/",
  ].join("\n");
}

export function readChangelogResource(): string {
  const changelogPath = join(dirname(fileURLToPath(import.meta.url)), "..", "CHANGELOG.md");
  const raw = readFileSync(changelogPath, "utf8");
  const match = raw.match(/## \[Unreleased\][\s\S]*?(?=\n## \[)/);
  const section = match?.[0]?.trim() ?? raw.slice(0, 1500);
  return ["# Changelog (фрагмент)", "", section, "", "Полный файл: CHANGELOG.md в репозитории."].join("\n");
}

export function resourceTextResult(uri: string, text: string) {
  return {
    contents: [
      {
        uri,
        mimeType: "text/markdown",
        text,
      },
    ],
  };
}
