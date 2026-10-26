import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";

import { ObservatoryNav } from "@/components/observatory/nav";
import { AtlasCrossLink, Eyebrow, PageHeader, SampleTag, SiteFooter } from "@/components/observatory/chrome";
import { FrontierChart, OddsStrip } from "@/components/observatory/charts";
import { OPPORTUNITY_CANDIDATES, OPPORTUNITY_MARKET } from "@/data/seer";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { OpportunityExplorer } from "@/components/observatory/workbench";

export const Route = createFileRoute("/opportunity")({
  head: () => ({
    meta: [
      { title: "Opportunity Markets — Selection Forecast — Seer Observatory" },
      {
        name: "description",
        content:
          "A candidate field with selection odds, open slots, and a visible selection frontier. Reviewers hold final authority; the market only illuminates.",
      },
      { property: "og:title", content: "Opportunity Markets — Seer Observatory" },
      {
        property: "og:description",
        content: "Odds for every candidate against a fixed number of slots — reviewers still decide.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OpportunityPage,
});

function OpportunityPage() {
  const [shortlist, setShortlist] = useState<string[]>([]);
  const slots = OPPORTUNITY_MARKET.slots;

  const ranked = useMemo(
    () => [...OPPORTUNITY_CANDIDATES].sort((a, b) => b.odds - a.odds),
    [],
  );
  const frontierIds = ranked.slice(0, slots).map((c) => c.id);
  const frontierThreshold = frontierIds.length === slots ? (ranked[slots - 1]?.odds ?? 0) : 0;

  const toggle = (id: string) => setShortlist((s) => toggleShortlist(s, id, slots));

  return (
    <div className="min-h-screen bg-paper">
      <ObservatoryNav />

      <PageHeader
        code="04"
        name="Opportunity"
        title="A candidate field, priced against four open slots"
        accent="the frontier is visible."
        intro="Opportunity markets price each candidate's odds of selection against a fixed number of slots. The interesting object is not any one candidate — it is the frontier where the field runs out."
        meta={<SampleTag />}
      />

      {/* Authority note */}
      <div className="border-b border-rule bg-violet-deep text-paper">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 sm:px-8">
          <Eyebrow className="text-paper/70">Standing note</Eyebrow>
          <p className="text-sm text-paper">
            The market forecasts; humans decide. Shortlisting here is an interaction study — human
            reviewers hold final authority over every selection.
          </p>
        </div>
      </div>

      {/* Market statement */}
      <section className="border-b border-rule bg-lavender-soft/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-baseline justify-between gap-x-8 gap-y-2 px-4 py-6 sm:px-8">
          <div>
            <Eyebrow className="text-ink-faint">Illustrative field</Eyebrow>
            <p className="mt-1 font-display text-2xl text-ink">{OPPORTUNITY_MARKET.title}</p>
          </div>
          <Eyebrow className="text-ink-faint">
            {OPPORTUNITY_CANDIDATES.length} candidates · {slots} slots · sample data
          </Eyebrow>
        </div>
      </section>

      {/* Frontier */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-3">
          <Eyebrow className="text-ink">Fig. 1 — Selection frontier: odds against reviewer score</Eyebrow>
          <Eyebrow className="text-violet-deep">
            Frontier threshold · {(frontierThreshold * 100).toFixed(0)}% odds
          </Eyebrow>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-ink-soft">
          Horizontal position is the reviewers' normalized score; vertical position is the
          market-implied selection odds. Candidates above the dashed frontier line hold a slot in
          the sample pricing. Your shortlist marks dots in solid violet.
        </p>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <FrontierChart
            candidates={OPPORTUNITY_CANDIDATES}
            selectedIds={shortlist}
            slots={slots}
            onSelect={toggle}
          />

          <aside className="space-y-8">
            {/* Slots readout */}
            <div className="border border-ink p-6">
              <div className="flex items-baseline justify-between">
                <Eyebrow className="text-ink-faint">Your working shortlist</Eyebrow>
                <span className="figures text-ink">
                  {shortlist.length} / {slots} slots
                </span>
              </div>
              <div className="mt-3 flex gap-1.5" aria-hidden="true">
                {Array.from({ length: slots }, (_, i) => (
                  <div
                    key={i}
                    className={cn("h-2.5 flex-1", i < shortlist.length ? "bg-violet-deep" : "bg-lavender")}
                  />
                ))}
              </div>
              {shortlist.length > 0 ? (
                <ul className="mt-4 space-y-1.5 border-t border-rule pt-3">
                  {shortlist.map((id) => {
                    const c = OPPORTUNITY_CANDIDATES.find((x) => x.id === id);
                    return c ? (
                      <li key={id} className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-sm text-ink">{c.name}</span>
                        <span className="figures shrink-0 text-violet-deep">{(c.odds * 100).toFixed(0)}%</span>
                      </li>
                    ) : null;
                  })}
                </ul>
              ) : (
                <p className="mt-4 border-t border-rule pt-3 text-sm text-ink-faint">
                  Nothing shortlisted yet — mark candidates in the field below.
                </p>
              )}
              <Button variant="ghost"
                onClick={() => setShortlist([])}
                className="eyebrow mt-4 inline-flex items-center gap-2 border border-rule px-3 py-1.5 text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                <RotateCcw className="h-3 w-3" /> Reset shortlist
              </Button>
            </div>

            {/* Odds strip */}
            <div className="border border-rule p-6">
              <Eyebrow className="text-ink-faint">Fig. 2 — Odds distribution across the field</Eyebrow>
              <div className="mt-5">
                <OddsStrip
                  odds={ranked.map((c) => c.odds)}
                  ids={ranked.map((c) => c.id)}
                  selectedIds={shortlist}
                />
              </div>
              <p className="mt-4 text-xs leading-relaxed text-ink-faint">
                One diamond per candidate, placed by odds. Clusters are contested blocs; gaps are
                uncontested space.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <OpportunityExplorer shortlist={shortlist} onToggle={toggle} frontierIds={frontierIds} />

      {/* Candidate field */}
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
          <div className="border-b border-paper/25 pb-4">
            <Eyebrow className="text-lavender">The field</Eyebrow>
            <h2 className="display mt-2 text-4xl text-paper">Every candidate, with working odds</h2>
          </div>

          <ul className="mt-6">
            {OPPORTUNITY_CANDIDATES.map((c, i) => {
              const marked = shortlist.includes(c.id);
              const inFrontier = frontierIds.includes(c.id);
              return (
                <li key={c.id} className="border-b border-paper/15">
                  <div
                    className={cn(
                      "grid grid-cols-[2rem_1fr_auto] items-center gap-x-4 gap-y-1 py-3 transition-colors sm:grid-cols-[2rem_1fr_9rem_9rem_6rem]",
                      marked && "bg-paper/5",
                    )}
                  >
                    <span className="figures text-paper/50">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0">
                      <span className={cn("block truncate text-[15px]", marked ? "text-lavender" : "text-paper")}>
                        {c.name}
                        {inFrontier ? <span className="eyebrow ml-2 text-lavender/80">frontier</span> : null}
                      </span>
                      <span className="eyebrow mt-0.5 block text-paper/50">
                        {c.category} · {c.note}
                      </span>
                    </span>
                    <span className="figures hidden text-right sm:block">{(c.odds * 100).toFixed(0)}% odds</span>
                    <span className="figures hidden text-right text-paper/60 sm:block">
                      {(c.score * 100).toFixed(0)} score
                    </span>
                    <Button variant="ghost"
                      onClick={() => toggle(c.id)}
                      aria-pressed={marked}
                      className={cn(
                        "eyebrow justify-self-end border px-3 py-1.5 transition-colors",
                        marked
                          ? "border-lavender bg-lavender text-ink"
                          : "border-paper/40 text-paper/80 hover:border-lavender hover:text-lavender",
                      )}
                    >
                      {marked ? "Marked" : "Mark"}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 max-w-2xl text-sm text-paper/60">
            Odds and scores are sample data. The frontier row labels come from the sample pricing,
            not from any real review process — and a market's blessing is not a selection.
          </p>
        </div>
      </section>

      <AtlasCrossLink
        family="opportunity"
        label="Every selection field, in the universal explorer"
        note="Candidate fields like this one are priced as ordinary markets too. Open the Seer App to search all selection forecasts alongside every other instrument type."
      />

      <SiteFooter />
    </div>
  );
}
