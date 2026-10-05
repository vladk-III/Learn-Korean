/**
 * Lightweight Korean morphological analyzer for tap-to-gloss.
 *
 * Korean attaches particles and verb endings to words (학교에서, 먹었어요),
 * so a plain dictionary lookup fails. We resolve a word (eojeol) by:
 *   1. exact match on a lemma or listed irregular form,
 *   2. stripping particles / the copula and resolving the remainder,
 *   3. stripping verb endings and undoing common contractions
 *      (했→하, 왔→오, 마셔→마시, 간→가 …) to find a "-다" lemma,
 *   4. falling back to noun + 하다/되다 for Sino-Korean verbs.
 * Only candidates that exist in the dictionary are accepted.
 */
import { DICTIONARY, type DictEntry } from "@/content/dictionary";
import { hasHangul, lastFinal, lastMedial, withFinal, withMedial } from "./hangul";

export interface Gloss {
  /** The bare word without punctuation. */
  surface: string;
  /** Dictionary lemma (e.g. 먹다) or the surface when unresolved. */
  lemma: string;
  entry?: DictEntry;
  /** Grammar notes for stripped particles / endings. */
  notes: string[];
  kind: "word" | "number" | "latin" | "unknown";
}

export interface Token {
  lead: string;
  core: string;
  trail: string;
  gloss: Gloss;
}

const byLemma = new Map<string, DictEntry>();
const byForm = new Map<string, DictEntry>();
for (const e of DICTIONARY) {
  byLemma.set(e.ko, e);
  for (const f of e.forms) byForm.set(f, e);
}

export function lookupLemma(lemma: string): DictEntry | undefined {
  return byLemma.get(lemma);
}

// Longest first so 에서 wins over 에, 이라고 over 라고, etc.
const PARTICLES: [string, string][] = (
  [
    ["께서는", "honorific subject + topic"],
    ["께서", "subject marker (honorific)"],
    ["에게서", "from (a person)"],
    ["한테서", "from (a person)"],
    ["이었습니다", "was (formal)"],
    ["였습니다", "was (formal)"],
    ["입니다", "is (formal copula)"],
    ["이었어요", "was (polite)"],
    ["였어요", "was (polite)"],
    ["이에요", "is (polite copula)"],
    ["예요", "is (polite copula)"],
    ["이라고", "quotation: (that it) is"],
    ["라고", "quotation: (that it) is"],
    ["이라는", "called; that is"],
    ["라는", "called; that is"],
    ["이었다", "was"],
    ["였다", "was"],
    ["이기", "being (copula + -기)"],
    ["이고", "is, and"],
    ["이며", "is, and"],
    ["이다", "is (plain copula)"],
    ["인", "that is (copula modifier)"],
    ["에서", "at / in / from (place of action)"],
    ["에게", "to (a person)"],
    ["한테", "to (a person)"],
    ["으로", "by / toward / as / with"],
    ["로", "by / toward / as / with"],
    ["까지", "until / up to / by"],
    ["부터", "from / starting"],
    ["처럼", "like; as"],
    ["로부터", "from (a source)"],
    ["으로부터", "from (a source)"],
    ["대로", "as; in accordance with"],
    ["보다", "than"],
    ["마다", "every"],
    ["이랑", "and / with"],
    ["랑", "and / with"],
    ["하고", "and / with"],
    ["이나", "or"],
    ["은", "topic marker"],
    ["는", "topic marker"],
    ["이", "subject marker"],
    ["가", "subject marker"],
    ["을", "object marker"],
    ["를", "object marker"],
    ["에", "at / to / in (time, place)"],
    ["의", "possessive ('s / of)"],
    ["도", "also; too; even"],
    ["만", "only"],
    ["와", "and / with"],
    ["과", "and / with"],
    ["들", "plural"],
  ] as [string, string][]
).sort((a, b) => b[0].length - a[0].length);

