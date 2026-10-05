import { describe, expect, it } from "vitest";
import { analyzeWord, splitSentences, tokenize } from "./analyzer";
import { romanize } from "./hangul";
import { grade, similarity } from "./text";

const lemma = (w: string) => analyzeWord(w).entry?.ko;

describe("analyzer", () => {
  it("strips particles", () => {
    expect(lemma("학교에서")).toBe("학교");
    expect(lemma("사람들은")).toBe("사람");
    expect(lemma("최근에는")).toBe("최근");
  });

  it("strips the copula", () => {
    expect(lemma("계획입니다")).toBe("계획");
    expect(lemma("요리예요")).toBe("요리");
  });

  it("undoes verb conjugations and contractions", () => {
    expect(lemma("먹었습니다")).toBe("먹다");
    expect(lemma("왔어요")).toBe("오다");
    expect(lemma("했습니다")).toBe("하다");
    expect(lemma("시켰어요")).toBe("시키다");
    expect(lemma("오릅니다")).toBe("오르다");
    expect(lemma("기다려")).toBe("기다리다");
    expect(lemma("가는")).toBe("가다");
  });

  it("uses listed irregular forms", () => {
    expect(lemma("추워요")).toBe("춥다");
    expect(lemma("몰라도")).toBe("모르다");
    expect(lemma("사는")).toBe("살다");
  });

  it("prefers a noun reading for noun + particle", () => {
    expect(lemma("길을")).toBe("길");
  });

  it("handles numbers and Latin", () => {
    expect(analyzeWord("2,000원이에요").kind).toBe("number");
    expect(analyzeWord("AI").kind).toBe("latin");
  });

  it("tokenizes with punctuation preserved", () => {
    const t = tokenize("안녕하세요, 오늘의 날씨입니다.");
    expect(t.map((x) => x.core)).toEqual(["안녕하세요", "오늘의", "날씨입니다"]);
    expect(t[0].trail).toBe(",");
  });

  it("splits pasted text into sentences", () => {
    expect(splitSentences("첫 문장입니다. 두 번째예요!\nThird line\n세 번째")).toEqual([
      "첫 문장입니다.",
      "두 번째예요!",
      "세 번째",
    ]);
  });
});

describe("romanize", () => {
  it("follows Revised Romanization with liaison", () => {
    expect(romanize("한국어")).toBe("hangugeo");
    expect(romanize("서울")).toBe("seoul");
    expect(romanize("몰라")).toBe("molla");
  });
});

describe("answer grading", () => {
  it("accepts exact answers ignoring spacing/punctuation", () => {
    expect(grade(" 요금이 ", "요금이")).toBe("correct");
  });
  it("flags near-misses as close", () => {
    expect(grade("요굼이", "요금이")).toBe("close");
    expect(grade("사과", "요금이")).toBe("wrong");
  });
  it("scores similarity on jamo", () => {
    expect(similarity("오늘 아침", "오늘아침")).toBe(1);
  });
});
