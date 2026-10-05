"use client";

import Link from "next/link";
import { Copy, Keyboard, Trophy } from "lucide-react";
import { studySets } from "@/lib/study";
import { useData, useHydrated } from "@/lib/store";

export default function Study() {
  const d = useData();
  const hydrated = useHydrated();
  if (!hydrated) return null;
  const sets = studySets(d);

  return (
    <div className="pt-safe px-4">
      <h1 className="pt-5 text-2xl font-extrabold">공부 Study</h1>
      <p className="muted text-sm">
        Flip flashcards or race the clock typing words. Practice here is extra — it doesn&apos;t change your review
        schedule, but you can send words you miss to your review deck.
      </p>

      <ul className="mt-4 space-y-3">
        {sets.map((s) => {
          const best = Math.max(d.bestScores[`${s.id}:meaning`] ?? 0, d.bestScores[`${s.id}:listen`] ?? 0);
          return (
            <li key={s.id} className="card p-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl leading-none">{s.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="ko leading-snug font-bold">{s.title}</p>
                  <p className="muted truncate text-xs">{s.subtitle}</p>
                  <p className="muted mt-0.5 flex items-center gap-2 text-xs font-semibold">
                    {s.items.length} words
                    {best > 0 && (
                      <span className="flex items-center gap-1 text-amber-600">
                        <Trophy size={12} /> {best}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  href={`/study/flashcards/?set=${encodeURIComponent(s.id)}`}
                  className="bg-brand-500 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white"
                >
                  <Copy size={16} /> Flashcards
                </Link>
                <Link
                  href={`/study/type/?set=${encodeURIComponent(s.id)}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white"
                >
                  <Keyboard size={16} /> Type It!
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
