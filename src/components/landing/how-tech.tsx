"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/landing/reveal";
import { Terminal } from "@/components/ui/terminal";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    label: "Publish",
    mono: "World ID · registry · llms.txt",
    body: "Merchant verifies with World, then talks inventory live onto the open index.",
  },
  {
    label: "Search",
    mono: "skill · GET /api/search",
    body: "Buyer agents drop the skill, then rank via the same path humans use.",
  },
  {
    label: "Authorize",
    mono: "preview · locked quote",
    body: "Item, payee, amount visible. Agent does not move money yet.",
  },
  {
    label: "Settle",
    mono: "Intercepta · USDC · x402",
    body: "Screen payTo + payer, then HTTP 402 → signature → 200 on Base.",
  },
] as const;

const STACK = [
  "World ID",
  "Intercepta",
  "Base · USDC",
  "x402",
  "registry.json",
  "/api/search",
  "llms.txt",
  "Agent skill",
] as const;

export function LandingHowTech() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((n) => (n + 1) % STEPS.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      aria-label="How it works and tech stack"
      className="border-t border-[var(--lp-line)] px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <p className="landing-kicker">04 — Protocol</p>
          <h2 className="mt-5 max-w-[14ch] text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.05] text-[var(--lp-ink)]">
            How it works. What it runs on.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          <ol className="relative space-y-0">
            <div
              className="absolute top-3 bottom-3 left-[11px] w-px bg-[var(--lp-line-strong)]"
              aria-hidden
            />
            {STEPS.map((step, i) => {
              const on = i === active;
              return (
                <li key={step.label} className="relative pl-10 pb-10 last:pb-0">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    className={cn(
                      "absolute left-0 top-1 flex size-6 items-center justify-center rounded-full border-2 bg-[var(--lp-paper)] font-mono text-[10px] transition-colors",
                      on
                        ? "landing-step-dot-active border-[var(--lp-signal)] text-[var(--lp-signal)]"
                        : "border-[var(--lp-line-strong)] text-[var(--lp-faint)]",
                    )}
                    aria-current={on ? "step" : undefined}
                    aria-label={`Step ${i + 1}: ${step.label}`}
                  >
                    {i + 1}
                  </button>
                  <p
                    className={cn(
                      "font-[family-name:var(--font-space)] text-xl font-semibold tracking-tight transition-colors",
                      on ? "text-[var(--lp-ink)]" : "text-[var(--lp-faint)]",
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="mt-1 font-mono text-xs text-[var(--lp-signal)]">
                    {step.mono}
                  </p>
                  <p
                    className={cn(
                      "mt-2 max-w-[40ch] text-sm leading-relaxed transition-opacity",
                      on ? "text-[var(--lp-muted)] opacity-100" : "opacity-40",
                    )}
                  >
                    {step.body}
                  </p>
                </li>
              );
            })}
          </ol>

          <Reveal delay={0.1}>
            <div className="overflow-hidden border border-[var(--lp-line-strong)] bg-[#0f1218]">
              <div className="border-b border-white/10 px-4 py-3">
                <p className="font-[family-name:var(--font-space)] text-sm font-medium text-[#e8ecf1]">
                  Any agent can call
                </p>
                <p className="mt-0.5 text-xs text-white/45">
                  No ChatGPT or Claude gate
                </p>
              </div>
              <div className="p-3 [&_.no-visible-scrollbar]:!h-56">
                <Terminal
                  username="agent"
                  enableSound={false}
                  typingSpeed={26}
                  delayBetweenCommands={700}
                  initialDelay={400}
                  className="max-w-none px-0"
                  commands={[
                    "drop agentize-registry-shop",
                    "curl /registry.json",
                    "curl '/api/search?q=linen+shirt'",
                    "curl -X POST /s/canopy-wear/buy",
                  ]}
                  outputs={{
                    0: ["# skill loaded · no API key · public HTTP"],
                    1: ["# stores[] · agent-readable index"],
                    2: [
                      '{ "mode": "semantic", "products": [/* ranked */] }',
                    ],
                    3: ["HTTP 402 · PAYMENT-REQUIRED · then settle"],
                  }}
                />
              </div>
            </div>

            <div className="mt-6">
              <p className="landing-kicker">Stack</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {STACK.map((item, i) => (
                  <li
                    key={item}
                    className="border border-[var(--lp-line-strong)] bg-white/40 px-3 py-1.5 font-mono text-[11px] text-[var(--lp-ink)]"
                    style={{
                      animationDelay: `${i * 60}ms`,
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
