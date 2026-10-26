import { afterEach, describe, expect, it, vi } from "vitest";
import { analyzeProtocol, evidenceScore, fetchProtocol, percentChange, protocolSchema, riskBand, type Factor } from "@/lib/defi-risk";

afterEach(() => vi.unstubAllGlobals());
const retrievedAt = "2026-10-26T12:00:00.000Z";
const end = Date.parse("2026-10-26T00:00:00Z") / 1000;
const fixture = () => protocolSchema.parse({ name: "Test protocol", chains: ["Ethereum"], tvl: Array.from({ length: 31 }, (_, i) => ({ date: end - (30 - i) * 86400, totalLiquidityUSD: 1000 - i * 10 })) });
describe("Evidence-based Riskometer", () => {
  it("derives percentage changes and trend scores from actual observations", () => {
    const report = analyzeProtocol(fixture(), "test", "all", retrievedAt);
    expect(report.currentTvl).toBe(700);
    expect(report.change30d).toBeCloseTo(-30);
    expect(report.factors.find(f => f.id === "trend")?.score).toBe(60);
    expect(percentChange(0, 10)).toBeNull();
  });
  it("passes through the protocol overview and rejects non-https website links", () => {
    const withMeta = protocolSchema.parse({ ...fixture(), description: "A lending protocol.", url: "https://example.org" });
    const report = analyzeProtocol(withMeta, "test", "all", retrievedAt);
    expect(report.description).toBe("A lending protocol.");
    expect(report.url).toBe("https://example.org");
    const insecure = analyzeProtocol(protocolSchema.parse({ ...fixture(), url: "http://example.org" }), "test", "all", retrievedAt);
    expect(insecure.url).toBeNull();
    expect(analyzeProtocol(fixture(), "test", "all", retrievedAt).description).toBeNull();
  });
  it("withholds overall score for TVL-only evidence and never assigns unknown factors zero", () => {
    const report = analyzeProtocol(fixture(), "test", "all", retrievedAt);
    expect(report.overall).toBeNull(); expect(report.coverage).toBe(35);
    for (const id of ["liquidity", "security", "dependencies", "concentration"]) expect(report.factors.find(f => f.id === id)?.score).toBeNull();
  });
  it("requires 70% coverage, three scored factors and liquidity or security evidence", () => {
    const factor = (id: string, weight: number): Factor => ({ id, weight, score: 50, name: id, assessment: "test", evidence: "test", date: retrievedAt, why: "test", next: "test", kind: "Measured" });
    expect(evidenceScore([factor("trend", 35), factor("stability", 35), factor("concentration", 30)]).overall).toBeNull();
    expect(evidenceScore([factor("security", 20), factor("trend", 20), factor("stability", 15)]).overall).toBeNull();
    expect(evidenceScore([factor("security", 20), factor("trend", 35), factor("stability", 15)]).overall).toBe(50);
  });
  it("marks empty or missing chain series insufficient, not fabricated", () => {
    const report = analyzeProtocol(fixture(), "test", "Ethereum", retrievedAt);
    expect(report.currentTvl).toBeNull(); expect(report.history).toEqual([]); expect(report.coverage).toBe(0); expect(report.overall).toBeNull();
    expect(() => analyzeProtocol(fixture(), "test", "Unsupported", retrievedAt)).toThrow("not supported");
  });
  it("excludes stale data and unreconciled asset evidence from scoring", () => {
    const raw = fixture();
    raw.tokensInUsd = [{ date: end, tokens: { TOKEN: 1 } }];
    expect(analyzeProtocol(raw, "test", "all", retrievedAt).factors.find(f => f.id === "concentration")?.score).toBeNull();
    expect(analyzeProtocol(raw, "test", "all", "2026-11-01T12:00:00Z").coverage).toBe(0);
  });
  it("scores concentration only from a timely reconciled breakdown", () => {
    const raw = fixture(); raw.tokensInUsd = [{ date: end, tokens: { A: 560, B: 140 } }];
    const report = analyzeProtocol(raw, "test", "all", retrievedAt);
    expect(report.factors.find(f => f.id === "concentration")?.score).toBe(80); expect(report.coverage).toBe(50); expect(report.overall).toBeNull();
  });
  it("bounds indicated risk from 0 lower to 100 higher", () => {
    expect(riskBand(0)).toBe("Low"); expect(riskBand(25)).toBe("Moderate"); expect(riskBand(50)).toBe("Elevated"); expect(riskBand(75)).toBe("High"); expect(riskBand(100)).toBe("High"); expect(riskBand(null)).toBe("Unknown");
  });
  it("failed requests surface errors without returning demo data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(fetchProtocol("aave-v3")).rejects.toThrow("503");
  });
  it("rejects invalid metric values rather than scoring them", () => {
    expect(() => protocolSchema.parse({ name: "Bad", tvl: [{ date: end, totalLiquidityUSD: -1 }] })).toThrow();
  });
  it("retains valid TVL when token evidence contains negative corrections, without scoring those assets", () => {
    const raw = protocolSchema.parse({ ...fixture(), tokensInUsd: [{ date: end, tokens: { A: 701, CORRECTION: -1 } }] });
    const report = analyzeProtocol(raw, "test", "all", retrievedAt);
    expect(report.currentTvl).toBe(700);
    expect(report.factors.find(f => f.id === "concentration")?.score).toBeNull();
  });
});