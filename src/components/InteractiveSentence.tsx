"use client";

import { useMemo } from "react";
import { tokenize, type Token } from "@/lib/analyzer";
import { wordStatus, type Data } from "@/lib/store";

interface Props {
  text: string;
  data: Data;
  onWord: (t: Token) => void;
  selected?: string | null; // core of the selected token
  highlightUnknown?: boolean;
  className?: string;
}

export default function InteractiveSentence({ text, data, onWord, selected, highlightUnknown = true, className }: Props) {
  const tokens = useMemo(() => tokenize(text), [text]);
  return (
    <span className={`ko ${className ?? ""}`}>
      {tokens.map((t, i) => {
        const status =
          t.gloss.kind === "latin" || t.gloss.kind === "number" ? "known" : wordStatus(data, t.gloss.lemma);
        const style =
          selected === t.core
            ? "bg-ink text-on-ink"
            : !highlightUnknown || status === "known"
              ? "hover:bg-black/5 dark:hover:bg-white/10"
              : status === "learning"
                ? "decoration-fg-2/60 underline decoration-2 underline-offset-[6px]"
                : "decoration-accent underline decoration-dotted decoration-2 underline-offset-[6px]";
        return (
          <span key={i}>
            {t.lead}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onWord(t);
              }}
              className={`rounded-lg px-0.5 transition-colors ${style}`}
            >
              {t.core}
            </button>
            {t.trail}{" "}
          </span>
        );
      })}
    </span>
  );
}
