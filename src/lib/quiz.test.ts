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
    const subway = ARTICLES.find((a) => a.id === "a2-subway-fare")!;
    const q = buildQuiz(subway, { tapped: ["요금"], seed: 3 });
    expect(q[0].kind).toBe("meaning");
    expect(q[0].kind === "meaning" && q[0].lemma).toBe("요금");
  });

  it("cloze answer fits the blank", () => {
    const snow = ARTICLES.find((a) => a.id === "a1-first-snow")!;
    const q = buildQuiz(snow, { seed: 5 }).find((x) => x.kind === "cloze");
    expect(q).toBeDefined();
    if (q?.kind === "cloze") {
      expect(q.before + q.options[q.answer] + q.after).toBe(snow.sentences[q.sentenceIdx].ko);
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

describe("exam sets", async () => {
  const { studySets } = await import("./study");
  it("builds DLPT and OPI vocabulary sets", () => {
    const empty = { cards: [], imported: [] } as unknown as Parameters<typeof studySets>[0];
    const sets = studySets(empty);
    const dlpt = sets.find((s) => s.id === "dlpt-core")!;
    const opi = sets.find((s) => s.id === "opi-core")!;
    expect(dlpt.items.length).toBeGreaterThan(100);
    expect(opi.items.length).toBeGreaterThan(30);
    expect(dlpt.items.map((i) => i.ko)).toContain("훈련");
  });
});

describe("quizlet DLPT sets", async () => {
  const { studySets } = await import("./study");
  it("turns the uploaded cards into study sets with story context", () => {
    const empty = { cards: [], imported: [] } as unknown as Parameters<typeof studySets>[0];
    const sets = studySets(empty).filter((s) => s.id.startsWith("quizlet-dlpt"));
    expect(sets).toHaveLength(9);
    const all = sets.flatMap((s) => s.items);
    expect(all.length).toBeGreaterThan(890);
    const arrest = all.find((i) => i.ko === "검거하다")!;
    expect(arrest.sentence).toContain(arrest.target!);
    const nurse = all.find((i) => i.ko === "간호사")!;
    expect(nurse.alt).toContain("간호하다");
    expect(all.filter((i) => i.sentence).length).toBeGreaterThan(100);
  });
});
