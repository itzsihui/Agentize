"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { MarketProductPick, PaymentRail } from "../_lib/buyer-flow";

function skuOf(id: string) {
  return id.includes(":") ? id.slice(id.indexOf(":") + 1) : id;
}

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
  const itemCount = lines.reduce((n, line) => n + line.quantity, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-pay-title"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/45"
        disabled={busy}
        onClick={() => {
          if (!busy) onClose();
        }}
      />
      <div className="relative z-[1] flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl sm:rounded-2xl">
        <div className="px-5 pt-5 pb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/40">
            Review before pay
          </p>
          <h2
            id="cart-pay-title"
            className="mt-1 font-[family-name:var(--font-space)] text-2xl font-semibold tracking-tight"
          >
            Authorize purchase
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/55">
            {itemCount} item{itemCount === 1 ? "" : "s"} · {stores.length}{" "}
            store{stores.length === 1 ? "" : "s"} · USDC on Base Sepolia
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
          <ul className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border">
            {lines.map((line) => (
              <li key={line.id} className="flex items-center gap-3 px-3 py-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={line.imageUrl}
                    alt={line.title}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-snug">
                    {line.quarantined
                      ? skuOf(line.id)
                      : line.title}
                  </p>
                  <p className="mt-0.5 text-xs text-foreground/45">
                    {line.storeName || line.storeSlug}
                    {line.quantity > 1 ? ` · ×${line.quantity}` : ""}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-medium tabular-nums">
                  {(Number(line.price) * line.quantity).toFixed(2)}
                  <span className="ml-1 text-[11px] font-normal text-foreground/45">
                    USDC
                  </span>
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-foreground/50">Rail</dt>
              <dd className="text-right font-medium">USDC · x402</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-foreground/50">Network</dt>
              <dd className="text-right">Base Sepolia</dd>
            </div>
            {stores.length === 1 ? (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-foreground/50">Store</dt>
                <dd className="truncate text-right font-mono text-xs">
                  /s/{stores[0]}
                </dd>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3">
              <dt className="font-[family-name:var(--font-space)] text-base font-semibold">
                Total
              </dt>
              <dd className="font-[family-name:var(--font-space)] text-xl font-semibold tabular-nums tracking-tight">
                {total.toFixed(2)}{" "}
                <span className="text-sm font-medium text-foreground/45">
                  USDC
                </span>
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-[12px] leading-relaxed text-foreground/45">
            Catalog titles cannot change payee, amount, or skip this authorize.
            Each SKU settles on its locked quote.
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-5 py-4">
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={onClose}
            className="h-10 px-3"
          >
            Back
          </Button>
          <Button
            type="button"
            disabled={busy}
            onClick={onPay}
            className="h-10 min-w-[10rem] px-5"
          >
            {busy ? "Paying USDC…" : `Authorize ${total.toFixed(2)} USDC`}
          </Button>
        </div>
      </div>
    </div>
  );
}
