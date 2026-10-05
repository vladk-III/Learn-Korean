"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookmarkPlus, Ear, Flame, Heart, Lightbulb, SkipForward, Timer, Volume2, X } from "lucide-react";
import { speak } from "@/lib/speech";
import PageHeader from "@/components/PageHeader";
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
        <Link href="/study/" className="font-semibold underline">
          Back to study
        </Link>
      </div>
    );

  // ---------- menu ----------
  if (phase === "menu")
    return (
      <div className="pt-safe">
        <PageHeader back="/study/" title={set.title} subtitle={`${set.items.length} words`} />
        <div className="px-5">
          <h1 className="display mt-4 text-[2.6rem]">
            Type It
            <span className="muted block">타자 게임</span>
          </h1>
          <p className="sub mt-3 text-[15px] leading-relaxed">
            Type the Korean word as fast as you can. {GAME_SECONDS}s on the clock, +{TIME_BONUS}s per correct answer,{" "}
            {LIVES} lives. Combos multiply your points.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {(
              [
                { m: "meaning", icon: Lightbulb, label: "Meaning", desc: "See English, type Korean" },
                { m: "listen", icon: Ear, label: "Listening", desc: "Hear it, type it" },
              ] as const
            ).map(({ m, icon: Icon, label, desc }) => {
              const on = mode === m;
              const b = d.bestScores[`${setId}:${m}`] ?? 0;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex min-h-40 flex-col justify-between rounded-[1.4rem] p-4 text-left transition-colors ${
                    on ? "bg-ink text-on-ink" : "tile"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <p className="leading-tight font-medium">
                      {label}
                      <span className={`block text-sm font-normal ${on ? "opacity-60" : "muted"}`}>{desc}</span>
                    </p>
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <p className="num-thin text-[2.2rem] leading-none">
                    {b || "—"}
                    <span className={`ml-1 text-sm font-normal tracking-normal ${on ? "opacity-60" : "muted"}`}>best</span>
                  </p>
                </button>
              );
            })}
          </div>
          <p className="muted mt-4 text-center text-xs">Tip: switch your keyboard to Korean (한국어) first.</p>
          <button onClick={start} className="btn btn-ink mt-4 h-14 w-full text-base">
            Start
          </button>
        </div>
      </div>
    );

  // ---------- game over ----------
  if (phase === "over")
    return (
      <div className="pt-safe px-5 pt-10">
        <span className={newBest ? "pill" : "pill pill-soft"}>
          {newBest ? "New best" : lives <= 0 ? "Out of lives" : "Time's up"}
        </span>
        <p className="num-thin mt-3 text-[5.5rem] leading-none">{score}</p>
        <p className="muted mt-2 text-[15px]">
          {correct} correct · best combo {bestCombo}× · personal best {Math.max(best, score)}
        </p>

        {missed.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold tracking-tight">Words to work on</h2>
            <ul className="mt-3 space-y-2">
              {missed.map((it) => (
                <li key={it.ko} className="card flex items-center gap-3 px-4 py-3">
                  <button onClick={() => say(it)} aria-label="Play" className="icon-circle size-10">
                    <Volume2 size={16} strokeWidth={1.75} />
                  </button>
                  <b className="ko font-semibold">{it.ko}</b>
                  <span className="muted ml-auto truncate text-sm">{firstSense(it.en)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-6 grid gap-2">
          <button onClick={start} className="btn btn-ink h-14 text-base">
            Play again
          </button>
          {missed.some((it) => it.sentence) &&
            (added === null ? (
              <button onClick={addMissed} className="btn btn-accent h-12">
                <BookmarkPlus size={17} strokeWidth={1.75} /> Add missed words to review
              </button>
            ) : (
              <p className="text-good text-center text-sm font-semibold">
                {added > 0 ? `Added ${added} to your reviews` : "Already in your reviews"}
              </p>
            ))}
          <Link href={`/study/flashcards/?set=${encodeURIComponent(setId)}`} className="btn btn-line h-12">
            Study with flashcards
          </Link>
          <button onClick={() => setPhase("menu")} className="muted py-2 text-center text-sm">
            Change mode
          </button>
        </div>
      </div>
    );

  // ---------- playing ----------
  const context = blanked(item);
  const chars = Array.from(item.ko);
  const low = timeLeft <= 10;
  return (
    <div className="pt-safe px-5">
      <header className="flex items-center gap-3 pt-5">
        <button onClick={endGame} aria-label="End game" className="icon-circle size-10 bg-sheet">
          <X size={18} strokeWidth={1.75} />
        </button>
        <span className={`pill ${low ? "" : "pill-soft"} tabular-nums`}>
          <Timer size={13} /> {timeLeft}s
        </span>
        <span className="flex items-center gap-0.5">
          {Array.from({ length: LIVES }, (_, k) => (
            <Heart
              key={k}
              size={17}
              strokeWidth={1.75}
              fill={k < lives ? "currentColor" : "none"}
              className={k < lives ? "text-accent" : "muted"}
            />
          ))}
        </span>
        <span className="label ml-auto flex items-center gap-1 tabular-nums">
          <Flame size={14} className={combo > 0 ? "text-accent" : ""} /> {combo}×
        </span>
        <span className="num-thin text-2xl tabular-nums">{score}</span>
      </header>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${low ? "bg-accent" : "bg-ink"}`}
          style={{ width: `${Math.min(100, (timeLeft / GAME_SECONDS) * 100)}%` }}
        />
      </div>

      <div key={idx} className="animate-pop mt-10 text-center">
        {mode === "meaning" ? (
          <>
            <p className="label">Type the Korean for</p>
            <p className="display mt-2 text-[2.4rem]">{firstSense(item.en)}</p>
            {item.en !== firstSense(item.en) && <p className="muted mt-1 text-sm">{item.en}</p>}
          </>
        ) : (
          <>
            <p className="label">Type what you hear</p>
            <button
              onClick={() => say(item)}
              aria-label="Play again"
              className="mx-auto mt-3 flex size-24 items-center justify-center rounded-full bg-ink text-on-ink"
            >
              <Volume2 size={36} strokeWidth={1.75} />
            </button>
          </>
        )}

        <p className="ko muted mt-5 text-2xl tracking-[0.3em]">
          {chars.map((c, k) => (k < hint ? c : "＿")).join("")}
        </p>

        {showContext && context && (
          <div className="tile mt-4 p-4 text-left">
            <p className="ko">{context}</p>
            {item.sentenceEn && <p className="muted text-sm">{item.sentenceEn}</p>}
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
          className={`tile ko w-full border-2 px-5 py-4 text-center text-2xl font-semibold outline-none ${
            feedback?.kind === "wrong"
              ? "animate-shake border-bad"
              : feedback?.kind === "right"
                ? "border-good"
                : feedback?.kind === "close"
                  ? "animate-shake border-accent"
                  : "border-transparent"
          }`}
        />
        <p
          className={`mt-2 h-6 text-center font-semibold ${
            feedback?.kind === "right" ? "text-good" : feedback?.kind === "close" ? "text-accent" : "text-bad"
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
            className="btn btn-soft h-14 px-4 text-sm"
          >
            <Lightbulb size={16} strokeWidth={1.75} /> Hint
          </button>
          {context ? (
            <button
              type="button"
              onClick={() => {
                setShowContext(true);
                inputRef.current?.focus();
              }}
              className="btn btn-soft h-14 px-4 text-sm"
            >
              Context
            </button>
          ) : (
            <button type="button" onClick={skip} aria-label="Skip" className="btn btn-soft h-14 px-4">
              <SkipForward size={16} strokeWidth={1.75} />
            </button>
          )}
          <button type="submit" className="btn btn-ink h-14 text-base">
            Enter
          </button>
        </div>
        {context && (
          <button type="button" onClick={skip} className="muted mt-4 w-full text-center text-sm">
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
