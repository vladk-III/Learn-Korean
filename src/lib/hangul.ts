/** Hangul syllable (de)composition and Revised Romanization. */

const BASE = 0xac00;
const LAST = 0xd7a3;
const N_MEDIAL = 21;
const N_FINAL = 28;

export const INITIALS = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ".split("");
export const MEDIALS = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ".split("");
export const FINALS = ["", ..."ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ".split("")];

export interface Jamo {
  initial: number;
  medial: number;
  final: number;
}

export function isSyllable(ch: string): boolean {
  const c = ch.charCodeAt(0);
  return c >= BASE && c <= LAST;
}

export function hasHangul(s: string): boolean {
  return /[가-힣]/.test(s);
}

export function decompose(ch: string): Jamo | null {
  if (!ch || !isSyllable(ch)) return null;
  const idx = ch.charCodeAt(0) - BASE;
  return {
    initial: Math.floor(idx / (N_MEDIAL * N_FINAL)),
    medial: Math.floor((idx % (N_MEDIAL * N_FINAL)) / N_FINAL),
    final: idx % N_FINAL,
  };
}

export function compose(j: Jamo): string {
  return String.fromCharCode(BASE + (j.initial * N_MEDIAL + j.medial) * N_FINAL + j.final);
}

/** Final consonant of the last syllable as a jamo string ("" when open). */
export function lastFinal(s: string): string {
  const j = decompose(s.slice(-1));
  return j ? FINALS[j.final] : "";
}

/** Replace the last syllable's final consonant (use "" to remove it). */
export function withFinal(s: string, finalJamo: string): string | null {
  const j = decompose(s.slice(-1));
  const f = FINALS.indexOf(finalJamo);
  if (!j || f < 0) return null;
  return s.slice(0, -1) + compose({ ...j, final: f });
}

/** Replace the last syllable's vowel. */
export function withMedial(s: string, medialJamo: string): string | null {
  const j = decompose(s.slice(-1));
  const m = MEDIALS.indexOf(medialJamo);
  if (!j || m < 0) return null;
  return s.slice(0, -1) + compose({ ...j, medial: m });
}

export function lastMedial(s: string): string {
  const j = decompose(s.slice(-1));
  return j ? MEDIALS[j.medial] : "";
}

/** Split into individual jamo — used for fuzzy pronunciation scoring. */
export function toJamo(s: string): string[] {
  const out: string[] = [];
  for (const ch of s) {
    const j = decompose(ch);
    if (!j) {
      out.push(ch);
      continue;
    }
    out.push(INITIALS[j.initial], MEDIALS[j.medial]);
    if (j.final) out.push(FINALS[j.final]);
  }
  return out;
}

// ---------- Revised Romanization (simplified, with liaison) ----------

const R_INITIAL = ["g", "kk", "n", "d", "tt", "r", "m", "b", "pp", "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h"];
const R_MEDIAL = ["a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i"];
const R_FINAL = ["", "k", "k", "k", "n", "n", "n", "t", "l", "k", "m", "l", "l", "l", "p", "l", "m", "p", "p", "t", "t", "ng", "t", "t", "k", "t", "p", "t"];
/** Romanization of a final consonant when it moves onto a following ㅇ. */
const R_LIAISON = ["", "g", "kk", "ks", "n", "nj", "n", "d", "r", "lg", "lm", "lb", "ls", "lt", "lp", "r", "m", "b", "ps", "s", "ss", "", "j", "ch", "k", "t", "p", ""];

export function romanize(text: string): string {
  const chars = Array.from(text);
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    const j = decompose(chars[i]);
    if (!j) {
      out += chars[i];
      continue;
    }
    const prev = decompose(chars[i - 1] ?? "");
    const next = decompose(chars[i + 1] ?? "");
    let ini = R_INITIAL[j.initial];
    if (j.initial === 5) ini = prev && prev.final ? (FINALS[prev.final] === "ㄹ" ? "l" : "n") : "r";
    if (j.initial === 11 && prev && prev.final && prev.final !== 21) ini = ""; // liaison handled on prev
    if (!prev && j.initial === 5) ini = "r";
    out += ini + R_MEDIAL[j.medial];
    if (j.final) {
      if (next && next.initial === 11 && j.final !== 21) out += R_LIAISON[j.final];
      else if (next && next.initial === 5 && FINALS[j.final] === "ㄹ") out += "l";
      else out += R_FINAL[j.final];
    }
  }
  return out;
}
