import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export interface PythonBridgePayload {
  method: string;
  params: Record<string, unknown>;
  dry_run?: boolean;
  async_mode?: boolean;
}

export interface PythonBridgeResponse {
  ok: boolean;
  result?: string;
  error?: string;
}

function resolvePythonExecutable(): string {
  return process.env.SAMOTPRAVIL_PYTHON?.trim() || "python3";
}

function resolvePythonModulePath(): string {
  return join(PACKAGE_ROOT, "python", "src");
}

export function isPythonSdkBridgeEnabled(): boolean {
  const value = process.env.SAMOTPRAVIL_ENABLE_PYTHON_SDK?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export async function callPythonSdkBridge(payload: PythonBridgePayload): Promise<string> {
  const python = resolvePythonExecutable();
  const pythonPath = resolvePythonModulePath();

  return new Promise((resolve, reject) => {
    const child = spawn(
      python,
      ["-m", "samotpravil_mcp.bridge", "--stdin-json"],
      {
        cwd: join(PACKAGE_ROOT, "python"),
        env: {
          ...process.env,
          PYTHONPATH: pythonPath,
        },
        stdio: ["pipe", "pipe", "pipe"],
      },
    );

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });

    child.on("error", (error) => {
      reject(
        new Error(
          `Python SDK bridge failed to start (${python}). Установите python/ пакет: pip install -e python/.[async] — ${error.message}`,
        ),
      );
    });

    child.on("close", (code) => {
      const trimmed = stdout.trim();
      if (!trimmed) {
        reject(new Error(stderr || `Python SDK bridge exited with code ${code ?? "unknown"}`));
        return;
      }

      let parsed: PythonBridgeResponse;
      try {
        parsed = JSON.parse(trimmed) as PythonBridgeResponse;
      } catch {
        reject(new Error(`Python SDK bridge returned invalid JSON: ${trimmed}`));
        return;
      }

      if (!parsed.ok) {
        reject(new Error(parsed.error ?? "Python SDK bridge error"));
        return;
      }

      resolve(parsed.result ?? "");
    });

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}
