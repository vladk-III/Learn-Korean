"use client";

import { useEffect, useState } from "react";
import { BellOff, BellRing, Check, Copy, ExternalLink } from "lucide-react";
import { actions, streak, useData } from "@/lib/store";
import {
  SECRET_NAME,
  disableReminders,
  enableReminders,
  hourLabel,
  pushSupport,
  secretsUrl,
  testLocalNotification,
  withHours,
  workflowUrl,
  type Support,
} from "@/lib/reminders";

const HOURS = [17, 18, 19, 20, 21, 22, 23];

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-on-ink">{n}</span>
      <div className="sub min-w-0 flex-1 text-[15px] leading-snug">{children}</div>
    </li>
  );
}

export default function Reminders() {
  const d = useData();
  const r = d.settings.reminders;
  const [support, setSupport] = useState<Support | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [codeChanged, setCodeChanged] = useState(false);

  useEffect(() => setSupport(pushSupport()), []);

  const setHours = (hours: number[]) => {
    if (!hours.length) return;
    const code = r.code ? withHours(r.code, hours) : undefined;
    if (code && code !== r.code) setCodeChanged(true);
    actions.updateSettings({ reminders: { hours, code } });
  };

  const toggleHour = (h: number) => setHours(r.hours.includes(h) ? r.hours.filter((x) => x !== h) : [...r.hours, h].sort((a, b) => a - b));

  const turnOn = async () => {
    setErr(null);
    setBusy(true);
    try {
      const code = await enableReminders(r.hours);
      actions.updateSettings({ reminders: { ...r, code } });
      setCodeChanged(false);
    } catch (e) {
      setErr((e as Error).message || "Couldn't turn on notifications.");
    } finally {
      setBusy(false);
    }
  };

  const turnOff = async () => {
    await disableReminders().catch(() => {});
    actions.updateSettings({ reminders: { hours: r.hours } });
  };

  const copy = async () => {
    if (!r.code) return;
    try {
      await navigator.clipboard.writeText(r.code);
    } catch {
      // Clipboard can be blocked; the code is selectable in the box below as a fallback.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const test = async () => {
    setErr(null);
    try {
      await testLocalNotification(streak(d));
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  return (
    <div className="mt-2">
      <p className="sub text-[15px] leading-relaxed">
        Get a nudge in the evening if you haven&apos;t studied yet — so a busy day doesn&apos;t cost you your streak.
        Days you&apos;ve already studied stay quiet.
      </p>

      <p className="label mt-5">Remind me at</p>
      <div className="no-scrollbar -mx-5 mt-2 flex gap-1 overflow-x-auto px-5">
        {HOURS.map((h) => (
          <button key={h} onClick={() => toggleHour(h)} aria-pressed={r.hours.includes(h)} className="chip tabular-nums">
            {hourLabel(h)}
          </button>
        ))}
      </div>

      {support && support !== "ok" ? (
        <div className="tile mt-4 p-4 text-[15px]">
          {support === "ios-not-installed"
            ? "On iPhone, notifications work once the app is on your Home Screen: tap Share → Add to Home Screen, then open it from there."
            : support === "no-sw"
              ? "Reminders work in the installed app (not in this preview)."
              : "This browser doesn't support push notifications. Try Chrome on Android or the installed app on iPhone."}
        </div>
      ) : !r.code ? (
        <>
          <button onClick={turnOn} disabled={busy} className="btn btn-ink mt-4 h-14 w-full text-base">
            <BellRing size={18} strokeWidth={1.75} /> {busy ? "Setting up…" : "Turn on reminders"}
          </button>
          <p className="muted mt-2 text-center text-xs">Your phone will ask to allow notifications.</p>
        </>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <span className="icon-circle size-10">
                <BellRing size={17} strokeWidth={1.75} />
              </span>
              <div className="flex-1">
                <p className="font-semibold">
                  {codeChanged ? "Update your setup code" : "One-time setup"}{" "}
                  <span className={codeChanged ? "pill ml-1" : "pill pill-soft ml-1"}>{codeChanged ? "changed" : "2 min"}</span>
                </p>
                <p className="muted text-sm">
                  {r.hours.map(hourLabel).join(" & ")} · {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </p>
              </div>
            </div>

            <ol className="mt-4 space-y-3">
              <Step n={1}>
                <button onClick={copy} className="btn btn-ink h-10 px-4 text-sm">
                  {copied ? <Check size={15} /> : <Copy size={15} strokeWidth={1.75} />} {copied ? "Copied" : "Copy setup code"}
                </button>
                <textarea
                  readOnly
                  value={r.code}
                  rows={2}
                  onFocus={(e) => e.currentTarget.select()}
                  className="tile mt-2 w-full resize-none px-3 py-2 font-mono text-[10px] leading-tight outline-none"
                />
              </Step>
              <Step n={2}>
                Open{" "}
                <a href={secretsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-fg underline">
                  your repo&apos;s secrets <ExternalLink size={12} />
                </a>
                , name it <code className="rounded bg-tile px-1 font-mono text-[13px]">{SECRET_NAME}</code>, paste the code and save
                {codeChanged ? " (replace the old value)." : "."}
              </Step>
              <Step n={3}>
                Optional: run{" "}
                <a href={workflowUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-fg underline">
                  Streak reminders <ExternalLink size={12} />
                </a>{" "}
                → Run workflow with <b>test</b> ticked to get a notification now.
              </Step>
            </ol>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={test} className="btn btn-soft h-12 text-sm">
              Preview on this phone
            </button>
            <button onClick={turnOff} className="btn btn-line h-12 text-sm">
              <BellOff size={15} strokeWidth={1.75} /> Turn off
            </button>
          </div>
        </div>
      )}

      {err && <p className="text-bad mt-3 text-sm">{err}</p>}
    </div>
  );
}
