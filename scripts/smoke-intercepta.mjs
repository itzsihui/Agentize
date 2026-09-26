/**
 * Lightweight Intercepta smoke: ONE quick-scan only (no deep scan).
 * Usage: node scripts/smoke-intercepta.mjs
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

console.log("key_present:", Boolean(key && key.length > 8));
console.log("key_len:", key ? key.length : 0);
console.log("base:", base);
if (!key) process.exit(1);

// vitalik.eth — one quick-scan credit; skip dirty demo personas (can escalate)
const address = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
const url = `${base}/api/public/v2/extension/account/${address}/quick-scan`;

const t0 = Date.now();
const res = await fetch(url, {
  method: "GET",
  headers: { "X-API-KEY": key, accept: "application/json" },
});
const text = await res.text();
console.log("http:", res.status);
console.log("ms:", Date.now() - t0);

if (!res.ok) {
  console.log("body_preview:", text.slice(0, 240));
  process.exit(2);
}

let data;
try {
  data = JSON.parse(text);
} catch {
  console.log("non_json");
  process.exit(3);
}

const traits = Array.isArray(data.traits) ? data.traits : [];
console.log("toxicScore:", data.toxicScore);
console.log("traits_count:", traits.length);
console.log(
  "top_traits:",
  traits
    .slice(0, 3)
    .map((t) => `${t.name}:${t.risk}`)
    .join(", ") || "(none)",
);
console.log("smoke: OK (1x quick-scan only)");
