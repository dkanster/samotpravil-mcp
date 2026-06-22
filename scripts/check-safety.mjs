import {
  assertApiCallAllowed,
  assertGenericApiAllowed,
  formatDryRunPreview,
  isAllowGenericApi,
  isAllowMutations,
  isAllowSend,
  isMutatingRequest,
  isReadOnlyMode,
  isSendPath,
  isSideEffectGetPath,
} from "../dist/safety.js";
import { redactApiResponse, redactResponseBody } from "../dist/redact.js";

let failed = false;
function assert(condition, message) {
  if (!condition) {
    console.error(message);
    failed = true;
  }
}

assert(isSendPath("/api/v1/smtp_send"), "isSendPath smtp_send");
assert(!isSendPath("/api/v2/issue/status"), "issue status is not send");
assert(isSendPath("/api/v2/mail/send"), "mail send path");
assert(isSideEffectGetPath("/api/v1/package_stop"), "package_stop is side-effect GET");

process.env.SAMOTPRAVIL_READ_ONLY = "1";
try {
  assertApiCallAllowed("POST", "/api/v2/stop-list/add");
  assert(false, "READ_ONLY should block POST");
} catch (error) {
  assert(String(error).includes("READ_ONLY"), "READ_ONLY error message");
}
try {
  assertApiCallAllowed("GET", "/api/v1/package_stop");
  assert(false, "READ_ONLY should block side-effect GET");
} catch (error) {
  assert(String(error).includes("READ_ONLY"), "READ_ONLY side-effect GET message");
}
assertApiCallAllowed("GET", "/api/v2/issue/status");

delete process.env.SAMOTPRAVIL_READ_ONLY;
process.env.SAMOTPRAVIL_ALLOW_SEND = "0";
try {
  assertApiCallAllowed("POST", "/api/v1/smtp_send");
  assert(false, "ALLOW_SEND=0 should block send");
} catch (error) {
  assert(String(error).includes("ALLOW_SEND"), "ALLOW_SEND error message");
}
assertApiCallAllowed("GET", "/api/v2/blist/domains");

delete process.env.SAMOTPRAVIL_ALLOW_SEND;
process.env.SAMOTPRAVIL_ALLOW_MUTATIONS = "0";
try {
  assertApiCallAllowed("POST", "/api/v2/authkey/create");
  assert(false, "ALLOW_MUTATIONS=0 should block authkey create");
} catch (error) {
  assert(String(error).includes("ALLOW_MUTATIONS"), "ALLOW_MUTATIONS error message");
}
assert(isMutatingRequest("POST", "/api/v2/stop-list/add"), "stop-list add is mutating");

delete process.env.SAMOTPRAVIL_ALLOW_MUTATIONS;
process.env.SAMOTPRAVIL_ALLOW_GENERIC_API = "0";
try {
  assertGenericApiAllowed();
  assert(false, "ALLOW_GENERIC_API=0 should block api_request");
} catch (error) {
  assert(String(error).includes("ALLOW_GENERIC_API"), "ALLOW_GENERIC_API error message");
}

delete process.env.SAMOTPRAVIL_ALLOW_GENERIC_API;
assert(isAllowSend(), "default allow send");
assert(isAllowMutations(), "default allow mutations");
assert(isAllowGenericApi(), "default allow generic api");
assert(!isReadOnlyMode(), "default not read only");

const preview = formatDryRunPreview({
  method: "POST",
  path: "/api/v1/smtp_send",
  body: { email_to: "test@example.com" },
});
assert(preview.includes("DRY RUN"), "dry run header");
assert(preview.includes("smtp_send"), "dry run path");

const redacted = redactResponseBody(
  JSON.stringify({ status: "ok", api_keys: [{ api_key: "secret-key-12345678" }] }),
  ["secret-key-12345678"],
);
assert(redacted.includes("[REDACTED]"), "redact api_key field");
assert(!redacted.includes("secret-key-12345678"), "redact known secret value");

const redactedResponse = redactApiResponse(
  "GET",
  "https://api.samotpravil.ru/api/v1/package_status?key=leaked&pack_id=1",
  "Status: 200 OK",
  '{"api_key":"secret-key-12345678"}',
  "secret-key-12345678",
);
assert(redactedResponse.includes("key=[REDACTED]"), "redact key query param");
assert(!redactedResponse.includes("secret-key-12345678"), "redact response secret");

if (failed) process.exit(1);
