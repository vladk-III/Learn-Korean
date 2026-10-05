"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BookmarkPlus, Ear, Flame, Heart, Lightbulb, SkipForward, Timer, Trophy, Volume2 } from "lucide-react";
import { speak } from "@/lib/speech";
import { grade, shuffle } from "@/lib/text";
import { findSet, firstSense, type StudyItem } from "@/lib/study";
import { DICTIONARY } from "@/content/dictionary";
import { actions, useData, useHydrated } from "@/lib/store";

type Mode = "meaning" | "listen";
type Phase = "menu" | "play" | "over";

const GAME_SECONDS = 60;
const LIVES = 3;
const TIME_BONUS = 3;

function blanked(it: StudyItem): string | null {
  if (!it.sentence || !it.target || !it.sentence.includes(it.target)) return null;
  return it.sentence.replace(it.target, "＿".repeat(Math.max(2, Array.from(it.target).length)));
}

function TypeIt() {
  const setId = useSearchParams().get("set") ?? "";
  const d = useData();
  const hydrated = useHydrated();
  const set = useMemo(() => (hydrated ? findSet(d, setId) : undefined), [hydrated, setId]); // eslint-disable-line react-hooks/exhaustive-deps

  const [mode, setMode] = useState<Mode>("meaning");
  const [phase, setPhase] = useState<Phase>("menu");
  const [queue, setQueue] = useState<StudyItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [hint, setHint] = useState(0); // syllables revealed
  const [showContext, setShowContext] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "right" | "close" | "wrong"; text: string } | null>(null);
  const [triedClose, setTriedClose] = useState(false);
  const [missed, setMissed] = useState<StudyItem[]>([]);
  const [correct, setCorrect] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [added, setAdded] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lock = useRef(false);

  const item = queue[idx % Math.max(1, queue.length)];
  const key = `${setId}:${mode}`;
  const best = d.bestScores[key] ?? 0;

  const say = useCallback((it?: StudyItem) => it && speak(it.ko, { rate: d.settings.ttsRate }), [d.settings.ttsRate]);

  const endGame = useCallback(() => {
    setPhase("over");
    setNewBest(actions.recordScore(key, score));
  }, [key, score]);

  // Countdown
  useEffect(() => {
    if (phase !== "play") return;
    if (timeLeft <= 0 || lives <= 0) {
      endGame();
      return;
    }
    const t = window.setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, timeLeft, lives, endGame]);

  const start = () => {
    if (!set) return;
    const q = shuffle(set.items, Date.now());
    setQueue(q);
    setIdx(0);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setLives(LIVES);
    setTimeLeft(GAME_SECONDS);
    setMissed([]);
    setCorrect(0);
    setAdded(null);
    setNewBest(false);
    resetWord();
    setPhase("play");
    if (mode === "listen") say(q[0]); // inside the tap, so iOS allows audio
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  function resetWord() {
    setInput("");
    setHint(0);
    setShowContext(false);
    setFeedback(null);
    setTriedClose(false);
    lock.current = false;
  }

  const nextWord = (delay: number) => {
    lock.current = true;
    window.setTimeout(() => {
      const next = idx + 1;
      let q = queue;
      // Reshuffle when the set runs out so the game can keep going.
      if (next % q.length === 0 && q.length > 1) {
        q = shuffle(q, Date.now());
        setQueue(q);
      }
      setIdx(next);
      if (mode === "listen") say(q[next % q.length]);
      resetWord();
      inputRef.current?.focus();
    }, delay);
  };

  const submit = () => {
    if (!item || lock.current || !input.trim()) return;
    // In meaning mode, any word sharing the prompt's meaning counts (e.g. "thing" = 것 or 물건).
    const synonyms =
      mode === "meaning" ? DICTIONARY.filter((e) => firstSense(e.en) === firstSense(item.en)).map((e) => e.ko) : [];
    const v = grade(input, item.ko, [...item.alt, ...synonyms]);
    if (v === "correct") {
      const points = Math.max(2, 10 + combo * 2 - hint * 4);
      setScore((s) => s + points);
      setCombo((c) => {
        setBestCombo((b) => Math.max(b, c + 1));
        return c + 1;
      });
      setCorrect((c) => c + 1);
      setTimeLeft((t) => t + TIME_BONUS);
      setFeedback({ kind: "right", text: `+${points}${combo >= 2 ? ` · ${combo + 1}× combo!` : ""}` });
      if (mode === "meaning") say(item);
      nextWord(650);
    } else if (v === "close" && !triedClose) {
      // One free retry for near-misses (typos are easy on a phone keyboard).
      setTriedClose(true);
      setFeedback({ kind: "close", text: "So close — check your spelling and try again" });
    } else {
      setCombo(0);
      setLives((l) => l - 1);
      setMissed((m) => (m.some((x) => x.ko === item.ko) ? m : [...m, item]));
      setFeedback({ kind: "wrong", text: `Answer: ${item.ko}` });
      say(item);
      nextWord(1600);
    }
  };

  const skip = () => {
    if (!item || lock.current) return;
    setCombo(0);
    setLives((l) => l - 1);
    setMissed((m) => (m.some((x) => x.ko === item.ko) ? m : [...m, item]));
    setFeedback({ kind: "wrong", text: `Answer: ${item.ko}` });
    say(item);
    nextWord(1600);
  };

  const addMissed = () => {
    setAdded(
      actions.addMissedWords(
        missed
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
      ),
    );
  };

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

  // ---------- menu ----------
  if (phase === "menu")
    return (
      <div className="pt-safe px-4">
        <header className="flex items-center gap-2 pt-4">
          <Link href="/study/" aria-label="Back" className="p-1">
            <ArrowLeft />
          </Link>
          <p className="ko truncate font-bold">{set.title}</p>
        </header>
        <div className="mt-6 text-center">
          <p className="text-6xl">⌨️</p>
          <h1 className="mt-2 text-3xl font-extrabold">Type It!</h1>
          <p className="muted mt-1 text-sm">
            Type the Korean word as fast as you can. {GAME_SECONDS}s on the clock, +{TIME_BONUS}s per correct answer,{" "}
            {LIVES} lives. Combos multiply your points.
          </p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {(
            [
              { m: "meaning", icon: Lightbulb, label: "Meaning → 한글", desc: "See the English, type the Korean" },
              { m: "listen", icon: Ear, label: "Listen → 한글", desc: "Hear the word, type what you hear" },
            ] as const
          ).map(({ m, icon: Icon, label, desc }) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-2xl border-2 p-4 text-left ${mode === m ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10" : "hairline"}`}
            >
              <Icon className="text-amber-500" />
              <p className="mt-2 font-bold">{label}</p>
              <p className="muted text-xs">{desc}</p>
              {(d.bestScores[`${setId}:${m}`] ?? 0) > 0 && (
                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-amber-600">
                  <Trophy size={12} /> best {d.bestScores[`${setId}:${m}`]}
                </p>
              )}
            </button>
          ))}
        </div>
        <p className="muted mt-4 text-center text-xs">Tip: switch your keyboard to Korean (한국어) before starting.</p>
        <button
          onClick={start}
          className="mt-4 w-full rounded-2xl bg-amber-500 py-4 text-lg font-extrabold text-white shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none"
        >
          Start · {set.items.length} words
        </button>
      </div>
    );

  // ---------- game over ----------
  if (phase === "over")
    return (
      <div className="pt-safe px-4 pt-10 text-center">
        <p className="text-6xl">{newBest ? "🏆" : lives <= 0 ? "💔" : "⏰"}</p>
        <h1 className="mt-2 text-3xl font-extrabold">{newBest ? "New best!" : lives <= 0 ? "Out of lives" : "Time's up!"}</h1>
        <p className="mt-3 text-5xl font-black text-amber-500">{score}</p>
        <p className="muted text-sm">
          {correct} correct · best combo {bestCombo}× · personal best {Math.max(best, score)}
        </p>

        {missed.length > 0 && (
          <div className="card mt-5 text-left">
            <p className="px-4 pt-3 text-xs font-bold uppercase">Words to work on</p>
            <ul className="divide-y divide-[var(--line)]">
              {missed.map((it) => (
                <li key={it.ko} className="flex items-center gap-3 px-4 py-2 text-sm">
                  <button onClick={() => say(it)} aria-label="Play" className="text-brand-500">
                    <Volume2 size={16} />
                  </button>
                  <b className="ko">{it.ko}</b>
                  <span className="muted ml-auto truncate">{firstSense(it.en)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 grid gap-2">
          <button
            onClick={start}
            className="rounded-2xl bg-amber-500 py-3.5 font-extrabold text-white shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none"
          >
            Play again
          </button>
          {missed.some((it) => it.sentence) &&
            (added === null ? (
              <button onClick={addMissed} className="bg-brand-500 flex items-center justify-center gap-2 rounded-2xl py-3 font-bold text-white">
                <BookmarkPlus size={18} /> Add missed words to review
              </button>
            ) : (
              <p className="text-sm font-semibold text-emerald-600">
                {added > 0 ? `Added ${added} to your review deck ✓` : "Already in your review deck ✓"}
              </p>
            ))}
          <Link href={`/study/flashcards/?set=${encodeURIComponent(setId)}`} className="hairline rounded-2xl border-2 py-3 font-bold">
            Study with flashcards
          </Link>
          <button onClick={() => setPhase("menu")} className="muted py-2 text-sm underline">
            Change mode
          </button>
        </div>
      </div>
    );

  // ---------- playing ----------
  const context = blanked(item);
  const chars = Array.from(item.ko);
  return (
    <div className="pt-safe px-4">
      <header className="flex items-center gap-3 pt-4 text-sm font-extrabold">
        <button onClick={endGame} aria-label="End game" className="muted p-1">
          <ArrowLeft />
        </button>
        <span className={`flex items-center gap-1 ${timeLeft <= 10 ? "animate-pulse text-rose-500" : ""}`}>
          <Timer size={18} /> {timeLeft}s
        </span>
        <span className="flex items-center gap-0.5 text-rose-500">
          {Array.from({ length: LIVES }, (_, k) => (
            <Heart key={k} size={18} fill={k < lives ? "currentColor" : "none"} className={k < lives ? "" : "opacity-30"} />
          ))}
        </span>
        <span className="ml-auto flex items-center gap-1 text-orange-500">
          <Flame size={18} fill={combo > 0 ? "currentColor" : "none"} /> {combo}×
        </span>
        <span className="text-lg text-amber-500">{score}</span>
      </header>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 10 ? "bg-rose-500" : "bg-amber-500"}`}
          style={{ width: `${Math.min(100, (timeLeft / GAME_SECONDS) * 100)}%` }}
        />
      </div>

      <div key={idx} className="animate-pop mt-8 text-center">
        {mode === "meaning" ? (
          <>
            <p className="muted text-xs font-bold uppercase">Type the Korean for</p>
            <p className="mt-2 text-3xl font-extrabold">{firstSense(item.en)}</p>
            {item.en !== firstSense(item.en) && <p className="muted mt-1 text-sm">{item.en}</p>}
          </>
        ) : (
          <>
            <p className="muted text-xs font-bold uppercase">Type what you hear</p>
            <button onClick={() => say(item)} aria-label="Play again" className="mx-auto mt-3 block rounded-full bg-amber-500 p-6 text-white shadow-lg">
              <Volume2 size={40} />
            </button>
          </>
        )}

        <p className="ko mt-4 text-2xl tracking-[0.3em]">
          {chars.map((c, k) => (k < hint ? c : "＿")).join("")}
        </p>

        {showContext && context && (
          <div className="mt-3 rounded-xl bg-gray-50 p-3 text-left dark:bg-white/5">
            <p className="ko">{context}</p>
            {item.sentenceEn && <p className="muted text-xs">{item.sentenceEn}</p>}
          </div>
        )}
      </div>

      <form
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          ref={inputRef}
          lang="ko"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="한국어로 입력…"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={`card ko w-full px-4 py-4 text-center text-2xl font-bold ${
            feedback?.kind === "wrong" ? "animate-shake border-rose-500" : feedback?.kind === "right" ? "border-emerald-500" : feedback?.kind === "close" ? "animate-shake border-amber-500" : ""
          }`}
        />
        <p
          className={`mt-2 h-6 text-center font-bold ${
            feedback?.kind === "right" ? "text-emerald-600" : feedback?.kind === "close" ? "text-amber-600" : "text-rose-500"
          }`}
        >
          {feedback?.text}
        </p>
        <div className="mt-2 grid grid-cols-[auto_auto_1fr] gap-2">
          <button
            type="button"
            onClick={() => {
              setHint((h) => Math.min(chars.length - 1, h + 1));
              inputRef.current?.focus();
            }}
            disabled={hint >= chars.length - 1}
            className="card flex items-center gap-1 px-3 text-sm font-bold disabled:opacity-40"
          >
            <Lightbulb size={16} /> Hint
          </button>
          {context ? (
            <button
              type="button"
              onClick={() => {
                setShowContext(true);
                inputRef.current?.focus();
              }}
              className="card px-3 text-sm font-bold"
            >
              Context
            </button>
          ) : (
            <button type="button" onClick={skip} className="card flex items-center gap-1 px-3 text-sm font-bold">
              <SkipForward size={16} />
            </button>
          )}
          <button type="submit" className="rounded-2xl bg-amber-500 py-3.5 font-extrabold text-white shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none">
            Enter
          </button>
        </div>
        {context && (
          <button type="button" onClick={skip} className="muted mt-3 w-full text-sm underline">
            Skip (costs a life)
          </button>
        )}
      </form>
    </div>
  );
}

export default function TypeItPage() {
  return (
    <Suspense>
      <TypeIt />
    </Suspense>
  );
}
