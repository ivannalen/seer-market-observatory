import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ObservatoryNav } from "@/components/observatory/nav";
import { Eyebrow, PageHeader, SampleTag, SiteFooter } from "@/components/observatory/charts_placeholder";
import { CounterfactualScale } from "@/components/observatory/charts";
import { FUTARCHY_NOTE, FUTARCHY_PROPOSALS } from "@/data/seer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/futarchy")({
  head: () => ({
    meta: [
      { title: "Futarchy — Counterfactual Comparison — Seer Observatory" },
      {
        name: "description",
        content:
          "Both worlds on one shared scale: what the success metric does if the proposal passes, and if it fails. Markets inform the DAO; they do not make its decision.",
      },
      { property: "og:title", content: "Futarchy — Counterfactual Comparison — Seer Observatory" },
      {
        property: "og:description",
        content: "The same metric, priced in two possible worlds, on one shared scale.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FutarchyPage,
});

function FutarchyPage() {
  const [activeId, setActiveId] = useState(FUTARCHY_PROPOSALS[0].id);
  const p = FUTARCHY_PROPOSALS.find((x) => x.id === activeId) ?? FUTARCHY_PROPOSALS[0];
  const max = Math.max(p.pass, p.fail) * 1.15;
  const histMax = Math.max(...p.history.flatMap((h) => [h.pass, h.fail])) * 1.15;
  const delta = p.pass - p.fail;

  return (
    <div className="min-h-screen bg-paper">
      <ObservatoryNav />

      <PageHeader
        code="03"
        name="Futarchy"
        title="Two possible worlds, priced on one scale"
        accent="the difference is the reading."
        intro="A futarchy instrument does not ask whether a proposal is good. It prices the same success metric in the world where the proposal passes and the world where it fails — then shows the gap."
        meta={<SampleTag />}
      />

      {/* Authority note */}
      <div className="border-b border-rule bg-violet-deep text-paper">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 sm:px-8">
          <Eyebrow className="text-paper/70">Standing note</Eyebrow>
          <p className="text-sm text-paper">{FUTARCHY_NOTE}</p>
        </div>
      </div>

      {/* Proposal selector */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex flex-wrap gap-x-8" role="tablist" aria-label="Proposals">
            {FUTARCHY_PROPOSALS.map((x) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={x.id === activeId}
                onClick={() => setActiveId(x.id)}
                className={cn(
                  "border-b-2 py-4 text-left transition-colors",
                  x.id === activeId
                    ? "border-violet-deep text-ink"
                    : "border-transparent text-ink-faint hover:text-ink",
                )}
              >
                <span className="eyebrow block text-ink-faint">Case {x.id.toUpperCase()}</span>
                <span className="mt-1 block font-display text-xl">{x.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Counterfactual scale */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-8">
        <div className="border-b border-ink pb-3">
          <Eyebrow className="text-ink">Fig. 1 — Shared-scale comparison, sample estimates</Eyebrow>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="border border-rule p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Eyebrow className="text-ink-faint">Success metric — {p.metric}</Eyebrow>
                <Eyebrow className="text-violet-deep">Confidence pass &gt; fail · {(p.price * 100).toFixed(0)}%</Eyebrow>
              </div>
              <CounterfactualScale pass={p.pass} fail={p.fail} unit={p.unit} max={max} />
            </div>

            <p className="display mt-8 max-w-3xl text-3xl leading-snug text-ink">
              If the proposal passes, {p.metric.toLowerCase()} reads{" "}
              <span className="text-violet-deep">{p.pass.toLocaleString()}</span>. If it fails, it
              reads {p.fail.toLocaleString()} — a difference of{" "}
              <span className="text-violet-deep">
                {delta > 0 ? "+" : ""}
                {delta.toLocaleString()} {p.unit}
              </span>{" "}
              in the sample estimate.
            </p>
          </div>

          <aside className="space-y-10">
            <div>
              <div className="border-b border-ink pb-3">
                <Eyebrow className="text-ink">Assumptions behind both readings</Eyebrow>
              </div>
              <ol className="mt-4 space-y-3">
                {p.assumptions.map((a, i) => (
                  <li key={i} className="flex gap-3 border-b border-rule pb-3">
                    <span className="figures shrink-0 text-violet-deep">A{i + 1}</span>
                    <span className="text-sm leading-relaxed text-ink-soft">{a}</span>
                  </li>
                ))}
              </ol>
            </div>
            <p className="text-xs leading-relaxed text-ink-faint">
              Every figure on this page is a sample estimate from the prototype dataset, not a
              measurement of any real protocol.
            </p>
          </aside>
        </div>
      </section>

      {/* Historical estimates */}
      <section className="bg-lavender-soft/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
          <div className="border-b border-ink pb-4">
            <Eyebrow className="text-ink-faint">Fig. 2 — Historical conditional estimates, sample</Eyebrow>
            <h2 className="display mt-2 text-4xl text-ink">How the gap moved</h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-soft">
              Each quarter re-prices both worlds. Watch whether the gap widens (conviction grows)
              or narrows (the market loses faith in the proposal's effect).
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {p.history.map((h) => (
              <div key={h.label} className="grid items-center gap-x-6 gap-y-2 sm:grid-cols-[7rem_1fr_5rem]">
                <Eyebrow className="text-ink-faint">{h.label}</Eyebrow>
                <div className="relative h-9">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-rule" />
                  {/* fail marker */}
                  <div
                    className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-paper"
                    style={{ left: `${(h.fail / histMax) * 100}%` }}
                    aria-hidden="true"
                  />
                  {/* pass marker */}
                  <div
                    className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-deep"
                    style={{ left: `${(h.pass / histMax) * 100}%` }}
                    aria-hidden="true"
                  />
                  {/* bracket */}
                  <div
                    className="absolute top-1/2 h-1 -translate-y-1/2 bg-violet/30"
                    style={{
                      left: `${(h.fail / histMax) * 100}%`,
                      width: `${((h.pass - h.fail) / histMax) * 100}%`,
                    }}
                    aria-hidden="true"
                  />
                </div>
                <span className="figures text-ink sm:text-right">
                  Δ {h.pass - h.fail > 0 ? "+" : ""}
                  {h.pass - h.fail}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-6 border-t border-rule pt-4">
            <span className="flex items-center gap-2">
              <span className="inline-block h-3.5 w-3.5 rounded-full bg-violet-deep" />
              <Eyebrow className="text-ink-faint">Passes-world estimate</Eyebrow>
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-ink bg-paper" />
              <Eyebrow className="text-ink-faint">Fails-world estimate</Eyebrow>
            </span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
