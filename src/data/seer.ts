/*
 * Sample dataset for the Seer Observatory prototype.
 *
 * EVERY figure in this file is illustrative sample data. Nothing here is
 * live market data, a real trade, or a verified statistic. Components must
 * label it as such (see <SampleTag />) and must never present it as fact.
 */

export type InstrumentType = "price" | "distribution" | "comparison" | "selection" | "risk";

export const INSTRUMENT_LABEL: Record<InstrumentType, string> = {
  price: "Outcome price",
  distribution: "Distribution",
  comparison: "World comparison",
  selection: "Selection forecast",
  risk: "Risk estimate",
};

export interface Market {
  slug: string;
  question: string;
  type: InstrumentType;
  category: string;
  /** Market-implied headline figure, 0..1 unless noted. SAMPLE. */
  p: number;
  liquidity: number; // sample USD
  volume: number; // sample USD
  closes: string;
  /** Deterministic sample series, oldest → newest, 0..1. SAMPLE. */
  history: number[];
  summary: string;
  resolution: string;
  /** For distribution-type instruments. SAMPLE. */
  outcomes?: { name: string; share: number }[];
}

/* Deterministic sample series — no randomness, safe for SSR hydration. */
function series(seed: number, end: number, drift: number, wobble: number, n = 24): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const w = Math.sin(seed * 2.399 + i * 0.9) * wobble + Math.sin(i * 0.37 + seed) * wobble * 0.6;
    out.push(Math.min(0.98, Math.max(0.02, end - drift * (n - 1 - i) / n + w)));
  }
  out[n - 1] = end;
  return out;
}

