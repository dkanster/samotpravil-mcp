const BASE_URL = "https://api.samotpravil.ru";

const SEND_PATH_FRAGMENTS = [
  "/api/v1/smtp_send",
  "/api/v2/mail/send",
  "/api/v1/add_json_package",
  "/api/v1/add_package",
];

/** GET-запросы с побочным эффектом (отправка, остановка пакета). */
const SIDE_EFFECT_GET_PATH_FRAGMENTS = ["/api/v1/add_package", "/api/v1/package_stop"];

const MUTATING_POST_PREFIXES = [
  "/api/v2/stop-list/add",
  "/api/v2/stop-list/remove",
  "/api/v2/blist/domains/add",
  "/api/v2/blist/domains/remove",
  "/api/v2/blist/domains/verify",
  "/api/v2/blist/create",
  "/api/v2/blist/update",
  "/api/v2/authkey/create",
];

function envFlag(name: string): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function envFlagDefaultTrue(name: string): boolean {
  if (process.env[name] === undefined) return true;
  const value = process.env[name]?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function normalizeApiPath(path: string): string {
  const withoutQuery = path.split("?")[0] ?? path;
  const withSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  return withSlash.toLowerCase();
}

export function isReadOnlyMode(): boolean {
  return envFlag("SAMOTPRAVIL_READ_ONLY");
}

export function isAllowSend(): boolean {
  return envFlagDefaultTrue("SAMOTPRAVIL_ALLOW_SEND");
}

export function isAllowMutations(): boolean {
  return envFlagDefaultTrue("SAMOTPRAVIL_ALLOW_MUTATIONS");
}

export function isAllowGenericApi(): boolean {
  return envFlagDefaultTrue("SAMOTPRAVIL_ALLOW_GENERIC_API");
}

export function isSendPath(path: string): boolean {
  const normalized = normalizeApiPath(path);
  return SEND_PATH_FRAGMENTS.some((fragment) => normalized.includes(fragment));
}

export function isSideEffectGetPath(path: string): boolean {
  const normalized = normalizeApiPath(path);
  return SIDE_EFFECT_GET_PATH_FRAGMENTS.some((fragment) => normalized.includes(fragment));
}

function isStopListExportMutation(method: string, path: string): boolean {
  const upper = method.toUpperCase();
  const normalized = normalizeApiPath(path);

  if (upper === "POST" && (normalized === "/api/v2/stop-list/export" || normalized === "/api/v2/stop-list/export/")) {
    return true;
  }

  if (upper === "DELETE" && normalized.startsWith("/api/v2/stop-list/export/")) {
    return true;
  }

  return false;
}

export function isMutatingRequest(method: string, path: string): boolean {
  const upper = method.toUpperCase();
  const normalized = normalizeApiPath(path);

  if (isSendPath(normalized)) return true;
  if (upper === "GET" && isSideEffectGetPath(normalized)) return true;
  if (isStopListExportMutation(method, path)) return true;

  if (["POST", "PUT", "PATCH"].includes(upper)) {
    if (MUTATING_POST_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
      return true;
    }
    if (normalized.startsWith("/api/v2/tickets")) {
      return true;
    }
  }

  return false;
}

export function assertApiCallAllowed(method: string, path: string): void {
  const upper = method.toUpperCase();
  const normalized = normalizeApiPath(path);

  if (isReadOnlyMode()) {
    if (upper !== "GET" && upper !== "HEAD") {
      throw new Error(
        "Запрос заблокирован: SAMOTPRAVIL_READ_ONLY=1 (разрешены только GET/HEAD без побочных эффектов).",
      );
    }

    if (isSendPath(normalized) || isSideEffectGetPath(normalized)) {
      throw new Error(
        "Запрос заблокирован: SAMOTPRAVIL_READ_ONLY=1 (GET с побочным эффектом: отправка/остановка пакета).",
      );
    }
  }

  if (!isAllowSend() && isSendPath(normalized)) {
    throw new Error(
      "Запрос заблокирован: SAMOTPRAVIL_ALLOW_SEND=0 (отправка писем и пакетов отключена).",
    );
  }

  if (!isAllowMutations() && isMutatingRequest(method, path)) {
    throw new Error(
      "Запрос заблокирован: SAMOTPRAVIL_ALLOW_MUTATIONS=0 (изменяющие операции отключены).",
    );
  }
}

export function assertGenericApiAllowed(): void {
  if (!isAllowGenericApi()) {
    throw new Error(
      "Запрос заблокирован: SAMOTPRAVIL_ALLOW_GENERIC_API=0 (инструмент api_request отключён).",
    );
  }
}

export function formatDryRunPreview(options: {
  method: string;
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  contentType?: string;
}): string {
  const method = options.method.toUpperCase();
  const normalizedPath = options.path.startsWith("/") ? options.path : `/${options.path}`;
  const url = new URL(normalizedPath, BASE_URL);

  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  const headers = ["Authorization: <SAMOTPRAVIL_API_KEY>", "Accept: application/json"];
  if (options.body !== undefined && method !== "GET" && method !== "HEAD") {
    headers.push(`Content-Type: ${options.contentType ?? "application/json"}`);
  }

  let bodyPreview = "(none)";
  if (options.body !== undefined && method !== "GET" && method !== "HEAD") {
    bodyPreview =
      typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body, null, 2);
  }

  return [
    "DRY RUN — запрос не отправлен",
    "",
    `${method} ${url.toString()}`,
    "",
    "Headers:",
    ...headers.map((line) => `  ${line}`),
    "",
    "Body:",
    bodyPreview,
  ].join("\n");
}
