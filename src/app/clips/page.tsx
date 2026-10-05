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
import { coverage, useData, useHydrated, type Data } from "@/lib/store";

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

  return (
    <section
      className={`relative flex h-[calc(100dvh-4.5rem)] snap-start snap-always flex-col bg-gradient-to-b ${clip.gradient} text-white`}
    >
      <div className="pt-safe flex items-center justify-between px-4 pt-4">
        <div>
          <p className="text-xs font-bold tracking-wide uppercase opacity-80">
            {clip.level} · {clip.topic}
          </p>
          <h2 className="text-xl font-extrabold">{clip.title}</h2>
          <p className="text-sm opacity-90">{clip.titleEn}</p>
        </div>
        <CoverageBadge pct={cov.pct} compact />
      </div>

      <button
        onClick={() => (started ? (playing ? stop() : playLine(line)) : start())}
        className="flex flex-1 flex-col items-center justify-center"
        aria-label={playing ? "Pause" : "Play"}
      >
        <span className={`text-[7rem] leading-none drop-shadow-lg ${playing ? "animate-pulse" : ""}`}>{clip.emoji}</span>
        {!started && (
          <span className="mt-4 flex items-center gap-2 rounded-full bg-black/30 px-5 py-2.5 font-bold backdrop-blur">
            <Play size={18} fill="currentColor" /> Tap to play
          </span>
        )}
        {waiting && (
          <span className="mt-4 flex items-center gap-2 rounded-full bg-black/30 px-4 py-2 text-sm font-bold">
            <Mic size={16} /> Your turn — repeat it!
          </span>
        )}
      </button>

      <div className="absolute right-3 bottom-48 flex flex-col gap-3">
        {[
          { icon: playing ? Pause : Play, label: playing ? "Pause" : "Play", on: () => (playing ? stop() : start(line)), active: false },
          { icon: RotateCcw, label: "Replay", on: () => start(0), active: false },
          { icon: Languages, label: "English", on: () => setShowEn((v) => !v), active: showEn },
          { icon: Mic, label: "Shadow", on: () => setShadow((v) => !v), active: shadow },
          { icon: ListChecks, label: "Quiz", on: () => (stop(), setQuiz(true)), active: false },
        ].map(({ icon: Icon, label, on, active: a }) => (
          <button key={label} onClick={on} className="flex flex-col items-center text-[10px] font-bold">
            <span className={`rounded-full p-3 backdrop-blur ${a ? "bg-white text-black" : "bg-black/25"}`}>
              <Icon size={20} />
            </span>
            {label}
          </button>
        ))}
        <Link href={`/reader/?id=${clip.id}`} className="flex flex-col items-center text-[10px] font-bold">
          <span className="rounded-full bg-black/25 p-3 backdrop-blur">
            <FileText size={20} />
          </span>
          Script
        </Link>
      </div>

      <div className="px-4 pb-6">
        <div className="mb-2 flex gap-1">
          {clip.sentences.map((_, i) => (
            <button
              key={i}
              onClick={() => start(i)}
              aria-label={`Line ${i + 1}`}
              className={`h-1.5 flex-1 rounded-full ${i <= line ? "bg-white" : "bg-white/35"}`}
            />
          ))}
        </div>
        <div className="min-h-32 rounded-2xl bg-black/35 p-4 backdrop-blur">
          {s.speaker && <p className="text-xs font-bold opacity-70">{s.speaker === "A" ? "🧑‍🍳 Staff / A" : "🙋 Customer / B"}</p>}
          <p className="text-2xl font-bold">
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
          {showEn && <p className="mt-1 text-sm opacity-90">{s.en}</p>}
        </div>
      </div>

      {quiz && <Quiz content={clip} tapped={tapped.current} onClose={() => setQuiz(false)} />}

      {sel && (
        <div className="text-[var(--fg)]">
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

function Feed() {
  const d = useData();
  const hydrated = useHydrated();
  const startId = useSearchParams().get("id");
  const [active, setActive] = useState(0);
  const [started, setStarted] = useState(false);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { threshold: 0.6 },
    );
    refs.current.forEach((el) => el && io.observe(el));
    const idx = CLIPS.findIndex((c) => c.id === startId);
    if (idx > 0) refs.current[idx]?.scrollIntoView();
    return () => io.disconnect();
  }, [hydrated, startId]);

  if (!hydrated) return null;

  return (
    <div className="no-scrollbar h-[calc(100dvh-4.5rem)] snap-y snap-mandatory overflow-y-scroll">
      {CLIPS.map((c, i) => (
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
