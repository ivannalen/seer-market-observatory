import { useState } from "react";
import { ChevronLeft, ChevronRight, Power, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RiskProtocol } from "@/data/seer";

export function RiskThermometer({ protocol, onExplore, expanded, onPrevious, onNext }: {
  protocol: RiskProtocol; onExplore: () => void; expanded: boolean;
  onPrevious: () => void; onNext: () => void;
}) {
  const [powered, setPowered] = useState(true);
  const [rangeMode, setRangeMode] = useState(false);
  return (
    <div className="risk-device-instrument">
      <div className="risk-device" data-powered={powered}>
        <div className="risk-device-probe" aria-hidden="true"><span /><span /><span /><span /><span /></div>
        <div className="risk-device-body">
          <div className="risk-device-brand"><span className="font-display text-xl">Seer<span className="text-violet">.</span></span><span className="font-mono text-[9px] text-ink-faint">R / 01</span></div>
          <Button variant="ghost" disabled={!powered} onClick={onExplore} aria-expanded={expanded} aria-controls="risk-diagnosis"
            aria-label={`Explore ${protocol.name} diagnosis: estimate ${protocol.estimate} out of 100, uncertainty ${protocol.range[0]} to ${protocol.range[1]}`}
            title="Open diagnosis"
            className="risk-device-screen">
            <span className="risk-device-screen-top"><span>RISKOMETER</span><span>{powered ? "DEMO" : "OFF"}</span></span>
            <span key={`${protocol.id}-${rangeMode}-${powered}`} className="risk-device-digits">{powered ? (rangeMode ? `${protocol.range[0]}–${protocol.range[1]}` : String(protocol.estimate).padStart(2, "0")) : "— —"}<span className="risk-device-unit">/100</span></span>
            <span className="risk-device-screen-bottom">{powered ? (rangeMode ? "UNCERTAINTY RANGE" : "MARKET-IMPLIED RISK") : "STANDBY"}</span>
            {powered && <span className="risk-device-screen-hint">Tap screen for diagnosis</span>}
          </Button>
          <div className="risk-device-buttons">
            <span className="risk-device-button-cell">
              <Button variant="ghost" size="icon" aria-label={powered ? "Turn Riskometer off" : "Turn Riskometer on"} aria-pressed={powered} onClick={() => setPowered(value => !value)} title={powered ? "Power off" : "Power on"} className="risk-device-power"><Power /></Button>
              <span className="risk-device-button-label">Power</span>
            </span>
            <span className="risk-device-button-cell">
              <Button variant="ghost" size="icon" disabled={!powered} aria-label="Show uncertainty on device" aria-pressed={rangeMode} onClick={() => setRangeMode(value => !value)} title="Estimate / uncertainty" className="risk-device-mode"><SlidersHorizontal /></Button>
              <span className="risk-device-button-label">Range</span>
            </span>
          </div>
          <div className="risk-device-footer"><span className="risk-device-led" data-on={powered} /><span>{powered ? "ILLUSTRATIVE READING" : "POWER OFF"}</span></div>
        </div>
      </div>
      <div className="risk-device-scale" role="img" aria-label={`Risk scale 0 to 100. Estimate ${protocol.estimate}. Range ${protocol.range[0]} to ${protocol.range[1]}.`}>
        <svg viewBox="0 0 500 64" aria-hidden="true">
          <line x1="20" x2="480" y1="25" y2="25" className="stroke-rule-ink" />
          {Array.from({length: 21}, (_, i) => i * 5).map(v => <g key={v}><line x1={20 + v * 4.6} x2={20 + v * 4.6} y1="25" y2={v % 25 === 0 ? 36 : 30} className="stroke-rule-ink" />{v % 25 === 0 && <text x={20 + v * 4.6} y="52" textAnchor="middle" className="fill-ink-faint font-mono text-[11px]">{v}</text>}</g>)}
          <rect x={20 + protocol.range[0] * 4.6} y="13" width={(protocol.range[1] - protocol.range[0]) * 4.6} height="12" className="risk-mercury fill-lavender stroke-violet" strokeDasharray="3 3" />
          <g className="risk-marker" style={{transform: `translateX(${20 + protocol.estimate * 4.6}px)`}}><path d="M-5 2 L5 2 L0 10 Z" className="fill-violet-deep" /><line y1="10" y2="32" className="stroke-violet-deep" strokeWidth="2" /></g>
        </svg>
        <div className="flex justify-between text-[10px] font-mono text-ink-faint"><span>LESS RISK</span><span>MORE RISK</span></div>
      </div>
      <div className="risk-device-navigation">
        <Button variant="ghost" size="icon" onClick={onPrevious} aria-label="Previous protocol" title="Previous protocol"><ChevronLeft /></Button>
        <span aria-live="polite" className="min-w-0 text-center text-xs text-ink-soft">{protocol.name}<span className="mt-1 block text-[10px] text-ink-faint">{protocol.category}</span></span>
        <Button variant="ghost" size="icon" onClick={onNext} aria-label="Next protocol" title="Next protocol"><ChevronRight /></Button>
      </div>
    </div>
  );
}
