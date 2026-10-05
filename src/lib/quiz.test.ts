import { describe, expect, it } from "vitest";
import { ARTICLES } from "@/content/articles";
import { CLIPS } from "@/content/clips";
import { buildQuiz } from "./quiz";

describe("buildQuiz", () => {
  it("builds a full quiz with valid, distinct options for every bundled item", () => {
    for (const c of [...ARTICLES, ...CLIPS]) {
      for (const seed of [1, 42, 999]) {
        const q = buildQuiz(c, { seed });
        expect(q.length, c.id).toBe(c.kind === "clip" ? 4 : 5);
        for (const x of q) {
          expect(x.options).toHaveLength(4);
          expect(new Set(x.options).size).toBe(4);
          expect(x.answer).toBeGreaterThanOrEqual(0);
          if (x.miss) expect(c.sentences[x.miss.sentenceIdx].ko).toContain(x.miss.target);
        }
      }
    }
  });

  it("quizzes tapped words first", () => {
    const q = buildQuiz(ARTICLES[2], { tapped: ["요금"], seed: 3 });
    expect(q[0].kind).toBe("meaning");
    expect(q[0].kind === "meaning" && q[0].lemma).toBe("요금");
  });

  it("cloze answer fits the blank", () => {
    const q = buildQuiz(ARTICLES[0], { seed: 5 }).find((x) => x.kind === "cloze");
    expect(q).toBeDefined();
    if (q?.kind === "cloze") {
      expect(q.before + q.options[q.answer] + q.after).toBe(ARTICLES[0].sentences[q.sentenceIdx].ko);
    }
  });
});

describe("study sets", async () => {
  const { itemsFromContent } = await import("./study");
  it("builds vocab sets from every article and clip", () => {
    for (const c of [...ARTICLES, ...CLIPS]) {
      const items = itemsFromContent(c);
      expect(items.length, c.id).toBeGreaterThanOrEqual(4);
      for (const it of items) {
        expect(it.sentence).toContain(it.target);
        expect(new Set(items.map((x) => x.ko)).size).toBe(items.length);
      }
    }
  });
});
