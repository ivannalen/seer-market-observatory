import type { DeepCandidate, FutarchyProposal, OpportunityCandidate } from "@/data/seer";

/* Pure, deterministic demo helpers. They never mutate shared sample data. */

export type DeepValidation = { ok: true; question: string } | { ok: false; error: string };

export function validateQuestion(raw: string): DeepValidation {
  const question = raw.trim().replace(/\s+/g, " ");
  if (question.length === 0) return { ok: false, error: "Type a question to investigate." };
  if (question.length < 12) return { ok: false, error: "Add a little more detail — at least 12 characters." };
  if (question.length > 200) return { ok: false, error: "Keep the question under 200 characters." };
  return { ok: true, question };
}

function hash(text: string) {
  let h = 0;
  for (const ch of text.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export interface DeepAnalysis {
  question: string;
  focus: DeepCandidate;
  rival: DeepCandidate;
  thesis: string;
  evidence: string[];
  counter: string[];
  uncertainty: { low: number; high: number; width: number; overlaps: boolean };
}

/** Deterministic sample analysis: same question always returns the same reading. Not an AI result. */
export function deepAnalysis(question: string, candidates: DeepCandidate[]): DeepAnalysis | null {
  const ranked = [...candidates].sort((a, b) => b.share - a.share);
  if (ranked.length < 2) return null;
  const words = question.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const keyword = ranked.find((c) => words.some((w) => `${c.name} ${c.blurb}`.toLowerCase().includes(w)));
  const focus = keyword ?? ranked[hash(question) % Math.min(4, ranked.length)]!;
  const rival = ranked.find((c) => c.id !== focus.id)!;
  const overlaps = focus.band[0] <= rival.band[1] && rival.band[0] <= focus.band[1];
  const pct = (n: number) => `${(n * 100).toFixed(0)}%`;
  return {
    question,
    focus,
    rival,
    thesis: `The sample field leans toward “${focus.name}” at ${pct(focus.share)}, against “${rival.name}” at ${pct(rival.share)}.`,
    evidence: [
      `Market share ${pct(focus.share)} in the illustrative field.`,
      `Reviewer model reads ${pct(focus.reviewerModel)}; community poll reads ${pct(focus.communityPoll)}.`,
      focus.blurb,
    ],
    counter: [
      overlaps ? `Its 90% band overlaps “${rival.name}” — the ranking could flip.` : `Its band does not overlap the nearest rival, but bands are sample values.`,
      Math.abs(focus.reviewerModel - focus.communityPoll) > 0.03 ? "Reviewers and the community disagree noticeably." : "Readers broadly agree — agreement is not proof.",
    ],
    uncertainty: { low: focus.band[0], high: focus.band[1], width: focus.band[1] - focus.band[0], overlaps },
  };
}

/** Simulated futarchy scenario. Each failed assumption shrinks the pass-world advantage by a third. */
export function futarchyScenario(p: FutarchyProposal, held: boolean[], windowDays: number) {
  const holding = p.assumptions.filter((_, i) => held[i] !== false).length;
  const factor = holding / Math.max(p.assumptions.length, 1);
  const windowFactor = Math.min(Math.max(windowDays, 7), 90) / 30;
  const gap = (p.pass - p.fail) * factor * Math.sqrt(windowFactor);
  const pass = Math.round(p.fail + gap);
  return { pass, fail: p.fail, delta: pass - p.fail, holding, total: p.assumptions.length };
}

export type OpportunitySort = "odds" | "score" | "name";

export function filterOpportunities(list: OpportunityCandidate[], query: string, category: string, sort: OpportunitySort) {
  const q = query.trim().toLowerCase();
  return list
    .filter((c) => (category === "all" || c.category === category) && (q === "" || `${c.name} ${c.category} ${c.note}`.toLowerCase().includes(q)))
    .sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : sort === "score" ? b.score - a.score : b.odds - a.odds));
}

export function riskBand(value: number) {
  if (value < 25) return "Low";
  if (value < 45) return "Moderate";
  if (value < 65) return "Elevated";
  return "High";
}

/** Routes a free-text home query to the most relevant instrument. */
export function routeQuery(raw: string): "/deep" | "/futarchy" | "/opportunity" | "/riskometer" | "/app" {
  const q = raw.toLowerCase();
  if (/risk|exploit|hack|bridge|protocol|safe|audit/.test(q)) return "/riskometer";
  if (/proposal|dao|pass|fail|vote|treasury|governance/.test(q)) return "/futarchy";
  if (/select|shortlist|candidate|residency|hire|slot/.test(q)) return "/opportunity";
  if (/which|grant|outcome|winner|many/.test(q)) return "/deep";
  return "/app";
}
