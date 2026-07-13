import type { McpServer, ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";
import {
  createAuthkeySchema,
  createBlistSchema,
  domainAddSchema,
  domainCheckVerificationSchema,
  domainRemoveSchema,
  getAuthkeySchema,
  getBlistSchema,
  getExtStatusSchema,
  getFblReportByDateSchema,
  getFblReportByIssueSchema,
  getIpInfoSchema,
  getIssueStatSchema,
  getNonDeliveryByDateSchema,
  getNonDeliveryByIssueSchema,
  getStatisticsSchema,
  getUnsubscribeByDateSchema,
  getUnsubscribeByIssueSchema,
  handleCreateAuthkey,
  handleCreateBlist,
  handleDomainAdd,
  handleDomainCheckVerification,
  handleDomainRemove,
  handleGetAuthkey,
  handleGetBlist,
  handleGetExtStatus,
  handleGetFblReportByDate,
  handleGetFblReportByIssue,
  handleGetIpInfo,
  handleGetIssueStat,
  handleGetNonDeliveryByDate,
  handleGetNonDeliveryByIssue,
  handleGetStatistics,
  handleGetUnsubscribeByDate,
  handleGetUnsubscribeByIssue,
  handleSendPackage,
  handleSendPackageXml,
  handleStopListExportCreate,
  handleStopListExportDelete,
  handleStopListExportDownload,
  handleStopListExportTasks,
  handleStopListFailed,
  handleStopListFbl,
  handleStopListUnsubscribe,
  handleStopPackage,
  handleUpdateBlist,
  SDK_TYPED_TOOL_COUNT,
  sendPackageSchema,
  sendPackageXmlSchema,
  stopListExportCreateSchema,
  stopListExportDeleteSchema,
  stopListExportDownloadSchema,
  stopListExportTasksSchema,
  stopListFailedSchema,
  stopListFblSchema,
  stopListUnsubscribeSchema,
  stopPackageSchema,
  updateBlistSchema,
} from "./tools/sdkTyped.js";
import { annotationsForSdkTool } from "./toolAnnotations.js";

export { SDK_TYPED_TOOL_COUNT };

function sdkTool<S extends z.ZodObject<z.ZodRawShape>>(
  server: McpServer,
  name: string,
  description: string,
  schema: S,
  handler: (params: z.infer<S>) => Promise<string>,
): void {
  server.registerTool(
    name,
    {
      description,
      inputSchema: schema,
      annotations: annotationsForSdkTool(name),
    },
    (async (params: z.infer<S>) => ({
      content: [{ type: "text", text: await handler(params) }],
    })) as unknown as ToolCallback<S>,
  );
}

export function registerSdkTypedTools(server: McpServer): number {
  sdkTool(server, "send_package", "POST /api/v1/add_json_package — массовая отправка (Python SDK parity)", sendPackageSchema, handleSendPackage);
  sdkTool(server, "send_package_xml", "GET /api/v1/add_package — XML-пакет по URL (Python SDK parity)", sendPackageXmlSchema, handleSendPackageXml);
  sdkTool(server, "stop_package", "GET /api/v1/package_stop — остановить пакет (Python SDK parity)", stopPackageSchema, handleStopPackage);
  sdkTool(server, "get_ext_status", "GET /api/v2/issue/ext_status — полная история статусов (Python SDK parity)", getExtStatusSchema, handleGetExtStatus);
  sdkTool(server, "get_statistics", "GET /api/v2/issue/statistics (Python SDK parity)", getStatisticsSchema, handleGetStatistics);
  sdkTool(server, "get_non_delivery_by_date", "GET /api/v2/blist/report/non-delivery (Python SDK parity)", getNonDeliveryByDateSchema, handleGetNonDeliveryByDate);
  sdkTool(server, "get_non_delivery_by_issue", "GET /api/v2/issue/report/non-delivery (Python SDK parity)", getNonDeliveryByIssueSchema, handleGetNonDeliveryByIssue);
  sdkTool(server, "get_fbl_report_by_date", "GET /api/v2/blist/report/fbl (Python SDK parity)", getFblReportByDateSchema, handleGetFblReportByDate);
  sdkTool(server, "get_fbl_report_by_issue", "GET /api/v2/issue/report/fbl (Python SDK parity)", getFblReportByIssueSchema, handleGetFblReportByIssue);
  sdkTool(server, "get_unsubscribe_by_date", "GET /api/v2/blist/report/unsubscribe (Python SDK parity)", getUnsubscribeByDateSchema, handleGetUnsubscribeByDate);
  sdkTool(server, "get_unsubscribe_by_issue", "GET /api/v2/issue/report/unsubscribe (Python SDK parity)", getUnsubscribeByIssueSchema, handleGetUnsubscribeByIssue);
  sdkTool(server, "get_issue_stat", "GET /api/v1/get_issue_stat (Python SDK parity)", getIssueStatSchema, handleGetIssueStat);
  sdkTool(server, "stop_list_unsubscribe", "GET /api/v2/stop-list/unsubscribe (Python SDK parity)", stopListUnsubscribeSchema, handleStopListUnsubscribe);
  sdkTool(server, "stop_list_fbl", "GET /api/v2/stop-list/fbl (Python SDK parity)", stopListFblSchema, handleStopListFbl);
  sdkTool(server, "stop_list_failed", "GET /api/v2/stop-list/failed (Python SDK parity)", stopListFailedSchema, handleStopListFailed);
  sdkTool(server, "stop_list_export_create", "POST /api/v2/stop-list/export — создать задачу экспорта (Python SDK parity)", stopListExportCreateSchema, handleStopListExportCreate);
  sdkTool(server, "stop_list_export_tasks", "GET /api/v2/stop-list/export — список задач экспорта (Python SDK parity)", stopListExportTasksSchema, handleStopListExportTasks);
  sdkTool(server, "stop_list_export_download", "GET /api/v2/stop-list/export/{token} (Python SDK parity)", stopListExportDownloadSchema, handleStopListExportDownload);
  sdkTool(server, "stop_list_export_delete", "DELETE /api/v2/stop-list/export/{token} (Python SDK parity)", stopListExportDeleteSchema, handleStopListExportDelete);
  sdkTool(server, "domain_add", "POST /api/v2/blist/domains/add (Python SDK parity)", domainAddSchema, handleDomainAdd);
  sdkTool(server, "domain_remove", "POST /api/v2/blist/domains/remove (Python SDK parity)", domainRemoveSchema, handleDomainRemove);
  sdkTool(server, "domain_check_verification", "POST /api/v2/blist/domains/verify (Python SDK parity)", domainCheckVerificationSchema, handleDomainCheckVerification);
  sdkTool(server, "get_blist", "GET /api/v2/blist — WhiteLabel (Python SDK parity)", getBlistSchema, handleGetBlist);
  sdkTool(server, "create_blist", "POST /api/v2/blist/create — WhiteLabel (Python SDK parity)", createBlistSchema, handleCreateBlist);
  sdkTool(server, "update_blist", "POST /api/v2/blist/update — WhiteLabel (Python SDK parity)", updateBlistSchema, handleUpdateBlist);
  sdkTool(server, "get_ip_info", "GET /api/v2/ip — WhiteLabel (Python SDK parity)", getIpInfoSchema, handleGetIpInfo);
  sdkTool(server, "get_authkey", "GET /api/v2/authkey — WhiteLabel (Python SDK parity)", getAuthkeySchema, handleGetAuthkey);
  sdkTool(server, "create_authkey", "POST /api/v2/authkey/create — WhiteLabel (Python SDK parity)", createAuthkeySchema, handleCreateAuthkey);

  return SDK_TYPED_TOOL_COUNT;
}
