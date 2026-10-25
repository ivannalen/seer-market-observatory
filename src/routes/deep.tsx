import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ObservatoryNav } from "@/components/observatory/nav";
import { Eyebrow, PageHeader, SampleTag, SiteFooter } from "@/components/observatory/chrome";
import { DistributionField, ForecastTriple } from "@/components/observatory/charts";
import { DEEP_CANDIDATES, DEEP_MARKET } from "@/data/seer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/deep")({
  head: () => ({
    meta: [
      { title: "Deep — Possibility Field — Seer Observatory" },
      {
        name: "description",
        content:
          "A many-outcome possibility field: the complete outcome distribution, ranked candidates, forecast comparison, and uncertainty drawn rather than hidden.",
      },
      { property: "og:title", content: "Deep — Possibility Field — Seer Observatory" },
      {
        property: "og:description",
        content: "The whole distribution is the answer. Uncertainty drawn, not hidden.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DeepPage,
});

function DeepPage() {
  const [selectedId, setSelectedId] = useState<string | null>(DEEP_CANDIDATES[0].id);
  const selected = DEEP_CANDIDATES.find((c) => c.id === selectedId) ?? null;
  const ranked = [...DEEP_CANDIDATES].sort((a, b) => b.share - a.share);

  return (
    <div className="min-h-screen bg-paper">
      <ObservatoryNav />

      <PageHeader
        code="02"
        name="Deep"
        title="When the answer is a whole field of outcomes"
        accent="the distribution is the object."
        intro="Deep is for questions with many possible answers. Instead of collapsing the field into one favourite, it prices every outcome at once — and draws the uncertainty around each reading."
        meta={<SampleTag />}
      />

      {/* Market statement */}
      <section className="border-b border-rule bg-lavender-soft/60">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <div>
              <Eyebrow className="text-ink-faint">Illustrative field</Eyebrow>
              <p className="mt-1 font-display text-2xl text-ink">{DEEP_MARKET.question}</p>
            </div>
            <Eyebrow className="text-ink-faint">{DEEP_CANDIDATES.length} outcomes · 1 selection · sample data</Eyebrow>
          </div>
        </div>
      </section>

      {/* Field + detail */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-8">
        <div className="border-b border-ink pb-3">
          <Eyebrow className="text-ink">Fig. 1 — Outcome distribution with 90% bands</Eyebrow>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-ink-soft">
          Each stem is one candidate's market share. The thin whisker through every stem is the
          90% uncertainty band — the field is telling you how sure it is <em>and</em> how sure it
          can afford to be. Select any stem to read it.
        </p>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <DistributionField candidates={DEEP_CANDIDATES} selectedId={selectedId} onSelect={setSelectedId} />
            <p className="mt-2 border-t border-rule pt-2 text-center">
              <Eyebrow className="text-ink-faint">Candidate ids match the ranked list below</Eyebrow>
            </p>
          </div>

          <aside className="border border-ink p-6">
            {selected ? (
              <>
                <div className="flex items-baseline justify-between gap-4">
                  <Eyebrow className="text-violet-deep">{selected.id.toUpperCase()}</Eyebrow>
                  <Eyebrow className="text-ink-faint">selected reading</Eyebrow>
                </div>
                <h3 className="display mt-3 text-2xl text-ink">{selected.name}</h3>
                <p className="mt-2 text-sm text-ink-soft">{selected.blurb}</p>

                <dl className="mt-6 grid grid-cols-3 gap-4 border-y border-rule py-4">
                  <div>
                    <dt className="eyebrow text-ink-faint">Share</dt>
                    <dd className="figures mt-1 text-lg text-violet-deep">{(selected.share * 100).toFixed(1)}%</dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-ink-faint">90% band</dt>
                    <dd className="figures mt-1 text-lg text-ink">
                      {(selected.band[0] * 100).toFixed(0)}–{(selected.band[1] * 100).toFixed(0)}%
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-ink-faint">Band width</dt>
                    <dd className="figures mt-1 text-lg text-ink">
                      {((selected.band[1] - selected.band[0]) * 100).toFixed(0)}pt
                    </dd>
                  </div>
                </dl>

                <div className="mt-6">
                  <Eyebrow className="text-ink-faint">Forecast comparison — three readers</Eyebrow>
                  <div className="mt-3">
                    <ForecastTriple
                      market={selected.share}
                      reviewerModel={selected.reviewerModel}
                      communityPoll={selected.communityPoll}
                    />
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-ink-faint">
                    Sample comparison: the market's reading against a reviewer-score model and a
                    community poll. Disagreement between readers is information; agreement is not proof.
                  </p>
                </div>
              </>
            ) : null}
          </aside>
        </div>
      </section>

      {/* Ranked list */}
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
          <div className="border-b border-paper/25 pb-4">
            <Eyebrow className="text-lavender">Fig. 2 — The ranked field</Eyebrow>
            <h2 className="display mt-2 text-4xl text-paper">Every outcome, in order</h2>
          </div>
          <ol className="mt-6">
            {ranked.map((c, i) => {
              const isSelected = c.id === selectedId;
              return (
                <li key={c.id} className="border-b border-paper/15">
                  <button
                    onClick={() => setSelectedId(c.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      "grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-1 py-3 text-left transition-colors sm:grid-cols-[2.5rem_1fr_7rem_7rem_7rem]",
                      isSelected ? "text-lavender" : "text-paper hover:text-lavender",
                    )}
                  >
                    <span className="figures text-paper/50">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 truncate text-[15px]">{c.name}</span>
                    <span className="figures hidden text-right sm:block">{(c.share * 100).toFixed(1)}%</span>
                    <span className="figures hidden text-right text-paper/60 sm:block">
                      {(c.reviewerModel * 100).toFixed(1)}
                    </span>
                    <span className="figures hidden text-right text-paper/60 sm:block">
                      {(c.communityPoll * 100).toFixed(1)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="hidden grid-cols-[2.5rem_1fr_7rem_7rem_7rem] gap-x-4 pt-3 sm:grid">
            <span />
            <Eyebrow className="text-paper/50">Outcome · sample</Eyebrow>
            <Eyebrow className="text-right text-paper/50">Market</Eyebrow>
            <Eyebrow className="text-right text-paper/50">Reviewer</Eyebrow>
            <Eyebrow className="text-right text-paper/50">Community</Eyebrow>
          </div>
          <p className="mt-6 max-w-2xl text-sm text-paper/60">
            All columns are sample data. Note how the top candidate's band overlaps its nearest
            rival's: the ranking is a reading, not a verdict.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
