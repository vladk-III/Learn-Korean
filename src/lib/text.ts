import { toJamo } from "./hangul";

/** Strip whitespace and punctuation for answer comparison. */
export function normalize(s: string): string {
  return s.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
}

export function levenshtein<T>(a: T[], b: T[]): number {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

/** 0..1 similarity on the jamo level, so 1 wrong vowel isn't a whole wrong syllable. */
export function similarity(a: string, b: string): number {
  const x = toJamo(normalize(a));
  const y = toJamo(normalize(b));
  if (!x.length && !y.length) return 1;
  return 1 - levenshtein(x, y) / Math.max(x.length, y.length);
}

export type Verdict = "correct" | "close" | "wrong";

export function grade(answer: string, expected: string, alternatives: string[] = []): Verdict {
  const a = normalize(answer);
  if (!a) return "wrong";
  if ([expected, ...alternatives].some((e) => normalize(e) === a)) return "correct";
  const best = Math.max(...[expected, ...alternatives].map((e) => similarity(a, e)));
  return best >= 0.75 ? "close" : "wrong";
}

/**
 * Per-syllable diff of a spoken transcript against the target sentence,
 * used to colour the shadowing feedback.
 */
export function syllableDiff(target: string, heard: string): { ch: string; ok: boolean }[] {
  const t = Array.from(normalize(target));
  const h = Array.from(normalize(heard));
  // LCS alignment
  const dp = Array.from({ length: t.length + 1 }, () => new Array(h.length + 1).fill(0));
  for (let i = t.length - 1; i >= 0; i--)
    for (let j = h.length - 1; j >= 0; j--)
      dp[i][j] = t[i] === h[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ok = new Set<number>();
  let i = 0;
  let j = 0;
  while (i < t.length && j < h.length) {
    if (t[i] === h[j]) {
      ok.add(i);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return t.map((ch, k) => ({ ch, ok: ok.has(k) }));
}

export function shuffle<T>(arr: T[], seed = Date.now()): T[] {
  const a = [...arr];
  let s = seed % 2147483647 || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
