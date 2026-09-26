"use client";

import {
  CheckIcon,
  MinusIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

type Cell = "yes" | "no" | "partial";

const COLUMNS = [
  "ChatGPT Instant Checkout",
  "Stripe ACP",
  "Shopify",
  "Amazon",
  "Cloudflare Agents",
  "Agentize",
] as const;

const ROWS: { feature: string; cells: Cell[] }[] = [
  {
    feature: "Open to any HTTP agent",
    cells: ["no", "no", "no", "no", "partial", "yes"],
  },
  {
    feature: "Machine-readable merchant catalog",
    cells: ["partial", "yes", "no", "partial", "no", "yes"],
  },
  {
    feature: "Merchant publishes once, owns endpoints",
    cells: ["no", "partial", "partial", "no", "no", "yes"],
  },
  {
    feature: "Intent search across independent stores",
    cells: ["no", "no", "no", "yes", "no", "yes"],
  },
  {
    feature: "In-chat settle (x402 / authorize)",
    cells: ["partial", "partial", "no", "no", "no", "yes"],
  },
  {
    feature: "No app / marketplace / runtime gate",
    cells: ["no", "no", "yes", "no", "no", "yes"],
  },
  {
    feature: "Drop-in buyer skill (any agent)",
    cells: ["no", "no", "no", "no", "partial", "yes"],
  },
];

function CellMark({ value, highlight }: { value: Cell; highlight?: boolean }) {
  if (value === "yes") {
    return (
      <CheckIcon
        className={cn(
          "mx-auto size-5",
          highlight ? "text-[var(--lp-signal)]" : "text-[var(--lp-ink)]",
        )}
        weight="bold"
        aria-label="Yes"
      />
    );
  }
  if (value === "partial") {
    return (
      <MinusIcon
        className="mx-auto size-5 text-[var(--lp-faint)]"
        weight="bold"
        aria-label="Partial"
      />
    );
  }
  return (
    <XIcon
      className="mx-auto size-5 text-[var(--lp-faint)]"
      weight="bold"
      aria-label="No"
    />
  );
}

export function LandingCompetitorTable() {
  return (
    <section
      aria-label="Competitive comparison"
      className="border-t border-[var(--lp-line)] px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <p className="landing-kicker">03 — Competitive</p>
          <h2 className="mt-5 max-w-[18ch] text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.05] text-[var(--lp-ink)]">
            Where Agentize wins on paper.
          </h2>
          <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-[var(--lp-muted)]">
            Named surfaces. Features as ticks and crosses — no soft labels.
          </p>
        </Reveal>

        <Reveal className="mt-12" delay={0.08}>
          <div className="overflow-x-auto border border-[var(--lp-line-strong)]">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--lp-line-strong)] bg-[color-mix(in_oklab,var(--lp-ink)_4%,transparent)]">
                  <th className="sticky left-0 z-10 bg-[var(--lp-paper)] px-4 py-4 font-[family-name:var(--font-space)] text-xs font-semibold uppercase tracking-wide text-[var(--lp-muted)]">
                    Feature
                  </th>
                  {COLUMNS.map((col) => {
                    const isUs = col === "Agentize";
                    return (
                      <th
                        key={col}
                        className={cn(
                          "px-3 py-4 text-center font-[family-name:var(--font-space)] text-xs font-semibold leading-snug",
                          isUs
                            ? "bg-[var(--lp-signal)] text-[var(--lp-signal-ink)]"
                            : "text-[var(--lp-ink)]",
                        )}
                      >
                        {col}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-b border-[var(--lp-line)] last:border-b-0"
                  >
                    <th
                      scope="row"
                      className="sticky left-0 bg-[var(--lp-paper)] px-4 py-4 text-left font-medium text-[var(--lp-ink)]"
                    >
                      {row.feature}
                    </th>
                    {row.cells.map((cell, i) => {
                      const isUs = COLUMNS[i] === "Agentize";
                      return (
                        <td
                          key={`${row.feature}-${COLUMNS[i]}`}
                          className={cn(
                            "px-3 py-4 text-center",
                            isUs &&
                              "bg-[color-mix(in_oklab,var(--lp-signal)_8%,transparent)]",
                          )}
                        >
                          <CellMark value={cell} highlight={isUs} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-[62ch] text-xs leading-relaxed text-[var(--lp-muted)]">
            Cloudflare Agents run agents — not a merchant catalog protocol;
            included as adjacent infrastructure. Stripe ACP / Instant Checkout
            class flows gate reach through partner surfaces.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
