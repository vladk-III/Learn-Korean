/** Study sets for flashcards and the typing game (Quizlet-style practice). */
import { ARTICLES } from "@/content/articles";
import { CLIPS } from "@/content/clips";
import {
  DLPT_1_100,
  DLPT_101_200,
  DLPT_201_300,
  DLPT_301_400,
  DLPT_401_500,
  DLPT_501_600,
  DLPT_601_700,
  DLPT_701_800,
  DLPT_LOWER,
  type BankTerm,
} from "@/content/dlptBank";
import type { Content, Topic } from "@/content/types";
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
  /** Content sets carry their topic (for the icon); deck sets don't. */
  topic?: Topic;
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

/** Every distinct word across the content written for one exam. */
function trackItems(track: "dlpt" | "opi"): StudyItem[] {
  const seen = new Set<string>();
  return [...ARTICLES, ...CLIPS]
    .filter((c) => c.track === track)
    .flatMap(itemsFromContent)
    .filter((it) => !seen.has(it.ko) && seen.add(it.ko));
}

/** Strip a final 다 / 하다 / 되다 so 검거하다 also matches 검거했습니다. */
const stemOf = (ko: string) => ko.replace(/\s+/g, " ").replace(/(하다|되다|다)$/, "");

/**
 * Quizlet terms become study items; where a story uses the word we attach
 * that sentence so it can be shown in context and mined into reviews.
 */
function bankItems(terms: BankTerm[], setTitle: string): StudyItem[] {
  const sentences = [...ARTICLES, ...CLIPS].flatMap((c) => c.sentences.map((s) => ({ c, s })));
  return terms.map((t) => {
    const stem = stemOf(t.ko);
    // Only match at the start of a word so 수직 doesn't hit inside another word.
    const re = new RegExp(`(?:^|\\s)(${stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^\\s.,?!]*)`);
    const hit = stem.length >= 2 ? sentences.find(({ s }) => re.test(s.ko)) : undefined;
    const target = hit?.s.ko.match(re)?.[1];
    return {
      ko: t.ko,
      en: t.en,
      alt: t.alt ?? [],
      sentence: hit?.s.ko,
      sentenceEn: hit?.s.en,
      target,
      sourceId: hit?.c.id ?? "quizlet-dlpt",
      sourceTitle: hit?.c.title ?? setTitle,
      sourceKind: hit?.c.kind ?? "news",
      notes: t.full ? [`Quizlet card: ${t.full}`] : [],
    };
  });
}

const BANK: { id: string; title: string; terms: BankTerm[] }[] = [
  { id: "quizlet-dlpt-1", title: "Quizlet DLPT 1–100", terms: DLPT_1_100 },
  { id: "quizlet-dlpt-2", title: "Quizlet DLPT 101–200", terms: DLPT_101_200 },
  { id: "quizlet-dlpt-3", title: "Quizlet DLPT 201–300", terms: DLPT_201_300 },
  { id: "quizlet-dlpt-4", title: "Quizlet DLPT 301–400", terms: DLPT_301_400 },
  { id: "quizlet-dlpt-5", title: "Quizlet DLPT 401–500", terms: DLPT_401_500 },
  { id: "quizlet-dlpt-6", title: "Quizlet DLPT 501–600", terms: DLPT_501_600 },
  { id: "quizlet-dlpt-7", title: "Quizlet DLPT 601–700", terms: DLPT_601_700 },
  { id: "quizlet-dlpt-8", title: "Quizlet DLPT 701–800", terms: DLPT_701_800 },
  { id: "quizlet-dlpt-lower", title: "Quizlet lower-level DLPT", terms: DLPT_LOWER },
];

export function studySets(d: Data): StudySet[] {
  const sets: StudySet[] = [
    {
      id: "dlpt-core",
      title: "DLPT core vocabulary",
      subtitle: "Security, politics, economy & North Korea — from every DLPT story",
      emoji: "🎖️",
      topic: "Security",
      items: trackItems("dlpt"),
    },
    {
      id: "opi-core",
      title: "OPI speaking vocabulary",
      subtitle: "Words from the interview-style clips",
      emoji: "🎙️",
      topic: "Culture",
      items: trackItems("opi"),
    },
    ...BANK.map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: `Your Quizlet cards · ${b.terms.length} terms`,
      emoji: "📇",
      topic: "Security" as Topic,
      items: bankItems(b.terms, b.title),
    })),
  ];
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
        topic: c.topic,
        items,
      });
  }
  return sets;
}

export function findSet(d: Data, id: string): StudySet | undefined {
  return studySets(d).find((s) => s.id === id);
}

export const firstSense = (en: string) => en.split(/;\s*/)[0];