export const MARKETS: Market[] = [
  {
    slug: "us-recession-2026",
    question: "Will the US enter a declared recession during 2026?",
    type: "price",
    category: "Macro",
    p: 0.18,
    liquidity: 1_840_000,
    volume: 9_310_000,
    closes: "2026-12-31",
    history: series(3, 0.18, -0.1, 0.035),
    summary:
      "Resolves YES if NBER declares a recession whose first month falls inside calendar 2026. The price is the market's current exchange rate between 'recession' and 'no recession' worlds.",
    resolution: "NBER Business Cycle Dating Committee announcement.",
  },
  {
    slug: "open-weights-frontier-lab",
    question: "Which lab will release the first open-weights frontier-scale model?",
    type: "distribution",
    category: "Technology",
    p: 0.31,
    liquidity: 720_000,
    volume: 3_120_000,
    closes: "2026-12-31",
    history: series(7, 0.31, 0.06, 0.03),
    summary:
      "A many-outcome instrument: the full probability mass is spread across seven candidate labs. Read it as one distribution, not seven independent bets.",
    resolution: "First public release with downloadable frontier-scale weights.",
    outcomes: [
      { name: "Lab A — European coalition", share: 0.31 },
      { name: "Lab B — US open-first", share: 0.24 },
      { name: "Lab C — State-backed consortium", share: 0.17 },
      { name: "Lab D — Academic superlab", share: 0.12 },
      { name: "Lab E — Corporate spin-out", share: 0.09 },
      { name: "Lab F — Unexpected entrant", share: 0.05 },
      { name: "No release in 2026", share: 0.02 },
    ],
  },
  {
    slug: "btc-above-150k-sept",
    question: "Will BTC settle above $150,000 at any daily close in September 2026?",
    type: "price",
    category: "Crypto",
    p: 0.23,
    liquidity: 2_450_000,
    volume: 14_800_000,
    closes: "2026-09-30",
    history: series(11, 0.23, 0.12, 0.05),
    summary:
      "A plain binary: the price is one number, and everything else — liquidity depth, historical drift, order-book shape — is context for reading it.",
    resolution: "First daily close above threshold on the reference index.",
  },
  {
    slug: "q3-public-goods-fund",
    question: "Which project will the Q3 Public Goods Fund select?",
    type: "selection",
    category: "Governance",
    p: 0.21,
    liquidity: 410_000,
    volume: 1_260_000,
    closes: "2026-10-15",
    history: series(5, 0.21, 0.05, 0.025),
    summary:
      "Twelve shortlisted projects, four funded slots. The field prices each candidate's odds; the distribution of those odds is the interesting object.",
    resolution: "Official grant announcement.",
  },
  {
    slug: "cop31-binding-pledge",
    question: "Will COP31 produce a binding interim emissions pledge with signatories above 60% of global output?",
    type: "price",
    category: "Climate",
    p: 0.34,
    liquidity: 640_000,
    volume: 2_050_000,
    closes: "2026-11-30",
    history: series(13, 0.34, -0.08, 0.03),
    summary:
      "The price rose through two drafting sessions and fell after a key delegation withdrew — visible as the step in the signature below.",
    resolution: "Published conference final text, verified by two independent observers.",
  },
  {
    slug: "futarchy-treasury-diversify",
    question: "If the treasury diversification proposal passes, will weekly protocol revenue rise?",
    type: "comparison",
    category: "Futarchy",
    p: 0.68,
    liquidity: 980_000,
    volume: 4_400_000,
    closes: "2026-08-01",
    history: series(17, 0.68, 0.1, 0.03),
    summary:
      "Not a bet on one future but a comparison between two: the world where the proposal passes and the world where it fails, priced against the same success metric.",
    resolution: "Conditional markets settle against the published metric oracle.",
  },
  {
    slug: "bridge-exploit-90d",
    question: "Will any top-20 bridge suffer an exploit exceeding $10m in the next 90 days?",
    type: "risk",
    category: "Security",
    p: 0.29,
    liquidity: 1_150_000,
    volume: 5_200_000,
    closes: "2026-11-15",
    history: series(19, 0.29, 0.04, 0.045),
    summary:
      "A risk instrument: the price is an estimate of an adverse event, with an uncertainty band wide enough to stay honest about what markets do not know.",
    resolution: "Public incident reports aggregated by two security trackers.",
  },
  {
    slug: "worldcup-2026-winner",
    question: "Which nation wins the 2026 World Cup final?",
    type: "distribution",
    category: "Sports",
    p: 0.19,
    liquidity: 3_100_000,
    volume: 18_400_000,
    closes: "2026-07-19",
    history: series(23, 0.19, 0.03, 0.028),
    summary:
      "A tournament is a pruning tree: every match eliminates branches of possibility. The distribution tightens as rounds pass.",
    resolution: "Tournament result.",
    outcomes: [
      { name: "Nation A", share: 0.19 },
      { name: "Nation B", share: 0.16 },
      { name: "Nation C", share: 0.14 },
      { name: "Nation D", share: 0.11 },
      { name: "Nation E", share: 0.09 },
      { name: "Nation F", share: 0.075 },
      { name: "Nation G", share: 0.06 },
      { name: "Nation H", share: 0.045 },
      { name: "Nation I", share: 0.035 },
      { name: "Field (all others)", share: 0.095 },
    ],
  },
  {
    slug: "futarchy-node-incentive",
    question: "If the node incentive program passes, will active node operators exceed 5,000 in 90 days?",
    type: "comparison",
    category: "Futarchy",
    p: 0.55,
    liquidity: 560_000,
    volume: 1_900_000,
    closes: "2026-09-01",
    history: series(29, 0.55, -0.05, 0.032),
    summary:
      "Conditional markets let the DAO look down both branches of a decision before taking either. The DAO still chooses; the instrument only illuminates.",
    resolution: "Conditional markets settle against the published metric oracle.",
  },
  {
    slug: "mars-sample-return-2028",
    question: "Will the Mars sample-return campaign launch before 2029?",
    type: "price",
    category: "Science",
    p: 0.41,
    liquidity: 380_000,
    volume: 980_000,
    closes: "2028-12-31",
    history: series(31, 0.41, -0.15, 0.022),
    summary:
      "Long-horizon instruments trade on funding cycles and engineering reviews more than on public sentiment.",
    resolution: "Confirmed launch telemetry.",
  },
  {
    slug: "l2-fees-under-cent",
    question: "Will a top-5 L2 sustain median fees under $0.01 for 30 consecutive days?",
    type: "price",
    category: "Infrastructure",
    p: 0.62,
    liquidity: 290_000,
    volume: 760_000,
    closes: "2026-12-31",
    history: series(37, 0.62, 0.14, 0.03),
    summary:
      "The signature shows a slow repricing after two fee-schedule cuts — the kind of structural shift a binary price alone hides.",
    resolution: "Public block explorer median over the window.",
  },
  {
    slug: "opportunity-cohort-fall",
    question: "How will the fall residency cohort of twelve be filled?",
    type: "selection",
    category: "Culture",
    p: 0.27,
    liquidity: 120_000,
    volume: 210_000,
    closes: "2026-08-20",
    history: series(41, 0.27, 0.03, 0.02),
    summary:
      "A small, honest instrument: it prices the frontier between candidates, never the reviewers' final choice.",
    resolution: "Published cohort list.",
  },
  {
    slug: "us-election-turnout-record",
    question: "Will 2026 midterm turnout exceed the 2018 record?",
    type: "price",
    category: "Politics",
    p: 0.47,
    liquidity: 1_320_000,
    volume: 6_700_000,
    closes: "2026-11-04",
    history: series(43, 0.47, 0.06, 0.04),
    summary:
      "The tightest signature in the atlas — early disagreement, then convergence as state-level rules settled.",
    resolution: "Certified national turnout statistics.",
  },
  {
    slug: "stablecoin-depeg-30d",
    question: "Will any top-5 stablecoin trade below $0.97 for more than 24 hours in the next 30 days?",
    type: "risk",
    category: "Security",
    p: 0.12,
    liquidity: 890_000,
    volume: 3_300_000,
    closes: "2026-08-30",
    history: series(47, 0.12, -0.03, 0.03),
    summary:
      "Risk instruments are most useful when boring: a low, stable estimate with a band that admits a real tail.",
    resolution: "Reference price feeds, 1-minute resolution.",
  },
];

