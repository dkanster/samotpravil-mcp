import { randomUUID } from "node:crypto";

export type HttpLogFields = Record<string, string | number | boolean | null | undefined>;

function compactFields(fields: HttpLogFields): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    result[key] = value;
  }
  return result;
}

export function createRequestId(): string {
  return randomUUID();
}

export function logHttpEvent(event: string, fields: HttpLogFields = {}): void {
  const payload = {
    ts: new Date().toISOString(),
    component: "samotpravil-mcp",
    transport: "http",
    event,
    ...compactFields(fields),
  };

  if (process.env.SAMOTPRAVIL_HTTP_JSON_LOG === "1") {
    console.error(JSON.stringify(payload));
    return;
  }

  const suffix = Object.entries(compactFields(fields))
    .map(([key, value]) => `${key}=${value}`)
    .join(" ");
  console.error(`[samotpravil-mcp] http ${event}${suffix ? ` ${suffix}` : ""}`);
}
