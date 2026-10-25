import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

import { ObservatoryNav } from "@/components/observatory/nav";
import { Eyebrow, SampleTag, SectionHead, SiteFooter } from "@/components/observatory/chrome";
import { Signature } from "@/components/observatory/charts";
import {
  ECOSYSTEM_APPS,
  FEATURED_SLUGS,
  INSTRUMENT_LABEL,
  findMarket,
  fmtPct,
  fmtUsd,
} from "@/data/seer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Seer — The Observatory" },
      {
        name: "description",
        content:
          "An instrument for examining possible futures. A question enters the protocol and becomes a price, a distribution, a comparison of worlds, a selection forecast, or a risk estimate.",
      },
      { property: "og:title", content: "Seer — The Observatory" },
      {
        property: "og:description",
        content: "Six connected instruments for information finance: Atlas, Deep, Futarchy, Opportunity, Risk.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const OUTPUTS = [
  { code: "T/01", label: "A price", to: "/app", desc: "One number: the market's exchange rate between two worlds." },
  { code: "T/02", label: "A distribution", to: "/deep", desc: "Many outcomes, one field. The whole shape is the answer." },
  { code: "T/03", label: "A comparison of worlds", to: "/futarchy", desc: "The same metric priced in the world where a proposal passes — and fails." },
  { code: "T/04", label: "A selection forecast", to: "/opportunity", desc: "Odds for every candidate against a fixed number of slots." },
  { code: "T/05", label: "A risk estimate", to: "/risk", desc: "A probability of harm, with its uncertainty band drawn." },
];

