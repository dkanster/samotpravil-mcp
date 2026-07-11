import type { PostmanCollection } from "../types.js";
import type { PostmanConfig } from "./config.js";

export async function fetchPostmanCollection(config: PostmanConfig): Promise<PostmanCollection> {
  const url = `${config.apiBaseUrl}/collections/${encodeURIComponent(config.collectionUid)}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Api-Key": config.apiKey,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Postman API HTTP ${response.status}${body ? `: ${body.slice(0, 300)}` : ""}`);
  }

  const payload = (await response.json()) as { collection?: PostmanCollection };
  if (!payload.collection) {
    throw new Error("Postman API: ответ без поля collection");
  }

  return payload.collection;
}
