"use client";

import { Reveal } from "@/components/landing/reveal";

export function LandingProblemImpact() {
  return (
    <section
      aria-label="The problem"
      className="border-t border-[var(--lp-line)] px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <p className="landing-kicker">01 — Problem</p>
          <h2 className="mt-5 max-w-[16ch] text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.05] text-[var(--lp-ink)]">
            Agent commerce is real. Open catalogs are not.
          </h2>
          <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-[var(--lp-muted)]">
            Merchants list where two chat apps can reach them. Every other agent
            — procurement, local, personal, custom — hits a wall.
          </p>
        </Reveal>

        <Reveal
          className="mt-16 grid gap-0 border border-[var(--lp-line-strong)] md:grid-cols-[1.1fr_0.9fr]"
          delay={0.06}
        >
          <div className="border-b border-[var(--lp-line)] p-8 md:border-b-0 md:border-r md:p-10">
            <p className="landing-kicker">Impact</p>
            <p className="mt-6 font-[family-name:var(--font-space)] text-[clamp(3.5rem,10vw,6rem)] font-semibold leading-none tracking-tight text-[var(--lp-signal)]">
              1<span className="text-[var(--lp-faint)]">→</span>0.1
            </p>
            <p className="mt-6 max-w-[32ch] text-lg font-medium leading-snug text-[var(--lp-ink)] md:text-xl">
              For every shopping agent, roughly a tenth of an open catalog.
            </p>
          </div>
          <div className="flex flex-col justify-between gap-8 p-8 md:p-10">
            <div>
              <p className="font-[family-name:var(--font-space)] text-4xl font-semibold tracking-tight text-[var(--lp-ink)]">
                2
              </p>
              <p className="mt-2 text-sm text-[var(--lp-muted)]">
                Chat apps get the closed path. Everyone else is locked out.
              </p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-space)] text-4xl font-semibold tracking-tight text-[var(--lp-ink)]">
                ∞
              </p>
              <p className="mt-2 text-sm text-[var(--lp-muted)]">
                Procurement bots, local LLMs, Cursor runners — demand without
                HTTP-shoppable supply.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
