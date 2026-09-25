import { interceptaConfig } from "@/lib/config";
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

async function getScan(
  address: string,
  kind: "quick-scan" | "toxic-score",
): Promise<InterceptaAddressScan> {
  const url = `${interceptaConfig.baseUrl}${QUICK_PATH}/${encodeURIComponent(address)}/${kind}`;
  const res = await fetch(url, {
    method: "GET",
    headers: headers(),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `Intercepta ${kind} HTTP ${res.status}: ${text.slice(0, 180)}`,
    );
  }
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Intercepta ${kind} returned non-JSON`);
  }
  return parseScan(data);
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
