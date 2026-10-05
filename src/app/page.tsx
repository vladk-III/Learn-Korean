"use client";

import Link from "next/link";
import { AlarmClock, BookOpen, ChevronRight, Clapperboard, Flame, Layers, Lock, Plus, SquareStack } from "lucide-react";
import { ARTICLES } from "@/content/articles";
import { CLIPS } from "@/content/clips";
import CoverageBadge from "@/components/CoverageBadge";
import Arc from "@/components/Arc";
import { activeToday, blockingDue, coverage, dueCards, newQueue, streak, today, useData, useHydrated } from "@/lib/store";

function greeting(): [string, string] {
  const h = new Date().getHours();
  if (h < 5) return ["Late", "night"];
  if (h < 12) return ["Good", "morning"];
  if (h < 18) return ["Good", "afternoon"];
  return ["Good", "evening"];
}

function Row({
  href,
  icon: Icon,
  title,
  status,
  extra,
}: {
  href: string;
  icon: typeof Layers;
  title: string;
  status: string;
  extra?: React.ReactNode;
}) {
  return (
    <li>
      <Link href={href} className="card flex items-center gap-4 px-4 py-4">
        <span className="icon-circle size-12">
          <Icon size={20} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="ko truncate leading-snug font-semibold">{title}</p>
          <p className="muted truncate text-[15px]">{status}</p>
          {extra && <div className="mt-1.5">{extra}</div>}
        </div>
        <ChevronRight size={18} className="muted shrink-0" />
      </Link>
    </li>
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
  const goal = d.settings.dailyGoalMin;
  const s = streak(d);
  const doneToday = activeToday(d);
  const reviewsDone = due + fresh === 0;
  const evening = new Date().getHours() >= 18;
  const [g1, g2] = greeting();

  // Recommend the article closest to the 95–98% comprehension sweet spot.
  const pick = ARTICLES.map((a) => ({ a, cov: coverage(d, a) })).sort(
    (x, y) => Math.abs(x.cov.pct - 0.965) - Math.abs(y.cov.pct - 0.965),
  )[0];
  const clip = CLIPS[new Date().getDate() % CLIPS.length];

  const status = doneToday ? "Streak safe" : evening && s > 0 ? "Streak at risk" : "In progress";

  return (
    <div className="pt-safe">
      <header className="flex items-start justify-between px-5 pt-6 pb-7">
        <h1 className="display text-[2.6rem]">
          {g1}
          <span className="muted block">{g2}</span>
        </h1>
        <div className="mt-1 flex items-center gap-2.5">
          <Link href="/me/#reminders" aria-label="Streak reminders" className="flex size-12 items-center justify-center rounded-full bg-sheet">
            <AlarmClock size={21} strokeWidth={1.75} />
          </Link>
          <Link
            href="/me/"
            aria-label={`${s} day streak`}
            className="relative flex size-12 items-center justify-center rounded-full bg-ink text-on-ink"
          >
            <Flame size={20} strokeWidth={1.75} />
            {s > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 rounded-full border-2 border-canvas bg-accent px-1 text-center text-[10px] leading-4 font-semibold text-white">
                {s}
              </span>
            )}
          </Link>
        </div>
      </header>

      <div className="sheet min-h-[70dvh] px-5 pt-7">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Today&apos;s session</h2>
            <span className={`pill mt-2 ${doneToday ? "pill-soft" : ""}`}>{status}</span>
          </div>
          <Link href="/news/" aria-label="Find something to read" className="icon-circle size-12">
            <Plus size={22} strokeWidth={1.75} />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="tile flex min-h-40 flex-col justify-between p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="leading-tight font-medium">
                Minutes
                <br />
                today
              </p>
              <Arc value={minutes / goal} />
            </div>
            <p className="num-thin text-[2.6rem] leading-none">
              {minutes}
              <span className="muted text-2xl">/{goal}</span>
            </p>
          </div>
          <Link href="/review/" className="tile flex min-h-40 flex-col justify-between p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="leading-tight font-medium">
                Cards
                <br />
                waiting
              </p>
              <Arc value={reviewsDone ? 1 : t.reviews / Math.max(1, t.reviews + due + fresh)} />
            </div>
            <p className="num-thin text-[2.6rem] leading-none">{due + fresh}</p>
          </Link>
        </div>

        {!doneToday && evening && s > 0 && (
          <Link href="/review/" className="mt-3 flex items-center gap-3 rounded-[1.4rem] bg-accent-soft p-4">
            <Flame size={20} className="text-accent" />
            <p className="flex-1 text-sm">
              <b>Your {s}-day streak ends at midnight.</b> A few minutes of reviews will keep it.
            </p>
            <ChevronRight size={18} className="text-accent" />
          </Link>
        )}

        <div className="mt-9 flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Your plan</h2>
          <Link href="/study/" className="muted text-[15px]">
            Practice
          </Link>
        </div>

        <ul className="mt-4 space-y-3 pb-6">
          <Row
            href="/review/"
            icon={Layers}
            title="Clear reviews"
            status={reviewsDone ? "All clear" : `${due} due · ${fresh} new`}
          />
          <Row
            href={`/reader/?id=${pick.a.id}`}
            icon={blocked > 0 ? Lock : BookOpen}
            title={pick.a.title}
            status={blocked > 0 ? "Reading only — clear reviews to save words" : pick.a.titleEn}
            extra={<CoverageBadge pct={pick.cov.pct} />}
          />
          <Row href={`/clips/?id=${clip.id}`} icon={Clapperboard} title={clip.title} status={`Clip · ${clip.titleEn}`} />
          <Row href="/study/" icon={SquareStack} title="Flashcards & Type It!" status="Practice games" />
        </ul>
      </div>
    </div>
  );
}
