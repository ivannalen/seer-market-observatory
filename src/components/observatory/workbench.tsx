import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, Search, X } from "lucide-react";
import { Eyebrow } from "@/components/observatory/chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEEP_CANDIDATES, OPPORTUNITY_CANDIDATES, OPPORTUNITY_MARKET, type FutarchyProposal, type OpportunityCandidate } from "@/data/seer";
import { cn } from "@/lib/utils";
import {
  deepAnalysis, filterOpportunities, futarchyScenario, riskBand, routeQuery, validateQuestion,
  type DeepAnalysis, type OpportunitySort,
} from "./workbench-data";

const pct = (n: number) => `${(n * 100).toFixed(0)}%`;

/* ---------- Home: query routes to an instrument ---------- */
export function ObservatoryQuery() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  return (
    <form className="mt-8 max-w-xl" onSubmit={(e) => {
      e.preventDefault();
      if (value.trim().length < 3) return setError("Type at least 3 characters.");
      setError("");
      const to = routeQuery(value);
      if (to === "/app") navigate({ to: "/app", search: { family: undefined } });
      else navigate({ to });
    }}>
      <label htmlFor="obs-query" className="text-sm text-ink-soft">Ask a question — we'll open the right instrument</label>
      <div className="mt-2 flex gap-2">
        <Input id="obs-query" value={value} onChange={(e) => setValue(e.target.value)} aria-invalid={!!error} aria-describedby="obs-query-msg" placeholder="e.g. Is the Halcyon bridge risky?" className="h-11" />
        <Button type="submit" className="h-11">Open <ArrowRight /></Button>
      </div>
      <p id="obs-query-msg" className="mt-2 min-h-4 text-xs text-destructive">{error}</p>
    </form>
  );
}

