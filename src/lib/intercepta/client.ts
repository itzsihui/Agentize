import { interceptaConfig } from "@/lib/config";
import { emit } from "@/lib/protocol/events";
import type { InterceptaAddressScan, InterceptaTrait } from "./types";

const QUICK_PATH = "/api/public/v2/extension/account";

function headers() {
  const key = interceptaConfig.apiKey;
  if (!key) {
    throw new Error("INTERCEPTA_API_KEY is not set");
  }
  return {
    "X-API-KEY": key,
    accept: "application/json",
  };
}

function parseScan(data: unknown): InterceptaAddressScan {
  const raw = (data ?? {}) as {
    toxicScore?: number;
    traits?: Array<{
      risk?: number;
      name?: string;
      txsCount?: number;
      description?: string;
    }>;
  };
  const traits: InterceptaTrait[] = (raw.traits ?? [])
    .filter((t) => typeof t.name === "string")
    .map((t) => ({
      risk: Number(t.risk) || 0,
      name: String(t.name),
      txsCount: typeof t.txsCount === "number" ? t.txsCount : undefined,
      description:
        typeof t.description === "string" ? t.description : undefined,
    }));
  return {
    toxicScore: Number(raw.toxicScore) || 0,
    traits,
  };
}

function shortAddr(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

async function getScan(
  address: string,
  kind: "quick-scan" | "toxic-score",
): Promise<InterceptaAddressScan> {
  const path = `${QUICK_PATH}/${encodeURIComponent(address)}/${kind}`;
  const url = `${interceptaConfig.baseUrl}${path}`;
  const t0 = Date.now();
  const res = await fetch(url, {
    method: "GET",
    headers: headers(),
    cache: "no-store",
  });
  const text = await res.text();
  const ms = Date.now() - t0;

  if (!res.ok) {
    // Intercepta mainnet-only: unused / testnet EOAs 404 with "doesn't exist".
    // That is not a toxic hit — treat as empty clean scan so Sepolia payTo works.
    const missingEoa =
      res.status === 404 &&
      /doesn'?t exist|does not exist|not found/i.test(text);
    if (missingEoa) {
      emit({
        status: 200,
        method: "GET",
        path: `/intercepta/${kind}/${shortAddr(address)}`,
        rail: "x402",
        message: `LIVE Intercepta ${kind} ${shortAddr(address)} · no mainnet EOA · toxicScore=0 · traits=[] · ${ms}ms (404 empty → allow)`,
      });
      return { toxicScore: 0, traits: [] };
    }
    emit({
      status: res.status,
      method: "GET",
      path: `/intercepta/${kind}`,
      rail: "x402",
      message: `LIVE Intercepta ${kind} FAIL ${shortAddr(address)} · ${ms}ms · ${text.slice(0, 120)}`,
    });
    throw new Error(
      `Intercepta ${kind} HTTP ${res.status}: ${text.slice(0, 180)}`,
    );
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    emit({
      status: 502,
      method: "GET",
      path: `/intercepta/${kind}`,
      rail: "x402",
      message: `LIVE Intercepta ${kind} non-JSON ${shortAddr(address)}`,
    });
    throw new Error(`Intercepta ${kind} returned non-JSON`);
  }

  const scan = parseScan(data);
  const traitNames = scan.traits
    .slice(0, 5)
    .map((t) => t.name)
    .join(",") || "none";
  emit({
    status: 200,
    method: "GET",
    path: `/intercepta/${kind}/${shortAddr(address)}`,
    rail: "x402",
    message: `LIVE Intercepta ${kind} ${shortAddr(address)} · toxicScore=${scan.toxicScore} · traits=[${traitNames}] · ${ms}ms · raw={toxicScore:${scan.toxicScore},traits:${scan.traits.length}}`,
  });
  return scan;
}

/** Live Quick Scan — https://docs.web3antivirus.io/reference/quick-scan-address */
export async function quickScanAddress(
  address: string,
): Promise<InterceptaAddressScan> {
  return getScan(address, "quick-scan");
}

/** Live Deep Scan — https://docs.web3antivirus.io/reference/scan-address */
export async function scanAddress(
  address: string,
): Promise<InterceptaAddressScan> {
  return getScan(address, "toxic-score");
}
