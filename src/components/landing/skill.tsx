"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { Reveal } from "@/components/landing/reveal";

const SKILL_PATH = ".agents/skills/agentize-registry-shop";
const SKILL_REPO =
  "https://github.com/itzsihui/Agentize/tree/main/.agents/skills/agentize-registry-shop";

const PATH = [
  { cmd: "GET /registry.json", note: "open store index" },
  { cmd: "GET /api/search?q=", note: "same ranker as the buyer UI" },
  { cmd: "GET /s/{slug}/catalog.json", note: "full SKUs, lock the quote" },
  { cmd: "POST /s/{slug}/buy", note: "HTTP 402 → USDC x402 → 200" },
] as const;

export function LandingSkill() {
  const [copied, setCopied] = useState(false);

  async function copyPath() {
    try {
      await navigator.clipboard.writeText(SKILL_PATH);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section
      id="skill"
      aria-label="Buyer agent skill"
      className="border-t border-[var(--lp-line)] px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <p className="landing-kicker">05 — Buyer skill</p>
          <h2 className="mt-5 max-w-[16ch] text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.05] text-[var(--lp-ink)]">
            Any buyer. One skill. The whole registry.
          </h2>
          <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-[var(--lp-muted)]">
            Drop <span className="font-mono text-[13px] text-[var(--lp-ink)]">agentize-registry-shop</span> into Cursor, Claude Code, or any agent runner. No API key. No HTML scrape. Discover and pay over public HTTP.
          </p>
        </Reveal>

        <div className="mt-14 grid items-stretch gap-0 border border-[var(--lp-line-strong)] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <Reveal className="flex flex-col justify-between gap-10 border-b border-[var(--lp-line)] p-8 md:p-10 lg:border-r lg:border-b-0">
            <div>
              <p className="font-[family-name:var(--font-space)] text-xl font-semibold tracking-tight text-[var(--lp-ink)]">
                You convert the shop. They bring their agent.
              </p>
              <p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-[var(--lp-muted)]">
                Merchants publish once. Buyer agents do not rebuild a custom integration. They load the skill and shop every listed store on the network.
              </p>
              <ul className="mt-8 space-y-4">
                <li>
                  <p className="font-[family-name:var(--font-space)] text-sm font-semibold text-[var(--lp-ink)]">
                    Public protocol
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--lp-muted)]">
                    registry.json, llms.txt, /api/search, POST /buy. Payment proof is the gate.
                  </p>
                </li>
                <li>
                  <p className="font-[family-name:var(--font-space)] text-sm font-semibold text-[var(--lp-ink)]">
                    Locked quotes
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--lp-muted)]">
                    Settle tools only see store, SKU, price, and merchant address. Catalog copy cannot rewrite the payee.
                  </p>
                </li>
                <li>
                  <p className="font-[family-name:var(--font-space)] text-sm font-semibold text-[var(--lp-ink)]">
                    Same security as our buyer
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--lp-muted)]">
                    World-listed merchants. Intercepta at the x402 handshake. Confirm spend before sign.
                  </p>
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={copyPath}
                className="inline-flex h-11 items-center gap-2 bg-[var(--lp-signal)] px-4 text-sm font-medium text-[var(--lp-signal-ink)] transition-opacity hover:opacity-90 active:scale-[0.98]"
              >
                {copied ? (
                  <CheckIcon className="size-4" weight="bold" aria-hidden />
                ) : (
                  <CopyIcon className="size-4" weight="bold" aria-hidden />
                )}
                {copied ? "Copied path" : "Copy skill path"}
              </button>
              <a
                href={SKILL_REPO}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center border border-[var(--lp-ink)]/25 px-4 text-sm font-medium text-[var(--lp-ink)] transition-colors hover:border-[var(--lp-ink)]/50 hover:bg-[var(--lp-ink)]/[0.04] active:scale-[0.98]"
              >
                Open SKILL.md
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="bg-[#0f1218] p-4 md:p-6">
            <div className="overflow-hidden border border-white/10">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-[11px] text-[#e8ecf1]">
                    {SKILL_PATH}/SKILL.md
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-white/40">
                    protocol · no API key · MIT
                  </p>
                </div>
                <span className="shrink-0 border border-[var(--lp-signal)]/40 bg-[var(--lp-signal)]/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[#9db4ff]">
                  Drop-in
                </span>
              </div>

              <div className="space-y-5 px-4 py-5 font-mono text-[12px] leading-relaxed text-[#c5ccd6] md:px-5">
                <pre className="whitespace-pre-wrap text-white/55">
                  {`name: agentize-registry-shop
triggers: buy from Agentize · registry.json
rail: USDC x402 on Base`}
                </pre>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#9db4ff]">
                    Discover then buy
                  </p>
                  <ol className="mt-3 space-y-2">
                    {PATH.map((step, i) => (
                      <li
                        key={step.cmd}
                        className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2"
                      >
                        <span className="text-white/35">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>
                          <span className="text-[#e8ecf1]">{step.cmd}</span>
                          <span className="mt-0.5 block text-[11px] text-white/40">
                            {step.note}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">
                    Hard rules
                  </p>
                  <p className="mt-2 text-[11px] text-white/55">
                    Do not scrape HTML. Lock the quote before pay. Confirm spend. Verify 402 payTo and amount match.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <p className="mt-4 font-mono text-[11px] text-[var(--lp-faint)]">
          Drop at {SKILL_PATH}
        </p>
      </div>
    </section>
  );
}
