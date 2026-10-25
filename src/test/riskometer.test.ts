import { describe, expect, it } from "vitest";
import { RISK_PROTOCOLS } from "@/data/seer";
import { riskHistory, riskMovement, searchRiskProtocols } from "@/components/observatory/riskometer-data";

describe("Riskometer read-only market data", () => {
  it("keeps all readings and uncertainty on the 0–100 scale", () => {
    for (const p of RISK_PROTOCOLS) {
      expect(p.range[0]).toBeGreaterThanOrEqual(0);
      expect(p.range[1]).toBeLessThanOrEqual(100);
      expect(p.estimate).toBeGreaterThanOrEqual(p.range[0]);
      expect(p.estimate).toBeLessThanOrEqual(p.range[1]);
    }
  });
  it("searches names and categories without changing market readings", () => {
    const original = JSON.stringify(RISK_PROTOCOLS);
    expect(searchRiskProtocols(RISK_PROTOCOLS, "  HALCYON ").map(p => p.estimate)).toEqual([34]);
    expect(searchRiskProtocols(RISK_PROTOCOLS, "lending").map(p => p.id)).toEqual(["r2", "r6"]);
    expect(searchRiskProtocols(RISK_PROTOCOLS, "no-such-protocol")).toEqual([]);
    expect(JSON.stringify(RISK_PROTOCOLS)).toBe(original);
  });
  it("attaches explicit illustrative dates and calculates historical movement", () => {
    const p = RISK_PROTOCOLS.find(p => p.id === "r1");
    if (!p) throw new Error("Missing sample bridge");
    expect(riskHistory(p)[0]).toEqual({ date: "2025-01-01", label: "Jan 2025", estimate: 48 });
    expect(riskHistory(p).at(-1)).toEqual({ date: "2025-12-01", label: "Dec 2025", estimate: 34 });
    expect(riskMovement(p)).toBe(-14);
  });
});