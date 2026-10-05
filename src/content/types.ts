export type Cefr = "A1" | "A2" | "B1" | "B2" | "C1";
export type Topic = "Life" | "Society" | "Culture" | "Tech" | "World" | "Security" | "Politics" | "Economy";

/** Exam the content was written to prepare for. */
export type Track = "dlpt" | "opi";

export interface Sentence {
  ko: string;
  en: string;
  /** Speaker label for dialogue clips (changes TTS pitch). */
  speaker?: "A" | "B";
}

export interface Article {
  id: string;
  kind: "news";
  title: string;
  titleEn: string;
  topic: Topic;
  level: Cefr;
  date: string;
  emoji: string;
  sentences: Sentence[];
  track?: Track;
  /** True for articles the user pasted in. */
  imported?: boolean;
}

export interface Clip {
  id: string;
  kind: "clip";
  title: string;
  titleEn: string;
  topic: Topic;
  level: Cefr;
  emoji: string;
  sentences: Sentence[];
  track?: Track;
}

export type Content = Article | Clip;
