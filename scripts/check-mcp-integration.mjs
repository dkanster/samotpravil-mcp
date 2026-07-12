#!/usr/bin/env node
import { withMcpClient } from "./lib/mcp-test-client.mjs";
import { RESOURCE_COUNT } from "../dist/registerResources.js";
import { PROMPT_COUNT } from "../dist/registerPrompts.js";
import { MANUAL_TOOL_COUNT } from "../dist/index.js";

const REQUIRED_TOOLS = [
  "get_overview",
  "list_endpoints",
  "search_docs",
  "get_endpoint",
  "api_request",
  "send_email",
  "send_package",
];

const REQUIRED_PROMPTS = [
  "integration_overview",
  "send_transactional",
  "python_sdk_parity",
];

await withMcpClient(async (client) => {
  const { tools } = await client.listTools();
  const { prompts } = await client.listPrompts();
  const { resources } = await client.listResources();

  const toolNames = new Set(tools.map((tool) => tool.name));
  for (const name of REQUIRED_TOOLS) {
    if (!toolNames.has(name)) {
      throw new Error(`Missing required tool: ${name}`);
    }
  }

  if (tools.length < MANUAL_TOOL_COUNT + 10) {
    throw new Error(`Expected >=${MANUAL_TOOL_COUNT + 10} tools via MCP, got ${tools.length}`);
  }

  const overview = tools.find((tool) => tool.name === "get_overview");
  if (overview?.annotations?.readOnlyHint !== true) {
    throw new Error("get_overview should have readOnlyHint=true");
  }

  const sendEmail = tools.find((tool) => tool.name === "send_email");
  if (sendEmail?.annotations?.destructiveHint !== true) {
    throw new Error("send_email should have destructiveHint=true");
  }

  if (prompts.length !== PROMPT_COUNT) {
    throw new Error(`Expected ${PROMPT_COUNT} prompts, got ${prompts.length}`);
  }

  const promptNames = new Set(prompts.map((prompt) => prompt.name));
  for (const name of REQUIRED_PROMPTS) {
    if (!promptNames.has(name)) {
      throw new Error(`Missing required prompt: ${name}`);
    }
  }

  if (resources.length < RESOURCE_COUNT) {
    throw new Error(`Expected >=${RESOURCE_COUNT} static resources, got ${resources.length}`);
  }

  const resourceUris = new Set(resources.map((resource) => resource.uri));
  for (const uri of [
    "samotpravil://overview",
    "samotpravil://sdk-mapping",
    "samotpravil://rate-limits",
    "samotpravil://api-wishlist",
  ]) {
    if (!resourceUris.has(uri)) {
      throw new Error(`Missing required resource: ${uri}`);
    }
  }

  console.log(
    `OK: MCP integration — ${tools.length} tools, ${prompts.length} prompts, ${resources.length} resources`,
  );
});
