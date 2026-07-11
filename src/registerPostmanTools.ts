import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { resolvePostmanApiKey } from "./postman/config.js";
import {
  handlePostmanDiffSnapshot,
  handlePostmanGetCollection,
  handlePostmanSearchRequests,
  handlePostmanSyncSnapshot,
  postmanDiffSnapshotSchema,
  postmanGetCollectionSchema,
  postmanSearchRequestsSchema,
  postmanSyncSnapshotSchema,
} from "./tools/postman.js";

export const POSTMAN_TOOL_COUNT = 4;

export function registerPostmanTools(server: McpServer): number {
  if (!resolvePostmanApiKey()) {
    return 0;
  }

  server.tool(
    "postman_get_collection",
    "Коллекция документации из Postman API (summary или full JSON).",
    postmanGetCollectionSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: await handlePostmanGetCollection(params) }],
    }),
  );

  server.tool(
    "postman_sync_snapshot",
    "Postman API → data/collection.snapshot.json (write=true для записи).",
    postmanSyncSnapshotSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: await handlePostmanSyncSnapshot(params) }],
    }),
  );

  server.tool(
    "postman_diff_snapshot",
    "Diff Postman API vs локальный data/collection.snapshot.json.",
    postmanDiffSnapshotSchema.shape,
    async () => ({
      content: [{ type: "text", text: await handlePostmanDiffSnapshot() }],
    }),
  );

  server.tool(
    "postman_search_requests",
    "Поиск запросов в коллекции (local snapshot или remote Postman API).",
    postmanSearchRequestsSchema.shape,
    async (params) => ({
      content: [{ type: "text", text: await handlePostmanSearchRequests(params) }],
    }),
  );

  return POSTMAN_TOOL_COUNT;
}
