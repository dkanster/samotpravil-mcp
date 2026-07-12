import { createServer } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createRequestId, logHttpEvent } from "./httpLog.js";

function readJsonBody(req: import("node:http").IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) {
        resolve(undefined);
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function methodNotAllowed(res: import("node:http").ServerResponse): void {
  res.writeHead(405, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    }),
  );
}

function unauthorized(res: import("node:http").ServerResponse): void {
  res.writeHead(401, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32001, message: "Unauthorized." },
      id: null,
    }),
  );
}

function resolveHttpAuthToken(): string | undefined {
  const token = process.env.SAMOTPRAVIL_HTTP_AUTH_TOKEN?.trim();
  return token && token.length > 0 ? token : undefined;
}

function isHttpAuthorized(req: import("node:http").IncomingMessage): boolean {
  const expected = resolveHttpAuthToken();
  if (!expected) return true;

  const header = req.headers.authorization?.trim() ?? "";
  if (header === `Bearer ${expected}`) return true;

  const tokenHeader = req.headers["x-mcp-auth-token"];
  if (typeof tokenHeader === "string" && tokenHeader.trim() === expected) return true;

  return false;
}

export async function startHttpServer(
  createServerFn: () => Promise<McpServer>,
  port: number,
): Promise<void> {
  const httpServer = createServer(async (req, res) => {
    const url = req.url ?? "/";
    const requestId = createRequestId();
    const startedAt = Date.now();

    if (url !== "/mcp" && url !== "/mcp/") {
      logHttpEvent("not_found", { requestId, path: url });
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found. MCP endpoint: POST /mcp");
      return;
    }

    if (req.method !== "POST") {
      logHttpEvent("method_not_allowed", { requestId, method: req.method ?? "UNKNOWN" });
      methodNotAllowed(res);
      return;
    }

    if (!isHttpAuthorized(req)) {
      logHttpEvent("unauthorized", { requestId });
      unauthorized(res);
      return;
    }

    logHttpEvent("request_start", { requestId });

    const server = await createServerFn();

    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      await server.connect(transport);
      const body = await readJsonBody(req);
      await transport.handleRequest(req, res, body);

      res.on("close", () => {
        logHttpEvent("request_complete", {
          requestId,
          durationMs: Date.now() - startedAt,
          statusCode: res.statusCode,
        });
        transport.close().catch(() => undefined);
        server.close().catch(() => undefined);
      });
    } catch (error) {
      logHttpEvent("request_error", {
        requestId,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      });
      console.error("[samotpravil-mcp] HTTP error:", error);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            jsonrpc: "2.0",
            error: { code: -32603, message: "Internal server error" },
            id: null,
          }),
        );
      }
    }
  });

  const host = resolveHttpHost();

  await new Promise<void>((resolve, reject) => {
    httpServer.listen(port, host, () => resolve());
    httpServer.on("error", reject);
  });

  console.error(`[samotpravil-mcp] HTTP transport on http://${host}:${port}/mcp (stateless)`);
}

function resolveHttpHost(): string {
  const host = process.env.SAMOTPRAVIL_HTTP_HOST?.trim();
  return host && host.length > 0 ? host : "127.0.0.1";
}

export function resolveHttpPort(argv: string[]): number {
  const portFlagIndex = argv.findIndex((arg) => arg === "--port" || arg === "-p");
  if (portFlagIndex >= 0 && argv[portFlagIndex + 1]) {
    const parsed = Number.parseInt(argv[portFlagIndex + 1] ?? "", 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  const envPort = process.env.SAMOTPRAVIL_HTTP_PORT?.trim();
  if (envPort) {
    const parsed = Number.parseInt(envPort, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  return 3000;
}

export function isHttpMode(argv: string[]): boolean {
  return argv.includes("--http");
}
