"use client";

import { ArrowRightIcon } from "@phosphor-icons/react";
import { Reveal } from "@/components/landing/reveal";

const PAIRS = [
  {
    problem: "Catalogs locked inside two chat apps",
    solution: "Open registry.json + /api/search — any HTTP agent",
  },
  {
    problem: "Agents scrape HTML and hope",
    solution: "Machine catalog + llms.txt per store",
  },
  {
    problem: "Checkout leaves the conversation",
    solution: "Authorize in chat → settle USDC via x402",
  },
  {
    problem: "Merchant admin marathon to go live",
    solution: "Talk, CSV, or URL → live endpoints",
  },
  {
    problem: "Every buyer agent rebuilds checkout",
    solution: "Drop agentize-registry-shop and purchase",
  },
] as const;

export function LandingProblemSolutionPairs() {
  return (
    <section
      aria-label="Problem and solution"
      className="border-t border-[var(--lp-line)] px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <p className="landing-kicker">02 — Solved</p>
          <h2 className="mt-5 max-w-[18ch] text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.05] text-[var(--lp-ink)]">
            Same problems. Explicit fixes.
          </h2>
        </Reveal>

        <ul className="mt-14 divide-y divide-[var(--lp-line)] border-y border-[var(--lp-line)]">
          {PAIRS.map((pair, i) => (
            <li key={pair.problem}>
              <Reveal delay={0.05 * i}>
                <div className="grid gap-4 py-8 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-8 md:py-10">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--lp-faint)]">
                      Problem {String(i + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-2 text-lg font-medium leading-snug text-[var(--lp-ink)] md:text-xl">
                      {pair.problem}
                    </p>
                  </div>
                  <div
                    className="landing-pair-rail hidden h-px w-16 shrink-0 md:block lg:w-24"
                    aria-hidden
                  />
                  <div className="flex items-start gap-3 md:justify-end">
                    <ArrowRightIcon
                      className="mt-1 size-5 shrink-0 text-[var(--lp-signal)] md:hidden"
                      weight="bold"
                      aria-hidden
                    />
                    <div className="md:text-right">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--lp-signal)]">
                        Solution
                      </p>
                      <p className="mt-2 text-lg font-medium leading-snug text-[var(--lp-ink)] md:text-xl">
                        {pair.solution}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