export const FEATURED_SLUGS = [
  "us-recession-2026",
  "open-weights-frontier-lab",
  "q3-public-goods-fund",
  "futarchy-treasury-diversify",
  "bridge-exploit-90d",
];

export function findMarket(slug: string): Market | undefined {
  return MARKETS.find((m) => m.slug === slug);
}

/* ============ DEEP — many-outcome possibility field (SAMPLE) ============ */

export interface DeepCandidate {
  id: string;
  name: string;
  blurb: string;
  /** Market-implied share. SAMPLE. */
  share: number;
  /** 90% uncertainty band around the share. SAMPLE. */
  band: [number, number];
  /** Alternative forecasts for comparison. SAMPLE. */
  reviewerModel: number;
  communityPoll: number;
}

export const DEEP_MARKET = {
  title: "Q3 Public Goods Fund — grant evaluation field",
  question: "Which project will the Q3 Public Goods Fund select for the flagship grant?",
  slots: 1,
  note: "Illustrative grant-evaluation market. All figures sample.",
};

export const DEEP_CANDIDATES: DeepCandidate[] = [
  { id: "d01", name: "Open harvest index for regenerative farms", blurb: "Public yield and soil data, open pipeline.", share: 0.21, band: [0.12, 0.33], reviewerModel: 0.24, communityPoll: 0.17 },
  { id: "d02", name: "ZK proof-of-personhood toolkit", blurb: "Reusable credentials without identity leakage.", share: 0.17, band: [0.09, 0.28], reviewerModel: 0.15, communityPoll: 0.21 },
  { id: "d03", name: "Open-source climate risk models", blurb: "Downscaled hazard models for city planners.", share: 0.14, band: [0.07, 0.24], reviewerModel: 0.12, communityPoll: 0.15 },
  { id: "d04", name: "Localization stack for public archives", blurb: "Community translation for civic records.", share: 0.11, band: [0.05, 0.2], reviewerModel: 0.1, communityPoll: 0.09 },
  { id: "d05", name: "Mesh-network mapping kit", blurb: "Offline-first coverage maps for rural mesh builds.", share: 0.085, band: [0.04, 0.16], reviewerModel: 0.09, communityPoll: 0.08 },
  { id: "d06", name: "Privacy-preserving benefits calculator", blurb: "Entitlement checks without data disclosure.", share: 0.07, band: [0.03, 0.14], reviewerModel: 0.07, communityPoll: 0.06 },
  { id: "d07", name: "Open textbook translation pipeline", blurb: "Batch-localized STEM textbooks, CC-licensed.", share: 0.055, band: [0.02, 0.11], reviewerModel: 0.05, communityPoll: 0.05 },
  { id: "d08", name: "Community solar settlement ledger", blurb: "Meter-to-member accounting for co-ops.", share: 0.045, band: [0.015, 0.1], reviewerModel: 0.05, communityPoll: 0.04 },
  { id: "d09", name: "Water quality sensor commons", blurb: "Calibrated low-cost sensors, open protocol.", share: 0.04, band: [0.012, 0.09], reviewerModel: 0.04, communityPoll: 0.035 },
  { id: "d10", name: "Sign-language dataset cooperative", blurb: "Consent-first corpora owned by contributors.", share: 0.032, band: [0.008, 0.075], reviewerModel: 0.03, communityPoll: 0.03 },
  { id: "d11", name: "Neighborhood repair manual wiki", blurb: "Device teardowns with parts cross-reference.", share: 0.026, band: [0.006, 0.06], reviewerModel: 0.025, communityPoll: 0.025 },
  { id: "d12", name: "Field-guide generator for schools", blurb: "Local-biology guides assembled from open data.", share: 0.017, band: [0.003, 0.045], reviewerModel: 0.015, communityPoll: 0.015 },
];

