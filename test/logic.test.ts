import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, diffDays, feedDue, mood, nextWaterDay, push, schedule, snapDue, todayView, water, weekday, effEvery, type State, type Thing } from "../src/logic.ts";

const S = { waterDays: [0, 3], seasonal: true }; // Sun + Wed
const T = (o: Partial<Thing> = {}): Thing => ({ id: "a", name: "A", kind: "plant", placeId: null, every: 7, due: "2026-11-16", last: null, feedEvery: 30, feedLast: null, history: [], ...o });
const MON = "2026-11-16"; // a Monday

test("dates", () => {
  assert.equal(weekday(MON), 1);
  assert.equal(addDays("2026-11-30", 2), "2026-12-02");
  assert.equal(diffDays("2026-12-02", "2026-11-30"), 2);
  assert.equal(addDays("2026-03-07", 2), "2026-03-09"); // across DST start
  assert.equal(diffDays("2026-11-02", "2026-10-31"), 2); // across DST end
});

test("snap pulls weekly plants onto a watering day, ties go earlier", () => {
  assert.equal(snapDue("2026-11-23", 7, [0, 3], MON), "2026-11-22"); // Mon -> Sun (1 back) beats Wed (2 fwd)
  assert.equal(snapDue("2026-11-24", 7, [0, 3], MON), "2026-11-25"); // Tue -> Wed
  assert.equal(snapDue("2026-11-27", 7, [0, 3], MON), "2026-11-25"); // Fri -> Wed (tie with Sun, earlier wins)
});
test("snap leaves short cycles and 'any day' alone, never snaps into the past/today", () => {
  assert.equal(snapDue("2026-11-18", 2, [0, 3], MON), "2026-11-18");
  assert.equal(snapDue("2026-11-23", 7, [], MON), "2026-11-23");
  assert.equal(snapDue("2026-11-17", 5, [0], MON), "2026-11-17"); // Sun 15th is before 'after' -> stays
});

test("watering a weekly plant on Monday lands it with the Sunday batch", () => {
  const t = water(T(), MON, S);
  assert.equal(t.last, MON);
  assert.equal(t.due, "2026-11-22");
  assert.equal(t.history[0].t, "water");
});
test("everything watered together stays together", () => {
  const dues = [6, 7, 9, 10].map((every) => water(T({ every }), "2026-11-18", S).due); // on a Wed
  assert.deepEqual(dues, ["2026-11-25", "2026-11-25", "2026-11-25", "2026-11-29"]);
});
test("pets keep their own beat", () => {
  assert.equal(water(T({ kind: "pet", every: 2 }), MON, S).due, "2026-11-18");
});
test("winter stretches plants (and dormant ones more) but not pets", () => {
  const dec = "2026-12-10";
  assert.equal(effEvery(T({ every: 10 }), dec, S), 15);
  assert.equal(effEvery(T({ every: 20, dormant: true }), dec, S), 60);
  assert.equal(effEvery(T({ every: 2, kind: "pet" }), dec, S), 2);
  assert.equal(effEvery(T({ every: 10 }), dec, { ...S, seasonal: false }), 10);
});

test("push moves the date and teaches a slower rhythm only when pushed 2+ days", () => {
  const a = push(T(), addDays(MON, 1), MON);
  assert.equal(a.due, "2026-11-17"); assert.equal(a.every, 7);
  const b = push(T(), "2026-11-18", MON);
  assert.equal(b.due, "2026-11-18"); assert.equal(b.every, 8);
  assert.equal(push(T({ kind: "pet", every: 2 }), "2026-11-19", MON).every, 2);
});
test("next watering day", () => {
  assert.equal(nextWaterDay(MON, [0, 3]), "2026-11-18");
  assert.equal(nextWaterDay("2026-11-18", [0, 3]), "2026-11-22");
  assert.equal(nextWaterDay(MON, []), "2026-11-18");
});

test("feeding rides along, only in the growing season for plants", () => {
  assert.equal(feedDue(T(), MON), false); // November
  assert.equal(feedDue(T(), "2026-05-10"), true);
  assert.equal(feedDue(T({ feedLast: "2026-05-01" }), "2026-05-10"), false);
  assert.equal(feedDue(T({ feedLast: "2026-04-11" }), "2026-05-10"), true);
  assert.equal(feedDue(T({ kind: "system" }), MON), true); // hydro refresh ignores season
  assert.equal(feedDue(T({ feedEvery: 0 }), "2026-05-10"), false);
  const t = water(T({ kind: "system" }), MON, S, true);
  assert.equal(t.feedLast, MON); assert.equal(t.history.length, 2);
});

test("moods", () => {
  assert.equal(mood(T(), MON), "thirsty");
  assert.equal(mood(T({ due: "2026-11-13" }), MON), "parched");
  assert.equal(mood(T({ due: "2026-11-20" }), MON), "thriving");
  assert.equal(mood(water(T(), MON, S), MON), "watered");
});

test("today view: paused/quiet places stay out; 'while you're at it' only when already watering", () => {
  const st: State = {
    v: 1, settings: S,
    places: [{ id: "p", name: "P", side: "out", scene: "yard", paused: true }, { id: "q", name: "Q", side: "out", scene: "garden", quiet: true }],
    things: [T({ id: "1" }), T({ id: "2", placeId: "p" }), T({ id: "3", placeId: "q" }), T({ id: "4", due: "2026-11-17" }), T({ id: "5", due: "2026-11-17", every: 2, kind: "pet" }), T({ id: "6", due: "2026-11-22" })],
  };
  const v = todayView(st, MON);
  assert.deepEqual(v.now.map((t) => t.id), ["1"]);
  assert.deepEqual(v.soon.map((t) => t.id), ["4"]);
  const quietDay = todayView({ ...st, things: st.things.filter((t) => t.id !== "1") }, MON);
  assert.equal(quietDay.now.length, 0); assert.equal(quietDay.soon.length, 0); // Monday isn't a watering day
  assert.equal(quietDay.nextDay, "2026-11-17"); assert.equal(quietDay.nextCount, 2);
  const sch = schedule(st, MON);
  assert.deepEqual(sch.map((d) => [d.day, d.things.length]), [[MON, 1], ["2026-11-17", 2], ["2026-11-22", 1]]);
});
