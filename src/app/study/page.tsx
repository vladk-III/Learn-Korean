"use client";

import Link from "next/link";
import { ChevronRight, GraduationCap, Keyboard, Layers, ListChecks, SquareStack, Trophy } from "lucide-react";
import TopicIcon from "@/components/TopicIcon";
import { tintCircle } from "@/lib/tints";
import { studySets } from "@/lib/study";
import { useData, useHydrated } from "@/lib/store";

export default function Study() {
  const d = useData();
  const hydrated = useHydrated();
  if (!hydrated) return null;
  const sets = studySets(d);

  return (
    <div className="pt-safe">
      <header className="flex items-start justify-between px-5 pt-6 pb-7">
        <h1 className="display text-[2.6rem]">
          Study
          <span className="muted block">공부</span>
        </h1>
        <Link href="/review/" aria-label="Back to review" className={`mt-1 flex size-12 items-center justify-center rounded-full ${tintCircle("peach")}`}>
          <Layers size={20} strokeWidth={1.75} />
        </Link>
      </header>

      <div className="sheet min-h-[75dvh] px-5 pt-6 pb-6">
        <p className="sub text-[15px]">
          Flip flashcards or race the clock. Practice here doesn&apos;t change your review schedule, but you can send
          words you miss to your reviews.
        </p>

        <Link href="/exam/" className="mt-5 flex items-center gap-4 rounded-[1.4rem] bg-rose-soft p-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-rose text-white">
            <GraduationCap size={20} strokeWidth={1.75} />
          </span>
          <div className="flex-1">
            <p className="font-semibold">DLPT &amp; OPI exam prep</p>
            <p className="sub text-sm">Test format, resources, speaking drill</p>
          </div>
          <ChevronRight size={18} className="text-rose" />
        </Link>

        <ul className="mt-3 space-y-3">
          {sets.map((s) => {
            const best = Math.max(d.bestScores[`${s.id}:meaning`] ?? 0, d.bestScores[`${s.id}:listen`] ?? 0);
            return (
              <li key={s.id} className="card p-4">
                <div className="flex items-center gap-4">
                  {s.topic ? (
                    <TopicIcon topic={s.topic} />
                  ) : (
                    <span className={`${tintCircle(s.id === "missed" ? "rose" : "peach")} size-12`}>
                      {s.id === "missed" ? <ListChecks size={20} strokeWidth={1.75} /> : <Layers size={20} strokeWidth={1.75} />}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="ko truncate leading-snug font-semibold">{s.title}</p>
                    <p className="muted truncate text-sm">{s.subtitle}</p>
                  </div>
                  <span className="pill pill-outline shrink-0">{s.items.length} words</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link href={`/study/flashcards/?set=${encodeURIComponent(s.id)}`} className="btn btn-ink h-11 text-sm">
                    <SquareStack size={16} strokeWidth={1.75} /> Flashcards
                  </Link>
                  <Link href={`/study/type/?set=${encodeURIComponent(s.id)}`} className="btn h-11 bg-butter-soft text-sm text-butter">
                    <Keyboard size={16} strokeWidth={1.75} /> Type It!
                    {best > 0 && (
                      <span className="muted flex items-center gap-0.5 text-xs">
                        <Trophy size={11} /> {best}
                      </span>
                    )}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
