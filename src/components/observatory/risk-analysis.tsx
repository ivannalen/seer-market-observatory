import { useRef, useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { LoaderCircle, RefreshCw, Search, GitCompareArrows, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { analyzeProtocol, fetchProtocol, fetchProtocols, type ProtocolEvidence, type RiskReport } from "@/lib/defi-risk";
import { AnalysisInstrument, AnalysisReport, usd, utcDate } from "./risk-analysis-report";

export const protocolListOptions = queryOptions({
  queryKey: ["defillama-protocols"],
  queryFn: async () => {
    try { return { protocols: await fetchProtocols(), error: null }; }
    catch { return { protocols: [], error: "DeFiLlama’s protocol directory is unavailable. Retry to search protocols; no demo data was substituted." }; }
  }, staleTime: 5 * 60 * 1000,
});

export function RiskAnalysis() {
  const { data, refetch, isFetching } = useSuspenseQuery(protocolListOptions);
  const [slug, setSlug] = useState("aave-v3");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [chain, setChain] = useState("all");
  const [evidence, setEvidence] = useState<ProtocolEvidence | null>(null);
  const [report, setReport] = useState<RiskReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<RiskReport[]>([]);
  const [compare, setCompare] = useState(false);
  const request = useRef(0);
  const selected = data.protocols.find(p => p.slug === slug);
  const matches = data.protocols.filter(p => `${p.name} ${p.category ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 60);
  const chains = selected?.chains ?? evidence?.chains ?? [];
  const inspect = () => document.getElementById("real-risk-report")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  const invalidate = () => { request.current += 1; setLoading(false); setReport(null); setError(null); };
  const run = async () => {
    const id = ++request.current;
    setLoading(true); setError(null); setReport(null);
    try {
      const raw = await fetchProtocol(slug);
      if (id !== request.current) return;
      const result = analyzeProtocol(raw, slug, chain, new Date().toISOString());
      setEvidence(raw); setReport(result);
    } catch (e) {
      if (id === request.current) setError(e instanceof Error && !e.message.includes("[") ? e.message : "The protocol response could not be analyzed. Try again; no sample data was substituted.");
    } finally { if (id === request.current) setLoading(false); }
  };
  const addComparison = () => {
    if (!report || report.history.length < 2 || report.currentTvl === null) return;
    setSaved(previous => [...previous.filter(p => p.slug !== report.slug || p.chain !== report.chain), report]);
    setCompare(true);
  };
  const commonStart = Math.max(...saved.map(p => p.history[0]?.date ?? 0));
  const commonEnd = Math.min(...saved.map(p => p.history.at(-1)?.date ?? 0));
  const commonDates = saved.length >= 2 ? saved[0]?.history.map(p => p.date).filter(date => date >= commonStart && date <= commonEnd && saved.every(r => r.history.some(p => p.date === date))) ?? [] : [];
  const startDate = commonDates[0], endDate = commonDates.at(-1);
  return <>
    <section aria-label="Real protocol analysis" className="riskometer-stage mx-auto grid max-w-5xl items-center px-4 sm:px-8 md:grid-cols-2">
      <div className="riskometer-controls min-w-0">
        <label className="eyebrow text-ink-faint">01 / DeFi protocol</label>
        <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button variant="ghost" disabled={data.protocols.length === 0} className="mt-3 h-auto w-full justify-between whitespace-normal rounded-none border-b border-ink px-0 py-3 text-left" aria-label="Select real DeFi protocol"><span><span className="block font-display text-3xl">{selected?.name ?? "Aave V3"}</span><span className="mt-2 block text-xs font-normal text-ink-faint">{selected?.category ?? "DeFi"} · DeFiLlama</span></span><span className="ml-2 inline-flex items-center gap-1 text-xs text-violet-deep"><Search className="size-4" /> Change</span></Button></PopoverTrigger><PopoverContent align="start" className="w-[min(380px,calc(100vw-32px))] p-2"><Input aria-label="Search real protocols" placeholder="Search protocol or category…" value={query} onChange={e => setQuery(e.target.value)} /><div className="mt-2 max-h-72 overflow-y-auto">{matches.map(p => <Button key={p.slug} variant="ghost" className="h-auto min-h-12 w-full justify-between whitespace-normal text-left" onClick={() => { invalidate(); setSlug(p.slug); setChain("all"); setEvidence(null); setOpen(false); setQuery(""); }}><span>{p.name}<span className="block text-xs font-normal text-ink-faint">{p.category}</span></span></Button>)}{matches.length === 0 && <p className="p-4 text-sm text-ink-faint">No matching protocols.</p>}</div></PopoverContent></Popover>
        {data.error && <div role="alert" className="mt-4 text-sm text-ink-soft"><p>{data.error}</p><Button variant="link" className="px-0" disabled={isFetching} onClick={() => void refetch()}><RefreshCw /> Retry directory</Button></div>}
        <div className="mt-5"><label htmlFor="analysis-chain" className="mb-2 block text-xs text-ink-faint">Blockchain scope</label><Select value={chain} onValueChange={value => { invalidate(); setChain(value); }}><SelectTrigger id="analysis-chain" aria-label="Blockchain scope"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All supported chains</SelectItem>{chains.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
        <div className="mt-5 flex flex-wrap gap-3"><Button onClick={() => void run()} disabled={loading || data.protocols.length === 0}>{loading ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <RefreshCw />}{loading ? "Analyzing…" : report ? "Rerun analysis" : "Run analysis"}</Button>{report && <Button variant="ghost" onClick={inspect}>Inspect report</Button>}</div>
        <p aria-live="polite" className="mt-4 text-xs text-ink-faint">{loading ? "Retrieving protocol metadata and actual TVL observations…" : report ? `Retrieved ${utcDate(report.retrievedAt)}` : "Public data · evidence-based model · no wallet required"}</p>
        {error && <p role="alert" className="mt-4 border-l-2 border-fact pl-3 text-sm text-ink-soft">{error}</p>}
        {report && <div className="mt-5 border-t border-rule pt-4"><p className="font-mono text-sm text-violet-deep">{report.overall === null ? "Overall score withheld" : `${report.overall}/100 indicated risk`}</p><p className="mt-2 text-xs text-ink-faint">{report.coverage}% weighted evidence coverage</p></div>}
      </div>
      <div className="riskometer-visual"><AnalysisInstrument report={report} loading={loading} onExplore={inspect} /></div>
    </section>
    {report && <section id="real-risk-report" className="scroll-mt-20 border-t border-rule bg-lavender-soft/40"><AnalysisReport report={report} /><div className="mx-auto max-w-5xl px-4 pb-7 sm:px-8"><Button variant="outline" disabled={report.history.length < 2 || report.currentTvl === null} onClick={addComparison}><GitCompareArrows /> Add to comparison</Button></div></section>}
    {compare && saved.length > 0 && <section aria-label="Real protocol comparison" className="border-t border-rule"><div className="mx-auto max-w-5xl px-4 py-8 sm:px-8"><div className="flex items-center justify-between gap-3"><h2 className="font-display text-2xl">Evidence comparison</h2><Button variant="ghost" size="icon" aria-label="Close real comparison" onClick={() => setCompare(false)}><X /></Button></div><p className="mt-3 text-xs text-ink-faint">{saved.length < 2 ? "Analyze another protocol, then add its report." : startDate !== undefined && endDate !== undefined && endDate > startDate ? `Matched observation period: ${new Date(startDate * 1000).toISOString().slice(0, 10)} — ${new Date(endDate * 1000).toISOString().slice(0, 10)} UTC.` : "No shared observation window; historical changes are not compared."}</p>{saved.map(p => {
      const start = p.history.find(h => h.date === startDate)?.totalLiquidityUSD;
      const end = p.history.find(h => h.date === endDate)?.totalLiquidityUSD;
      const change = start !== undefined && start > 0 && end !== undefined && startDate !== endDate ? (end / start - 1) * 100 : null;
      return <div key={`${p.slug}-${p.chain}`} className="mt-4 grid gap-3 border-b border-rule pb-4 sm:grid-cols-[1fr_1fr_1fr_auto]"><div className="text-sm">{p.name}<p className="mt-1 text-xs text-ink-faint">{p.chain} · {utcDate(p.retrievedAt)}</p></div><div className="text-sm"><span className="block text-xs text-ink-faint">Latest TVL</span><span className="font-mono">{usd(p.currentTvl)}</span></div><div className="text-sm"><span className="block text-xs text-ink-faint">Matched-period change / coverage</span><span className="font-mono">{change === null ? "Unknown" : `${change.toFixed(2)}%`} / {p.coverage}%</span><p className="mt-1 text-xs text-ink-faint">Score {p.overall === null ? "withheld" : p.overall}</p></div><Button variant="ghost" size="icon" aria-label={`Remove ${p.name} comparison`} onClick={() => setSaved(s => s.filter(r => r !== p))}><X /></Button></div>;
    })}<p className="mt-4 text-xs text-ink-faint">Same model and matched dates; different scopes and retrieval times may not be directly comparable. TVL is not a safety ranking.</p></div></section>}
  </>;
}