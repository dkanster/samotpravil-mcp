import { z } from "zod";
import {
  findEndpoint,
  formatEndpoint,
  formatOverview,
  loadDocumentation,
  searchEndpoints,
} from "../docs.js";

export const getOverviewSchema = z.object({});

export async function handleGetOverview(): Promise<string> {
  const { overview } = await loadDocumentation();
  return formatOverview(overview);
}

export const listEndpointsSchema = z.object({
  category: z.string().optional().describe("Фильтр по категории (частичное совпадение)"),
  limit: z.number().int().min(1).max(100).default(50).describe("Максимум результатов"),
});

export async function handleListEndpoints(params: z.infer<typeof listEndpointsSchema>): Promise<string> {
  const { endpoints } = await loadDocumentation();
  const filtered = params.category
    ? endpoints.filter((endpoint) => endpoint.category.toLowerCase().includes(params.category!.toLowerCase()))
    : endpoints;

  const lines = filtered.slice(0, params.limit).map((endpoint) => {
    return `- [${endpoint.category}] ${endpoint.name}: ${endpoint.method} ${endpoint.url}`;
  });

  return [
    `# Эндпoинты СамОтправил (${Math.min(filtered.length, params.limit)} из ${filtered.length})`,
    "",
    ...lines,
  ].join("\n");
}

export const searchDocsSchema = z.object({
  query: z.string().min(1).describe("Поисковый запрос: метод, путь, ключевое слово"),
  limit: z.number().int().min(1).max(20).default(8).describe("Максимум результатов"),
});

export async function handleSearchDocs(params: z.infer<typeof searchDocsSchema>): Promise<string> {
  const { endpoints } = await loadDocumentation();
  const results = searchEndpoints(endpoints, params.query, params.limit);

  if (results.length === 0) {
    return `По запросу "${params.query}" ничего не найдено. Попробуйте list_endpoints или get_overview.`;
  }

  return results.map((endpoint) => formatEndpoint(endpoint)).join("\n\n---\n\n");
}

export const getEndpointSchema = z.object({
  name_or_path: z.string().min(1).describe("Название метода или часть URL, например smtp_send"),
});

export async function handleGetEndpoint(params: z.infer<typeof getEndpointSchema>): Promise<string> {
  const { endpoints } = await loadDocumentation();
  const endpoint = findEndpoint(endpoints, params.name_or_path);

  if (!endpoint) {
    const suggestions = searchEndpoints(endpoints, params.name_or_path, 5)
      .map((item) => `- ${item.name}: ${item.method} ${item.url}`)
      .join("\n");

    return [
      `Эндпoинт "${params.name_or_path}" не найден.`,
      suggestions ? `\nВозможно, вы имели в виду:\n${suggestions}` : "",
    ].join("");
  }

  return formatEndpoint(endpoint);
}
