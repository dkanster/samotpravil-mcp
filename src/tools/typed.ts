import { z } from "zod";
import { samotpravilRequest } from "../client.js";
import { dryRunSchema } from "./api.js";

export const sendEmailSchema = dryRunSchema.extend({
  email_from: z.string().describe("Отправитель: Имя <email@domain.ru>"),
  email_to: z.string().describe("Email получателя"),
  subject: z.string().describe("Тема письма"),
  message_text: z.string().optional().describe("HTML-тело письма (если нет template_id)"),
  template_id: z.number().int().optional().describe("ID шаблона Mailganer"),
  params: z.record(z.string()).optional().describe("Переменные для подстановки"),
  x_track_id: z.string().optional(),
  track_open: z.boolean().optional(),
  track_click: z.boolean().optional(),
  track_domain: z.string().optional(),
  check_local_stop_list: z.boolean().optional(),
});

export async function handleSendEmail(params: z.infer<typeof sendEmailSchema>): Promise<string> {
  const { dry_run, ...body } = params;
  return samotpravilRequest({
    method: "POST",
    path: "/api/v1/smtp_send",
    body,
    dryRun: dry_run,
  });
}

export const sendMailV2Schema = dryRunSchema.extend({
  email_from: z.string(),
  email_to: z.string(),
  subject: z.string(),
  message_text: z.string().optional(),
  template_id: z.number().int().optional(),
  params: z.record(z.string()).optional(),
  x_track_id: z.string().optional(),
  track_open: z.boolean().optional(),
  track_click: z.boolean().optional(),
  track_domain: z.string().optional(),
});

export async function handleSendMailV2(params: z.infer<typeof sendMailV2Schema>): Promise<string> {
  const { dry_run, ...body } = params;
  return samotpravilRequest({
    method: "POST",
    path: "/api/v2/mail/send",
    body,
    dryRun: dry_run,
  });
}

export const getDeliveryStatusSchema = dryRunSchema.extend({
  x_track_id: z.string().min(1).describe("X-Track-ID отправки"),
});

export async function handleGetDeliveryStatus(
  params: z.infer<typeof getDeliveryStatusSchema>,
): Promise<string> {
  return samotpravilRequest({
    method: "GET",
    path: "/api/v2/issue/status",
    query: { x_track_id: params.x_track_id },
    dryRun: params.dry_run,
  });
}

export const getPackageStatusSchema = dryRunSchema.extend({
  issuen: z.string().min(1).describe("Номер выпуска / пакета"),
});

export async function handleGetPackageStatus(
  params: z.infer<typeof getPackageStatusSchema>,
): Promise<string> {
  return samotpravilRequest({
    method: "GET",
    path: "/api/v2/package/status",
    query: { issuen: params.issuen },
    dryRun: params.dry_run,
  });
}

export const searchStopListSchema = dryRunSchema.extend({
  email: z.string().email().describe("Email для поиска в стоп-листах"),
});

export async function handleSearchStopList(
  params: z.infer<typeof searchStopListSchema>,
): Promise<string> {
  return samotpravilRequest({
    method: "GET",
    path: "/api/v2/stop-list/search",
    query: { email: params.email },
    dryRun: params.dry_run,
  });
}

export const stopListEmailSchema = dryRunSchema.extend({
  mail_from: z.string().describe("Email отправителя (mail_from)"),
  email: z.string().email().describe("Email в стоп-листе"),
});

export async function handleAddStopListEmail(
  params: z.infer<typeof stopListEmailSchema>,
): Promise<string> {
  return samotpravilRequest({
    method: "POST",
    path: "/api/v2/stop-list/add",
    query: { mail_from: params.mail_from, email: params.email },
    dryRun: params.dry_run,
  });
}

export async function handleRemoveStopListEmail(
  params: z.infer<typeof stopListEmailSchema>,
): Promise<string> {
  return samotpravilRequest({
    method: "POST",
    path: "/api/v2/stop-list/remove",
    query: { mail_from: params.mail_from, email: params.email },
    dryRun: params.dry_run,
  });
}

export const validateEmailSchema = dryRunSchema.extend({
  email: z.string().email().describe("Email для валидации"),
});

export async function handleValidateEmail(
  params: z.infer<typeof validateEmailSchema>,
): Promise<string> {
  return samotpravilRequest({
    method: "POST",
    path: "/api/v2/emails/validate/",
    body: { email: params.email },
    dryRun: params.dry_run,
  });
}

export const listAllowedDomainsSchema = dryRunSchema.extend({});

export async function handleListAllowedDomains(
  params: z.infer<typeof listAllowedDomainsSchema>,
): Promise<string> {
  return samotpravilRequest({
    method: "GET",
    path: "/api/v2/blist/domains",
    dryRun: params.dry_run,
  });
}
