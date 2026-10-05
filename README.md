# 한글 Daily — Learn Korean from news & short clips

A mobile-first web app (installable on your phone) for learning Korean through
**comprehensible input**, **sentence mining** and **FSRS spaced repetition**, with
practice for all four skills: reading, writing, listening and speaking.

## Features

| Area | What it does |
| --- | --- |
| **News feed** | Graded news-style stories (A1–B2) by topic and CEFR level. Each shows a *difficulty analyzer* badge — the % of words you already know — so you can pick texts in the 95–98% "i+1" sweet spot. Paste any real Korean article to read it the same way. |
| **Short-form clips** | TikTok-style vertical feed of short scenes (ordering coffee, subway announcements, vlogs…) with sentence-synced audio and subtitles. *Shadow mode* pauses after each line so you can repeat it. |
| **Tap-to-gloss** | Tap any word: meaning, dictionary form, part of speech, level, romanization, grammar notes for particles/endings (e.g. `-에서: at/in`), word + sentence audio, and the sentence translation — without leaving the page. Words are underlined as *new* or *learning*. |
| **Sentence mining (1T rule)** | "Mine sentence" saves the full sentence with one highlighted target word. If the sentence has other unknown words, you're prompted to pick a single target or mark the others as known. |
| **Active-recall review (FSRS-5)** | Each review is an exercise, not a flip card: 🧩 **Reading** – rebuild the sentence from word tiles · ✍️ **Writing** – type the missing target word · 🎧 **Listening** – hear the sentence, type the missing word · 🗣️ **Speaking** – shadow the sentence, scored by speech recognition (with a syllable-level diff). Rate Again/Hard/Good/Easy (a rating is suggested from your answer); buttons show the next interval. |
| **Review discipline** | Overdue reviews lock mining (toggleable). New cards are capped per day (15–25 recommended), target retention is adjustable (85–90%). |
| **Habit tracking** | Daily-minutes goal ring, streak, weekly chart, true retention. |
| **Offline & private** | Works offline as a PWA. All data stays on your device; export/import a JSON backup from the *Me* tab. |

## Put it on your phone

### Option A — GitHub Pages (free, recommended)
1. Merge this branch into `main`.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The `Deploy to GitHub Pages` workflow builds and publishes the app to
   `https://<your-username>.github.io/<repo-name>/`.
4. Open that URL on your phone:
   - **iPhone (Safari):** Share → *Add to Home Screen*.
   - **Android (Chrome):** ⋮ menu → *Install app* / *Add to Home screen*.

HTTPS (which Pages provides) is required for the microphone and speech recognition.

### Option B — Vercel / Netlify
Import the repo; build command `npm run build`, output directory `out`.

### Option C — local network (for development)
```bash
npm install
npm run dev          # listens on 0.0.0.0:3000
```
Open `http://<your-computer-ip>:3000` on your phone (same Wi-Fi). Speech
recognition needs HTTPS, so use options A/B to test speaking on the phone.

### Voice tips
- Audio uses your phone's built-in Korean text-to-speech voice. If audio is silent
  or not Korean: **iOS** Settings → Accessibility → Spoken Content → Voices → Korean;
  **Android** Settings → Text-to-speech → install Korean voice data.
- Speaking practice uses on-device speech recognition (Chrome on Android, Safari on
  iOS 14.5+). Where it's unavailable you can record yourself and compare.

## Development

```bash
npm install
npm run dev        # dev server
npm test           # FSRS, analyzer, grading and content-coverage tests
npm run typecheck
npm run build      # static export to ./out
```

### Project layout
```
src/
  app/                 Next.js App Router pages
    page.tsx           Today: daily plan, goal ring, streak
    news/              News feed + paste-your-own article
    reader/            Interactive reader (tap-to-gloss, read-aloud)
    clips/             Vertical short-form feed
    review/            Review session (4 exercise types + FSRS rating)
    me/                Stats, deck, settings, backup
  components/          WordSheet (gloss + mining), InteractiveSentence, Exercises…
  content/             articles.ts, clips.ts, dictionary.ts (graded content)
  lib/
    fsrs.ts            FSRS-5 scheduler
    analyzer.ts        Korean morphological analyzer (particles, endings, contractions)
    hangul.ts          Jamo (de)composition + Revised Romanization
    store.ts           Local-first state (localStorage), queues, coverage
    speech.ts          Text-to-speech + speech recognition
prisma/schema.prisma   Server schema (Users, Words, Articles, MinedSentences, SrsReviews)
```

### Adding content
- **Articles/clips:** add entries to `src/content/articles.ts` or `clips.ts`.
- **Dictionary:** add lines to `src/content/dictionary.ts`
  (`lemma|pos|level|gloss|irregular,forms`). Regular conjugations and particles are
  handled by the analyzer.
- `npm test` fails if any word in the bundled content can't be glossed, and
  `DUMP=1 npx vitest run src/content` prints how every word was analysed.

### How the pieces map to the learning science
- **Comprehensible input (i+1):** per-text known-word % from your placement level,
  words you mark known, and mature cards (stability ≥ 21 days).
- **1T rule:** one target per card; mining warns about extra unknowns.
- **Active recall:** every review requires producing the answer (typing, ordering,
  speaking) — no multiple choice.
- **FSRS-5:** default weights, requested retention from settings; learning steps
  of 1/5/10 minutes are repeated within the same session.

### Roadmap ideas
- Sync backend (Supabase + the Prisma schema) and FSRS weight optimisation from the review log.
- Live news ingestion (RSS → simplification → CEFR tagging) and real video clips with aligned subtitles (Whisper).
- Higher-quality neural TTS audio (pre-generated) instead of the device voice.
