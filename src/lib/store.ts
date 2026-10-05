"use client";
/**
 * Local-first app state persisted to localStorage. Shapes mirror the server
 * schema in prisma/schema.prisma so a sync backend can be added later.
 */
import { useSyncExternalStore } from "react";
import { FSRS, Rating, State, newCard, type Card } from "./fsrs";
import type { Article, Content } from "@/content/types";
import { ARTICLES } from "@/content/articles";
import { CLIPS } from "@/content/clips";
import { lookupLemma, tokenize } from "./analyzer";

export type Skill = "reading" | "writing" | "listening" | "speaking";
export type Exercise = "rebuild" | "cloze" | "listen" | "shadow";

export const SKILL_EXERCISE: Record<Skill, Exercise> = {
  reading: "rebuild",
  writing: "cloze",
  listening: "listen",
  speaking: "shadow",
};

export interface Settings {
  onboarded: boolean;
  /** 0 = brand new, 1 = A1, 2 = A2, 3 = B1, 4 = B2 — words at or below are "known". */
  placement: number;
  newPerDay: number;
  retention: number;
  strictReviewFirst: boolean;
  dailyGoalMin: number;
  ttsRate: number;
  skills: Record<Skill, boolean>;
}

export interface MinedCard {
  id: string;
  sentence: string;
  translation: string;
  target: string; // surface form in the sentence (the 1T target)
  lemma: string;
  gloss: string;
  notes: string[];
  sourceId: string;
  sourceTitle: string;
  sourceKind: "news" | "clip";
  createdAt: number;
  fsrs: Card;
  /** Added automatically because it was missed in a post-reading quiz. */
  fromQuiz?: boolean;
}

export interface QuizResult {
  contentId: string;
  ts: number;
  score: number;
  total: number;
  missed: string[]; // lemmas
}

export interface ReviewEntry {
  cardId: string;
  ts: number;
  rating: Rating;
  exercise: Exercise;
  prevState: State;
  scheduledDays: number;
  elapsedDays: number;
  correct: boolean | null;
}

export interface DayStats {
  reviews: number;
  newCards: number;
  mined: number;
  seconds: number;
}

export interface Data {
  version: 1;
  settings: Settings;
  cards: MinedCard[];
  known: string[];
  log: ReviewEntry[];
  days: Record<string, DayStats>;
  imported: Article[];
  quizzes: QuizResult[];
  /** Best Type It! scores, keyed by `${setId}:${mode}`. */
  bestScores: Record<string, number>;
}

export const DEFAULT_SETTINGS: Settings = {
  onboarded: false,
  placement: 0,
  newPerDay: 20,
  retention: 0.9,
  strictReviewFirst: true,
  dailyGoalMin: 20,
  ttsRate: 0.9,
  skills: { reading: true, writing: true, listening: true, speaking: true },
};

const KEY = "learn-korean:v1";

const empty = (): Data => ({
  version: 1,
  settings: { ...DEFAULT_SETTINGS },
  cards: [],
  known: [],
  log: [],
  days: {},
  imported: [],
  quizzes: [],
  bestScores: {},
});

let data: Data = empty();
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Data;
      data = { ...empty(), ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } };
    }
  } catch {
    // corrupted or blocked storage: start fresh in memory
  }
}

function commit(next: Data) {
  data = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage full or unavailable; state still lives in memory this session
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  return () => listeners.delete(l);
}

const serverSnapshot = empty();

export function useData(): Data {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return data;
    },
    () => serverSnapshot,
  );
}

