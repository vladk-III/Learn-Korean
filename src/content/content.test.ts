import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ARTICLES } from "./articles";
import { CLIPS } from "./clips";
import { tokenize } from "@/lib/analyzer";

const all = [...ARTICLES, ...CLIPS];

describe("bundled content", () => {
  it("has unique ids", () => {
    expect(new Set(all.map((c) => c.id)).size).toBe(all.length);
  });

  it("every word resolves to a dictionary entry (tap-to-gloss coverage)", () => {
    const missing: string[] = [];
    const rows: string[] = [];
    for (const c of all)
      for (const s of c.sentences)
        for (const t of tokenize(s.ko)) {
          if (t.gloss.kind === "latin") continue;
          if (!t.gloss.entry) missing.push(`${c.id}: ${t.core}`);
          rows.push(`${t.core}\t${t.gloss.entry?.ko ?? "??"}\t${t.gloss.notes.join("; ")}`);
        }
    // DUMP=path writes how every word was analysed, for reviewing glosses.
    if (process.env.DUMP) writeFileSync(process.env.DUMP, [...new Set(rows)].join("\n"));
    expect(missing).toEqual([]);
  });
});
