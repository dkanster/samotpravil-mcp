import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { PostmanCollection } from "../types.js";
import { SNAPSHOT_META_PATH, SNAPSHOT_PATH, clearDocsCache, COLLECTION_URL } from "../docs.js";
import { collectionSummary, countCollectionRequests } from "./collectionUtils.js";

export interface SnapshotWriteResult {
  snapshotPath: string;
  metaPath: string;
  endpointCount: number;
  publishDate: string | null;
  collectionName: string | null;
}

export function writeCollectionSnapshot(
  collection: PostmanCollection,
  collectionUid: string,
): SnapshotWriteResult {
  mkdirSync(dirname(SNAPSHOT_PATH), { recursive: true });
  writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(collection, null, 2)}\n`, "utf8");

  const meta = {
    syncedAt: new Date().toISOString(),
    publishDate: collection.info?.publishDate ?? null,
    collectionName: collection.info?.name ?? null,
    endpointCount: countCollectionRequests(collection.item),
    source: COLLECTION_URL,
    postmanCollectionUid: collectionUid,
    syncedVia: "postman_api",
  };

  writeFileSync(SNAPSHOT_META_PATH, `${JSON.stringify(meta, null, 2)}\n`, "utf8");
  clearDocsCache();

  return {
    snapshotPath: SNAPSHOT_PATH,
    metaPath: SNAPSHOT_META_PATH,
    endpointCount: meta.endpointCount,
    publishDate: meta.publishDate,
    collectionName: meta.collectionName,
  };
}

export function formatSnapshotWriteResult(
  result: SnapshotWriteResult,
  preview: boolean,
  summary: Record<string, unknown>,
): string {
  if (preview) {
    return [
      "# Preview sync (snapshot не записан)",
      "",
      "Установите `write: true`, чтобы записать файлы.",
      "",
      `- Collection: ${String(summary.name ?? "—")}`,
      `- UID: ${String(summary.collectionUid ?? "—")}`,
      `- Endpoints: ${String(summary.endpointCount ?? "—")}`,
      `- publishDate: ${String(summary.publishDate ?? "—")}`,
      `- Target: ${SNAPSHOT_PATH}`,
    ].join("\n");
  }

  return [
    "# Snapshot синхронизирован",
    "",
    `- Path: ${result.snapshotPath}`,
    `- Meta: ${result.metaPath}`,
    `- Collection: ${result.collectionName ?? "—"}`,
    `- Endpoints: ${result.endpointCount}`,
    `- publishDate: ${result.publishDate ?? "—"}`,
    "",
    "Следующий шаг: `npm test` и commit `data/collection.snapshot.json`.",
  ].join("\n");
}
