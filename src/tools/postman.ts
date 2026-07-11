import { z } from "zod";
import { readFileSync, existsSync } from "node:fs";
import { fetchPostmanCollection } from "../postman/client.js";
import { collectionSummary } from "../postman/collectionUtils.js";
import { resolvePostmanConfig } from "../postman/config.js";
import { diffCollections, formatCollectionDiff } from "../postman/diff.js";
import { formatSnapshotWriteResult, writeCollectionSnapshot } from "../postman/snapshot.js";
import { SNAPSHOT_PATH, parseCollection, searchEndpoints } from "../docs.js";
import type { PostmanCollection } from "../types.js";

function requirePostmanConfig() {
  const config = resolvePostmanConfig();
  if (!config) {
    throw new Error("POSTMAN_API_KEY не задан. Добавьте ключ в .env.samotpravil или env MCP-сервера.");
  }
  return config;
}

function loadLocalSnapshot(): PostmanCollection {
  if (!existsSync(SNAPSHOT_PATH)) {
    throw new Error(`Локальный snapshot не найден: ${SNAPSHOT_PATH}`);
  }
  return JSON.parse(readFileSync(SNAPSHOT_PATH, "utf8")) as PostmanCollection;
}

export const postmanGetCollectionSchema = z.object({
  detail: z
    .enum(["summary", "full"])
    .optional()
    .default("summary")
    .describe("summary — метаданные; full — полная коллекция JSON"),
});

export async function handlePostmanGetCollection(
  params: z.infer<typeof postmanGetCollectionSchema>,
): Promise<string> {
  const config = requirePostmanConfig();
  const collection = await fetchPostmanCollection(config);
  const summary = collectionSummary(collection, config.collectionUid);

  if (params.detail === "summary") {
    return ["# Postman collection (summary)", "", JSON.stringify(summary, null, 2)].join("\n");
  }

  return JSON.stringify({ collection }, null, 2);
}

export const postmanSyncSnapshotSchema = z.object({
  write: z
    .boolean()
    .optional()
    .default(false)
    .describe("true — записать data/collection.snapshot.json; false — только preview"),
});

export async function handlePostmanSyncSnapshot(
  params: z.infer<typeof postmanSyncSnapshotSchema>,
): Promise<string> {
  const config = requirePostmanConfig();
  const collection = await fetchPostmanCollection(config);
  const summary = collectionSummary(collection, config.collectionUid);

  if (!params.write) {
    return formatSnapshotWriteResult(
      {
        snapshotPath: SNAPSHOT_PATH,
        metaPath: SNAPSHOT_PATH,
        endpointCount: Number(summary.endpointCount ?? 0),
        publishDate: (summary.publishDate as string | null) ?? null,
        collectionName: (summary.name as string | null) ?? null,
      },
      true,
      summary,
    );
  }

  const result = writeCollectionSnapshot(collection, config.collectionUid);
  return formatSnapshotWriteResult(result, false, summary);
}

export const postmanDiffSnapshotSchema = z.object({});

export async function handlePostmanDiffSnapshot(): Promise<string> {
  const config = requirePostmanConfig();
  const remote = await fetchPostmanCollection(config);
  const local = loadLocalSnapshot();
  return formatCollectionDiff(diffCollections(remote, local));
}

export const postmanSearchRequestsSchema = z.object({
  query: z.string().min(1).describe("Поиск по имени, URL, категории, описанию"),
  limit: z.number().int().min(1).max(50).optional().default(10),
  source: z
    .enum(["local", "remote"])
    .optional()
    .default("local")
    .describe("local — bundled snapshot; remote — Postman API"),
});

export async function handlePostmanSearchRequests(
  params: z.infer<typeof postmanSearchRequestsSchema>,
): Promise<string> {
  let collection: PostmanCollection;

  if (params.source === "remote") {
    const config = requirePostmanConfig();
    collection = await fetchPostmanCollection(config);
  } else {
    collection = loadLocalSnapshot();
  }

  const { endpoints } = parseCollection(collection, "snapshot");
  const found = searchEndpoints(endpoints, params.query, params.limit);

  if (found.length === 0) {
    return `Запросы не найдены по запросу «${params.query}» (source=${params.source}).`;
  }

  const lines = [`# Найдено: ${found.length} (source=${params.source})`, ""];
  for (const endpoint of found) {
    lines.push(`## ${endpoint.name}`, `- ${endpoint.method} ${endpoint.url}`, `- Категория: ${endpoint.category}`, "");
  }

  return lines.join("\n").trim();
}
