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
- [x] Route 6 — RISKOMETER `/riskometer` : comparative spectrum with uncertainty ranges, history, comparison table, estimate-vs-fact distinction, no-safety-guarantee note
- [x] Verify: build + routing test + Playwright pass over all six routes

## Round 2 — Information-finance direction (two-sided marketplace, universal explorer)

- [x] Shared market data structure: every instrument (incl. Deep, Futarchy, Opportunity, Risk) discoverable in one atlas list — `ATLAS` in `src/data/seer.ts`
- [x] Universal explorer: origin-family column + deep-link filters (`/app?family=deep|futarchy|opportunity|risk`) in the atlas
- [x] Market detail pages: WHO asks (seeker) + decision informed, WHAT is priced (existing), HOW to use the signal with uncertainty and limitations
- [x] Two-sided marketplace framing on Home (seekers ↔ traders) and in the transformation figure copy
- [x] Cross-links from each specialized application back into the universal atlas (pre-filtered)
- [x] Verified round 2: build clean, 11 tests pass, zero console errors across all 8 URLs
- [ ] Live Seer data integration (blocked: no reliable public feed in the prototype)

## Riskometer refinement
- [x] Instrument-first /risk with searchable protocol selection and accessible thermometer
- [x] Progressive diagnosis with honest provenance, uncertainty and dated demo history
- [x] Optional compact protocol comparison
- [x] Verify selection, diagnosis, comparison, navigation and desktop/mobile layout

## Typography and interaction refinement
- [x] Apply Space Grotesk headings, Inter UI and IBM Plex Mono numerical indicators across existing layouts
- [x] Refine chart and control interactions across the six interfaces
- [x] Add uploaded Seer logo, matching background and derived favicon
- [x] Verify typography, core interactions and desktop/mobile layouts — 18 tests pass, all six pages checked at 1280px and 320px without overflow

## Make all six interfaces functional
- [x] Home question box routes to the matching instrument
- [x] Deep question form with validation, loading and tabbed sample analysis
- [x] Futarchy assumption toggles + window slider (simulated, market values untouched)
- [x] Opportunity search/filter/sort, detail panel, compare up to 3
- [x] Riskometer exploratory scale probe (pointer + keyboard) with Low/Moderate/Elevated/High bands
- [x] Tests (23) + mobile click-through

## Fix and verify all six (uploaded brief)
- [x] Opportunity shortlist now enforces the four-slot limit (toggle helper + disabled Mark buttons) with test
- [x] Verified: direct URL + refresh on all six routes, nav on every page, home cards/Open links, back/forward, atlas detail links, slot limit live

## Portable Seer logo on Vercel
- [x] Identify the broken Lovable-only image path and restore the original logo as a repository asset
- [ ] Verify the restored logo in the app and check the favicon separately
- [ ] Verify the GitHub/Vercel redeployment (requires Git sync and deployment access)
