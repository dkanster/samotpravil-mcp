#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  apiRequestSchema,
  getEndpointSchema,
  getOverviewSchema,
  handleApiRequest,
  handleGetEndpoint,
  handleGetOverview,
  handleListEndpoints,
  handleSearchDocs,
  listEndpointsSchema,
  searchDocsSchema,
} from "./tools/index.js";

const TOOL_COUNT = 5;

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "samotpravil-mcp",
    version: "1.0.0",
  });

  server.tool(
    "get_overview",
    "Обзор API СамОтправил: авторизация, SMTP-настройки, лимиты, категории методов.",
    getOverviewSchema.shape,
    async () => ({ content: [{ type: "text", text: await handleGetOverview() }] }),
  );

  server.tool(
    "list_endpoints",
    "Список всех методов API из documentation.samotpravil.ru.",
    listEndpointsSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleListEndpoints(params) }] }),
  );

  server.tool(
    "search_docs",
    "Поиск по документации API СамОтправил: методы, параметры, примеры.",
    searchDocsSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleSearchDocs(params) }] }),
  );

  server.tool(
    "get_endpoint",
    "Подробная документация по конкретному методу API (параметры, примеры запроса/ответа).",
    getEndpointSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetEndpoint(params) }] }),
  );

  server.tool(
    "api_request",
    "Выполнить HTTP-запрос к api.samotpravil.ru. Требуется SAMOTPRAVIL_API_KEY.",
    apiRequestSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleApiRequest(params) }] }),
  );

  return server;
}

async function main() {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `[samotpravil-mcp] Сервер запущен (stdio). ${TOOL_COUNT} инструментов. Документация: https://documentation.samotpravil.ru/`,
  );
}

main().catch((error) => {
  console.error("[samotpravil-mcp] Ошибка:", error);
  process.exit(1);
});

export { createMcpServer };
