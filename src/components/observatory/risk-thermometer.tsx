import { Button } from "@/components/ui/button";
import type { RiskProtocol } from "@/data/seer";

export function RiskThermometer({ protocol, onExplore, expanded }: { protocol: RiskProtocol; onExplore: () => void; expanded: boolean }) {
  const y = (value: number) => 454 - value * 3.8;
  return (
    <Button variant="ghost" onClick={onExplore} aria-expanded={expanded} aria-controls="risk-diagnosis"
      aria-label={`Explore ${protocol.name} diagnosis: estimate ${protocol.estimate} out of 100, uncertainty ${protocol.range[0]} to ${protocol.range[1]}`}
      className="risk-thermometer group h-auto w-full rounded-none p-0 hover:bg-transparent">
      <svg viewBox="35 20 290 540" className="h-full w-full overflow-visible" aria-hidden="true">
        <text x="105" y="35" className="fill-ink-faint font-mono text-[11px]" textAnchor="end">MORE RISK</text>
        {Array.from({ length: 21 }, (_, i) => i * 5).map((value) => (
          <g key={value}>
            <line x1={value % 10 === 0 ? 112 : 129} x2="146" y1={y(value)} y2={y(value)} className="stroke-rule-ink" strokeWidth={value % 10 === 0 ? 1.3 : 0.7} />
            {value % 10 === 0 && <text x="100" y={y(value) + 4} textAnchor="end" className="fill-ink-soft font-mono text-[12px]">{value}</text>}
          </g>
        ))}
        <text x="105" y="485" className="fill-ink-faint font-mono text-[11px]" textAnchor="end">LESS RISK</text>
        <path d="M162 451 V69 A28 28 0 0 1 218 69 V451 A48 48 0 1 1 162 451 Z" className="fill-lavender-soft stroke-ink" strokeWidth="1.5" />
        <rect x="177" y="70" width="26" height="398" rx="13" className="fill-paper" />
        <rect x="177" y={y(protocol.estimate)} width="26" height={475 - y(protocol.estimate)} rx="13" className="risk-mercury fill-violet-deep" />
        <circle cx="190" cy="490" r="33" className="fill-violet-deep" />
        <circle cx="190" cy="490" r="42" className="fill-none stroke-violet/30" strokeWidth="1" />
        <path d="M180 479 A18 18 0 0 0 179 502" className="fill-none stroke-lavender" strokeWidth="3" strokeLinecap="round" />
        <rect x="237" y={y(protocol.range[1])} width="22" height={y(protocol.range[0]) - y(protocol.range[1])} className="risk-mercury fill-lavender stroke-violet" strokeDasharray="3 3" />
        <g className="risk-marker" style={{ transform: `translateY(${y(protocol.estimate)}px)` }}>
          <line x1="156" x2="262" y1="0" y2="0" className="stroke-violet-deep" strokeWidth="1.5" />
          <path d="M270 -5 L264 0 L270 5" className="fill-none stroke-violet-deep" strokeWidth="1.5" />
          <text x="281" y="5" className="fill-violet-deep font-mono text-[16px]">{protocol.estimate}</text>
        </g>
        <text x="190" y="553" textAnchor="middle" className="fill-ink-faint font-mono text-[10px]">MARKET-IMPLIED · 0–100</text>
      </svg>
    </Button>
  );
}