import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { ObservatoryNav } from "@/components/observatory/nav";
import { Eyebrow, SampleTag, SiteFooter } from "@/components/observatory/chrome";
import { ProbBar, Signature } from "@/components/observatory/charts";
import {
  ATLAS,
  INSTRUMENT_LABEL,
  INSIGHTS,
  FALLBACK_INSIGHT,
  MARKETS,
  findMarket,
  fmtPct,
  fmtUsd,
} from "@/data/seer";

export const Route = createFileRoute("/app/$slug")({
  head: ({ params }) => {
    const m = findMarket(params.slug);
    return {
      meta: [
        { title: m ? `${m.question} — Seer Atlas` : "Instrument — Seer Atlas" },
        {
          name: "description",
          content: m
            ? `Read ${INSTRUMENT_LABEL[m.type].toLowerCase()} instrument: ${m.question} (sample data).`
            : "Instrument detail in the Seer market atlas.",
        },
        { property: "og:title", content: m ? `${m.question} — Seer Atlas` : "Instrument — Seer Atlas" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: MarketDetail,
});

const READ_GUIDE: Record<string, string> = {
  price:
    "This is a binary instrument. The price is one number — the market's current exchange rate between the YES and NO worlds. Read the signature for how that rate has moved, and liquidity for how much weight stands behind it.",
  distribution:
    "This is a many-outcome instrument. The probability mass is spread across every candidate outcome; no single number is the answer. The signature tracks the leading outcome's share.",
  comparison:
    "This is a conditional instrument. It prices the same success metric in two possible worlds — the proposal passing and failing. The interesting reading is the difference, not the level.",
  selection:
    "This is a selection instrument. It prices each candidate's odds against a fixed number of slots. The shape of the odds field — where the frontier sits — matters more than any single candidate.",
  risk:
    "This is a risk instrument. The price estimates the probability of a defined adverse event in a fixed window. Treat it as a reading with an uncertainty band, never as a guarantee.",
};

function MarketDetail() {
  const { slug } = Route.useParams();
  const market = findMarket(slug);

  if (!market) {
    throw notFound();
  }

  const m = market;
  const insight = INSIGHTS[m.slug] ?? FALLBACK_INSIGHT;
  const origin = ATLAS.find((a) => a.slug === m.slug)?.origin ?? "Atlas";
  const related = MARKETS.filter((x) => x.type === m.type && x.slug !== m.slug).slice(0, 3);
  const hi = Math.max(...m.history) * 100;
  const lo = Math.min(...m.history) * 100;

  return (
    <div className="min-h-screen bg-paper">
      <ObservatoryNav />

      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <Link
          to="/app"
          search={{ family: undefined }}
          className="eyebrow mt-8 inline-flex items-center gap-2 border-b border-ink pb-1 text-ink transition-colors hover:text-violet-deep"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to the atlas
        </Link>
      </div>

      <header className="border-b border-rule">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <Eyebrow className="text-violet-deep">
              {INSTRUMENT_LABEL[m.type]} · {m.category}
              {origin !== "Atlas" ? ` · ${origin} family` : ""}
            </Eyebrow>
            <SampleTag />
          </div>
          <h1 className="display mt-6 max-w-5xl text-[clamp(2rem,5vw,4.2rem)] text-ink">
            {m.question}
          </h1>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
            {[
              ["Closes", m.closes],
              ["Liquidity", fmtUsd(m.liquidity)],
              ["Volume", fmtUsd(m.volume)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline gap-2">
                <Eyebrow className="text-ink-faint">{k}</Eyebrow>
                <span className="figures text-ink">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          {/* Signature chart */}
          <section>
            <div className="flex items-center justify-between border-b border-ink pb-3">
              <Eyebrow className="text-ink">Fig. 1 — Probability signature, sample series</Eyebrow>
              <Eyebrow className="text-ink-faint">24 readings</Eyebrow>
            </div>
            <SignatureChart history={m.history} />
            <div className="flex justify-between border-t border-rule pt-2">
              <span className="figures text-ink-faint">low {lo.toFixed(0)}%</span>
              <span className="figures text-ink-faint">range of the sample series</span>
              <span className="figures text-ink-faint">high {hi.toFixed(0)}%</span>
            </div>

            {m.outcomes ? (
              <section className="mt-12">
                <div className="border-b border-ink pb-3">
                  <Eyebrow className="text-ink">Fig. 2 — Outcome distribution, sample</Eyebrow>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {m.outcomes.map((o) => (
                    <li key={o.name} className="grid grid-cols-[1fr_4.5rem_10rem] items-center gap-4">
                      <span className="truncate text-sm text-ink">{o.name}</span>
                      <span className="figures text-right text-ink">{fmtPct(o.share, 1)}</span>
                      <ProbBar p={o.share} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </section>

          {/* Reading panel */}
          <aside className="space-y-10">
            <div className="border border-ink p-6">
              <Eyebrow className="text-ink-faint">Headline figure</Eyebrow>
              <p className="display mt-2 text-6xl text-ink">
                {fmtPct(m.p)}
                {m.type === "selection" ? (
                  <span className="ml-2 text-xl text-ink-faint">leading odds</span>
                ) : m.type === "distribution" ? (
                  <span className="ml-2 text-xl text-ink-faint">leading share</span>
                ) : m.type === "risk" ? (
                  <span className="ml-2 text-xl text-ink-faint">event odds</span>
                ) : (
                  <span className="ml-2 text-xl text-ink-faint">YES worlds</span>
                )}
              </p>
              <Signature data={m.history} width={260} height={56} className="mt-6 w-full text-violet-deep" />
            </div>

            <div>
              <div className="border-b border-ink pb-3">
                <Eyebrow className="text-ink">How to read this instrument</Eyebrow>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{READ_GUIDE[m.type]}</p>
            </div>

            <div>
              <div className="border-b border-ink pb-3">
                <Eyebrow className="text-ink">Instrument notes</Eyebrow>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{m.summary}</p>
              <dl className="mt-6 space-y-3">
                <div className="border-t border-rule pt-3">
                  <dt className="eyebrow text-ink-faint">Resolution source</dt>
                  <dd className="mt-1 text-sm text-ink">{m.resolution}</dd>
                </div>
                <div className="border-t border-rule pt-3">
                  <dt className="eyebrow text-ink-faint">Pooled liquidity</dt>
                  <dd className="figures mt-1 text-ink">{fmtUsd(m.liquidity)}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        {/* WHO / WHAT / HOW */}
        <section className="mt-20 border-t border-ink pt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <Eyebrow className="text-ink">From question to decision</Eyebrow>
            <Eyebrow className="text-ink-faint">Sample framing · not live</Eyebrow>
          </div>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["WHO", "Who is asking", insight.seeker],
              ["WHY", "The decision it informs", insight.decision],
              ["HOW", "Using this signal", insight.signal],
              ["BUT", "Limits of this reading", insight.limitations],
            ].map(([code, head, body]) => (
              <div key={code} className="border-t-2 border-violet-deep pt-4">
                <Eyebrow className="text-violet-deep">{code}</Eyebrow>
                <h3 className="mt-2 font-display text-xl text-ink">{head}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 max-w-3xl text-sm leading-relaxed text-ink-soft">
            What this instrument prices: a {INSTRUMENT_LABEL[m.type].toLowerCase()}, currently reading{" "}
            {fmtPct(m.p)}, resolving against “{m.resolution}.” The uncertainty around that reading
            is drawn in the signature above — sharp movement means the field is contested, not that
            the answer changed. This page is part of the prototype; every figure is sample data.
          </p>
        </section>

        {/* Related */}
        {related.length > 0 ? (
          <section className="mt-20 border-t border-ink pt-8">
            <Eyebrow className="text-ink-faint">Same family</Eyebrow>
            <ul className="mt-4 divide-y divide-rule border-b border-rule">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    to="/app/$slug"
                    params={{ slug: r.slug }}
                    className="group flex items-center justify-between gap-6 py-4"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] text-ink group-hover:text-violet-deep">
                        {r.question}
                      </span>
                      <span className="eyebrow mt-0.5 block text-ink-faint">{INSTRUMENT_LABEL[r.type]}</span>
                    </span>
                    <span className="figures shrink-0 text-ink">{fmtPct(r.p)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}

/* Full-width signature with axis annotations. */
function SignatureChart({ history }: { history: number[] }) {
  const W = 720;
  const H = 300;
  const pad = { t: 20, b: 34, l: 44, r: 16 };
  const min = Math.min(...history);
  const max = Math.max(...history);
  const span = Math.max(max - min, 0.05);
  const y = (v: number) => H - pad.b - ((v - min) / span) * (H - pad.t - pad.b);
  const x = (i: number) => pad.l + (i / (history.length - 1)) * (W - pad.l - pad.r);
  const line = history.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(history.length - 1).toFixed(1)},${H - pad.b} L${x(0).toFixed(1)},${H - pad.b} Z`;

  const last = history[history.length - 1] ?? 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-6 w-full" role="img" aria-label="Sample price history">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const v = min + span * f;
        return (
          <g key={f}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className="stroke-rule" strokeWidth="1" strokeDasharray={f === 0 ? "" : "2 4"} />
            <text x={pad.l - 8} y={y(v) + 3} textAnchor="end" className="fill-ink-faint" fontSize="10" fontFamily="var(--font-mono)">
              {(v * 100).toFixed(0)}%
            </text>
          </g>
        );
      })}
      <path d={area} className="fill-violet opacity-15" />
      <path d={line} fill="none" className="stroke-violet-deep" strokeWidth="2" />
      <circle cx={x(history.length - 1)} cy={y(last)} r="4" className="fill-violet-deep" />
      <text x={x(history.length - 1) - 8} y={y(last) - 12} textAnchor="end" className="fill-violet-deep" fontSize="12" fontFamily="var(--font-mono)">
        {(last * 100).toFixed(0)}%
      </text>
      <text x={pad.l} y={H - 10} className="fill-ink-faint" fontSize="10" fontFamily="var(--font-mono)">
        oldest
      </text>
      <text x={W - pad.r} y={H - 10} textAnchor="end" className="fill-ink-faint" fontSize="10" fontFamily="var(--font-mono)">
        latest reading
      </text>
    </svg>
  );
}
