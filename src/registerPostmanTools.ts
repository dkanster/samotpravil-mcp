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
import { POSTMAN_READ_ANNOTATIONS, POSTMAN_WRITE_ANNOTATIONS } from "./toolAnnotations.js";

export const POSTMAN_TOOL_COUNT = 4;

export function registerPostmanTools(server: McpServer): number {
  if (!resolvePostmanApiKey()) {
    return 0;
  }

  server.registerTool(
    "postman_get_collection",
    {
      description: "Коллекция документации из Postman API (summary или full JSON).",
      inputSchema: postmanGetCollectionSchema,
      annotations: POSTMAN_READ_ANNOTATIONS,
    },
    async (params) => ({
      content: [{ type: "text", text: await handlePostmanGetCollection(params) }],
    }),
  );

  server.registerTool(
    "postman_sync_snapshot",
    {
      description: "Postman API → data/collection.snapshot.json (write=true для записи).",
      inputSchema: postmanSyncSnapshotSchema,
      annotations: POSTMAN_WRITE_ANNOTATIONS,
    },
    async (params) => ({
      content: [{ type: "text", text: await handlePostmanSyncSnapshot(params) }],
    }),
  );

  server.registerTool(
    "postman_diff_snapshot",
    {
      description: "Diff Postman API vs локальный data/collection.snapshot.json.",
      inputSchema: postmanDiffSnapshotSchema,
      annotations: POSTMAN_READ_ANNOTATIONS,
    },
    async () => ({
      content: [{ type: "text", text: await handlePostmanDiffSnapshot() }],
    }),
  );

  server.registerTool(
    "postman_search_requests",
    {
      description: "Поиск запросов в коллекции (local snapshot или remote Postman API).",
      inputSchema: postmanSearchRequestsSchema,
      annotations: POSTMAN_READ_ANNOTATIONS,
    },
    async (params) => ({
      content: [{ type: "text", text: await handlePostmanSearchRequests(params) }],
    }),
  );

  return POSTMAN_TOOL_COUNT;
}
