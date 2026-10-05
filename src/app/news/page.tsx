"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ClipboardPaste, Trash2 } from "lucide-react";
import { ARTICLES } from "@/content/articles";
import type { Cefr, Topic } from "@/content/types";
import CoverageBadge from "@/components/CoverageBadge";
import TopicIcon from "@/components/TopicIcon";
import { actions, coverage, useData, useHydrated } from "@/lib/store";

const TOPICS: (Topic | "All" | "DLPT prep")[] = ["All", "DLPT prep", "Security", "Politics", "Economy", "Society", "Tech", "World", "Life", "Culture"];
const LEVELS: (Cefr | "All")[] = ["All", "A1", "A2", "B1", "B2"];

function Chips<T extends string>({ items, value, onChange }: { items: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto px-5">
      {items.map((it) => (
        <button key={it} onClick={() => onChange(it)} aria-pressed={value === it} className="chip">
          {it}
        </button>
      ))}
    </div>
  );
}

function NewsFeed() {
  const d = useData();
  const hydrated = useHydrated();
  const [topic, setTopic] = useState<Topic | "All" | "DLPT prep">(
    useSearchParams().get("track") === "dlpt" ? "DLPT prep" : "All",
  );
  const [level, setLevel] = useState<Cefr | "All">("All");
  if (!hydrated) return null;

  const list = [...d.imported, ...ARTICLES]
    .filter(
      (a) =>
        (topic === "All" || (topic === "DLPT prep" ? a.track === "dlpt" : a.topic === topic) || a.imported) &&
        (level === "All" || a.level === level || a.imported),
    )
    .map((a) => ({ a, cov: coverage(d, a) }));

  return (
    <div className="pt-safe">
      <header className="flex items-start justify-between px-5 pt-6 pb-7">
        <h1 className="display text-[2.6rem]">
          News
          <span className="muted block">뉴스</span>
        </h1>
        <Link
          href="/news/import/"
          aria-label="Paste an article"
          className="mt-1 flex size-12 items-center justify-center rounded-full bg-sky-soft text-sky"
        >
          <ClipboardPaste size={20} strokeWidth={1.75} />
        </Link>
      </header>

      <div className="sheet min-h-[75dvh] px-5 pt-6">
        <p className="sub text-[15px]">Pick stories around 95–98% known — enough context to learn the rest.</p>
        <div className="mt-4 space-y-1">
          <Chips items={TOPICS} value={topic} onChange={setTopic} />
          <Chips items={LEVELS} value={level} onChange={setLevel} />
        </div>

        <ul className="mt-5 space-y-3 pb-6">
          {list.map(({ a, cov }) => {
            const q = [...d.quizzes].reverse().find((x) => x.contentId === a.id);
            return (
              <li key={a.id} className="card relative">
                <Link href={`/reader/?id=${a.id}`} className="flex gap-4 p-4">
                  <TopicIcon topic={a.topic} imported={a.imported} />
                  <div className="min-w-0 flex-1">
                    <p className="label">
                      {a.imported ? "Your article" : a.topic} · {a.level} · {a.date}
                    </p>
                    <p className="ko mt-0.5 text-[17px] leading-snug font-semibold">{a.title}</p>
                    <p className="muted text-[15px]">{a.titleEn}</p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <CoverageBadge pct={cov.pct} />
                      <span className="pill pill-outline">{cov.unknownLemmas.length} new words</span>
                      {q && (
                        <span className="pill pill-soft">
                          Quiz {q.score}/{q.total}
                        </span>
                      )}
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
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default function News() {
  return (
    <Suspense>
      <NewsFeed />
    </Suspense>
  );
}
