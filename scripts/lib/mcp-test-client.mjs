import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  StdioClientTransport,
  getDefaultEnvironment,
} from "@modelcontextprotocol/sdk/client/stdio.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

export async function withMcpClient(run) {
  const transport = new StdioClientTransport({
    command: "node",
    args: [join(ROOT, "dist", "index.js")],
    cwd: ROOT,
    stderr: "pipe",
    env: {
      ...getDefaultEnvironment(),
      SAMOTPRAVIL_DOCS_MODE: "snapshot",
    },
  });

  const client = new Client({ name: "samotpravil-mcp-test", version: "1.0.0" });
  await client.connect(transport);

  try {
    return await run(client);
  } finally {
    await transport.close();
  }
}

export function packageVersion() {
  return JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;
}
