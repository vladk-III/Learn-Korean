"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Clapperboard, PartyPopper, Volume2, X } from "lucide-react";
import { Rating, formatInterval } from "@/lib/fsrs";
import { speak } from "@/lib/speech";
import { tokenize } from "@/lib/analyzer";
import type { Verdict } from "@/lib/text";
import {
  actions,
  dueCards,
  getData,
  newQueue,
  pickExercise,
  scheduler,
  useData,
  useHydrated,
  type Exercise,
  type Skill,
} from "@/lib/store";
import { ClozeExercise, ListenExercise, RebuildExercise, ShadowExercise } from "@/components/Exercises";

const FOCUS: { v: Skill | undefined; label: string; emoji: string }[] = [
  { v: undefined, label: "Mixed", emoji: "🎯" },
  { v: "reading", label: "Reading", emoji: "🧩" },
  { v: "writing", label: "Writing", emoji: "✍️" },
  { v: "listening", label: "Listening", emoji: "🎧" },
  { v: "speaking", label: "Speaking", emoji: "🗣️" },
];

const RATING_STYLE: Record<Rating, string> = {
  [Rating.Again]: "bg-rose-500",
  [Rating.Hard]: "bg-amber-500",
  [Rating.Good]: "bg-emerald-500",
  [Rating.Easy]: "bg-sky-500",
};

const VERDICT_TO_RATING: Record<Verdict, Rating> = {
  correct: Rating.Good,
  close: Rating.Hard,
  wrong: Rating.Again,
};

const LEARNING_WINDOW = 20 * 60_000; // re-show learning-step cards due within the session

