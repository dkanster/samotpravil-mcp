#!/usr/bin/env node
import { createMcpServer, MANUAL_TOOL_COUNT } from "../dist/index.js";
import { PROMPT_COUNT } from "../dist/registerPrompts.js";

const { autoToolCount } = await createMcpServer();

if (autoToolCount < 40) {
  throw new Error(`Expected >=40 auto tools, got ${autoToolCount}`);
}

const total = MANUAL_TOOL_COUNT + autoToolCount;
if (total < 54) {
  throw new Error(`Expected >=54 total tools, got ${total}`);
}

if (PROMPT_COUNT !== 4) {
  throw new Error(`Expected 4 prompts, got ${PROMPT_COUNT}`);
}

console.log(`OK: ${MANUAL_TOOL_COUNT} manual + ${autoToolCount} auto = ${total} tools, ${PROMPT_COUNT} prompts`);
