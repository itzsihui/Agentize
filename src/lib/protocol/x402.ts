import { HTTPFacilitatorClient } from "@x402/core/server";
import {
  decodePaymentSignatureHeader,
  encodePaymentRequiredHeader,
} from "@x402/core/http";
import type {
  PaymentPayload,
  PaymentRequired,
  PaymentRequirements,
} from "@x402/core/types";
import { config, explorerTx, toAtomic } from "@/lib/config";
import type { Sku, StoreRecord } from "@/lib/store/types";

export type { PaymentRequired, PaymentRequirements, PaymentPayload };

export function buildPaymentRequired(
  store: StoreRecord,
  sku: Sku,
  origin: string,
  orderId: string,
  quantity: number,
): PaymentRequired {
  const amount = (
    BigInt(toAtomic(sku.price)) * BigInt(quantity)
  ).toString();
  const accept: PaymentRequirements = {
    scheme: "exact",
    network: config.network,
    amount,
    asset: config.tokenAddress,
    payTo: store.merchantAddress,
    maxTimeoutSeconds: 600,
    extra: {
      name: config.tokenSymbol,
      version: "2",
      decimals: config.tokenDecimals,
      orderId,
    },
  };
  return {
    x402Version: 2,
    resource: {
      url: `${origin}/s/${store.slug}/buy`,
      description: `${sku.title} x${quantity}`,
      mimeType: "application/json",
    },
    accepts: [accept],
  };
}

/** Atomic amount for order records (micro-units). */
export function paymentAmountAtomic(
  _store: StoreRecord,
  sku: Sku,
  quantity: number,
): string {
  return (BigInt(toAtomic(sku.price)) * BigInt(quantity)).toString();
}

export function parsePaymentSignature(header: string): PaymentPayload | null {
  const raw = header.trim();
  if (!raw) return null;
  try {
    return decodePaymentSignatureHeader(raw);
  } catch {
    try {
      const decoded = JSON.parse(
        Buffer.from(raw, "base64").toString("utf8"),
      ) as PaymentPayload;
      if (decoded?.x402Version && decoded?.payload && decoded?.accepted) {
        return decoded;
      }
    } catch {
      return null;
    }
  }
  return null;
}

function facilitator() {
  return new HTTPFacilitatorClient({ url: config.facilitatorUrl });
}

/**
 * Verify + settle an EIP-3009 USDC payment via the hosted x402 facilitator.
 */
export async function verifyAndSettle(args: {
  paymentHeader: string;
  paymentRequirements: PaymentRequirements;
}) {
  try {
    const payload = parsePaymentSignature(args.paymentHeader);
    if (!payload) {
      return { ok: false as const, reason: "Invalid PAYMENT-SIGNATURE" };
    }

    const client = facilitator();
    const verified = await client.verify(payload, args.paymentRequirements);
    if (!verified.isValid) {
      return {
        ok: false as const,
        reason:
          verified.invalidReason ||
          verified.invalidMessage ||
          "Facilitator rejected payment",
      };
    }

    const settled = await client.settle(payload, args.paymentRequirements);
    if (!settled.success || !settled.transaction) {
      return {
        ok: false as const,
        reason:
          settled.errorReason ||
          settled.errorMessage ||
          "Facilitator settle failed",
      };
    }

    return {
      ok: true as const,
      txHash: settled.transaction,
      explorerUrl: explorerTx(settled.transaction),
      payer: settled.payer || undefined,
    };
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "verifyAndSettle failed";
    return { ok: false as const, reason };
  }
}

/** @deprecated Use verifyAndSettle — kept name alias for call-site clarity. */
export async function verifyTransfer(args: {
  paymentHeader: string;
  paymentRequirements: PaymentRequirements;
}) {
  return verifyAndSettle(args);
}

export function paymentRequiredHeaders(body: PaymentRequired) {
  return {
    "content-type": "application/json",
    "PAYMENT-REQUIRED": encodePaymentRequiredHeader(body),
    "cache-control": "no-store",
  };
}
