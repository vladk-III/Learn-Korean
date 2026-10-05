"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { BookmarkPlus, Check, RotateCcw, Shuffle, Volume2, X } from "lucide-react";
import { romanize } from "@/lib/hangul";
import PageHeader from "@/components/PageHeader";
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
      <b className="rounded-md bg-accent-soft px-0.5">{target}</b>
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
        <Link href="/study/" className="font-semibold underline">
          Back to study
        </Link>
      </div>
    );

  const front = (it: StudyItem) =>
    koFirst ? (
      <>
        <p className="ko display text-[3.4rem]">{it.ko}</p>
        <p className="muted mt-2 text-lg">{romanize(it.ko)}</p>
      </>
    ) : (
      <p className="display text-[2.2rem]">{it.en}</p>
    );

  const back = (it: StudyItem) => (
    <>
      {koFirst ? (
        <p className="text-[1.7rem] leading-tight font-semibold tracking-tight">{it.en}</p>
      ) : (
        <>
          <p className="ko display text-[2.8rem]">{it.ko}</p>
          <p className="muted mt-1">{romanize(it.ko)}</p>
        </>
      )}
      {it.sentence && (
        <div className="tile mt-6 w-full p-4 text-left">
          <p className="ko text-lg">
            <Highlighted sentence={it.sentence} target={it.target} />
          </p>
          {it.sentenceEn && <p className="sub text-sm">{it.sentenceEn}</p>}
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
    <div className="pt-safe flex min-h-[calc(100dvh-5rem)] flex-col">
      <PageHeader
        back="/study/"
        title={set.title}
        subtitle={`Flashcards · round ${roundNo} · ${Math.min(i + 1, round.length)}/${round.length}`}
      />
      <div className="flex flex-1 flex-col px-5">
      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            setKoFirst((k) => !k);
            setFlipped(false);
          }}
          className="chip chip-on"
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
          aria-pressed={shuffled}
          className="chip flex items-center gap-1.5"
        >
          <Shuffle size={14} /> Shuffle
        </button>
        <span className="label ml-auto tabular-nums">
          {know.length} know · {learning.length} learning
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
        <div className="flex h-full">
          <div className="bg-sage transition-all" style={{ width: `${(know.length / Math.max(1, round.length)) * 100}%` }} />
          <div className="bg-accent transition-all" style={{ width: `${(learning.length / Math.max(1, round.length)) * 100}%` }} />
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
              <div className="flip-face absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] bg-sheet p-6 text-center shadow-[0_24px_60px_-28px_rgba(0,0,0,0.3)]">
                {front(card)}
                <p className="label absolute bottom-5">Tap to flip · swipe → know · ← still learning</p>
              </div>
              <div className="flip-face flip-back absolute inset-0 flex flex-col items-center justify-center overflow-y-auto rounded-[2rem] bg-sheet p-6 text-center shadow-[0_24px_60px_-28px_rgba(0,0,0,0.3)]">
                {back(card)}
              </div>
            </div>
            {dx !== 0 && (
              <span
                className={`absolute top-6 rounded-full px-4 py-1.5 text-sm font-semibold ${
                  dx > 0 ? "left-6 bg-sage text-white" : "right-6 bg-peach text-white"
                }`}
                style={{ opacity: Math.min(1, Math.abs(dx) / 90) }}
              >
                {dx > 0 ? "Know it" : "Still learning"}
              </span>
            )}
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={() => speak(card.ko, { rate: d.settings.ttsRate })}
              aria-label="Play audio"
              className="absolute top-5 right-5 z-10 flex size-11 items-center justify-center rounded-full bg-sky-soft text-sky"
            >
              <Volume2 size={18} strokeWidth={1.75} />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 pb-4">
            <button
              onClick={() => answer(false)}
              className="btn h-14 bg-peach-soft text-peach"
            >
              <X size={18} strokeWidth={1.75} /> Still learning
            </button>
            <button
              onClick={() => answer(true)}
              className="btn h-14 bg-sage-soft text-sage"
            >
              <Check size={18} strokeWidth={1.75} /> Know it
            </button>
          </div>
        </>
      ) : (
        <div className="animate-pop mt-8">
          <h2 className="display text-[2.2rem]">
            {learning.length === 0 ? "You know them all!" : `Round ${roundNo} done`}
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[1.4rem] bg-sage-soft p-4">
              <p className="font-medium">Know</p>
              <p className="num-thin mt-4 text-[2.4rem] leading-none">{know.length}</p>
            </div>
            <div className="rounded-[1.4rem] bg-peach-soft p-4">
              <p className="font-medium">Still learning</p>
              <p className="num-thin mt-4 text-[2.4rem] leading-none text-accent">{learning.length}</p>
            </div>
          </div>

          {learning.length > 0 && (
            <ul className="card mt-4 divide-y divide-line text-left">
              {learning.slice(0, 20).map((it) => (
                <li key={it.ko} className="flex justify-between gap-3 px-4 py-2.5 text-[15px]">
                  <b className="ko font-semibold">{it.ko}</b>
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
                className="btn btn-ink h-14"
              >
                Study the {learning.length} I&apos;m still learning
              </button>
            )}
            {learning.some((it) => it.sentence) &&
              (addedCount === null ? (
                <button onClick={addToReview} className="btn btn-accent h-12">
                  <BookmarkPlus size={18} /> Add them to my review deck
                </button>
              ) : (
                <p className="text-good text-center text-sm font-semibold">
                  {addedCount > 0 ? `Added ${addedCount} to your review deck ✓` : "They're already in your review deck ✓"}
                </p>
              ))}
            <button
              onClick={() => {
                setRoundNo(1);
                startRound(set.items);
              }}
              className="btn btn-line h-12"
            >
              <RotateCcw size={18} /> Restart all {set.items.length}
            </button>
            <Link href={`/study/type/?set=${encodeURIComponent(set.id)}`} className="muted py-2 text-center text-sm">
              Play Type It! with this set
            </Link>
          </div>
        </div>
      )}
      </div>
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