/* ============ FUTARCHY — counterfactual comparisons (SAMPLE) ============ */

export interface FutarchyProposal {
  id: string;
  title: string;
  metric: string;
  unit: string;
  /** Value of the metric if the proposal passes. SAMPLE. */
  pass: number;
  /** Value of the metric if the proposal fails. SAMPLE. */
  fail: number;
  /** Historical conditional estimates, per quarter. SAMPLE. */
  history: { label: string; pass: number; fail: number }[];
  assumptions: string[];
  price: number; // market confidence that pass > fail. SAMPLE.
}

export const FUTARCHY_NOTE = "Markets inform the DAO; they do not make its decision.";

export const FUTARCHY_PROPOSALS: FutarchyProposal[] = [
  {
    id: "f1",
    title: "Treasury diversification",
    metric: "Weekly protocol revenue",
    unit: "USD k / week",
    pass: 412,
    fail: 287,
    history: [
      { label: "Q3 2025", pass: 355, fail: 292 },
      { label: "Q4 2025", pass: 371, fail: 296 },
      { label: "Q1 2026", pass: 389, fail: 284 },
      { label: "Q2 2026", pass: 412, fail: 287 },
    ],
    assumptions: [
      "Diversification reduces treasury volatility without reducing core holdings below operational needs.",
      "No concurrent change to fee schedules during the 30-day measurement window.",
      "The metric oracle reports gross revenue before grants outflow.",
    ],
    price: 0.68,
  },
  {
    id: "f2",
    title: "Node incentive program",
    metric: "Active node operators",
    unit: "operators / 90d",
    pass: 5400,
    fail: 4100,
    history: [
      { label: "Q3 2025", pass: 4600, fail: 3950 },
      { label: "Q4 2025", pass: 4900, fail: 4020 },
      { label: "Q1 2026", pass: 5150, fail: 4080 },
      { label: "Q2 2026", pass: 5400, fail: 4100 },
    ],
    assumptions: [
      "Incentive emissions stay within the approved budget band.",
      "Operator churn is unchanged by external market conditions.",
      "Sybil resistance holds at current identification thresholds.",
    ],
    price: 0.55,
  },
  {
    id: "f3",
    title: "Matching-pool expansion",
    metric: "Matched contributions",
    unit: "USD k / 30d",
    pass: 96,
    fail: 71,
    history: [
      { label: "Q3 2025", pass: 74, fail: 62 },
      { label: "Q4 2025", pass: 81, fail: 65 },
      { label: "Q1 2026", pass: 88, fail: 68 },
      { label: "Q2 2026", pass: 96, fail: 71 },
    ],
    assumptions: [
      "Expanded pool draws participation without diluting per-project matching quality.",
      "Collusion detection keeps false-positive removals under 2%.",
      "Donor retention is unaffected by pool size.",
    ],
    price: 0.61,
  },
];

/* ============ OPPORTUNITY — selection field (SAMPLE) ============ */

