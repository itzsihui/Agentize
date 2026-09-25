/**
 * Smoke-test Intercepta wiring (no Next server required for unit parts).
 * Run: npx tsx scripts/test-intercepta.ts
 */
import { getAddress, isAddress } from "viem";
import { DEFAULT_DEMO_PERSONAS } from "../src/lib/intercepta/personas";
import { extractPayerAddress } from "../src/lib/intercepta/payer";

const results: Array<{ name: string; ok: boolean; detail: string }> = [];

function check(name: string, ok: boolean, detail: string) {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

// 1) Personas are valid checksummed mainnet addresses
for (const p of DEFAULT_DEMO_PERSONAS) {
  check(
    `persona ${p.id} address`,
    isAddress(p.address),
    `${p.label} ${p.address}`,
  );
}

// 2) Payer extraction from EIP-3009-shaped payload
const payload = {
  x402Version: 2,
  payload: {
    authorization: {
      from: "0x90E289d524610802cC9468A37B34f8597Eaca901",
      to: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      value: "10000",
    },
  },
};
const payer = extractPayerAddress(payload);
check(
  "extractPayerAddress",
  payer === getAddress("0x90E289d524610802cC9468A37B34f8597Eaca901"),
  payer || "null",
);

check(
  "extractPayerAddress empty",
  extractPayerAddress({}) === null,
  "expected null",
);

// 3) Live Intercepta (needs INTERCEPTA_API_KEY)
const apiKey = process.env.INTERCEPTA_API_KEY?.trim();
const base =
  (process.env.INTERCEPTA_BASE_URL || "https://api.web3antivirus.io").replace(
    /\/$/,
    "",
  );

async function liveScan(address: string, label: string) {
  if (!apiKey) {
    check(
      `live scan ${label}`,
      false,
      "INTERCEPTA_API_KEY empty — cannot live-call (paste key from intercepta.io/ethglobal)",
    );
    return;
  }
  const url = `${base}/api/public/v2/extension/account/${address}/quick-scan`;
  const t0 = Date.now();
  const res = await fetch(url, {
    headers: { "X-API-KEY": apiKey, accept: "application/json" },
  });
  const ms = Date.now() - t0;
  const text = await res.text();
  let score: number | undefined;
  try {
    score = (JSON.parse(text) as { toxicScore?: number }).toxicScore;
  } catch {
    /* ignore */
  }
  check(
    `live scan ${label}`,
    res.ok && typeof score === "number",
    `HTTP ${res.status} in ${ms}ms toxicScore=${score} body=${text.slice(0, 120)}`,
  );
}

async function main() {
  const clean = "0x90E289d524610802cC9468A37B34f8597Eaca901";
  const toxic = DEFAULT_DEMO_PERSONAS[0]!.address;
  await liveScan(clean, "buyer (likely clean)");
  await liveScan(toxic, `persona ${DEFAULT_DEMO_PERSONAS[0]!.id} (expect risk)`);

  // 4) Hit local Next routes if ORIGIN set or localhost:3000 up
  const origin = process.env.ORIGIN || "http://localhost:3000";
  try {
    const personasRes = await fetch(`${origin}/api/intercepta/personas`);
    const personasJson = (await personasRes.json()) as {
      personas?: unknown[];
      demo?: boolean;
    };
    check(
      "GET /api/intercepta/personas",
      personasRes.ok && Array.isArray(personasJson.personas),
      `HTTP ${personasRes.status} count=${personasJson.personas?.length}`,
    );
  } catch (e) {
    check(
      "GET /api/intercepta/personas",
      false,
      `server not up at ${origin}: ${e instanceof Error ? e.message : e}`,
    );
  }

  try {
    const screenRes = await fetch(`${origin}/api/intercepta/screen`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        purpose: "merchant",
        address: toxic,
      }),
    });
    const screenJson = (await screenRes.json()) as {
      decision?: string;
      reasons?: string[];
      error?: string;
    };
    check(
      "POST /api/intercepta/screen (toxic)",
      screenRes.ok && Boolean(screenJson.decision),
      `HTTP ${screenRes.status} decision=${screenJson.decision} reason=${screenJson.reasons?.[0] || screenJson.error}`,
    );
  } catch (e) {
    check(
      "POST /api/intercepta/screen (toxic)",
      false,
      `server not up: ${e instanceof Error ? e.message : e}`,
    );
  }

  const failed = results.filter((r) => !r.ok);
  console.log("\n---");
  console.log(
    `${results.length - failed.length}/${results.length} passed, ${failed.length} failed`,
  );
  if (!apiKey) {
    console.log(
      "\nNOTE: Set INTERCEPTA_API_KEY in .env.local for live Intercepta qualification.",
    );
  }
  process.exit(failed.some((f) => !f.name.startsWith("live") && !f.name.includes("/api/")) ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
