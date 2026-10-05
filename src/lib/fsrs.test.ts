import { describe, expect, it } from "vitest";
import { FSRS, Rating, State, newCard, retrievability, formatInterval } from "./fsrs";

const DAY = 86_400_000;
const t0 = Date.UTC(2026, 0, 1);

describe("FSRS", () => {
  const f = new FSRS({ requestRetention: 0.9 });

  it("R(S, S) is 90%", () => {
    expect(retrievability(10, 10)).toBeCloseTo(0.9, 5);
  });

  it("interval equals stability at 90% retention", () => {
    expect(f.nextInterval(10)).toBe(10);
    expect(new FSRS({ requestRetention: 0.85 }).nextInterval(10)).toBeGreaterThan(10);
  });

  it("new card follows learning steps", () => {
    const c = newCard(t0);
    const again = f.next(c, Rating.Again, t0).card;
    expect(again.state).toBe(State.Learning);
    expect(again.due - t0).toBe(60_000);
    const good = f.next(c, Rating.Good, t0).card;
    expect(good.due - t0).toBe(10 * 60_000);
    const easy = f.next(c, Rating.Easy, t0).card;
    expect(easy.state).toBe(State.Review);
    expect(easy.scheduledDays).toBeGreaterThanOrEqual(1);
  });

  it("graduates and grows intervals on successive Good ratings", () => {
    let c = newCard(t0);
    let now = t0;
    c = f.next(c, Rating.Good, now).card; // -> learning
    now = c.due;
    c = f.next(c, Rating.Good, now).card; // -> review
    expect(c.state).toBe(State.Review);
    const intervals: number[] = [];
    for (let i = 0; i < 5; i++) {
      now = c.due;
      c = f.next(c, Rating.Good, now).card;
      intervals.push(c.scheduledDays);
    }
    for (let i = 1; i < intervals.length; i++) expect(intervals[i]).toBeGreaterThan(intervals[i - 1]);
  });

  it("orders review intervals hard <= good < easy and lapses on Again", () => {
    let c = newCard(t0);
    c = f.next(c, Rating.Good, t0).card;
    c = f.next(c, Rating.Good, c.due).card;
    const now = c.due;
    const opts = f.repeat(c, now);
    const days = (r: Rating) => opts[r].card.scheduledDays;
    expect(days(Rating.Hard)).toBeLessThanOrEqual(days(Rating.Good));
    expect(days(Rating.Good)).toBeLessThan(days(Rating.Easy));
    const lapsed = opts[Rating.Again].card;
    expect(lapsed.state).toBe(State.Relearning);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.stability).toBeLessThan(c.stability);
  });

  it("keeps difficulty in [1, 10]", () => {
    let c = newCard(t0);
    let now = t0;
    for (let i = 0; i < 20; i++) {
      c = f.next(c, Rating.Again, now).card;
      now += DAY;
    }
    expect(c.difficulty).toBeLessThanOrEqual(10);
    expect(c.difficulty).toBeGreaterThanOrEqual(1);
  });

  it("formats intervals", () => {
    expect(formatInterval(60_000)).toBe("1m");
    expect(formatInterval(3 * DAY)).toBe("3d");
    expect(formatInterval(90 * DAY)).toBe("3mo");
  });
});
