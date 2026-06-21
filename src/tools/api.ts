import { z } from "zod";
import { samotpravilRequest } from "../client.js";

export const dryRunSchema = z.object({
  dry_run: z.boolean().optional().describe("Показать запрос без отправки на API"),
});

export const apiRequestSchema = dryRunSchema.extend({
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).describe("HTTP-метод"),
  path: z.string().min(1).describe("Путь API, например /api/v1/smtp_send"),
  query: z
    .record(z.union([z.string(), z.number(), z.boolean()]))
    .optional()
    .describe("Query-параметры"),
  body: z.union([z.string(), z.record(z.unknown())]).optional().describe("JSON-тело запроса"),
});

export async function handleApiRequest(params: z.infer<typeof apiRequestSchema>): Promise<string> {
  return samotpravilRequest({
    method: params.method,
    path: params.path,
    query: params.query,
    body: params.body,
    dryRun: params.dry_run,
  });
}
