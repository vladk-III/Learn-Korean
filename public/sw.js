// Offline support: network-first for pages, cache-first for hashed static assets.
// Also handles streak-reminder pushes (see src/lib/reminders.ts).
const CACHE = "learn-korean-v3";
const STATE_CACHE = "lk-state";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      // Only clear old app caches; keep the study-state cache used by reminders.
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("learn-korean-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  if (url.pathname.includes("/_next/static/")) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
            return res;
          }),
      ),
    );
    return;
  }

  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match(new URL("./", self.registration.scope)))),
  );
});

// ---------- Streak reminders ----------

const dayKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

async function readState() {
  try {
    const res = await (await caches.open(STATE_CACHE)).match(new URL("__lk_state", self.registration.scope).toString());
    return res ? await res.json() : null;
  } catch {
    return null;
  }
}

async function handlePush(data) {
  const scope = self.registration.scope;
  const icon = new URL("icon-192.png", scope).toString();
  const show = (title, body) =>
    self.registration.showNotification(title, { body, icon, badge: icon, tag: "streak", renotify: true, data: { url: new URL("review/", scope).toString() } });

  if (data.stage === "test") return show("Reminders are working", "You'll get a nudge on evenings you haven't studied yet.");

  const state = await readState();
  const now = new Date();
  const today = dayKey(now);
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  const yesterday = dayKey(y);

  // Already studied today → nothing to remind about.
  if (state && state.activeDays.includes(today)) return;

  const streak = state && state.activeDays.includes(yesterday) ? state.streakThroughYesterday : 0;
  const final = data.stage === "final";
  if (streak > 0) {
    return show(
      final ? `Last call — your ${streak}-day streak ends at midnight` : `Your ${streak}-day streak ends tonight`,
      final ? "A few quick reviews before bed will keep it alive." : "Five minutes of reviews keeps it going. 화이팅!",
    );
  }
  return show("Time for a little Korean", "Five minutes today starts a new streak.");
}

self.addEventListener("push", (e) => {
  let data = {};
  try {
    data = e.data ? e.data.json() : {};
  } catch {
    data = {};
  }
  e.waitUntil(handlePush(data));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      const open = wins.find((w) => w.url.startsWith(self.registration.scope));
      if (open) return open.focus().then((w) => w && w.navigate(url));
      return self.clients.openWindow(url);
    }),
  );
});
