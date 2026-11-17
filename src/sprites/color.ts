// Sprite color utilities: hex math, foliage greens, pot tints.
// Every plant gets a deterministic "random" green from its id, so colors are
// stable across launches with no migration needed. Users can override both
// the leaf color and the pot color from the plant detail screen.

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const p = (n: number) => clamp(n).toString(16).padStart(2, "0");
  return `#${p(r)}${p(g)}${p(b)}`;
}

/** Lighten (amt > 0) or darken (amt < 0) a hex color. amt in [-1, 1]. */
export function shade(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  if (amt >= 0) return rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
  return rgbToHex(r * (1 + amt), g * (1 + amt), b * (1 + amt));
}

/** Linear mix of two hex colors. t=0 → a, t=1 → b. */
export function mix(a: string, b: string, t: number): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
}

/** Small stable string hash (djb2). */
export function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Foliage greens — believable houseplant shades, all read well on cream. */
export const GREENS = [
  "#6fa05c", "#5e8f50", "#7cab66", "#4e7c42", "#87b46e",
  "#558b62", "#6b9a45", "#74a87b", "#45704f", "#8aa952",
];

/** Non-green foliage options (tradescantia purple, rubber-plant burgundy…). */
export const LEAF_EXTRAS = ["#7d4f5e", "#6f5a85", "#4f9080", "#97934f"];

/** All leaf swatches offered in the picker. */
export const LEAF_TINTS = [...GREENS, ...LEAF_EXTRAS];

/** Pot swatches — cottage palette. First entry is the default terracotta. */
export const POT_TINTS = [
  "#c97b5d", "#efe3cb", "#9bb392", "#8fb8d8",
  "#dfa3a8", "#e2b25c", "#a99cc4", "#6e6a5e",
];

/** Deterministic default green for a plant (stable per id, no storage needed). */
export const greenFor = (id: string) => GREENS[hashStr(id) % GREENS.length];

/** Bloom colors for the flowering archetype, picked per species. */
export const BLOOMS = ["#e2a1a8", "#e8c06a", "#f2ece0", "#b3a3d6", "#e2937f"];

/** Real-world bloom colors for well-known flowers; others hash a palette pick. */
const BLOOM_OVERRIDES: Record<string, string> = {
  "black-eyed-susan": "#e2b25c",
  sunflower: "#e8c06a", marigold: "#e09a44", zinnia: "#e2937f",
  chamomile: "#f2ece0", "peace-lily": "#f2ece0", gardenia: "#f2ece0",
  rose: "#d98a94", cyclamen: "#e2a1a8", "phalaenopsis-orchid": "#e8b7d1",
  lavender: "#b3a3d6", petunia: "#b3a3d6", hydrangea: "#a9b8d9",
  "african-violet": "#9b86c9", "purple-shamrock": "#c9a3c4",
  "tropical-hibiscus": "#e2937f", geranium: "#e2937f", anthurium: "#d9737f",
  kalanchoe: "#e2937f", "bromeliad-guzmania": "#d9737f",
};
export const bloomFor = (id: string) => BLOOM_OVERRIDES[id] ?? BLOOMS[hashStr(id) % BLOOMS.length];

/** Flower-center colors; most get gold, rudbeckia & friends get dark cones. */
const BLOOM_CENTERS: Record<string, string> = {
  "black-eyed-susan": "#4f3d2c",
  coneflower: "#a5643f",
  sunflower: "#5b4632",
  cosmos: "#e09a44",
};
export const bloomCenterFor = (id: string) => BLOOM_CENTERS[id] ?? "#e8c06a";
