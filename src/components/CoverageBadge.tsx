import { coverageLabel } from "@/lib/store";

const TONE = {
  easy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  sweet: "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400",
  stretch: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  hard: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
};

export default function CoverageBadge({ pct, compact = false }: { pct: number; compact?: boolean }) {
  const { label, tone } = coverageLabel(pct);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${TONE[tone]}`}>
      {Math.round(pct * 100)}% known{compact ? "" : ` · ${label}`}
    </span>
  );
}
