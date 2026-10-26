import { describe, expect, it } from "vitest";
import { DEEP_CANDIDATES, FUTARCHY_PROPOSALS, OPPORTUNITY_CANDIDATES } from "@/data/seer";
import { deepAnalysis, filterOpportunities, futarchyScenario, riskBand, routeQuery, validateQuestion } from "@/components/observatory/workbench-data";

describe("workbench demo logic", () => {
  it("validates Deep questions", () => {
    expect(validateQuestion("  ").ok).toBe(false);
    expect(validateQuestion("short").ok).toBe(false);
    expect(validateQuestion("Which climate project wins?").ok).toBe(true);
  });
  it("returns deterministic analysis keyed by question", () => {
    const a = deepAnalysis("Which climate project wins?", DEEP_CANDIDATES);
    expect(a?.focus.id).toBe("d03");
    expect(deepAnalysis("Which climate project wins?", DEEP_CANDIDATES)?.focus.id).toBe("d03");
  });
  it("futarchy scenario keeps the fail world and removes the gap when no assumption holds", () => {
    const p = FUTARCHY_PROPOSALS[0]!;
    expect(futarchyScenario(p, [true, true, true], 30).pass).toBe(p.pass);
    expect(futarchyScenario(p, [false, false, false], 30).delta).toBe(0);
    expect(p.pass).toBe(412);
  });
  it("filters and sorts opportunities", () => {
    expect(filterOpportunities(OPPORTUNITY_CANDIDATES, "", "Energy", "odds").map(c => c.id)).toEqual(["o01", "o03"]);
    expect(filterOpportunities(OPPORTUNITY_CANDIDATES, "zzz", "all", "odds")).toEqual([]);
  });
  it("classifies risk and routes queries", () => {
    expect([10, 30, 50, 80].map(riskBand)).toEqual(["Low", "Moderate", "Elevated", "High"]);
    expect(routeQuery("Is the bridge risky?")).toBe("/riskometer");
    expect(routeQuery("Should the DAO pass this proposal")).toBe("/futarchy");
  });
});
