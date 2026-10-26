import { z } from "zod";

export const API_ROOT = "https://api.llama.fi";
const observation = z.object({ date: z.number().finite(), totalLiquidityUSD: z.number().finite().nonnegative() });
const tokenObservation = z.object({ date: z.number(), tokens: z.record(z.number().finite()) });
export const protocolSchema = z.object({
  name: z.string(), category: z.string().optional(), chains: z.array(z.string()).default([]),
  tvl: z.array(observation).default([]),
  chainTvls: z.record(z.object({ tvl: z.array(observation).default([]), tokensInUsd: z.array(tokenObservation).default([]) })).default({}),
  tokensInUsd: z.array(tokenObservation).default([]), audit_links: z.array(z.string()).default([]),
  description: z.string().optional(), url: z.string().optional(),
  currentChainTvls: z.record(z.number().finite()).default({}),
});
const listingSchema = z.array(z.object({ name: z.string(), slug: z.string(), category: z.string().optional(), chains: z.array(z.string()).default([]) }));
export type ProtocolListing = z.infer<typeof listingSchema>[number];
export type ProtocolEvidence = z.infer<typeof protocolSchema>;
export type Observation = z.infer<typeof observation>;
export type Factor = { id: string; name: string; weight: number; score: number | null; assessment: string; evidence: string; date: string | null; why: string; next: string; kind: "Measured" | "Qualitative" | "Unknown" };
export type RiskReport = ReturnType<typeof analyzeProtocol>;

