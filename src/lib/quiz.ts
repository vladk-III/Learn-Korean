/**
 * Builds a short retention quiz from a piece of content (article or clip).
 * Words the learner tapped are quizzed first, then words they don't know yet.
 */
import { DICTIONARY, type DictEntry } from "@/content/dictionary";
import type { Content } from "@/content/types";
import { tokenize, type Token } from "./analyzer";
import { shuffle } from "./text";

export interface QuizMiss {
  sentenceIdx: number;
  target: string; // surface form in the sentence
  lemma: string;
}

interface Base {
  options: string[];
  answer: number;
  sentenceIdx: number;
  /** The word added to review if this question is missed. */
  miss: QuizMiss | null;
}

export type Question =
  | (Base & { kind: "meaning"; word: string; lemma: string })
  | (Base & { kind: "cloze"; before: string; after: string; en: string })
  | (Base & { kind: "comprehension"; en: string });

const QUIZABLE = new Set(["n", "v", "a", "adv", "pron", "det", "cnt", "num", "exp", "int"]);

interface Candidate {
  token: Token;
  entry: DictEntry;
  sentenceIdx: number;
}

function rng(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Pick `n` distinct items from `pool` (excluding `exclude`) using `rand`. */
function pick<T>(pool: T[], n: number, rand: () => number, exclude: (t: T) => boolean): T[] {
  const out: T[] = [];
  const copy = pool.filter((t) => !exclude(t));
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  return out;
}

function withAnswer(correct: string, distractors: string[], seed: number): { options: string[]; answer: number } {
  const options = shuffle([correct, ...distractors], seed);
  return { options, answer: options.indexOf(correct) };
}

const firstSense = (en: string) => en.split(/;\s*/)[0];

export function buildQuiz(
  content: Content,
  opts: { tapped?: string[]; statusOf?: (lemma: string) => "known" | "learning" | "new"; max?: number; seed?: number } = {},
): Question[] {
  const max = opts.max ?? (content.kind === "clip" ? 4 : 5);
  const seed = opts.seed ?? Date.now();
  const rand = rng(seed);
  const tapped = new Set(opts.tapped ?? []);
  const statusOf = opts.statusOf ?? (() => "new" as const);

  // Unique quizable words, in priority order: tapped → new → learning → harder known words.
  const seen = new Set<string>();
  const cands: Candidate[] = [];
  content.sentences.forEach((s, sentenceIdx) =>
    tokenize(s.ko).forEach((token) => {
      const entry = token.gloss.entry;
      if (!entry || token.gloss.kind !== "word" || !QUIZABLE.has(entry.pos) || seen.has(entry.ko)) return;
      seen.add(entry.ko);
      cands.push({ token, entry, sentenceIdx });
    }),
  );
  const rank = (c: Candidate) =>
    (tapped.has(c.entry.ko) ? 0 : 10) +
    ({ new: 0, learning: 1, known: 3 }[statusOf(c.entry.ko)] ?? 3) -
    c.entry.level * 0.1 +
    rand() * 0.5;
  cands.sort((a, b) => rank(a) - rank(b));

  const questions: Question[] = [];
  const used = new Set<string>();
  const missOf = (c: Candidate): QuizMiss => ({ sentenceIdx: c.sentenceIdx, target: c.token.core, lemma: c.entry.ko });

  // 1) Meaning questions: Korean word → English meaning.
  const nMeaning = Math.max(1, max - 2);
  for (const c of cands) {
    if (questions.length >= nMeaning) break;
    const correct = firstSense(c.entry.en);
    const pool = [
      ...cands.map((x) => x.entry).filter((e) => e.pos === c.entry.pos),
      ...DICTIONARY.filter((e) => e.pos === c.entry.pos),
    ];
    const distractors = [
      ...new Set(pick(pool, 12, rand, (e) => e.ko === c.entry.ko).map((e) => firstSense(e.en))),
    ]
      .filter((en) => en !== correct)
      .slice(0, 3);
    if (distractors.length < 3) continue;
    used.add(c.entry.ko);
    questions.push({
      kind: "meaning",
      word: c.token.core,
      lemma: c.entry.ko,
      sentenceIdx: c.sentenceIdx,
      miss: missOf(c),
      ...withAnswer(correct, distractors, seed + questions.length),
    });
  }

  // 2) Cloze: pick the right word form for the blank in a sentence from the content.
  const clozeCand = cands.find((c) => !used.has(c.entry.ko) && content.sentences[c.sentenceIdx].ko.includes(c.token.core));
  if (clozeCand && questions.length < max) {
    const s = content.sentences[clozeCand.sentenceIdx];
    const i = s.ko.indexOf(clozeCand.token.core);
    const surfaces = [...new Set(cands.map((c) => c.token.core))];
    const distractors = pick(surfaces, 3, rand, (w) => w === clozeCand.token.core || s.ko.includes(w));
    if (distractors.length === 3) {
      used.add(clozeCand.entry.ko);
      questions.push({
        kind: "cloze",
        before: s.ko.slice(0, i),
        after: s.ko.slice(i + clozeCand.token.core.length),
        en: s.en,
        sentenceIdx: clozeCand.sentenceIdx,
        miss: missOf(clozeCand),
        ...withAnswer(clozeCand.token.core, distractors, seed + 7),
      });
    }
  }

  // 3) Comprehension: which Korean sentence matches this meaning?
  const translated = content.sentences.map((s, i) => ({ ...s, i })).filter((s) => s.en && s.ko.length > 4);
  if (translated.length >= 4 && questions.length < max) {
    const target = translated[Math.floor(rand() * translated.length)];
    const distractors = pick(translated, 3, rand, (s) => s.i === target.i).map((s) => s.ko);
    // If missed, review the hardest not-yet-known word in that sentence.
    const hardest = cands
      .filter((c) => c.sentenceIdx === target.i && statusOf(c.entry.ko) !== "known")
      .sort((a, b) => b.entry.level - a.entry.level)[0];
    questions.push({
      kind: "comprehension",
      en: target.en,
      sentenceIdx: target.i,
      miss: hardest ? missOf(hardest) : null,
      ...withAnswer(target.ko, distractors, seed + 13),
    });
  }

  // Top up with more meaning questions if the content was too short for the others.
  for (const c of cands) {
    if (questions.length >= max) break;
    if (used.has(c.entry.ko)) continue;
    const correct = firstSense(c.entry.en);
    const distractors = [
      ...new Set(pick(DICTIONARY, 12, rand, (e) => e.ko === c.entry.ko || e.pos !== c.entry.pos).map((e) => firstSense(e.en))),
    ]
      .filter((en) => en !== correct)
      .slice(0, 3);
    if (distractors.length < 3) continue;
    used.add(c.entry.ko);
    questions.push({
      kind: "meaning",
      word: c.token.core,
      lemma: c.entry.ko,
      sentenceIdx: c.sentenceIdx,
      miss: missOf(c),
      ...withAnswer(correct, distractors, seed + 31 + questions.length),
    });
  }

  return questions;
}
