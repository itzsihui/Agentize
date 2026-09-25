"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { MarketProductPick, PaymentRail } from "../_lib/buyer-flow";

export function ProductPayModal({
  open,
  product,
  rail,
  onRailChange,
  onClose,
  onPay,
  busy,
  receiptNote,
}: {
  open: boolean;
  product: MarketProductPick | null;
  rail: PaymentRail | null;
  onRailChange: (rail: PaymentRail) => void;
  onClose: () => void;
  onPay: () => void;
  busy?: boolean;
  receiptNote?: string | null;
  /** @deprecated Visa rail removed from buyer demo UI. */
  firstVisaIssue?: boolean;
}) {
  const [step, setStep] = useState<"detail" | "confirm">("detail");

  useEffect(() => {
    if (!open) {
      setStep("detail");
      return;
    }
    if (rail !== "stablecoin") onRailChange("stablecoin");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose, rail, onRailChange]);

  if (!open || !product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
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
        <div className="relative aspect-[4/3] bg-muted">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover"
            sizes="512px"
          />
        </div>

        <div className="overflow-y-auto px-5 py-4">
          <h2
            id="product-detail-title"
            className="font-[family-name:var(--font-syne)] text-lg font-semibold tracking-tight"
          >
            {product.quarantined
              ? product.id.includes(":")
                ? product.id.slice(product.id.indexOf(":") + 1)
                : product.id
              : product.title}
          </h2>
          {product.quarantined ? (
            <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12px] leading-relaxed text-foreground/80">
              <p className="font-medium text-destructive">
                Catalog injection attempt
              </p>
              <p className="mt-1 text-foreground/65">
                This listing’s title/description tried to act like instructions
                (e.g. retarget pay or skip authorize). That text is untrusted
                data — it cannot change the locked settle fields below.
              </p>
              {product.injectionFlags?.length ? (
                <p className="mt-1.5 font-mono text-[11px] text-foreground/50">
                  Flags: {product.injectionFlags.join(", ")}
                </p>
              ) : null}
            </div>
          ) : null}
          <p className="mt-1 font-mono text-xs text-foreground/50">
            /s/{product.storeSlug} · {product.storeName}
            {product.merchantDisplayName
              ? ` · sold by ${product.merchantDisplayName}`
              : ""}
          </p>
          {product.quarantined ? (
            <p className="mt-2 break-words font-mono text-[11px] leading-relaxed text-foreground/40">
              Raw title (data only): {product.title}
            </p>
          ) : null}
          <p className="mt-3 text-base font-medium">
            {product.price}{" "}
            <span className="text-foreground/50">USDC</span>
          </p>
          {product.description ? (
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">
              {product.description}
            </p>
          ) : null}

          {step === "detail" ? (
            <div className="mt-5 rounded-lg border border-foreground/20 bg-muted/30 px-3 py-3 text-sm">
              <p className="font-medium">USDC · x402</p>
              <p className="mt-0.5 text-xs text-foreground/55">
                {product.merchantAddress
                  ? `To ${product.merchantAddress.slice(0, 6)}…${product.merchantAddress.slice(-4)} on Base Sepolia`
                  : "Base Sepolia · HTTP 402 → EIP-3009"}
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              <div className="rounded-md border border-border bg-muted/40 px-3 py-3 text-[13px] leading-relaxed text-foreground/75">
                <p className="text-[11px] font-medium tracking-wide text-foreground/50 uppercase">
                  Locked quote
                </p>
                <dl className="mt-2 space-y-1.5 font-mono text-[12px]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-foreground/45">Merchant</dt>
                    <dd className="text-right text-foreground">
                      /s/{product.storeSlug}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-foreground/45">SKU</dt>
                    <dd className="text-right text-foreground">
                      {product.id.includes(":")
                        ? product.id.slice(product.id.indexOf(":") + 1)
                        : product.id}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-foreground/45">Amount</dt>
                    <dd className="text-right text-foreground">
                      {product.price} USDC
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-foreground/45">Rail</dt>
                    <dd className="text-right text-foreground">USDC · x402</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-foreground/45">Authorize</dt>
                    <dd className="text-right text-foreground">Required</dd>
                  </div>
                </dl>
                <p className="mt-3 font-sans text-[12px] leading-relaxed text-foreground/55">
                  {product.quarantined
                    ? "Injection blocked from control flow: payee, amount, SKU, and authorize stay locked to this quote — not the hostile title."
                    : "Untrusted catalog copy cannot change these fields."}
                </p>
              </div>
              <div className="rounded-md border border-border bg-muted/20 px-3 py-2.5 text-[13px] leading-relaxed text-foreground/75">
                Confirm x402 on Base Sepolia: transfer{" "}
                <strong>{product.price}</strong> USDC to merchant crypto receive{" "}
                <span className="font-mono text-xs">
                  {product.merchantAddress || "store payTo"}
                </span>{" "}
                after HTTP 402, then unlock with PAYMENT-SIGNATURE.
              </div>
            </div>
          )}

          {receiptNote ? (
            <p className="mt-3 text-xs text-foreground/60">{receiptNote}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-border px-5 py-3">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => {
              if (step === "confirm") setStep("detail");
              else onClose();
            }}
          >
            {step === "confirm" ? "Back" : "Close"}
          </Button>
          {step === "detail" ? (
            <Button
              type="button"
              disabled={busy}
              onClick={() => setStep("confirm")}
            >
              Continue to pay
            </Button>
          ) : (
            <Button type="button" disabled={busy} onClick={onPay}>
              {busy
                ? "Paying USDC…"
                : product.quarantined
                  ? "Authorize locked settle"
                  : "Authorize purchase"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
