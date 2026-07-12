import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  RESOURCE_URIS,
  listEndpointResources,
  readEndpointsIndexResource,
  readEndpointResource,
  readErrorsResource,
  readIntegrationResource,
  readOverviewResource,
  readSdkMappingResource,
  readChangelogResource,
  readRateLimitsResource,
  resourceTextResult,
} from "./resources.js";

export const RESOURCE_COUNT = 8;

export function registerResources(server: McpServer): void {
  server.resource(
    "overview",
    RESOURCE_URIS.overview,
    {
      description: "Обзор API: auth, SMTP, лимиты, категории",
      mimeType: "text/markdown",
    },
    async (uri) => resourceTextResult(uri.href, await readOverviewResource()),
  );

  server.resource(
    "endpoints-index",
    RESOURCE_URIS.endpoints,
    {
      description: "Индекс всех API-методов со ссылками на endpoint resources",
      mimeType: "text/markdown",
    },
    async (uri) => resourceTextResult(uri.href, await readEndpointsIndexResource()),
  );

  server.resource(
    "errors",
    RESOURCE_URIS.errors,
    {
      description: "Популярные ошибки доставки и API",
      mimeType: "text/markdown",
    },
    async (uri) => resourceTextResult(uri.href, readErrorsResource()),
  );

  server.resource(
    "integration",
    RESOURCE_URIS.integration,
    {
      description: "SMTP, X-Track-ID, трекинг, лимиты, SDK",
      mimeType: "text/markdown",
    },
    async (uri) => resourceTextResult(uri.href, readIntegrationResource()),
  );

  server.resource(
    "sdk-mapping",
    RESOURCE_URIS.sdkMapping,
    {
      description: "Маппинг Python SDK samotpravil → MCP typed tools",
      mimeType: "text/markdown",
    },
    async (uri) => resourceTextResult(uri.href, readSdkMappingResource()),
  );

  server.resource(
    "changelog",
    RESOURCE_URIS.changelog,
    {
      description: "Последние изменения samotpravil-mcp (фрагмент CHANGELOG)",
      mimeType: "text/markdown",
    },
    async (uri) => resourceTextResult(uri.href, readChangelogResource()),
  );

  server.resource(
    "rate-limits",
    RESOURCE_URIS.rateLimits,
    {
      description: "Лимиты API, отправки и пакетов",
      mimeType: "text/markdown",
    },
    async (uri) => resourceTextResult(uri.href, readRateLimitsResource()),
  );

  server.resource(
    "endpoint",
    new ResourceTemplate(RESOURCE_URIS.endpointTemplate, {
      list: async () => ({
        resources: (await listEndpointResources()).map((item) => ({
          uri: item.uri,
          name: item.name,
          description: item.description,
          mimeType: "text/markdown",
        })),
      }),
    }),
    {
      description: "Документация по одному API-методу",
      mimeType: "text/markdown",
    },
    async (uri, { slug }) => resourceTextResult(uri.href, await readEndpointResource(String(slug))),
  );
}
