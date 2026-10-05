"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Languages, ListChecks, Pause, Play, Volume2 } from "lucide-react";
import InteractiveSentence from "@/components/InteractiveSentence";
import WordSheet from "@/components/WordSheet";
import CoverageBadge from "@/components/CoverageBadge";
import Quiz from "@/components/Quiz";
import type { Token } from "@/lib/analyzer";
import { speak, stopSpeaking } from "@/lib/speech";
import { actions, coverage, findContent, useData, useHydrated } from "@/lib/store";

const RATES = [0.7, 0.9, 1.1];

function Reader() {
  const id = useSearchParams().get("id") ?? "";
  const d = useData();
  const hydrated = useHydrated();
  const content = hydrated ? findContent(d, id) : undefined;

  const [current, setCurrent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showEn, setShowEn] = useState(false);
  const [highlight, setHighlight] = useState(true);
  const [sel, setSel] = useState<{ token: Token; i: number } | null>(null);
  const [quiz, setQuiz] = useState(false);
  const tapped = useRef<string[]>([]);
  const playingRef = useRef(false);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const stop = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    stopSpeaking();
  }, []);

  useEffect(() => stop, [stop]);

  const playFrom = useCallback(
    (i: number, continuous = true) => {
      if (!content || i >= content.sentences.length) {
        stop();
        setCurrent(null);
        // Read-aloud reached the end of the article: quick retention check.
        if (content) setQuiz(true);
        return;
      }
      playingRef.current = continuous;
      setPlaying(continuous);
      setCurrent(i);
      lineRefs.current[i]?.scrollIntoView({ block: "center", behavior: "smooth" });
      speak(content.sentences[i].ko, {
        rate: d.settings.ttsRate,
        onEnd: () => {
          if (playingRef.current) playFrom(i + 1);
        },
      });
    },
    [content, d.settings.ttsRate, stop],
  );

  if (!hydrated) return null;
  if (!content)
    return (
      <div className="p-6">
        <p>Article not found.</p>
        <Link href="/news/" className="text-brand-600 font-semibold">
          Back to news
        </Link>
      </div>
    );

  const cov = coverage(d, content);
  const lastQuiz = [...d.quizzes].reverse().find((q) => q.contentId === content.id);
  const kind = content.kind;

  return (
    <div className="pt-safe">
      <header className="sticky top-0 z-20 bg-[var(--bg)]/90 px-4 pt-4 pb-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <Link href={kind === "clip" ? "/clips/" : "/news/"} aria-label="Back" className="p-1">
            <ArrowLeft />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="muted text-xs font-semibold">
              {content.level} · {content.topic}
            </div>
            <CoverageBadge pct={cov.pct} />
          </div>
          <button onClick={() => setHighlight((h) => !h)} aria-label="Toggle unknown-word highlights" className="card p-2">
            {highlight ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
          <button
            onClick={() => setShowEn((s) => !s)}
            aria-label="Toggle translations"
            className={`card p-2 ${showEn ? "text-brand-600 dark:text-brand-400" : ""}`}
          >
            <Languages size={18} />
          </button>
        </div>
      </header>

      <article className="px-4 pb-32">
        <div className="text-5xl">{content.emoji}</div>
        <h1 className="ko mt-2 text-2xl font-extrabold">{content.title}</h1>
        <p className="muted text-sm">{content.titleEn}</p>
        {highlight && (
          <p className="muted mt-2 text-xs">
            <span className="underline decoration-amber-500 decoration-dotted decoration-2 underline-offset-4">new</span>{" "}
            · <span className="underline decoration-sky-500 decoration-2 underline-offset-4">learning</span> · tap any
            word
          </p>
        )}

        <div className="mt-5 space-y-3">
          {content.sentences.map((s, i) => (
            <p
              key={i}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              className={`-mx-2 rounded-xl px-2 py-1 text-[1.2rem] transition-colors ${
                current === i ? "bg-brand-100 dark:bg-brand-500/20" : ""
              }`}
            >
              <button
                onClick={() => playFrom(i, false)}
                aria-label="Play sentence"
                className="muted mr-1 inline-flex align-middle"
              >
                <Volume2 size={16} />
              </button>
              <InteractiveSentence
                text={s.ko}
                data={d}
                highlightUnknown={highlight}
                selected={sel?.i === i ? sel.token.core : null}
                onWord={(token) => {
                  stop();
                  tapped.current.push(token.gloss.lemma);
                  setSel({ token, i });
                }}
              />
              {showEn && s.en && <span className="muted block text-sm">{s.en}</span>}
            </p>
          ))}
        </div>

        <div className="card mt-8 p-4 text-center">
          <p className="font-bold">Finished reading?</p>
          <p className="muted text-sm">
            {lastQuiz
              ? `Last quiz: ${lastQuiz.score}/${lastQuiz.total}. Take it again to check what stuck.`
              : "Take a 1-minute quiz. Missed words go to your review deck."}
          </p>
          <button
            onClick={() => {
              stop();
              setQuiz(true);
            }}
            className="bg-brand-500 mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-white shadow-[0_4px_0_var(--color-brand-700)] active:translate-y-1 active:shadow-none"
          >
            <ListChecks size={20} /> Done reading — quick quiz
          </button>
        </div>

        {cov.unknownLemmas.length > 0 && (
          <button
            onClick={() => {
              if (confirm(`Mark the remaining ${cov.unknownLemmas.length} new words as known?`))
                cov.unknownLemmas.forEach((l) => actions.setKnown(l, true));
            }}
            className="muted mt-6 text-sm underline"
          >
            I know all the remaining words
          </button>
        )}
      </article>

      <div className="fixed inset-x-0 bottom-20 z-20 mx-auto flex max-w-xl justify-center px-4">
        <div className="card flex items-center gap-2 rounded-full p-1.5 shadow-lg">
          <button
            onClick={() => (playing ? stop() : playFrom(current ?? 0))}
            className="bg-brand-500 flex items-center gap-2 rounded-full px-5 py-2.5 font-bold text-white"
          >
            {playing ? <Pause size={18} /> : <Play size={18} />} {playing ? "Pause" : "Read aloud"}
          </button>
          <button
            onClick={() => {
              const r = RATES[(RATES.indexOf(d.settings.ttsRate) + 1) % RATES.length] ?? 0.9;
              actions.updateSettings({ ttsRate: r });
            }}
            className="px-3 text-sm font-bold"
          >
            {d.settings.ttsRate}×
          </button>
        </div>
      </div>

      {quiz && <Quiz content={content} tapped={tapped.current} onClose={() => setQuiz(false)} />}

      {sel && (
        <WordSheet
          token={sel.token}
          sentence={content.sentences[sel.i]}
          source={{ id: content.id, title: content.title, kind }}
          onClose={() => setSel(null)}
        />
      )}
    </div>
  );
}

export default function ReaderPage() {
  return (
    <Suspense>
      <Reader />
    </Suspense>
  );
}
