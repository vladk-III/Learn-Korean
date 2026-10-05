"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { BookOpen, Clapperboard, Home, Layers, User } from "lucide-react";
import { actions, blockingDue, dueCards, newQueue, useData, useHydrated } from "@/lib/store";
import Onboarding from "./Onboarding";

const NAV = [
  { href: "/", label: "Today", icon: Home },
  { href: "/news/", label: "News", icon: BookOpen },
  { href: "/clips/", label: "Clips", icon: Clapperboard },
  { href: "/review/", label: "Review", icon: Layers },
  { href: "/me/", label: "Me", icon: User },
];

function useStudyTimer() {
  useEffect(() => {
    let last = Date.now();
    const mark = () => (last = Date.now());
    const events = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }));
    const id = window.setInterval(() => {
      const speaking = "speechSynthesis" in window && window.speechSynthesis.speaking;
      if (document.visibilityState === "visible" && (Date.now() - last < 60_000 || speaking)) {
        actions.addSeconds(15);
      }
    }, 15_000);
    return () => {
      window.clearInterval(id);
      events.forEach((e) => window.removeEventListener(e, mark));
    };
  }, []);
}

function useServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` }).catch(() => {});
  }, []);
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const d = useData();
  const hydrated = useHydrated();
  useStudyTimer();
  useServiceWorker();

  const reviewCount = hydrated ? dueCards(d).length + newQueue(d).length : 0;
  const blocking = hydrated ? blockingDue(d) : 0;

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
      <main className="flex-1 pb-24">{children}</main>
      {hydrated && !d.settings.onboarded && <Onboarding />}
      <nav className="card pb-safe fixed inset-x-0 bottom-0 z-30 mx-auto max-w-xl rounded-none rounded-t-2xl border-x-0 border-b-0">
        <ul className="grid grid-cols-5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href.replace(/\/$/, "")) || (href === "/review/" && pathname.startsWith("/study"));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold ${
                    active ? "text-brand-600 dark:text-brand-400" : "muted"
                  }`}
                >
                  <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                  {label}
                  {href === "/review/" && reviewCount > 0 && (
                    <span
                      className={`absolute top-1 left-1/2 ml-2 min-w-5 rounded-full px-1.5 text-[10px] leading-5 text-white ${
                        blocking > 0 ? "bg-rose-500" : "bg-brand-500"
                      }`}
                    >
                      {reviewCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
