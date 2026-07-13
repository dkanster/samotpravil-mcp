import { z } from "zod";
import { samotpravilRequest } from "../client.js";
import { dryRunSchema } from "./api.js";

const dateRangeSchema = dryRunSchema.extend({
  date_from: z.string().describe("Дата YYYY-MM-DD"),
  date_to: z.string().describe("Дата YYYY-MM-DD"),
  limit: z.number().int().optional().describe("Лимит объектов (default 100)"),
  cursor_next: z.number().int().optional().describe("Пагинация"),
});

const paginatedListSchema = dryRunSchema.extend({
  limit: z.number().int().optional().describe("Лимит (default 50)"),
  cursor_next: z.number().int().optional().describe("Пагинация"),
});

export const sendPackageSchema = dryRunSchema.extend({
  email_from: z.string(),
  name_from: z.string(),
  subject: z.string(),
  message_text: z.string(),
  users: z
    .array(z.record(z.string(), z.unknown()))
    .min(1)
    .describe("Список получателей; каждый объект должен содержать emailto"),
  message_text_amp: z.string().optional(),
  check_local_stop_list: z.boolean().optional(),
  check_global_stop_list: z.boolean().optional(),
  track_open: z.boolean().optional(),
  track_click: z.boolean().optional(),
  track_domain: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  is_moderate: z.boolean().optional(),
  html_prettify: z.boolean().optional(),
});

export async function handleSendPackage(params: z.infer<typeof sendPackageSchema>): Promise<string> {
  const { dry_run, ...body } = params;
  return samotpravilRequest({ method: "POST", path: "/api/v1/add_json_package", body, dryRun: dry_run });
}

export const sendPackageXmlSchema = dryRunSchema.extend({
  url: z.string().url().describe("URL XML-пакета"),
});

export async function handleSendPackageXml(params: z.infer<typeof sendPackageXmlSchema>): Promise<string> {
  return samotpravilRequest({
    method: "GET",
    path: "/api/v1/add_package",
    query: { url: params.url },
    dryRun: params.dry_run,
  });
}

export const stopPackageSchema = dryRunSchema.extend({
  package_id: z.string().min(1),
});

export async function handleStopPackage(params: z.infer<typeof stopPackageSchema>): Promise<string> {
  return samotpravilRequest({
    method: "GET",
    path: "/api/v1/package_stop",
    query: { package_id: params.package_id },
    dryRun: params.dry_run,
  });
}

export const getExtStatusSchema = dryRunSchema.extend({
  message_id: z.string().optional(),
  x_track_id: z.string().optional(),
});

export async function handleGetExtStatus(params: z.infer<typeof getExtStatusSchema>): Promise<string> {
  const query: Record<string, string> = {};
  if (params.message_id) query.message_id = params.message_id;
  if (params.x_track_id) query.x_track_id = params.x_track_id;
  if (!query.message_id && !query.x_track_id) {
    throw new Error("Укажите message_id или x_track_id");
  }
  return samotpravilRequest({
    method: "GET",
    path: "/api/v2/issue/ext_status",
    query,
    dryRun: params.dry_run,
  });
}

export const getStatisticsSchema = dateRangeSchema;

export async function handleGetStatistics(params: z.infer<typeof getStatisticsSchema>): Promise<string> {
  const { dry_run, ...query } = params;
  return samotpravilRequest({
    method: "GET",
    path: "/api/v2/issue/statistics",
    query,
    dryRun: dry_run,
  });
}

export const getNonDeliveryByDateSchema = dateRangeSchema;

export async function handleGetNonDeliveryByDate(
  params: z.infer<typeof getNonDeliveryByDateSchema>,
): Promise<string> {
  const { dry_run, ...query } = params;
  return samotpravilRequest({
    method: "GET",
    path: "/api/v2/blist/report/non-delivery",
    query,
    dryRun: dry_run,
  });
}

export const getNonDeliveryByIssueSchema = dryRunSchema.extend({
  issuen: z.union([z.string(), z.number()]),
  limit: z.number().int().optional(),
  cursor_next: z.number().int().optional(),
});

export async function handleGetNonDeliveryByIssue(
  params: z.infer<typeof getNonDeliveryByIssueSchema>,
): Promise<string> {
  const { dry_run, issuen, ...rest } = params;
  return samotpravilRequest({
    method: "GET",
    path: "/api/v2/issue/report/non-delivery",
    query: { issuen: String(issuen), ...rest },
    dryRun: dry_run,
  });
}

export const getFblReportByDateSchema = dateRangeSchema;

export async function handleGetFblReportByDate(
  params: z.infer<typeof getFblReportByDateSchema>,
): Promise<string> {
  const { dry_run, ...query } = params;
  return samotpravilRequest({
    method: "GET",
    path: "/api/v2/blist/report/fbl",
    query,
    dryRun: dry_run,
  });
}

export const getFblReportByIssueSchema = dryRunSchema.extend({
  issuen: z.union([z.string(), z.number()]),
  limit: z.number().int().optional(),
  cursor_next: z.number().int().optional(),
});