/* ---------- Deep: investigate a question ---------- */
export function DeepInvestigator({ onFocus }: { onFocus: (id: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeepAnalysis | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateQuestion(value);
    if (!v.ok) { setError(v.error); return; }
    setError(""); setLoading(true); setResult(null);
    timer.current = setTimeout(() => {
      const r = deepAnalysis(v.question, DEEP_CANDIDATES);
      setLoading(false);
      if (!r) { setError("No sample field is available for this question."); return; }
      setResult(r); onFocus(r.focus.id);
    }, 500);
  };
  return (
    <section aria-labelledby="deep-investigate" className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <div className="border-b border-ink pb-3"><h2 id="deep-investigate" className="font-display text-2xl text-ink">Investigate a question</h2></div>
      <form onSubmit={submit} className="mt-5 flex flex-col gap-2 sm:flex-row" noValidate>
        <Input aria-label="Your question" value={value} onChange={(e) => setValue(e.target.value)} aria-invalid={!!error} aria-describedby="deep-msg" placeholder="Which grant has the strongest open-data case?" className="h-11" />
        <Button type="submit" disabled={loading} className="h-11">{loading ? <Loader2 className="animate-spin" /> : <Search />} Investigate</Button>
      </form>
      <p id="deep-msg" role="alert" className="mt-2 min-h-4 text-xs text-destructive">{error}</p>
      {loading && <p className="text-sm text-ink-soft">Reading the sample field…</p>}
      {!loading && !result && !error && <p className="text-sm text-ink-faint">Try a keyword like “climate”, “privacy” or “solar”. Answers come from a deterministic sample — no live AI analysis.</p>}
      {result && (
        <div className="mt-4">
          <p className="text-xs text-ink-faint">Sample analysis for “{result.question}” · deterministic demo, not an AI result</p>
          <Tabs defaultValue="thesis" className="mt-3">
            <TabsList className="flex-wrap"><TabsTrigger value="thesis">Thesis</TabsTrigger><TabsTrigger value="evidence">Evidence</TabsTrigger><TabsTrigger value="counter">Counterarguments</TabsTrigger><TabsTrigger value="uncertainty">Uncertainty</TabsTrigger></TabsList>
            <TabsContent value="thesis" className="pt-3"><p className="max-w-3xl font-display text-2xl text-ink">{result.thesis}</p><Button variant="link" className="px-0" onClick={() => onFocus(result.focus.id)}>Highlight in the field</Button></TabsContent>
            <TabsContent value="evidence" className="pt-3"><ul className="space-y-2">{result.evidence.map((e) => <li key={e} className="border-l-2 border-violet pl-3 text-sm text-ink-soft"><span className="block text-xs text-ink-faint">Illustrative · sample dataset</span>{e}</li>)}</ul></TabsContent>
            <TabsContent value="counter" className="pt-3"><ul className="space-y-2">{result.counter.map((e) => <li key={e} className="border-l-2 border-rule-ink pl-3 text-sm text-ink-soft">{e}</li>)}</ul></TabsContent>
            <TabsContent value="uncertainty" className="pt-3"><p className="font-mono text-3xl text-ink">{pct(result.uncertainty.low)}–{pct(result.uncertainty.high)}</p><p className="mt-2 text-sm text-ink-soft">90% band, {pct(result.uncertainty.width)} wide{result.uncertainty.overlaps ? " · overlaps the nearest rival" : ""}.</p></TabsContent>
          </Tabs>
        </div>
      )}
    </section>
  );
}

/* ---------- Futarchy: scenario controls ---------- */
export function FutarchyScenario({ proposal }: { proposal: FutarchyProposal }) {
  const [held, setHeld] = useState<boolean[]>(() => proposal.assumptions.map(() => true));
  const [days, setDays] = useState(30);
  useEffect(() => { setHeld(proposal.assumptions.map(() => true)); setDays(30); }, [proposal.id, proposal.assumptions]);
  const s = futarchyScenario(proposal, held, days);
  const max = Math.max(proposal.pass, proposal.fail) * 1.15;
  return (
    <section aria-labelledby="fut-scenario" className="border-t border-rule">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-8 lg:grid-cols-2">
        <div>
          <h2 id="fut-scenario" className="font-display text-2xl text-ink">Stress-test the assumptions</h2>
          <p className="mt-2 text-xs text-ink-faint">Simulated — a toy model, not a market prediction. Market estimates above never change.</p>
          <fieldset className="mt-5 space-y-3"><legend className="sr-only">Assumptions</legend>
            {proposal.assumptions.map((a, i) => (
              <label key={a} className="flex cursor-pointer gap-3 border-b border-rule pb-3 text-sm text-ink-soft">
                <input type="checkbox" className="mt-1 accent-[var(--violet)]" checked={held[i] !== false} onChange={() => setHeld((h) => h.map((v, j) => (j === i ? !v : v)))} />
                <span><span className="figures mr-2 text-violet-deep">A{i + 1}</span>{a}</span>
              </label>
            ))}
          </fieldset>
          <label className="mt-5 block text-sm text-ink-soft">Measurement window <span className="figures ml-2 text-ink">{days} days</span>
            <input type="range" min={7} max={90} step={1} value={days} onChange={(e) => setDays(Number(e.target.value))} className="mt-2 w-full accent-[var(--violet)]" />
          </label>
        </div>
        <div aria-live="polite">
          <Eyebrow className="text-ink-faint">Simulated {proposal.metric.toLowerCase()} · {s.holding}/{s.total} assumptions hold</Eyebrow>
          {[["If passes (simulated)", s.pass], ["If fails (sample)", s.fail]].map(([label, v]) => (
            <div key={label as string} className="mt-4"><div className="flex justify-between text-sm"><span className="text-ink-soft">{label}</span><span className="figures text-ink">{(v as number).toLocaleString()}</span></div>
              <div className="mt-1 h-3 bg-lavender-soft"><div className="h-3 bg-violet-deep transition-all" style={{ width: `${Math.max(0, Math.min(100, ((v as number) / max) * 100))}%` }} /></div></div>
          ))}
          <p className="mt-6 font-mono text-3xl text-violet-deep">{s.delta > 0 ? "+" : ""}{s.delta.toLocaleString()} <span className="text-base text-ink-faint">{proposal.unit}</span></p>
          {s.holding === 0 && <p className="mt-2 text-sm text-ink-soft">With no assumptions holding, the toy model shows no advantage. Re-check one to recover.</p>}
          <Button variant="outline" className="mt-4 text-xs" onClick={() => { setHeld(proposal.assumptions.map(() => true)); setDays(30); }}>Reset scenario</Button>
        </div>
      </div>
    </section>
  );
}

/* ---------- Opportunity: search, filter, sort, detail, compare ---------- */
export function OpportunityExplorer({ shortlist, onToggle, frontierIds }: { shortlist: string[]; onToggle: (id: string) => void; frontierIds: string[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<OpportunitySort>("odds");
  const [openId, setOpenId] = useState<string | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const categories = ["all", ...Array.from(new Set(OPPORTUNITY_CANDIDATES.map((c) => c.category)))];
  const rows = filterOpportunities(OPPORTUNITY_CANDIDATES, query, category, sort);
  const open = OPPORTUNITY_CANDIDATES.find((c) => c.id === openId);
  const compared = compare.map((id) => OPPORTUNITY_CANDIDATES.find((c) => c.id === id)).filter(Boolean) as OpportunityCandidate[];
  const toggleCompare = (id: string) => setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id]));
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-8">
      <div className="border-b border-ink pb-3"><h2 className="font-display text-3xl text-ink">Explore the field</h2></div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Input aria-label="Search candidates" placeholder="Search name, category or note…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 max-w-xs" />
        <select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 border border-input bg-paper px-3 text-sm text-ink">{categories.map((c) => <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>)}</select>
        <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as OpportunitySort)} className="h-10 border border-input bg-paper px-3 text-sm text-ink"><option value="odds">Sort: odds</option><option value="score">Sort: reviewer score</option><option value="name">Sort: name</option></select>
      </div>
      <p className="mt-2 text-xs text-ink-faint" aria-live="polite">{rows.length} of {OPPORTUNITY_CANDIDATES.length} candidates · sample data</p>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <ul>
          {rows.map((c) => (
            <li key={c.id} className={cn("flex items-center gap-3 border-b border-rule py-3", openId === c.id && "bg-lavender-soft/40")}>
              <button onClick={() => setOpenId(c.id)} aria-pressed={openId === c.id} className="min-w-0 flex-1 text-left">
                <span className="block truncate text-sm text-ink">{c.name}{frontierIds.includes(c.id) && <span className="ml-2 text-xs text-violet-deep">frontier</span>}</span>
                <span className="block text-xs text-ink-faint">{c.category} · {pct(c.odds)} odds · {Math.round(c.score * 100)} score</span>
              </button>
              <Button variant="ghost" size="sm" aria-pressed={compare.includes(c.id)} disabled={!compare.includes(c.id) && compare.length >= 3} onClick={() => toggleCompare(c.id)} className="text-xs">{compare.includes(c.id) ? "Comparing" : "Compare"}</Button>
              <Button variant="outline" size="sm" aria-pressed={shortlist.includes(c.id)} disabled={!shortlist.includes(c.id) && shortlist.length >= OPPORTUNITY_MARKET.slots} title={!shortlist.includes(c.id) && shortlist.length >= OPPORTUNITY_MARKET.slots ? `Shortlist full — ${OPPORTUNITY_MARKET.slots} slots` : undefined} onClick={() => onToggle(c.id)} className="text-xs">{shortlist.includes(c.id) ? "Marked" : "Mark"}</Button>
            </li>
          ))}
          {rows.length === 0 && <li className="py-6 text-sm text-ink-soft">No candidates match. <Button variant="link" className="px-1" onClick={() => { setQuery(""); setCategory("all"); }}>Clear filters</Button></li>}
        </ul>
        <aside className="space-y-6">
          <div className="border border-ink p-5" aria-live="polite">
            {open ? (
              <>
                <div className="flex items-start justify-between gap-2"><h3 className="font-display text-xl text-ink">{open.name}</h3><Button variant="ghost" size="icon" aria-label="Close details" onClick={() => setOpenId(null)}><X /></Button></div>
                <p className="text-xs text-ink-faint">{open.category} · illustrative</p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div><dt className="text-xs text-violet-deep">Thesis</dt><dd className="text-ink-soft">{open.note}</dd></div>
                  <div><dt className="text-xs text-violet-deep">Potential upside</dt><dd className="text-ink-soft">{frontierIds.includes(open.id) ? "Holds a slot in the sample pricing." : `Needs about ${pct(Math.max(0, (OPPORTUNITY_CANDIDATES.filter((c) => frontierIds.includes(c.id)).at(-1)?.odds ?? 0) - open.odds))} more odds to reach the frontier.`}</dd></div>
                  <div><dt className="text-xs text-violet-deep">Risks</dt><dd className="text-ink-soft">{open.score - open.odds > 0.1 ? "Market prices it below reviewers — thin conviction." : "Odds track reviewer score; a weak review could move it."}</dd></div>
                  <div><dt className="text-xs text-violet-deep">Evidence</dt><dd className="figures text-ink">{pct(open.odds)} odds · {Math.round(open.score * 100)} reviewer score</dd></div>
                  <div><dt className="text-xs text-violet-deep">Uncertainty</dt><dd className="text-ink-soft">No band or liquidity figure is available in the sample data.</dd></div>
                </dl>
              </>
            ) : <p className="text-sm text-ink-faint">Select a candidate to open its details.</p>}
          </div>
          <div className="border border-rule p-5">
            <Eyebrow className="text-ink-faint">Compare · up to 3</Eyebrow>
            {compared.length < 2 ? <p className="mt-3 text-sm text-ink-faint">Pick at least two candidates to compare.</p> : (
              <table className="mt-3 w-full text-sm"><thead><tr className="text-left text-xs text-ink-faint"><th className="font-normal">Candidate</th><th className="font-normal">Odds</th><th className="font-normal">Score</th></tr></thead>
                <tbody>{compared.map((c) => <tr key={c.id} className="border-t border-rule"><td className="py-2 pr-2 text-ink">{c.name}</td><td className="figures text-violet-deep">{pct(c.odds)}</td><td className="figures text-ink-soft">{Math.round(c.score * 100)}</td></tr>)}</tbody></table>
            )}
            {compare.length > 0 && <Button variant="link" className="mt-2 px-0 text-xs" onClick={() => setCompare([])}>Clear comparison</Button>}
          </div>
        </aside>
      </div>
    </section>
  );
}

