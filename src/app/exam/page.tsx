"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BookOpen, ChevronRight, Clapperboard, ExternalLink, Eye, Mic, Shuffle, Square, SquareStack, Volume2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { DLPT_RESOURCES, OPI_QUESTIONS, OPI_RESOURCES, OPI_TIPS, type Resource } from "@/content/exam";
import { speak, stopSpeaking } from "@/lib/speech";
import { useData, useHydrated } from "@/lib/store";
import { tintCircle, type Tint } from "@/lib/tints";

type Level = 1 | 2 | 3;

function OpiDrill() {
  const d = useData();
  const [level, setLevel] = useState<Level>(2);
  const [i, setI] = useState(0);
  const [showEn, setShowEn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const set = OPI_QUESTIONS[level];
  const q = set.questions[i % set.questions.length];

  useEffect(
    () => () => {
      window.clearInterval(timer.current);
      stopSpeaking();
    },
    [],
  );

  const next = (lv = level) => {
    const qs = OPI_QUESTIONS[lv].questions;
    let n = Math.floor(Math.random() * qs.length);
    if (lv === level && qs.length > 1 && n === i % qs.length) n = (n + 1) % qs.length;
    setLevel(lv);
    setI(n);
    setShowEn(false);
    setAudioUrl(null);
    setElapsed(0);
  };

  const startRec = async () => {
    setErr(null);
    stopSpeaking();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setAudioUrl(URL.createObjectURL(new Blob(chunks, { type: r.mimeType })));
      };
      rec.current = r;
      r.start();
      setRecording(true);
      setElapsed(0);
      setAudioUrl(null);
      const t0 = Date.now();
      timer.current = window.setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 250);
    } catch {
      setErr("No microphone access — allow it in your phone settings, or answer aloud without recording.");
    }
  };

  const stopRec = () => {
    rec.current?.stop();
    window.clearInterval(timer.current);
    setRecording(false);
  };

  const pct = Math.min(1, elapsed / set.seconds);

  return (
    <div>
      <div className="flex gap-1">
        {([1, 2, 3] as Level[]).map((lv) => (
          <button key={lv} onClick={() => next(lv)} aria-pressed={level === lv} className="chip">
            ILR {lv}
          </button>
        ))}
      </div>
      <p className="muted mt-2 text-sm">{set.focus}</p>

      <div className="mt-4 rounded-[1.75rem] bg-lilac-soft p-5">
        <div className="flex items-start gap-3">
          <button
            onClick={() => speak(q.ko, { rate: d.settings.ttsRate })}
            aria-label="Hear the question"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-lilac text-white"
          >
            <Volume2 size={20} strokeWidth={1.75} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="label">Interviewer</p>
            <p className="ko mt-0.5 text-xl leading-snug font-semibold tracking-tight">{q.ko}</p>
            {showEn ? (
              <p className="sub mt-1 text-[15px]">{q.en}</p>
            ) : (
              <button onClick={() => setShowEn(true)} className="text-lilac mt-1 flex items-center gap-1 text-sm font-medium">
                <Eye size={14} /> Show English
              </button>
            )}
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <p className="label">Aim for about {set.seconds}s</p>
            <p className="num-thin text-2xl tabular-nums">
              {elapsed}
              <span className="muted text-base">s</span>
            </p>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sheet">
            <div className={`h-full rounded-full transition-all ${pct >= 1 ? "bg-sage" : "bg-lilac"}`} style={{ width: `${pct * 100}%` }} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          {recording ? (
            <button onClick={stopRec} className="btn btn-accent h-12">
              <Square size={16} /> Stop
            </button>
          ) : (
            <button onClick={startRec} className="btn btn-ink h-12">
              <Mic size={17} strokeWidth={1.75} /> {audioUrl ? "Answer again" : "Record answer"}
            </button>
          )}
          <button onClick={() => next()} className="btn h-12 bg-sheet px-4" aria-label="Next question">
            <Shuffle size={17} strokeWidth={1.75} /> Next
          </button>
        </div>
        {audioUrl && <audio src={audioUrl} controls className="mt-3 w-full" />}
        {err && <p className="text-bad mt-2 text-sm">{err}</p>}
      </div>

      <ul className="mt-4 space-y-2">
        {OPI_TIPS.map((t) => (
          <li key={t} className="sub flex gap-2 text-[15px] leading-snug">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-lilac" />
            <span className="ko">{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Resources({ items, tint }: { items: Resource[]; tint: Tint }) {
  return (
    <ul className="space-y-2">
      {items.map((r) => (
        <li key={r.url}>
          <a href={r.url} target="_blank" rel="noreferrer" className="card flex items-start gap-3 p-4">
            <span className={`${tintCircle(tint)} size-10`}>
              <ExternalLink size={16} strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="leading-snug font-semibold">{r.title}</p>
              <p className="muted text-sm leading-snug">{r.note}</p>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}

function AppLink({ href, icon: Icon, tint, title, note }: { href: string; icon: typeof Mic; tint: Tint; title: string; note: string }) {
  return (
    <Link href={href} className="card flex items-center gap-3 p-4">
      <span className={`${tintCircle(tint)} size-11`}>
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        <p className="muted text-sm">{note}</p>
      </div>
      <ChevronRight size={18} className="muted" />
    </Link>
  );
}

export default function Exam() {
  const hydrated = useHydrated();
  if (!hydrated) return null;

  return (
    <div className="pt-safe">
      <PageHeader back="/" title="Exam prep" subtitle="DLPT · OPI" />

      <div className="px-5 pt-2 pb-7">
        <h1 className="display text-[2.4rem]">
          DLPT &amp; OPI
          <span className="muted block">시험 준비</span>
        </h1>
      </div>

      <div className="sheet space-y-10 px-5 pt-7 pb-8">
        <section>
          <div className="flex items-center gap-3">
            <span className={`${tintCircle("rose")} size-11`}>
              <BookOpen size={18} strokeWidth={1.75} />
            </span>
            <h2 className="text-2xl font-semibold tracking-tight">DLPT — reading &amp; listening</h2>
          </div>
          <p className="sub mt-3 text-[15px] leading-relaxed">
            The DLPT5 scores reading and listening on the ILR scale (0+ to 4) using authentic material: news, broadcasts,
            signs and web text on politics, economy, security, society and science. The Korean lower-range test also
            includes North Korean–sourced passages.
          </p>
          <div className="mt-4 space-y-2">
            <AppLink href="/news/?track=dlpt" icon={BookOpen} tint="rose" title="DLPT-style news" note="Security, politics, economy, North Korea — read & listen" />
            <AppLink href="/study/flashcards/?set=dlpt-core" icon={SquareStack} tint="peach" title="DLPT core vocabulary" note="Flashcards & Type It! from every DLPT story" />
          </div>
          <p className="label mt-5">Resources</p>
          <div className="mt-2">
            <Resources items={DLPT_RESOURCES} tint="rose" />
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3">
            <span className={`${tintCircle("lilac")} size-11`}>
              <Mic size={18} strokeWidth={1.75} />
            </span>
            <h2 className="text-2xl font-semibold tracking-tight">OPI — speaking</h2>
          </div>
          <p className="sub mt-3 text-[15px] leading-relaxed">
            A live conversation with two certified raters: warm-up, level checks at your solid level, probes one level
            higher (narration, description, opinion, role-play), then a wind-down. You&apos;re rated 0–5 on the ILR
            speaking scale.
          </p>
          <div className="mt-4 space-y-2">
            <AppLink href="/clips/?id=opi-introduction" icon={Clapperboard} tint="lilac" title="OPI model answers" note="Interview-style clips — use Shadow mode" />
          </div>

          <p className="label mt-6">Practice drill</p>
          <div className="mt-2">
            <OpiDrill />
          </div>

          <p className="label mt-6">Resources</p>
          <div className="mt-2">
            <Resources items={OPI_RESOURCES} tint="lilac" />
          </div>
        </section>
      </div>
    </div>
  );
}
