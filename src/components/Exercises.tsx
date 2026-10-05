"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Ear, Lightbulb, Mic, PenLine, Puzzle, Square, Turtle, Volume2 } from "lucide-react";
import { tokenize } from "@/lib/analyzer";
import { listenKorean, recognitionSupported, speak, stopSpeaking } from "@/lib/speech";
import { grade, levenshtein, normalize, shuffle, similarity, syllableDiff, type Verdict } from "@/lib/text";
import type { MinedCard } from "@/lib/store";

export interface ExerciseProps {
  card: MinedCard;
  rate: number;
  onResult: (v: Verdict | null, detail?: string) => void;
}

const btnPrimary = "btn btn-ink h-14 w-full text-base";
const btnStop = "btn btn-accent h-14 w-full text-base";

/** Small exercise label with a line icon, e.g. "Writing · Type the missing word". */
function Kind({ icon: Icon, skill, task }: { icon: typeof Mic; skill: string; task: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="icon-circle size-10">
        <Icon size={17} strokeWidth={1.75} />
      </span>
      <div>
        <p className="label">{skill}</p>
        <p className="font-semibold tracking-tight">{task}</p>
      </div>
    </div>
  );
}

function Blanked({ card, reveal }: { card: MinedCard; reveal?: boolean }) {
  const i = card.sentence.indexOf(card.target);
  if (i < 0) return <p className="ko text-[1.4rem] leading-relaxed">{card.sentence}</p>;
  return (
    <p className="ko text-[1.4rem] leading-relaxed">
      {card.sentence.slice(0, i)}
      <span
        className={`mx-0.5 inline-block min-w-16 rounded-lg border-b-[3px] px-1 text-center ${
          reveal ? "border-good text-good" : "border-accent text-transparent"
        }`}
      >
        {reveal ? card.target : "＿".repeat(Math.max(2, Array.from(card.target).length))}
      </span>
      {card.sentence.slice(i + card.target.length)}
    </p>
  );
}

function AnswerInput({ onSubmit, placeholder }: { onSubmit: (v: string) => void; placeholder: string }) {
  const [v, setV] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
    >
      <input
        ref={ref}
        lang="ko"
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="tile ko w-full px-5 py-4 text-xl outline-none"
      />
      <button type="submit" className={btnPrimary} disabled={!v.trim()}>
        Check
      </button>
    </form>
  );
}

function checkTyped(card: MinedCard, answer: string): [Verdict, string | undefined] {
  if (normalize(answer) === normalize(card.lemma) && card.lemma !== card.target)
    return ["close", `Right word! In this sentence it's conjugated as ${card.target}.`];
  return [grade(answer, card.target), undefined];
}

/** Writing: type the missing target word, with the meaning as a cue. */
export function ClozeExercise({ card, onResult }: ExerciseProps) {
  const [hint, setHint] = useState(false);
  return (
    <div className="space-y-5">
      <Kind icon={PenLine} skill="Writing" task="Type the missing word" />
      <Blanked card={card} />
      {card.translation && <p className="sub text-[15px]">{card.translation}</p>}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="pill">{card.gloss}</span>
        <button onClick={() => setHint(true)} className="pill pill-outline">
          <Lightbulb size={13} /> {hint ? `starts with ${Array.from(card.target)[0]}` : "Hint"}
        </button>
      </div>
      <AnswerInput
        placeholder="한국어로 입력…"
        onSubmit={(a) => {
          const [v, detail] = checkTyped(card, a);
          onResult(v === "correct" && hint ? "close" : v, detail);
        }}
      />
    </div>
  );
}

/** Listening: hear the native sentence, type the missing word. */
export function ListenExercise({ card, rate, onResult }: ExerciseProps) {
  const play = (r = rate) => speak(card.sentence, { rate: r });
  useEffect(() => {
    play();
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.id]);
  return (
    <div className="space-y-5">
      <Kind icon={Ear} skill="Listening" task="Type the word you hear" />
      <div className="flex items-end justify-center gap-3 py-2">
        <button onClick={() => play()} aria-label="Play" className="flex size-24 items-center justify-center rounded-full bg-ink text-on-ink">
          <Volume2 size={36} />
        </button>
        <button onClick={() => play(0.6)} aria-label="Play slowly" className="icon-circle size-12">
          <Turtle size={24} />
        </button>
      </div>
      <Blanked card={card} />
      <AnswerInput
        placeholder="들은 단어를 입력…"
        onSubmit={(a) => {
          const [v, detail] = checkTyped(card, a);
          onResult(v, detail);
        }}
      />
    </div>
  );
}

