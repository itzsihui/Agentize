/**
 * Smoke tests for Base Sepolia USDC x402 settle path.
 * Usage: node scripts/smoke-base-sepolia.mjs [origin]
 */
const fs = require("fs");
const path = require("path");
const { isAddress } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { x402Client } = require("@x402/core/client");
const { x402HTTPClient } = require("@x402/core/http");
const { registerExactEvmScheme } = require("@x402/evm/exact/client");

const ORIGIN = process.argv[2] || "http://localhost:3000";
const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

function loadEnv() {
  const p = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const results = [];
function pass(name, detail) {
  results.push({ name, ok: true, detail });
  console.log(`PASS  ${name} — ${detail}`);
}
function fail(name, detail) {
  results.push({ name, ok: false, detail });
  console.log(`FAIL  ${name} — ${detail}`);
}

async function get(url) {
  const res = await fetch(url);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* plain */
  }
  return { res, text, json };
}

async function post(url, body, headers = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* plain */
  }
  return { res, text, json };
}

async function main() {
  loadEnv();

  // Unit helpers
  const atomic = BigInt(Math.round(0.01 * 1e6)).toString();
  if (isAddress(USDC) && atomic === "10000") {
    pass("config helpers", `USDC ok, 0.01 → ${atomic} atomic`);
  } else {
    fail("config helpers", `atomic=${atomic}`);
  }

  // HTTP surfaces
  {
    const { res } = await get(`${ORIGIN}/`);
    res.ok ? pass("GET /", `HTTP ${res.status}`) : fail("GET /", `HTTP ${res.status}`);
  }

  {
    const { res, json } = await get(`${ORIGIN}/registry.json`);
    const ok =
      res.ok && String(json?.protocol || "").includes("agentize");
    ok
      ? pass("GET /registry.json", `protocol=${json.protocol}`)
      : fail("GET /registry.json", `HTTP ${res.status}`);
  }

  {
    const { res, text } = await get(`${ORIGIN}/s/hackathon-shirts/llms.txt`);
    const ok =
      res.ok &&
      /USDC/.test(text) &&
      /(Base Sepolia|eip155:84532)/.test(text) &&
      !/XRPL|RLUSD/.test(text);
    ok
      ? pass("llms.txt settle story", "USDC + Base Sepolia, no XRPL/RLUSD")
      : fail("llms.txt settle story", text.slice(0, 120));
  }

  {
    const { res, json } = await get(`${ORIGIN}/s/hackathon-shirts/agent.json`);
    const c = json?.currency || {};
    const ok =
      res.ok &&
      c.symbol === "USDC" &&
      c.network === "eip155:84532" &&
      String(c.asset || "").startsWith("0x");
    ok
      ? pass(
          "agent.json currency",
          `symbol=${c.symbol} network=${c.network}`,
        )
      : fail("agent.json currency", JSON.stringify(c));
  }

  // 402 challenge
  const orderId = crypto.randomUUID();
  let challenge = null;
  {
    const { res, json, text } = await post(
      `${ORIGIN}/s/hackathon-shirts/buy`,
      { skuId: "shirt", quantity: 1, orderId },
    );
    const accept = json?.accepts?.[0];
    const hdr = res.headers.get("PAYMENT-REQUIRED");
    const ok =
      res.status === 402 &&
      accept?.scheme === "exact" &&
      accept?.network === "eip155:84532" &&
      accept?.amount === "10000" &&
      String(accept?.asset || "").toLowerCase().startsWith("0x036cbd") &&
      Boolean(hdr);
    if (ok) {
      challenge = json;
      pass(
        "POST /buy 402",
        `amount=${accept.amount} payTo=${accept.payTo}`,
      );
    } else {
      fail(
        "POST /buy 402",
        `HTTP ${res.status} body=${text.slice(0, 200)}`,
      );
    }
  }

  // Sign
  let paymentHeader = null;
  let buyerAddress = null;
  {
    const keyRaw = process.env.BUYER_PRIVATE_KEY;
    if (!keyRaw) {
      fail("EIP-3009 sign", "BUYER_PRIVATE_KEY missing");
    } else if (!challenge) {
      fail("EIP-3009 sign", "no challenge");
    } else {
      try {
        const key = keyRaw.startsWith("0x") ? keyRaw : `0x${keyRaw}`;
        const account = privateKeyToAccount(key);
        buyerAddress = account.address;
        const client = new x402Client();
        registerExactEvmScheme(client, {
          signer: account,
          networks: ["eip155:84532"],
          schemeOptions: {
            rpcUrl: process.env.BASE_RPC_URL || "https://sepolia.base.org",
          },
        });
        const http = new x402HTTPClient(client);
        const payload = await http.createPaymentPayload(challenge);
        const headers = http.encodePaymentSignatureHeader(payload);
        paymentHeader =
          headers["PAYMENT-SIGNATURE"] ||
          headers["payment-signature"] ||
          Object.values(headers)[0];
        if (!paymentHeader) throw new Error("empty PAYMENT-SIGNATURE");
        pass("EIP-3009 sign", `from=${buyerAddress}`);
      } catch (e) {
        fail("EIP-3009 sign", e instanceof Error ? e.message : String(e));
      }
    }
  }

  // Settle via facilitator (needs funded USDC)
  if (paymentHeader && challenge) {
    const { res, json, text } = await post(
      `${ORIGIN}/s/hackathon-shirts/buy`,
      { skuId: "shirt", quantity: 1, orderId },
      { "PAYMENT-SIGNATURE": paymentHeader },
    );
    if (res.ok && json?.txHash) {
      pass(
        "POST /buy settle",
        `tx=${json.txHash} explorer=${json.explorerUrl || ""}`,
      );
    } else {
      fail(
        "POST /buy settle",
        `HTTP ${res.status} ${text.slice(0, 280)}`,
      );
    }
  } else {
    fail("POST /buy settle", "skipped — no signature");
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log("");
  console.log(`==== SUMMARY ====  Passed: ${passed}  Failed: ${failed}`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
