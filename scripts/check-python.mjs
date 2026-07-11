#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const PYTHON_DIR = join(ROOT, "python");
const PYTHON_SRC = join(PYTHON_DIR, "src");
const python = process.env.SAMOTPRAVIL_PYTHON?.trim() || "python3";

function run(args, options = {}) {
  const result = spawnSync(python, args, {
    cwd: PYTHON_DIR,
    env: {
      ...process.env,
      PYTHONPATH: PYTHON_SRC,
    },
    encoding: "utf8",
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `${python} ${args.join(" ")} failed`);
  }
  return result.stdout;
}

const pythonCheck = spawnSync(python, ["--version"], { encoding: "utf8" });
if (pythonCheck.status !== 0) {
  console.log(`SKIP: Python (${python} not available)`);
  process.exit(0);
}

run(["-m", "pip", "install", "-e", ".[async,dev]", "-q"]);
run(["scripts/generate_schemas.py"]);

const schemasPath = join(ROOT, "data", "python-sdk-schemas.json");
if (!existsSync(schemasPath)) {
  throw new Error("data/python-sdk-schemas.json missing after generation");
}

run(["-m", "pytest", "-q"]);

const bridge = spawnSync(
  python,
  ["-m", "samotpravil_mcp.bridge", "--stdin-json"],
  {
    cwd: PYTHON_DIR,
    input: JSON.stringify({ method: "get_domains", params: {}, dry_run: true }),
    encoding: "utf8",
    env: { ...process.env, PYTHONPATH: PYTHON_SRC },
  },
);
if (bridge.status !== 0) {
  throw new Error(bridge.stderr || "bridge dry_run failed");
}
const payload = JSON.parse(bridge.stdout);
if (!payload.ok || !String(payload.result).includes("DRY RUN")) {
  throw new Error("bridge dry_run returned unexpected payload");
}

console.log("OK: Python SDK package, schemas, pytest, bridge");
