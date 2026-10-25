import { cn } from "@/lib/utils";
import { useState } from "react";

/*
 * Hand-rolled SVG instruments. Every figure encodes market structure —
 * nothing decorative. All inputs are sample data by construction.
 */

/* ============ Probability signature (sparkline) ============ */

export function Signature({
  data,
  width = 128,
  height = 34,
  className,
  fillArea = true,
  inspect = false,
}: {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  fillArea?: boolean;
  inspect?: boolean;
}) {
  const [inspected, setInspected] = useState<number | null>(null);
  const n = data.length;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = Math.max(max - min, 0.04);
  const x = (i: number) => (i / Math.max(n - 1, 1)) * (width - 2) + 1;
  const y = (v: number) => height - 3 - ((v - min) / span) * (height - 6);
  const line = data.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(n - 1).toFixed(1)},${height} L${x(0).toFixed(1)},${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      width={width}
      height={height}
      role="img"
      aria-label="Illustrative market history"
      tabIndex={inspect ? 0 : undefined}
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        setInspected(Math.max(0, Math.min(n - 1, Math.round((event.clientX - bounds.left) / bounds.width * (n - 1)))));
      }}
      onPointerLeave={() => setInspected(null)}
      onFocus={() => setInspected(n - 1)}
      onBlur={() => setInspected(null)}
      onKeyDown={event => {
        if (!inspect || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault();
        setInspected(index => Math.max(0, Math.min(n - 1, (index ?? n - 1) + (event.key === "ArrowLeft" ? -1 : 1))));
      }}
    >
      {fillArea ? <path d={area} className="fill-current opacity-[0.12]" /> : null}
      <path d={line} fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx={x(n - 1)} cy={y(data[n - 1] ?? 0)} r="2.2" className="fill-current" />
      {inspected !== null && data[inspected] !== undefined && <g>
        <line x1={x(inspected)} x2={x(inspected)} y1="0" y2={height} stroke="currentColor" strokeDasharray="2 3" opacity="0.5" />
        <circle cx={x(inspected)} cy={y(data[inspected])} r="3" className="fill-current" />
        <text x={Math.max(22, Math.min(width - 22, x(inspected)))} y={height / 2} textAnchor="middle" className="fill-current font-mono" fontSize={Math.min(12, height / 3)}>{(data[inspected] * 100).toFixed(1)}%</text>
      </g>}
    </svg>
  );
}

/* ============ Thin probability bar with marker ============ */

export function ProbBar({ p, className }: { p: number; className?: string }) {
  return (
    <div
      className={cn("relative h-1.5 w-full bg-lavender", className)}
      role="img"
      aria-label={`${Math.round(p * 100)} percent`}
    >
      <div className="absolute inset-y-0 left-0 bg-violet-deep" style={{ width: `${p * 100}%` }} />
    </div>
  );
}

/* ============ Distribution field (many-outcome) ============ */

