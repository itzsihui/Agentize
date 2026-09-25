import { getAddress, isAddress } from "viem";

function asAddress(value: unknown): string | null {
  if (typeof value !== "string" || !isAddress(value)) return null;
  try {
    return getAddress(value);
  } catch {
    return null;
  }
}

/** EIP-3009 payer from a decoded x402 PAYMENT-SIGNATURE payload. */
export function extractPayerAddress(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const inner = root.payload;
  if (inner && typeof inner === "object") {
    const bag = inner as Record<string, unknown>;
    const auth = bag.authorization;
    if (auth && typeof auth === "object") {
      const from = asAddress((auth as Record<string, unknown>).from);
      if (from) return from;
    }
    const from = asAddress(bag.from);
    if (from) return from;
  }
  return asAddress(root.from);
}
