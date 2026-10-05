/**
 * Online fallback for words missing from the built-in dictionary
 * (e.g. in articles you paste in). Wiktionary's REST API allows CORS.
 */
export interface OnlineGloss {
  word: string;
  pos: string;
  definitions: string[];
}

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function fetchWord(word: string): Promise<OnlineGloss | null> {
  const res = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`);
  if (!res.ok) return null;
  const json = (await res.json()) as Record<string, { partOfSpeech: string; definitions: { definition: string }[] }[]>;
  const ko = json.ko?.[0];
  if (!ko) return null;
  const definitions = ko.definitions.map((d) => stripHtml(d.definition)).filter(Boolean).slice(0, 3);
  return definitions.length ? { word, pos: ko.partOfSpeech, definitions } : null;
}

/** Try the surface form, then progressively shorter stems (drops particles/endings). */
export async function lookupOnline(surface: string): Promise<OnlineGloss | null> {
  const chars = Array.from(surface);
  const candidates = [surface];
  for (let cut = 1; cut <= Math.min(3, chars.length - 1); cut++) {
    const stem = chars.slice(0, -cut).join("");
    candidates.push(stem, stem + "다");
  }
  for (const c of candidates) {
    try {
      const g = await fetchWord(c);
      if (g) return g;
    } catch {
      return null; // offline
    }
  }
  return null;
}

export const naverUrl = (q: string) => `https://korean.dict.naver.com/koendict/#/search?query=${encodeURIComponent(q)}`;