/** True once the client has read localStorage (avoids hydration flashes). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function getData(): Data {
  load();
  return data;
}

// ---------- dates ----------

export function dayKey(ts = Date.now()): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function bumpDay(d: Data, patch: Partial<DayStats>): Record<string, DayStats> {
  const k = dayKey();
  const cur = d.days[k] ?? { reviews: 0, newCards: 0, mined: 0, seconds: 0 };
  return {
    ...d.days,
    [k]: {
      reviews: cur.reviews + (patch.reviews ?? 0),
      newCards: cur.newCards + (patch.newCards ?? 0),
      mined: cur.mined + (patch.mined ?? 0),
      seconds: cur.seconds + (patch.seconds ?? 0),
    },
  };
}

export function today(d: Data): DayStats {
  return d.days[dayKey()] ?? { reviews: 0, newCards: 0, mined: 0, seconds: 0 };
}

export function streak(d: Data): number {
  const active = (k: string) => {
    const s = d.days[k];
    return !!s && (s.reviews > 0 || s.seconds >= 120);
  };
  let n = 0;
  const cur = new Date();
  if (!active(dayKey(cur.getTime()))) cur.setDate(cur.getDate() - 1); // today not done yet
  while (active(dayKey(cur.getTime()))) {
    n++;
    cur.setDate(cur.getDate() - 1);
  }
  return n;
}

// ---------- vocabulary knowledge ----------

export type WordStatus = "known" | "learning" | "new";

export function wordStatus(d: Data, lemma: string): WordStatus {
  if (d.known.includes(lemma)) return "known";
  const card = d.cards.find((c) => c.lemma === lemma);
  if (card) return card.fsrs.state === State.Review && card.fsrs.stability >= 21 ? "known" : "learning";
  const e = lookupLemma(lemma);
  if (e && (e.pos === "prop" || e.level <= d.settings.placement)) return "known";
  return "new";
}

export interface Coverage {
  total: number;
  known: number;
  pct: number;
  unknownLemmas: string[];
}

export function coverage(d: Data, content: Content): Coverage {
  let total = 0;
  let known = 0;
  const unknown = new Set<string>();
  for (const s of content.sentences)
    for (const t of tokenize(s.ko)) {
      if (t.gloss.kind === "latin" || t.gloss.kind === "number") continue;
      total++;
      if (wordStatus(d, t.gloss.lemma) === "known") known++;
      else unknown.add(t.gloss.lemma);
    }
  return { total, known, pct: total ? known / total : 1, unknownLemmas: [...unknown] };
}

export function coverageLabel(pct: number): { label: string; tone: "easy" | "sweet" | "stretch" | "hard" } {
  if (pct >= 0.98) return { label: "Easy read", tone: "easy" };
  if (pct >= 0.95) return { label: "Sweet spot (i+1)", tone: "sweet" };
  if (pct >= 0.85) return { label: "Stretch", tone: "stretch" };
  return { label: "Challenging", tone: "hard" };
}

// ---------- SRS queue ----------

export function scheduler(d: Data) {
  return new FSRS({ requestRetention: d.settings.retention });
}

export function dueCards(d: Data, now = Date.now()): MinedCard[] {
  return d.cards
    .filter((c) => c.fsrs.state !== State.New && c.fsrs.due <= now)
    .sort((a, b) => a.fsrs.due - b.fsrs.due);
}

/** Overdue review-state cards — these block mining when strict mode is on. */
export function blockingDue(d: Data, now = Date.now()): number {
  return d.cards.filter(
    (c) => (c.fsrs.state === State.Review || c.fsrs.state === State.Relearning) && c.fsrs.due <= now,
  ).length;
}

export function newQueue(d: Data): MinedCard[] {
  const left = Math.max(0, d.settings.newPerDay - today(d).newCards);
  return d.cards
    .filter((c) => c.fsrs.state === State.New)
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(0, left);
}

export function pickExercise(d: Data, card: MinedCard, focus?: Skill): Exercise {
  if (focus) return SKILL_EXERCISE[focus];
  const skills = (Object.keys(d.settings.skills) as Skill[]).filter((s) => d.settings.skills[s]);
  const list = skills.length ? skills : (["writing"] as Skill[]);
  let h = 0;
  for (const ch of card.id) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return SKILL_EXERCISE[list[Math.abs(h + card.fsrs.reps) % list.length]];
}

