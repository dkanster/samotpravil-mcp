import type { PostmanCollection, PostmanItem, PostmanRequest } from "../types.js";

export interface CollectionRequestRow {
  id: string;
  name: string;
  method: string;
  url: string;
  category: string;
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

export function requestSignature(method: string, url: string): string {
  const normalizedMethod = method.toUpperCase();
  let path = url;
  try {
    if (url.startsWith("http")) {
      path = new URL(url).pathname;
    }
  } catch {
    path = url.split("?")[0] ?? url;
  }
  return `${normalizedMethod} ${path}`;
}

export function walkCollectionRequests(
  items: PostmanItem[] | undefined,
  category = "",
  acc: CollectionRequestRow[] = [],
): CollectionRequestRow[] {
  for (const item of items ?? []) {
    const nextCategory = category ? `${category} / ${item.name ?? ""}` : (item.name ?? "");

    if (item.request) {
      const method = item.request.method ?? "GET";
      const url = requestUrl(item.request);
      acc.push({
        id: item.id ?? requestSignature(method, url),
        name: item.name ?? "Без названия",
        method,
        url,
        category: category || "Общее",
      });
    }

    if (item.item?.length) {
      walkCollectionRequests(item.item, nextCategory, acc);
    }
  }

  return acc;
}

export function countCollectionRequests(items: PostmanItem[] | undefined): number {
  return walkCollectionRequests(items).length;
}

export function collectionSummary(collection: PostmanCollection, collectionUid: string): Record<string, unknown> {
  return {
    collectionUid,
    name: collection.info?.name ?? null,
    publishDate: collection.info?.publishDate ?? null,
    endpointCount: countCollectionRequests(collection.item),
  };
}
