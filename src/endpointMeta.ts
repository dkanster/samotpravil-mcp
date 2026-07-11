import type { EndpointDoc } from "./types.js";
import { SDK_TYPED_API_PATHS } from "./tools/sdkTyped.js";

/** Paths covered by hand-written typed tools in src/tools/typed.ts */
export const MANUAL_API_PATHS = new Set([
  "/api/v1/smtp_send",
  "/api/v2/mail/send",
  "/api/v2/issue/status",
  "/api/v2/package/status",
  "/api/v2/stop-list/search",
  "/api/v2/stop-list/add",
  "/api/v2/stop-list/remove",
  "/api/v2/emails/validate/",
  "/api/v2/blist/domains",
  ...SDK_TYPED_API_PATHS,
]);

export function endpointApiPath(url: string): string {
  if (!url.startsWith("http")) {
    return url.split("?")[0] ?? url;
  }
  try {
    return new URL(url).pathname;
  } catch {
    return url.split("?")[0] ?? url;
  }
}

export function isSamotpravilApiEndpoint(endpoint: EndpointDoc): boolean {
  return endpoint.url.includes("api.samotpravil.ru") && endpoint.method !== "SMTP";
}

export function endpointToolName(endpoint: EndpointDoc): string {
  const path = endpointApiPath(endpoint.url);
  const method = endpoint.method.toLowerCase();
  const slug = path
    .replace(/^\/api\//, "")
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
  return `api_${method}_${slug}`;
}

export function endpointToolNameSuffix(endpoint: EndpointDoc): string {
  return endpoint.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
}

export function uniqueEndpointToolName(endpoint: EndpointDoc, usedNames: Set<string>): string {
  let name = endpointToolName(endpoint);
  if (!usedNames.has(name)) {
    usedNames.add(name);
    return name;
  }

  name = `${endpointToolName(endpoint)}_${endpointToolNameSuffix(endpoint)}`;
  let index = 2;
  while (usedNames.has(name)) {
    name = `${endpointToolName(endpoint)}_${endpointToolNameSuffix(endpoint)}_${index}`;
    index += 1;
  }

  usedNames.add(name);
  return name;
}

export function parseJsonLoose(raw: string): unknown {
  const cleaned = raw
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ")
    .replace(/,\s*([}\]])/g, "$1");
  return JSON.parse(cleaned);
}

export function queryParamsFromUrl(url: string): Record<string, string> {
  if (!url.startsWith("http")) return {};
  try {
    const parsed = new URL(url);
    const result: Record<string, string> = {};
    for (const [key, value] of parsed.searchParams) {
      result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}

export function bodyFieldsFromExample(bodyExample?: string): string[] {
  if (!bodyExample?.trim()) return [];
  try {
    const parsed = parseJsonLoose(bodyExample);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.keys(parsed as Record<string, unknown>);
    }
  } catch {
    // ignore invalid example JSON
  }
  return [];
}
