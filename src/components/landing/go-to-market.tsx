"use client";

import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const BEATS = [
  {
    n: "01",
    title: "Supply",
    body: "Onboard fashion and specialty merchants via chat + CSV — fastest path to live SKUs on the registry.",
  },
  {
    n: "02",
    title: "Demand",
    body: "Ship the public registry-shop skill so Cursor, Claude, and local agents can discover and buy without a partnership.",
  },
  {
    n: "03",
    title: "Proof",
    body: "Protocol demo (402 → 200) plus open docs — /llms.txt and the skill — for hackathons and agent builders.",
  },
  {
    n: "04",
    title: "Loop",
    body: "More merchants → denser /api/search → more agent buys → more merchants. Network, not a walled app deal.",
  },
] as const;

export function LandingGoToMarket() {
  return (
    <section
      aria-label="Go to market"
      className="border-t border-[var(--lp-line)] px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <p className="landing-kicker">07 — Go to market</p>
          <h2 className="mt-5 max-w-[16ch] text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.05] text-[var(--lp-ink)]">
            How we actually go live.
          </h2>
          <p className="mt-4 max-w-[44ch] text-base leading-relaxed text-[var(--lp-muted)]">
            Merchant supply first. Agent demand via skill. Proof in the
            protocol. Then the loop.
          </p>
        </Reveal>

        <div className="mt-14 grid border border-[var(--lp-line-strong)] sm:grid-cols-2 lg:grid-cols-4">
          {BEATS.map((beat, i) => (
            <Reveal
              key={beat.n}
              delay={0.06 * i}
              className={cn(
                "border-[var(--lp-line)] p-7",
                i > 0 && "border-t sm:border-t-0",
                i % 2 === 1 && "sm:border-l",
                i >= 2 && "sm:border-t",
                i > 0 && "lg:border-l",
                i >= 2 && "lg:border-t-0",
              )}
            >
              <p className="font-mono text-[11px] text-[var(--lp-signal)]">
                {beat.n}
              </p>
              <h3 className="mt-4 font-[family-name:var(--font-space)] text-xl font-semibold tracking-tight text-[var(--lp-ink)]">
                {beat.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--lp-muted)]">
                {beat.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
