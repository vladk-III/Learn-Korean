"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { FileText, Languages, ListChecks, Mic, Pause, Play, RotateCcw } from "lucide-react";
import { CLIPS } from "@/content/clips";
import type { Clip } from "@/content/types";
import InteractiveSentence from "@/components/InteractiveSentence";
import WordSheet from "@/components/WordSheet";
import CoverageBadge from "@/components/CoverageBadge";
import Quiz from "@/components/Quiz";
import type { Token } from "@/lib/analyzer";
import { speak, stopSpeaking } from "@/lib/speech";
import { shuffle } from "@/lib/text";
import { coverage, useData, useHydrated, type Data } from "@/lib/store";
import { TINT, tintFor } from "@/lib/tints";

const PITCH = { A: 1.2, B: 0.85 } as const;

function ClipCard({
  clip,
  active,
  data,
  started,
  onStart,
}: {
  clip: Clip;
  active: boolean;
  data: Data;
  started: boolean;
  onStart: () => void;
}) {
  const [line, setLine] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showEn, setShowEn] = useState(true);
  const [shadow, setShadow] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [sel, setSel] = useState<Token | null>(null);
  const [quiz, setQuiz] = useState(false);
  const tapped = useRef<string[]>([]);
  const playingRef = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  const stop = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    setWaiting(false);
    window.clearTimeout(timer.current);
    stopSpeaking();
  }, []);

  const playLine = useCallback(
    (i: number) => {
      if (i >= clip.sentences.length) {
        // Reached the end of the clip: check what stuck.
        stop();
        setQuiz(true);
        return;
      }
      playingRef.current = true;
      setPlaying(true);
      setLine(i);
      const s = clip.sentences[i];
      speak(s.ko, {
        rate: data.settings.ttsRate,
        pitch: s.speaker ? PITCH[s.speaker] : 1,
        onEnd: () => {
          if (!playingRef.current) return;
          if (shadow) {
            // Leave a gap the length of the line for the learner to repeat it aloud.
            setWaiting(true);
            timer.current = window.setTimeout(
              () => {
                setWaiting(false);
                if (playingRef.current) playLine(i + 1);
              },
              1200 + s.ko.length * 220,
            );
          } else {
            timer.current = window.setTimeout(() => playingRef.current && playLine(i + 1), 450);
          }
        },
      });
    },
    [clip.sentences, data.settings.ttsRate, shadow, stop],
  );

  // Auto-play when scrolled into view (after the first user gesture), stop when scrolled away.
  const startedRef = useRef(started);
  startedRef.current = started;
  useEffect(() => {
    if (active && startedRef.current) playLine(0);
    if (!active) stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Speech must start inside the tap handler on iOS, so play directly here.
  const start = (i = 0) => {
    onStart();
    playLine(i);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const s = clip.sentences[line];
  const cov = coverage(data, clip);
  const tint = tintFor(clip.id);

  return (
    <section className={`relative flex h-[calc(100dvh-4.75rem)] snap-start snap-always flex-col ${TINT[tint].soft}`}>
      <div className="pt-safe flex items-start justify-between px-5 pt-6">
        <h2 className="display text-[2.1rem]">
          <span className="ko">{clip.title}</span>
          <span className="muted block text-[1.4rem]">{clip.titleEn}</span>
        </h2>
        <span className={`pill mt-1.5 shrink-0 bg-sheet ${TINT[tint].ink}`}>{clip.level}</span>
      </div>
      <div className="mt-3 flex gap-1.5 px-5">
        <CoverageBadge pct={cov.pct} compact />
        <span className="pill pill-outline">{clip.topic}</span>
      </div>

      <button
        onClick={() => (started ? (playing ? stop() : playLine(line)) : start())}
        className="flex flex-1 flex-col items-center justify-center pr-14"
        aria-label={playing ? "Pause" : "Play"}
      >
        <span
          className={`flex size-44 items-center justify-center rounded-full bg-sheet text-[5.5rem] leading-none shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] transition-transform ${
            playing ? "scale-105" : ""
          }`}
        >
          {clip.emoji}
        </span>
        {!started && (
          <span className="btn btn-ink mt-6 h-12 px-6">
            <Play size={17} fill="currentColor" /> Tap to play
          </span>
        )}
        {waiting && (
          <span className="pill mt-6 px-4 py-2 text-sm">
            <Mic size={15} /> Your turn — repeat it
          </span>
        )}
      </button>

      <div className="absolute right-4 bottom-56 flex flex-col gap-3">
        {[
          { icon: playing ? Pause : Play, label: playing ? "Pause" : "Play", on: () => (playing ? stop() : start(line)), active: playing },
          { icon: RotateCcw, label: "Replay", on: () => start(0), active: false },
          { icon: Languages, label: "English", on: () => setShowEn((v) => !v), active: showEn },
          { icon: Mic, label: "Shadow", on: () => setShadow((v) => !v), active: shadow },
          { icon: ListChecks, label: "Quiz", on: () => (stop(), setQuiz(true)), active: false },
        ].map(({ icon: Icon, label, on, active: a }) => (
          <button key={label} onClick={on} className="flex flex-col items-center gap-1 text-[10px] font-medium">
            <span
              className={`flex size-11 items-center justify-center rounded-full transition-colors ${
                a ? `${TINT[tint].solid} text-white` : "bg-sheet"
              }`}
            >
              <Icon size={18} strokeWidth={1.75} />
            </span>
            <span className="muted">{label}</span>
          </button>
        ))}
        <Link href={`/reader/?id=${clip.id}`} className="flex flex-col items-center gap-1 text-[10px] font-medium">
          <span className="flex size-11 items-center justify-center rounded-full bg-sheet">
            <FileText size={18} strokeWidth={1.75} />
          </span>
          <span className="muted">Script</span>
        </Link>
      </div>

      <div className="px-4 pb-4">
        <div className="mb-3 flex gap-1 px-1">
          {clip.sentences.map((_, i) => (
            <button
              key={i}
              onClick={() => start(i)}
              aria-label={`Line ${i + 1}`}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= line ? TINT[tint].solid : "bg-sheet"}`}
            />
          ))}
        </div>
        <div className="min-h-36 rounded-[1.75rem] bg-sheet p-5">
          {s.speaker && (
            <span className={`pill mb-1.5 ${s.speaker === "A" ? "bg-sky-soft text-sky" : "bg-rose-soft text-rose"}`}>
              {s.speaker === "A" ? "Speaker A" : "Speaker B"}
            </span>
          )}
          <p className="text-[1.6rem] leading-snug font-semibold tracking-tight">
            <InteractiveSentence
              text={s.ko}
              data={data}
              highlightUnknown
              selected={sel?.core}
              onWord={(t) => {
                stop();
                setSel(t);
                tapped.current.push(t.gloss.lemma);
              }}
            />
          </p>
          {showEn && <p className="sub mt-1 text-[15px]">{s.en}</p>}
        </div>
      </div>

      {quiz && <Quiz content={clip} tapped={tapped.current} onClose={() => setQuiz(false)} />}

      {sel && (
        <div>
          <WordSheet
            token={sel}
            sentence={s}
            source={{ id: clip.id, title: clip.title, kind: "clip" }}
            onClose={() => setSel(null)}
          />
        </div>
      )}
    </section>
  );
}

/** Fresh random order on every visit; a linked clip (?id=) always comes first. */
function shuffledClips(startId: string | null): Clip[] {
  const rest = shuffle(
    CLIPS.filter((c) => c.id !== startId),
    Math.floor(Math.random() * 2 ** 31),
  );
  const first = CLIPS.find((c) => c.id === startId);
  return first ? [first, ...rest] : rest;
}

function Feed() {
  const d = useData();
  const hydrated = useHydrated();
  const startId = useSearchParams().get("id");
  const [order, setOrder] = useState<Clip[] | null>(null);
  const [active, setActive] = useState(0);
  const [started, setStarted] = useState(false);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  // Shuffle on the client after mount (so the static HTML and first render agree).
  useEffect(() => {
    setOrder(shuffledClips(startId));
    setActive(0);
  }, [startId]);

  useEffect(() => {
    if (!hydrated || !order) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { threshold: 0.6 },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [hydrated, order]);

  if (!hydrated || !order) return null;

  return (
    <div className="no-scrollbar h-[calc(100dvh-4.75rem)] snap-y snap-mandatory overflow-y-scroll">
      {order.map((c, i) => (
        <div
          key={c.id}
          data-index={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <ClipCard clip={c} active={active === i} data={d} started={started} onStart={() => setStarted(true)} />
        </div>
      ))}
    </div>
  );
}

export default function ClipsPage() {
  return (
    <Suspense>
      <Feed />
    </Suspense>
  );
}
