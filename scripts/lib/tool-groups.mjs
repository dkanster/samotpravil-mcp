const DOCS_TOOLS = new Set(["get_overview", "list_endpoints", "search_docs", "get_endpoint"]);

const CORE_TYPED_TOOLS = new Set([
  "send_email",
  "send_mail_v2",
  "get_delivery_status",
  "get_package_status",
  "search_stop_list",
  "add_stop_list_email",
  "remove_stop_list_email",
  "validate_email",
  "list_allowed_domains",
]);

const CORE_ESCAPE_TOOLS = new Set(["api_request"]);

const CORE_TYPED_PATHS = {
  send_email: { method: "POST", path: "/api/v1/smtp_send" },
  send_mail_v2: { method: "POST", path: "/api/v2/mail/send" },
  get_delivery_status: { method: "GET", path: "/api/v2/issue/status" },
  get_package_status: { method: "GET", path: "/api/v2/package/status" },
  search_stop_list: { method: "GET", path: "/api/v2/stop-list/search" },
  add_stop_list_email: { method: "POST", path: "/api/v2/stop-list/add" },
  remove_stop_list_email: { method: "POST", path: "/api/v2/stop-list/remove" },
  validate_email: { method: "POST", path: "/api/v2/emails/validate/" },
  list_allowed_domains: { method: "GET", path: "/api/v2/blist/domains" },
};

/** Python SDK parity tool → API path */
export const SDK_TOOL_PATHS = {
  send_package: { method: "POST", path: "/api/v1/add_json_package" },
  send_package_xml: { method: "GET", path: "/api/v1/add_package" },
  stop_package: { method: "GET", path: "/api/v1/package_stop" },
  get_ext_status: { method: "GET", path: "/api/v2/issue/ext_status" },
  get_statistics: { method: "GET", path: "/api/v2/issue/statistics" },
  get_non_delivery_by_date: { method: "GET", path: "/api/v2/blist/report/non-delivery" },
  get_non_delivery_by_issue: { method: "GET", path: "/api/v2/issue/report/non-delivery" },
  get_fbl_report_by_date: { method: "GET", path: "/api/v2/blist/report/fbl" },
  get_fbl_report_by_issue: { method: "GET", path: "/api/v2/issue/report/fbl" },
  get_unsubscribe_by_date: { method: "GET", path: "/api/v2/blist/report/unsubscribe" },
  get_unsubscribe_by_issue: { method: "GET", path: "/api/v2/issue/report/unsubscribe" },
  get_issue_stat: { method: "GET", path: "/api/v1/get_issue_stat" },
  stop_list_unsubscribe: { method: "GET", path: "/api/v2/stop-list/unsubscribe" },
  stop_list_fbl: { method: "GET", path: "/api/v2/stop-list/fbl" },
  stop_list_failed: { method: "GET", path: "/api/v2/stop-list/failed" },
  stop_list_export_create: { method: "POST", path: "/api/v2/stop-list/export" },
  stop_list_export_tasks: { method: "GET", path: "/api/v2/stop-list/export" },
  stop_list_export_download: { method: "GET", path: "/api/v2/stop-list/export/{token}" },
  stop_list_export_delete: { method: "DELETE", path: "/api/v2/stop-list/export/{token}" },
  domain_add: { method: "POST", path: "/api/v2/blist/domains/add" },
  domain_remove: { method: "POST", path: "/api/v2/blist/domains/remove" },
  domain_check_verification: { method: "POST", path: "/api/v2/blist/domains/verify" },
  get_blist: { method: "GET", path: "/api/v2/blist" },
  create_blist: { method: "POST", path: "/api/v2/blist/create" },
  update_blist: { method: "POST", path: "/api/v2/blist/update" },
  get_ip_info: { method: "GET", path: "/api/v2/ip" },
  get_authkey: { method: "GET", path: "/api/v2/authkey" },
  create_authkey: { method: "POST", path: "/api/v2/authkey/create" },
};

export function parseMethodPath(description) {
  if (!description) return null;
  const match = description.match(/^(GET|POST|PUT|PATCH|DELETE)\s+(\/api\/[^\s—]+)/i);
  if (!match) return null;
  return {
    method: match[1].toUpperCase(),
    path: match[2].replace(/:([a-z_]+)/gi, "{$1}"),
  };
}

export function classifyTool(name) {
  if (DOCS_TOOLS.has(name)) return "docs";
  if (CORE_ESCAPE_TOOLS.has(name)) return "core_escape";
  if (CORE_TYPED_TOOLS.has(name)) return "core_typed";
  if (SDK_TOOL_PATHS[name]) return "sdk_parity";
  if (name.startsWith("postman_")) return "postman";
  if (name.startsWith("api_")) return "auto";
  return "other";
}

export function resolveToolRoute(name, description) {
  if (CORE_TYPED_PATHS[name]) return CORE_TYPED_PATHS[name];
  if (SDK_TOOL_PATHS[name]) return SDK_TOOL_PATHS[name];
  return parseMethodPath(description);
}

export function groupCounts(tools) {
  const counts = {};
  for (const tool of tools) {
    counts[tool.group] = (counts[tool.group] ?? 0) + 1;
  }
  return counts;
}