export interface OpportunityCandidate {
  id: string;
  name: string;
  category: string;
  /** Market-implied selection odds. SAMPLE. */
  odds: number;
  /** Normalized reviewer score, 0..1. SAMPLE. */
  score: number;
  note: string;
}

export const OPPORTUNITY_MARKET = {
  title: "Fall residency — candidate field",
  slots: 4,
  note: "Illustrative selection market. All figures sample.",
};

export const OPPORTUNITY_CANDIDATES: OpportunityCandidate[] = [
  { id: "o01", name: "Solar commons registry", category: "Energy", odds: 0.82, score: 0.88, note: "Strong reviewer consensus, deep market liquidity." },
  { id: "o02", name: "Open granular yield atlas", category: "Agriculture", odds: 0.74, score: 0.81, note: "Rising odds after data-sharing announcement." },
  { id: "o03", name: "Neighborhood energy dashboards", category: "Energy", odds: 0.61, score: 0.7, note: "Competes with Solar commons for the same slot bloc." },
  { id: "o04", name: "Repair data cooperative", category: "Circularity", odds: 0.55, score: 0.64, note: "Reviewers split on sustainability plan." },
  { id: "o05", name: "Field robotics for archives", category: "Culture", odds: 0.42, score: 0.58, note: "High ceiling, wide uncertainty band." },
  { id: "o06", name: "Seed library network", category: "Agriculture", odds: 0.36, score: 0.49, note: "Steady but flat over the pricing window." },
  { id: "o07", name: "Sound-map of public transit", category: "Culture", odds: 0.29, score: 0.44, note: "Priced near the frontier edge." },
  { id: "o08", name: "Tidal education kits", category: "Education", odds: 0.22, score: 0.38, note: "Needs one strong review to move." },
  { id: "o09", name: "Night-sky light census", category: "Science", odds: 0.17, score: 0.31, note: "Long-shot with committed volunteer base." },
  { id: "o10", name: "Oral history van", category: "Culture", odds: 0.12, score: 0.26, note: "Logistics risk dominates the price." },
  { id: "o11", name: "Moss microhabitats atlas", category: "Science", odds: 0.08, score: 0.21, note: "Specialist appeal, thin market." },
  { id: "o12", name: "Chalk mathematics festival", category: "Education", odds: 0.05, score: 0.14, note: "Outside the current frontier." },
];

/* ============ RISK — comparative spectrum (SAMPLE) ============ */

export interface RiskProtocol {
  id: string;
  name: string;
  category: string;
  /** Market-implied risk estimate, 0..100. SAMPLE. */
  estimate: number;
  /** Uncertainty band. SAMPLE. */
  range: [number, number];
  /** Risk estimate history, oldest → newest. SAMPLE. */
  history: number[];
  /** Independently verifiable facts. FACTS, not estimates. */
  facts: string[];
  /** Market-implied readings. ESTIMATES, not facts. */
  estimates: string[];
}

export const RISK_NOTE = "Risk estimates are probabilistic readings, not guarantees of safety.";