function Index() {
  return (
    <div className="min-h-screen bg-paper">
      <ObservatoryNav />

      {/* ============ Hero ============ */}
      <section className="border-b border-rule">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            <Eyebrow className="text-ink-faint">Seer — information finance protocol</Eyebrow>
            <h1 className="display mt-6 text-[clamp(3rem,8vw,6.5rem)] text-ink">
              Examine the
              <br />
              <em className="text-violet-deep">possible.</em>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft">
              Seer is an instrument for examining possible futures — and a two-sided marketplace.
              Information seekers need answers they can act on; traders put capital behind their
              forecasts and earn for accuracy. A question enters the protocol and comes out as a
              price, a distribution, a comparison between possible worlds, a selection forecast, or
              a risk estimate. The Observatory shows the whole instrument at work.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/app"
                className="eyebrow inline-flex items-center gap-2 bg-ink px-5 py-3 text-paper transition-colors hover:bg-violet-deep"
              >
                Open the atlas <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href="#constellation"
                className="eyebrow inline-flex items-center gap-2 border border-ink px-5 py-3 text-ink transition-colors hover:bg-lavender"
              >
                Tour the constellation
              </a>
            </div>
          </div>

          {/* Transformation figure: question → instrument → outputs */}
          <TransformationFigure />
        </div>
      </section>

      {/* ============ Constellation (deep ink) ============ */}
      <ConstellationSection />

      {/* ============ What information finance is ============ */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8">
          <SectionHead
            index="01"
            title="What information finance is"
            lead="Ordinary markets trade things that already exist. Information markets trade claims about what will be true — and in doing so, they turn scattered human belief into a precise, inspectable object."
          />
          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-0">
            {[
              {
                n: "01",
                head: "A question enters",
                body: "Every instrument starts as a question with a verifiable resolution — a date, a source, a rule. Ambiguity is engineered out before capital arrives.",
                glyph: "?" as const,
              },
              {
                n: "02",
                head: "Capital converges",
                body: "Traders who disagree put weight behind their reading. Liquidity pools the disagreement into a single live figure — the price.",
                glyph: "◎" as const,
              },
              {
                n: "03",
                head: "A reading comes out",
                body: "Read as a forecast, a ranked field, a pair of counterfactual worlds, or a priced risk. The reading is public, dated, and auditable.",
                glyph: "▤" as const,
              },
            ].map((s, i) => (
              <div
                key={s.n}
                className={cn(
                  "relative md:px-8",
                  i > 0 && "md:border-l md:border-rule",
                  i === 0 && "md:pl-0",
                )}
              >
                <Eyebrow className="text-violet-deep">Step {s.n}</Eyebrow>
                <div className="mt-4 font-mono text-5xl text-lavender-soft">{s.glyph}</div>
                <h3 className="display mt-4 text-3xl text-ink">{s.head}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="display mt-16 max-w-3xl text-3xl leading-snug text-ink sm:text-4xl">
            “A market is an <em className="text-violet-deep">instrument</em> before it is a venue.
            Seer builds the instrument, then points it at questions worth asking.”
          </p>
        </div>
      </section>

      {/* ============ Two sides, one instrument ============ */}
      <section className="border-b border-rule bg-lavender-soft/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8">
          <SectionHead
            index="02"
            title="Two sides, one instrument"
            lead="Seer is a two-sided marketplace. Information seekers need answers they can act on. Traders put capital behind their forecasts and earn for accuracy. The price is the exact point where the two sides meet — useful to one, profitable to the other."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-0">
            <div className="border border-rule bg-paper p-8 lg:border-r-0">
              <Eyebrow className="text-violet-deep">Side A — Information seekers</Eyebrow>
              <h3 className="display mt-3 text-3xl text-ink">They need the answer.</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                DAOs weighing a proposal, treasuries hedging a window, program committees reading
                their own shortlist, risk teams sizing exposure. They commission or adopt an
                instrument because its output — one honest number, distribution, or comparison —
                feeds a decision they must make.
              </p>
              <ul className="mt-6 space-y-2 border-t border-rule pt-4">
                {[
                  "Bring the question and its resolution rule",
                  "Read the price, band, and drift",
                  "Act on the reading — the market never decides",
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-sm text-ink-soft">
                    <span className="figures shrink-0 text-violet-deep">→</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-rule bg-paper p-8">
              <Eyebrow className="text-violet-deep">Side B — Traders</Eyebrow>
              <h3 className="display mt-3 text-3xl text-ink">They price the question.</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Traders who disagree put weight behind their reading. Every position moves the
                price toward the best available information — and every accurate trader earns for
                moving it. Their profit is the seeker's signal quality.
              </p>
              <ul className="mt-6 space-y-2 border-t border-rule pt-4">
                {[
                  "Bring capital and conviction",
                  "Buy under-priced outcomes, sell over-priced ones",
                  "Earn accuracy — liquidity is the service",
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-sm text-ink-soft">
                    <span className="figures shrink-0 text-violet-deep">→</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="display mx-auto mt-12 max-w-3xl text-center text-2xl leading-snug text-ink sm:text-3xl">
            “Seekers ask. Traders stake. The instrument pays both — with a reading{" "}
            <em className="text-violet-deep">anyone can audit.</em>”
          </p>
        </div>
      </section>

      {/* ============ Featured instruments ============ */}
      <section className="bg-lavender-soft/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-6">
            <div>
              <Eyebrow className="text-ink-faint">§ 03 — On the bench</Eyebrow>
              <h2 className="display mt-3 text-4xl text-ink sm:text-5xl">Featured instruments</h2>
            </div>
            <div className="flex items-center gap-3">
              <SampleTag />
              <Link
                to="/app"
                className="eyebrow inline-flex items-center gap-1.5 border-b border-ink pb-0.5 text-ink transition-colors hover:text-violet-deep"
              >
                Full atlas <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <ul>
            {FEATURED_SLUGS.map((slug, i) => {
              const m = findMarket(slug);
              if (!m) return null;
              return (
                <li key={slug} className="border-b border-rule">
                  <Link
                    to="/app/$slug"
                    params={{ slug }}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 py-5 transition-colors hover:bg-paper sm:grid-cols-[3rem_1fr_auto_auto_auto] sm:gap-x-8 sm:px-2"
                  >
                    <span className="figures text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0">
                      <span className="eyebrow block text-violet-deep">{INSTRUMENT_LABEL[m.type]}</span>
                      <span className="mt-1 block truncate font-sans text-base text-ink group-hover:text-violet-deep sm:text-lg">
                        {m.question}
                      </span>
                    </span>
                    <Signature data={m.history} className="hidden h-8 w-24 text-violet-deep sm:block" />
                    <span className="figures hidden text-right text-ink sm:block">{fmtPct(m.p)}</span>
                    <span className="figures hidden text-right text-ink-faint sm:block">{fmtUsd(m.liquidity)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

/* ============ Transformation figure ============ */

function TransformationFigure() {
  return (
    <figure className="relative border border-rule bg-paper">
      <figcaption className="flex items-center justify-between border-b border-rule px-4 py-2.5">
        <Eyebrow className="text-ink-faint">Fig. 0 — The transformation</Eyebrow>
        <Eyebrow className="text-ink-faint">one question → five readings</Eyebrow>
      </figcaption>

      <div className="px-6 py-8 sm:px-8">
        {/* the question, entering */}
        <p className="display text-2xl leading-snug text-ink sm:text-[1.7rem]">
          “Will the Q3 fund select an <em className="text-violet-deep">open data</em> project?”
        </p>
        <div className="mt-2 flex items-center gap-3">
          <Eyebrow className="text-ink-faint">Input · verified resolution rule</Eyebrow>
          <span className="h-px flex-1 bg-rule" />
        </div>

        {/* prism */}
        <div className="relative my-8 flex items-center justify-center">
          <svg viewBox="0 0 600 64" className="w-full" aria-hidden="true">
            <line x1="0" y1="32" x2="252" y2="32" className="stroke-ink" strokeWidth="1.5" />
            <polygon points="262,4 306,32 262,60" className="fill-lavender stroke-violet-deep" strokeWidth="1.5" />
            {[
              6, 74, 142, 210, 278,
            ].map((off, i) => {
              const y2 = 4 + off * 0.4;
              return (
                <line
                  key={i}
                  x1="308"
                  y1="32"
                  x2="600"
                  y2={y2}
                  className="stroke-violet-deep"
                  strokeWidth="1"
                  opacity={0.7}
                />
              );
            })}
            <text x="256" y="76" textAnchor="middle" className="fill-ink-faint" fontSize="9" fontFamily="var(--font-mono)">
              SEER
            </text>
          </svg>
        </div>

        {/* outputs */}
        <ul className="divide-y divide-rule border-y border-rule">
          {OUTPUTS.map((o) => (
            <li key={o.code}>
              <Link to={o.to} className="group flex items-baseline gap-4 py-3">
                <Eyebrow className="w-9 shrink-0 text-ink-faint">{o.code}</Eyebrow>
                <span className="w-40 shrink-0 font-display text-lg text-ink group-hover:text-violet-deep sm:text-xl">
                  {o.label}
                </span>
                <span className="hidden min-w-0 flex-1 truncate text-sm text-ink-soft sm:block">
                  {o.desc}
                </span>
                <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-ink-faint transition-colors group-hover:text-violet-deep" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}

/* ============ Constellation section ============ */

function ConstellationSection() {
  const [active, setActive] = useState(ECOSYSTEM_APPS[0]?.code ?? "01");
  const current = ECOSYSTEM_APPS.find((a) => a.code === active) ?? ECOSYSTEM_APPS[0];
  if (!current) return null;

  const pos = (a: (typeof ECOSYSTEM_APPS)[number]) => {
    const r = 46 * a.orbit;
    const rad = (a.angle * Math.PI) / 180;
    return { left: 50 + r * Math.cos(rad), top: 50 + r * Math.sin(rad) };
  };

  return (
    <section id="constellation" className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Eyebrow className="text-lavender">§ 00 — The constellation</Eyebrow>
            <h2 className="display mt-3 text-[clamp(2.4rem,5vw,4.5rem)] text-paper">
              One protocol.
              <br />
              Five <em className="text-lavender">instruments.</em>
            </h2>
            <p className="mt-6 max-w-lg leading-relaxed text-paper/70">
              Seer is one market layer read five ways. Each instrument around the centre takes the
              same raw material — live probabilities — and resolves it for a different question.
              Hover a node to inspect it; open it to work with it.
            </p>

            {/* active node panel */}
            <div className="mt-10 border border-paper/20 bg-paper/5 p-6">
              <div className="flex items-baseline justify-between gap-4">
                <Eyebrow className="text-lavender">
                  {current.code} · {current.tag}
                </Eyebrow>
                <Link
                  to={current.to}
                  className="eyebrow inline-flex items-center gap-1.5 border-b border-paper/50 pb-0.5 text-paper transition-colors hover:text-lavender"
                >
                  Open {current.name} <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="display mt-4 text-3xl text-paper">{current.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-paper/70">{current.description}</p>
            </div>
          </div>

          {/* orbital diagram */}
          <div className="relative mx-auto aspect-square w-full max-w-[540px]">
            {/* orbit rings */}
            {[0.55, 0.85].map((r) => (
              <div
                key={r}
                className="absolute rounded-full border border-paper/15"
                style={{
                  left: `${50 - 46 * r}%`,
                  top: `${50 - 46 * r}%`,
                  width: `${92 * r}%`,
                  height: `${92 * r}%`,
                }}
              />
            ))}
            {/* spokes */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
              {ECOSYSTEM_APPS.map((a) => {
                const p = pos(a);
                return (
                  <line
                    key={a.code}
                    x1="50"
                    y1="50"
                    x2={p.left}
                    y2={p.top}
                    className={a.code === active ? "stroke-lavender" : "stroke-paper"}
                    strokeWidth={a.code === active ? 0.4 : 0.2}
                    opacity={a.code === active ? 0.9 : 0.25}
                  />
                );
              })}
            </svg>

            {/* centre */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="rounded-full border border-paper/40 bg-ink px-5 py-4">
                <p className="display text-2xl leading-none text-paper">
                  Seer<span className="text-lavender">.</span>
                </p>
                <p className="eyebrow mt-1 text-paper/60">market layer</p>
              </div>
            </div>

            {/* nodes */}
            {ECOSYSTEM_APPS.map((a) => {
              const p = pos(a);
              const isActive = a.code === active;
              return (
                <Link
                  key={a.code}
                  to={a.to}
                  onMouseEnter={() => setActive(a.code)}
                  onFocus={() => setActive(a.code)}
                  aria-label={`${a.name} — ${a.tag}`}
                  className={cn(
                    "absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 rounded-full px-3 py-3 text-center outline-none transition-transform",
                    isActive && "scale-110",
                  )}
                  style={{ left: `${p.left}%`, top: `${p.top}%` }}
                >
                  <span
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full border font-mono text-sm transition-colors",
                      isActive
                        ? "border-lavender bg-lavender text-ink"
                        : "border-paper/40 bg-ink text-paper hover:border-lavender",
                    )}
                  >
                    {a.code}
                  </span>
                  <span
                    className={cn(
                      "eyebrow transition-colors",
                      isActive ? "text-lavender" : "text-paper/60",
                    )}
                  >
                    {a.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-3 border-t border-paper/15 pt-6">
          <Eyebrow className="text-paper/50">Reading the diagram</Eyebrow>
          <p className="text-sm text-paper/60">
            Ring distance is conceptual, not to scale. The centre is the only shared resource:
            liquidity. Everything outside it is a different way of reading the same flow.
          </p>
        </div>
      </div>
    </section>
  );
}