// Verb/adjective endings. "" lets contractions like 기다려 / 위해 resolve.
const ENDINGS: [string, string][] = (
  [
    ["었습니다", "past, formal"],
    ["었고", "did ~ and"],
    ["았고", "did ~ and"],
    ["였고", "did ~ and"],
    ["았습니다", "past, formal"],
    ["였습니다", "past, formal"],
    ["겠습니다", "will / probably (formal)"],
    ["습니다", "formal polite"],
    ["니다", "formal polite"],
    ["시겠어요", "would you ~? (honorific)"],
    ["었어요", "past, polite"],
    ["았어요", "past, polite"],
    ["였어요", "past, polite"],
    ["겠어요", "will / probably (polite)"],
    ["셨어요", "past, honorific"],
    ["으세요", "please ~ / honorific"],
    ["세요", "please ~ / honorific"],
    ["었다고", "past + quotation"],
    ["았다고", "past + quotation"],
    ["었다는", "past + quoted modifier"],
    ["았다는", "past + quoted modifier"],
    ["다는", "quoted modifier (that ~)"],
    ["다고", "quotation (says that ~)"],
    ["다며", "saying that ~"],
    ["는다", "plain present"],
    ["었다", "past, plain"],
    ["았다", "past, plain"],
    ["다", "plain form"],
    ["어요", "polite"],
    ["아요", "polite"],
    ["여요", "polite"],
    ["게요", "I will ~ (promise)"],
    ["래요", "do you want to ~? / I'll ~"],
    ["까요", "shall we? / I wonder"],
    ["네요", "(exclamation)"],
    ["지요", "right?"],
    ["죠", "right?"],
    ["요", "polite"],
    ["으면서", "while ~ing; as"],
    ["면서", "while ~ing; as"],
    ["으면", "if; when"],
    ["면", "if; when"],
    ["어서", "and so; because"],
    ["아서", "and so; because"],
    ["서", "and so; because"],
    ["어도", "even if"],
    ["아도", "even if"],
    ["도", "even if"],
    ["으니까", "because"],
    ["니까", "because"],
    ["는데", "and; but (background)"],
    ["은데", "and; but (background)"],
    ["지만", "but"],
    ["거나", "or"],
    ["기로", "decide to (-기로 하다)"],
    ["시기", "honorific + -기"],
    ["시고", "honorific + and"],
    ["시면", "honorific + if"],
    ["시는", "honorific modifier"],
    ["실", "honorific future modifier"],
    ["으며", "and; while"],
    ["며", "and; while"],
    ["었나요", "past question (soft)"],
    ["았나요", "past question (soft)"],
    ["나요", "question (soft)"],
    ["고도", "even after; and still"],
    ["으러", "in order to (go/come)"],
    ["러", "in order to (go/come)"],
    ["으라고", "quoted command (told to ~)"],
    ["라고", "quoted command (told to ~)"],
    ["었다가", "did ~ and then (switch)"],
    ["았다가", "did ~ and then (switch)"],
    ["다가", "while ~ing, then"],
    ["는지", "whether; if"],
    ["은지", "whether; if"],
    ["자", "as soon as; when"],
    ["으려는", "intending to (modifier)"],
    ["려는", "intending to (modifier)"],
    ["겠다고", "will (quoted intention)"],
    ["겠다는", "will (quoted modifier)"],
    ["겠다", "will (plain)"],
    ["었기", "past + -기 (었기 때문에 = because ~ed)"],
    ["았기", "past + -기 (았기 때문에 = because ~ed)"],
    ["였기", "past + -기"],
    ["으려고", "in order to"],
    ["려고", "in order to"],
    ["어야", "must (-어야 하다)"],
    ["아야", "must (-아야 하다)"],
    ["야", "must (-야 하다)"],
    ["었던", "past modifier"],
    ["던", "past modifier"],
    ["고", "and; (-고 있다) ~ing"],
    ["지", "(-지 않다 / -지 말다)"],
    ["기", "~ing (noun form)"],
    ["게", "~ly (adverb form)"],
    ["는", "present modifier (that ~)"],
    ["은", "modifier"],
    ["을", "future modifier"],
    ["어", "connective / casual"],
    ["아", "connective / casual"],
    ["", ""],
  ] as [string, string][]
).sort((a, b) => b[0].length - a[0].length);

const FINAL_NOTES: Record<string, string> = {
  ㄴ: "modifier / plain present (-ㄴ)",
  ㄹ: "future modifier (-ㄹ)",
  ㅂ: "formal (-ㅂ니다)",
  ㅆ: "past tense",
};

const UNCONTRACT: Record<string, string> = { ㅘ: "ㅗ", ㅝ: "ㅜ", ㅕ: "ㅣ", ㅙ: "ㅚ", ㅓ: "ㅡ", ㅏ: "ㅡ" };

