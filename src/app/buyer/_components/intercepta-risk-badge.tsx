"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Verdict = {
  decision?: "allow" | "refuse" | "hold";
  reasons?: string[];
  toxicScore?: number;
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

  return (
    <div className={cn("rounded-md border px-3 py-2 text-[12px] leading-relaxed", tone)}>
      <p className="font-medium tracking-wide uppercase text-[10px]">
        Intercepta
        {personaLabel ? ` · ${personaLabel}` : ""}
        {verdict?.toxicScore != null ? ` · score ${verdict.toxicScore}` : ""}
        {` · ${level}`}
      </p>
      {error ? (
        <p className="mt-1 text-foreground/60">{error}</p>
      ) : verdict?.reasons?.[0] ? (
        <p className="mt-1 text-foreground/70">{verdict.reasons[0]}</p>
      ) : (
        <p className="mt-1 text-foreground/50">Live scan…</p>
      )}
    </div>
  );
}
