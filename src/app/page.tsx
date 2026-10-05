"use client";

import Link from "next/link";
import { BookOpen, Clapperboard, Flame, Layers, Lock } from "lucide-react";
import { ARTICLES } from "@/content/articles";
import { CLIPS } from "@/content/clips";
import CoverageBadge from "@/components/CoverageBadge";
import { blockingDue, coverage, dueCards, newQueue, streak, today, useData, useHydrated } from "@/lib/store";

function Ring({ value, label }: { value: number; label: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-24">
      <svg viewBox="0 0 80 80" className="size-24 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="8" className="stroke-gray-200 dark:stroke-white/10" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, value))}
          className="stroke-brand-500 transition-all"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-extrabold">{label}</span>
        <span className="muted text-[10px] font-semibold uppercase">minutes</span>
      </div>
    </div>
  );
}

export default function Today() {
  const d = useData();
  const hydrated = useHydrated();
  if (!hydrated) return null;

  const t = today(d);
  const due = dueCards(d).length;
  const fresh = newQueue(d).length;
  const blocked = blockingDue(d);
  const minutes = Math.floor(t.seconds / 60);
  const s = streak(d);
  const reviewsDone = due + fresh === 0;

  // Recommend the unread-ish article closest to the 95–98% sweet spot.
  const ranked = ARTICLES.map((a) => ({ a, cov: coverage(d, a) }))
    .map((x) => ({ ...x, score: Math.abs(x.cov.pct - 0.965) }))
    .sort((x, y) => x.score - y.score);
  const pick = ranked[0];
  const clip = CLIPS[new Date().getDate() % CLIPS.length];

  return (
    <div className="pt-safe px-4">
      <header className="flex items-center justify-between pt-5">
        <div>
          <p className="muted text-sm font-semibold">오늘도 화이팅!</p>
          <h1 className="text-2xl font-extrabold">Today</h1>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1.5 font-extrabold text-orange-600 dark:bg-orange-500/15">
          <Flame size={18} fill="currentColor" /> {s}
        </div>
      </header>

      <section className="card mt-4 flex items-center gap-4 p-4">
        <Ring value={minutes / d.settings.dailyGoalMin} label={`${minutes}/${d.settings.dailyGoalMin}`} />
        <div className="text-sm">
          <p className="font-bold">Daily goal</p>
          <p className="muted">
            Short, daily sessions win. {t.reviews} reviews · {t.mined} sentences mined today.
          </p>
        </div>
      </section>

      <h2 className="mt-6 mb-2 text-sm font-bold tracking-wide uppercase">Your plan</h2>
      <ol className="space-y-3">
        <li>
          <Link href="/review/" className="card flex items-center gap-4 p-4">
            <span className={`rounded-2xl p-3 text-white ${reviewsDone ? "bg-emerald-500" : "bg-rose-500"}`}>
              <Layers />
            </span>
            <div className="flex-1">
              <p className="font-bold">1. Clear reviews</p>
              <p className="muted text-sm">
                {reviewsDone ? "All done — nice! 🎉" : `${due} due · ${fresh} new waiting`}
              </p>
            </div>
            {!reviewsDone && <span className="bg-brand-500 rounded-full px-3 py-1 text-sm font-bold text-white">Start</span>}
          </Link>
        </li>
        <li>
          <Link href={`/reader/?id=${pick.a.id}`} className="card flex items-center gap-4 p-4">
            <span className="rounded-2xl bg-sky-500 p-3 text-white">
              {blocked > 0 ? <Lock /> : <BookOpen />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold">2. Read: {pick.a.title}</p>
              <p className="muted truncate text-sm">{pick.a.titleEn}</p>
              <div className="mt-1">
                <CoverageBadge pct={pick.cov.pct} />
              </div>
            </div>
          </Link>
        </li>
        <li>
          <Link href={`/clips/?id=${clip.id}`} className="card flex items-center gap-4 p-4">
            <span className="rounded-2xl bg-fuchsia-500 p-3 text-white">
              <Clapperboard />
            </span>
            <div className="flex-1">
              <p className="font-bold">3. Watch &amp; shadow a clip</p>
              <p className="muted text-sm">
                {clip.emoji} {clip.title} · {clip.titleEn}
              </p>
            </div>
          </Link>
        </li>
      </ol>

      {blocked > 0 && (
        <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-200">
          Mining is locked until you clear {blocked} overdue review{blocked > 1 ? "s" : ""}. Reading and listening
          are always open.
        </p>
      )}

      <section className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="card p-3">
          <p className="text-2xl font-extrabold">{d.cards.length}</p>
          <p className="muted text-xs">cards</p>
        </div>
        <div className="card p-3">
          <p className="text-2xl font-extrabold">{d.known.length}</p>
          <p className="muted text-xs">marked known</p>
        </div>
        <div className="card p-3">
          <p className="text-2xl font-extrabold">{Math.round(d.settings.retention * 100)}%</p>
          <p className="muted text-xs">target recall</p>
        </div>
      </section>
    </div>
  );
}
