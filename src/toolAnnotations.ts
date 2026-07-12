import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { isMutatingRequest, isSendPath, normalizeApiPath } from "./safety.js";

export const DOCS_ANNOTATIONS: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: false,
};

export const API_READ_ANNOTATIONS: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: true,
};

export const API_MUTATE_ANNOTATIONS: ToolAnnotations = {
  readOnlyHint: false,
  destructiveHint: true,
  openWorldHint: true,
};

export const API_SEND_ANNOTATIONS: ToolAnnotations = {
  readOnlyHint: false,
  destructiveHint: true,
  openWorldHint: true,
};

export const GENERIC_API_ANNOTATIONS: ToolAnnotations = {
  readOnlyHint: false,
  destructiveHint: true,
  openWorldHint: true,
};

export const POSTMAN_READ_ANNOTATIONS: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: true,
};

export const POSTMAN_WRITE_ANNOTATIONS: ToolAnnotations = {
  readOnlyHint: false,
  destructiveHint: true,
  openWorldHint: false,
};

const SDK_SEND_TOOLS = new Set(["send_package", "send_package_xml", "stop_package"]);

const SDK_MUTATE_TOOLS = new Set([
  "stop_list_export_create",
  "stop_list_export_delete",
  "domain_add",
  "domain_remove",
  "domain_check_verification",
  "create_blist",
  "update_blist",
  "create_authkey",
]);

const MANUAL_SEND_TOOLS = new Set(["send_email", "send_mail_v2"]);

const MANUAL_MUTATE_TOOLS = new Set([
  "add_stop_list_email",
  "remove_stop_list_email",
  "validate_email",
]);

export function annotationsForEndpoint(method: string, path: string): ToolAnnotations {
  const normalized = normalizeApiPath(path);
  if (isSendPath(normalized)) return API_SEND_ANNOTATIONS;
  if (isMutatingRequest(method, path)) return API_MUTATE_ANNOTATIONS;
  return API_READ_ANNOTATIONS;
}

export function annotationsForSdkTool(name: string): ToolAnnotations {
  if (SDK_SEND_TOOLS.has(name)) return API_SEND_ANNOTATIONS;
  if (SDK_MUTATE_TOOLS.has(name)) return API_MUTATE_ANNOTATIONS;
  return API_READ_ANNOTATIONS;
}

export function annotationsForManualTool(name: string): ToolAnnotations {
  if (["get_overview", "list_endpoints", "search_docs", "get_endpoint"].includes(name)) {
    return DOCS_ANNOTATIONS;
  }
  if (name === "api_request") return GENERIC_API_ANNOTATIONS;
  if (MANUAL_SEND_TOOLS.has(name)) return API_SEND_ANNOTATIONS;
  if (MANUAL_MUTATE_TOOLS.has(name)) return API_MUTATE_ANNOTATIONS;
  return API_READ_ANNOTATIONS;
}
