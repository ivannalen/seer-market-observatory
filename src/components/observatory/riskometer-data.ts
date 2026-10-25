import type { RiskProtocol } from "@/data/seer";

// These timestamps are illustrative monthly labels, not an external market feed.
export function riskHistory(protocol: RiskProtocol) {
  return protocol.history.map((estimate, index) => ({
    date: `${2025 + Math.floor(index / 12)}-${String(index % 12 + 1).padStart(2, "0")}-01`,
    label: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][index % 12]} ${2025 + Math.floor(index / 12)}`,
    estimate,
  }));
}

export function riskMovement(protocol: RiskProtocol) {
  return protocol.estimate - (protocol.history[0] ?? protocol.estimate);
}

export function searchRiskProtocols(protocols: RiskProtocol[], query: string) {
  const term = query.trim().toLowerCase();
  return protocols.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(term));
}