export function DistributionField({
  candidates,
  selectedId,
  onSelect,
  height = 260,
}: {
  candidates: { id: string; name?: string; share: number; band: [number, number] }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  height?: number;
}) {
  const W = 760;
  const H = height;
  const pad = { top: 28, bottom: 26, left: 8, right: 8 };
  const maxShare = Math.max(...candidates.map((c) => c.band[1]));
  const y = (v: number) => H - pad.bottom - (v / maxShare) * (H - pad.top - pad.bottom);
  const step = (W - pad.left - pad.right) / candidates.length;
  const x = (i: number) => pad.left + step * i + step / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="listbox" aria-label="Outcome distribution">
      {/* baseline + gridlines at 25/50/75% of the axis max */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line
            x1={pad.left}
            x2={W - pad.right}
            y1={y(maxShare * f)}
            y2={y(maxShare * f)}
            className="stroke-rule"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
          <text x={W - pad.right - 6} y={y(maxShare * f) - 4} textAnchor="end" className="fill-ink-faint" fontSize="9" fontFamily="var(--font-mono)">
            {(maxShare * f * 100).toFixed(0)}%
          </text>
        </g>
      ))}
      <line x1={pad.left} x2={W - pad.right} y1={y(0)} y2={y(0)} className="stroke-ink" strokeWidth="1" />

      {candidates.map((c, i) => {
        const selected = c.id === selectedId;
        const top = y(c.share);
        const bandTop = y(c.band[1]);
        const bandBottom = y(c.band[0]);
        return (
          <g
            key={c.id}
            role="option"
            aria-selected={selected}
            aria-label={`${c.name ?? c.id}: ${(c.share * 100).toFixed(1)} percent`}
            tabIndex={0}
            className="chart-point cursor-pointer"
            onClick={() => onSelect(c.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(c.id);
              }
            }}
          >
            <rect x={x(i) - step / 2} y={pad.top} width={step} height={H - pad.top} className="chart-hit" />
            <circle cx={x(i)} cy={top} r="10" className="chart-focus-ring" />
            {!selected && <text x={x(i)} y={top - 14} textAnchor="middle" className="chart-inspection fill-violet-deep font-mono" fontSize="11">{(c.share * 100).toFixed(1)}%</text>}
            {/* 90% uncertainty band */}
            <line x1={x(i)} x2={x(i)} y1={bandTop} y2={bandBottom} className={selected ? "stroke-violet" : "stroke-rule-ink"} strokeWidth="1" opacity={selected ? 0.9 : 0.5} />
            <line x1={x(i) - 5} x2={x(i) + 5} y1={bandTop} y2={bandTop} className={selected ? "stroke-violet" : "stroke-rule-ink"} strokeWidth="1" opacity={selected ? 0.9 : 0.5} />
            <line x1={x(i) - 5} x2={x(i) + 5} y1={bandBottom} y2={bandBottom} className={selected ? "stroke-violet" : "stroke-rule-ink"} strokeWidth="1" opacity={selected ? 0.9 : 0.5} />
            {/* stem */}
            <line x1={x(i)} x2={x(i)} y1={y(0)} y2={top} className={selected ? "stroke-violet-deep" : "stroke-ink"} strokeWidth={selected ? 4 : 2.5} opacity={selected ? 1 : 0.75} />
            <circle cx={x(i)} cy={top} r={selected ? 5 : 3.5} className={selected ? "fill-violet-deep" : "fill-ink"} />
            <text x={x(i)} y={H - 8} textAnchor="middle" className={selected ? "fill-violet-deep" : "fill-ink-faint"} fontSize="10" fontFamily="var(--font-mono)">
              {c.id.toUpperCase()}
            </text>
            {selected ? (
              <text x={x(i)} y={top - 12} textAnchor="middle" className="fill-violet-deep" fontSize="11" fontFamily="var(--font-mono)">
                {(c.share * 100).toFixed(1)}%
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

/* ============ Counterfactual scale (futarchy) ============ */

export function CounterfactualScale({
  pass,
  fail,
  unit,
  max,
}: {
  pass: number;
  fail: number;
  unit: string;
  max: number;
}) {
  const W = 760;
  const H = 190;
  const padL = 24;
  const padR = 24;
  const x = (v: number) => padL + (v / max) * (W - padL - padR);
  const axisY = 120;
  const ticks = 5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Counterfactual comparison on one shared scale">
      {/* shared axis */}
      <line x1={padL} x2={W - padR} y1={axisY} y2={axisY} className="stroke-ink" strokeWidth="1.5" />
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const v = (max / ticks) * i;
        return (
          <g key={i}>
            <line x1={x(v)} x2={x(v)} y1={axisY} y2={axisY + 6} className="stroke-ink" strokeWidth="1" />
            <text x={x(v)} y={axisY + 20} textAnchor="middle" className="fill-ink-faint" fontSize="10" fontFamily="var(--font-mono)">
              {v.toFixed(0)}
            </text>
          </g>
        );
      })}
      <text x={padL} y={16} textAnchor="start" className="fill-ink-faint" fontSize="10" fontFamily="var(--font-mono)">
        {unit}
      </text>

      {/* fail marker */}
      <line x1={x(fail)} x2={x(fail)} y1={axisY} y2={52} className="stroke-ink-soft" strokeWidth="1.5" />
      <g tabIndex={0} className="chart-point" role="img" aria-label={`Proposal fails: ${fail} ${unit}`}><circle cx={x(fail)} cy={52} r="18" className="chart-hit" /><circle cx={x(fail)} cy={52} r="12" className="chart-focus-ring" /><circle cx={x(fail)} cy={52} r="5" className="fill-paper stroke-ink-soft" strokeWidth="2" /><title>{`Proposal fails: ${fail} ${unit}`}</title></g>
      <text x={x(fail)} y={34} textAnchor="middle" className="fill-ink-soft" fontSize="11" fontFamily="var(--font-mono)">
        FAILS · {fail}
      </text>

      {/* pass marker */}
      <line x1={x(pass)} x2={x(pass)} y1={axisY} y2={84} className="stroke-violet-deep" strokeWidth="2" />
      <g tabIndex={0} className="chart-point" role="img" aria-label={`Proposal passes: ${pass} ${unit}`}><circle cx={x(pass)} cy={84} r="18" className="chart-hit" /><circle cx={x(pass)} cy={84} r="12" className="chart-focus-ring" /><circle cx={x(pass)} cy={84} r="6" className="fill-violet-deep" /><title>{`Proposal passes: ${pass} ${unit}`}</title></g>
      <text x={x(pass) - 12} y={88} textAnchor="end" className="fill-violet-deep" fontSize="11" fontFamily="var(--font-mono)">
        PASSES · {pass}
      </text>

      {/* difference bracket */}
      <path
        d={`M${x(fail)},${axisY - 14} L${x(fail)},${axisY - 22} L${x(pass)},${axisY - 22} L${x(pass)},${axisY - 14}`}
        fill="none"
        className="stroke-violet"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <text x={(x(fail) + x(pass)) / 2} y={axisY - 28} textAnchor="middle" className="fill-violet-deep" fontSize="12" fontFamily="var(--font-mono)">
        Δ {pass - fail > 0 ? "+" : ""}
        {pass - fail}
      </text>
    </svg>
  );
}

/* ============ Risk spectrum row ============ */

export function RiskTrack({
  estimate,
  range,
  active,
  dimmed,
}: {
  estimate: number;
  range: [number, number];
  active: boolean;
  dimmed: boolean;
}) {
  const pos = (v: number) => `${v}%`;
  return (
    <div className={cn("relative h-8 w-full transition-opacity", dimmed && "opacity-30")}>
      {/* axis */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-rule" />
      {/* uncertainty band */}
      <div
        className={cn("absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full transition-colors", active ? "bg-violet" : "bg-violet/25")}
        style={{ left: pos(range[0]), right: `${100 - range[1]}%` }}
      />
      {/* estimate dot */}
      <div
        className={cn("absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors", active ? "border-violet-deep bg-paper" : "border-ink bg-paper")}
        style={{ left: pos(estimate) }}
      />
    </div>
  );
}

/* ============ Selection frontier (opportunity) ============ */

export function FrontierChart({
  candidates,
  selectedIds,
  slots,
  onSelect,
}: {
  candidates: { id: string; name?: string; odds: number; score: number }[];
  selectedIds: string[];
  slots: number;
  onSelect?: (id: string) => void;
}) {
  const W = 720;
  const H = 420;
  const pad = 44;
  const x = (s: number) => pad + s * (W - pad - 16);
  const y = (o: number) => H - pad - o * (H - pad - 20);

  const sorted = [...candidates].sort((a, b) => b.odds - a.odds);
  const frontier = sorted.slice(0, slots);
  const threshold = frontier.length === slots ? (frontier[slots - 1]?.odds ?? 0) : 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Candidate frontier: reviewer score against selection odds">
      {/* grid */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line x1={pad} x2={W - 16} y1={y(f)} y2={y(f)} className="stroke-rule" strokeWidth="1" strokeDasharray="2 4" />
          <line x1={x(f)} x2={x(f)} y1={y(0)} y2={y(1)} className="stroke-rule" strokeWidth="1" strokeDasharray="2 4" />
        </g>
      ))}
      <text x={pad} y={16} className="fill-ink-faint" fontSize="10" fontFamily="var(--font-mono)">
        ODDS ↑ / REVIEWER SCORE →
      </text>

      {/* parity diagonal */}
      <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} className="stroke-rule-ink" strokeWidth="1" strokeDasharray="5 5" opacity="0.5" />
      <text x={x(0.62)} y={y(0.62) - 8} textAnchor="middle" transform={`rotate(-32 ${x(0.62)} ${y(0.62)})`} className="fill-ink-faint" fontSize="9" fontFamily="var(--font-mono)">
        odds = score
      </text>

      {/* frontier threshold */}
      <line x1={pad} x2={W - 16} y1={y(threshold)} y2={y(threshold)} className="stroke-violet" strokeWidth="1.5" strokeDasharray="6 4" />
      <text x={W - 16} y={y(threshold) - 8} textAnchor="end" className="fill-violet-deep" fontSize="10" fontFamily="var(--font-mono)">
        FRONTIER · {Math.round(threshold * 100)}% ODDS
      </text>

      {/* candidates */}
      {candidates.map((c) => {
        const selected = selectedIds.includes(c.id);
        const inFrontier = frontier.some((f) => f.id === c.id);
        return (
          <g key={c.id} className="chart-point cursor-pointer" tabIndex={0} role={onSelect ? "button" : "img"} aria-pressed={onSelect ? selected : undefined} aria-label={`${c.name ?? c.id}: ${Math.round(c.odds * 100)}% selection odds, reviewer score ${Math.round(c.score * 100)}${onSelect ? ", toggle shortlist" : ""}`} onClick={() => onSelect?.(c.id)} onKeyDown={event => {
            if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect?.(c.id); }
          }}>
            <circle cx={x(c.score)} cy={y(c.odds)} r="18" className="chart-hit" />
            <circle cx={x(c.score)} cy={y(c.odds)} r="12" className="chart-focus-ring" />
            <text x={Math.max(95, Math.min(W - 95, x(c.score)))} y={y(c.odds) + 28} textAnchor="middle" className="chart-inspection fill-violet-deep font-sans" fontSize="12">{c.name ?? c.id} · {Math.round(c.odds * 100)}%</text>
            <circle
              cx={x(c.score)}
              cy={y(c.odds)}
              r={selected ? 7 : inFrontier ? 5.5 : 4.5}
              className={selected ? "fill-violet-deep" : inFrontier ? "fill-violet/40 stroke-violet-deep" : "fill-ink/60"}
              strokeWidth={inFrontier && !selected ? 1.5 : 0}
            />
            {selected ? (
              <text x={x(c.score)} y={y(c.odds) - 12} textAnchor="middle" className="fill-violet-deep" fontSize="10" fontFamily="var(--font-mono)">
                SHORTLISTED
              </text>
            ) : null}
          </g>
        );
      })}

      {/* axis labels */}
      <text x={pad} y={H - 12} className="fill-ink-faint" fontSize="10" fontFamily="var(--font-mono)">
        0
      </text>
      <text x={W - 16} y={H - 12} textAnchor="end" className="fill-ink-faint" fontSize="10" fontFamily="var(--font-mono)">
        1.0 SCORE
      </text>
      <text x={pad - 6} y={y(1) + 4} textAnchor="end" className="fill-ink-faint" fontSize="10" fontFamily="var(--font-mono)">
        100%
      </text>
      <text x={pad - 6} y={y(0) + 4} textAnchor="end" className="fill-ink-faint" fontSize="10" fontFamily="var(--font-mono)">
        0%
      </text>
    </svg>
  );
}

