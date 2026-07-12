#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { withMcpClient, packageVersion } from "./lib/mcp-test-client.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_PATH = join(ROOT, "data", "tools.manifest.json");

await withMcpClient(async (client) => {
  const { tools } = await client.listTools();
  const sorted = [...tools].sort((a, b) => a.name.localeCompare(b.name));

  const manifest = {
    generatedAt: new Date().toISOString(),
    packageVersion: packageVersion(),
    toolCount: sorted.length,
    tools: sorted.map((tool) => ({
      name: tool.name,
      description: tool.description ?? null,
      annotations: tool.annotations ?? null,
    })),
  };

  writeFileSync(OUT_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUT_PATH} (${manifest.toolCount} tools)`);
});
