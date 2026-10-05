"use client";

import { useRef, useState } from "react";
import {
  CalendarCheck,
  Download,
  Flame,
  Gauge,
  GraduationCap,
  Layers,
  Lock,
  Search,
  Trash2,
  Upload,
  Volume2,
} from "lucide-react";
import { State, cardRetrievability, formatInterval } from "@/lib/fsrs";
import { speak, ttsSupported, hasKoreanVoice, recognitionSupported } from "@/lib/speech";
import { actions, dayKey, streak, useData, useHydrated, type Data, type Skill } from "@/lib/store";
import Reminders from "@/components/Reminders";
import { TINT, tintCircle, type Tint } from "@/lib/tints";

const STATE_LABEL = ["new", "learning", "review", "relearning"];
const SKILLS: Skill[] = ["reading", "writing", "listening", "speaking"];
const LEVELS = ["Brand new", "A1", "A2", "B1", "B2"];

function Week({ d }: { d: Data }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const t = new Date();
    t.setDate(t.getDate() - (6 - i));
    const s = d.days[dayKey(t.getTime())];
    return {
      label: t.toLocaleDateString(undefined, { weekday: "narrow" }),
      min: Math.round((s?.seconds ?? 0) / 60),
      rev: s?.reviews ?? 0,
      today: i === 6,
    };
  });
  const goal = d.settings.dailyGoalMin;
  const max = Math.max(goal, ...days.map((x) => x.min));
  return (
    <div className="flex h-36 items-end gap-2.5">
      {days.map((x, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="label tabular-nums">{x.min || ""}</span>
          <div
            className={`w-full max-w-7 rounded-full ${x.min >= goal ? "bg-sage" : x.today ? "bg-accent" : "bg-line"}`}
            style={{ height: `${Math.max(8, (x.min / max) * 88)}px` }}
            title={`${x.min} min · ${x.rev} reviews`}
          />
          <span className={`text-xs ${x.today ? "font-semibold" : "muted"}`}>{x.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Settings row in the style of the reference's "Main Components" list. */
function SettingRow({
  icon: Icon,
  tint = "sky",
  title,
  hint,
  value,
  children,
}: {
  icon: typeof Flame;
  tint?: Tint;
  title: string;
  hint: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-line py-4 last:border-0">
      <div className="flex items-center gap-4">
        <span className={`${tintCircle(tint)} size-12`}>
          <Icon size={19} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{title}</p>
          <p className="muted text-sm">{hint}</p>
        </div>
        {value !== undefined && <span className="pill pill-outline shrink-0 px-3 py-1.5 text-sm">{value}</span>}
      </div>
      {children && <div className="mt-3 pl-16">{children}</div>}
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
  const st = streak(d);

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

  const stats: [string, React.ReactNode, Tint][] = [
    ["Day streak", st, "peach"],
    ["Cards", d.cards.length, "sky"],
    ["Mature", mature, "sage"],
    [
      "Retention",
      trueRetention == null ? (
        "—"
      ) : (
        <>
          {Math.round(trueRetention * 100)}
          <span className="muted text-2xl">%</span>
        </>
      ),
      "lilac",
    ],
  ];

  return (
    <div className="pt-safe">
      <header className="flex items-start justify-between px-5 pt-6 pb-7">
        <h1 className="display text-[2.6rem]">
          Your
          <span className="muted block">progress</span>
        </h1>
        <span className="mt-1 flex size-12 items-center justify-center rounded-full bg-accent text-white">
          <Flame size={20} strokeWidth={1.75} />
        </span>
      </header>

      <div className="sheet space-y-10 px-5 pt-6 pb-8">
        <section className="grid grid-cols-2 gap-3">
          {stats.map(([label, v, t]) => (
            <div key={label} className={`flex min-h-28 flex-col justify-between rounded-[1.4rem] p-4 ${TINT[t].soft}`}>
              <p className="font-medium">{label}</p>
              <p className="num-thin text-[2.4rem] leading-none">{v}</p>
            </div>
          ))}
        </section>

        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">This week</h2>
            <span className="muted text-[15px]">minutes · goal {s.dailyGoalMin}</span>
          </div>
          <div className="mt-5">
            <Week d={d} />
          </div>
        </section>

        <section id="reminders" className="scroll-mt-6">
          <h2 className="text-2xl font-semibold tracking-tight">Streak reminders</h2>
          <Reminders />
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
          <div className="mt-2">
            <SettingRow icon={Layers} tint="peach" title="New cards per day" hint="Recommended 15–25" value={s.newPerDay}>
              <input type="range" min={5} max={30} value={s.newPerDay} onChange={(e) => actions.updateSettings({ newPerDay: +e.target.value })} className="w-full" />
            </SettingRow>
            <SettingRow icon={Gauge} tint="sage" title="Target retention" hint="85–90% balances workload" value={`${Math.round(s.retention * 100)}%`}>
              <input
                type="range"
                min={80}
                max={95}
                value={Math.round(s.retention * 100)}
                onChange={(e) => actions.updateSettings({ retention: +e.target.value / 100 })}
                className="w-full"
              />
            </SettingRow>
            <SettingRow icon={CalendarCheck} tint="butter" title="Daily goal" hint="Minutes of study per day" value={`${s.dailyGoalMin} min`}>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={s.dailyGoalMin}
                onChange={(e) => actions.updateSettings({ dailyGoalMin: +e.target.value })}
                className="w-full"
              />
            </SettingRow>
            <SettingRow icon={GraduationCap} tint="lilac" title="Assumed level" hint="Words at this level count as known" value={LEVELS[s.placement]}>
              <div className="no-scrollbar flex gap-1 overflow-x-auto">
                {LEVELS.map((l, i) => (
                  <button key={l} onClick={() => actions.updateSettings({ placement: i })} aria-pressed={s.placement === i} className="chip">
                    {l}
                  </button>
                ))}
              </div>
            </SettingRow>
            <SettingRow icon={Lock} tint="rose" title="Review-first lock" hint="Block saving while reviews are overdue">
              <div className="flex gap-1">
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    onClick={() => actions.updateSettings({ strictReviewFirst: v })}
                    aria-pressed={s.strictReviewFirst === v}
                    className="chip"
                  >
                    {v ? "On" : "Off"}
                  </button>
                ))}
              </div>
            </SettingRow>
            <SettingRow icon={Volume2} tint="sky" title="Skills in mixed reviews" hint="Which exercises to rotate through">
              <div className="flex flex-wrap gap-1">
                {SKILLS.map((k) => (
                  <button
                    key={k}
                    onClick={() => actions.updateSettings({ skills: { ...s.skills, [k]: !s.skills[k] } })}
                    aria-pressed={s.skills[k]}
                    className="chip capitalize"
                  >
                    {k}
                  </button>
                ))}
              </div>
            </SettingRow>
          </div>
          <div className="tile mt-2 space-y-1 p-4 text-sm">
            <p>
              <span className="muted">Voice · </span>
              {ttsSupported() ? (hasKoreanVoice() ? "Korean voice ready" : "No Korean voice — add one in your phone's speech settings") : "Not supported"}
            </p>
            <p>
              <span className="muted">Speech recognition · </span>
              {recognitionSupported() ? "Available" : "Unavailable — speaking uses record & compare"}
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Saved sentences</h2>
            <span className="muted text-[15px]">{d.cards.length}</span>
          </div>
          <label className="tile mt-4 flex items-center gap-2 px-4 py-3">
            <Search size={17} className="muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your deck" className="w-full bg-transparent outline-none" />
          </label>
          <ul className="mt-3 space-y-2">
            {cards.length === 0 && <li className="muted p-3 text-sm">No cards yet.</li>}
            {cards.slice(0, 100).map((c) => (
              <li key={c.id} className="card flex items-start gap-3 p-4">
                <button onClick={() => speak(c.sentence, { rate: s.ttsRate })} aria-label="Play" className={`${tintCircle("sky")} size-10`}>
                  <Volume2 size={16} strokeWidth={1.75} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="ko leading-relaxed">
                    {c.sentence.split(c.target).map((p, i, arr) => (
                      <span key={i}>
                        {p}
                        {i < arr.length - 1 && <b className="rounded-md bg-accent-soft px-0.5">{c.target}</b>}
                      </span>
                    ))}
                  </p>
                  <p className="sub text-sm">
                    {c.lemma} — {c.gloss}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.fromQuiz && <span className="pill pill-soft">from quiz</span>}
                    <span className="pill pill-outline">{STATE_LABEL[c.fsrs.state]}</span>
                    {c.fsrs.state !== State.New && (
                      <span className="pill pill-outline">
                        {c.fsrs.due <= now ? "due now" : `in ${formatInterval(c.fsrs.due - now)}`} ·{" "}
                        {Math.round(cardRetrievability(c.fsrs, now) * 100)}%
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => confirm("Delete this card?") && actions.deleteCard(c.id)}
                  aria-label="Delete card"
                  className="muted p-1"
                >
                  <Trash2 size={16} strokeWidth={1.75} />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight">Your data</h2>
          <p className="muted mt-1 text-[15px]">Everything lives on this device. Back it up to move phones.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={exportData} className="btn btn-soft h-12">
              <Download size={16} strokeWidth={1.75} /> Export
            </button>
            <button onClick={() => fileRef.current?.click()} className="btn btn-soft h-12">
              <Upload size={16} strokeWidth={1.75} /> Import
            </button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
          </div>
          <button
            onClick={() => confirm("Erase all cards, progress and settings?") && actions.reset()}
            className="text-bad mt-3 w-full py-2 text-sm font-medium"
          >
            Reset everything
          </button>
        </section>
      </div>
    </div>
  );
}
