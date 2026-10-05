import { TINT, type Tint } from "@/lib/tints";

/** Thin progress arc, like the timer rings in the reference. */
export default function Arc({ value, size = 44, tone }: { value: number; size?: number; tone?: Tint }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} className="-rotate-90">
      <circle cx="22" cy="22" r={r} fill="none" strokeWidth="5" className="stroke-sheet" />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - Math.max(0.02, Math.min(1, value)))}
        className={`${tone ? TINT[tone].stroke : "stroke-ink"} transition-all duration-700`}
      />
    </svg>
  );
}
