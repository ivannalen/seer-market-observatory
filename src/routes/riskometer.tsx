import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, ArrowUpRight, Check, ChevronDown, GitCompareArrows, Search, X } from "lucide-react";
import { ObservatoryNav } from "@/components/observatory/nav";
import { Eyebrow, SampleTag, SiteFooter } from "@/components/observatory/chrome";
import { RiskThermometer } from "@/components/observatory/risk-thermometer";
import { RiskDiagnosis, RiskComparisonRow } from "@/components/observatory/risk-diagnosis";
import { searchRiskProtocols, riskMovement } from "@/components/observatory/riskometer-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RISK_PROTOCOLS } from "@/data/seer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/riskometer")({
  head: () => ({ meta: [
    { title: "Riskometer — Market-implied risk thermometer by Seer" },
    { name: "description", content: "Explore Seer's Riskometer: protocol risk readings, uncertainty, diagnosis and comparison. All readings are illustrative, not security ratings." },
    { property: "og:title", content: "Riskometer — Seer Observatory" },
    { property: "og:description", content: "See how the market prices risk. An interactive thermometer with illustrative protocol readings and uncertainty." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: RiskPage,
});

export function RiskPage() {
  const [selectedId, setSelectedId] = useState("r1");
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [diagnosisOpen, setDiagnosisOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [comparisonIds, setComparisonIds] = useState<string[]>(["r1", "r2"]);
  const protocol = RISK_PROTOCOLS.find(p => p.id === selectedId);
  if (!protocol) return null;
  const matches = searchRiskProtocols(RISK_PROTOCOLS, query);
  const movement = riskMovement(protocol);
  const revealDiagnosis = () => {
    setDiagnosisOpen(true);
    requestAnimationFrame(() => document.getElementById("risk-diagnosis")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }));
  };
  const toggleComparison = (id: string) => setComparisonIds(ids => ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]);
  const stepProtocol = (direction: number) => {
    const index = RISK_PROTOCOLS.findIndex(p => p.id === selectedId);
    const next = RISK_PROTOCOLS[(index + direction + RISK_PROTOCOLS.length) % RISK_PROTOCOLS.length];
    if (next) setSelectedId(next.id);
  };

  return (
    <div className="min-h-screen bg-paper">
      <ObservatoryNav />
      <main>
        <header className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-4 px-4 pt-7 sm:px-8 sm:pt-9">
          <div><h1 className="display riskometer-wordmark text-4xl text-ink sm:text-5xl">RISKOMETER<span className="text-violet">.</span></h1><p className="mt-3 text-sm text-ink-soft">Market-implied risk, at a glance.</p></div>
          <div className="pt-1 text-right"><SampleTag /><p className="mt-2 text-xs text-ink-faint">An instrument by Seer</p></div>
        </header>
        <section aria-label="Riskometer instrument" className="riskometer-stage mx-auto grid max-w-5xl items-center px-4 sm:px-8 md:grid-cols-[1fr_1fr]">
          <div className="riskometer-controls min-w-0">
            <Eyebrow className="text-ink-faint">01 / Protocol</Eyebrow>
            <Popover open={selectorOpen} onOpenChange={open => { setSelectorOpen(open); if (!open) setQuery(""); }}>
              <PopoverTrigger asChild><Button variant="ghost" aria-label={`Select protocol, current ${protocol.name}`} className="mt-3 h-auto w-full justify-between whitespace-normal rounded-none border-b border-ink px-0 py-3 text-left hover:bg-transparent"><span className="min-w-0"><span className="block font-display text-3xl text-ink sm:text-4xl">{protocol.name}</span><span className="mt-2 block text-xs font-normal text-ink-faint">{protocol.category}</span></span><ChevronDown className="ml-3 shrink-0 text-violet-deep" /></Button></PopoverTrigger>
              <PopoverContent align="start" className="w-[min(360px,calc(100vw-32px))] p-2">
                <div className="relative"><Search className="absolute left-3 top-3 size-4 text-ink-faint" /><Input aria-label="Search protocols" placeholder="Search name or category…" value={query} onChange={e => setQuery(e.target.value)} className="h-10 pl-9" /></div>
                <div role="group" aria-label="Protocols" className="mt-2 max-h-72 overflow-y-auto">
                  {matches.map(p => <Button key={p.id} variant="ghost" aria-pressed={selectedId === p.id} onClick={() => { setSelectedId(p.id); setSelectorOpen(false); setQuery(""); }} className={cn("h-auto min-h-14 w-full justify-between rounded-sm px-3 py-2 text-left", selectedId === p.id && "bg-lavender-soft")}><span><span className="block text-sm">{p.name}</span><span className="block text-xs font-normal text-ink-faint">{p.category}</span></span><span className="flex items-center gap-2 figures text-violet-deep">{selectedId === p.id && <Check className="size-3" />}{p.estimate}</span></Button>)}
                  {matches.length === 0 && <p className="p-4 text-sm text-ink-soft">No matching protocols.</p>}
                </div>
                <p className="border-t border-rule px-3 pt-2 text-xs text-ink-faint">All protocols and readings are illustrative.</p>
              </PopoverContent>
            </Popover>
            <div aria-live="polite" aria-atomic="true" className="riskometer-reading mt-8">
              <Eyebrow className="text-ink-faint">Market-implied risk</Eyebrow>
              <p className="mt-3 flex items-baseline gap-3"><span className="font-mono text-8xl leading-none tabular-nums text-violet-deep">{protocol.estimate}</span><span className="figures text-ink-faint">/ 100</span></p>
              <p className="mt-4 text-sm text-ink-soft">Uncertainty <span className="figures ml-2 text-ink">{protocol.range[0]}–{protocol.range[1]}</span></p>
              <p className="mt-2 text-xs text-ink-faint">{movement > 0 ? "+" : ""}{movement} pts · Jan–Dec 2025, illustrative</p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Button variant="link" onClick={revealDiagnosis} aria-expanded={diagnosisOpen} aria-controls="risk-diagnosis" className="h-10 px-0 text-sm">Explore diagnosis <ArrowDown /></Button>
              <Button variant="ghost" onClick={() => setCompareOpen(open => !open)} aria-expanded={compareOpen} aria-controls="risk-comparison" className="h-10 px-2 text-xs text-ink-soft"><GitCompareArrows /> Compare</Button>
            </div>
          </div>
          <div className="riskometer-visual relative min-w-0">
            <RiskThermometer protocol={protocol} onExplore={revealDiagnosis} expanded={diagnosisOpen} onPrevious={() => stepProtocol(-1)} onNext={() => stepProtocol(1)} />
            <div className="riskometer-range-key flex items-center justify-center gap-2 text-xs text-ink-faint"><span className="h-3 w-5 border border-dashed border-violet bg-lavender" />Uncertainty range</div>
          </div>
        </section>
        <div id="risk-diagnosis" hidden={!diagnosisOpen} className="scroll-mt-20 border-t border-rule bg-lavender-soft/40">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
            <div className="mb-7 flex items-center justify-between gap-4 border-b border-rule pb-4"><div><h2 className="font-display text-3xl text-ink">{protocol.name} / Diagnosis</h2><p className="mt-2 text-xs text-ink-faint">Illustrative context, not a security assessment</p></div><Button variant="ghost" size="icon" aria-label="Close diagnosis" onClick={() => setDiagnosisOpen(false)}><X /></Button></div>
            <RiskDiagnosis protocol={protocol} />
          </div>
        </div>
        <section id="risk-comparison" hidden={!compareOpen} className="scroll-mt-20 border-t border-rule">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
            <div className="flex items-center justify-between gap-4"><h2 className="font-display text-3xl text-ink">Side by side<span className="text-violet">.</span></h2><Button variant="ghost" size="icon" aria-label="Close comparison" onClick={() => setCompareOpen(false)}><X /></Button></div>
            <Popover><PopoverTrigger asChild><Button variant="outline" className="mt-5 text-xs"><GitCompareArrows /> Choose protocols <ChevronDown /></Button></PopoverTrigger><PopoverContent align="start" className="w-[min(340px,calc(100vw-32px))] p-2"><div role="group" aria-label="Comparison protocols">{RISK_PROTOCOLS.map(p => <Button key={p.id} variant="ghost" aria-pressed={comparisonIds.includes(p.id)} onClick={() => toggleComparison(p.id)} className="h-auto min-h-11 w-full justify-between whitespace-normal text-left text-sm">{p.name}{comparisonIds.includes(p.id) && <Check />}</Button>)}</div></PopoverContent></Popover>
            <div className="mt-5 hidden grid-cols-[1fr_5rem_7rem_7rem] gap-3 border-b border-rule pb-3 sm:grid"><Eyebrow>Protocol / category</Eyebrow><Eyebrow>Estimate</Eyebrow><Eyebrow>Range</Eyebrow><Eyebrow>History / Δ</Eyebrow></div>
            {RISK_PROTOCOLS.filter(p => comparisonIds.includes(p.id)).map(p => <RiskComparisonRow key={p.id} protocol={p} />)}
            {comparisonIds.length < 2 && <p className="mt-4 text-sm text-ink-faint">Select at least two protocols to compare.</p>}
            <p className="mt-4 text-xs text-ink-faint">Illustrative estimates · historical movement, Jan–Dec 2025 · not safety rankings</p>
          </div>
        </section>
        <div className="border-t border-rule"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-8"><p className="text-xs text-ink-faint">Illustrative readings. Not an audit or guarantee of safety.</p><Link to="/app" search={{ family: "risk" }} className="inline-flex items-center gap-2 text-xs text-violet-deep">Risk markets in the Seer App <ArrowUpRight className="size-4" /></Link></div></div>
      </main>
      <SiteFooter />
    </div>
  );
}
