import { redactApiResponse } from "./redact.js";
import { assertApiCallAllowed, formatDryRunPreview } from "./safety.js";

const BASE_URL = "https://api.samotpravil.ru";
const TIMEOUT = 30_000;

function getApiKey(): string {
  const key = process.env.SAMOTPRAVIL_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "SAMOTPRAVIL_API_KEY не задан. Добавьте ключ в .env.samotpravil или передайте через env в mcp.json.",
    );
  }
  return key;
}

export interface ApiRequestOptions {
  method: string;
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  contentType?: string;
  dryRun?: boolean;
}

export async function samotpravilRequest(options: ApiRequestOptions): Promise<string> {
  assertApiCallAllowed(options.method, options.path);

  if (options.dryRun) {
    return formatDryRunPreview(options);
  }

  const apiKey = getApiKey();
  const method = options.method.toUpperCase();
  const normalizedPath = options.path.startsWith("/") ? options.path : `/${options.path}`;
  const url = new URL(normalizedPath, BASE_URL);

  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = {
    Authorization: apiKey,
    Accept: "application/json",
  };

  let body: string | undefined;
  if (options.body !== undefined && method !== "GET" && method !== "HEAD") {
    if (typeof options.body === "string") {
      body = options.body;
      headers["Content-Type"] = options.contentType ?? "application/json";
    } else {
      body = JSON.stringify(options.body);
      headers["Content-Type"] = options.contentType ?? "application/json";
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
    });

    const text = await response.text();

    return redactApiResponse(
      method,
      url.toString(),
      `Status: ${response.status} ${response.statusText}`,
      text,
      apiKey,
    );
  } finally {
    clearTimeout(timer);
  }
}

export { BASE_URL, TIMEOUT };
