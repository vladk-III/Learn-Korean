"use client";
/**
 * Streak reminders via Web Push, with no server of our own:
 *
 *  1. The phone generates a VAPID key pair and a push subscription, and bundles
 *     them with its time zone + reminder hours into one "setup code".
 *  2. The user stores that code as the REMINDER_CONFIG secret in their GitHub
 *     repo; an hourly GitHub Actions job (scripts/send-reminder.mjs) sends a
 *     push at the chosen local hours.
 *  3. The service worker (public/sw.js) reads the study state mirrored below
 *     and only shows the reminder if today's study isn't done yet.
 */
import { dayKey, isActiveDay, type Data } from "./store";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const REPO = "vladk-III/Learn-Korean";
export const SECRET_NAME = "REMINDER_CONFIG";
export const secretsUrl = `https://github.com/${REPO}/settings/secrets/actions/new`;
export const workflowUrl = `https://github.com/${REPO}/actions/workflows/reminders.yml`;

const STATE_CACHE = "lk-state";
const stateUrl = () => new URL(`${base}/__lk_state`, location.origin).toString();

export interface ReminderState {
  /** Local-date keys (YYYY-MM-DD) of recent days that count toward the streak. */
  activeDays: string[];
  /** Streak length counting up to yesterday (what's at risk today). */
  streakThroughYesterday: number;
  updatedAt: number;
}

export function reminderState(d: Data): ReminderState {
  const activeDays: string[] = [];
  const cur = new Date();
  for (let i = 0; i < 3; i++) {
    const k = dayKey(cur.getTime());
    if (isActiveDay(d.days[k])) activeDays.push(k);
    cur.setDate(cur.getDate() - 1);
  }
  let n = 0;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  while (isActiveDay(d.days[dayKey(y.getTime())])) {
    n++;
    y.setDate(y.getDate() - 1);
  }
  return { activeDays, streakThroughYesterday: n, updatedAt: Date.now() };
}

/** Mirror study state where the service worker can read it (it can't see localStorage). */
export async function syncReminderState(d: Data) {
  if (typeof caches === "undefined") return;
  try {
    const cache = await caches.open(STATE_CACHE);
    await cache.put(stateUrl(), new Response(JSON.stringify(reminderState(d)), { headers: { "content-type": "application/json" } }));
  } catch {
    // storage unavailable (private mode etc.) — reminders just won't be suppressed
  }
}

export type Support = "ok" | "no-sw" | "no-push" | "ios-not-installed";

export function pushSupport(): Support {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return "no-sw";
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  if (!("PushManager" in window) || !("Notification" in window)) return ios && !standalone ? "ios-not-installed" : "no-push";
  return "ok";
}

const b64url = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf as ArrayBuffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

export interface ReminderConfig {
  v: 1;
  subscription: PushSubscriptionJSON;
  vapid: { publicKey: string; privateKey: string; subject: string };
  tz: string;
  hours: number[];
}

export const encodeConfig = (c: ReminderConfig) => btoa(JSON.stringify(c));
export const decodeConfig = (code: string): ReminderConfig => JSON.parse(atob(code));

/** Ask permission, create keys + subscription, return the setup code. */
export async function enableReminders(hours: number[]): Promise<string> {
  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("Notifications are blocked for this app. Allow them in your phone settings.");

  const reg = await navigator.serviceWorker.ready;
  const keys = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const publicRaw = await crypto.subtle.exportKey("raw", keys.publicKey);
  const privateJwk = await crypto.subtle.exportKey("jwk", keys.privateKey);

  // A subscription is tied to one server key, so replace any previous one.
  const old = await reg.pushManager.getSubscription();
  if (old) await old.unsubscribe();
  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: publicRaw });

  return encodeConfig({
    v: 1,
    subscription: sub.toJSON(),
    vapid: { publicKey: b64url(publicRaw), privateKey: privateJwk.d!, subject: `https://${REPO.split("/")[0].toLowerCase()}.github.io/` },
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hours: [...hours].sort((a, b) => a - b),
  });
}

/** Same keys and subscription, new hours/time zone (no need to re-subscribe). */
export function withHours(code: string, hours: number[]): string {
  const c = decodeConfig(code);
  return encodeConfig({ ...c, hours: [...hours].sort((a, b) => a - b), tz: Intl.DateTimeFormat().resolvedOptions().timeZone });
}

export async function disableReminders() {
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  await sub?.unsubscribe();
}

/** Show a sample notification right now, to check the phone displays them. */
export async function testLocalNotification(streakDays: number) {
  if (Notification.permission !== "granted") {
    const p = await Notification.requestPermission();
    if (p !== "granted") throw new Error("Notifications are blocked for this app.");
  }
  const reg = await navigator.serviceWorker.ready;
  await reg.showNotification(streakDays > 0 ? `Your ${streakDays}-day streak ends at midnight` : "Time for a little Korean", {
    body: "This is a test. Real reminders only come on days you haven't studied yet.",
    icon: `${base}/icon-192.png`,
    badge: `${base}/icon-192.png`,
    tag: "streak-test",
  });
}

export const hourLabel = (h: number) => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "am" : "pm"}`;
