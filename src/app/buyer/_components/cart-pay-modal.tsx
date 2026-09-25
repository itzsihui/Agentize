"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { MarketProductPick, PaymentRail } from "../_lib/buyer-flow";

export function CartPayModal({
  open,
  lines,
  rail,
  onRailChange,
  onClose,
  onPay,
  busy,
}: {
  open: boolean;
  lines: Array<MarketProductPick & { quantity: number }>;
  rail: PaymentRail | null;
  onRailChange: (rail: PaymentRail) => void;
  onClose: () => void;
  onPay: () => void;
  busy?: boolean;
}) {
  useEffect(() => {
    if (open && rail !== "stablecoin") onRailChange("stablecoin");
  }, [open, rail, onRailChange]);

  if (!open || lines.length === 0) return null;

  const total = lines.reduce(
    (sum, line) => sum + Number(line.price) * line.quantity,
    0,
  );
  const stores = [...new Set(lines.map((l) => l.storeSlug))];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-pay-title"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/50"
        disabled={busy}
        onClick={() => {
          if (!busy) onClose();
        }}
      />
      <div className="relative z-[1] flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden border border-border bg-background shadow-xl">
        <div className="border-b border-border px-5 py-4">
          <h2
            id="cart-pay-title"
            className="font-[family-name:var(--font-syne)] text-lg font-semibold tracking-tight"
          >
            Pay cart in chat
          </h2>
          <p className="mt-1 text-xs text-foreground/50">
            {lines.length} SKU{lines.length === 1 ? "" : "s"} · each settles on
            its own locked quote (CaMeL)
          </p>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          <ul className="space-y-2">
            {lines.map((line) => (
              <li
                key={line.id}
                className="flex items-center gap-3 rounded-xl border border-border p-2"
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={line.imageUrl}
                    alt={line.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {line.quarantined
                      ? line.id.split(":")[1] || line.id
                      : line.title}
                  </p>
                  <p className="font-mono text-[10px] text-foreground/45">
                    /s/{line.storeSlug} · ×{line.quantity}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-medium tabular-nums">
                  {(Number(line.price) * line.quantity).toFixed(2)} USDC
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-lg border border-foreground/20 bg-muted/30 px-3 py-3 text-sm">
            <p className="font-medium">USDC · x402</p>
            <p className="mt-0.5 text-xs text-foreground/55">
              Base Sepolia · HTTP 402 → EIP-3009 → PAYMENT-SIGNATURE
            </p>
          </div>

          <div className="mt-4 rounded-md border border-border bg-muted/40 px-3 py-3 text-[13px] leading-relaxed text-foreground/75">
            <p className="text-[11px] font-medium tracking-wide text-foreground/50 uppercase">
              Locked quotes
            </p>
            <p className="mt-2 text-[12px] text-foreground/60">
              Total <strong>{total.toFixed(2)} USDC</strong> across{" "}
              {stores.length} store{stores.length === 1 ? "" : "s"}. Hostile
              catalog titles cannot change payee, amount, or skip authorize on
              any line.
            </p>
            <dl className="mt-2 space-y-1 font-mono text-[11px]">
              {lines.map((line) => {
                const skuId = line.id.includes(":")
                  ? line.id.slice(line.id.indexOf(":") + 1)
                  : line.id;
                return (
                  <div
                    key={line.id}
                    className="flex justify-between gap-2 border-t border-border/60 pt-1"
                  >
                    <dt className="truncate text-foreground/45">
                      /s/{line.storeSlug}:{skuId} ×{line.quantity}
                    </dt>
                    <dd className="shrink-0 text-foreground">
                      {(Number(line.price) * line.quantity).toFixed(2)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-border px-5 py-3">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={onClose}
          >
            Back
          </Button>
          <Button type="button" disabled={busy} onClick={onPay}>
            {busy
              ? "Paying USDC…"
              : `Authorize ${lines.length} settle${lines.length === 1 ? "" : "s"}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
