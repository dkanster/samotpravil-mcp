import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  DocsOverview,
  EndpointDoc,
  EndpointExample,
  PostmanCollection,
  PostmanItem,
  PostmanRequest,
} from "./types.js";

export const COLLECTION_URL =
  "https://documentation.samotpravil.ru/api/collections/26779685/2s93RZM9in?segregateAuth=true&versionTag=latest";

export const DOCS_BASE_URL = "https://documentation.samotpravil.ru/";

const FETCH_TIMEOUT_MS = 10_000;
const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SNAPSHOT_PATH = join(PACKAGE_ROOT, "data", "collection.snapshot.json");
const SNAPSHOT_META_PATH = join(PACKAGE_ROOT, "data", "snapshot.meta.json");

type DocsMode = "auto" | "live" | "snapshot";

let cachedEndpoints: EndpointDoc[] | null = null;
let cachedOverview: DocsOverview | null = null;

interface SnapshotMeta {
  syncedAt?: string;
  publishDate?: string;
  endpointCount?: number;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<pre[\s\S]*?<\/pre>/gi, (block) => block.replace(/<[^>]+>/g, " "))
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "$1")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "$2 ($1)")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function requestUrl(request: PostmanRequest): string {
  const url = request.url;
  if (typeof url === "string") return url;
  if (!url) return "";

  const host = url.host?.join(".") ?? "";
  const path = url.path?.join("/") ?? "";
  if (url.port && !path) return `${host}:${url.port}`;
  if (path) return `${url.protocol ?? "https"}://${host}/${path}`;
  return host;
}

function walkItems(items: PostmanItem[], category = "", acc: EndpointDoc[] = []): EndpointDoc[] {
  for (const item of items) {
    const nextCategory = category ? `${category} / ${item.name ?? ""}` : (item.name ?? "");

    if (item.request) {
      const request = item.request;
      const examples: EndpointExample[] = (item.response ?? []).map((response) => ({
        name: response.name ?? "Example",
        status: response.status,
        code: response.code,
        body: response.body,
      }));

      acc.push({
        id: item.id ?? requestUrl(request),
        category: category || "Общее",
        name: item.name ?? "Без названия",
        method: request.method ?? "GET",
        url: requestUrl(request),
        description: stripHtml(request.description ?? ""),
        bodyExample: request.body?.raw,
        examples,
      });
    }

    if (item.item?.length) {
      walkItems(item.item, nextCategory, acc);
    }
  }

  return acc;
}

