export type Cefr = "A1" | "A2" | "B1" | "B2" | "C1";
export type Topic = "Life" | "Society" | "Culture" | "Tech" | "World";

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
  /** Tailwind gradient classes for the vertical card background. */
  gradient: string;
  sentences: Sentence[];
}

export type Content = Article | Clip;
