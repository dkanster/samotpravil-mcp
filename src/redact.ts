const SENSITIVE_JSON_KEYS = new Set([
  "api_key",
  "authorization",
  "password",
  "secret",
  "token",
  "access_token",
  "refresh_token",
]);

function redactString(value: string, knownSecrets: string[]): string {
  let result = value;
  for (const secret of knownSecrets) {
    if (!secret || secret.length < 8) continue;
    if (result.includes(secret)) {
      result = result.split(secret).join("[REDACTED]");
    }
  }
  return result;
}

function redactJsonValue(value: unknown, knownSecrets: string[]): unknown {
  if (typeof value === "string") {
    return redactString(value, knownSecrets);
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactJsonValue(item, knownSecrets));
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      if (SENSITIVE_JSON_KEYS.has(key.toLowerCase())) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = redactJsonValue(nested, knownSecrets);
      }
    }
    return result;
  }

  return value;
}

export function redactUrlSecrets(url: string): string {
  return url.replace(/([?&]key=)[^&]*/gi, "$1[REDACTED]");
}

export function redactResponseBody(text: string, knownSecrets: string[] = []): string {
  if (!text.trim()) return text;

  try {
    const parsed = JSON.parse(text) as unknown;
    return JSON.stringify(redactJsonValue(parsed, knownSecrets), null, 2);
  } catch {
    return redactString(text, knownSecrets);
  }
}

export function redactApiResponse(
  method: string,
  url: string,
  statusLine: string,
  body: string,
  apiKey?: string,
): string {
  const secrets = apiKey?.trim() ? [apiKey.trim()] : [];
  const safeUrl = redactUrlSecrets(url);
  const safeBody = redactResponseBody(body, secrets);

  return [`${method} ${safeUrl}`, statusLine, "", safeBody || "(empty body)"].join("\n");
}
