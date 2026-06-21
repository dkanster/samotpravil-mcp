#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  apiRequestSchema,
  getDeliveryStatusSchema,
  getEndpointSchema,
  getOverviewSchema,
  getPackageStatusSchema,
  handleAddStopListEmail,
  handleApiRequest,
  handleGetDeliveryStatus,
  handleGetEndpoint,
  handleGetOverview,
  handleGetPackageStatus,
  handleListAllowedDomains,
  handleListEndpoints,
  handleRemoveStopListEmail,
  handleSearchDocs,
  handleSearchStopList,
  handleSendEmail,
  handleSendMailV2,
  handleValidateEmail,
  listAllowedDomainsSchema,
  listEndpointsSchema,
  searchDocsSchema,
  searchStopListSchema,
  sendEmailSchema,
  sendMailV2Schema,
  stopListEmailSchema,
  validateEmailSchema,
} from "./tools/index.js";
import { registerResources, RESOURCE_COUNT } from "./registerResources.js";

const PACKAGE_VERSION = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "package.json"), "utf8"),
).version as string;

const TOOL_COUNT = 14;

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "samotpravil-mcp",
    version: PACKAGE_VERSION,
  });

  server.tool("get_overview", "Обзор API СамОтправил.", getOverviewSchema.shape, async () => ({
    content: [{ type: "text", text: await handleGetOverview() }],
  }));

  server.tool("list_endpoints", "Список методов API.", listEndpointsSchema.shape, async (params) => ({
    content: [{ type: "text", text: await handleListEndpoints(params) }],
  }));

  server.tool("search_docs", "Поиск по документации API.", searchDocsSchema.shape, async (params) => ({
    content: [{ type: "text", text: await handleSearchDocs(params) }],
  }));

  server.tool("get_endpoint", "Документация по методу API.", getEndpointSchema.shape, async (params) => ({
    content: [{ type: "text", text: await handleGetEndpoint(params) }],
  }));

  server.tool(
    "api_request",
    "Generic HTTP к api.samotpravil.ru (READ_ONLY / ALLOW_SEND / dry_run).",
    apiRequestSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleApiRequest(params) }] }),
  );

  server.tool("send_email", "POST /api/v1/smtp_send", sendEmailSchema.shape, async (params) => ({
    content: [{ type: "text", text: await handleSendEmail(params) }],
  }));

  server.tool("send_mail_v2", "POST /api/v2/mail/send", sendMailV2Schema.shape, async (params) => ({
    content: [{ type: "text", text: await handleSendMailV2(params) }],
  }));

  server.tool(
    "get_delivery_status",
    "GET /api/v2/issue/status по x_track_id",
    getDeliveryStatusSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetDeliveryStatus(params) }] }),
  );

  server.tool(
    "get_package_status",
    "GET /api/v2/package/status",
    getPackageStatusSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetPackageStatus(params) }] }),
  );

  server.tool(
    "search_stop_list",
    "Поиск email в стоп-листах",
    searchStopListSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleSearchStopList(params) }] }),
  );

  server.tool(
    "add_stop_list_email",
    "Добавить email в стоп-лист",
    stopListEmailSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleAddStopListEmail(params) }] }),
  );

  server.tool(
    "remove_stop_list_email",
    "Удалить email из стоп-листа",
    stopListEmailSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleRemoveStopListEmail(params) }] }),
  );

  server.tool(
    "validate_email",
    "POST /api/v2/emails/validate/",
    validateEmailSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleValidateEmail(params) }] }),
  );

  server.tool(
    "list_allowed_domains",
    "GET /api/v2/blist/domains",
    listAllowedDomainsSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleListAllowedDomains(params) }] }),
  );

  registerResources(server);

  return server;
}

async function main() {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `[samotpravil-mcp] v${PACKAGE_VERSION} (stdio). ${TOOL_COUNT} tools, ${RESOURCE_COUNT} resources. Docs: https://documentation.samotpravil.ru/`,
  );
}

main().catch((error) => {
  console.error("[samotpravil-mcp] Ошибка:", error);
  process.exit(1);
});

export { createMcpServer, TOOL_COUNT, RESOURCE_COUNT };
