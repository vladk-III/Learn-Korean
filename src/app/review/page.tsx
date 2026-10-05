"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronRight,
  Clapperboard,
  Ear,
  Mic,
  PenLine,
  Puzzle,
  Shuffle,
  SquareStack,
  Volume2,
  X,
} from "lucide-react";
import Arc from "@/components/Arc";
import { tintCircle } from "@/lib/tints";
import { Rating, State, formatInterval } from "@/lib/fsrs";
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

const FOCUS: { v: Skill | undefined; label: string; icon: typeof Mic }[] = [
  { v: undefined, label: "Mixed", icon: Shuffle },
  { v: "reading", label: "Reading", icon: Puzzle },
  { v: "writing", label: "Writing", icon: PenLine },
  { v: "listening", label: "Listening", icon: Ear },
  { v: "speaking", label: "Speaking", icon: Mic },
];

// Again rose · Hard butter · Good sage · Easy sky; the suggested one is filled in.
const RATING: Record<Rating, { ink: string; solid: string }> = {
  [Rating.Again]: { ink: "text-rose", solid: "bg-rose" },
  [Rating.Hard]: { ink: "text-butter", solid: "bg-butter" },
  [Rating.Good]: { ink: "text-sage", solid: "bg-sage" },
  [Rating.Easy]: { ink: "text-sky", solid: "bg-sky" },
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

  const now = Date.now();
  // Words missed in post-reading quizzes that haven't matured yet.
  const missed = d.cards
    .filter((c) => c.fromQuiz && !(c.fsrs.state === State.Review && c.fsrs.stability >= 21))
    .sort((a, b) => b.createdAt - a.createdAt);
  // Practising missed words on demand bypasses the daily new-card cap.
  const missedReady = missed.filter((c) => c.fsrs.state === State.New || c.fsrs.due <= now);

  const start = (ids = [...due, ...fresh].map((c) => c.id)) => {
    setStats({ done: 0, correct: 0 });
    setResult(null);
    setQueue(ids);
  };

  // ---------- start screen ----------
  if (!queue) {
    const total = due.length + fresh.length;
    return (
      <div className="pt-safe">
        <header className="flex items-start justify-between px-5 pt-6 pb-7">
          <h1 className="display text-[2.6rem]">
            Review
            <span className="muted block">복습</span>
          </h1>
          <Link
            href="/study/"
            aria-label="Flashcards and games"
            className={`mt-1 flex size-12 items-center justify-center rounded-full ${tintCircle("sage")}`}
          >
            <SquareStack size={20} strokeWidth={1.75} />
          </Link>
        </header>

        <div className="sheet min-h-[75dvh] px-5 pt-6 pb-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex min-h-36 flex-col justify-between rounded-[1.4rem] bg-peach-soft p-4">
              <div className="flex items-start justify-between">
                <p className="leading-tight font-medium">
                  Due
                  <br />
                  reviews
                </p>
                <Arc value={due.length ? 0.25 : 1} tone="peach" />
              </div>
              <p className="num-thin text-[2.6rem] leading-none">{due.length}</p>
            </div>
            <div className="flex min-h-36 flex-col justify-between rounded-[1.4rem] bg-sky-soft p-4">
              <div className="flex items-start justify-between">
                <p className="leading-tight font-medium">
                  New
                  <br />
                  today
                </p>
                <Arc value={1 - fresh.length / Math.max(1, d.settings.newPerDay)} tone="sky" />
              </div>
              <p className="num-thin text-[2.6rem] leading-none">
                {fresh.length}
                <span className="muted text-2xl">/{d.settings.newPerDay}</span>
              </p>
            </div>
          </div>

          <p className="label mt-7">Skill focus</p>
          <div className="no-scrollbar -mx-5 mt-2 flex gap-1 overflow-x-auto px-5">
            {FOCUS.map((f) => (
              <button
                key={f.label}
                onClick={() => setFocus(f.v)}
                aria-pressed={focus === f.v}
                className="chip flex items-center gap-1.5"
              >
                <f.icon size={15} strokeWidth={1.75} />
                {f.label}
              </button>
            ))}
          </div>

          {total > 0 ? (
            <button onClick={() => start()} className="btn btn-ink mt-6 h-14 w-full text-base">
              Start {total} card{total > 1 ? "s" : ""}
            </button>
          ) : (
            <div className="tile mt-6 p-5">
              <p className="text-lg font-semibold tracking-tight">Nothing due right now</p>
              <p className="muted mt-0.5 text-[15px]">
                {d.cards.length === 0
                  ? "Tap words in a story or clip and save the sentence to build your deck."
                  : "Read or watch something new and save a few sentences."}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link href="/news/" className="btn btn-ink h-12">
                  <BookOpen size={17} strokeWidth={1.75} /> News
                </Link>
                <Link href="/clips/" className="btn bg-sheet h-12">
                  <Clapperboard size={17} strokeWidth={1.75} /> Clips
                </Link>
              </div>
            </div>
          )}

          <Link href="/study/" className="card mt-3 flex items-center gap-4 px-4 py-4">
            <span className={`${tintCircle("sage")} size-12`}>
              <SquareStack size={20} strokeWidth={1.75} />
            </span>
            <div className="flex-1">
              <p className="font-semibold">Flashcards &amp; Type It!</p>
              <p className="muted text-[15px]">Extra practice, any time</p>
            </div>
            <ChevronRight size={18} className="muted" />
          </Link>

          {missed.length > 0 && (
            <section className="mt-9">
              <div className="flex items-baseline justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">Missed in quizzes</h2>
                <span className="muted text-[15px]">{missed.length}</span>
              </div>
              <ul className="mt-3 space-y-2">
                {missed.slice(0, 30).map((c) => (
                  <li key={c.id} className="card flex items-center gap-3 px-4 py-3">
                    <button
                      onClick={() => speak(c.target, { rate: d.settings.ttsRate })}
                      aria-label="Play"
                      className={`${tintCircle("rose")} size-10`}
                    >
                      <Volume2 size={16} strokeWidth={1.75} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="ko font-semibold">{c.lemma}</p>
                      <p className="muted truncate text-sm">{c.gloss}</p>
                    </div>
                    <span className={c.fsrs.state === State.New || c.fsrs.due <= now ? "pill" : "pill pill-outline"}>
                      {c.fsrs.state === State.New ? "new" : c.fsrs.due <= now ? "due" : formatInterval(c.fsrs.due - now)}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => start(missedReady.map((c) => c.id))}
                disabled={missedReady.length === 0}
                className="btn btn-accent mt-3 h-13 w-full py-3.5"
              >
                {missedReady.length
                  ? `Practise ${missedReady.length} missed word${missedReady.length > 1 ? "s" : ""}`
                  : "All scheduled — nothing due yet"}
              </button>
            </section>
          )}
        </div>
      </div>
    );
  }

  // ---------- finished ----------
  if (!card || !exercise) {
    const pct = stats.done ? Math.round((stats.correct / stats.done) * 100) : 0;
    return (
      <div className="pt-safe px-5 pt-12">
        <h1 className="display text-[2.6rem]">
          수고했어요
          <span className="muted block">Session done</span>
        </h1>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="rounded-[1.4rem] bg-sky-soft p-4">
            <p className="font-medium">Reviewed</p>
            <p className="num-thin mt-6 text-[2.6rem] leading-none">{stats.done}</p>
          </div>
          <div className="rounded-[1.4rem] bg-sage-soft p-4">
            <p className="font-medium">Recalled</p>
            <p className="num-thin mt-6 text-[2.6rem] leading-none">
              {pct}
              <span className="muted text-2xl">%</span>
            </p>
          </div>
        </div>
        <p className="sub mt-6 text-[15px]">Saving is unlocked. Find your next i+1 sentence:</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link href="/news/" className="btn btn-ink h-13 py-3.5">
            <BookOpen size={17} strokeWidth={1.75} /> News
          </Link>
          <Link href="/clips/" className="btn btn-line h-13 py-3.5">
            <Clapperboard size={17} strokeWidth={1.75} /> Clips
          </Link>
        </div>
        <button onClick={() => setQueue(null)} className="muted mt-6 w-full text-center text-sm">
          Back to review
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
    <div className="pt-safe px-5 pb-36">
      <div className="flex items-center gap-3 pt-5">
        <button onClick={() => setQueue(null)} aria-label="End session" className="icon-circle size-10 bg-sheet">
          <X size={18} strokeWidth={1.75} />
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-ink transition-all" style={{ width: `${progress * 100}%` }} />
        </div>
        <span className="label tabular-nums">{queue.length} left</span>
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
          <div className="animate-pop space-y-3">
            <div className="flex items-center gap-3">
              <span
                className={`pill ${
                  result.v === "correct" ? "bg-good" : result.v === "close" ? "" : result.v === "wrong" ? "bg-bad" : "pill-soft"
                }`}
              >
                {result.v === "correct" ? "Correct" : result.v === "close" ? "Almost" : result.v === "wrong" ? "Not quite" : "Self-check"}
              </span>
              {result.detail && <p className="sub min-w-0 flex-1 text-sm">{result.detail}</p>}
            </div>
            <div className="card p-5">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => speak(card.sentence, { rate: d.settings.ttsRate })}
                  aria-label="Play"
                  className={`${tintCircle("sky")} size-10`}
                >
                  <Volume2 size={17} strokeWidth={1.75} />
                </button>
                <div>
                  <p className="ko text-xl">
                    {card.sentence.split(card.target).map((part, i, arr) => (
                      <span key={i}>
                        {part}
                        {i < arr.length - 1 && <b className="rounded-md bg-accent-soft px-0.5">{card.target}</b>}
                      </span>
                    ))}
                  </p>
                  {card.translation && <p className="sub text-[15px]">{card.translation}</p>}
                </div>
              </div>
              <div className="tile mt-4 px-4 py-3">
                <p className="text-[15px]">
                  <b className="ko">{card.lemma}</b> <span className="muted">—</span> {card.gloss}
                </p>
                {card.notes.length > 0 && <p className="muted text-xs">{card.notes.join(" · ")}</p>}
              </div>
              <p className="label mt-3">from {card.sourceTitle}</p>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="fixed inset-x-0 bottom-24 z-20 mx-auto max-w-xl px-5">
          <div className="grid grid-cols-4 gap-1.5 rounded-full bg-sheet p-1.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)]">
            {([Rating.Again, Rating.Hard, Rating.Good, Rating.Easy] as Rating[]).map((r) => (
              <button
                key={r}
                onClick={() => rate(r)}
                className={`rounded-full py-2.5 transition-colors ${
                  suggested === r ? `${RATING[r].solid} text-white` : RATING[r].ink
                }`}
              >
                <span className="block text-sm font-semibold">{Rating[r]}</span>
                <span className={`block text-xs ${suggested === r ? "opacity-80" : "muted"}`}>
                  {formatInterval(previews[r].card.due - Date.now())}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
