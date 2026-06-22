#!/usr/bin/env node
/**
 * Launch Vizioz Swagger-MCP with Samotpravil OpenAPI spec.
 *
 * Spec source (first match wins):
 *   1. SAMOTPRAVIL_SWAGGER_URL
 *   2. Public SwaggerHub (SWAGGERHUB_OWNER + SWAGGERHUB_API_NAME + SWAGGERHUB_VERSION)
 *   3. Ephemeral local HTTP server → data/openapi.yaml
 */
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OPENAPI = join(ROOT, "data", "openapi.yaml");
const SWAGGER_MCP = join(ROOT, "vendor", "swagger-mcp", "build", "index.js");

const ENV_KEYS = [
  "SAMOTPRAVIL_SWAGGER_URL",
  "SWAGGERHUB_OWNER",
  "SWAGGERHUB_API_NAME",
  "SWAGGERHUB_VERSION",
  "SWAGGERHUB_IS_PRIVATE",
];

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!ENV_KEYS.includes(key) || process.env[key]) continue;
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (value) process.env[key] = value;
  }
}

for (const file of [join(ROOT, ".env.samotpravil"), join(ROOT, ".env.swaggerhub")]) {
  loadEnvFile(file);
}

function resolveSwaggerUrl() {
  const explicit = process.env.SAMOTPRAVIL_SWAGGER_URL?.trim();
  if (explicit) return explicit;

  const owner = process.env.SWAGGERHUB_OWNER?.trim();
  const apiName = process.env.SWAGGERHUB_API_NAME?.trim() || "samotpravil-smtp-api";
  const version = process.env.SWAGGERHUB_VERSION?.trim() || "1.0.0";
  const isPrivate = process.env.SWAGGERHUB_IS_PRIVATE === "true";

  if (owner && !isPrivate) {
    return `https://api.swaggerhub.com/apis/${encodeURIComponent(owner)}/${encodeURIComponent(apiName)}/${encodeURIComponent(version)}`;
  }

  return null;
}

function startLocalSwaggerUrl() {
  if (!existsSync(OPENAPI)) {
    console.error(`Missing ${OPENAPI}. Run: npm run export-openapi`);
    process.exit(1);
  }

  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      if (req.url === "/openapi.yaml") {
        res.writeHead(200, { "Content-Type": "application/yaml" });
        res.end(readFileSync(OPENAPI));
        return;
      }
      res.writeHead(404);
      res.end();
    });

    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({ url: `http://127.0.0.1:${port}/openapi.yaml`, server });
    });
  });
}

function launch(swaggerUrl, localServer) {
  const child = spawn(
    process.execPath,
    [SWAGGER_MCP, `--swagger-url=${swaggerUrl}`],
    { stdio: "inherit", env: process.env },
  );

  const shutdown = () => {
    localServer?.close();
    child.kill("SIGTERM");
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  child.on("exit", (code) => {
    localServer?.close();
    process.exit(code ?? 0);
  });
}

if (!existsSync(SWAGGER_MCP)) {
  console.error("Swagger-MCP is not built. Run: npm run prepare-swagger-mcp");
  process.exit(1);
}

const remoteUrl = resolveSwaggerUrl();
if (remoteUrl) {
  launch(remoteUrl);
} else {
  const local = await startLocalSwaggerUrl();
  launch(local.url, local.server);
}
