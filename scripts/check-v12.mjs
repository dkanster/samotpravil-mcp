#!/usr/bin/env node
import { createMcpServer, MANUAL_TOOL_COUNT, CORE_MANUAL_TOOL_COUNT, SDK_TYPED_TOOL_COUNT } from "../dist/index.js";
import { PROMPT_COUNT } from "../dist/registerPrompts.js";

const { autoToolCount } = await createMcpServer();

if (autoToolCount < 10) {
  throw new Error(`Expected >=10 auto tools, got ${autoToolCount}`);
}

const total = MANUAL_TOOL_COUNT + autoToolCount;
if (total < 54) {
  throw new Error(`Expected >=54 total tools, got ${total}`);
}

if (MANUAL_TOOL_COUNT !== CORE_MANUAL_TOOL_COUNT + SDK_TYPED_TOOL_COUNT) {
  throw new Error(`MANUAL_TOOL_COUNT mismatch: ${MANUAL_TOOL_COUNT}`);
}

if (PROMPT_COUNT !== 5) {
  throw new Error(`Expected 5 prompts, got ${PROMPT_COUNT}`);
}

console.log(
  `OK: ${CORE_MANUAL_TOOL_COUNT} core + ${SDK_TYPED_TOOL_COUNT} sdk + ${autoToolCount} auto = ${total} tools, ${PROMPT_COUNT} prompts`,
);
