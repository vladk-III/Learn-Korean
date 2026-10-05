import { coverageLabel } from "@/lib/store";

// Only the i+1 sweet spot gets the orange accent; everything else stays neutral.
const TONE = {
  easy: "pill pill-soft",
  sweet: "pill",
  stretch: "pill pill-outline",
  hard: "pill pill-outline",
};

export default function CoverageBadge({ pct, compact = false }: { pct: number; compact?: boolean }) {
  const { label, tone } = coverageLabel(pct);
  return (
    <span className={TONE[tone]}>
      {Math.round(pct * 100)}% known{compact ? "" : ` · ${label}`}
    </span>
  );
}
