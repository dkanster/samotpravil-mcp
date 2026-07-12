#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { withMcpClient, packageVersion } from "./lib/mcp-test-client.mjs";
import { classifyTool, groupCounts, resolveToolRoute } from "./lib/tool-groups.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_PATH = join(ROOT, "data", "tools.manifest.json");

await withMcpClient(async (client) => {
  const { tools } = await client.listTools();
  const sorted = [...tools].sort((a, b) => a.name.localeCompare(b.name));

  const enriched = sorted.map((tool) => {
    const group = classifyTool(tool.name);
    const route = resolveToolRoute(tool.name, tool.description ?? "");
    return {
      name: tool.name,
      group,
      method: route?.method ?? null,
      path: route?.path ?? null,
      description: tool.description ?? null,
      annotations: tool.annotations ?? null,
    };
  });

  const manifest = {
    generatedAt: new Date().toISOString(),
    packageVersion: packageVersion(),
    toolCount: enriched.length,
    groups: groupCounts(enriched),
    tools: enriched,
  };

  writeFileSync(OUT_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUT_PATH} (${manifest.toolCount} tools)`);
});
