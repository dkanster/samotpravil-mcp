#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const META_PATH = join(ROOT, "data", "snapshot.meta.json");
const MAX_AGE_DAYS = Number.parseInt(process.env.SNAPSHOT_MAX_AGE_DAYS ?? "30", 10);

const meta = JSON.parse(readFileSync(META_PATH, "utf8"));
const syncedAt = new Date(meta.syncedAt);
const ageMs = Date.now() - syncedAt.getTime();
const ageDays = ageMs / (1000 * 60 * 60 * 24);

if (!Number.isFinite(ageDays)) {
  throw new Error(`Invalid syncedAt in ${META_PATH}`);
}

if (ageDays > MAX_AGE_DAYS) {
  console.warn(
    `WARN: snapshot is ${ageDays.toFixed(1)} days old (max ${MAX_AGE_DAYS}). Run: npm run sync-docs`,
  );
  process.exit(0);
}

console.log(`OK: snapshot age ${ageDays.toFixed(1)} days (max ${MAX_AGE_DAYS})`);
