"use client";
/** Text-to-speech (Web Speech synthesis) and speech recognition helpers. */

let koVoice: SpeechSynthesisVoice | null | undefined;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  if (koVoice) return koVoice;
  const voices = window.speechSynthesis.getVoices();
  const ko = voices.filter((v) => v.lang?.toLowerCase().startsWith("ko"));
  // Prefer higher-quality voices when the platform exposes them.
  koVoice = ko.find((v) => /google|premium|enhanced|yuna|natural/i.test(v.name)) ?? ko[0] ?? null;
  return koVoice;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    koVoice = undefined;
    pickVoice();
  };
}

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function hasKoreanVoice(): boolean {
  return !!pickVoice();
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
  onBoundary?: (charIndex: number) => void;
}

let current: SpeechSynthesisUtterance | null = null;

export function speak(text: string, opts: SpeakOptions = {}) {
  if (!ttsSupported()) {
    opts.onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  const v = pickVoice();
  if (v) u.voice = v;
  u.rate = opts.rate ?? 0.9;
  u.pitch = opts.pitch ?? 1;
  u.onend = () => {
    if (current === u) {
      current = null;
      opts.onEnd?.();
    }
  };
  u.onerror = () => {
    if (current === u) current = null;
  };
  if (opts.onBoundary) u.onboundary = (e) => opts.onBoundary?.(e.charIndex);
  current = u;
  synth.speak(u);
}

/** Stop speech without firing the onEnd callback. */
export function stopSpeaking() {
  current = null;
  if (ttsSupported()) window.speechSynthesis.cancel();
}

// ---------- Speech recognition (speaking practice) ----------

interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function Recognition(): (new () => RecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as (new () => RecognitionLike) | null;
}

export function recognitionSupported(): boolean {
  return !!Recognition();
}

export interface Listening {
  result: Promise<string[]>;
  stop: () => void;
}

/** Listen once in Korean; resolves with candidate transcripts. */
export function listenKorean(): Listening {
  const R = Recognition();
  if (!R) return { result: Promise.reject(new Error("unsupported")), stop: () => {} };
  const rec = new R();
  rec.lang = "ko-KR";
  rec.interimResults = false;
  rec.maxAlternatives = 5;
  rec.continuous = false;
  const result = new Promise<string[]>((resolve, reject) => {
    let got: string[] = [];
    rec.onresult = (e) => {
      const r = e.results[0];
      got = Array.from({ length: r.length }, (_, i) => r[i].transcript);
    };
    rec.onerror = (e) => reject(new Error(e.error));
    rec.onend = () => resolve(got);
  });
  rec.start();
  return { result, stop: () => rec.stop() };
}
