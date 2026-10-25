import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RiskThermometer } from "@/components/observatory/risk-thermometer";
import { RISK_PROTOCOLS } from "@/data/seer";

afterEach(cleanup);
describe("Handheld Riskometer", () => {
  it("switches power and uncertainty without altering the market estimate", () => {
    const protocol = RISK_PROTOCOLS.find(p => p.id === "r1");
    if (!protocol) throw new Error("Missing sample protocol");
    render(<RiskThermometer protocol={protocol} onExplore={vi.fn()} expanded={false} onPrevious={vi.fn()} onNext={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Show uncertainty on device" }));
    expect(screen.getByRole("button", { name: "Show uncertainty on device" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Turn Riskometer off" }));
    expect(screen.getByRole("button", { name: /Explore Halcyon/ })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Turn Riskometer on" }));
    expect(screen.getByRole("button", { name: /Explore Halcyon/ })).toBeEnabled();
    expect(protocol.estimate).toBe(34);
    expect(protocol.range).toEqual([22, 58]);
  });
  it("delegates protocol navigation and diagnosis to the page", () => {
    const protocol = RISK_PROTOCOLS.find(p => p.id === "r1");
    if (!protocol) throw new Error("Missing sample protocol");
    const previous = vi.fn(), next = vi.fn(), explore = vi.fn();
    render(<RiskThermometer protocol={protocol} onExplore={explore} expanded={false} onPrevious={previous} onNext={next} />);
    fireEvent.click(screen.getByRole("button", { name: "Previous protocol" }));
    fireEvent.click(screen.getByRole("button", { name: "Next protocol" }));
    fireEvent.click(screen.getByRole("button", { name: /Explore Halcyon/ }));
    expect(previous).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledOnce();
    expect(explore).toHaveBeenCalledOnce();
  });
});