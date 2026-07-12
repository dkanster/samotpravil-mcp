import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  endpointApiPath,
  endpointToolName,
  isSamotpravilApiEndpoint,
  uniqueEndpointToolName,
} from "../dist/endpointMeta.js";

describe("endpointMeta", () => {
  it("extracts API path from full URL", () => {
    assert.equal(endpointApiPath("https://api.samotpravil.ru/api/v2/issue/status?x=1"), "/api/v2/issue/status");
  });

  it("builds stable tool names", () => {
    const endpoint = {
      name: "Status",
      method: "GET",
      url: "https://api.samotpravil.ru/api/v2/issue/status",
      category: "v2",
    };
    assert.equal(endpointToolName(endpoint), "api_get_v2_issue_status");
  });

  it("detects Samotpravil API endpoints", () => {
    assert.equal(
      isSamotpravilApiEndpoint({
        name: "Send",
        method: "POST",
        url: "https://api.samotpravil.ru/api/v1/smtp_send",
        category: "v1",
      }),
      true,
    );
    assert.equal(
      isSamotpravilApiEndpoint({
        name: "SMTP",
        method: "SMTP",
        url: "smtp://api.samotpravil.ru",
        category: "smtp",
      }),
      false,
    );
  });

  it("deduplicates tool names", () => {
    const used = new Set();
    const base = { name: "Status A", method: "GET", url: "https://api.samotpravil.ru/api/v1/status", category: "v1" };
    const dup = { name: "Status B", method: "GET", url: "https://api.samotpravil.ru/api/v2/status", category: "v2" };
    const first = uniqueEndpointToolName(base, used);
    const second = uniqueEndpointToolName(dup, used);
    assert.notEqual(first, second);
    assert.equal(used.size, 2);
  });
});