/** Reading/structure: rebuild the sentence from shuffled word tiles. */
export function RebuildExercise({ card, onResult }: ExerciseProps) {
  const words = useMemo(() => tokenize(card.sentence).map((t) => t.lead + t.core + t.trail), [card.sentence]);
  const tiles = useMemo(() => {
    const idx = words.map((_, i) => i);
    let s = shuffle(idx, card.createdAt + card.fsrs.reps);
    if (s.every((v, i) => v === i)) s = [...idx].reverse();
    return s;
  }, [words, card.createdAt, card.fsrs.reps]);
  const [picked, setPicked] = useState<number[]>([]);
  const remaining = tiles.filter((i) => !picked.includes(i));

  const check = () => {
    const built = picked.map((i) => words[i]);
    const dist = levenshtein(built, words);
    onResult(dist === 0 ? "correct" : dist <= 2 && words.length >= 5 ? "close" : "wrong");
  };

  return (
    <div className="space-y-5">
      <Kind icon={Puzzle} skill="Reading" task="Rebuild the sentence" />
      {card.translation && <p className="text-xl font-semibold tracking-tight">{card.translation}</p>}
      <p className="muted text-sm">
        Target: <b>{card.target}</b> = {card.gloss}
      </p>
      <div className="tile flex min-h-28 flex-wrap content-start gap-2 p-3">
        {picked.map((i) => (
          <button
            key={i}
            onClick={() => setPicked((p) => p.filter((x) => x !== i))}
            className="animate-pop ko rounded-full bg-ink px-4 py-2 text-lg font-medium text-on-ink"
          >
            {words[i]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {remaining.map((i) => (
          <button
            key={i}
            onClick={() => setPicked((p) => [...p, i])}
            className="card ko rounded-full px-4 py-2 text-lg font-medium active:scale-95"
          >
            {words[i]}
          </button>
        ))}
      </div>
      <button onClick={check} disabled={remaining.length > 0} className={btnPrimary}>
        Check
      </button>
    </div>
  );
}

/** Speaking: shadow the native audio; scored with on-device speech recognition when available. */
export function ShadowExercise({ card, rate, onResult }: ExerciseProps) {
  const [state, setState] = useState<"idle" | "listening" | "recording" | "recorded">("idle");
  const [heard, setHeard] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const stopRef = useRef<() => void>(() => {});
  const recorder = useRef<MediaRecorder | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const canRecognize = recognitionSupported();

  useEffect(() => () => stopSpeaking(), []);

  const recognize = async () => {
    stopSpeaking();
    setErr(null);
    setState("listening");
    const l = listenKorean();
    stopRef.current = l.stop;
    try {
      const alts = await l.result;
      setState("idle");
      if (!alts.length) {
        setErr("Didn't catch that — try again closer to the mic.");
        return;
      }
      const best = alts.reduce((a, b) => (similarity(b, card.sentence) > similarity(a, card.sentence) ? b : a));
      setHeard(best);
      const score = similarity(best, card.sentence);
      onResult(score >= 0.85 ? "correct" : score >= 0.6 ? "close" : "wrong", `${Math.round(score * 100)}% match · heard “${best}”`);
    } catch (e) {
      setState("idle");
      setErr(
        (e as Error).message === "not-allowed"
          ? "Microphone permission was denied."
          : "Speech recognition isn't available right now — record yourself instead.",
      );
    }
  };

  const record = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setAudioUrl(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType })));
        setState("recorded");
      };
      recorder.current = rec;
      rec.start();
      setState("recording");
    } catch {
      setErr("No microphone access. Say it aloud, then rate yourself.");
    }
  };

  return (
    <div className="space-y-5">
      <Kind icon={Mic} skill="Speaking" task="Listen, then say the whole sentence" />
      <p className="ko text-[1.6rem] leading-snug font-semibold tracking-tight">{card.sentence}</p>
      {card.translation && <p className="sub text-[15px]">{card.translation}</p>}
      <div className="flex gap-2">
        <button onClick={() => speak(card.sentence, { rate })} className="btn btn-soft h-12 flex-1">
          <Volume2 size={18} /> Native
        </button>
        <button onClick={() => speak(card.sentence, { rate: 0.6 })} className="btn btn-soft h-12 px-5">
          <Turtle size={18} />
        </button>
      </div>

      {heard && (
        <p className="ko text-[1.4rem]">
          {syllableDiff(card.sentence, heard).map((x, i) => (
            <span key={i} className={x.ok ? "text-good" : "text-bad underline"}>
              {x.ch}
            </span>
          ))}
        </p>
      )}
      {err && <p className="text-bad text-sm">{err}</p>}

      {canRecognize && !err ? (
        state === "listening" ? (
          <button onClick={() => stopRef.current()} className={btnStop}>
            <Square size={20} /> Listening… tap when done
          </button>
        ) : (
          <button onClick={recognize} className={btnPrimary}>
            <Mic size={22} /> Speak
          </button>
        )
      ) : (
        <div className="space-y-3">
          {state === "recording" ? (
            <button onClick={() => recorder.current?.stop()} className={btnStop}>
              <Square size={20} /> Stop recording
            </button>
          ) : (
            <button onClick={record} className={btnPrimary}>
              <Mic size={22} /> {audioUrl ? "Record again" : "Record yourself"}
            </button>
          )}
          {audioUrl && <audio src={audioUrl} controls className="w-full" />}
          <button onClick={() => onResult(null)} className="btn btn-line h-12 w-full">
            I said it — rate myself
          </button>
        </div>
      )}
    </div>
  );
}
