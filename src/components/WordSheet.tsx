"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookmarkCheck, BookmarkPlus, Check, ExternalLink, Globe, Lock, Volume2, X } from "lucide-react";
import { tokenize, type Token } from "@/lib/analyzer";
import { POS_LABEL } from "@/content/dictionary";
import { romanize } from "@/lib/hangul";
import { speak } from "@/lib/speech";
import { lookupOnline, naverUrl, type OnlineGloss } from "@/lib/lookup";
import { actions, blockingDue, useData, wordStatus } from "@/lib/store";
import type { Sentence } from "@/content/types";

const LEVEL = ["", "A1", "A2", "B1", "B2", "C1"];

export interface MineSource {
  id: string;
  title: string;
  kind: "news" | "clip";
}

interface Props {
  token: Token;
  sentence: Sentence;
  source: MineSource;
  onClose: () => void;
}

export default function WordSheet({ token: tapped, sentence, source, onClose }: Props) {
  const d = useData();
  const [target, setTarget] = useState<Token>(tapped);
  const [online, setOnline] = useState<OnlineGloss | null | "loading">(null);
  const [customGloss, setCustomGloss] = useState("");
  const [customTranslation, setCustomTranslation] = useState("");

  useEffect(() => {
    setTarget(tapped);
  }, [tapped]);

  const g = target.gloss;
  const entry = g.entry;
  const lemma = g.lemma;
  const status = wordStatus(d, lemma);

  useEffect(() => {
    setOnline(null);
    setCustomGloss("");
    if (!entry && g.kind === "unknown") {
      setOnline("loading");
      let alive = true;
      lookupOnline(target.core).then((r) => alive && setOnline(r));
      return () => {
        alive = false;
      };
    }
  }, [entry, g.kind, target.core]);

  // 1T rule: other words in this sentence the learner doesn't know yet.
  const otherUnknown = useMemo(() => {
    const seen = new Set<string>([lemma]);
    return tokenize(sentence.ko).filter((t) => {
      if (t.gloss.kind === "latin" || t.gloss.kind === "number") return false;
      if (seen.has(t.gloss.lemma)) return false;
      seen.add(t.gloss.lemma);
      return wordStatus(d, t.gloss.lemma) === "new";
    });
  }, [sentence.ko, lemma, d]);

  const onlineGloss = online && online !== "loading" ? online.definitions.join("; ") : "";
  const glossText = entry?.en ?? (customGloss || onlineGloss);
  const mined = d.cards.some((c) => c.sentence === sentence.ko && c.lemma === lemma);
  const blocked = d.settings.strictReviewFirst ? blockingDue(d) : 0;

  const mine = () => {
    if (!glossText) return;
    actions.mine({
      sentence: sentence.ko,
      translation: sentence.en || customTranslation,
      target: target.core,
      lemma,
      gloss: glossText,
      notes: g.notes,
      sourceId: source.id,
      sourceTitle: source.title,
      sourceKind: source.kind,
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        role="dialog"
        aria-label={`Meaning of ${target.core}`}
        onClick={(e) => e.stopPropagation()}
        className="card animate-sheet pb-safe relative max-h-[85dvh] w-full max-w-xl overflow-y-auto rounded-b-none p-5 shadow-2xl"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
        <button onClick={onClose} aria-label="Close" className="muted absolute top-4 right-4 p-1">
          <X size={20} />
        </button>

        <div className="flex items-start gap-3">
          <button
            onClick={() => speak(target.core, { rate: d.settings.ttsRate })}
            aria-label="Play word"
            className="bg-brand-500 mt-1 rounded-full p-2.5 text-white"
          >
            <Volume2 size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-3xl font-extrabold">{target.core}</div>
            <div className="muted text-sm">
              {romanize(target.core)}
              {lemma !== target.core && (
                <>
                  {" · "}dictionary form <b className="text-[var(--fg)]">{lemma}</b>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          {entry ? (
            <>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 font-semibold dark:bg-white/10">
                  {POS_LABEL[entry.pos]}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 font-semibold dark:bg-white/10">
                  {LEVEL[entry.level]}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 font-semibold ${
                    status === "known"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : status === "learning"
                        ? "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
                  }`}
                >
                  {status}
                </span>
              </div>
              <p className="mt-2 text-lg font-semibold">{entry.en}</p>
            </>
          ) : g.kind === "number" ? (
            <p className="text-lg font-semibold">Number{g.entry ? ` + ${g.entry.ko}` : ""}</p>
          ) : (
            <div className="space-y-2">
              <p className="muted text-sm">Not in the built-in dictionary.</p>
              {online === "loading" && <p className="muted text-sm">Looking up online…</p>}
              {online && online !== "loading" && (
                <p className="text-sm">
                  <Globe size={14} className="mr-1 inline" />
                  <b>{online.word}</b> ({online.pos}): {online.definitions.join("; ")}
                </p>
              )}
              <input
                value={customGloss}
                onChange={(e) => setCustomGloss(e.target.value)}
                placeholder={onlineGloss ? "Edit meaning (optional)" : "Type a meaning to save this word"}
                className="hairline w-full rounded-xl border bg-transparent px-3 py-2 text-sm"
              />
              <a href={naverUrl(target.core)} target="_blank" rel="noreferrer" className="text-brand-600 dark:text-brand-400 inline-flex items-center gap-1 text-sm font-semibold">
                Naver dictionary <ExternalLink size={14} />
              </a>
            </div>
          )}

          {g.notes.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-sm">
              {g.notes.map((n) => (
                <li key={n} className="muted">
                  • {n}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 rounded-xl bg-gray-50 p-3 dark:bg-white/5">
          <div className="flex items-start gap-2">
            <button
              onClick={() => speak(sentence.ko, { rate: d.settings.ttsRate })}
              aria-label="Play sentence"
              className="muted mt-1"
            >
              <Volume2 size={16} />
            </button>
            <div>
              <p className="ko">
                {sentence.ko.split(target.core).map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && <mark className="bg-brand-100 dark:bg-brand-500/30 rounded px-0.5 text-inherit">{target.core}</mark>}
                  </span>
                ))}
              </p>
              {sentence.en ? (
                <p className="muted text-sm">{sentence.en}</p>
              ) : (
                <input
                  value={customTranslation}
                  onChange={(e) => setCustomTranslation(e.target.value)}
                  placeholder="Sentence translation (optional)"
                  className="hairline mt-1 w-full rounded-lg border bg-transparent px-2 py-1 text-sm"
                />
              )}
            </div>
          </div>
        </div>

        {!mined && otherUnknown.length > 0 && (
          <div className="mt-3 rounded-xl border border-amber-300 p-3 text-sm dark:border-amber-500/40">
            <p>
              <b>1T rule:</b> this sentence has {otherUnknown.length} other new word
              {otherUnknown.length > 1 ? "s" : ""}. Keep one target per card — tap to switch target, or mark ones you
              already know.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {otherUnknown.map((t) => (
                <span key={t.gloss.lemma} className="inline-flex overflow-hidden rounded-full border border-amber-400/60">
                  <button onClick={() => setTarget(t)} className="px-2.5 py-1 font-semibold">
                    {t.core}
                  </button>
                  <button
                    onClick={() => actions.setKnown(t.gloss.lemma, true)}
                    aria-label={`Mark ${t.core} as known`}
                    className="border-l border-amber-400/60 px-2 py-1 text-emerald-600"
                  >
                    <Check size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="sticky -bottom-5 -mx-5 mt-4 grid grid-cols-[1fr_auto] gap-2 bg-[var(--card)] px-5 pt-2 pb-5">
          {mined ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 font-bold text-white">
              <BookmarkCheck size={20} /> In your review deck
            </div>
          ) : blocked > 0 ? (
            <Link
              href="/review/"
              className="flex items-center justify-center gap-2 rounded-2xl bg-rose-500 py-3.5 text-center font-bold text-white"
            >
              <Lock size={18} /> Clear {blocked} due review{blocked > 1 ? "s" : ""} first
            </Link>
          ) : (
            <button
              onClick={mine}
              disabled={!glossText}
              className="bg-brand-500 flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-white shadow-[0_4px_0_var(--color-brand-700)] active:translate-y-1 active:shadow-none disabled:opacity-40"
            >
              <BookmarkPlus size={20} /> Mine sentence
            </button>
          )}
          <button
            onClick={() => actions.setKnown(lemma, status !== "known")}
            className={`rounded-2xl border-2 px-4 text-sm font-bold ${
              status === "known" ? "border-emerald-500 text-emerald-600" : "hairline"
            }`}
          >
            {status === "known" ? "Known ✓" : "I know it"}
          </button>
        </div>
      </div>
    </div>
  );
}