function extractLimits(description: string): string[] {
  const limits: string[] = [];
  const patterns = [
    /не более \*\*([^*]+)\*\*/gi,
    /ограничение `([^`]+)`/gi,
    /лимит[^.]{0,80}\./gi,
    /450 ratelimit exceeded/gi,
    /429/gi,
  ];

  for (const pattern of patterns) {
    const matches = description.match(pattern);
    if (matches) limits.push(...matches.map((value) => value.trim()));
  }

  return [...new Set(limits)].slice(0, 8);
}

function readSnapshotMeta(): SnapshotMeta {
  if (!existsSync(SNAPSHOT_META_PATH)) return {};
  try {
    return JSON.parse(readFileSync(SNAPSHOT_META_PATH, "utf8")) as SnapshotMeta;
  } catch {
    return {};
  }
}

function buildOverview(
  collection: PostmanCollection,
  endpoints: EndpointDoc[],
  docsSource: DocsOverview["docsSource"],
  meta: SnapshotMeta = {},
): DocsOverview {
  const rawDescription = collection.info?.description ?? "";
  const plainDescription = stripHtml(rawDescription);
  const categories = [...new Set(endpoints.map((endpoint) => endpoint.category))];

  return {
    title: collection.info?.name ?? "СамОтправил API",
    description: plainDescription.slice(0, 4000),
    baseUrl: "https://api.samotpravil.ru",
    auth: "Authorization: {api_key} в заголовке HTTP-запроса",
    smtpHost: "api.samotpravil.ru",
    smtpPorts: "1126 (plain), 1127 (TLS)",
    limits: extractLimits(rawDescription),
    categories,
    endpointCount: endpoints.length,
    docsSource,
    publishDate: collection.info?.publishDate ?? meta.publishDate,
    syncedAt: meta.syncedAt,
  };
}

export function parseCollection(
  collection: PostmanCollection,
  docsSource: DocsOverview["docsSource"],
  meta: SnapshotMeta = {},
): { endpoints: EndpointDoc[]; overview: DocsOverview } {
  const endpoints = walkItems(collection.item ?? []);
  const overview = buildOverview(collection, endpoints, docsSource, meta);
  return { endpoints, overview };
}

function getDocsMode(): DocsMode {
  const mode = process.env.SAMOTPRAVIL_DOCS_MODE?.trim().toLowerCase();
  if (mode === "live" || mode === "snapshot" || mode === "auto") return mode;
  return "auto";
}

function loadSnapshotCollection(): PostmanCollection {
  if (!existsSync(SNAPSHOT_PATH)) {
    throw new Error(`Snapshot не найден: ${SNAPSHOT_PATH}. Запустите npm run sync-docs.`);
  }
  return JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8")) as PostmanCollection;
}

async function fetchLiveCollection(): Promise<PostmanCollection> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(COLLECTION_URL, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as PostmanCollection;
  } finally {
    clearTimeout(timer);
  }
}

export async function loadDocumentation(): Promise<{ endpoints: EndpointDoc[]; overview: DocsOverview }> {
  if (cachedEndpoints && cachedOverview) {
    return { endpoints: cachedEndpoints, overview: cachedOverview };
  }

  const mode = getDocsMode();
  let lastError: Error | undefined;

  if (mode !== "snapshot") {
    try {
      const collection = await fetchLiveCollection();
      const result = parseCollection(collection, "live");
      cachedEndpoints = result.endpoints;
      cachedOverview = result.overview;
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (mode === "live") {
        throw new Error(`Не удалось загрузить live-документацию: ${lastError.message}`);
      }
    }
  }

  try {
    const collection = loadSnapshotCollection();
    const meta = readSnapshotMeta();
    const result = parseCollection(collection, "snapshot", meta);
    cachedEndpoints = result.endpoints;
    cachedOverview = result.overview;
    return result;
  } catch (error) {
    const snapshotError = error instanceof Error ? error : new Error(String(error));
    const liveMsg = lastError ? ` Live: ${lastError.message}.` : "";
    throw new Error(`Не удалось загрузить документацию.${liveMsg} Snapshot: ${snapshotError.message}`);
  }
}

export function searchEndpoints(endpoints: EndpointDoc[], query: string, limit = 10): EndpointDoc[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return endpoints.slice(0, limit);

  const scored = endpoints
    .map((endpoint) => {
      const haystack = [
        endpoint.name,
        endpoint.category,
        endpoint.method,
        endpoint.url,
        endpoint.description,
        endpoint.bodyExample ?? "",
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      for (const token of normalized.split(/\s+/)) {
        if (!token) continue;
        if (endpoint.name.toLowerCase().includes(token)) score += 5;
        if (endpoint.url.toLowerCase().includes(token)) score += 4;
        if (endpoint.category.toLowerCase().includes(token)) score += 3;
        if (haystack.includes(token)) score += 1;
      }
      return { endpoint, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((item) => item.endpoint);
}

export function findEndpoint(endpoints: EndpointDoc[], nameOrPath: string): EndpointDoc | undefined {
  const needle = nameOrPath.trim().toLowerCase();
  return endpoints.find((endpoint) => {
    return (
      endpoint.name.toLowerCase() === needle ||
      endpoint.url.toLowerCase().includes(needle) ||
      endpoint.id.toLowerCase() === needle
    );
  });
}

export function formatEndpoint(endpoint: EndpointDoc): string {
  const lines = [
    `# ${endpoint.name}`,
    "",
    `- Категория: ${endpoint.category}`,
    `- Метод: ${endpoint.method}`,
    `- URL: ${endpoint.url}`,
  ];

  if (endpoint.description) {
    lines.push("", "## Описание", endpoint.description);
  }

  if (endpoint.bodyExample) {
    lines.push("", "## Пример тела запроса", "```json", endpoint.bodyExample, "```");
  }

  if (endpoint.examples.length > 0) {
    lines.push("", "## Примеры ответов");
    for (const example of endpoint.examples) {
      lines.push(`### ${example.name}${example.code ? ` (${example.code})` : ""}`);
      if (example.body) lines.push("```json", example.body, "```");
    }
  }

  return lines.join("\n");
}

export function formatOverview(overview: DocsOverview): string {
  const sourceLine =
    overview.docsSource === "live"
      ? "Источник: live (documentation.samotpravil.ru)"
      : "Источник: bundled snapshot (offline fallback)";

  const dateLines: string[] = [];
  if (overview.publishDate) dateLines.push(`- Дата публикации коллекции: ${overview.publishDate}`);
  if (overview.syncedAt) dateLines.push(`- Snapshot синхронизирован: ${overview.syncedAt}`);

  return [
    `# ${overview.title}`,
    "",
    overview.description,
    "",
    "## Мета",
    `- ${sourceLine}`,
    ...dateLines,
    "",
    "## Базовые настройки",
    `- API base URL: ${overview.baseUrl}`,
    `- Авторизация: ${overview.auth}`,
    `- SMTP host: ${overview.smtpHost}`,
    `- SMTP ports: ${overview.smtpPorts}`,
    `- Документация: ${DOCS_BASE_URL}`,
    "",
    "## Лимиты",
    ...(overview.limits.length ? overview.limits.map((limit) => `- ${limit}`) : ["- см. get_overview / search_docs"]),
    "",
    "## Категории",
    ...overview.categories.map((category) => `- ${category}`),
    "",
    `Всего эндпоинтов: ${overview.endpointCount}`,
  ].join("\n");
}

export { SNAPSHOT_PATH, SNAPSHOT_META_PATH };