export const RISK_PROTOCOLS: RiskProtocol[] = [
  { id: "r1", name: "Halcyon Bridge", category: "Cross-chain", estimate: 34, range: [22, 58], history: [48, 46, 44, 45, 41, 39, 38, 36, 35, 35, 34, 34],
    facts: ["Three public audits on file", "24-hour upgrade timelock", "Bug bounty at 2.5% of TVL"],
    estimates: ["Market reads bridge key distribution as the dominant risk", "Tail above 50 corresponds to an exploit-style event"] },
  { id: "r2", name: "Meridian Pool", category: "Lending", estimate: 21, range: [12, 33], history: [30, 29, 27, 26, 25, 24, 23, 23, 22, 21, 21, 21],
    facts: ["Two public audits on file", "Oracle feeds published on-chain", "Reserve buffer at 8%"],
    estimates: ["Market reads oracle lag as the main exposure", "Band bottom assumes a quiet quarter"] },
  { id: "r3", name: "Vela Stablecoin", category: "Stablecoin", estimate: 46, range: [31, 66], history: [38, 39, 41, 40, 43, 44, 46, 45, 47, 46, 46, 46],
    facts: ["Collateral reports published weekly", "Attestations signed by two firms"],
    estimates: ["Market weights collateral concentration heavily", "Band top reflects a depeg scenario"] },
  { id: "r4", name: "Northwind Restaking", category: "Restaking", estimate: 57, range: [40, 79], history: [52, 53, 55, 54, 56, 58, 57, 58, 57, 57, 57, 57],
    facts: ["Slashing terms published", "Operator set disclosed on-chain"],
    estimates: ["Market prices correlated-slashing risk", "Band top assumes two simultaneous slash events"] },
  { id: "r5", name: "Corvid Exchange", category: "Exchange", estimate: 15, range: [8, 26], history: [24, 23, 22, 21, 20, 19, 18, 17, 16, 16, 15, 15],
    facts: ["Proof-of-reserves published monthly", "Cold-storage share disclosed at 87%"],
    estimates: ["Market reads operational risk as low but nonzero", "Band bottom reflects the quiet-trading assumption"] },
  { id: "r6", name: "Sable Lending (isolated)", category: "Lending", estimate: 63, range: [44, 84], history: [70, 69, 68, 67, 66, 66, 65, 64, 64, 63, 63, 63],
    facts: ["One public audit on file", "Isolated markets with capped supply"],
    estimates: ["Market prices the single-audit configuration", "Band top corresponds to a bad-debt cascade"] },
  { id: "r7", name: "Lumen Oracle", category: "Oracle", estimate: 27, range: [16, 42], history: [35, 34, 33, 32, 31, 30, 29, 29, 28, 27, 27, 27],
    facts: ["Signer set published on-chain", "Latency statistics public"],
    estimates: ["Market weights signer concentration over latency", "Band top assumes one signer goes silent"] },
];

/* ============ WHO / WHAT / HOW — the reading, in decision terms ============ */

export interface MarketInsight {
  /** The information seeker behind the instrument (sample). */
  seeker: string;
  /** The concrete decision this reading could inform (sample). */
  decision: string;
  /** How the signal is used (sample). */
  signal: string;
  /** Known limits of the reading (sample). */
  limitations: string;
}

export const FALLBACK_INSIGHT: MarketInsight = {
  seeker: "A research desk monitoring this question for planning purposes.",
  decision: "Position sizing and scenario planning for the outcomes in question.",
  signal: "Read the current figure against its recent drift; treat sharp moves as new information.",
  limitations: "Sample data. The reading is only as good as its resolution rule and its liquidity.",
};