/** Possible verb stems for a remainder after an ending was stripped. */
function stemVariants(s: string): { stem: string; note?: string }[] {
  if (!s) return [];
  const out: { stem: string; note?: string }[] = [{ stem: s }];
  const f = lastFinal(s);
  const bases = [{ stem: s, note: undefined as string | undefined }];
  if (FINAL_NOTES[f]) {
    const open = withFinal(s, "");
    if (open) {
      out.push({ stem: open, note: FINAL_NOTES[f] });
      bases.push({ stem: open, note: FINAL_NOTES[f] });
    }
  }
  for (const b of bases) {
    const last = b.stem.slice(-1);
    if (last === "해") out.push({ stem: b.stem.slice(0, -1) + "하", note: b.note });
    const m = lastMedial(b.stem);
    if (UNCONTRACT[m]) {
      const u = withMedial(b.stem, UNCONTRACT[m]);
      if (u) out.push({ stem: u, note: b.note });
    }
  }
  return out;
}

const cache = new Map<string, Gloss>();

function exact(word: string): DictEntry | undefined {
  return byForm.get(word) ?? byLemma.get(word);
}

function resolve(word: string, depth: number): { entry: DictEntry; notes: string[] } | null {
  const e = exact(word);
  if (e) return { entry: e, notes: [] };

  if (depth < 3) {
    for (const [p, note] of PARTICLES) {
      if (word.length > p.length && word.endsWith(p)) {
        const r = resolve(word.slice(0, -p.length), depth + 1);
        // Particles attach to nominals only (so 가는 resolves to 가다, not 가 + 는).
        // A nominal reading wins over a verb reading: 말을 is 말 + 을, not 말다.
        if (r && r.entry.pos !== "v" && r.entry.pos !== "a") {
          return { entry: r.entry, notes: [...r.notes, `-${p}: ${note}`] };
        }
      }
    }
  }
  return resolveVerb(word);
}

function resolveVerb(word: string): { entry: DictEntry; notes: string[] } | null {
  for (const [end, note] of ENDINGS) {
    if (end && !word.endsWith(end)) continue;
    const rest = end ? word.slice(0, -end.length) : word;
    for (const v of stemVariants(rest)) {
      const lemma = byLemma.get(v.stem + "다");
      if (lemma && (lemma.pos === "v" || lemma.pos === "a")) {
        const notes = [v.note, end ? `-${end}: ${note}` : undefined].filter(Boolean) as string[];
        return { entry: lemma, notes };
      }
      // Sino-Korean noun + 하다/되다 (e.g. 공부했다 when only 공부 is listed)
      for (const lv of ["하", "되"]) {
        if (v.stem.length > 1 && v.stem.endsWith(lv)) {
          const noun = byLemma.get(v.stem.slice(0, -1));
          if (noun && noun.pos === "n") {
            const notes = [`+${lv}다: verb made from the noun`, v.note, end ? `-${end}: ${note}` : undefined];
            return { entry: noun, notes: notes.filter(Boolean) as string[] };
          }
        }
      }
    }
  }
  return null;
}

const PUNCT_LEAD = /^[^\p{L}\p{N}]+/u;
const PUNCT_TRAIL = /[^\p{L}\p{N}]+$/u;

export function analyzeWord(surface: string): Gloss {
  const hit = cache.get(surface);
  if (hit) return hit;
  let g: Gloss;
  if (!hasHangul(surface)) {
    g = { surface, lemma: surface, notes: [], kind: /\d/.test(surface) ? "number" : "latin" };
  } else if (/\d/.test(surface)) {
    const rest = surface.replace(/^[\d.,]+/, "");
    const r = rest ? resolve(rest, 0) : null;
    g = { surface, lemma: surface, entry: r?.entry, notes: r?.notes ?? [], kind: "number" };
  } else {
    const r = resolve(surface, 0);
    g = r
      ? { surface, lemma: r.entry.ko, entry: r.entry, notes: r.notes, kind: "word" }
      : { surface, lemma: surface, notes: [], kind: "unknown" };
  }
  cache.set(surface, g);
  return g;
}

export function tokenize(sentence: string): Token[] {
  return sentence
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      const lead = raw.match(PUNCT_LEAD)?.[0] ?? "";
      const afterLead = raw.slice(lead.length);
      const trail = afterLead.match(PUNCT_TRAIL)?.[0] ?? "";
      const core = afterLead.slice(0, afterLead.length - trail.length);
      return { lead, core, trail, gloss: analyzeWord(core) };
    })
    .filter((t) => t.core.length > 0);
}

/** Split free text (e.g. a pasted article) into sentences. */
export function splitSentences(text: string): string[] {
  return text
    .replace(/\r/g, "")
    .split(/(?<=[.!?。？！])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => hasHangul(s));
}
