import { interceptaConfig } from "@/lib/config";
import { quickScanAddress, scanAddress } from "./client";
import type {
  InterceptaAddressScan,
  InterceptaDecision,
  InterceptaVerdict,
} from "./types";

const SELLER_REFUSE_TRAITS = new Set([
  "sanction_address",
  "blacklist",
  "known_scammer",
  "mixer_transfers",
]);

const BUYER_REFUSE_TRAITS = new Set([
  "sanction_address",
  "blacklist",
  "known_scammer",
]);

function traitLines(scan: InterceptaAddressScan, limit = 3): string[] {
  return scan.traits
    .slice()
    .sort((a, b) => b.risk - a.risk)
    .slice(0, limit)
    .map((t) => t.description || t.name.replace(/_/g, " "));
}

function sellerDecision(scan: InterceptaAddressScan): InterceptaDecision {
  const names = new Set(scan.traits.map((t) => t.name));
  for (const name of SELLER_REFUSE_TRAITS) {
    if (names.has(name)) return "refuse";
  }
  if (scan.toxicScore >= 50) return "refuse";
  if (scan.toxicScore >= 25) return "hold";
  return "allow";
}

function buyerDecision(scan: InterceptaAddressScan): InterceptaDecision {
  const names = new Set(scan.traits.map((t) => t.name));
  for (const name of BUYER_REFUSE_TRAITS) {
    if (names.has(name)) return "refuse";
  }
  if (scan.toxicScore >= 70) return "refuse";
  return "allow";
}

function toVerdict(
  address: string,
  scan: InterceptaAddressScan,
  decision: InterceptaDecision,
  source: InterceptaVerdict["source"],
): InterceptaVerdict {
  const reasons =
    decision === "allow"
      ? [
          `Intercepta ${source}: toxicScore ${scan.toxicScore} — allow`,
          ...traitLines(scan, 2),
        ]
      : [
          `Intercepta ${source}: ${decision} (toxicScore ${scan.toxicScore})`,
          ...traitLines(scan, 4),
        ];
  return {
    decision,
    reasons: reasons.filter(Boolean),
    toxicScore: scan.toxicScore,
    screenedAddress: address,
    traits: scan.traits.map((t) => t.name),
    source,
  };
}

export function unavailableVerdict(
  address: string,
  reason: string,
): InterceptaVerdict {
  if (interceptaConfig.failOpen) {
    return {
      decision: "allow",
      reasons: [`Intercepta unavailable (fail-open): ${reason}`],
      screenedAddress: address,
      source: "unavailable",
    };
  }
  return {
    decision: "refuse",
    reasons: [`Intercepta unavailable — merchant refuse (fail-closed): ${reason}`],
    screenedAddress: address,
    source: "unavailable",
  };
}

/**
 * Seller gate: Quick Scan, then Deep Scan if elevated.
 * Live Intercepta only — never mocked.
 */
export async function screenPayerForMerchant(
  address: string,
): Promise<InterceptaVerdict> {
  try {
    const quick = await quickScanAddress(address);
    const elevated =
      sellerDecision(quick) !== "allow" ||
      quick.toxicScore >= 25 ||
      quick.traits.length > 0;
    if (!elevated) {
      return toVerdict(address, quick, "allow", "quick-scan");
    }
    const deep = await scanAddress(address);
    return toVerdict(address, deep, sellerDecision(deep), "deep-scan");
  } catch (error) {
    const reason = error instanceof Error ? error.message : "scan failed";
    return unavailableVerdict(address, reason);
  }
}

/** Buyer secondary: one Quick Scan of payTo. */
export async function screenPayToForBuyer(
  address: string,
): Promise<InterceptaVerdict> {
  try {
    const quick = await quickScanAddress(address);
    return toVerdict(address, quick, buyerDecision(quick), "quick-scan");
  } catch (error) {
    const reason = error instanceof Error ? error.message : "scan failed";
    return unavailableVerdict(address, reason);
  }
}
