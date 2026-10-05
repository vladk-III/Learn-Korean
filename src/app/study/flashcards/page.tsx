"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BookmarkPlus, Check, RotateCcw, Shuffle, Volume2, X } from "lucide-react";
import { romanize } from "@/lib/hangul";
import { speak } from "@/lib/speech";
import { shuffle } from "@/lib/text";
import { findSet, type StudyItem } from "@/lib/study";
import { actions, useData, useHydrated } from "@/lib/store";

function Highlighted({ sentence, target }: { sentence: string; target?: string }) {
  if (!target || !sentence.includes(target)) return <>{sentence}</>;
  const i = sentence.indexOf(target);
  return (
    <>
      {sentence.slice(0, i)}
      <b className="text-brand-600 dark:text-brand-400">{target}</b>
      {sentence.slice(i + target.length)}
    </>
  );
}

function Flashcards() {
  const setId = useSearchParams().get("set") ?? "";
  const d = useData();
  const hydrated = useHydrated();
  const set = useMemo(() => (hydrated ? findSet(d, setId) : undefined), [hydrated, setId]); // eslint-disable-line react-hooks/exhaustive-deps

  const [koFirst, setKoFirst] = useState(true);
  const [shuffled, setShuffled] = useState(true);
  const [round, setRound] = useState<StudyItem[]>([]);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [know, setKnow] = useState<StudyItem[]>([]);
  const [learning, setLearning] = useState<StudyItem[]>([]);
  const [roundNo, setRoundNo] = useState(1);
  const [addedCount, setAddedCount] = useState<number | null>(null);
  const [dx, setDx] = useState(0);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);

  const startRound = (items: StudyItem[], doShuffle = shuffled) => {
    setRound(doShuffle ? shuffle(items, Date.now()) : items);
    setI(0);
    setFlipped(false);
    setKnow([]);
    setLearning([]);
    setAddedCount(null);
  };

  useEffect(() => {
    if (set) startRound(set.items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set]);

  const card = round[i];
  const done = round.length > 0 && i >= round.length;

  const answer = (known: boolean) => {
    if (!card) return;
    (known ? setKnow : setLearning)((l) => [...l, card]);
    setFlipped(false);
    setDx(0);
    setI((n) => n + 1);
  };

  // Keyboard: space flips, → knows, ← still learning.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done || !card) return;
      if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") answer(true);
      else if (e.key === "ArrowLeft") answer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!hydrated) return null;
  if (!set)
    return (
      <div className="p-6">
        <p>Set not found.</p>
        <Link href="/study/" className="text-brand-600 font-semibold">
          Back to study
        </Link>
      </div>
    );

  const front = (it: StudyItem) =>
    koFirst ? (
      <>
        <p className="ko text-5xl font-extrabold">{it.ko}</p>
        <p className="muted mt-2">{romanize(it.ko)}</p>
      </>
    ) : (
      <p className="text-3xl font-bold">{it.en}</p>
    );

  const back = (it: StudyItem) => (
    <>
      {koFirst ? (
        <p className="text-2xl font-bold">{it.en}</p>
      ) : (
        <>
          <p className="ko text-4xl font-extrabold">{it.ko}</p>
          <p className="muted mt-1">{romanize(it.ko)}</p>
        </>
      )}
      {it.sentence && (
        <div className="mt-5 text-left">
          <p className="ko text-lg">
            <Highlighted sentence={it.sentence} target={it.target} />
          </p>
          {it.sentenceEn && <p className="muted text-sm">{it.sentenceEn}</p>}
        </div>
      )}
    </>
  );

  const addToReview = () => {
    const n = actions.addMissedWords(
      learning
        .filter((it) => it.sentence && it.target)
        .map((it) => ({
          sentence: it.sentence!,
          translation: it.sentenceEn ?? "",
          target: it.target!,
          lemma: it.ko,
          gloss: it.en,
          notes: it.notes,
          sourceId: it.sourceId,
          sourceTitle: it.sourceTitle,
          sourceKind: it.sourceKind,
        })),
    );
    setAddedCount(n);
  };

  return (
    <div className="pt-safe flex min-h-[calc(100dvh-5rem)] flex-col px-4">
      <header className="flex items-center gap-2 pt-4">
        <Link href="/study/" aria-label="Back" className="p-1">
          <ArrowLeft />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="ko truncate font-bold">{set.title}</p>
          <p className="muted text-xs">
            Flashcards · round {roundNo} · {Math.min(i + 1, round.length)}/{round.length}
          </p>
        </div>
        <button
          onClick={() => {
            setKoFirst((k) => !k);
            setFlipped(false);
          }}
          className="card px-3 py-1.5 text-xs font-bold"
          aria-label="Switch which side shows first"
        >
          {koFirst ? "한 → EN" : "EN → 한"}
        </button>
        <button
          onClick={() => {
            setShuffled((s) => !s);
            startRound(set.items, !shuffled);
            setRoundNo(1);
          }}
          aria-label="Toggle shuffle"
          className={`card p-2 ${shuffled ? "text-brand-600 dark:text-brand-400" : "muted"}`}
        >
          <Shuffle size={16} />
        </button>
      </header>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
        <div className="flex h-full">
          <div className="bg-emerald-500 transition-all" style={{ width: `${(know.length / Math.max(1, round.length)) * 100}%` }} />
          <div className="bg-amber-500 transition-all" style={{ width: `${(learning.length / Math.max(1, round.length)) * 100}%` }} />
        </div>
      </div>

      {!done && card ? (
        <>
          <div
            className="flip relative mt-6 flex-1 touch-pan-y select-none"
            style={{ transform: `translateX(${dx}px) rotate(${dx / 25}deg)`, transition: drag.current ? "none" : "transform 0.2s" }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              drag.current = { x: e.clientX, moved: false };
            }}
            onPointerMove={(e) => {
              if (!drag.current) return;
              const delta = e.clientX - drag.current.x;
              if (Math.abs(delta) > 8) drag.current.moved = true;
              setDx(delta);
            }}
            onPointerUp={() => {
              const moved = drag.current?.moved;
              drag.current = null;
              if (dx > 90) answer(true);
              else if (dx < -90) answer(false);
              else {
                setDx(0);
                if (!moved) setFlipped((f) => !f);
              }
            }}
            onPointerCancel={() => {
              drag.current = null;
              setDx(0);
            }}
          >
            {/* Keyed per card so a new card never animates in from its answer side. */}
            <div key={`${roundNo}-${i}`} className={`flip-inner relative h-full min-h-80 ${flipped ? "flipped" : ""}`}>
              <div className="flip-face card absolute inset-0 flex flex-col items-center justify-center p-6 text-center shadow-sm">
                {front(card)}
                <p className="muted absolute bottom-4 text-xs">Tap to flip · swipe → know · ← still learning</p>
              </div>
              <div className="flip-face flip-back card absolute inset-0 flex flex-col items-center justify-center overflow-y-auto p-6 text-center shadow-sm">
                {back(card)}
              </div>
            </div>
            {dx !== 0 && (
              <span
                className={`absolute top-4 rounded-xl border-4 px-3 py-1 text-lg font-extrabold ${
                  dx > 0 ? "left-4 -rotate-12 border-emerald-500 text-emerald-500" : "right-4 rotate-12 border-amber-500 text-amber-500"
                }`}
                style={{ opacity: Math.min(1, Math.abs(dx) / 90) }}
              >
                {dx > 0 ? "KNOW" : "LEARNING"}
              </span>
            )}
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={() => speak(card.ko, { rate: d.settings.ttsRate })}
              aria-label="Play audio"
              className="bg-brand-500 absolute top-4 right-4 z-10 rounded-full p-2.5 text-white"
            >
              <Volume2 size={18} />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 pb-4">
            <button
              onClick={() => answer(false)}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-amber-500 py-3.5 font-bold text-amber-600"
            >
              <X size={20} /> Still learning
            </button>
            <button
              onClick={() => answer(true)}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-500 py-3.5 font-bold text-emerald-600"
            >
              <Check size={20} /> Know it
            </button>
          </div>
        </>
      ) : (
        <div className="animate-pop mt-10 text-center">
          <p className="text-5xl">{learning.length === 0 ? "🎉" : "📚"}</p>
          <h2 className="mt-2 text-2xl font-extrabold">
            {learning.length === 0 ? "You know them all!" : `Round ${roundNo} done`}
          </h2>
          <p className="muted mt-1">
            <b className="text-emerald-600">{know.length} know</b> ·{" "}
            <b className="text-amber-600">{learning.length} still learning</b>
          </p>

          {learning.length > 0 && (
            <ul className="card mt-4 divide-y divide-[var(--line)] text-left">
              {learning.slice(0, 20).map((it) => (
                <li key={it.ko} className="flex justify-between gap-3 px-4 py-2 text-sm">
                  <b className="ko">{it.ko}</b>
                  <span className="muted truncate">{it.en}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 grid gap-2">
            {learning.length > 0 && (
              <button
                onClick={() => {
                  setRoundNo((r) => r + 1);
                  startRound(learning);
                }}
                className="bg-brand-500 rounded-2xl py-3.5 font-bold text-white shadow-[0_4px_0_var(--color-brand-700)] active:translate-y-1 active:shadow-none"
              >
                Study the {learning.length} I&apos;m still learning
              </button>
            )}
            {learning.some((it) => it.sentence) &&
              (addedCount === null ? (
                <button onClick={addToReview} className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 font-bold text-white">
                  <BookmarkPlus size={18} /> Add them to my review deck
                </button>
              ) : (
                <p className="text-sm font-semibold text-emerald-600">
                  {addedCount > 0 ? `Added ${addedCount} to your review deck ✓` : "They're already in your review deck ✓"}
                </p>
              ))}
            <button
              onClick={() => {
                setRoundNo(1);
                startRound(set.items);
              }}
              className="hairline flex items-center justify-center gap-2 rounded-2xl border-2 py-3 font-bold"
            >
              <RotateCcw size={18} /> Restart all {set.items.length}
            </button>
            <Link href={`/study/type/?set=${encodeURIComponent(set.id)}`} className="muted py-2 text-sm font-semibold underline">
              Play Type It! with this set
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FlashcardsPage() {
  return (
    <Suspense>
      <Flashcards />
    </Suspense>
  );
}
