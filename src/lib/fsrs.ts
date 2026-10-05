/**
 * FSRS-5 (Free Spaced Repetition Scheduler) implementation.
 *
 * Models each card's memory with two variables:
 *   - Stability (S): days until recall probability decays to 90%.
 *   - Difficulty (D): 1..10, how hard the item is to raise stability for.
 * Retrievability R(t) = (1 + FACTOR * t / S) ^ DECAY is the predicted recall
 * probability after t days. Intervals are chosen so R hits the requested
 * retention (0.85–0.90 recommended) exactly when the card comes due.
 *
 * Reference: https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm
 */

export enum Rating {
  Again = 1,
  Hard = 2,
  Good = 3,
  Easy = 4,
}

export enum State {
  New = 0,
  Learning = 1,
  Review = 2,
  Relearning = 3,
}

export interface Card {
  due: number; // epoch ms
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: State;
  lastReview: number | null; // epoch ms
}

export interface ReviewLog {
  rating: Rating;
  state: State; // state *before* the review
  due: number;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  review: number; // epoch ms
}

export interface SchedulingResult {
  card: Card;
  log: ReviewLog;
}

export interface FSRSParams {
  requestRetention: number;
  maximumInterval: number;
  w: readonly number[];
}

/** FSRS-5 default weights (trained on ~20k Anki users). */
export const DEFAULT_WEIGHTS = [
  0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925,
  1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621,
] as const;

export const DECAY = -0.5;
export const FACTOR = 19 / 81; // makes R(S, S) = 0.9

const MINUTE = 60_000;
const DAY = 86_400_000;

export const DEFAULT_PARAMS: FSRSParams = {
  requestRetention: 0.9,
  maximumInterval: 36500,
  w: DEFAULT_WEIGHTS,
};

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

export function newCard(now = Date.now()): Card {
  return {
    due: now,
    stability: 0,
    difficulty: 0,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    state: State.New,
    lastReview: null,
  };
}

export function retrievability(elapsedDays: number, stability: number): number {
  if (stability <= 0) return 0;
  return Math.pow(1 + (FACTOR * elapsedDays) / stability, DECAY);
}

/** Current recall probability of a card, 0..1. */
export function cardRetrievability(card: Card, now = Date.now()): number {
  if (card.state === State.New || card.lastReview == null) return 0;
  return retrievability(Math.max(0, (now - card.lastReview) / DAY), card.stability);
}

export class FSRS {
  readonly p: FSRSParams;

  constructor(params: Partial<FSRSParams> = {}) {
    this.p = { ...DEFAULT_PARAMS, ...params };
    if (this.p.w.length !== 19) throw new Error("FSRS-5 needs 19 weights");
    this.p.requestRetention = clamp(this.p.requestRetention, 0.7, 0.99);
  }

  private get w() {
    return this.p.w;
  }

  initStability(r: Rating): number {
    return Math.max(this.w[r - 1], 0.1);
  }

  initDifficulty(r: Rating): number {
    return clamp(this.w[4] - Math.exp(this.w[5] * (r - 1)) + 1, 1, 10);
  }

  nextInterval(stability: number): number {
    const raw = (stability / FACTOR) * (Math.pow(this.p.requestRetention, 1 / DECAY) - 1);
    return clamp(Math.round(raw), 1, this.p.maximumInterval);
  }

  nextDifficulty(d: number, r: Rating): number {
    const delta = -this.w[6] * (r - 3);
    const damped = d + (delta * (10 - d)) / 9; // linear damping: harder to move near 10
    // Mean reversion toward the "Easy" initial difficulty prevents ease hell.
    const reverted = this.w[7] * this.initDifficulty(Rating.Easy) + (1 - this.w[7]) * damped;
    return clamp(reverted, 1, 10);
  }

  nextRecallStability(d: number, s: number, r: number, rating: Rating): number {
    const hardPenalty = rating === Rating.Hard ? this.w[15] : 1;
    const easyBonus = rating === Rating.Easy ? this.w[16] : 1;
    return (
      s *
      (1 +
        Math.exp(this.w[8]) *
          (11 - d) *
          Math.pow(s, -this.w[9]) *
          (Math.exp((1 - r) * this.w[10]) - 1) *
          hardPenalty *
          easyBonus)
    );
  }

  nextForgetStability(d: number, s: number, r: number): number {
    const sf =
      this.w[11] *
      Math.pow(d, -this.w[12]) *
      (Math.pow(s + 1, this.w[13]) - 1) *
      Math.exp((1 - r) * this.w[14]);
    // A lapse can never *increase* stability.
    return Math.min(sf, s / Math.exp(this.w[17] * this.w[18]));
  }