// ---------- actions ----------

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const actions = {
  updateSettings(patch: Partial<Settings>) {
    const d = getData();
    commit({ ...d, settings: { ...d.settings, ...patch } });
  },

  mine(input: Omit<MinedCard, "id" | "createdAt" | "fsrs">): MinedCard {
    const d = getData();
    const card: MinedCard = { ...input, id: uid(), createdAt: Date.now(), fsrs: newCard() };
    commit({
      ...d,
      cards: [...d.cards, card],
      known: d.known.filter((k) => k !== input.lemma),
      days: bumpDay(d, { mined: 1 }),
    });
    return card;
  },

  review(cardId: string, rating: Rating, exercise: Exercise, correct: boolean | null) {
    const d = getData();
    const card = d.cards.find((c) => c.id === cardId);
    if (!card) return;
    const { card: next, log } = scheduler(d).next(card.fsrs, rating);
    const entry: ReviewEntry = {
      cardId,
      ts: log.review,
      rating,
      exercise,
      prevState: log.state,
      scheduledDays: next.scheduledDays,
      elapsedDays: log.elapsedDays,
      correct,
    };
    commit({
      ...d,
      cards: d.cards.map((c) => (c.id === cardId ? { ...c, fsrs: next } : c)),
      log: [...d.log, entry].slice(-5000),
      days: bumpDay(d, { reviews: 1, newCards: log.state === State.New ? 1 : 0 }),
    });
  },

  setKnown(lemma: string, known: boolean) {
    const d = getData();
    const set = new Set(d.known);
    if (known) set.add(lemma);
    else set.delete(lemma);
    commit({ ...d, known: [...set] });
  },

  deleteCard(id: string) {
    const d = getData();
    commit({ ...d, cards: d.cards.filter((c) => c.id !== id) });
  },

  addSeconds(s: number) {
    const d = getData();
    commit({ ...d, days: bumpDay(d, { seconds: s }) });
  },

  importArticle(title: string, sentences: { ko: string; en: string }[]): Article {
    const d = getData();
    const a: Article = {
      id: `user-${uid()}`,
      kind: "news",
      title,
      titleEn: "Your article",
      topic: "World",
      level: "B1",
      date: dayKey(),
      emoji: "📰",
      sentences,
      imported: true,
    };
    commit({ ...d, imported: [a, ...d.imported] });
    return a;
  },

  /**
   * Add words missed in a quiz to the review deck. Not subject to the
   * review-first lock (the learner didn't choose to mine these), and words
   * already in the deck are left alone.
   */
  addMissedWords(items: Omit<MinedCard, "id" | "createdAt" | "fsrs" | "fromQuiz">[]): number {
    const d = getData();
    const have = new Set(d.cards.map((c) => c.lemma));
    const fresh: MinedCard[] = [];
    for (const it of items) {
      if (have.has(it.lemma)) continue;
      have.add(it.lemma);
      fresh.push({ ...it, id: uid(), createdAt: Date.now(), fsrs: newCard(), fromQuiz: true });
    }
    const lemmas = new Set(items.map((i) => i.lemma));
    commit({ ...d, cards: [...d.cards, ...fresh], known: d.known.filter((k) => !lemmas.has(k)) });
    return fresh.length;
  },

  /** Saves a game score; returns true if it's a new best. */
  recordScore(key: string, score: number): boolean {
    const d = getData();
    if (score <= (d.bestScores[key] ?? 0)) return false;
    commit({ ...d, bestScores: { ...d.bestScores, [key]: score } });
    return true;
  },

  recordQuiz(r: QuizResult) {
    const d = getData();
    commit({ ...d, quizzes: [...d.quizzes, r].slice(-500) });
  },

  deleteImported(id: string) {
    const d = getData();
    commit({ ...d, imported: d.imported.filter((a) => a.id !== id) });
  },

  replaceAll(next: Data) {
    commit({ ...empty(), ...next, settings: { ...DEFAULT_SETTINGS, ...next.settings } });
  },

  reset() {
    commit(empty());
  },
};

export function findContent(d: Data, id: string): Content | undefined {
  return ARTICLES.find((a) => a.id === id) ?? CLIPS.find((c) => c.id === id) ?? d.imported.find((a) => a.id === id);
}
