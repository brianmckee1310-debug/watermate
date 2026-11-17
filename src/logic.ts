// WaterMate scheduling — pure functions, day-granular (local "YYYY-MM-DD").

export type SceneKind =
  | "living" | "kitchen" | "bedroom" | "office" | "bath" | "sunroom"
  | "yard" | "porch" | "garden" | "coop" | "hydro" | "shelf";

export type Place = {
  id: string; name: string; side: "in" | "out"; scene: SceneKind;
  /** Never shows in Today (e.g. a bed on a daily sprinkler). */
  quiet?: boolean;
  /** Resting for the season — nothing here asks for water. */
  paused?: boolean;
};

export type Ev = { t: "water" | "feed" | "push"; d: string };

export type Thing = {
  id: string; name: string; kind: "plant" | "pet" | "system";
  speciesId?: string; petKind?: string; count?: number;
  placeId: string | null;
  /** Base days between waterings (before the season adjustment). */
  every: number;
  due: string; last: string | null;
  /** Second job that rides along with water: feed / vitamins / full refresh. 0 = none. */
  feedEvery: number; feedLast: string | null;
  history: Ev[];
  leafColor?: string; potColor?: string; tint?: string; notes?: string;
  dormant?: boolean;
};

export type Settings = { waterDays: number[]; seasonal: boolean };
export type State = { v: 1; places: Place[]; things: Thing[]; settings: Settings };

