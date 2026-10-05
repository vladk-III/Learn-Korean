"use client";

import { useRef, useState } from "react";
import { Download, Search, Trash2, Upload, Volume2 } from "lucide-react";
import { State, cardRetrievability, formatInterval } from "@/lib/fsrs";
import { speak, ttsSupported, hasKoreanVoice, recognitionSupported } from "@/lib/speech";
import { actions, dayKey, streak, useData, useHydrated, type Data, type Skill } from "@/lib/store";

const STATE_LABEL = ["new", "learning", "review", "relearning"];
const SKILLS: Skill[] = ["reading", "writing", "listening", "speaking"];

function Week({ d }: { d: Data }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const t = new Date();
    t.setDate(t.getDate() - (6 - i));
    const s = d.days[dayKey(t.getTime())];
    return { label: t.toLocaleDateString(undefined, { weekday: "narrow" }), min: Math.round((s?.seconds ?? 0) / 60), rev: s?.reviews ?? 0 };
  });
  const max = Math.max(d.settings.dailyGoalMin, ...days.map((x) => x.min));
  return (
    <div className="flex h-32 items-end gap-2">
      {days.map((x, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <span className="muted text-[10px]">{x.min || ""}</span>
          <div
            className={`w-full rounded-t-lg ${x.min >= d.settings.dailyGoalMin ? "bg-emerald-500" : "bg-brand-400"}`}
            style={{ height: `${Math.max(4, (x.min / max) * 80)}px` }}
            title={`${x.min} min · ${x.rev} reviews`}
          />
          <span className="muted text-xs font-semibold">{x.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Me() {
  const d = useData();
  const hydrated = useHydrated();
  const [q, setQ] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  if (!hydrated) return null;

  const s = d.settings;
  const now = Date.now();
  const mature = d.cards.filter((c) => c.fsrs.state === State.Review && c.fsrs.stability >= 21).length;
  const last30 = d.log.filter((l) => l.ts > now - 30 * 86_400_000 && l.prevState === State.Review);
  const trueRetention = last30.length ? last30.filter((l) => l.rating > 1).length / last30.length : null;
  const cards = d.cards
    .filter((c) => !q || c.sentence.includes(q) || c.lemma.includes(q) || c.gloss.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.createdAt - a.createdAt);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `learn-korean-backup-${dayKey()}.json`;
    a.click();
  };

  const importData = async (f: File) => {
    try {
      const parsed = JSON.parse(await f.text()) as Data;
      if (parsed.version !== 1 || !Array.isArray(parsed.cards)) throw new Error();
      if (confirm(`Replace current data with backup (${parsed.cards.length} cards)?`)) actions.replaceAll(parsed);
    } catch {
      alert("That file isn't a valid backup.");
    }
  };

  return (
    <div className="pt-safe space-y-6 px-4">
      <h1 className="pt-5 text-2xl font-extrabold">나 Me</h1>

      <section className="grid grid-cols-2 gap-3 text-center">
        {[
          [`🔥 ${streak(d)}`, "day streak"],
          [d.cards.length, "cards"],
          [mature, "mature (21d+)"],
          [trueRetention == null ? "—" : `${Math.round(trueRetention * 100)}%`, "true retention (30d)"],
        ].map(([v, l]) => (
          <div key={l} className="card p-3">
            <p className="text-2xl font-extrabold">{v}</p>
            <p className="muted text-xs">{l}</p>
          </div>
        ))}
      </section>

      <section className="card p-4">
        <h2 className="mb-3 font-bold">Minutes this week</h2>
        <Week d={d} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold tracking-wide uppercase">Mined sentences</h2>
        <label className="card flex items-center gap-2 px-3 py-2">
          <Search size={16} className="muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search deck" className="w-full bg-transparent outline-none" />
        </label>
        <ul className="mt-2 space-y-2">
          {cards.length === 0 && <li className="muted p-3 text-sm">No cards yet.</li>}
          {cards.slice(0, 100).map((c) => (
            <li key={c.id} className="card flex items-start gap-2 p-3">
              <button onClick={() => speak(c.sentence, { rate: s.ttsRate })} aria-label="Play" className="text-brand-500 mt-1">
                <Volume2 size={16} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="ko">
                  {c.sentence.split(c.target).map((p, i, arr) => (
                    <span key={i}>
                      {p}
                      {i < arr.length - 1 && <b className="text-brand-600 dark:text-brand-400">{c.target}</b>}
                    </span>
                  ))}
                </p>
                <p className="muted text-xs">
                  {c.lemma} — {c.gloss}
                </p>
                <p className="muted text-[11px]">
                  {STATE_LABEL[c.fsrs.state]}
                  {c.fsrs.state !== State.New &&
                    ` · due ${c.fsrs.due <= now ? "now" : "in " + formatInterval(c.fsrs.due - now)} · recall ${Math.round(cardRetrievability(c.fsrs, now) * 100)}%`}
                </p>
              </div>
              <button
                onClick={() => confirm("Delete this card?") && actions.deleteCard(c.id)}
                aria-label="Delete card"
                className="muted p-1"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card space-y-5 p-4">
        <h2 className="font-bold">Settings</h2>

        <label className="block">
          <span className="text-sm font-semibold">New cards per day: {s.newPerDay}</span>
          <input type="range" min={5} max={30} value={s.newPerDay} onChange={(e) => actions.updateSettings({ newPerDay: +e.target.value })} className="w-full accent-indigo-500" />
          <span className="muted text-xs">Recommended 15–25.</span>
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Target retention: {Math.round(s.retention * 100)}%</span>
          <input type="range" min={80} max={95} value={Math.round(s.retention * 100)} onChange={(e) => actions.updateSettings({ retention: +e.target.value / 100 })} className="w-full accent-indigo-500" />
          <span className="muted text-xs">85–90% balances workload and memory. Higher = more reviews.</span>
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Daily goal: {s.dailyGoalMin} min</span>
          <input type="range" min={5} max={60} step={5} value={s.dailyGoalMin} onChange={(e) => actions.updateSettings({ dailyGoalMin: +e.target.value })} className="w-full accent-indigo-500" />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Assumed level (words below count as known)</span>
          <select value={s.placement} onChange={(e) => actions.updateSettings({ placement: +e.target.value })} className="card mt-1 w-full px-3 py-2">
            <option value={0}>Brand new</option>
            <option value={1}>A1</option>
            <option value={2}>A2</option>
            <option value={3}>B1</option>
            <option value={4}>B2</option>
          </select>
        </label>

        <div>
          <span className="text-sm font-semibold">Skills in mixed reviews</span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {SKILLS.map((k) => (
              <label key={k} className="hairline flex items-center gap-2 rounded-xl border px-3 py-2 text-sm capitalize">
                <input type="checkbox" checked={s.skills[k]} onChange={(e) => actions.updateSettings({ skills: { ...s.skills, [k]: e.target.checked } })} className="accent-indigo-500" />
                {k}
              </label>
            ))}
          </div>
        </div>

        <label className="flex items-center justify-between gap-3">
          <span className="text-sm">
            <b>Review-first lock</b>
            <span className="muted block text-xs">Block mining while reviews are overdue.</span>
          </span>
          <input type="checkbox" checked={s.strictReviewFirst} onChange={(e) => actions.updateSettings({ strictReviewFirst: e.target.checked })} className="size-5 accent-indigo-500" />
        </label>

        <div className="muted space-y-1 text-xs">
          <p>Text-to-speech: {ttsSupported() ? (hasKoreanVoice() ? "Korean voice ✓" : "no Korean voice found — install one in your phone's speech settings") : "not supported"}</p>
          <p>Speech recognition: {recognitionSupported() ? "available ✓" : "not available — speaking uses record & compare"}</p>
        </div>
      </section>

      <section className="card space-y-3 p-4">
        <h2 className="font-bold">Your data</h2>
        <p className="muted text-xs">Everything is stored on this device. Back it up to move to another phone.</p>
        <div className="flex gap-2">
          <button onClick={exportData} className="hairline flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold">
            <Download size={16} /> Export
          </button>
          <button onClick={() => fileRef.current?.click()} className="hairline flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold">
            <Upload size={16} /> Import
          </button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
        </div>
        <button
          onClick={() => confirm("Erase all cards, progress and settings?") && actions.reset()}
          className="w-full rounded-xl py-2.5 text-sm font-semibold text-rose-500"
        >
          Reset everything
        </button>
      </section>
    </div>
  );
}
