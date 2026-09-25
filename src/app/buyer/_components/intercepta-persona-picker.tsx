"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type InterceptaPersonaOption = {
  id: string;
  label: string;
  blurb: string;
  address?: string;
};

export function InterceptaPersonaPicker({
  activeId,
  onSelect,
}: {
  activeId: string | null;
  onSelect: (persona: InterceptaPersonaOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const [honest, setHonest] = useState<InterceptaPersonaOption | null>(null);
  const [personas, setPersonas] = useState<InterceptaPersonaOption[]>([]);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    fetch("/api/intercepta/personas")
      .then(async (res) => {
        const data = (await res.json()) as {
          demo?: boolean;
          honest?: InterceptaPersonaOption;
          personas?: InterceptaPersonaOption[];
        };
        if (data.demo === false) {
          setHidden(true);
          return;
        }
        setHonest(
          data.honest ?? {
            id: "honest",
            label: "Honest buyer",
            blurb: "Screen the real payer.",
          },
        );
        setPersonas(data.personas ?? []);
      })
      .catch(() => {
        setHidden(true);
      });
  }, []);

  if (hidden || !honest) return null;

  const active =
    activeId && activeId !== "honest"
      ? personas.find((p) => p.id === activeId)
      : honest;
  const short = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

  return (
    <div className="shrink-0 rounded-md border border-border bg-muted/20 px-3 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-foreground/45">
            Demo: buyer risk persona
          </p>
          <p className="text-xs text-foreground/75">
            {active?.id === "honest" || !active
              ? "Honest buyer — merchant screens the real payer"
              : `Acting as ${active.label} · ${short(active.address)}`}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-8 text-xs"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Pretend to be malicious"}
        </Button>
      </div>
      {open ? (
        <ul className="mt-2 grid gap-1.5">
          <li>
            <button
              type="button"
              className={cn(
                "w-full rounded-md border px-3 py-2 text-left text-xs",
                !activeId || activeId === "honest"
                  ? "border-foreground/30 bg-background"
                  : "border-border hover:bg-muted/40",
              )}
              onClick={() => {
                onSelect(honest);
                setOpen(false);
              }}
            >
              <span className="font-medium">{honest.label}</span>
              <span className="mt-0.5 block text-foreground/55">
                {honest.blurb}
              </span>
            </button>
          </li>
          {personas.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className={cn(
                  "w-full rounded-md border px-3 py-2 text-left text-xs",
                  activeId === p.id
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-border hover:bg-muted/40",
                )}
                onClick={() => {
                  onSelect(p);
                  setOpen(false);
                }}
              >
                <span className="font-medium">Malicious · {p.label}</span>
                <span className="mt-0.5 block font-mono text-[11px] text-foreground/55">
                  {short(p.address)}
                </span>
                <span className="mt-0.5 block text-foreground/50">{p.blurb}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
