"use client";

import Link from "next/link";
import { useState } from "react";
import { ClipboardPaste, Trash2 } from "lucide-react";
import { ARTICLES } from "@/content/articles";
import type { Cefr, Topic } from "@/content/types";
import CoverageBadge from "@/components/CoverageBadge";
import { actions, coverage, useData, useHydrated } from "@/lib/store";

const TOPICS: (Topic | "All")[] = ["All", "Life", "Society", "Culture", "Tech", "World"];
const LEVELS: (Cefr | "All")[] = ["All", "A1", "A2", "B1", "B2"];

function Chips<T extends string>({ items, value, onChange }: { items: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
      {items.map((it) => (
        <button
          key={it}
          onClick={() => onChange(it)}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ${
            value === it ? "bg-brand-500 text-white" : "card"
          }`}
        >
          {it}
        </button>
      ))}
    </div>
  );
}

export default function News() {
  const d = useData();
  const hydrated = useHydrated();
  const [topic, setTopic] = useState<Topic | "All">("All");
  const [level, setLevel] = useState<Cefr | "All">("All");
  if (!hydrated) return null;

  const list = [...d.imported, ...ARTICLES]
    .filter((a) => (topic === "All" || a.topic === topic || a.imported) && (level === "All" || a.level === level || a.imported))
    .map((a) => ({ a, cov: coverage(d, a) }));

  return (
    <div className="pt-safe px-4">
      <header className="flex items-end justify-between pt-5">
        <div>
          <h1 className="text-2xl font-extrabold">뉴스 News</h1>
          <p className="muted text-sm">Aim for 95–98% known — that's comprehensible input.</p>
        </div>
        <Link href="/news/import/" className="card flex items-center gap-1 px-3 py-2 text-sm font-semibold">
          <ClipboardPaste size={16} /> Paste
        </Link>
      </header>

      <div className="mt-4 space-y-2">
        <Chips items={TOPICS} value={topic} onChange={setTopic} />
        <Chips items={LEVELS} value={level} onChange={setLevel} />
      </div>

      <ul className="mt-4 space-y-3">
        {list.map(({ a, cov }) => (
          <li key={a.id} className="card relative">
            <Link href={`/reader/?id=${a.id}`} className="flex gap-3 p-4">
              <span className="text-4xl leading-none">{a.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="muted flex gap-2 text-xs font-semibold">
                  <span>{a.imported ? "Your article" : a.topic}</span>·<span>{a.level}</span>·<span>{a.date}</span>
                </div>
                <p className="mt-0.5 text-lg leading-snug font-bold">{a.title}</p>
                <p className="muted text-sm">{a.titleEn}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <CoverageBadge pct={cov.pct} />
                  <span className="muted text-xs">{cov.unknownLemmas.length} new words</span>
                  {(() => {
                    const q = [...d.quizzes].reverse().find((x) => x.contentId === a.id);
                    return q ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                        ✓ quiz {q.score}/{q.total}
                      </span>
                    ) : null;
                  })()}
                </div>
              </div>
            </Link>
            {a.imported && (
              <button
                onClick={() => actions.deleteImported(a.id)}
                aria-label="Delete article"
                className="muted absolute top-3 right-3 p-1"
              >
                <Trash2 size={16} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
