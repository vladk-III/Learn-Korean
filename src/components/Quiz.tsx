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

const btn3d =
  "w-full rounded-2xl py-4 text-lg font-bold text-white active:translate-y-1 active:shadow-none disabled:opacity-40";

function Prompt({ q, rate }: { q: Question; rate: number }) {
  if (q.kind === "meaning")
    return (
      <>
        <p className="muted text-sm font-bold uppercase">What does this word mean?</p>
        <button
          onClick={() => speak(q.word, { rate })}
          className="mt-3 flex items-center gap-3 text-4xl font-extrabold"
          aria-label={`Play ${q.word}`}
        >
          {q.word}
          <Volume2 className="text-brand-500" size={26} />
        </button>
      </>
    );
  if (q.kind === "cloze")
    return (
      <>
        <p className="muted text-sm font-bold uppercase">Fill in the blank</p>
        <p className="ko mt-3 text-xl">
          {q.before}
          <span className="border-brand-500 mx-1 inline-block min-w-14 border-b-4" />
          {q.after}
        </p>
        {q.en && <p className="muted mt-1 text-sm">{q.en}</p>}
      </>
    );
  return (
    <>
      <p className="muted text-sm font-bold uppercase">Which sentence means…</p>
      <p className="mt-3 text-xl font-semibold">“{q.en}”</p>
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="card animate-sheet pb-safe relative max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-b-none p-5 text-[var(--fg)] sm:rounded-b-2xl">
        <div className="flex items-center gap-3">
          <button onClick={onClose} aria-label="Close quiz" className="muted p-1">
            <X />
          </button>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${(Math.min(i, questions.length) / questions.length) * 100}%` }}
            />
          </div>
          <span className="muted text-sm font-bold">
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
                      ? "hairline"
                      : isAnswer
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15"
                        : k === chosen
                          ? "border-rose-500 bg-rose-50 dark:bg-rose-500/15"
                          : "hairline opacity-50";
                    return (
                      <button
                        key={k}
                        disabled={answered}
                        onClick={() => setChosen(k)}
                        className={`flex items-center justify-between gap-2 rounded-2xl border-2 px-4 py-3.5 text-left font-semibold ${
                          q.kind === "meaning" ? "" : "ko"
                        } ${style}`}
                      >
                        <span>{opt}</span>
                        {answered && isAnswer && <Check className="shrink-0 text-emerald-600" size={20} />}
                        {answered && !isAnswer && k === chosen && <X className="shrink-0 text-rose-500" size={20} />}
                      </button>
                    );
                  })}
                </div>
                {answered && (
                  <div className="mt-4">
                    <p
                      className={`mb-3 font-bold ${chosen === q.answer ? "text-emerald-600" : "text-rose-500"}`}
                    >
                      {chosen === q.answer
                        ? "정답! Correct"
                        : q.miss
                          ? `Not quite — “${q.miss.target}” goes to your review words.`
                          : "Not quite."}
                    </p>
                    <button
                      onClick={next}
                      className={`${btn3d} ${chosen === q.answer ? "bg-emerald-500 shadow-[0_4px_0_#047857]" : "bg-rose-500 shadow-[0_4px_0_#be123c]"}`}
                    >
                      {i + 1 >= questions.length ? "See results" : "Continue"}
                    </button>
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          <div className="animate-pop mt-6 text-center">
            <p className="text-5xl">{wrong.length === 0 ? "🏆" : wrong.length <= 1 ? "🎉" : "💪"}</p>
            <h2 className="mt-2 text-2xl font-extrabold">
              {questions.length - wrong.length}/{questions.length} retained
            </h2>
            <p className="muted text-sm">
              {wrong.length === 0
                ? "Perfect — you kept everything from this one."
                : "Missed words are now in your review deck, so they'll come back before you forget them."}
            </p>
            {wrong.some((q) => q.miss) && (
              <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-left dark:bg-amber-500/10">
                <p className="text-xs font-bold text-amber-900 uppercase dark:text-amber-200">Review words</p>
                <ul className="mt-1 space-y-1">
                  {wrong
                    .filter((q) => q.miss)
                    .map((q) => {
                      const g = analyzeWord(q.miss!.target);
                      return (
                        <li key={q.miss!.lemma} className="flex justify-between gap-2 text-sm">
                          <b className="ko">{q.miss!.lemma}</b>
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
                  className={`${btn3d} bg-brand-500 flex items-center justify-center gap-2 shadow-[0_4px_0_var(--color-brand-700)]`}
                >
                  <Layers size={20} /> Review them now
                </Link>
              )}
              <button onClick={onClose} className="hairline flex items-center justify-center gap-2 rounded-2xl border-2 py-3 font-bold">
                <RotateCcw size={18} /> Back to {content.kind === "clip" ? "clips" : "the article"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
