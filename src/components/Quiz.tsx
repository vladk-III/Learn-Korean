"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Layers, RotateCcw, Volume2, X } from "lucide-react";
import type { Content } from "@/content/types";
import { buildQuiz, type Question } from "@/lib/quiz";
import { analyzeWord } from "@/lib/analyzer";
import { speak } from "@/lib/speech";
import { actions, useData, wordStatus } from "@/lib/store";

interface Props {
  content: Content;
  /** Lemmas the learner looked up while reading/watching. */
  tapped: string[];
  onClose: () => void;
}

const btnBig = "btn h-14 w-full text-base";

function Prompt({ q, rate }: { q: Question; rate: number }) {
  if (q.kind === "meaning")
    return (
      <>
        <p className="label">What does this word mean?</p>
        <button
          onClick={() => speak(q.word, { rate })}
          className="ko display mt-2 flex items-center gap-3 text-[2.6rem]"
          aria-label={`Play ${q.word}`}
        >
          {q.word}
          <span className="icon-circle size-11"><Volume2 size={19} strokeWidth={1.75} /></span>
        </button>
      </>
    );
  if (q.kind === "cloze")
    return (
      <>
        <p className="label">Fill in the blank</p>
        <p className="ko mt-2 text-[1.4rem] leading-relaxed">
          {q.before}
          <span className="mx-1 inline-block min-w-14 border-b-[3px] border-accent" />
          {q.after}
        </p>
        {q.en && <p className="sub mt-1 text-[15px]">{q.en}</p>}
      </>
    );
  return (
    <>
      <p className="label">Which sentence means…</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">“{q.en}”</p>
    </>
  );
}

export default function Quiz({ content, tapped, onClose }: Props) {
  const d = useData();
  const questions = useMemo(
    () => buildQuiz(content, { tapped, statusOf: (l) => wordStatus(d, l) }),
    // Build once per quiz; later store updates (e.g. new cards) mustn't reshuffle it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [content.id],
  );
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [wrong, setWrong] = useState<Question[]>([]);
  const [added, setAdded] = useState<number | null>(null);
  const done = i >= questions.length;

  const finish = (misses: Question[]) => {
    const items = misses
      .filter((q) => q.miss)
      .map((q) => {
        const m = q.miss!;
        const s = content.sentences[m.sentenceIdx];
        const g = analyzeWord(m.target);
        return {
          sentence: s.ko,
          translation: s.en,
          target: m.target,
          lemma: m.lemma,
          gloss: g.entry?.en ?? "",
          notes: g.notes,
          sourceId: content.id,
          sourceTitle: content.title,
          sourceKind: content.kind,
        };
      })
      .filter((x) => x.gloss);
    setAdded(actions.addMissedWords(items));
    actions.recordQuiz({
      contentId: content.id,
      ts: Date.now(),
      score: questions.length - misses.length,
      total: questions.length,
      missed: items.map((x) => x.lemma),
    });
  };

  const next = () => {
    const q = questions[i];
    const misses = chosen !== q.answer ? [...wrong, q] : wrong;
    setWrong(misses);
    setChosen(null);
    if (i + 1 >= questions.length) finish(misses);
    setI(i + 1);
  };

  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="sheet animate-sheet pb-safe relative max-h-[92dvh] w-full max-w-xl overflow-y-auto px-6 pt-6 pb-6 sm:rounded-b-[2rem]">
        <div className="flex items-center gap-3">
          <button onClick={onClose} aria-label="Close quiz" className="icon-circle size-10">
            <X />
          </button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-ink transition-all"
              style={{ width: `${(Math.min(i, questions.length) / questions.length) * 100}%` }}
            />
          </div>
          <span className="label tabular-nums">
            {Math.min(i + 1, questions.length)}/{questions.length}
          </span>
        </div>

        {!done ? (
          (() => {
            const q = questions[i];
            const answered = chosen !== null;
            return (
              <div key={i} className="animate-pop mt-6">
                <Prompt q={q} rate={d.settings.ttsRate} />
                <div className="mt-5 grid gap-2.5">
                  {q.options.map((opt, k) => {
                    const isAnswer = k === q.answer;
                    const style = !answered
                      ? "card"
                      : isAnswer
                        ? "border border-sage bg-sage-soft text-sage"
                        : k === chosen
                          ? "border border-rose bg-rose-soft text-rose"
                          : "card opacity-40";
                    return (
                      <button
                        key={k}
                        disabled={answered}
                        onClick={() => setChosen(k)}
                        className={`flex items-center justify-between gap-2 rounded-[1.25rem] px-5 py-4 text-left font-medium ${
                          q.kind === "meaning" ? "" : "ko"
                        } ${style}`}
                      >
                        <span>{opt}</span>
                        {answered && isAnswer && <Check className="shrink-0" size={19} />}
                        {answered && !isAnswer && k === chosen && <X className="shrink-0" size={19} />}
                      </button>
                    );
                  })}
                </div>
                {answered && (
                  <div className="mt-4">
                    <p
                      className={`mb-3 font-semibold ${chosen === q.answer ? "text-good" : "text-bad"}`}
                    >
                      {chosen === q.answer
                        ? "Correct"
                        : q.miss
                          ? `Not quite — “${q.miss.target}” goes to your review words.`
                          : "Not quite."}
                    </p>
                    <button
                      onClick={next}
                      className={`${btnBig} btn-ink`}
                    >
                      {i + 1 >= questions.length ? "See results" : "Continue"}
                    </button>
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          <div className="animate-pop mt-8">
            <p className="label">Retained</p>
            <p className="num-thin text-[4.5rem] leading-none">
              {questions.length - wrong.length}
              <span className="muted text-[2.5rem]">/{questions.length}</span>
            </p>
            <p className="sub mt-3 text-[15px]">
              {wrong.length === 0
                ? "Perfect — you kept everything from this one."
                : "Missed words are now in your review deck, so they'll come back before you forget them."}
            </p>
            {wrong.some((q) => q.miss) && (
              <div className="mt-5 rounded-[1.4rem] bg-peach-soft p-4">
                <span className="pill">Added to review</span>
                <ul className="mt-3 space-y-1.5">
                  {wrong
                    .filter((q) => q.miss)
                    .map((q) => {
                      const g = analyzeWord(q.miss!.target);
                      return (
                        <li key={q.miss!.lemma} className="flex justify-between gap-3 text-[15px]">
                          <b className="ko font-semibold">{q.miss!.lemma}</b>
                          <span className="muted truncate">{g.entry?.en}</span>
                        </li>
                      );
                    })}
                </ul>
                {added !== null && added < wrong.filter((q) => q.miss).length && (
                  <p className="muted mt-1 text-xs">Words already in your deck weren&apos;t added twice.</p>
                )}
              </div>
            )}
            <div className="mt-5 grid gap-2">
              {wrong.some((q) => q.miss) && (
                <Link
                  href="/review/"
                  className={`${btnBig} btn-ink`}
                >
                  <Layers size={18} strokeWidth={1.75} /> Review them now
                </Link>
              )}
              <button onClick={onClose} className="btn btn-line h-12 w-full">
                <RotateCcw size={17} strokeWidth={1.75} /> Back to {content.kind === "clip" ? "clips" : "the article"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
