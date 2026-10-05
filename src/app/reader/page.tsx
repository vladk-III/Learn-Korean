"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Languages, ListChecks, Pause, Play, Volume2 } from "lucide-react";
import InteractiveSentence from "@/components/InteractiveSentence";
import WordSheet from "@/components/WordSheet";
import CoverageBadge from "@/components/CoverageBadge";
import PageHeader from "@/components/PageHeader";
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
        <Link href="/news/" className="font-semibold underline">
          Back to news
        </Link>
      </div>
    );

  const cov = coverage(d, content);
  const lastQuiz = [...d.quizzes].reverse().find((q) => q.contentId === content.id);
  const kind = content.kind;

  const iconBtn = (on: boolean) =>
    `flex size-10 items-center justify-center rounded-full transition-colors ${on ? "bg-ink text-on-ink" : "bg-sheet"}`;

  return (
    <div className="pt-safe">
      <div className="sticky top-0 z-20 bg-canvas/90 backdrop-blur">
        <PageHeader
          back={kind === "clip" ? "/clips/" : "/news/"}
          title={kind === "clip" ? "Script" : "Reading"}
          subtitle={`${content.level} · ${content.topic}`}
          right={
            <>
              <button onClick={() => setHighlight((h) => !h)} aria-label="Toggle unknown-word highlights" className={iconBtn(highlight)}>
                {highlight ? <Eye size={17} strokeWidth={1.75} /> : <EyeOff size={17} strokeWidth={1.75} />}
              </button>
              <button onClick={() => setShowEn((v) => !v)} aria-label="Toggle translations" className={iconBtn(showEn)}>
                <Languages size={17} strokeWidth={1.75} />
              </button>
            </>
          }
        />
      </div>

      <div className="px-5 pt-3 pb-7">
        <p className="label">{content.kind === "news" ? content.date : "Short clip"}</p>
        <h1 className="ko display mt-1 text-[2rem] leading-tight">{content.title}</h1>
        <p className="muted mt-1 text-[15px]">{content.titleEn}</p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <CoverageBadge pct={cov.pct} />
          {highlight && (
            <span className="pill pill-outline">
              <span className="underline decoration-accent decoration-dotted decoration-2 underline-offset-4">new</span>·
              <span className="underline decoration-fg-2 decoration-2 underline-offset-4">learning</span>
            </span>
          )}
        </div>
      </div>

      <article className="sheet min-h-[60dvh] px-5 pt-6 pb-40">
        <div className="space-y-2">
          {content.sentences.map((s, i) => (
            <p
              key={i}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              className={`-mx-3 rounded-2xl px-3 py-1.5 text-[1.2rem] transition-colors ${current === i ? "bg-accent-soft" : ""}`}
            >
              <button onClick={() => playFrom(i, false)} aria-label="Play sentence" className="muted mr-1 inline-flex align-middle">
                <Volume2 size={16} strokeWidth={1.75} />
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
              {showEn && s.en && <span className="muted block text-[15px] leading-snug">{s.en}</span>}
            </p>
          ))}
        </div>

        <div className="tile mt-10 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold tracking-tight">Finished reading?</p>
              <p className="muted text-[15px]">
                {lastQuiz
                  ? `Last quiz ${lastQuiz.score}/${lastQuiz.total} — see what stuck this time.`
                  : "A 1-minute quiz. Missed words go to your reviews."}
              </p>
            </div>
            <span className="icon-circle bg-sheet">
              <ListChecks size={20} strokeWidth={1.75} />
            </span>
          </div>
          <button
            onClick={() => {
              stop();
              setQuiz(true);
            }}
            className="btn btn-ink mt-4 h-12 w-full"
          >
            Take the quiz
          </button>
        </div>

        {cov.unknownLemmas.length > 0 && (
          <button
            onClick={() => {
              if (confirm(`Mark the remaining ${cov.unknownLemmas.length} new words as known?`))
                cov.unknownLemmas.forEach((l) => actions.setKnown(l, true));
            }}
            className="muted mt-5 w-full text-center text-sm"
          >
            I know all the remaining words
          </button>
        )}
      </article>

      <div className="fixed inset-x-0 bottom-24 z-20 mx-auto flex max-w-xl justify-center px-5">
        <div className="flex items-center gap-1 rounded-full bg-ink p-1.5 text-on-ink shadow-xl">
          <button
            onClick={() => (playing ? stop() : playFrom(current ?? 0))}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold"
          >
            {playing ? <Pause size={17} /> : <Play size={17} />} {playing ? "Pause" : "Read aloud"}
          </button>
          <button
            onClick={() => {
              const r = RATES[(RATES.indexOf(d.settings.ttsRate) + 1) % RATES.length] ?? 0.9;
              actions.updateSettings({ ttsRate: r });
            }}
            className="rounded-full bg-on-ink/15 px-3.5 py-2.5 text-sm font-semibold tabular-nums"
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
