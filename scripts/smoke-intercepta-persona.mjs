/**
 * One quick-scan of the Sanctioned demo persona — confirms Intercepta still flags it.
 * Usage: node scripts/smoke-intercepta-persona.mjs
 */
import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env.local");
const raw = fs.readFileSync(envPath, "utf8");
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (!m) continue;
  env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, "");
}

const key = env.INTERCEPTA_API_KEY;
const base = (env.INTERCEPTA_BASE_URL || "https://api.web3antivirus.io").replace(
  /\/$/,
  "",
);
if (!key) {
  console.error("no key");
  process.exit(1);
}

// Default sanctioned persona from src/lib/intercepta/personas.ts
const address = "0x7F367cC41522cE07553e823bf3be79A889DEbe1B";
const url = `${base}/api/public/v2/extension/account/${address}/quick-scan`;

const res = await fetch(url, {
  method: "GET",
  headers: { "X-API-KEY": key, accept: "application/json" },
});
const text = await res.text();
console.log("http:", res.status);
if (!res.ok) {
  console.log(text.slice(0, 240));
  process.exit(2);
}
const data = JSON.parse(text);
const traits = Array.isArray(data.traits) ? data.traits : [];
const names = new Set(traits.map((t) => t.name));
const sellerRefuseTraits = [
  "sanction_address",
  "blacklist",
  "known_scammer",
  "mixer_transfers",
];
const hit = sellerRefuseTraits.filter((n) => names.has(n));
const score = Number(data.toxicScore) || 0;
let decision = "allow";
if (hit.length) decision = "refuse";
else if (score >= 50) decision = "refuse";
else if (score >= 25) decision = "hold";

console.log("address:", address);
console.log("toxicScore:", score);
console.log("traits:", traits.map((t) => t.name).slice(0, 8).join(", ") || "(none)");
console.log("seller_gate_decision:", decision);
console.log(
  decision === "allow"
    ? "WARN: would NOT block on quick-scan alone (deep scan may still refuse)"
    : "OK: merchant gate would block (hold/refuse)",
);
