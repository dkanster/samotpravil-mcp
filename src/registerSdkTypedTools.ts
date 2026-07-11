import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
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

export { SDK_TYPED_TOOL_COUNT };

export function registerSdkTypedTools(server: McpServer): number {
  server.tool(
    "send_package",
    "POST /api/v1/add_json_package — массовая отправка (Python SDK parity)",
    sendPackageSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleSendPackage(params) }] }),
  );

  server.tool(
    "send_package_xml",
    "GET /api/v1/add_package — XML-пакет по URL (Python SDK parity)",
    sendPackageXmlSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleSendPackageXml(params) }] }),
  );

  server.tool(
    "stop_package",
    "GET /api/v1/package_stop — остановить пакет (Python SDK parity)",
    stopPackageSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleStopPackage(params) }] }),
  );

  server.tool(
    "get_ext_status",
    "GET /api/v2/issue/ext_status — полная история статусов (Python SDK parity)",
    getExtStatusSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetExtStatus(params) }] }),
  );

  server.tool(
    "get_statistics",
    "GET /api/v2/issue/statistics (Python SDK parity)",
    getStatisticsSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetStatistics(params) }] }),
  );

  server.tool(
    "get_non_delivery_by_date",
    "GET /api/v2/blist/report/non-delivery (Python SDK parity)",
    getNonDeliveryByDateSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetNonDeliveryByDate(params) }] }),
  );

  server.tool(
    "get_non_delivery_by_issue",
    "GET /api/v2/issue/report/non-delivery (Python SDK parity)",
    getNonDeliveryByIssueSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetNonDeliveryByIssue(params) }] }),
  );

  server.tool(
    "get_fbl_report_by_date",
    "GET /api/v2/blist/report/fbl (Python SDK parity)",
    getFblReportByDateSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetFblReportByDate(params) }] }),
  );

  server.tool(
    "get_fbl_report_by_issue",
    "GET /api/v2/issue/report/fbl (Python SDK parity)",
    getFblReportByIssueSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetFblReportByIssue(params) }] }),
  );

  server.tool(
    "get_unsubscribe_by_date",
    "GET /api/v2/blist/report/unsubscribe (Python SDK parity)",
    getUnsubscribeByDateSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetUnsubscribeByDate(params) }] }),
  );

  server.tool(
    "get_unsubscribe_by_issue",
    "GET /api/v2/issue/report/unsubscribe (Python SDK parity)",
    getUnsubscribeByIssueSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetUnsubscribeByIssue(params) }] }),
  );

  server.tool(
    "get_issue_stat",
    "GET /api/v1/get_issue_stat (Python SDK parity)",
    getIssueStatSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetIssueStat(params) }] }),
  );

  server.tool(
    "stop_list_unsubscribe",
    "GET /api/v2/stop-list/unsubscribe (Python SDK parity)",
    stopListUnsubscribeSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleStopListUnsubscribe(params) }] }),
  );

  server.tool(
    "stop_list_fbl",
    "GET /api/v2/stop-list/fbl (Python SDK parity)",
    stopListFblSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleStopListFbl(params) }] }),
  );

  server.tool(
    "stop_list_failed",
    "GET /api/v2/stop-list/failed (Python SDK parity)",
    stopListFailedSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleStopListFailed(params) }] }),
  );

  server.tool(
    "stop_list_export_create",
    "POST /api/v2/stop-list/export — создать задачу экспорта (Python SDK parity)",
    stopListExportCreateSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleStopListExportCreate(params) }] }),
  );

  server.tool(
    "stop_list_export_tasks",
    "GET /api/v2/stop-list/export — список задач экспорта (Python SDK parity)",
    stopListExportTasksSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleStopListExportTasks(params) }] }),
  );

  server.tool(
    "stop_list_export_download",
    "GET /api/v2/stop-list/export/{token} (Python SDK parity)",
    stopListExportDownloadSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleStopListExportDownload(params) }] }),
  );

  server.tool(
    "stop_list_export_delete",
    "DELETE /api/v2/stop-list/export/{token} (Python SDK parity)",
    stopListExportDeleteSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleStopListExportDelete(params) }] }),
  );

  server.tool(
    "domain_add",
    "POST /api/v2/blist/domains/add (Python SDK parity)",
    domainAddSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleDomainAdd(params) }] }),
  );

  server.tool(
    "domain_remove",
    "POST /api/v2/blist/domains/remove (Python SDK parity)",
    domainRemoveSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleDomainRemove(params) }] }),
  );

  server.tool(
    "domain_check_verification",
    "POST /api/v2/blist/domains/verify (Python SDK parity)",
    domainCheckVerificationSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleDomainCheckVerification(params) }] }),
  );

  server.tool(
    "get_blist",
    "GET /api/v2/blist — WhiteLabel (Python SDK parity)",
    getBlistSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetBlist(params) }] }),
  );

  server.tool(
    "create_blist",
    "POST /api/v2/blist/create — WhiteLabel (Python SDK parity)",
    createBlistSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleCreateBlist(params) }] }),
  );

  server.tool(
    "update_blist",
    "POST /api/v2/blist/update — WhiteLabel (Python SDK parity)",
    updateBlistSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleUpdateBlist(params) }] }),
  );

  server.tool(
    "get_ip_info",
    "GET /api/v2/ip — WhiteLabel (Python SDK parity)",
    getIpInfoSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetIpInfo(params) }] }),
  );

  server.tool(
    "get_authkey",
    "GET /api/v2/authkey — WhiteLabel (Python SDK parity)",
    getAuthkeySchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetAuthkey(params) }] }),
  );

  server.tool(
    "create_authkey",
    "POST /api/v2/authkey/create — WhiteLabel (Python SDK parity)",
    createAuthkeySchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleCreateAuthkey(params) }] }),
  );

  return SDK_TYPED_TOOL_COUNT;
}
