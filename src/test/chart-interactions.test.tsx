import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DistributionField, FrontierChart } from "@/components/observatory/charts";

afterEach(cleanup);
describe("Read-only chart selection", () => {
  it("selects Deep outcomes by keyboard without changing their share", () => {
    const candidates = [{ id: "a", name: "Candidate A", share: 0.34, band: [0.22, 0.58] as [number, number] }];
    const select = vi.fn();
    render(<DistributionField candidates={candidates} selectedId={null} onSelect={select} />);
    fireEvent.keyDown(screen.getByRole("option"), { key: "Enter" });
    expect(select).toHaveBeenCalledWith("a");
    expect(candidates[0]?.share).toBe(0.34);
  });
  it("delegates frontier shortlist selection for both pointer and keyboard", () => {
    const select = vi.fn();
    const candidates = [{ id: "a", name: "Candidate A", odds: 0.6, score: 0.7 }];
    render(<FrontierChart candidates={candidates} selectedIds={[]} slots={1} onSelect={select} />);
    const point = screen.getByRole("button", { name: /Candidate A/ });
    fireEvent.click(point);
    fireEvent.keyDown(point, { key: " " });
    expect(select.mock.calls).toEqual([["a"], ["a"]]);
    expect(candidates[0]?.odds).toBe(0.6);
  });
});