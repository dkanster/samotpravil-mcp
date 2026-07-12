#!/usr/bin/env node
/**
 * Verify npm + MCP Registry after publish.
 * Usage: node scripts/verify-publish.mjs [version]
 */
const rawVersion = process.argv[2] ?? JSON.parse(
  await import("node:fs").then((fs) =>
    fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  ),
).version;
const version = String(rawVersion).replace(/^v/, "");

const pkg = `samotpravil-mcp@${version}`;
let failed = false;

function fail(message) {
  console.error(`ERROR: ${message}`);
  failed = true;
}

const npmRes = await fetch(`https://registry.npmjs.org/samotpravil-mcp/${version}`);
if (!npmRes.ok) {
  fail(`npm package ${pkg} not found (HTTP ${npmRes.status})`);
} else {
  const npmJson = await npmRes.json();
  console.log(`OK: npm ${pkg} — ${npmJson.dist?.tarball?.slice(0, 60)}...`);
}

const registryRes = await fetch(
  "https://registry.modelcontextprotocol.io/v0.1/servers?search=samotpravil-mcp",
);
if (!registryRes.ok) {
  fail(`MCP Registry search failed (HTTP ${registryRes.status})`);
} else {
  const registryJson = await registryRes.json();
  const servers = registryJson.servers ?? registryJson.items ?? [];
  const match = servers.find((entry) =>
    JSON.stringify(entry).includes("samotpravil-mcp") || JSON.stringify(entry).includes(version),
  );
  if (match) {
    console.log("OK: MCP Registry entry found");
  } else {
    console.warn("WARN: MCP Registry entry not found yet (may need a few minutes after publish)");
  }
}

if (failed) {
  process.exit(1);
}

console.log(`\nManual smoke test: npx -y samotpravil-mcp@${version}`);
