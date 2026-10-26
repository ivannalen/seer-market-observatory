import { useState } from "react";
import { ExternalLink, Power, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { riskBand, type RiskReport } from "@/lib/defi-risk";

export const usd = (value: number | null) => value === null ? "Unknown" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
export const utcDate = (value: string) => `${value.replace("T", " ").slice(0, 19)} UTC`;

export function AnalysisInstrument({ report, loading, onExplore, protocolName }: { report: RiskReport | null; loading: boolean; onExplore: () => void; protocolName?: string | undefined }) {
  const [powered, setPowered] = useState(true);
  const [coverage, setCoverage] = useState(false);
  const displayed = !powered || loading ? null : coverage && report ? report.coverage : report?.overall ?? null;
  return <div className="risk-device-instrument">
    <div className="risk-device" data-powered={powered}>
      <div className="risk-device-probe" aria-hidden="true"><span /><span /><span /><span /><span /></div>
      <div className="risk-device-body">
        <div className="risk-device-brand"><span className="font-display text-xl">Seer<span className="text-violet">.</span></span><span className="max-w-[50%] truncate font-mono text-[9px] uppercase text-ink-faint">{protocolName ?? "R / 02"}</span></div>
        <Button variant="ghost" className="risk-device-screen" disabled={!powered || !report || loading} onClick={onExplore} aria-label="Inspect risk analysis report">
          <span className="risk-device-screen-top"><span>RISKOMETER</span><span>{powered ? "EVIDENCE" : "OFF"}</span></span>
          <span className="risk-device-digits">{!powered ? "— —" : loading ? "…" : coverage && report ? report.coverage : report?.overall ?? "— —"}{powered && (coverage || report?.overall !== null) && report && <span className="risk-device-unit">{coverage ? "%" : "/100"}</span>}</span>
          <span className="risk-device-screen-bottom">{!powered ? "STANDBY" : loading ? "ANALYZING" : coverage ? "EVIDENCE COVERAGE" : report ? report.overall === null ? "INSUFFICIENT DATA" : `${riskBand(report.overall)} INDICATED RISK` : "AWAITING ANALYSIS"}</span>
          {powered && report && !loading && <span className="risk-device-screen-hint">Inspect evidence</span>}
        </Button>
        <div className="risk-device-buttons">
          <span className="risk-device-button-cell"><Button variant="ghost" size="icon" className="risk-device-power" title="Power" aria-label={powered ? "Turn analysis device off" : "Turn analysis device on"} aria-pressed={powered} onClick={() => setPowered(p => !p)}><Power /></Button><span className="risk-device-button-label">Power</span></span>
          <span className="risk-device-button-cell"><Button variant="ghost" size="icon" className="risk-device-mode" title="Score / coverage" aria-label="Show evidence coverage" disabled={!powered} aria-pressed={coverage} onClick={() => setCoverage(c => !c)}><SlidersHorizontal /></Button><span className="risk-device-button-label">Coverage</span></span>
        </div>
        <div className="risk-device-footer"><span className="risk-device-led" data-on={powered} /><span>MODEL ESTIMATE · NOT A MARKET PRICE</span></div>
      </div>
    </div>
    <div className="risk-device-scale" role="img" aria-label={displayed === null ? "Indicated risk scale from 0 lower to 100 higher; no reading shown" : `Indicated risk scale from 0 lower to 100 higher; current reading ${displayed}`}>
      <svg viewBox="0 0 500 64" aria-hidden="true"><line x1="20" x2="480" y1="25" y2="25" className="stroke-rule-ink" />{displayed !== null && <rect x="20" y="21" width="460" height="8" rx="4" className="risk-device-fill" style={{ transform: `scaleX(${displayed / 100})` }} />}{[0, 25, 50, 75, 100].map(v => <g key={v}><line x1={20 + v * 4.6} x2={20 + v * 4.6} y1="25" y2="36" className="stroke-rule-ink" /><text x={20 + v * 4.6} y="52" textAnchor="middle" className="fill-ink-faint font-mono text-[11px]">{v}</text></g>)}{displayed !== null && <path d={`M${15 + displayed * 4.6} 2 h10 l-5 8 Z`} className="risk-marker fill-violet-deep" />}</svg>
      <div className="flex justify-between text-[10px] font-mono text-ink-faint"><span>LOWER INDICATED RISK</span><span>HIGHER INDICATED RISK</span></div>
    </div>
  </div>;
}

function TvlChart({ report }: { report: RiskReport }) {
  const [inspected, setInspected] = useState<number | null>(null);
  const { history } = report;
  if (history.length < 2) return <p className="py-6 text-sm text-ink-faint">Insufficient historical TVL observations.</p>;
  const max = Math.max(...history.map(p => p.totalLiquidityUSD), 1);
  const first = history[0], last = history.at(-1);
  if (!first || !last) return null;
  const x = (date: number) => 15 + (date - first.date) / Math.max(1, last.date - first.date) * 470;
  const y = (value: number) => 150 - value / max * 120;
  const selected = inspected === null ? last : history[inspected] ?? last;
  return <figure>
    <figcaption className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-ink-faint"><span>{new Date(first.date * 1000).toISOString().slice(0, 10)} — {new Date(last.date * 1000).toISOString().slice(0, 10)} · UTC</span><span>USD · DeFiLlama observations</span></figcaption>
    <svg viewBox="0 0 500 180" className="mt-3 w-full" role="img" aria-label={`${report.name} historical TVL, ${history.length} actual observations`}>
      {[30, 90, 150].map(v => <line key={v} x1="15" x2="485" y1={v} y2={v} className="stroke-rule" strokeDasharray="3 4" />)}
      <path d={history.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.date)},${y(p.totalLiquidityUSD)}`).join(" ")} className="fill-none stroke-violet-deep" strokeWidth="2" />
      {history.map((p, i) => <g key={p.date} role="img" tabIndex={0} aria-label={`${new Date(p.date * 1000).toISOString().slice(0, 10)}: ${usd(p.totalLiquidityUSD)}`} className="chart-point" onPointerEnter={() => setInspected(i)} onPointerLeave={() => setInspected(null)} onFocus={() => setInspected(i)} onBlur={() => setInspected(null)} onKeyDown={e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); const next = Math.min(history.length - 1, Math.max(0, i + (e.key === "ArrowRight" ? 1 : -1))); const sibling = e.currentTarget.parentElement?.querySelectorAll<SVGGElement>(".chart-point")[next]; sibling?.focus(); } }}><circle cx={x(p.date)} cy={y(p.totalLiquidityUSD)} r="12" className="chart-hit" /><circle cx={x(p.date)} cy={y(p.totalLiquidityUSD)} r="6" className="chart-focus-ring" /><circle cx={x(p.date)} cy={y(p.totalLiquidityUSD)} r="2" className="fill-violet-deep" /></g>)}
    </svg>
    <p aria-live="polite" className="min-h-5 font-mono text-xs text-violet-deep">{new Date(selected.date * 1000).toISOString().slice(0, 10)} · {usd(selected.totalLiquidityUSD)}</p>
    <details className="mt-3 text-sm text-ink-soft"><summary className="cursor-pointer">Inspect observations</summary><div className="mt-3 max-h-60 overflow-y-auto"><table className="w-full text-left text-xs"><thead><tr><th className="py-2">Date (UTC)</th><th>TVL (USD)</th></tr></thead><tbody>{history.map(p => <tr key={p.date} className="border-t border-rule"><td className="py-2">{new Date(p.date * 1000).toISOString().slice(0, 10)}</td><td className="font-mono">{p.totalLiquidityUSD}</td></tr>)}</tbody></table></div></details>
  </figure>;
}

export function AnalysisReport({ report }: { report: RiskReport }) {
  return <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
    <header className="flex flex-wrap justify-between gap-4 border-b border-rule pb-5"><div><h2 className="font-display text-3xl">{report.name} / Analysis</h2><p className="mt-2 text-xs text-ink-faint">{report.chain === "all" ? "All supported chains" : report.chain} · {report.category}</p></div><div className="text-xs text-ink-faint"><p>Retrieved {utcDate(report.retrievedAt)}</p><a href={report.source} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-violet-deep">Inspect DeFiLlama response <ExternalLink className="size-3" /></a></div></header>
    <section className="border-b border-rule py-5"><h3 className="eyebrow text-violet-deep">Protocol overview</h3>{report.description ? <p className="mt-3 max-w-3xl text-sm text-ink-soft">{report.description}</p> : <p className="mt-3 text-sm text-ink-faint">No protocol description was supplied by the data source.</p>}{report.url && <a href={report.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-violet-deep">Protocol website <ExternalLink className="size-3" /></a>}<p className="mt-2 text-xs text-ink-faint">Description as supplied by DeFiLlama; not independently verified.</p></section>
    <div className="grid gap-x-12 gap-y-8 py-7 md:grid-cols-2">
      <section><h3 className="eyebrow text-violet-deep">01 / Indicated risk</h3><p className="mt-3 font-mono text-3xl">{report.overall === null ? "Insufficient data" : `${report.overall} / 100 · ${riskBand(report.overall)}`}</p><p className="mt-3 text-sm text-ink-soft">{report.coverage}% weighted evidence coverage · confidence not calibrated.</p><p className="mt-3 text-sm text-ink-faint">TVL and token composition alone cannot establish overall protocol risk. Unavailable factors are not scored as zero.</p><dl className="mt-5 space-y-3 text-sm"><div className="flex flex-wrap justify-between gap-2"><dt>Latest reported TVL</dt><dd data-testid="reported-tvl" data-value={report.currentTvl ?? "unknown"} className="font-mono">{usd(report.currentTvl)}</dd></div><div className="flex justify-between gap-2"><dt>Observed 30-day change</dt><dd className="font-mono">{report.change30d === null ? "Unknown" : `${report.change30d.toFixed(2)}%`}</dd></div></dl></section>
      <section><h3 className="eyebrow text-violet-deep">02 / Historical TVL · up to 90 days</h3><TvlChart key={`${report.slug}-${report.chain}-${report.retrievedAt}`} report={report} /></section>
    </div>
    <section className="border-t border-rule pt-6"><h3 className="font-display text-2xl">Risk factors</h3>{report.factors.map(f => <details key={f.id} className="border-b border-rule py-4"><summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 text-sm"><span>{f.name} <span className="ml-2 text-xs text-ink-faint">{f.kind} · {f.weight}% weight</span></span><span className="font-mono text-violet-deep">{f.score === null ? "Unknown / insufficient data" : `${riskBand(f.score)} · ${f.score}/100`}</span></summary><div className="mt-4 grid gap-4 text-sm text-ink-soft sm:grid-cols-2"><div><p className="text-ink">{f.assessment}</p><p className="mt-2">{f.evidence}</p><p className="mt-2 text-xs text-ink-faint">Source: DeFiLlama response · evidence date: {f.date ? utcDate(f.date) : "Not established"}</p></div><div><p>{f.why}</p><p className="mt-3"><span className="text-ink">Investigate: </span>{f.next}</p></div></div></details>)}</section>
    <section className="mt-7"><h3 className="font-display text-2xl">Key findings</h3><ul className="mt-4 space-y-3 text-sm text-ink-soft">{report.findings.map(f => <li key={f} className="border-l-2 border-violet pl-3">{f}</li>)}</ul></section>
    <section className="mt-7 border-t border-rule pt-6"><h3 className="font-display text-2xl">Conclusion · what to investigate next</h3><p className="mt-3 text-sm text-ink-soft">{report.overall === null ? `Evidence covers ${report.coverage}% of the model's weight, so no overall score is shown. The measured factors above stand on their own; the gaps below are what to resolve before treating any reading as reliable.` : `The indicated score of ${report.overall}/100 rests on ${report.coverage}% weighted evidence coverage and is experimental. It is not a safety rating, and a low score does not mean the protocol is safe.`}</p><ul className="mt-4 space-y-3 text-sm text-ink-soft">{report.factors.map(f => <li key={f.id} className="border-l-2 border-violet pl-3"><span className="text-ink">{f.name}: </span>{f.next}</li>)}</ul></section>
    <details className="mt-6 border-t border-rule pt-4 text-sm text-ink-soft"><summary className="cursor-pointer text-violet-deep">Scoring methodology · version 1</summary><div className="mt-4 space-y-3"><p>0 means lower indicated risk; 100 means higher. Bands: Low 0–24, Moderate 25–49, Elevated 50–74, High 75–100. These research heuristics are not probabilities, market-implied readings or validated security ratings.</p><p>Weights: exit liquidity 20%, TVL trend 20%, TVL stability 15%, deposited asset concentration 15%, security evidence 20%, oracle/liquidation dependencies 10%. Overall score requires at least 70% weighted coverage, three scored factors, and scored liquidity or security evidence. Otherwise it is withheld; no missing values are imputed.</p><p>Trend = clamp(−30-day percentage change × 2, 0, 100). Stability = clamp(daily-equivalent percentage-return standard deviation × 10, 0, 100), using at least 20 returns, excluding gaps over two days. Concentration = largest token USD share, only if timely token data reconciles within 80–120% of TVL. Overall = weighted mean of available scores only after the coverage gate.</p><p>Baseline uses the latest observation at or before 30 days before the endpoint, within two days. Scoring requires the latest TVL observation within three days of retrieval. USD price changes, data gaps, stale adapters and double-counting conventions can distort TVL. No causal interpretation is asserted.</p><p>Liquidity, security and dependency evidence from this API alone is not sufficient for scoring. Audit references are leads, not reviewed audits. No claim that missing incident evidence implies safety.</p></div></details>
    <details className="mt-4 text-sm text-ink-soft"><summary className="cursor-pointer text-violet-deep">Audit references & limitations</summary><ul className="mt-3 space-y-2">{report.auditLinks.map(url => <li key={url}><a href={url} target="_blank" rel="noreferrer" className="break-all text-violet-deep">{url} ↗</a></li>)}</ul><p className="mt-3">References were supplied by DeFiLlama, not independently verified; audit dates, scope, incidents, executable exit liquidity and current oracle configuration are unknown. No AI-generated evidence is used. Nothing here is an audit, safety guarantee or financial advice.</p></details>
  </div>;
}