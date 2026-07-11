import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DOCS_BASE_URL } from "./docs.js";

export const PROMPT_COUNT = 5;

export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    "integration_overview",
    {
      description: "Обзор интеграции с СамОтправил: SMTP, HTTP API, auth, лимиты",
    },
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              "Помоги спланировать интеграцию с СамОтправил (Samotpravil SMTP API).",
              "",
              "Используй MCP tools: get_overview, samotpravil://integration, list_endpoints.",
              "",
              "Расскажи:",
              "1. SMTP (host, ports, auth) vs HTTP API",
              "2. Authorization header и SAMOTPRAVIL_API_KEY",
              "3. X-Track-ID и трекинг open/click",
              "4. Лимиты (100 писем/5 мин, 10k req/min)",
              "5. Safety flags: SAMOTPRAVIL_READ_ONLY, SAMOTPRAVIL_ALLOW_SEND, dry_run",
              "",
              `Документация: ${DOCS_BASE_URL}`,
            ].join("\n"),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "send_transactional",
    {
      description: "Чеклист отправки одного транзакционного письма через API",
      argsSchema: {
        recipient: z.string().optional().describe("Email получателя"),
        subject: z.string().optional().describe("Тема письма"),
      },
    },
    async ({ recipient, subject }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              "Отправь транзакционное письмо через СамОтправил API.",
              recipient ? `Получатель: ${recipient}` : "",
              subject ? `Тема: ${subject}` : "",
              "",
              "Шаги:",
              "1. list_allowed_domains — проверить домен отправителя",
              "2. validate_email — проверить адрес получателя",
              "3. search_stop_list — убедиться, что email не в стоп-листе",
              "4. send_mail_v2 (или send_email) с x_track_id, dry_run=true сначала",
              "5. get_delivery_status по x_track_id после отправки",
              "",
              "Не отправляй без dry_run, пока пользователь явно не подтвердит.",
            ]
              .filter(Boolean)
              .join("\n"),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "stop_list_workflow",
    {
      description: "Workflow работы со стоп-листами",
      argsSchema: {
        email: z.string().optional().describe("Email для проверки или изменения"),
        mail_from: z.string().optional().describe("Email отправителя (mail_from)"),
      },
    },
    async ({ email, mail_from }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              "Помоги работать со стоп-листами СамОтправил.",
              email ? `Email: ${email}` : "",
              mail_from ? `mail_from: ${mail_from}` : "",
              "",
              "Tools: search_stop_list, add_stop_list_email, remove_stop_list_email.",
              "Ошибка 550 bounced check filter означает попадание в стоп-лист.",
              "Сначала search, затем add/remove только по запросу пользователя.",
              "Используй dry_run для демонстрации запросов.",
            ]
              .filter(Boolean)
              .join("\n"),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "check_delivery",
    {
      description: "Проверка статуса доставки по X-Track-ID или номеру выпуска",
      argsSchema: {
        x_track_id: z.string().optional().describe("X-Track-ID отправки"),
        issuen: z.string().optional().describe("Номер выпуска / пакета"),
      },
    },
    async ({ x_track_id, issuen }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              "Проверь статус доставки в СамОтправил.",
              x_track_id ? `X-Track-ID: ${x_track_id}` : "",
              issuen ? `Выпуск: ${issuen}` : "",
              "",
              "Tools:",
              "- get_delivery_status (x_track_id) — статус одной отправки",
              "- get_package_status (issuen) — статус пакета",
              "- api_v2_issue_ext_status — все статусы выпуска",
              "",
              "Если ID не задан — спроси у пользователя.",
            ]
              .filter(Boolean)
              .join("\n"),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "python_sdk_parity",
    {
      description: "Маппинг Python SDK samotpravil → MCP tools",
    },
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              "Пользователь использует Python-библиотеку samotpravil (PyPI). Помоги найти эквивалентные MCP tools.",
              "",
              "Основные соответствия:",
              "- send_email → send_email",
              "- send_package → send_package",
              "- send_package_xml → send_package_xml",
              "- stop_package → stop_package",
              "- get_status → get_delivery_status (message_id или x_track_id)",
              "- get_ext_status → get_ext_status",
              "- get_package_status → get_package_status",
              "- get_statistics → get_statistics",
              "- get_non_delivery_by_date → get_non_delivery_by_date",
              "- get_non_delivery_by_issue → get_non_delivery_by_issue",
              "- get_fbl_report_by_date → get_fbl_report_by_date",
              "- get_fbl_report_by_issue → get_fbl_report_by_issue",
              "- get_unsubscribe_by_date → get_unsubscribe_by_date",
              "- get_unsubscribe_by_issue → get_unsubscribe_by_issue",
              "- get_issue_stat → get_issue_stat",
              "- stop_list_search → search_stop_list",
              "- stop_list_add/remove → add_stop_list_email / remove_stop_list_email (domain или mail_from)",
              "- stop_list_unsubscribe/fbl/failed → одноимённые tools",
              "- stop_list_export_* → stop_list_export_create/tasks/download/delete",
              "- get_domains → list_allowed_domains",
              "- domain_add/remove/check_verification → domain_* tools",
              "- get_blist/create_blist/update_blist → get_blist/create_blist/update_blist",
              "- get_ip_info → get_ip_info",
              "- get_authkey/create_authkey → get_authkey/create_authkey",
              "",
              "Дополнительно в MCP (нет в Python SDK): send_mail_v2, validate_email, api_* auto tools.",
              "Документация: get_overview, search_docs, samotpravil://endpoints",
            ].join("\n"),
          },
        },
      ],
    }),
  );
}
