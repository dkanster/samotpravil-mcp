import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertApiCallAllowed,
  isMutatingRequest,
  isReadOnlyMode,
  isSendPath,
  isSideEffectGetPath,
  normalizeApiPath,
} from "../dist/safety.js";

describe("safety", () => {
  it("normalizes API paths", () => {
    assert.equal(normalizeApiPath("/API/V1/SMTP_SEND"), "/api/v1/smtp_send");
    assert.equal(normalizeApiPath("api/v2/issue/status?x=1"), "/api/v2/issue/status");
  });

  it("detects send paths", () => {
    assert.equal(isSendPath("/api/v1/smtp_send"), true);
    assert.equal(isSendPath("/api/v2/issue/status"), false);
    assert.equal(isSendPath("/api/v2/mail/send"), true);
  });

  it("detects side-effect GET paths", () => {
    assert.equal(isSideEffectGetPath("/api/v1/package_stop"), true);
    assert.equal(isSideEffectGetPath("/api/v2/blist/domains"), false);
  });

  it("blocks POST in READ_ONLY mode", () => {
    process.env.SAMOTPRAVIL_READ_ONLY = "1";
    assert.throws(() => assertApiCallAllowed("POST", "/api/v2/stop-list/add"), /READ_ONLY/);
    delete process.env.SAMOTPRAVIL_READ_ONLY;
  });

  it("blocks send when ALLOW_SEND=0", () => {
    process.env.SAMOTPRAVIL_ALLOW_SEND = "0";
    assert.throws(() => assertApiCallAllowed("POST", "/api/v1/smtp_send"), /ALLOW_SEND/);
    delete process.env.SAMOTPRAVIL_ALLOW_SEND;
  });

  it("classifies mutating requests", () => {
    assert.equal(isMutatingRequest("POST", "/api/v2/authkey/create"), true);
    assert.equal(isMutatingRequest("GET", "/api/v2/issue/status"), false);
  });

  it("READ_ONLY is off by default", () => {
    delete process.env.SAMOTPRAVIL_READ_ONLY;
    assert.equal(isReadOnlyMode(), false);
  });
});