/* ============ Odds strip (1-D distribution of selection odds) ============ */

export function OddsStrip({
  odds,
  selectedIds,
  ids,
}: {
  odds: number[];
  selectedIds: string[];
  ids: string[];
}) {
  return (
    <div className="relative h-10 w-full">
      <div className="absolute inset-x-0 top-1/2 h-px bg-rule" />
      {odds.map((o, i) => {
        const sel = typeof ids[i] === "string" && selectedIds.includes(ids[i]);
        return (
          <div
            key={i}
            className={cn("absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border transition-colors", sel ? "border-violet-deep bg-violet-deep" : "border-ink/50 bg-paper")}
            style={{ left: `${o * 100}%` }}
          />
        );
      })}
    </div>
  );
}

/* ============ Forecast comparison dots (deep) ============ */

export function ForecastTriple({
  market,
  reviewerModel,
  communityPoll,
}: {
  market: number;
  reviewerModel: number;
  communityPoll: number;
}) {
  const max = Math.max(market, reviewerModel, communityPoll, 0.06);
  const rows: [string, number, string][] = [
    ["Market", market, "bg-violet-deep"],
    ["Reviewer model", reviewerModel, "bg-ink"],
    ["Community poll", communityPoll, "bg-ink/40"],
  ];
  return (
    <div className="space-y-1.5">
      {rows.map(([label, v, dot]) => (
        <div key={label} className="flex items-center gap-2">
          <span className="eyebrow w-24 shrink-0 text-ink-faint">{label}</span>
          <div className="relative h-1 w-full bg-lavender-soft">
            <div className={cn("absolute inset-y-0 left-0", dot)} style={{ width: `${(v / max) * 100}%` }} />
          </div>
          <span className="figures w-12 shrink-0 text-right text-ink">{(v * 100).toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
}
