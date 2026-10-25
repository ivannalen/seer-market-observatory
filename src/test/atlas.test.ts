import { describe, expect, it } from "vitest";

import { ATLAS, INSIGHTS, MARKETS } from "@/data/seer";

// The universal explorer must surface every instrument family, and every
// detail-page market must carry the WHO/WHY/HOW decision framing.
describe("Universal market atlas", () => {
  it("includes every application family", () => {
    for (const family of ["Atlas", "Deep", "Futarchy", "Opportunity", "Risk"]) {
      expect(ATLAS.some((m) => m.origin === family)).toBe(true);
    }
  });

  it("prices every market type in one shared structure", () => {
    const types = new Set(ATLAS.map((m) => m.type));
    expect([...types].sort()).toEqual(["comparison", "distribution", "price", "risk", "selection"]);
  });

  it("gives every detail-page market a WHO/WHY/HOW insight", () => {
    for (const m of MARKETS) {
      expect(INSIGHTS[m.slug]).toBeDefined();
    }
  });

  it("keeps every atlas row linkable", () => {
    for (const m of ATLAS) {
      expect(m.href.startsWith("/")).toBe(true);
    }
  });
});
