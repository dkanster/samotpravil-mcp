/** Default UID from documentation.samotpravil.ru collection URL */
export const DEFAULT_POSTMAN_COLLECTION_UID = "2s93RZM9in";

export interface PostmanConfig {
  apiKey: string;
  collectionUid: string;
  apiBaseUrl: string;
}

export function resolvePostmanApiKey(): string | undefined {
  const key = process.env.POSTMAN_API_KEY?.trim();
  return key || undefined;
}

export function resolvePostmanConfig(): PostmanConfig | undefined {
  const apiKey = resolvePostmanApiKey();
  if (!apiKey) return undefined;

  const collectionUid = process.env.POSTMAN_COLLECTION_UID?.trim() || DEFAULT_POSTMAN_COLLECTION_UID;
  const apiBaseUrl = (process.env.POSTMAN_API_BASE_URL?.trim() || "https://api.getpostman.com").replace(
    /\/$/,
    "",
  );

  return { apiKey, collectionUid, apiBaseUrl };
}
