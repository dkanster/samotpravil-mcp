import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callPythonSdkBridge } from "./pythonBridge.js";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

interface SdkMethodMeta {
  name: string;
  category: "read" | "send" | "mutation";
  description: string;
  whitelabel?: boolean;
}

interface JsonSchemaProperty {
  type?: string;
  description?: string;
  items?: JsonSchemaProperty;
}

interface JsonSchema {
  type?: string;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
}

const SDK_METHODS = JSON.parse(
  readFileSync(join(PACKAGE_ROOT, "data", "python-sdk-methods.json"), "utf8"),
) as SdkMethodMeta[];

const SDK_SCHEMAS = JSON.parse(
  readFileSync(join(PACKAGE_ROOT, "data", "python-sdk-schemas.json"), "utf8"),
) as Record<string, JsonSchema>;

export const PYTHON_SDK_TOOL_COUNT = SDK_METHODS.length;

function jsonPropertyToZod(property: JsonSchemaProperty): z.ZodTypeAny {
  switch (property.type) {
    case "string":
      return z.string();
    case "integer":
      return z.number().int();
    case "number":
      return z.number();
    case "boolean":
      return z.boolean();
    case "array":
      return z.array(property.items ? jsonPropertyToZod(property.items) : z.unknown());
    case "object":
      return z.record(z.unknown());
    default:
      return z.unknown();
  }
}

function jsonSchemaToZodShape(schema: JsonSchema): z.ZodRawShape {
  const shape: z.ZodRawShape = {};
  const required = new Set(schema.required ?? []);

  for (const [key, property] of Object.entries(schema.properties ?? {})) {
    let field = jsonPropertyToZod(property);
    if (property.description) {
      field = field.describe(property.description);
    }
    if (!required.has(key)) {
      field = field.optional();
    }
    shape[key] = field;
  }

  return shape;
}

export function registerPythonSdkTools(server: McpServer): void {
  for (const method of SDK_METHODS) {
    const toolName = `py_${method.name}`;
    const whitelabelNote = method.whitelabel ? " (WhiteLabel)" : "";
    const inputSchema = SDK_SCHEMAS[method.name];

    if (!inputSchema) {
      throw new Error(`Missing Python SDK schema for method: ${method.name}`);
    }

    server.registerTool(
      toolName,
      {
        description: `[Python SDK bridge] ${method.description}${whitelabelNote}`,
        inputSchema: jsonSchemaToZodShape(inputSchema),
      },
      async (params) => {
        const dry_run = Boolean(params.dry_run);
        const async_mode = Boolean(params.async_mode);
        const callParams = { ...params } as Record<string, unknown>;
        delete callParams.dry_run;
        delete callParams.async_mode;

        const text = await callPythonSdkBridge({
          method: method.name,
          params: callParams,
          dry_run,
          async_mode,
        });

        return { content: [{ type: "text", text }] };
      },
    );
  }
}