export default function Review() {
  const d = useData();
  const hydrated = useHydrated();
  const [queue, setQueue] = useState<string[] | null>(null);
  const [focus, setFocus] = useState<Skill | undefined>(undefined);
  const [result, setResult] = useState<{ v: Verdict | null; detail?: string } | null>(null);
  const [stats, setStats] = useState({ done: 0, correct: 0 });

  const card = queue?.length ? d.cards.find((c) => c.id === queue[0]) : undefined;
  const exercise: Exercise | undefined = useMemo(() => {
    if (!card) return undefined;
    const ex = pickExercise(d, card, focus);
    // Rebuilding a 1–2 word sentence is trivial, use cloze instead.
    return ex === "rebuild" && tokenize(card.sentence).length < 3 ? "cloze" : ex;
    // Pick once per card appearance, not on every store change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card?.id, card?.fsrs.reps, focus]);

  if (!hydrated) return null;

  const due = dueCards(d);
  const fresh = newQueue(d);

  const start = () => {
    setStats({ done: 0, correct: 0 });
    setResult(null);
    setQueue([...due, ...fresh].map((c) => c.id));
  };

  // ---------- start screen ----------
  if (!queue) {
    const total = due.length + fresh.length;
    return (
      <div className="pt-safe px-4">
        <h1 className="pt-5 text-2xl font-extrabold">복습 Review</h1>
        <p className="muted text-sm">Active recall with FSRS spacing. Reviews first, then new cards.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="card p-4">
            <p className="text-3xl font-extrabold text-rose-500">{due.length}</p>
            <p className="muted text-sm">due reviews</p>
          </div>
          <div className="card p-4">
            <p className="text-brand-500 text-3xl font-extrabold">{fresh.length}</p>
            <p className="muted text-sm">
              new today (cap {d.settings.newPerDay})
            </p>
          </div>
        </div>

        <h2 className="mt-6 mb-2 text-sm font-bold tracking-wide uppercase">Skill focus</h2>
        <div className="grid grid-cols-5 gap-2">
          {FOCUS.map((f) => (
            <button
              key={f.label}
              onClick={() => setFocus(f.v)}
              className={`flex flex-col items-center rounded-2xl border-2 py-3 text-[11px] font-bold ${
                focus === f.v ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "hairline"
              }`}
            >
              <span className="text-2xl">{f.emoji}</span>
              {f.label}
            </button>
          ))}
        </div>

        {total > 0 ? (
          <button
            onClick={start}
            className="bg-brand-500 mt-6 w-full rounded-2xl py-4 text-lg font-bold text-white shadow-[0_4px_0_var(--color-brand-700)] active:translate-y-1 active:shadow-none"
          >
            Start {total} card{total > 1 ? "s" : ""}
          </button>
        ) : (
          <div className="card mt-6 p-5 text-center">
            <p className="text-4xl">🌱</p>
            <p className="mt-2 font-bold">Nothing due right now</p>
            <p className="muted text-sm">
              {d.cards.length === 0
                ? "Tap words in a news story or clip and press “Mine sentence” to build your deck."
                : "Go read or watch something new and mine a few sentences."}
            </p>
            <div className="mt-4 flex gap-2">
              <Link href="/news/" className="card flex flex-1 items-center justify-center gap-2 py-3 font-semibold">
                <BookOpen size={18} /> News
              </Link>
              <Link href="/clips/" className="card flex flex-1 items-center justify-center gap-2 py-3 font-semibold">
                <Clapperboard size={18} /> Clips
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------- finished ----------
  if (!card || !exercise) {
    return (
      <div className="pt-safe flex flex-col items-center px-6 pt-16 text-center">
        <PartyPopper size={64} className="text-amber-500" />
        <h1 className="mt-4 text-3xl font-extrabold">수고했어요!</h1>
        <p className="muted">Session complete</p>
        <p className="mt-4 text-lg">
          {stats.done} reviews · {stats.done ? Math.round((stats.correct / stats.done) * 100) : 0}% recalled
        </p>
        <p className="muted mt-2 text-sm">Mining is unlocked. Find your next i+1 sentence:</p>
        <div className="mt-6 flex w-full gap-2">
          <Link href="/news/" className="bg-brand-500 flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 font-bold text-white">
            <BookOpen size={18} /> News
          </Link>
          <Link href="/clips/" className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-fuchsia-500 py-3 font-bold text-white">
            <Clapperboard size={18} /> Clips
          </Link>
        </div>
        <button onClick={() => setQueue(null)} className="muted mt-6 text-sm underline">
          Back to review overview
        </button>
      </div>
    );
  }

  const previews = scheduler(d).repeat(card.fsrs);
  const suggested = result ? (result.v ? VERDICT_TO_RATING[result.v] : null) : null;

  const rate = (r: Rating) => {
    actions.review(card.id, r, exercise, result?.v == null ? null : result.v !== "wrong");
    setStats((s) => ({ done: s.done + 1, correct: s.correct + (r === Rating.Again ? 0 : 1) }));
    setResult(null);
    const updated = getData().cards.find((c) => c.id === card.id);
    setQueue((q) => {
      const rest = (q ?? []).slice(1);
      // Learning steps (1–10 min) come back later in this same session.
      return updated && updated.fsrs.due - Date.now() < LEARNING_WINDOW ? [...rest, card.id] : rest;
    });
  };

  const props = { card, rate: d.settings.ttsRate, onResult: (v: Verdict | null, detail?: string) => setResult({ v, detail }) };
  const progress = stats.done / (stats.done + queue.length);

  return (
    <div className="pt-safe px-4">
      <div className="flex items-center gap-3 pt-4">
        <button onClick={() => setQueue(null)} aria-label="End session" className="muted p-1">
          <X />
        </button>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress * 100}%` }} />
        </div>
        <span className="muted text-sm font-bold">{queue.length}</span>
      </div>

      <div className="mt-6" key={`${card.id}-${card.fsrs.reps}`}>
        {!result ? (
          exercise === "cloze" ? (
            <ClozeExercise {...props} />
          ) : exercise === "listen" ? (
            <ListenExercise {...props} />
          ) : exercise === "rebuild" ? (
            <RebuildExercise {...props} />
          ) : (
            <ShadowExercise {...props} />
          )
        ) : (
          <div className="animate-pop space-y-4">
            <div
              className={`rounded-2xl p-4 font-bold ${
                result.v === "correct"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : result.v === "close"
                    ? "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200"
                    : result.v === "wrong"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300"
                      : "card"
              }`}
            >
              {result.v === "correct" ? "정답! Correct" : result.v === "close" ? "Almost!" : result.v === "wrong" ? "Not quite" : "How did it go?"}
              {result.detail && <p className="mt-1 text-sm font-medium">{result.detail}</p>}
            </div>
            <div className="card p-4">
              <div className="flex items-start gap-2">
                <button onClick={() => speak(card.sentence, { rate: d.settings.ttsRate })} aria-label="Play" className="text-brand-500 mt-1.5">
                  <Volume2 size={20} />
                </button>
                <div>
                  <p className="ko text-xl">
                    {card.sentence.split(card.target).map((part, i, arr) => (
                      <span key={i}>
                        {part}
                        {i < arr.length - 1 && <b className="text-brand-600 dark:text-brand-400">{card.target}</b>}
                      </span>
                    ))}
                  </p>
                  {card.translation && <p className="muted">{card.translation}</p>}
                </div>
              </div>
              <p className="mt-3 text-sm">
                <b>{card.lemma}</b> — {card.gloss}
              </p>
              {card.notes.length > 0 && <p className="muted text-xs">{card.notes.join(" · ")}</p>}
              <p className="muted mt-2 text-xs">from {card.sourceTitle}</p>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="pb-safe fixed inset-x-0 bottom-20 z-20 mx-auto grid max-w-xl grid-cols-4 gap-2 px-4">
          {([Rating.Again, Rating.Hard, Rating.Good, Rating.Easy] as Rating[]).map((r) => (
            <button
              key={r}
              onClick={() => rate(r)}
              className={`${RATING_STYLE[r]} rounded-2xl py-3 text-white transition-transform ${
                suggested === r ? "ring-4 ring-black/20 dark:ring-white/40 scale-105" : suggested ? "opacity-70" : ""
              }`}
            >
              <span className="block text-sm font-extrabold">{Rating[r]}</span>
              <span className="block text-xs opacity-90">{formatInterval(previews[r].card.due - Date.now())}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
