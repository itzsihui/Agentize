"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { PaymentRail } from "../_lib/buyer-flow";

export function PaymentRailPicker({
  value,
  onChange,
  onContinue,
  disabled,
  canContinue,
}: {
  value: PaymentRail | null;
  onChange: (rail: PaymentRail) => void;
  onContinue: () => void;
  disabled?: boolean;
  canContinue?: boolean;
}) {
  useEffect(() => {
    if (value !== "stablecoin") onChange("stablecoin");
  }, [value, onChange]);

  return (
    <section className="border border-border">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-[family-name:var(--font-syne)] text-sm font-semibold tracking-tight">
          Pay with USDC
        </h2>
        <p className="mt-1 text-xs text-foreground/55">
          Single settle rail for this demo — x402 on Base Sepolia. Confirm before
          the agent transacts.
        </p>
      </div>

      <div className="p-4">
        <div className="rounded-lg border border-foreground bg-muted/50 p-4 ring-1 ring-foreground">
          <p className="text-sm font-medium">USDC on Base Sepolia</p>
          <p className="mt-1 text-xs text-foreground/55">
            Stablecoin · x402 handshake
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-foreground/70">
            HTTP 402 challenge → on-chain USDC transfer on Base Sepolia → retry
            with PAYMENT-SIGNATURE — no redirect.
          </p>
        </div>
      </div>

      <div className="border-t border-border px-4 py-3">
        <Button
          type="button"
          disabled={disabled || !canContinue}
          onClick={onContinue}
        >
          Continue to checkout
        </Button>
      </div>
    </section>
  );
}
