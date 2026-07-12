import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { redactApiResponse, redactResponseBody, redactUrlSecrets } from "../dist/redact.js";

describe("redact", () => {
  it("redacts key= in URLs", () => {
    const url = "https://api.samotpravil.ru/api/v1/x?key=secret123&foo=bar";
    assert.match(redactUrlSecrets(url), /key=\[REDACTED\]/);
    assert.match(redactUrlSecrets(url), /foo=bar/);
  });

  it("redacts sensitive JSON keys", () => {
    const body = JSON.stringify({ api_key: "abc", email: "a@b.c" });
    const redacted = redactResponseBody(body);
    assert.match(redacted, /\[REDACTED\]/);
    assert.match(redacted, /a@b\.c/);
  });

  it("redacts known secrets in free text", () => {
    const body = "token=my-secret-key-12345";
    const redacted = redactResponseBody(body, ["my-secret-key-12345"]);
    assert.match(redacted, /\[REDACTED\]/);
  });

  it("formats api response safely", () => {
    const text = redactApiResponse("GET", "https://api.samotpravil.ru/x?key=abc", "HTTP/1.1 200", '{"api_key":"x"}', "supersecret");
    assert.match(text, /key=\[REDACTED\]/);
    assert.doesNotMatch(text, /supersecret/);
  });
});
