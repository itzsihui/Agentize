"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Verdict = {
  decision?: "allow" | "refuse" | "hold";
  reasons?: string[];
  toxicScore?: number;
  traits?: string[];
  source?: string;
  screenedAddress?: string;
};

export function InterceptaRiskBadge({
  address,
  personaLabel,
  onDecision,
}: {
  address?: string | null;
  personaLabel?: string | null;
  onDecision?: (decision: "allow" | "refuse" | "hold" | null) => void;
}) {
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (!address) {
      setVerdict(null);
      setError(null);
      onDecision?.(null);
      return;
    }
    let cancelled = false;
    setVerdict(null);
    setError(null);
    fetch("/api/intercepta/screen", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        purpose: "buyer_preview",
        payTo: address,
      }),
    })
      .then(async (res) => {
        const data = (await res.json()) as Verdict & { error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || "screen failed");
          return;
        }
        setVerdict(data);
        onDecision?.(data.decision ?? null);
      })
      .catch(() => {
        if (!cancelled) setError("Intercepta unreachable");
      });
    return () => {
      cancelled = true;
    };
  }, [address]);

  if (!address && !personaLabel) return null;

  const decision = verdict?.decision;
  const tone =
    decision === "refuse"
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : decision === "hold"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200"
        : "border-border bg-muted/40 text-foreground/70";

  const level =
    decision === "refuse"
      ? "High"
      : decision === "hold"
        ? "Medium"
        : verdict
          ? "Low"
          : "…";

  const payload = verdict
    ? {
        live: true,
        gate: "buyer_preview",
        address,
        decision: verdict.decision,
        toxicScore: verdict.toxicScore ?? null,
        source: verdict.source ?? "quick-scan",
        traits: verdict.traits ?? [],
        reasons: verdict.reasons ?? [],
      }
    : null;

  return (
    <div className={cn("rounded-md border px-3 py-2 text-[12px] leading-relaxed", tone)}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium tracking-wide uppercase text-[10px]">
          Intercepta LIVE
          {personaLabel ? ` · ${personaLabel}` : ""}
          {verdict?.toxicScore != null ? ` · score ${verdict.toxicScore}` : ""}
          {` · ${level}`}
        </p>
        <button
          type="button"
          className="shrink-0 text-[10px] uppercase tracking-wide text-foreground/45 hover:text-foreground/70"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Hide" : "Payload"}
        </button>
      </div>
      {error ? (
        <p className="mt-1 text-foreground/60">{error}</p>
      ) : verdict?.reasons?.[0] ? (
        <p className="mt-1 text-foreground/70">{verdict.reasons[0]}</p>
      ) : (
        <p className="mt-1 text-foreground/50">Live scan…</p>
      )}
      {expanded && payload ? (
        <pre className="mt-2 max-h-36 overflow-auto rounded border border-border/60 bg-background/80 p-2 font-mono text-[10px] leading-snug text-foreground/70">
          {JSON.stringify(payload, null, 2)}
        </pre>
      ) : null}
      {address ? (
        <p className="mt-1 font-mono text-[10px] text-foreground/45">
          GET web3antivirus.io/…/{address.slice(0, 6)}…/{address.slice(-4)}
          /quick-scan
        </p>
      ) : null}
    </div>
  );
}
