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
        className="sheet animate-sheet pb-safe relative max-h-[86dvh] w-full max-w-xl overflow-y-auto px-6 pt-4 pb-6 shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line" />
        <button onClick={onClose} aria-label="Close" className="icon-circle absolute top-5 right-5 size-10">
          <X size={18} strokeWidth={1.75} />
        </button>

        <div className="flex items-center gap-4 pr-12">
          <button
            onClick={() => speak(target.core, { rate: d.settings.ttsRate })}
            aria-label="Play word"
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-ink text-on-ink"
          >
            <Volume2 size={22} strokeWidth={1.75} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="ko display text-[2.2rem]">{target.core}</div>
            <div className="muted text-[15px]">
              {romanize(target.core)}
              {lemma !== target.core && (
                <>
                  {" · "}dictionary form <b className="text-fg">{lemma}</b>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          {entry ? (
            <>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="pill pill-soft">{POS_LABEL[entry.pos]}</span>
                <span className="pill pill-soft">{LEVEL[entry.level]}</span>
                <span className={status === "new" ? "pill" : "pill pill-outline"}>{status}</span>
              </div>
              <p className="mt-3 text-xl font-semibold tracking-tight">{entry.en}</p>
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
                className="tile w-full px-4 py-3 text-sm outline-none"
              />
              <a href={naverUrl(target.core)} target="_blank" rel="noreferrer" className="sub inline-flex items-center gap-1 text-sm font-semibold underline">
                Naver dictionary <ExternalLink size={14} />
              </a>
            </div>
          )}

          {g.notes.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-[15px]">
              {g.notes.map((n) => (
                <li key={n} className="muted">
                  • {n}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="tile mt-5 p-4">
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
                    {i < arr.length - 1 && <mark className="rounded-md bg-accent-soft px-0.5 text-inherit">{target.core}</mark>}
                  </span>
                ))}
              </p>
              {sentence.en ? (
                <p className="sub text-[15px] leading-snug">{sentence.en}</p>
              ) : (
                <input
                  value={customTranslation}
                  onChange={(e) => setCustomTranslation(e.target.value)}
                  placeholder="Sentence translation (optional)"
                  className="mt-2 w-full rounded-xl bg-sheet px-3 py-2 text-sm outline-none"
                />
              )}
            </div>
          </div>
        </div>

        {!mined && otherUnknown.length > 0 && (
          <div className="card mt-3 p-4 text-[15px]">
            <p>
              <span className="pill mr-1.5">1T rule</span>This sentence has {otherUnknown.length} other new word
              {otherUnknown.length > 1 ? "s" : ""}. Keep one target per card — tap to switch target, or mark ones you
              already know.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {otherUnknown.map((t) => (
                <span key={t.gloss.lemma} className="inline-flex overflow-hidden rounded-full bg-tile">
                  <button onClick={() => setTarget(t)} className="ko px-3 py-1.5 font-semibold">
                    {t.core}
                  </button>
                  <button
                    onClick={() => actions.setKnown(t.gloss.lemma, true)}
                    aria-label={`Mark ${t.core} as known`}
                    className="border-l border-line px-2.5 py-1.5 text-good"
                  >
                    <Check size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="sticky -bottom-6 -mx-6 mt-5 grid grid-cols-[1fr_auto] gap-2 bg-sheet px-6 pt-2 pb-6">
          {mined ? (
            <div className="btn btn-soft h-14">
              <BookmarkCheck size={19} strokeWidth={1.75} /> In your review deck
            </div>
          ) : blocked > 0 ? (
            <Link
              href="/review/"
              className="btn btn-accent h-14 px-4 text-center"
            >
              <Lock size={17} /> Clear {blocked} due review{blocked > 1 ? "s" : ""} first
            </Link>
          ) : (
            <button
              onClick={mine}
              disabled={!glossText}
              className="btn btn-ink h-14"
            >
              <BookmarkPlus size={19} strokeWidth={1.75} /> Save sentence
            </button>
          )}
          <button
            onClick={() => actions.setKnown(lemma, status !== "known")}
            className={`btn h-14 px-5 text-sm ${status === "known" ? "btn-soft" : "btn-line"}`}
          >
            {status === "known" ? "Known ✓" : "I know it"}
          </button>
        </div>
      </div>
    </div>
  );
}