  /** Same-day (short-term) stability update used during learning steps. */
  nextShortTermStability(s: number, rating: Rating): number {
    return s * Math.exp(this.w[17] * (rating - 3 + this.w[18]));
  }

  /** Preview the outcome of every rating — used to label the 4 buttons. */
  repeat(card: Card, now = Date.now()): Record<Rating, SchedulingResult> {
    return {
      [Rating.Again]: this.next(card, Rating.Again, now),
      [Rating.Hard]: this.next(card, Rating.Hard, now),
      [Rating.Good]: this.next(card, Rating.Good, now),
      [Rating.Easy]: this.next(card, Rating.Easy, now),
    } as Record<Rating, SchedulingResult>;
  }

  next(card: Card, rating: Rating, now = Date.now()): SchedulingResult {
    const elapsedDays =
      card.state === State.New || card.lastReview == null
        ? 0
        : Math.max(0, Math.floor((now - card.lastReview) / DAY));

    const log: ReviewLog = {
      rating,
      state: card.state,
      due: card.due,
      stability: card.stability,
      difficulty: card.difficulty,
      elapsedDays,
      scheduledDays: card.scheduledDays,
      review: now,
    };

    const c: Card = { ...card, elapsedDays, lastReview: now, reps: card.reps + 1 };
    const inMinutes = (m: number) => {
      c.scheduledDays = 0;
      c.due = now + m * MINUTE;
    };
    const inDays = (d: number) => {
      c.scheduledDays = d;
      c.due = now + d * DAY;
    };

    switch (card.state) {
      case State.New: {
        c.stability = this.initStability(rating);
        c.difficulty = this.initDifficulty(rating);
        if (rating === Rating.Easy) {
          c.state = State.Review;
          inDays(this.nextInterval(c.stability));
        } else {
          c.state = State.Learning;
          inMinutes(rating === Rating.Again ? 1 : rating === Rating.Hard ? 5 : 10);
        }
        break;
      }

      case State.Learning:
      case State.Relearning: {
        c.stability = this.nextShortTermStability(card.stability, rating);
        c.difficulty = this.nextDifficulty(card.difficulty, rating);
        if (rating === Rating.Again) {
          inMinutes(5);
        } else if (rating === Rating.Hard) {
          inMinutes(10);
        } else {
          const good = this.nextInterval(c.stability);
          c.state = State.Review;
          if (rating === Rating.Good) {
            inDays(good);
          } else {
            const easyS = this.nextShortTermStability(card.stability, Rating.Easy);
            inDays(Math.max(this.nextInterval(easyS), good + 1));
          }
        }
        break;
      }

      case State.Review: {
        const r = retrievability(elapsedDays, card.stability);
        c.difficulty = this.nextDifficulty(card.difficulty, rating);
        if (rating === Rating.Again) {
          c.lapses = card.lapses + 1;
          c.state = State.Relearning;
          c.stability = this.nextForgetStability(card.difficulty, card.stability, r);
          inMinutes(5);
          break;
        }
        // Compute all three so intervals keep the order hard <= good < easy.
        const sHard = this.nextRecallStability(card.difficulty, card.stability, r, Rating.Hard);
        const sGood = this.nextRecallStability(card.difficulty, card.stability, r, Rating.Good);
        const sEasy = this.nextRecallStability(card.difficulty, card.stability, r, Rating.Easy);
        let iHard = this.nextInterval(sHard);
        let iGood = this.nextInterval(sGood);
        iHard = Math.min(iHard, iGood);
        iGood = Math.max(iGood, iHard + 1);
        const iEasy = Math.max(this.nextInterval(sEasy), iGood + 1);
        c.state = State.Review;
        if (rating === Rating.Hard) {
          c.stability = sHard;
          inDays(iHard);
        } else if (rating === Rating.Good) {
          c.stability = sGood;
          inDays(iGood);
        } else {
          c.stability = sEasy;
          inDays(iEasy);
        }
        break;
      }
    }

    return { card: c, log };
  }
}

/** Human-friendly label for the time until `due`, e.g. "10m", "3d", "2mo". */
export function formatInterval(ms: number): string {
  const m = Math.round(ms / MINUTE);
  if (m < 60) return `${Math.max(1, m)}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(ms / DAY);
  if (d < 30) return `${d}d`;
  if (d < 365) return `${Math.round(d / 30)}mo`;
  return `${(d / 365).toFixed(1)}y`;
}
