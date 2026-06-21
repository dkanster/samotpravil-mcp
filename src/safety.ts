const BASE_URL = "https://api.samotpravil.ru";

const SEND_PATH_FRAGMENTS = [
  "/api/v1/smtp_send",
  "/api/v2/mail/send",
  "/api/v1/add_json_package",
  "/api/v1/add_package",
];

function envFlag(name: string): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function isReadOnlyMode(): boolean {
  return envFlag("SAMOTPRAVIL_READ_ONLY");
}

export function isAllowSend(): boolean {
  if (process.env.SAMOTPRAVIL_ALLOW_SEND === undefined) return true;
  const value = process.env.SAMOTPRAVIL_ALLOW_SEND.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function isSendPath(path: string): boolean {
  const normalized = path.toLowerCase();
  return SEND_PATH_FRAGMENTS.some((fragment) => normalized.includes(fragment));
}

export function assertApiCallAllowed(method: string, path: string): void {
  const upperMethod = method.toUpperCase();

  if (isReadOnlyMode() && upperMethod !== "GET" && upperMethod !== "HEAD") {
    throw new Error(
      "Запрос заблокирован: SAMOTPRAVIL_READ_ONLY=1 (разрешены только GET/HEAD).",
    );
  }

  if (!isAllowSend() && isSendPath(path)) {
    throw new Error(
      "Запрос заблокирован: SAMOTPRAVIL_ALLOW_SEND=0 (отправка писем и пакетов отключена).",
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