export const INSIGHTS: Record<string, MarketInsight> = {
  "us-recession-2026": {
    seeker: "A treasury team hedging the timing of a debt issuance scheduled for late 2026.",
    decision: "Whether to lock financing terms now or stage the issuance across two windows.",
    signal: "Use the level as a base rate and the drift as a stress indicator for planning scenarios.",
    limitations: "Sample data. NBER declarations lag reality by months, so the price tracks expectations, not the event itself.",
  },
  "open-weights-frontier-lab": {
    seeker: "A developer-relations team planning which model ecosystem to build tooling for.",
    decision: "Which SDK integration to staff first for the next roadmap cycle.",
    signal: "Rank candidates by share, then check band overlap: adjacent shares mean the ranking is unsettled.",
    limitations: "Sample data. 'Frontier-scale' is judged by a committee rule that can redefine the market mid-flight.",
  },
  "btc-above-150k-sept": {
    seeker: "A payments company managing float held partly in crypto assets.",
    decision: "How much settlement float to keep in kind versus convert to stable value.",
    signal: "Compare the price against realized volatility in the signature before setting conversion thresholds.",
    limitations: "Sample data. A threshold instrument is binary — it says nothing about where price settles between thresholds.",
  },
  "q3-public-goods-fund": {
    seeker: "The fund's oversight committee, watching how the field reads its own shortlist.",
    decision: "Whether to adjust reviewer attention toward under-priced candidates before the deadline.",
    signal: "Treat wide bands as contested candidates worth a second review pass.",
    limitations: "Sample data. The market reads the reviewers; it cannot see their private deliberations.",
  },
  "cop31-binding-pledge": {
    seeker: "A climate-adjacent infrastructure fund timing capital deployment in exposed regions.",
    decision: "Whether to front-load commitments that depend on a strong interim framework.",
    signal: "The step-changes in the signature track negotiation sessions, not sentiment.",
    limitations: "Sample data. 'Binding' is a legal reading that observers can dispute after the fact.",
  },
  "futarchy-treasury-diversify": {
    seeker: "The DAO itself, which must vote on the diversification proposal.",
    decision: "Vote for or against the proposal, informed by the priced gap between the two worlds.",
    signal: "Read the gap and its confidence together; a small gap at high confidence is still informative.",
    limitations: "Sample data. Conditional markets carry basis risk: the oracle's metric can diverge from the DAO's real objective.",
  },
  "bridge-exploit-90d": {
    seeker: "A risk team sizing cross-chain exposure limits for the quarter.",
    decision: "Whether to cap bridge transfers or add monitoring above the current threshold.",
    signal: "Use the level for expected loss; use the band width to size the tail scenario.",
    limitations: "Sample data. Aggregate instruments hide which bridge carries the risk — read per-protocol pages too.",
  },
  "worldcup-2026-winner": {
    seeker: "A broadcast planner allocating promotion budget across national audiences.",
    decision: "Which markets to prioritize for advertising buys as rounds eliminate teams.",
    signal: "Watch mass concentrate after each round; eliminated branches go to zero sharply.",
    limitations: "Sample data. Tournament draws can restructure the field faster than prices adjust.",
  },
  "futarchy-node-incentive": {
    seeker: "The DAO's infrastructure working group.",
    decision: "Whether to recommend the node incentive program for an on-chain vote.",
    signal: "Compare the priced operator gap against the program's fully-diluted cost per operator.",
    limitations: "Sample data. Sybil-resistant operator counts are hard to measure; the oracle rule carries that burden.",
  },
  "mars-sample-return-2028": {
    seeker: "An instrument supplier planning production capacity for the campaign window.",
    decision: "Whether to hold or retool production lines scheduled to idle in 2027.",
    signal: "Long-horizon prices move on funding and review events; ignore day-to-day wobble.",
    limitations: "Sample data. Very long horizons carry re-definition risk: scope changes can reset the market.",
  },
  "l2-fees-under-cent": {
    seeker: "A consumer app choosing where to deploy its transaction-heavy features.",
    decision: "Which L2 to build on for the next product cycle.",
    signal: "A sustained high reading is a stronger deployment signal than the point estimate alone.",
    limitations: "Sample data. Median-fee oracles can disagree with end-user experience during congestion spikes.",
  },
  "opportunity-cohort-fall": {
    seeker: "The residency program's curators, watching how the field reads their applicant pool.",
    decision: "Where to spend limited interview slots before final selection.",
    signal: "Interview candidates whose market odds diverge most from reviewer scores.",
    limitations: "Sample data. The market prices perceptions of selection, not the selection itself.",
  },
  "us-election-turnout-record": {
    seeker: "A civic-tech coalition staffing observation infrastructure.",
    decision: "How many field observers to mobilize for the November window.",
    signal: "Read the convergence in the signature as the market settling on a turnout regime.",
    limitations: "Sample data. Turnout records are certified late; the market trades on projections first.",
  },
  "stablecoin-depeg-30d": {
    seeker: "A settlement desk routing high-value payments through stablecoin rails.",
    decision: "Which rails to keep enabled for large settlements this month.",
    signal: "Pair the low point estimate with the band top when setting alerts and thresholds.",
    limitations: "Sample data. A quiet 30 days is not evidence about the next 30.",
  },
};

/* ============ Universal atlas — every instrument, one structure ============ */

export interface AtlasMarket extends Market {
  /** Link target for the atlas row: detail page or specialized application. */
  href: string;
  /** Application family the instrument originates from. */
  origin: string;
}

const atlasFromMarket = (m: Market, origin = "Atlas"): AtlasMarket => ({
  ...m,
  href: `/app/${m.slug}`,
  origin,
});

