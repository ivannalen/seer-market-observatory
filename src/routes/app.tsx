import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, Search } from "lucide-react";

import { ObservatoryNav } from "@/components/observatory/nav";
import { Eyebrow, SampleTag, SiteFooter } from "@/components/observatory/chrome";
import { DistributionField, Signature } from "@/components/observatory/charts";
import {
  INSTRUMENT_LABEL,
  MARKETS,
  findMarket,
  fmtPct,
  fmtUsd,
  type InstrumentType,
} from "@/data/seer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Market Atlas — Seer Observatory" },
      {
        name: "description",
        content:
          "The full atlas of Seer instruments: search, filter by type, and read each market's probability signature, liquidity and volume.",
      },
      { property: "og:title", content: "Market Atlas — Seer Observatory" },
      {
        property: "og:description",
        content: "Every open instrument in one atlas — search, filter, and read the signature.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AtlasPage,
});

const TYPE_FILTERS: { key: InstrumentType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "price", label: "Outcome price" },
  { key: "distribution", label: "Distribution" },
  { key: "comparison", label: "World comparison" },
  { key: "selection", label: "Selection" },
  { key: "risk", label: "Risk" },
];

type SortKey = "p" | "liquidity" | "volume";

function AtlasPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<InstrumentType | "all">("all");
  const [sort, setSort] = useState<SortKey>("liquidity");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MARKETS.filter(
      (m) =>
        (type === "all" || m.type === type) &&
        (q === "" || `${m.question} ${m.category} ${m.type}`.toLowerCase().includes(q)),
    ).sort((a, b) => b[sort] - a[sort]);
  }, [query, type, sort]);

  return (
    <div className="min-h-screen bg-paper">
      <ObservatoryNav />

      <header className="border-b border-rule">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-8 sm:pt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <Eyebrow className="text-ink-faint">Instrument 01 — Market atlas</Eyebrow>
            <SampleTag />
          </div>
          <h1 className="display mt-6 max-w-5xl text-[clamp(2.6rem,6.5vw,5.5rem)] text-ink">
            Every open instrument,
            <br />
            <em className="text-violet-deep">on one bench.</em>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            The atlas trades decoration for density: one row per instrument, its type, its live
            signature, and the two figures that matter most — liquidity and volume. Search it,
            filter it, then open what interests you.
          </p>
        </div>
      </header>

      {/* Controls */}
      <div className="sticky top-[52px] z-40 border-b border-rule bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-8">
          <label className="relative min-w-[240px] flex-1">
            <span className="sr-only">Search instruments</span>
            <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions, categories…"
              className="w-full border-b border-rule bg-transparent py-1.5 pl-6 font-sans text-sm text-ink placeholder:text-ink-faint focus:border-violet-deep focus:outline-none"
            />
          </label>

          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Filter by type">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setType(f.key)}
                aria-pressed={type === f.key}
                className={cn(
                  "eyebrow border px-2.5 py-1 transition-colors",
                  type === f.key
                    ? "border-ink bg-ink text-paper"
                    : "border-rule text-ink-soft hover:border-ink hover:text-ink",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Eyebrow className="text-ink-faint">Sort</Eyebrow>
            {(
              [
                ["p", "Probability"],
                ["liquidity", "Liquidity"],
                ["volume", "Volume"],
              ] as [SortKey, string][]
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setSort(k)}
                aria-pressed={sort === k}
                className={cn(
                  "eyebrow border-b pb-0.5 transition-colors",
                  sort === k ? "border-violet-deep text-violet-deep" : "border-transparent text-ink-faint hover:text-ink",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <Eyebrow className="ml-auto text-ink-faint">
            {results.length} / {MARKETS.length} instruments
          </Eyebrow>
        </div>
      </div>

      {/* Table */}
      <main className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
        <div className="hidden grid-cols-[2.5rem_1fr_7rem_10rem_5rem_5rem_6rem] gap-x-8 border-b border-ink py-3 sm:grid">
          {["#", "Instrument", "Type", "Signature", "Price", "Liquidity", "Volume"].map((h, i) => (
            <Eyebrow key={h} className={cn(i >= 4 && "text-right", "text-ink-faint")}>
              {h}
            </Eyebrow>
          ))}
        </div>

        {results.length === 0 ? (
          <p className="py-20 text-center font-display text-3xl text-ink-faint">
            Nothing on the bench matches that reading.
          </p>
        ) : (
          <ul>
            {results.map((m, i) => (
              <li key={m.slug} className="border-b border-rule">
                <Link
                  to="/app/$slug"
                  params={{ slug: m.slug }}
                  className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-4 transition-colors hover:bg-lavender-soft/60 sm:grid-cols-[2.5rem_1fr_7rem_10rem_5rem_5rem_6rem] sm:gap-x-8"
                >
                  <span className="figures hidden text-ink-faint sm:block">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] text-ink group-hover:text-violet-deep sm:text-base">
                      {m.question}
                    </span>
                    <span className="eyebrow mt-0.5 block text-ink-faint sm:hidden">
                      {INSTRUMENT_LABEL[m.type]} · {fmtPct(m.p)} · {fmtUsd(m.liquidity)}
                    </span>
                  </span>
                  <span className="eyebrow hidden text-violet-deep sm:block">{INSTRUMENT_LABEL[m.type]}</span>
                  <Signature data={m.history} className="hidden h-8 w-24 text-violet-deep sm:block" fillArea={false} />
                  <span className="figures text-right text-ink">{fmtPct(m.p)}</span>
                  <span className="figures hidden text-right text-ink-soft sm:block">{fmtUsd(m.liquidity)}</span>
                  <span className="figures hidden text-right text-ink-faint sm:block">{fmtUsd(m.volume)}</span>
                  <ArrowUpRight className="h-4 w-4 text-ink-faint transition-colors group-hover:text-violet-deep sm:hidden" />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-ink-soft">
          All figures above are sample data for this design prototype — not live prices, not
          verified statistics. Liquidity is pooled depth available to traders; volume is cumulative
          matched trades over the instrument's life.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
