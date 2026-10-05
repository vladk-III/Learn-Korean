import { coverageLabel } from "@/lib/store";

// Green = easy, orange = the i+1 sweet spot, yellow = stretch, rose = hard.
const TONE = {
  easy: "pill bg-sage-soft text-sage",
  sweet: "pill",
  stretch: "pill bg-butter-soft text-butter",
  hard: "pill bg-rose-soft text-rose",
};

export default function CoverageBadge({ pct, compact = false }: { pct: number; compact?: boolean }) {
  const { label, tone } = coverageLabel(pct);
  return (
    <span className={TONE[tone]}>
      {Math.round(pct * 100)}% known{compact ? "" : ` · ${label}`}
    </span>
  );
}