export const ATLAS: AtlasMarket[] = [
  ...MARKETS.map((m) => atlasFromMarket(m, m.slug === "opportunity-cohort-fall" ? "Opportunity" : "Atlas")),

  // Deep — the many-outcome field, in the atlas
  {
    ...atlasFromMarket(
      {
        slug: "deep-field-q3",
        question: DEEP_MARKET.question,
        type: "distribution",
        category: "Governance",
        p: DEEP_CANDIDATES[0].share,
        liquidity: 340_000,
        volume: 980_000,
        closes: "2026-10-15",
        history: series(53, DEEP_CANDIDATES[0].share, 0.04, 0.02),
        summary:
          "The full grant-evaluation field: twelve outcomes priced at once, each with a 90% uncertainty band. The distribution is the object.",
        resolution: "Official grant announcement.",
      },
      "Deep",
    ),
    href: "/deep",
  },

  // Futarchy — the remaining conditional cases
  ...FUTARCHY_PROPOSALS.slice(1).map((f) =>
    atlasFromMarket(
      {
        slug: `futarchy-${f.id}`,
        question: `${f.title}: will ${f.metric.toLowerCase()} beat the fails-world estimate?`,
        type: "comparison" as const,
        category: "Futarchy",
        p: f.price,
        liquidity: 560_000,
        volume: 1_900_000,
        closes: "2026-09-01",
        history: series(59, f.price, 0.05, 0.03),
        summary: `Conditional instrument pricing ${f.metric} (${f.unit}) in both decision worlds. The gap between them is the reading.`,
        resolution: "Conditional markets settle against the published metric oracle.",
      },
      "Futarchy",
    ),
  ).map((m) => ({ ...m, href: "/futarchy" })),

  // Risk — protocol-level instruments on the comparative spectrum
  ...RISK_PROTOCOLS.slice(0, 3).map((r, i) =>
    atlasFromMarket(
      {
        slug: `risk-${r.id}`,
        question: `What is the current market-implied risk of ${r.name}?`,
        type: "risk" as const,
        category: r.category,
        p: r.estimate / 100,
        liquidity: 640_000 + i * 120_000,
        volume: 1_800_000 + i * 400_000,
        closes: "2026-12-31",
        history: series(61 + i, r.estimate / 100, -0.03, 0.03),
        summary: `Risk estimate for ${r.name} on the shared 0–100 spectrum, with a drawn uncertainty band. Facts and estimates are kept apart on the protocol page.`,
        resolution: "Published incident reports and on-chain verified facts.",
      },
      "Risk",
    ),
  ).map((m) => ({ ...m, href: "/risk" })),
];

export function findAtlasMarket(slug: string): AtlasMarket | undefined {
  return ATLAS.find((m) => m.slug === slug);
}


export interface EcosystemApp {
  to: string;
  code: string;
  name: string;
  tag: string;
  description: string;
  /** Polar position on the constellation: orbit radius 0..1, angle deg. */
  orbit: number;
  angle: number;
}

export const ECOSYSTEM_APPS: EcosystemApp[] = [
  {
    to: "/app", code: "01", name: "Atlas", tag: "Market atlas",
    description: "Every open instrument in one atlas: search, filter, and read the probability signature of each market.",
    orbit: 0.52, angle: -90,
  },
  {
    to: "/deep", code: "02", name: "Deep", tag: "Possibility field",
    description: "Many-outcome fields where the full distribution is the object — uncertainty drawn, not hidden.",
    orbit: 0.85, angle: -20,
  },
  {
    to: "/futarchy", code: "03", name: "Futarchy", tag: "Counterfactuals",
    description: "Both worlds on one scale: what the metric does if the proposal passes, and if it fails.",
    orbit: 0.7, angle: 48,
  },
  {
    to: "/opportunity", code: "04", name: "Opportunity", tag: "Selection forecast",
    description: "Candidate fields with selection odds, open slots, and a visible frontier — reviewers still decide.",
    orbit: 0.85, angle: 130,
  },
  {
    to: "/risk", code: "05", name: "Risk", tag: "Risk pricing",
    description: "Protocols on one comparative spectrum, with uncertainty ranges and the facts kept apart from estimates.",
    orbit: 0.55, angle: 168,
  },
];

/* ============ Formatting helpers ============ */

export function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}m`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

export function fmtPct(p: number, digits = 0): string {
  return `${(p * 100).toFixed(digits)}%`;
}
