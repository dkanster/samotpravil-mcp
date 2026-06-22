#!/usr/bin/env node
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "docs", "swagger");
const PORT = Number(process.env.SWAGGER_PORT ?? 8080);
const HOST = process.env.SWAGGER_HOST ?? "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".yaml": "text/yaml; charset=utf-8",
  ".yml": "text/yaml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
};

const specPath = join(ROOT, "openapi.yaml");
if (!existsSync(specPath)) {
  console.error("openapi.yaml not found. Run: npm run export-openapi");
  process.exit(1);
}

createServer((req, res) => {
  const pathname = (req.url ?? "/").split("?")[0];
  const relative = pathname === "/" ? "/index.html" : pathname;
  const file = join(ROOT, relative);

  if (!file.startsWith(ROOT) || !existsSync(file)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  res.writeHead(200, { "Content-Type": MIME[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
}).listen(PORT, HOST, () => {
  console.log(`Swagger UI: http://${HOST}:${PORT}`);
  console.log("Press Ctrl+C to stop.");
});
