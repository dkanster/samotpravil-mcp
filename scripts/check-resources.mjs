import {
  findEndpointBySlug,
  listEndpointResources,
  readEndpointsIndexResource,
  readEndpointResource,
  readErrorsResource,
  readIntegrationResource,
  readSdkMappingResource,
  readChangelogResource,
  readRateLimitsResource,
} from "../dist/resources.js";
import { loadDocumentation } from "../dist/docs.js";

process.env.SAMOTPRAVIL_DOCS_MODE = "snapshot";

const errors = readErrorsResource();
if (!errors.includes("550 bounced check filter")) {
  throw new Error("errors resource missing content");
}

const integration = readIntegrationResource();
if (!integration.includes("X-Track-ID")) {
  throw new Error("integration resource missing content");
}

const sdkMapping = readSdkMappingResource();
if (!sdkMapping.includes("Python SDK")) {
  throw new Error("sdk-mapping resource missing content");
}

const changelog = readChangelogResource();
if (!changelog.includes("Changelog")) {
  throw new Error("changelog resource missing content");
}

const rateLimits = readRateLimitsResource();
if (!rateLimits.includes("10 000")) {
  throw new Error("rate-limits resource missing content");
}

const index = await readEndpointsIndexResource();
if (!index.includes("smtp_send")) {
  throw new Error("endpoints index missing smtp_send");
}

const endpointText = await readEndpointResource("smtp_send");
if (!endpointText.includes("Отправка через API") && !endpointText.includes("smtp_send")) {
  throw new Error("endpoint resource missing smtp_send content");
}

const listed = await listEndpointResources();
if (listed.length < 50) {
  throw new Error(`Expected >=50 listed resources, got ${listed.length}`);
}

const { endpoints } = await loadDocumentation();
const smtp = findEndpointBySlug(endpoints, "smtp_send");
if (!smtp) throw new Error("findEndpointBySlug failed for smtp_send");

console.log(`OK: ${listed.length} endpoint resources, slug smtp_send -> ${smtp.name}`);