export async function handleGetFblReportByIssue(
  params: z.infer<typeof getFblReportByIssueSchema>,
): Promise<string> {
  const { dry_run, issuen, ...rest } = params;
  return samotpravilRequest({
    method: "GET",
    path: "/api/v2/issue/report/fbl",
    query: { issuen: String(issuen), ...rest },
    dryRun: dry_run,
  });
}

export const getUnsubscribeByDateSchema = dateRangeSchema.extend({
  order: z.enum(["asc", "desc"]).optional(),
});

export async function handleGetUnsubscribeByDate(
  params: z.infer<typeof getUnsubscribeByDateSchema>,
): Promise<string> {
  const { dry_run, ...query } = params;
  return samotpravilRequest({
    method: "GET",
    path: "/api/v2/blist/report/unsubscribe",
    query,
    dryRun: dry_run,
  });
}

export const getUnsubscribeByIssueSchema = dryRunSchema.extend({
  issuen: z.union([z.string(), z.number()]),
  limit: z.number().int().optional(),
  cursor_next: z.number().int().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export async function handleGetUnsubscribeByIssue(
  params: z.infer<typeof getUnsubscribeByIssueSchema>,
): Promise<string> {
  const { dry_run, issuen, ...rest } = params;
  return samotpravilRequest({
    method: "GET",
    path: "/api/v2/issue/report/unsubscribe",
    query: { issuen: String(issuen), ...rest },
    dryRun: dry_run,
  });
}

export const getIssueStatSchema = dryRunSchema.extend({
  ids: z.array(z.union([z.string(), z.number()])).min(1).describe("ID пакетов из send_package"),
});

export async function handleGetIssueStat(params: z.infer<typeof getIssueStatSchema>): Promise<string> {
  return samotpravilRequest({
    method: "GET",
    path: "/api/v1/get_issue_stat",
    query: { ids: params.ids.map(String).join(",") },
    dryRun: params.dry_run,
  });
}

export const stopListUnsubscribeSchema = paginatedListSchema;
export const stopListFblSchema = paginatedListSchema;
export const stopListFailedSchema = paginatedListSchema;

export async function handleStopListUnsubscribe(
  params: z.infer<typeof stopListUnsubscribeSchema>,
): Promise<string> {
  const { dry_run, ...query } = params;
  return samotpravilRequest({
    method: "GET",
    path: "/api/v2/stop-list/unsubscribe",
    query,
    dryRun: dry_run,
  });
}

export async function handleStopListFbl(params: z.infer<typeof stopListFblSchema>): Promise<string> {
  const { dry_run, ...query } = params;
  return samotpravilRequest({
    method: "GET",
    path: "/api/v2/stop-list/fbl",
    query,
    dryRun: dry_run,
  });
}

export async function handleStopListFailed(params: z.infer<typeof stopListFailedSchema>): Promise<string> {
  const { dry_run, ...query } = params;
  return samotpravilRequest({
    method: "GET",
    path: "/api/v2/stop-list/failed",
    query,
    dryRun: dry_run,
  });
}

export const stopListExportCreateSchema = dryRunSchema.extend({});

export async function handleStopListExportCreate(
  params: z.infer<typeof stopListExportCreateSchema>,
): Promise<string> {
  return samotpravilRequest({
    method: "POST",
    path: "/api/v2/stop-list/export",
    dryRun: params.dry_run,
  });
}

export const stopListExportTasksSchema = dryRunSchema.extend({
  status: z.enum(["processing", "ready", "not_found", "failed"]).optional(),
});

export async function handleStopListExportTasks(
  params: z.infer<typeof stopListExportTasksSchema>,
): Promise<string> {
  const { dry_run, status } = params;
  return samotpravilRequest({
    method: "GET",
    path: "/api/v2/stop-list/export",
    query: status ? { status } : undefined,
    dryRun: dry_run,
  });
}

export const stopListExportDownloadSchema = dryRunSchema.extend({
  token: z.string().min(1).describe("Имя файла из stop_list_export_create"),
});

export async function handleStopListExportDownload(
  params: z.infer<typeof stopListExportDownloadSchema>,
): Promise<string> {
  const token = params.token.endsWith(".gz") ? params.token : `${params.token}.gz`;
  return samotpravilRequest({
    method: "GET",
    path: `/api/v2/stop-list/export/${token}`,
    dryRun: params.dry_run,
  });
}

export const stopListExportDeleteSchema = dryRunSchema.extend({
  token: z.string().min(1),
});

export async function handleStopListExportDelete(
  params: z.infer<typeof stopListExportDeleteSchema>,
): Promise<string> {
  const token = params.token.endsWith(".gz") ? params.token : `${params.token}.gz`;
  return samotpravilRequest({
    method: "DELETE",
    path: `/api/v2/stop-list/export/${token}`,
    dryRun: params.dry_run,
  });
}

export const domainAddSchema = dryRunSchema.extend({
  domain: z.string().min(1),
});

export async function handleDomainAdd(params: z.infer<typeof domainAddSchema>): Promise<string> {
  return samotpravilRequest({
    method: "POST",
    path: "/api/v2/blist/domains/add",
    body: { domain: params.domain },
    dryRun: params.dry_run,
  });
}

export const domainRemoveSchema = domainAddSchema;

export async function handleDomainRemove(params: z.infer<typeof domainRemoveSchema>): Promise<string> {
  return samotpravilRequest({
    method: "POST",
    path: "/api/v2/blist/domains/remove",
    body: { domain: params.domain },
    dryRun: params.dry_run,
  });
}

export const domainCheckVerificationSchema = domainAddSchema;

export async function handleDomainCheckVerification(
  params: z.infer<typeof domainCheckVerificationSchema>,
): Promise<string> {
  return samotpravilRequest({
    method: "POST",
    path: "/api/v2/blist/domains/verify",
    body: { domain: params.domain },
    dryRun: params.dry_run,
  });
}

export const getBlistSchema = dryRunSchema.extend({
  blist_id: z.union([z.string(), z.number()]),
});

export async function handleGetBlist(params: z.infer<typeof getBlistSchema>): Promise<string> {
  return samotpravilRequest({
    method: "GET",
    path: "/api/v2/blist",
    query: { blist_id: String(params.blist_id) },
    dryRun: params.dry_run,
  });
}

export const createBlistSchema = dryRunSchema.extend({
  name: z.string().min(1),
  check_stop_list: z.boolean().optional(),
  webhook_active: z.boolean().optional(),
  webhook_url: z.string().optional(),
  web_hook_send_accepted_delivered: z.boolean().optional(),
  webhook_send_xml_failed_global: z.boolean().optional(),
});

export async function handleCreateBlist(params: z.infer<typeof createBlistSchema>): Promise<string> {
  const { dry_run, ...body } = params;
  return samotpravilRequest({ method: "POST", path: "/api/v2/blist/create", body, dryRun: dry_run });
}

export const updateBlistSchema = dryRunSchema.extend({
  blist_id: z.union([z.string(), z.number()]),
  active: z.boolean().optional(),
  name: z.string().optional(),
  check_stop_list: z.boolean().optional(),
  webhook_active: z.boolean().optional(),
  webhook_url: z.string().optional(),
  web_hook_send_accepted_delivered: z.boolean().optional(),
  webhook_send_xml_failed_global: z.boolean().optional(),
});

export async function handleUpdateBlist(params: z.infer<typeof updateBlistSchema>): Promise<string> {
  const { dry_run, blist_id, ...body } = params;
  return samotpravilRequest({
    method: "POST",
    path: "/api/v2/blist/update",
    body: { blist_id, ...body },
    dryRun: dry_run,
  });
}

export const getIpInfoSchema = dryRunSchema.extend({});

export async function handleGetIpInfo(params: z.infer<typeof getIpInfoSchema>): Promise<string> {
  return samotpravilRequest({ method: "GET", path: "/api/v2/ip", dryRun: params.dry_run });
}

export const getAuthkeySchema = dryRunSchema.extend({});

export async function handleGetAuthkey(params: z.infer<typeof getAuthkeySchema>): Promise<string> {
  return samotpravilRequest({ method: "GET", path: "/api/v2/authkey", dryRun: params.dry_run });
}

export const createAuthkeySchema = dryRunSchema.extend({
  blist_id: z.number().int(),
  check_ips: z.boolean().optional(),
  allowed_ips: z.array(z.string()).optional(),
});

export async function handleCreateAuthkey(params: z.infer<typeof createAuthkeySchema>): Promise<string> {
  const { dry_run, ...body } = params;
  return samotpravilRequest({ method: "POST", path: "/api/v2/authkey/create", body, dryRun: dry_run });
}

/** Paths covered by Python SDK parity typed tools */
export const SDK_TYPED_API_PATHS = [
  "/api/v1/add_json_package",
  "/api/v1/add_package",
  "/api/v1/package_stop",
  "/api/v2/issue/ext_status",
  "/api/v2/issue/statistics",
  "/api/v2/blist/report/non-delivery",
  "/api/v2/issue/report/non-delivery",
  "/api/v2/blist/report/fbl",
  "/api/v2/issue/report/fbl",
  "/api/v2/blist/report/unsubscribe",
  "/api/v2/issue/report/unsubscribe",
  "/api/v1/get_issue_stat",
  "/api/v2/stop-list/unsubscribe",
  "/api/v2/stop-list/fbl",
  "/api/v2/stop-list/failed",
  "/api/v2/stop-list/export",
  "/api/v2/blist/domains/add",
  "/api/v2/blist/domains/remove",
  "/api/v2/blist/domains/verify",
  "/api/v2/blist",
  "/api/v2/blist/create",
  "/api/v2/blist/update",
  "/api/v2/ip",
  "/api/v2/authkey",
  "/api/v2/authkey/create",
] as const;

export const SDK_TYPED_TOOL_COUNT = 28;
