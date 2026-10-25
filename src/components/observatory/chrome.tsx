import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { ECOSYSTEM_APPS } from "@/data/seer";
import type { ReactNode } from "react";

/* ============ Compact technical label ============ */

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("eyebrow", className)}>{children}</span>;
}

/* ============ SAMPLE DATA tag ============ */

export function SampleTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "eyebrow inline-flex items-center gap-1.5 border border-rule px-2 py-0.5 text-ink-faint",
        className,
      )}
    >
      Sample data
    </span>
  );
}

/* ============ Section heading ============ */

export function SectionHead({
  index,
  title,
  lead,
  className,
}: {
  index: string;
  title: string;
  lead?: string;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-rule pb-6", className)}>
      <Eyebrow className="text-ink-faint">§ {index}</Eyebrow>
      <h2 className="display mt-3 text-4xl text-ink sm:text-5xl">{title}</h2>
      {lead ? <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft">{lead}</p> : null}
    </div>
  );
}

/* ============ Page header for each instrument ============ */

export function PageHeader({
  code,
  name,
  title,
  accent,
  intro,
  meta,
}: {
  code: string;
  name: string;
  title: string;
  accent: string;
  intro: string;
  meta?: ReactNode;
}) {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-8 sm:pt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <Eyebrow className="text-ink-faint">
            Instrument {code} — {name}
          </Eyebrow>
          {meta ?? <SampleTag />}
        </div>
        <h1 className="display mt-6 max-w-5xl text-[clamp(2.6rem,6.5vw,5.5rem)] text-ink">
          {title}
          <span className="text-violet">.</span>{" "}
          <em className="text-violet-deep">{accent}</em>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{intro}</p>
      </div>
    </header>
  );
}

/* ============ Site footer ============ */

export function SiteFooter() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1fr_auto]">
          <div>
            <p className="display text-4xl">
              Seer<span className="text-lavender">.</span>
            </p>
            <p className="eyebrow mt-2 text-paper/60">The Observatory — information finance, examined.</p>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-paper/70">
              This is a public design prototype. Every figure on every page is illustrative
              sample data: no live prices, no real trades, no verified statistics. Nothing here
              is financial advice, and no risk estimate implies safety.
            </p>
          </div>
          <nav aria-label="Instruments" className="grid grid-cols-2 gap-x-12 gap-y-3 md:grid-cols-1">
            {ECOSYSTEM_APPS.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="eyebrow text-paper/70 transition-colors hover:text-lavender"
              >
                {a.code} · {a.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-paper/20 pt-6">
          <p className="eyebrow text-paper/50">Electric Foundation — prototype</p>
          <p className="eyebrow text-paper/50">Figures are sample data</p>
        </div>
      </div>
    </footer>
  );
}