/* ---------- Riskometer: exploratory probe (never changes the market reading) ---------- */
export function RiskProbe({ estimate, range }: { estimate: number; range: [number, number] }) {
  const [probe, setProbe] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const fromPointer = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setProbe(Math.round(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100))));
  };
  const value = probe ?? estimate;
  const inRange = value >= range[0] && value <= range[1];
  return (
    <div className="mt-6">
      <div className="flex items-baseline justify-between text-xs text-ink-soft"><span>Explore the scale <span className="text-ink-faint">· drag, tap or use arrow keys</span></span>{probe !== null && <Button variant="link" className="h-auto px-0 text-xs" onClick={() => setProbe(null)}>Reset</Button>}</div>
      <div ref={ref} role="slider" tabIndex={0} aria-label="Exploratory reading — does not change the market estimate" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-valuetext={`${value}, ${riskBand(value)}`}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); fromPointer(e.clientX); }}
        onPointerMove={(e) => { if (e.buttons) fromPointer(e.clientX); }}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 10 : 1;
          if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); setProbe(Math.min(100, value + step)); }
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); setProbe(Math.max(0, value - step)); }
          if (e.key === "Home") setProbe(0); if (e.key === "End") setProbe(100); if (e.key === "Escape") setProbe(null);
        }}
        className="relative mt-2 h-8 cursor-pointer touch-none rounded-sm bg-lavender-soft/50 outline-none focus-visible:ring-2 focus-visible:ring-violet">
        {[25, 45, 65].map((t) => <span key={t} className="absolute inset-y-0 border-l border-dashed border-rule-ink" style={{ left: `${t}%` }} />)}
        <span className="absolute inset-y-1 border border-dashed border-violet bg-lavender/40" style={{ left: `${range[0]}%`, width: `${range[1] - range[0]}%` }} />
        <span className="absolute inset-y-0 w-0.5 bg-violet-deep" style={{ left: `${estimate}%` }} title="Market estimate" />
        {probe !== null && <span className="absolute -top-1 bottom-[-4px] w-0 border-l-2 border-dotted border-ink" style={{ left: `${probe}%` }} />}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-ink-faint"><span>Low</span><span>Moderate</span><span>Elevated</span><span>High</span></div>
      <p aria-live="polite" className="mt-2 text-sm text-ink-soft">
        {probe === null
          ? <>Market reading <span className="figures text-ink">{estimate}</span> · {riskBand(estimate)}</>
          : <>Exploring <span className="figures text-ink">{probe}</span> · {riskBand(probe)} · {inRange ? "inside" : "outside"} the market's range. <span className="text-ink-faint">Market reading stays {estimate}.</span></>}
      </p>
    </div>
  );
}