// ---- dates ------------------------------------------------------------------
const pad = (n: number) => String(n).padStart(2, "0");
export const fmtDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => fmtDay(new Date());
export const toDate = (day: string) => { const [y, m, d] = day.split("-").map(Number); return new Date(y, m - 1, d, 12); };
export const addDays = (day: string, n: number) => { const d = toDate(day); d.setDate(d.getDate() + n); return fmtDay(d); };
export const diffDays = (a: string, b: string) => Math.round((toDate(a).getTime() - toDate(b).getTime()) / 864e5);
export const weekday = (day: string) => toDate(day).getDay();
export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "today", "tomorrow", "Wed", "Wed Nov 25" */
export function niceDay(day: string, now = today()): string {
  const n = diffDays(day, now);
  if (n === 0) return "today";
  if (n === 1) return "tomorrow";
  if (n === -1) return "yesterday";
  const d = toDate(day);
  if (n > 1 && n < 7) return DAY_LONG[d.getDay()];
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

// ---- season -----------------------------------------------------------------
/** Plants drink less in winter (Dec-Feb), a touch more in summer. Pets and systems don't care. */
export function seasonMult(t: Thing, day: string, s: Settings): number {
  if (t.kind !== "plant" || !s.seasonal) return 1;
  const m = toDate(day).getMonth();
  const winter = m === 11 || m <= 1;
  const summer = m >= 5 && m <= 7;
  if (winter) return t.dormant ? 3 : 1.5;
  return summer ? 0.85 : 1;
}
export const effEvery = (t: Thing, day: string, s: Settings) => Math.max(1, Math.round(t.every * seasonMult(t, day, s)));

/** Plants only get fed in the growing season (Mar-Sep). */
export const growing = (day: string) => { const m = toDate(day).getMonth(); return m >= 2 && m <= 8; };

// ---- smart grouping: pull due dates onto shared watering days ----------------
/**
 * Snap a raw due date to the nearest chosen watering day, so many things come
 * due together. Short cycles (under 5 days) are left alone. The shift is
 * capped at ~30% of the interval; ties go earlier (safer than late).
 */
export function snapDue(raw: string, every: number, waterDays: number[], after: string): string {
  if (every < 5 || waterDays.length === 0) return raw;
  const max = Math.max(1, Math.round(every * 0.3));
  for (let k = 0; k <= max; k++) {
    for (const cand of k === 0 ? [raw] : [addDays(raw, -k), addDays(raw, k)]) {
      if (diffDays(cand, after) > 0 && waterDays.includes(weekday(cand))) return cand;
    }
  }
  return raw;
}

export function nextWaterDay(after: string, waterDays: number[]): string {
  if (waterDays.length === 0) return addDays(after, 2);
  for (let k = 1; k <= 7; k++) { const c = addDays(after, k); if (waterDays.includes(weekday(c))) return c; }
  return addDays(after, 2);
}

// ---- actions ----------------------------------------------------------------
const HIST = 40;
const log = (t: Thing, e: Ev) => [e, ...t.history].slice(0, HIST);

export function feedDue(t: Thing, day: string): boolean {
  if (t.feedEvery <= 0) return false;
  if (t.kind === "plant" && !growing(day)) return false;
  if (!t.feedLast) return true;
  return diffDays(day, t.feedLast) >= t.feedEvery - 2;
}

export function water(t: Thing, day: string, s: Settings, withFeed = false): Thing {
  const raw = addDays(day, effEvery(t, day, s));
  let history = log(t, { t: "water", d: day });
  let feedLast = t.feedLast;
  if (withFeed) { feedLast = day; history = [{ t: "feed" as const, d: day }, ...history].slice(0, HIST); }
  return { ...t, last: day, due: snapDue(raw, t.every, s.waterDays, day), feedLast, history };
}

/**
 * "Doesn't need it yet." Moves the due date and, when pushed 2+ days, teaches
 * the plant's rhythm a day slower (plants only).
 */
export function push(t: Thing, to: string, day: string): Thing {
  const learn = t.kind === "plant" && diffDays(to, day) >= 2;
  return { ...t, due: to, every: learn ? Math.min(120, t.every + 1) : t.every, history: log(t, { t: "push", d: day }) };
}

// ---- status -----------------------------------------------------------------
export type Mood = "watered" | "thriving" | "thirsty" | "parched";
export function mood(t: Thing, day: string): Mood {
  if (t.last && diffDays(day, t.last) <= 1 && diffDays(t.due, day) > 0) return "watered";
  const n = diffDays(t.due, day);
  if (n > 0) return "thriving";
  return -n >= Math.max(2, Math.round(t.every * 0.3)) ? "parched" : "thirsty";
}

export function dueText(t: Thing, day: string): string {
  const n = diffDays(t.due, day);
  if (n < -1) return `${-n} days late`;
  if (n === -1) return "1 day late";
  if (n === 0) return "due today";
  if (n === 1) return "due tomorrow";
  return `in ${n} days`;
}

export const everyText = (n: number) =>
  n === 1 ? "daily" : n === 7 ? "weekly" : n === 14 ? "every 2 weeks" : n === 30 ? "monthly" : `every ${n} days`;

const placeOf = (t: Thing, places: Place[]) => places.find((p) => p.id === t.placeId);
/** Does this thing take part in reminders/Today right now? */
export function active(t: Thing, places: Place[]): boolean {
  const p = placeOf(t, places);
  return !(p?.paused || p?.quiet);
}

export type TodayView = { now: Thing[]; soon: Thing[]; nextDay: string | null; nextCount: number };
/**
 * now  = due or late.
 * soon = due within 2 days — offered as "while you're at it", but only when
 *        you're already watering (something is due) or it's a watering day.
 */
export function todayView(state: State, day: string): TodayView {
  const live = state.things.filter((t) => active(t, state.places));
  const now = live.filter((t) => diffDays(t.due, day) <= 0);
  const wateringNow = now.length > 0 || state.settings.waterDays.includes(weekday(day));
  const soon = wateringNow
    ? live.filter((t) => { const n = diffDays(t.due, day); return n >= 1 && n <= 2 && t.every >= 5; })
    : [];
  const later = live.filter((t) => diffDays(t.due, day) > 0).sort((a, b) => a.due.localeCompare(b.due));
  const nextDay = later[0]?.due ?? null;
  return { now, soon, nextDay, nextCount: later.filter((t) => t.due === nextDay).length };
}

/** Upcoming days, each with the things due then (late things land on today). */
export function schedule(state: State, day: string, horizon = 35): { day: string; things: Thing[] }[] {
  const map = new Map<string, Thing[]>();
  for (const t of state.things) {
    if (!active(t, state.places)) continue;
    const d = diffDays(t.due, day) < 0 ? day : t.due;
    if (diffDays(d, day) > horizon) continue;
    map.set(d, [...(map.get(d) ?? []), t]);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([d, things]) => ({ day: d, things }));
}
