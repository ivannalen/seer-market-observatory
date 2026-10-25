# Roadmap — Seer "The Observatory" redesign

- [x] Design system (light editorial canvas, ink sections, EF violet, mono data labels) — `src/styles.css`
- [x] Sample dataset, clearly labeled — `src/data/seer.ts`
- [x] Shared chrome (nav, page header, footer, sample-data tag) — `src/components/observatory/`
- [x] Hand-rolled SVG instruments (signature, distribution field, counterfactual scale, risk tracks, frontier) — `src/components/observatory/charts.tsx`
- [x] Route 1 — HOME `/` : interactive ecosystem constellation, hero transformation diagram, information-finance explainer, featured markets
- [x] Route 2 — APP `/app` + `/app/$slug` : market atlas with search, type filters, sort, compact rows; market detail pages
- [x] Route 3 — DEEP `/deep` : many-outcome possibility field, ranked list, forecast comparison, grant-evaluation deep dive
- [x] Route 4 — FUTARCHY `/futarchy` : shared-scale counterfactual comparison, Δ bracket, assumptions, historical estimates, DAO-authority note
- [x] Route 5 — OPPORTUNITY `/opportunity` : candidate field, selection odds, slots, frontier chart, reviewer shortlist interaction, human-authority note
- [x] Route 6 — RISK `/risk` : comparative spectrum with uncertainty ranges, history, comparison table, estimate-vs-fact distinction, no-safety-guarantee note
- [x] Verify: build + routing test + Playwright pass over all six routes
