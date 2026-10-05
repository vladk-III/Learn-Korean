import type { Topic } from "@/content/types";

export type Tint = "peach" | "sage" | "sky" | "lilac" | "butter" | "rose";

// Full class names spelled out so Tailwind can see them.
export const TINT: Record<Tint, { soft: string; ink: string; stroke: string; solid: string; border: string }> = {
  peach: { soft: "bg-peach-soft", ink: "text-peach", stroke: "stroke-peach", solid: "bg-peach", border: "border-peach" },
  sage: { soft: "bg-sage-soft", ink: "text-sage", stroke: "stroke-sage", solid: "bg-sage", border: "border-sage" },
  sky: { soft: "bg-sky-soft", ink: "text-sky", stroke: "stroke-sky", solid: "bg-sky", border: "border-sky" },
  lilac: { soft: "bg-lilac-soft", ink: "text-lilac", stroke: "stroke-lilac", solid: "bg-lilac", border: "border-lilac" },
  butter: { soft: "bg-butter-soft", ink: "text-butter", stroke: "stroke-butter", solid: "bg-butter", border: "border-butter" },
  rose: { soft: "bg-rose-soft", ink: "text-rose", stroke: "stroke-rose", solid: "bg-rose", border: "border-rose" },
};

export const TOPIC_TINT: Record<Topic, Tint> = {
  Life: "butter",
  Society: "sky",
  Culture: "lilac",
  Tech: "sage",
  World: "peach",
  Security: "rose",
  Politics: "sky",
  Economy: "butter",
};

const ORDER: Tint[] = ["peach", "sky", "sage", "lilac", "butter", "rose"];
/** Stable tint for any id (e.g. a clip), cycling through the palette. */
export function tintFor(id: string): Tint {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return ORDER[Math.abs(h) % ORDER.length];
}

/** Soft tinted circle with a matching ink icon. */
export const tintCircle = (t: Tint) => `icon-circle ${TINT[t].soft} ${TINT[t].ink}`;
