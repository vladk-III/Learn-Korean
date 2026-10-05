/** Study sets for flashcards and the typing game (Quizlet-style practice). */
import { ARTICLES } from "@/content/articles";
import { CLIPS } from "@/content/clips";
import type { Content } from "@/content/types";
import { tokenize } from "./analyzer";
import { State } from "./fsrs";
import type { Data } from "./store";

export interface StudyItem {
  /** What you type / see on the Korean side: the dictionary form. */
  ko: string;
  en: string;
  /** Other accepted answers (e.g. the form used in the sentence). */
  alt: string[];
  sentence?: string;
  sentenceEn?: string;
  /** The word as it appears in `sentence` (for highlighting / blanks). */
  target?: string;
  sourceId: string;
  sourceTitle: string;
  sourceKind: "news" | "clip";
  notes: string[];
}

export interface StudySet {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  items: StudyItem[];
}

const SKIP_POS = new Set(["prop", "num"]);

export function itemsFromContent(c: Content): StudyItem[] {
  const seen = new Set<string>();
  const out: StudyItem[] = [];
  for (const s of c.sentences)
    for (const t of tokenize(s.ko)) {
      const e = t.gloss.entry;
      if (!e || t.gloss.kind !== "word" || SKIP_POS.has(e.pos) || seen.has(e.ko)) continue;
      seen.add(e.ko);
      out.push({
        ko: e.ko,
        en: e.en,
        alt: t.core !== e.ko ? [t.core] : [],
        sentence: s.ko,
        sentenceEn: s.en,
        target: t.core,
        sourceId: c.id,
        sourceTitle: c.title,
        sourceKind: c.kind,
        notes: t.gloss.notes,
      });
    }
  return out;
}

function itemsFromCards(cards: Data["cards"]): StudyItem[] {
  return cards.map((c) => ({
    ko: c.lemma,
    en: c.gloss,
    alt: c.target !== c.lemma ? [c.target] : [],
    sentence: c.sentence,
    sentenceEn: c.translation,
    target: c.target,
    sourceId: c.sourceId,
    sourceTitle: c.sourceTitle,
    sourceKind: c.sourceKind,
    notes: c.notes,
  }));
}

export function studySets(d: Data): StudySet[] {
  const sets: StudySet[] = [];
  if (d.cards.length)
    sets.push({
      id: "deck",
      title: "My deck",
      subtitle: "Every sentence you've mined",
      emoji: "🗂️",
      items: itemsFromCards(d.cards),
    });
  const missed = d.cards.filter((c) => c.fromQuiz && !(c.fsrs.state === State.Review && c.fsrs.stability >= 21));
  if (missed.length)
    sets.push({
      id: "missed",
      title: "Missed in quizzes",
      subtitle: "Words that didn't stick yet",
      emoji: "📝",
      items: itemsFromCards(missed),
    });
  for (const c of [...d.imported, ...ARTICLES, ...CLIPS]) {
    const items = itemsFromContent(c);
    if (items.length >= 4)
      sets.push({
        id: c.id,
        title: c.title,
        subtitle: `${c.kind === "clip" ? "Clip" : "News"} · ${c.level} · ${c.titleEn}`,
        emoji: c.emoji,
        items,
      });
  }
  return sets;
}

export function findSet(d: Data, id: string): StudySet | undefined {
  return studySets(d).find((s) => s.id === id);
}

export const firstSense = (en: string) => en.split(/;\s*/)[0];
