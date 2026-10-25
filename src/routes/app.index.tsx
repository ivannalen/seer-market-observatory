import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";

import { ObservatoryNav } from "@/components/observatory/nav";
import { Eyebrow, SampleTag, SiteFooter } from "@/components/observatory/chrome";
import { Signature } from "@/components/observatory/charts";
import {
  ATLAS,
  INSTRUMENT_LABEL,
  fmtPct,
  fmtUsd,
  type AtlasMarket,
  type InstrumentType,
} from "@/data/seer";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/")({
  validateSearch: (search: Record<string, unknown>) => ({
    family: typeof search["family"] === "string" ? search["family"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Seer App — Universal Market Explorer" },
      {
        name: "description",
        content:
          "Seer's universal market explorer: discover, search, filter and open every instrument across Deep, Futarchy, Opportunity Markets and Risk Pricing — one structure, every market type.",
      },
      { property: "og:title", content: "Seer App — Universal Market Explorer" },
      {
        property: "og:description",
        content: "One place to discover and understand every Seer instrument, of every type.",
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

const FAMILY_TYPES: Record<string, InstrumentType | undefined> = {
  deep: "distribution",
  futarchy: "comparison",
  opportunity: "selection",
  risk: "risk",
};

const FAMILY_COPY: Record<string, string> = {
  deep: "Deep — many-outcome possibility fields",
  futarchy: "Futarchy — counterfactual decision comparisons",
  opportunity: "Opportunity — selection forecasts",
  risk: "Risk — comparative risk estimates",
};

type SortKey = "p" | "liquidity" | "volume";

function AtlasPage() {
  const { family } = Route.useSearch();
  const initialType = family ? (FAMILY_TYPES[family] ?? "all") : "all";

  const [query, setQuery] = useState("");
  const [type, setType] = useState<InstrumentType | "all">(initialType);
  const [sort, setSort] = useState<SortKey>("liquidity");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ATLAS.filter(
      (m) =>
        (type === "all" || m.type === type) &&
        (q === "" ||
          `${m.question} ${m.category} ${m.type} ${m.origin}`.toLowerCase().includes(q)),
    ).sort((a, b) => b[sort] - a[sort]);
  }, [query, type, sort]);

  const originCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of ATLAS) counts[m.origin] = (counts[m.origin] ?? 0) + 1;
    return counts;
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <ObservatoryNav />

      <header className="border-b border-rule">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-8 sm:pt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <Eyebrow className="text-ink-faint">Instrument 01 — Seer App · Universal explorer</Eyebrow>
            <SampleTag />
          </div>
          <h1 className="display mt-6 max-w-5xl text-[clamp(2.6rem,6.5vw,5.5rem)] text-ink">
            Every market, of every type,
            <br />
            <em className="text-violet-deep">in one place.</em>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            The Seer App is the protocol's public record and front door — the same way block
            explorers serve chains. Outcome prices, distributions, decision comparisons, selection
            fields and risk estimates all live here in one structure. Each row opens either a full
            market detail page or its specialized application.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1">
            {Object.entries(originCounts).map(([origin, n]) => (
              <span key={origin} className="figures text-ink-soft">
                {origin} <span className="text-violet-deep">{n}</span>
              </span>
            ))}
          </div>
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
              placeholder="Search questions, categories, families…"
              className="w-full border-b border-rule bg-transparent py-1.5 pl-6 font-sans text-sm text-ink placeholder:text-ink-faint focus:border-violet-deep focus:outline-none"
            />
          </label>

          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Filter by type">
            {TYPE_FILTERS.map((f) => (
              <Button variant="ghost"
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
              </Button>
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
              <Button variant="ghost"
                key={k}
                onClick={() => setSort(k)}
                aria-pressed={sort === k}
                className={cn(
                  "eyebrow border-b pb-0.5 transition-colors",
                  sort === k ? "border-violet-deep text-violet-deep" : "border-transparent text-ink-faint hover:text-ink",
                )}
              >
                {label}
              </Button>
            ))}
          </div>

          <Eyebrow className="ml-auto text-ink-faint">
            {results.length} / {ATLAS.length} instruments
          </Eyebrow>
        </div>
        {family && FAMILY_COPY[family] ? (
          <div className="border-t border-rule bg-lavender-soft/70">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-8">
              <Eyebrow className="text-violet-deep">{FAMILY_COPY[family]}</Eyebrow>
              <Button variant="ghost"
                onClick={() => setType("all")}
                className="eyebrow text-ink-soft underline-offset-2 hover:underline"
              >
                Show every type
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Table */}
      <main className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
        <div className="hidden grid-cols-[2.5rem_1fr_8rem_7rem_10rem_5rem_5rem] gap-x-4 border-b border-ink py-3 lg:grid">
          {["#", "Instrument", "Family", "Type", "Signature", "Price", "Liquidity"].map((h, i) => (
            <Eyebrow key={h} className={cn(i >= 5 && "text-right", i === 3 && "text-right", "text-ink-faint")}>
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
              <AtlasRow key={m.slug} m={m} index={i} />
            ))}
          </ul>
        )}

        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-ink-soft">
          All figures above are sample data for this design prototype — not live prices, not
          verified statistics. Rows marked with a family originate in a specialized application and
          open there; every other row opens a full market detail page.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}

/* One atlas row — the shared structure across every market type. */
function AtlasRow({ m, index }: { m: AtlasMarket; index: number }) {
  const inner = (
    <>
      <span className="figures hidden text-ink-faint lg:block">{String(index + 1).padStart(2, "0")}</span>
      <span className="min-w-0">
        <span className="block truncate text-[15px] text-ink group-hover:text-violet-deep sm:text-base">
          {m.question}
        </span>
        <span className="eyebrow mt-0.5 block text-ink-faint lg:hidden">
          {m.origin} · {INSTRUMENT_LABEL[m.type]} · {fmtPct(m.p)}
        </span>
      </span>
      <span className="eyebrow hidden text-ink-soft lg:block">{m.origin}</span>
      <span className="eyebrow hidden text-right text-violet-deep lg:block">{INSTRUMENT_LABEL[m.type]}</span>
      <Signature data={m.history} className="hidden h-8 w-24 text-violet-deep lg:block" fillArea={false} />
      <span className="figures text-right text-ink">{fmtPct(m.p)}</span>
      <span className="figures hidden text-right text-ink-soft lg:block">{fmtUsd(m.liquidity)}</span>
      <ArrowUpRight className="h-4 w-4 text-ink-faint transition-colors group-hover:text-violet-deep lg:hidden" />
    </>
  );
  const cls =
    "group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-4 transition-colors hover:bg-lavender-soft/60 lg:grid-cols-[2.5rem_minmax(0,1fr)_6rem_6rem_7rem_5rem_5rem] sm:gap-x-4";

  return (
    <li className="border-b border-rule">
      {m.href.startsWith("/app/") ? (
        <Link to="/app/$slug" params={{ slug: m.slug }} className={cls}>
          {inner}
        </Link>
      ) : (
        <Link to={m.href as "/deep" | "/futarchy" | "/opportunity" | "/risk"} className={cls}>
          {inner}
        </Link>
      )}
    </li>
  );
}
