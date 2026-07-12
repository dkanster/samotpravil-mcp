import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRequestId } from "../dist/httpLog.js";

describe("httpLog", () => {
  it("creates request ids", () => {
    const id = createRequestId();
    assert.match(id, /^[0-9a-f-]{36}$/i);
  });
});
