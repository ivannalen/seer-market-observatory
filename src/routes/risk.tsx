import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ObservatoryNav } from "@/components/observatory/nav";
import { AtlasCrossLink, Eyebrow, PageHeader, SampleTag, SiteFooter } from "@/components/observatory/chrome";
import { RiskTrack, Signature } from "@/components/observatory/charts";
import { RISK_NOTE, RISK_PROTOCOLS } from "@/data/seer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/risk")({
  head: () => ({
    meta: [
      { title: "Risk Pricing — Comparative Spectrum — Seer Observatory" },
      {
        name: "description",
        content:
          "Protocols on one comparative risk spectrum, with uncertainty ranges, risk history, and verified facts kept apart from market estimates. Estimates are not guarantees.",
      },
      { property: "og:title", content: "Risk Pricing — Seer Observatory" },
      {
        property: "og:description",
        content: "One comparative spectrum, uncertainty drawn, facts separated from estimates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RiskPage,
});

function RiskPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sorted = [...RISK_PROTOCOLS].sort((a, b) => a.estimate - b.estimate);

  return (
    <div className="min-h-screen bg-paper">
      <ObservatoryNav />

      <PageHeader
        code="05"
        name="Risk"
        title="Every protocol, placed on one honest spectrum"
        accent="uncertainty is part of the reading."
        intro="Risk instruments put unlike protocols on a common scale — an exchange next to a bridge next to a lending pool — and draw how wide the market's uncertainty really is."
        meta={<SampleTag />}
      />

      {/* Standing note */}
      <div className="border-b border-rule bg-violet-deep text-paper">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 sm:px-8">
          <Eyebrow className="text-paper/70">Standing note</Eyebrow>
          <p className="text-sm text-paper">{RISK_NOTE}</p>
        </div>
      </div>

      {/* Spectrum */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-3">
          <Eyebrow className="text-ink">Fig. 1 — Comparative risk spectrum, sample estimates</Eyebrow>
          <Eyebrow className="text-ink-faint">0 — calmer · 100 — more risk</Eyebrow>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-ink-soft">
          The violet band is the market's uncertainty range; the dot is its point estimate. All
          protocol names are illustrative. Hover or focus a row to isolate it.
        </p>

        <div className="mt-8 space-y-1">
          {sorted.map((p) => (
            <div
              key={p.id}
              onMouseEnter={() => setActiveId(p.id)}
              onMouseLeave={() => setActiveId(null)}
              className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 border-b border-rule py-2 sm:grid-cols-[10rem_11rem_1fr] sm:border-b-0 sm:border-b sm:border-rule"
            >
              <div className="min-w-0">
                <p className="truncate text-[15px] text-ink">{p.name}</p>
                <Eyebrow className="text-ink-faint">{p.category}</Eyebrow>
              </div>
              <span className="figures hidden text-ink sm:block">
                {p.estimate}
                <span className="ml-2 text-ink-faint">
                  [{p.range[0]}–{p.range[1]}]
                </span>
              </span>
              <RiskTrack
                estimate={p.estimate}
                range={p.range}
                active={activeId === p.id}
                dimmed={activeId !== null && activeId !== p.id}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-6 border-t border-rule pt-4">
          <span className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-10 rounded-full bg-violet/40" />
            <Eyebrow className="text-ink-faint">Uncertainty band (market estimate)</Eyebrow>
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-ink bg-paper" />
            <Eyebrow className="text-ink-faint">Point estimate</Eyebrow>
          </span>
          <span className="ml-auto max-w-md text-xs leading-relaxed text-ink-faint">
            A narrow band is not a narrow truth — it is a confident market. Confidence and
            correctness are different quantities.
          </span>
        </div>
      </section>

      {/* Comparison table */}
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
          <div className="border-b border-paper/25 pb-4">
            <Eyebrow className="text-lavender">Fig. 2 — Protocol comparison</Eyebrow>
            <h2 className="display mt-2 text-4xl text-paper">Facts on the left. Estimates on the right.</h2>
            <p className="mt-2 max-w-2xl text-sm text-paper/60">
              The two columns are different kinds of knowledge. Facts are verifiable properties on
              file; estimates are the market's probabilistic reading. They never substitute for
              each other.
            </p>
          </div>

          {/* column legend */}
          <div className="mt-6 hidden grid-cols-[10rem_9rem_1fr_1fr] gap-x-8 border-b border-paper/25 pb-2 md:grid">
            <Eyebrow className="text-paper/50">Protocol</Eyebrow>
            <Eyebrow className="text-paper/50">History (sample)</Eyebrow>
            <Eyebrow className="text-fact">Verified facts</Eyebrow>
            <Eyebrow className="text-lavender">Market estimates</Eyebrow>
          </div>

          <ul>
            {sorted.map((p) => (
              <li
                key={p.id}
                className={cn(
                  "grid gap-x-8 gap-y-2 border-b border-paper/15 py-5 transition-opacity md:grid-cols-[10rem_9rem_1fr_1fr]",
                  activeId !== null && activeId !== p.id && "md:opacity-50",
                )}
              >
                <div>
                  <p className="text-[15px] text-paper">{p.name}</p>
                  <Eyebrow className="text-paper/50">{p.category}</Eyebrow>
                  <p className="figures mt-1 text-lavender">
                    {p.estimate} <span className="text-paper/50">[{p.range[0]}–{p.range[1]}]</span>
                  </p>
                </div>
                <Signature data={p.history} width={110} height={30} className="hidden text-lavender md:block" />
                <ul className="space-y-1">
                  {p.facts.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm text-paper/80">
                      <span className="eyebrow mt-0.5 shrink-0 border border-fact/60 px-1 text-fact">Fact</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-1">
                  {p.estimates.map((e, i) => (
                    <li key={i} className="flex gap-2 text-sm text-paper/80">
                      <span className="eyebrow mt-0.5 shrink-0 border border-lavender/60 px-1 text-lavender">Est.</span>
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing disclaimer */}
      <section className="border-b border-rule bg-lavender-soft/60">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
          <p className="display max-w-4xl text-2xl leading-snug text-ink sm:text-3xl">
            A risk estimate is a <em className="text-violet-deep">probabilistic reading</em>, priced
            by a market at a moment in time. It is not an audit, not a rating, and never a
            guarantee of safety.
          </p>
        </div>
      </section>

      <AtlasCrossLink
        family="risk"
        label="Every risk estimate, in the universal explorer"
        note="Protocol-level instruments like these sit in the atlas beside every other market type. Open the Seer App to search the full risk spectrum and beyond."
      />

      <SiteFooter />
    </div>
  );
}
