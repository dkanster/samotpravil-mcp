import type { PostmanCollection } from "../types.js";
import { requestSignature, walkCollectionRequests } from "./collectionUtils.js";

export interface CollectionDiff {
  added: string[];
  removed: string[];
  unchanged: number;
  remoteCount: number;
  localCount: number;
}

export function diffCollections(remote: PostmanCollection, local: PostmanCollection): CollectionDiff {
  const remoteRows = walkCollectionRequests(remote.item);
  const localRows = walkCollectionRequests(local.item);

  const remoteMap = new Map(
    remoteRows.map((row) => [requestSignature(row.method, row.url), `${row.method} ${row.name} — ${row.url}`]),
  );
  const localMap = new Map(
    localRows.map((row) => [requestSignature(row.method, row.url), `${row.method} ${row.name} — ${row.url}`]),
  );

  const added: string[] = [];
  const removed: string[] = [];

  for (const [signature, label] of remoteMap) {
    if (!localMap.has(signature)) added.push(label);
  }

  for (const [signature, label] of localMap) {
    if (!remoteMap.has(signature)) removed.push(label);
  }

  const unchanged = [...remoteMap.keys()].filter((signature) => localMap.has(signature)).length;

  return {
    added,
    removed,
    unchanged,
    remoteCount: remoteRows.length,
    localCount: localRows.length,
  };
}

export function formatCollectionDiff(diff: CollectionDiff): string {
  const lines = [
    "# Diff: Postman API vs локальный snapshot",
    "",
    `- Remote requests: ${diff.remoteCount}`,
    `- Local requests: ${diff.localCount}`,
    `- Unchanged: ${diff.unchanged}`,
    `- Added in Postman: ${diff.added.length}`,
    `- Removed from Postman: ${diff.removed.length}`,
  ];

  if (diff.added.length > 0) {
    lines.push("", "## Добавлено в Postman", ...diff.added.map((item) => `- ${item}`));
  }

  if (diff.removed.length > 0) {
    lines.push("", "## Есть в snapshot, нет в Postman", ...diff.removed.map((item) => `- ${item}`));
  }

  if (diff.added.length === 0 && diff.removed.length === 0) {
    lines.push("", "Коллекции совпадают по набору HTTP/SMTP запросов.");
  }

  return lines.join("\n");
}
