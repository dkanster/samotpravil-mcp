import {
  assertApiCallAllowed,
  formatDryRunPreview,
  isAllowSend,
  isReadOnlyMode,
  isSendPath,
} from "../dist/safety.js";

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

process.env.SAMOTPRAVIL_READ_ONLY = "1";
try {
  assertApiCallAllowed("POST", "/api/v2/stop-list/add");
  assert(false, "READ_ONLY should block POST");
} catch (error) {
  assert(String(error).includes("READ_ONLY"), "READ_ONLY error message");
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
assert(isAllowSend(), "default allow send");
assert(!isReadOnlyMode(), "default not read only");

const preview = formatDryRunPreview({
  method: "POST",
  path: "/api/v1/smtp_send",
  body: { email_to: "test@example.com" },
});
assert(preview.includes("DRY RUN"), "dry run header");
assert(preview.includes("smtp_send"), "dry run path");

if (failed) process.exit(1);
