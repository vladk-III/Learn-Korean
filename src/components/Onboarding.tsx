"use client";

import { useState } from "react";
import { actions } from "@/lib/store";

const LEVELS = [
  { v: 0, label: "Brand new", desc: "I can read Hangul but know few words" },
  { v: 1, label: "Beginner (A1)", desc: "Greetings, basic nouns and verbs" },
  { v: 2, label: "Elementary (A2)", desc: "Simple daily conversations" },
  { v: 3, label: "Intermediate (B1)", desc: "Can follow easy news" },
];

export default function Onboarding() {
  const [level, setLevel] = useState(1);
  const [perDay, setPerDay] = useState(20);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="card animate-sheet pb-safe max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-b-none p-6 sm:rounded-b-2xl">
        <p className="text-4xl">🇰🇷</p>
        <h1 className="mt-2 text-2xl font-extrabold">환영합니다! Welcome</h1>
        <p className="muted mt-1 text-sm">
          Learn Korean from real-style news and short clips. Tap any word for its meaning, save the sentence, then
          practise it with spaced repetition — reading, writing, listening and speaking.
        </p>

        <h2 className="mt-5 text-sm font-bold tracking-wide uppercase">Your level</h2>
        <div className="mt-2 grid gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.v}
              onClick={() => setLevel(l.v)}
              className={`rounded-xl border-2 p-3 text-left ${
                level === l.v ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "hairline"
              }`}
            >
              <div className="font-semibold">{l.label}</div>
              <div className="muted text-xs">{l.desc}</div>
            </button>
          ))}
        </div>

        <h2 className="mt-5 text-sm font-bold tracking-wide uppercase">New cards per day: {perDay}</h2>
        <input
          type="range"
          min={15}
          max={25}
          value={perDay}
          onChange={(e) => setPerDay(Number(e.target.value))}
          className="mt-2 w-full accent-indigo-500"
        />
        <p className="muted text-xs">15–25 keeps reviews sustainable (≈15–25 minutes a day).</p>

        <div className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          <b>House rule:</b> clear your due reviews before mining new sentences. It keeps review debt from piling up.
        </div>

        <button
          onClick={() => actions.updateSettings({ onboarded: true, placement: level, newPerDay: perDay })}
          className="bg-brand-500 mt-6 w-full rounded-2xl py-4 text-lg font-bold text-white shadow-[0_4px_0_var(--color-brand-700)] active:translate-y-1 active:shadow-none"
        >
          시작하기 · Start
        </button>
      </div>
    </div>
  );
}
