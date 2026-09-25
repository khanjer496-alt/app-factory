// Pins the preview's D1 database id and public URL into the built Worker config (dist/dietbox/wrangler.json).
// Usage: node scripts/pin-preview-config.mjs <config> <database-id> [url]
import { readFileSync, writeFileSync } from "node:fs";

const [config, databaseId, url] = process.argv.slice(2);
if (!config || !/^[0-9a-f-]{36}$/.test(databaseId || "")) throw new Error("Usage: pin-preview-config.mjs <config> <database-id> [url]");
if (url && !/^https:\/\/[a-z0-9-]+\.[a-z0-9-]+\.workers\.dev$/.test(url)) throw new Error(`Unexpected preview URL: ${url}`);

const c = JSON.parse(readFileSync(config, "utf8"));
const db = (c.d1_databases || []).find((d) => d.binding === "DB");
if (!db) throw new Error("No DB binding in the built config");
db.database_id = databaseId;
if (url) c.vars = { ...c.vars, APP_URL: url, BETTER_AUTH_URL: url };
writeFileSync(config, JSON.stringify(c));
console.log(`  DB ${db.database_name} → ${databaseId}${url ? `; APP_URL → ${url}` : ""}`);
