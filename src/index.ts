#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { z } from "zod";
import { isHttpMode, resolveHttpPort, startHttpServer } from "./http.js";
import { registerAutoTools } from "./registerAutoTools.js";
import { POSTMAN_TOOL_COUNT, registerPostmanTools } from "./registerPostmanTools.js";
import { PROMPT_COUNT, registerPrompts } from "./registerPrompts.js";
import { registerResources, RESOURCE_COUNT } from "./registerResources.js";
import { SDK_TYPED_TOOL_COUNT, registerSdkTypedTools } from "./registerSdkTypedTools.js";
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
import { annotationsForManualTool } from "./toolAnnotations.js";

const PACKAGE_VERSION = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "package.json"), "utf8"),
).version as string;

/** Docs (4) + api_request + 9 hand-written typed API tools */
export const CORE_MANUAL_TOOL_COUNT = 14;
export const MANUAL_TOOL_COUNT = CORE_MANUAL_TOOL_COUNT + SDK_TYPED_TOOL_COUNT;

function registerManualTools(server: McpServer): void {
  const manualTool = <S extends z.ZodObject<z.ZodRawShape>>(
    name: string,
    description: string,
    schema: S,
    handler: (params: z.infer<S>) => Promise<string>,
  ) => {
    server.registerTool(
      name,
      {
        description,
        inputSchema: schema,
        annotations: annotationsForManualTool(name),
      },
      (async (params: z.infer<S>) => ({
        content: [{ type: "text", text: await handler(params) }],
      })) as unknown as ToolCallback<S>,
    );
  };

  manualTool("get_overview", "Обзор API СамОтправил.", getOverviewSchema, () => handleGetOverview());
  manualTool("list_endpoints", "Список методов API.", listEndpointsSchema, handleListEndpoints);
  manualTool("search_docs", "Поиск по документации API.", searchDocsSchema, handleSearchDocs);
  manualTool("get_endpoint", "Документация по методу API.", getEndpointSchema, handleGetEndpoint);
  manualTool(
    "api_request",
    "Generic HTTP к api.samotpravil.ru (safety flags, dry_run). Отключается через SAMOTPRAVIL_ALLOW_GENERIC_API=0.",
    apiRequestSchema,
    handleApiRequest,
  );
  manualTool("send_email", "POST /api/v1/smtp_send", sendEmailSchema, handleSendEmail);
  manualTool("send_mail_v2", "POST /api/v2/mail/send", sendMailV2Schema, handleSendMailV2);
  manualTool(
    "get_delivery_status",
    "GET /api/v2/issue/status по x_track_id",
    getDeliveryStatusSchema,
    handleGetDeliveryStatus,
  );
  manualTool("get_package_status", "GET /api/v2/package/status", getPackageStatusSchema, handleGetPackageStatus);
  manualTool("search_stop_list", "Поиск email в стоп-листах", searchStopListSchema, handleSearchStopList);
  manualTool("add_stop_list_email", "Добавить email в стоп-лист", stopListEmailSchema, handleAddStopListEmail);
  manualTool(
    "remove_stop_list_email",
    "Удалить email из стоп-листа",
    stopListEmailSchema,
    handleRemoveStopListEmail,
  );
  manualTool("validate_email", "POST /api/v2/emails/validate/", validateEmailSchema, handleValidateEmail);
  manualTool("list_allowed_domains", "GET /api/v2/blist/domains", listAllowedDomainsSchema, handleListAllowedDomains);
}

export async function createMcpServer(): Promise<{
  server: McpServer;
  autoToolCount: number;
  postmanToolCount: number;
}> {
  const server = new McpServer({
    name: "samotpravil-mcp",
    version: PACKAGE_VERSION,
  });

  registerManualTools(server);
  registerResources(server);
  registerPrompts(server);
  registerSdkTypedTools(server);
  const postmanToolCount = registerPostmanTools(server);
  const autoToolCount = await registerAutoTools(server);

  return { server, autoToolCount, postmanToolCount };
}

async function main() {
  if (isHttpMode(process.argv)) {
    const port = resolveHttpPort(process.argv);
    await startHttpServer(() => createMcpServer().then((result) => result.server), port);
    return;
  }

  const { server, autoToolCount, postmanToolCount } = await createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);

  const totalTools = MANUAL_TOOL_COUNT + autoToolCount + postmanToolCount;
  const postmanSuffix = postmanToolCount > 0 ? ` (+${postmanToolCount} postman)` : "";
  console.error(
    `[samotpravil-mcp] v${PACKAGE_VERSION} (stdio). ${totalTools} tools${postmanSuffix}, ${PROMPT_COUNT} prompts, ${RESOURCE_COUNT} resources. Docs: https://documentation.samotpravil.ru/`,
  );
}

const isDirectRun = import.meta.url === pathToFileURL(process.argv[1] ?? "").href;

if (isDirectRun) {
  main().catch((error) => {
    console.error("[samotpravil-mcp] Ошибка:", error);
    process.exit(1);
  });
}

export { RESOURCE_COUNT, PROMPT_COUNT, POSTMAN_TOOL_COUNT, SDK_TYPED_TOOL_COUNT };
