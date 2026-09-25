"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  IDKitRequestWidget,
  passport,
  type IDKitResult,
  type RpContext,
} from "@worldcoin/idkit";
import type { User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { merchantJsonHeaders } from "@/lib/world/client-auth";

const APP_ID = (process.env.NEXT_PUBLIC_WORLD_APP_ID || "") as `app_${string}`;
const ENVIRONMENT =
  process.env.NEXT_PUBLIC_WORLD_ENV === "production" ? "production" : "staging";
const ACTION = "publish-storefront";

type Phase =
  | { kind: "loading" }
  | { kind: "unverified" }
  | { kind: "verified"; credential: string | null }
  | { kind: "cancelled" }
  | { kind: "duplicate" }
  | { kind: "error"; message: string };

type RpSigResponse = {
  rp_id: string;
  nonce: string;
  created_at: number;
  expires_at: number;
  signature: string;
  signal: string;
  error?: string;
};

/** Thrown from handleVerify so IDKit shows failure and we keep the reason. */
class VerifyError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

const CREDENTIAL_LABEL: Record<string, string> = {
  passport: "Passport / eID",
  mnc: "My Number Card",
  secure_document: "NFC document",
  document: "Document",
};

export function WorldVerifyCard({
  user,
  onVerifiedChange,
}: {
  user: User | null;
  onVerifiedChange?: (verified: boolean) => void;
}) {
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });
  const [open, setOpen] = useState(false);
  const [rp, setRp] = useState<{ ctx: RpContext; signal: string } | null>(null);
  const [starting, setStarting] = useState(false);
  const lastError = useRef<VerifyError | null>(null);

  const refreshStatus = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/world/status", {
        headers: await merchantJsonHeaders(user),
      });
      const data = (await res.json()) as { verified?: boolean; credential?: string };
      setPhase(
        data.verified
          ? { kind: "verified", credential: data.credential ?? null }
          : { kind: "unverified" },
      );
      onVerifiedChange?.(Boolean(data.verified));
    } catch {
      setPhase({ kind: "unverified" });
    }
  }, [user, onVerifiedChange]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  async function start() {
    if (!user) return;
    setStarting(true);
    lastError.current = null;
    try {
      const res = await fetch("/api/world/rp-signature", {
        method: "POST",
        headers: await merchantJsonHeaders(user),
      });
      const sig = (await res.json()) as RpSigResponse;
      if (!res.ok) throw new Error(sig.error || "Could not start World ID");
      setRp({
        ctx: {
          rp_id: sig.rp_id,
          nonce: sig.nonce,
          created_at: sig.created_at,
          expires_at: sig.expires_at,
          signature: sig.signature,
        },
        signal: sig.signal,
      });
      setOpen(true);
    } catch (err) {
      setPhase({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not start World ID",
      });
    } finally {
      setStarting(false);
    }
  }

  async function handleVerify(result: IDKitResult) {
    const res = await fetch("/api/world/verify", {
      method: "POST",
      headers: await merchantJsonHeaders(user),
      body: JSON.stringify({ idkitResponse: result }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      code?: string;
      message?: string;
    };
    if (!res.ok || !data.ok) {
      const e = new VerifyError(
        data.code || "verify_failed",
        data.message || "Verification failed",
      );
      lastError.current = e;
      throw e;
    }
  }

  function onError(code?: string) {
    setOpen(false);
    const e = lastError.current;
    if (e?.code === "already_backing_another_merchant") {
      setPhase({ kind: "duplicate" });
    } else if (e) {
      setPhase({ kind: "error", message: e.message });
    } else if (!code || /cancel|reject/i.test(String(code))) {
      setPhase({ kind: "cancelled" });
    } else {
      setPhase({ kind: "error", message: `World ID error: ${code}` });
    }
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    // Closed without success or a server rejection → user cancelled.
    if (!next && !lastError.current) {
      setPhase((p) => (p.kind === "verified" ? p : { kind: "cancelled" }));
    }
  }

  const verified = phase.kind === "verified";

  return (
    <section className="mt-8 space-y-3 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">Seller verification · World ID</h2>
        <span
          className={
            verified
              ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-700 dark:text-emerald-400"
              : "rounded-full bg-muted px-2 py-0.5 text-[11px] text-foreground/60"
          }
        >
          {verified ? "Verified unique seller" : "Not verified"}
        </span>
      </div>
      <p className="text-xs text-foreground/55">
        One person, one storefront. To list on /market and the agent registry,
        prove your account is backed by a government document (Passport, eID
        or Japan My Number Card) that isn&apos;t already backing another store.
        Borneo never sees your name or document number — only a one-way
        identifier for this app.
      </p>

      {phase.kind === "verified" ? (
        <p className="text-sm text-foreground/75">
          Verified with{" "}
          {CREDENTIAL_LABEL[phase.credential || ""] || "a document credential"}.
          Your storefront can be listed.
        </p>
      ) : null}
      {phase.kind === "cancelled" ? (
        <p className="text-sm text-foreground/70">
          Verification cancelled. You can keep building — your store stays an
          unlisted draft until you verify.
        </p>
      ) : null}
      {phase.kind === "duplicate" ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          This document already backs another merchant account. Borneo allows
          one storefront per person, so this account can&apos;t be listed.
        </p>
      ) : null}
      {phase.kind === "error" ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {phase.message}
        </p>
      ) : null}

      {!verified ? (
        <Button
          type="button"
          onClick={() => void start()}
          disabled={!user || starting || phase.kind === "loading" || !APP_ID}
          className="h-10"
        >
          {starting ? "Starting…" : "Verify with World ID"}
        </Button>
      ) : null}
      {!APP_ID ? (
        <p className="text-[11px] text-foreground/45">
          Set NEXT_PUBLIC_WORLD_APP_ID to enable verification.
        </p>
      ) : null}

      {rp ? (
        <IDKitRequestWidget
          open={open}
          onOpenChange={onOpenChange}
          app_id={APP_ID}
          action={ACTION}
          action_description="List your storefront on Borneo"
          rp_context={rp.ctx}
          allow_legacy_proofs={true}
          environment={ENVIRONMENT}
          preset={passport({ signal: rp.signal })}
          handleVerify={handleVerify}
          onSuccess={() => {
            setPhase({ kind: "verified", credential: null });
            void refreshStatus();
          }}
          onError={onError}
        />
      ) : null}
    </section>
  );
}
