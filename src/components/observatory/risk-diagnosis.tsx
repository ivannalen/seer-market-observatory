import { Signature } from "@/components/observatory/charts";
import { Eyebrow } from "@/components/observatory/chrome";
import { riskHistory, riskMovement } from "@/components/observatory/riskometer-data";
import type { RiskProtocol } from "@/data/seer";

export function RiskHistory({ protocol }: { protocol: RiskProtocol }) {
  const history = riskHistory(protocol);
  const movement = riskMovement(protocol);
  const points = history.map((h, i) => `${i === 0 ? "M" : "L"}${25 + i * 450 / Math.max(history.length - 1, 1)},${145 - h.estimate * 1.2}`).join(" ");
  return (
    <div>
      <div className="mt-4 flex justify-between gap-3 text-sm text-ink-soft"><span>Jan–Dec 2025 · illustrative</span><span className="figures text-violet-deep">{movement > 0 ? "+" : ""}{movement} pts</span></div>
      <svg viewBox="0 0 510 175" className="mt-3 w-full" role="img" aria-label={`${protocol.name} illustrative history from ${history[0]?.label} to ${history.at(-1)?.label}: ${history.map(h => `${h.label}: ${h.estimate}`).join(", ")}`}>
        {[0, 50, 100].map(v => <g key={v}><line x1="25" x2="475" y1={145 - v * 1.2} y2={145 - v * 1.2} className="stroke-rule" strokeDasharray="3 4" /><text x="503" y={149 - v * 1.2} textAnchor="end" className="fill-ink-faint font-mono text-[10px]">{v}</text></g>)}
        <path d={points} className="fill-none stroke-violet-deep" strokeWidth="2" />
        {history.map((h, i) => <circle key={h.date} cx={25 + i * 450 / Math.max(history.length - 1, 1)} cy={145 - h.estimate * 1.2} r="3" className="fill-violet-deep"><title>{`${h.label}: ${h.estimate}`}</title></circle>)}
        <text x="25" y="170" className="fill-ink-faint font-mono text-[11px]">Jan 2025</text><text x="475" y="170" textAnchor="end" className="fill-ink-faint font-mono text-[11px]">Dec 2025</text>
      </svg>
      <details className="mt-2 text-sm text-ink-soft"><summary className="cursor-pointer text-violet-deep">Monthly readings</summary><dl className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">{history.map(h => <div key={h.date}><dt className="text-xs">{h.label}</dt><dd className="figures text-ink">{h.estimate}</dd></div>)}</dl></details>
    </div>
  );
}

export function RiskDiagnosis({ protocol }: { protocol: RiskProtocol }) {
  return (
    <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
      <section><Eyebrow className="text-violet-deep">01 / Market reading</Eyebrow><p className="mt-4 font-display text-3xl text-ink">{protocol.estimate} <span className="text-ink-faint">/ 100</span></p><p className="mt-3 text-sm leading-relaxed text-ink-soft">An illustrative market-implied risk index, not a probability of failure. Higher means more risk priced.</p><details className="mt-3 text-sm text-ink-soft"><summary className="cursor-pointer text-violet-deep">How to use this signal</summary><p className="mt-2">Seekers can compare exposures; traders put capital behind forecasts. This demo has no real trades, resolution rule or verified market feed.</p></details></section>
      <section><Eyebrow className="text-violet-deep">02 / What’s driving it</Eyebrow><p className="mt-3 text-xs text-ink-faint">Source: local illustrative dataset · no verified sources supplied.</p><ul className="mt-3 space-y-2">{protocol.estimates.map(e => <li key={e} className="border-l-2 border-violet pl-3 text-sm text-ink-soft"><span className="block text-xs text-violet-deep">Market interpretation · sample</span>{e}</li>)}</ul><details className="mt-4 text-sm text-ink-soft"><summary className="cursor-pointer text-violet-deep">Protocol claims & evidence</summary><ul className="mt-3 space-y-2">{protocol.facts.map(f => <li key={f} className="border-l-2 border-fact pl-3"><span className="block text-xs text-ink-faint">Illustrative claim · unverified · source unavailable</span>{f}</li>)}</ul></details></section>
      <section><Eyebrow className="text-violet-deep">03 / Uncertainty</Eyebrow><p className="mt-4 font-display text-3xl text-ink">{protocol.range[0]}–{protocol.range[1]} <span className="text-lg text-ink-soft">estimated range</span></p><p className="mt-3 text-sm leading-relaxed text-ink-soft">A span of {protocol.range[1] - protocol.range[0]} points. Missing evidence and changing assumptions can shift the reading.</p><details className="mt-3 text-sm text-ink-soft"><summary className="cursor-pointer text-violet-deep">Why it could be wrong</summary><p className="mt-2">Market consensus can be mistaken. No confidence level, liquidity or calibration is verified for this illustrative range.</p></details></section>
      <section><Eyebrow className="text-violet-deep">04 / History</Eyebrow><RiskHistory protocol={protocol} /></section>
      <p className="border-t border-rule pt-4 text-xs text-ink-faint md:col-span-2">Illustrative data only. Not a security rating, audit, vulnerability scan or guarantee of safety.</p>
    </div>
  );
}

export function RiskComparisonRow({ protocol }: { protocol: RiskProtocol }) {
  const movement = riskMovement(protocol);
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-rule py-4 sm:grid-cols-[1fr_5rem_7rem_7rem]">
      <div className="min-w-0"><p className="text-sm text-ink">{protocol.name}</p><p className="text-xs text-ink-faint">{protocol.category}</p></div>
      <div className="figures text-violet-deep">{protocol.estimate}<span className="text-xs text-ink-faint"> /100</span></div>
      <div className="figures text-ink-soft"><span className="text-xs sm:hidden">Range </span>{protocol.range[0]}–{protocol.range[1]}</div>
      <div className="flex items-center gap-2 text-violet-deep"><Signature data={protocol.history} width={60} height={22} /><span className="figures text-xs">{movement > 0 ? "+" : ""}{movement}</span></div>
    </div>
  );
}