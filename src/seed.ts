import type { Place, State, Thing } from "./logic";
import { today } from "./logic";
import catalog from "./data/plants.seed.json";

export type Species = (typeof catalog.species)[number];
export const SPECIES: Species[] = catalog.species;
export const speciesById = new Map(SPECIES.map((s) => [s.id, s]));
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function plantFrom(sp: Species, over: Partial<Thing> = {}): Thing {
  return {
    id: uid(), name: sp.commonName, kind: "plant", speciesId: sp.id, placeId: null,
    every: sp.waterEveryDays, due: today(), last: null,
    feedEvery: sp.fertilizeEveryDays || 0, feedLast: null, history: [],
    dormant: sp.tags.includes("winter-dormant") || undefined,
    ...over,
  };
}

// Brian's own list, from My-Watering-Schedule.html: [name, species, water days, feed days]
const MINE: [string, string, number, number][] = [
  ["Lemon tree", "meyer-lemon", 6, 18],
  ["Rosemary", "rosemary", 7, 30],
  ["Orchid", "phalaenopsis-orchid", 7, 14],
  ["Staghorn fern", "staghorn-fern", 7, 30],
  ["Fiddle leaf fig", "fiddle-leaf-fig", 7, 30],
  ["Anthurium", "anthurium", 7, 30],
  ["Pilea", "pilea-peperomioides", 7, 30],
  ["Pothos", "pothos-golden", 9, 30],
  ["Ficus", "weeping-fig", 9, 30],
  ["Dragon tree", "dracaena-marginata", 10, 30],
  ["Christmas cactus", "christmas-cactus", 10, 30],
  ["String of turtles", "string-of-turtles", 10, 30],
  ["Trailing peperomia", "ruby-cascade-peperomia", 10, 30],
  ["Aloe vera", "aloe-vera", 14, 60],
  ["Jade plant", "jade-plant", 14, 60],
  ["Hen and chicks", "hen-and-chicks", 14, 60],
  ["Climbing aloe", "climbing-aloe", 14, 60],
  ["Assorted succulents", "echeveria", 14, 60],
  ["Mini dragonfruit", "dragon-fruit", 13, 60],
  ["Old-man cactus", "old-man-cactus", 20, 60],
];

export function starterState(): State {
  const places: Place[] = [
    { id: "living", name: "Living room", side: "in", scene: "living" },
    { id: "kitchen", name: "Kitchen", side: "in", scene: "kitchen" },
    { id: "bedroom", name: "Bedroom", side: "in", scene: "bedroom" },
    { id: "office", name: "Office", side: "in", scene: "office" },
    { id: "hydro", name: "Hydroponics", side: "in", scene: "hydro" },
    { id: "front", name: "Front yard", side: "out", scene: "porch" },
    { id: "back", name: "Back yard", side: "out", scene: "yard" },
    { id: "garden", name: "Garden", side: "out", scene: "garden" },
    { id: "coop", name: "Chicken coop", side: "out", scene: "coop" },
  ];
  const d = today();
  const things: Thing[] = MINE.map(([name, sid, every, feedEvery]) =>
    plantFrom(speciesById.get(sid)!, { name, every, feedEvery }));
  things.push(
    { id: uid(), name: "Chickens", kind: "pet", petKind: "chicken", count: 5, placeId: "coop", every: 2, due: d, last: null, feedEvery: 0, feedLast: null, history: [] },
    { id: uid(), name: "Cats", kind: "pet", petKind: "cat", count: 2, placeId: null, every: 2, due: d, last: null, feedEvery: 0, feedLast: null, history: [] },
    { id: uid(), name: "Hydroponics", kind: "system", placeId: "hydro", every: 7, due: d, last: null, feedEvery: 30, feedLast: null, history: [] },
  );
  return { v: 1, places, things, settings: { waterDays: [0, 3], seasonal: true } };
}

/** Words per kind: the main job and the job that rides along with it. */
export const WORDS = {
  plant: { verb: "Water", done: "Watered", extra: "feed", extraLong: "Feed", unit: "Water" },
  pet: { verb: "Refill", done: "Refilled", extra: "vitamins", extraLong: "Vitamins", unit: "Fresh water" },
  system: { verb: "Top up", done: "Topped up", extra: "full refresh", extraLong: "Full refresh", unit: "Top up" },
} as const;
