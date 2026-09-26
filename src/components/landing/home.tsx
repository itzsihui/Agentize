"use client";

import Link from "next/link";
import { LandingCompetitorTable } from "@/components/landing/competitor-table";
import { LandingGoToMarket } from "@/components/landing/go-to-market";
import { LandingHowTech } from "@/components/landing/how-tech";
import { LandingLenis } from "@/components/landing/lenis-root";
import { MetalHumanStage } from "@/components/landing/metal-human-stage";
import { LandingProblemImpact } from "@/components/landing/problem-impact";
import { LandingProblemSolutionPairs } from "@/components/landing/problem-solution-pairs";
import { LandingSponsorFlow } from "@/components/landing/sponsor-flow";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const btnPrimary =
  "inline-flex h-11 items-center bg-[var(--lp-signal)] px-5 text-sm font-medium text-[var(--lp-signal-ink)] transition-opacity hover:opacity-90 active:scale-[0.98]";
const btnGhost =
  "inline-flex h-11 items-center border border-[var(--lp-ink)]/25 bg-transparent px-5 text-sm font-medium text-[var(--lp-ink)] transition-colors hover:border-[var(--lp-ink)]/50 hover:bg-[var(--lp-ink)]/[0.04] active:scale-[0.98]";
const btnHeroPrimary =
  "inline-flex h-11 items-center bg-[var(--landing-jade)] px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98]";
const btnHeroGhost =
  "inline-flex h-11 items-center border border-[var(--landing-fog)]/30 bg-black/30 px-5 text-sm font-medium text-[var(--landing-fog)] backdrop-blur-sm transition-colors hover:border-[var(--landing-fog)]/50 hover:bg-black/45 active:scale-[0.98]";

export function LandingHome() {
  return (
    <LandingLenis>
      <div className="landing min-h-[100dvh]">
        <section className="landing-stage relative flex min-h-[100dvh] flex-col">
          <MetalHumanStage />
          <div
            className="landing-grain pointer-events-none absolute inset-0 z-[1]"
            aria-hidden
          />
          <div
            className="landing-vignette pointer-events-none absolute inset-0 z-[1]"
            aria-hidden
          />

          <header className="relative z-20 flex h-16 items-center justify-between px-6 md:px-10">
            <Link
              href="/"
              className="landing-brand text-lg text-[var(--landing-fog)]"
            >
              Agentize
            </Link>
            <nav className="flex items-center gap-5 text-sm text-[var(--landing-fog)]/70">
              <Link
                href="/merchant/login"
                className="hover:text-[var(--landing-fog)]"
              >
                Sell
              </Link>
              <Link
                href="/buyer/login"
                className="hover:text-[var(--landing-fog)]"
              >
                Shop
              </Link>
            </nav>
          </header>

          <main className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-6 pb-16 pt-6 md:px-10">
            <div className="max-w-xl">
              <h1
                className={cn(
                  "landing-rise font-[family-name:var(--font-space)] text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.08] tracking-tight text-[var(--landing-fog)] pb-1",
                )}
              >
                Go agent-ready. Publish once. Any agent can shop you.
              </h1>
              <p
                className={cn(
                  "landing-rise landing-rise-delay-1 mt-4 max-w-[40ch] text-base leading-relaxed text-[var(--landing-fog)]/70",
                )}
              >
                Open registry and search — not locked inside ChatGPT or Claude.
                Settle USDC in chat via x402.
              </p>
              <div
                className={cn(
                  "landing-rise landing-rise-delay-2 mt-8 flex flex-wrap gap-3",
                )}
              >
                <Link href="/merchant/login" className={btnHeroPrimary}>
                  Sell
                </Link>
                <Link href="/buyer/login" className={btnHeroGhost}>
                  Shop
                </Link>
              </div>
            </div>
          </main>
        </section>

        <div className="landing-body">
          <section
            aria-label="Log in"
            className="border-t border-[var(--lp-line)] px-6 py-16 md:px-10 md:py-20"
          >
            <div className="mx-auto grid max-w-[1200px] gap-0 border border-[var(--lp-line-strong)] sm:grid-cols-2">
              <Link
                href="/merchant/login"
                className="group block border-b border-[var(--lp-line)] p-8 transition-colors hover:bg-[var(--lp-signal)] hover:text-[var(--lp-signal-ink)] sm:border-r sm:border-b-0 md:p-10"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] opacity-60 group-hover:opacity-90">
                  Sellers
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-space)] text-2xl font-semibold tracking-tight">
                  Log in as seller
                </h2>
                <p className="mt-2 max-w-[34ch] text-sm leading-relaxed opacity-70 group-hover:opacity-90">
                  Bind a wallet, publish to the open registry — shoppable by
                  every agent.
                </p>
                <span className="mt-6 inline-flex text-sm font-medium underline-offset-4 group-hover:underline">
                  Continue to Sell
                </span>
              </Link>
              <Link
                href="/buyer/login"
                className="group block p-8 transition-colors hover:bg-[var(--lp-ink)] hover:text-[var(--lp-paper)] md:p-10"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] opacity-60 group-hover:opacity-90">
                  Buyers
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-space)] text-2xl font-semibold tracking-tight">
                  Log in as buyer
                </h2>
                <p className="mt-2 max-w-[34ch] text-sm leading-relaxed opacity-70 group-hover:opacity-90">
                  Rank via /api/search — same endpoint agents use — then settle
                  after you authorize.
                </p>
                <span className="mt-6 inline-flex text-sm font-medium underline-offset-4 group-hover:underline">
                  Continue to Shop
                </span>
              </Link>
            </div>
          </section>

          <LandingProblemImpact />
          <LandingProblemSolutionPairs />
          <LandingCompetitorTable />
          <LandingHowTech />
          <LandingSponsorFlow />
          <LandingGoToMarket />

          <section className="border-t border-[var(--lp-line)] px-6 py-28 md:px-10 md:py-36">
            <Reveal className="mx-auto max-w-[1200px]">
              <p className="landing-brand text-[clamp(3rem,10vw,6.5rem)] text-[var(--lp-ink)]">
                Agentize
              </p>
              <p className="mt-6 max-w-[36ch] text-base text-[var(--lp-muted)] md:text-lg">
                Publish once for every agent. Sell first — shoppers follow.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/merchant/login"
                  className={cn(btnPrimary, "h-12 px-6")}
                >
                  Sell
                </Link>
                <Link href="/buyer/login" className={cn(btnGhost, "h-12 px-6")}>
                  Shop
                </Link>
              </div>
            </Reveal>
          </section>

          <footer className="border-t border-[var(--lp-line)] px-6 py-8 md:px-10">
            <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 text-sm text-[var(--lp-muted)]">
              <span className="landing-brand text-base text-[var(--lp-ink)]">
                Agentize
              </span>
              <div className="flex flex-wrap items-center gap-6">
                <Link
                  href="/merchant/login"
                  className="hover:text-[var(--lp-ink)]"
                >
                  Sell
                </Link>
                <Link href="/buyer/login" className="hover:text-[var(--lp-ink)]">
                  Shop
                </Link>
                <a
                  href="https://getlayers.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[11px] tracking-wide hover:text-[var(--lp-ink)]"
                >
                  Visual: GetLayers metalHuman
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </LandingLenis>
  );
}
