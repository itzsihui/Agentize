"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  IdentificationCardIcon,
} from "@phosphor-icons/react";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const FLOW = [
  {
    id: "merchant",
    label: "Merchant",
    sub: "Talk / CSV / URL",
    kind: "node" as const,
  },
  {
    id: "world",
    label: "World ID",
    sub: "One human → one storefront",
    kind: "sponsor" as const,
    sponsor: "world" as const,
  },
  {
    id: "publish",
    label: "Publish",
    sub: "registry · llms.txt",
    kind: "node" as const,
  },
  {
    id: "buy",
    label: "Buyer agent",
    sub: "Search · authorize",
    kind: "node" as const,
  },
  {
    id: "intercepta",
    label: "Intercepta",
    sub: "Screen payTo + payer",
    kind: "sponsor" as const,
    sponsor: "intercepta" as const,
  },
  {
    id: "settle",
    label: "x402 settle",
    sub: "USDC on Base",
    kind: "node" as const,
    sponsor: "base" as const,
  },
] as const;

const WHY = [
  {
    sponsor: "world" as const,
    href: "https://world.org",
    icon: IdentificationCardIcon,
    title: "World — merchant onboarding",
    why: "Proof of personhood before a storefront lists. One World ID nullifier maps to one merchant account — bots and farmed shops cannot flood the open registry.",
    where: "Onboarding / listing gate",
  },
  {
    sponsor: "intercepta" as const,
    href: "https://intercepta.io",
    icon: ShieldCheckIcon,
    title: "Intercepta — x402 trust layer",
    why: "Live AML / risk screen inside the payment path. Buyers are protected from dirty payTo wallets; merchants are protected from toxic payers — allow, hold, or refuse before settle.",
    where: "Inside POST /buy · 402 handshake",
  },
] as const;

const LOGO: Record<"world" | "intercepta" | "base", { src: string; w: number; h: number }> = {
  world: { src: "/sponsors/world.svg", w: 100, h: 28 },
  intercepta: { src: "/sponsors/intercepta.svg", w: 120, h: 28 },
  base: { src: "/sponsors/base.svg", w: 72, h: 28 },
};

function SponsorLogo({
  id,
  className,
}: {
  id: "world" | "intercepta" | "base";
  className?: string;
}) {
  const logo = LOGO[id];
  return (
    <Image
      src={logo.src}
      alt=""
      width={logo.w}
      height={logo.h}
      className={cn("h-7 w-auto", className)}
      unoptimized
    />
  );
}

export function LandingSponsorFlow() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-label="Sponsors in the protocol"
      className="border-t border-[var(--lp-line)] px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <p className="landing-kicker">05 — Sponsors in the flow</p>
          <h2 className="mt-5 max-w-[18ch] text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.05] text-[var(--lp-ink)]">
            Where the stack protects the market.
          </h2>
          <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-[var(--lp-muted)]">
            World gates who can sell. Intercepta gates who can settle. Base
            carries the USDC rail. Not logo wallpaper — wired into the path.
          </p>
        </Reveal>

        {/* Flow diagram */}
        <Reveal className="mt-14" delay={0.06}>
          <div className="overflow-x-auto border border-[var(--lp-line-strong)] bg-white/35 p-5 md:p-8">
            <p className="landing-kicker mb-6">Protocol path</p>
            <ol className="flex min-w-[720px] items-stretch gap-0">
              {FLOW.map((step, i) => {
                const isSponsor = step.kind === "sponsor";
                return (
                  <li key={step.id} className="flex flex-1 items-center">
                    <motion.div
                      className={cn(
                        "relative flex h-full min-h-[7.5rem] w-full flex-col justify-between border p-3",
                        isSponsor
                          ? "border-[var(--lp-signal)] bg-[color-mix(in_oklab,var(--lp-signal)_8%,white)]"
                          : "border-[var(--lp-line-strong)] bg-[var(--lp-paper)]",
                      )}
                      initial={reduce ? false : { opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.05 * i,
                        duration: 0.45,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      {"sponsor" in step && step.sponsor ? (
                        <SponsorLogo
                          id={step.sponsor}
                          className="text-[var(--lp-ink)]"
                        />
                      ) : (
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--lp-faint)]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      )}
                      <div>
                        <p className="font-[family-name:var(--font-space)] text-sm font-semibold tracking-tight text-[var(--lp-ink)]">
                          {step.label}
                        </p>
                        <p className="mt-1 text-[11px] leading-snug text-[var(--lp-muted)]">
                          {step.sub}
                        </p>
                      </div>
                      {isSponsor ? (
                        <span className="absolute -top-2 right-2 bg-[var(--lp-signal)] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-white">
                          Sponsor
                        </span>
                      ) : null}
                    </motion.div>
                    {i < FLOW.length - 1 ? (
                      <ArrowRightIcon
                        className="mx-1 size-4 shrink-0 text-[var(--lp-signal)]"
                        weight="bold"
                        aria-hidden
                      />
                    ) : null}
                  </li>
                );
              })}
            </ol>

            {/* Dual protection callout under Intercepta */}
            <div className="mt-6 grid gap-3 border-t border-[var(--lp-line)] pt-6 md:grid-cols-2">
              <div className="border border-[var(--lp-line)] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--lp-signal)]">
                  Intercepta · buyer side
                </p>
                <p className="mt-2 text-sm text-[var(--lp-ink)]">
                  Screens merchant <span className="font-mono text-xs">payTo</span>{" "}
                  before the agent signs — refuse dirty receive wallets.
                </p>
              </div>
              <div className="border border-[var(--lp-line)] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--lp-signal)]">
                  Intercepta · seller side
                </p>
                <p className="mt-2 text-sm text-[var(--lp-ink)]">
                  Screens payer address on settle — refuse / hold toxic buyers
                  before USDC moves.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Why cards + logos */}
        <div className="mt-10 grid gap-0 border border-[var(--lp-line-strong)] md:grid-cols-2">
          {WHY.map((item, i) => (
            <Reveal
              key={item.sponsor}
              delay={0.08 * i}
              className={cn(
                "border-[var(--lp-line)] p-8 md:p-10",
                i === 0 && "border-b md:border-b-0 md:border-r",
              )}
            >
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex text-[var(--lp-ink)] transition-opacity hover:opacity-70"
              >
                <SponsorLogo id={item.sponsor} />
                <span className="sr-only">{item.title}</span>
              </a>
              <div className="mt-6 flex items-start gap-3">
                <item.icon
                  className="mt-0.5 size-5 shrink-0 text-[var(--lp-signal)]"
                  weight="regular"
                  aria-hidden
                />
                <div>
                  <h3 className="font-[family-name:var(--font-space)] text-lg font-semibold tracking-tight text-[var(--lp-ink)]">
                    {item.title}
                  </h3>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--lp-faint)]">
                    {item.where}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--lp-muted)]">
                    {item.why}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
