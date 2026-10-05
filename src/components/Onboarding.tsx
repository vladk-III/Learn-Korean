"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { actions } from "@/lib/store";

const LEVELS = [
  { v: 0, label: "Brand new", desc: "I can read Hangul but know few words" },
  { v: 1, label: "Beginner", tag: "A1", desc: "Greetings, basic nouns and verbs" },
  { v: 2, label: "Elementary", tag: "A2", desc: "Simple daily conversations" },
  { v: 3, label: "Intermediate", tag: "B1", desc: "Can follow easy news" },
];

export default function Onboarding() {
  const [level, setLevel] = useState(1);
  const [perDay, setPerDay] = useState(20);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="sheet animate-sheet pb-safe max-h-[94dvh] w-full max-w-xl overflow-y-auto px-6 pt-7 pb-6 sm:rounded-b-[2rem]">
        <h1 className="display text-[2.6rem]">
          환영합니다
          <span className="muted block">Welcome</span>
        </h1>
        <p className="sub mt-3 text-[15px] leading-relaxed">
          Learn Korean from news and short clips. Tap any word for its meaning, save the sentence, then practise it
          with spaced repetition.
        </p>

        <p className="label mt-7">Your level</p>
        <div className="mt-2 grid gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.v}
              onClick={() => setLevel(l.v)}
              className={`flex items-center gap-3 rounded-2xl p-4 text-left transition-colors ${
                level === l.v ? "bg-ink text-on-ink" : "tile"
              }`}
            >
              <div className="flex-1">
                <div className="font-semibold">
                  {l.label} {l.tag && <span className="opacity-50">· {l.tag}</span>}
                </div>
                <div className={`text-sm ${level === l.v ? "opacity-60" : "muted"}`}>{l.desc}</div>
              </div>
              {level === l.v && <Check size={18} />}
            </button>
          ))}
        </div>

        <div className="mt-7 flex items-baseline justify-between">
          <p className="label">New cards per day</p>
          <p className="num-thin text-3xl">{perDay}</p>
        </div>
        <input
          type="range"
          min={15}
          max={25}
          value={perDay}
          onChange={(e) => setPerDay(Number(e.target.value))}
          className="mt-2 w-full"
        />
        <p className="muted text-xs">15–25 keeps reviews to roughly 15–25 minutes a day.</p>

        <div className="tile mt-6 flex gap-3 p-4 text-sm">
          <span className="pill shrink-0 self-start">Rule</span>
          <p className="sub">Clear your due reviews before saving new sentences, so review debt never piles up.</p>
        </div>

        <button
          onClick={() => actions.updateSettings({ onboarded: true, placement: level, newPerDay: perDay })}
          className="btn btn-ink mt-6 h-14 w-full text-base"
        >
          Start learning
        </button>
      </div>
    </div>
  );
}