export async function fetchLlama(path: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(`${API_ROOT}${path}`, { signal: signal ?? AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`DeFiLlama request failed (${response.status}). No demo data was substituted.`);
  return response.json();
}
export async function fetchProtocols(signal?: AbortSignal) { return listingSchema.parse(await fetchLlama("/protocols", signal)); }
export async function fetchProtocol(slug: string, signal?: AbortSignal) {
  return protocolSchema.parse(await fetchLlama(`/protocol/${encodeURIComponent(slug)}`, signal));
}
export function percentChange(start: number, end: number) { return start > 0 ? (end / start - 1) * 100 : null; }
export function riskBand(score: number | null) { return score === null ? "Unknown" : score < 25 ? "Low" : score < 50 ? "Moderate" : score < 75 ? "Elevated" : "High"; }
export function evidenceScore(factors: Factor[]) {
  const measured = factors.filter(f => f.score !== null);
  const coverage = measured.reduce((sum, f) => sum + f.weight, 0);
  // Security or actual liquidity evidence is required; TVL alone cannot establish overall risk.
  const sufficient = coverage >= 70 && measured.length >= 3 && measured.some(f => f.id === "security" || f.id === "liquidity");
  return { coverage, overall: sufficient ? Math.round(measured.reduce((sum, f) => sum + (f.score ?? 0) * f.weight, 0) / coverage) : null };
}
export function analyzeProtocol(raw: ProtocolEvidence, slug: string, chain: string, retrievedAt: string): {
  name: string; slug: string; chain: string; category: string; retrievedAt: string; source: string;
  description: string | null; url: string | null;
  history: Observation[]; currentTvl: number | null; change24h: number | null; change7d: number | null; change30d: number | null; volatility: number | null;
  chainDistribution: { chain: string; tvl: number; share: number }[];
  factors: Factor[]; coverage: number; overall: number | null; auditLinks: string[]; findings: string[];
} {
  if (chain !== "all" && !raw.chains.includes(chain)) throw new Error("This blockchain is not supported by the protocol.");
  const full = (chain === "all" ? raw.tvl : raw.chainTvls[chain]?.tvl ?? [])
    .filter(p => p.date > 0 && p.date * 1000 <= Date.parse(retrievedAt) + 86400000)
    .sort((a, b) => a.date - b.date).filter((p, i, arr) => i === arr.length - 1 || p.date !== arr[i + 1]?.date);
  const last = full.at(-1);
  const cutoff = (last?.date ?? 0) - 30 * 86400;
  const start = full.filter(p => p.date <= cutoff).at(-1);
  const history = full.filter(p => p.date >= (last?.date ?? 0) - 90 * 86400);
  const window = full.filter(p => p.date >= cutoff);
  const date = last ? new Date(last.date * 1000).toISOString() : null;
  const fresh = last ? Date.parse(retrievedAt) - last.date * 1000 <= 3 * 86400000 : false;
  const change30d = start && last && cutoff - start.date <= 2 * 86400 ? percentChange(start.totalLiquidityUSD, last.totalLiquidityUSD) : null;
  const changeOver = (days: number) => {
    const point = last ? full.filter(p => p.date <= last.date - days * 86400).at(-1) : undefined;
    return point && last && last.date - days * 86400 - point.date <= 2 * 86400 ? percentChange(point.totalLiquidityUSD, last.totalLiquidityUSD) : null;
  };
  const change24h = changeOver(1);
  const change7d = changeOver(7);
  const chainEntries = Object.entries(raw.currentChainTvls).filter(([name, value]) => value > 0 && raw.chains.includes(name));
  const chainTotal = chainEntries.reduce((sum, [, value]) => sum + value, 0);
  const chainDistribution = (chain === "all" && chainTotal > 0 ? chainEntries : []).map(([name, value]) => ({ chain: name, tvl: value, share: value / chainTotal * 100 })).sort((a, b) => b.tvl - a.tvl);
  const returns = window.slice(1).flatMap((p, i) => {
    const previous = window[i];
    if (!previous || p.date - previous.date > 2 * 86400) return [];
    const change = percentChange(previous.totalLiquidityUSD, p.totalLiquidityUSD);
    return change === null ? [] : [change / Math.sqrt((p.date - previous.date) / 86400)];
  });
  const mean = returns.reduce((a, b) => a + b, 0) / Math.max(returns.length, 1);
  const volatility = returns.length >= 20 ? Math.sqrt(returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length) : null;
  const tokens = (chain === "all" ? raw.tokensInUsd : raw.chainTvls[chain]?.tokensInUsd ?? []).slice().sort((a, b) => a.date - b.date).at(-1);
  const values = Object.values(tokens?.tokens ?? {});
  const sum = values.reduce((a, b) => a + b, 0);
  const tokenUsable = Boolean(tokens && last && fresh && values.every(value => value >= 0) && Math.abs(tokens.date - last.date) <= 2 * 86400 && last.totalLiquidityUSD > 0 && sum / last.totalLiquidityUSD >= .8 && sum / last.totalLiquidityUSD <= 1.2);
  const concentration = tokenUsable && sum > 0 ? Math.max(...values) / sum * 100 : null;
  const unknown = (id: string, name: string, weight: number, evidence: string, why: string, next: string): Factor => ({ id, name, weight, score: null, assessment: "Unknown", evidence, date: null, why, next, kind: "Unknown" });
  const factors: Factor[] = [
    unknown("liquidity", "Available liquidity", 20, "TVL measures deposited value, not exit liquidity. Pool depth, utilization and slippage were not retrieved.", "Exits can become costly when available liquidity is thin.", "Inspect pool depth, utilization and withdrawal constraints."),
    { id: "trend", name: "TVL trend", weight: 20, score: fresh && change30d !== null ? Math.round(Math.min(100, Math.max(0, -change30d * 2))) : null, assessment: change30d === null ? "Insufficient data" : `${change30d.toFixed(2)}% over observed 30-day window`, evidence: start && last ? `DeFiLlama TVL: ${start.totalLiquidityUSD} USD (${new Date(start.date * 1000).toISOString().slice(0, 10)}) → ${last.totalLiquidityUSD} USD (${date?.slice(0, 10)}). ${fresh ? "" : "Stale observation; excluded from scoring."}` : "No usable 30-day baseline.", date, why: "Falling TVL can indicate withdrawals or asset price declines; it does not establish their cause.", next: "Separate token-price effects from net deposits and withdrawals.", kind: change30d === null ? "Unknown" : "Measured" },
    { id: "stability", name: "TVL stability", weight: 15, score: fresh && volatility !== null ? Math.round(Math.min(100, volatility * 10)) : null, assessment: volatility === null ? "Insufficient data" : `${volatility.toFixed(2)}% daily-equivalent volatility`, evidence: `${returns.length} usable changes in the observed 30-day window. ${fresh ? "" : "Stale observation; excluded from scoring."}`, date, why: "Variation in deposited value can reflect price moves, withdrawals or reporting changes.", next: "Investigate large moves and the underlying adapter methodology.", kind: volatility === null ? "Unknown" : "Measured" },
    { id: "concentration", name: "Deposited asset concentration", weight: 15, score: concentration === null ? null : Math.round(concentration), assessment: concentration === null ? "Unknown" : `${concentration.toFixed(2)}% in the largest reported token`, evidence: concentration === null ? "No timely token breakdown reconciling within 80–120% of TVL. Collateral concentration is not inferred." : `Largest token share of ${values.length} reported assets; breakdown sums to ${sum} USD. This is deposited asset composition, not collateral exposure.`, date: tokenUsable && tokens ? new Date(tokens.date * 1000).toISOString() : null, why: "Dependence on one deposited asset can amplify asset-specific shocks.", next: "Check token identity, collateral rules and exposure beyond this breakdown.", kind: concentration === null ? "Unknown" : "Measured" },
    { ...unknown("security", "Smart contract security", 20, raw.audit_links.length ? `${raw.audit_links.length} audit reference(s) supplied by DeFiLlama; scope, dates and deployed-code coverage have not been reviewed. Incident completeness is unknown.` : "No audit evidence retrieved. Incident history is unknown, not incident-free.", "Audit scope and unresolved findings matter more than an audit count.", "Review original audits, deployments, remediation and incident records."), kind: raw.audit_links.length ? "Qualitative" : "Unknown" },
    unknown("dependencies", "Oracle & liquidation dependencies", 10, "No validated configuration or stress evidence retrieved.", "Oracle failures and liquidation constraints can transmit losses.", "Inspect current oracle configuration, liquidation thresholds and stress tests."),
  ];
  const { coverage, overall } = evidenceScore(factors);
  const findings = [last ? `Latest reported TVL is ${last.totalLiquidityUSD} USD on ${date?.slice(0, 10)} (${chain === "all" ? "all chains" : chain}).` : "No TVL observations available for this scope.", ...factors.filter(f => f.kind === "Measured").map(f => `${f.name}: ${f.assessment}.`), `Overall risk score ${overall === null ? "withheld: insufficient independently supported evidence" : `${overall}/100`}.`];
  return { name: raw.name, slug, chain, category: raw.category ?? "DeFi", retrievedAt, source: `${API_ROOT}/protocol/${encodeURIComponent(slug)}`, description: raw.description ?? null, url: raw.url?.startsWith("https://") ? raw.url : null, history, currentTvl: last?.totalLiquidityUSD ?? null, change24h, change7d, change30d, volatility, chainDistribution, factors, coverage, overall, auditLinks: raw.audit_links.filter(url => url.startsWith("https://")), findings };
}