// Species → sprite archetype. Named ids get hand-picked silhouettes for
// botanical accuracy; everything else (including custom species) falls back
// to tag heuristics, so newly imported catalog species Just Work.

import type { Archetype } from "./archetypes";

const ID: Record<string, Archetype> = {
  // the famous ones
  "monstera-deliciosa": "monstera", "monstera-adansonii": "monstera",
  "snake-plant": "snake", "zz-plant": "zz",
  "pothos-golden": "sagittate", "philodendron-heartleaf": "sagittate",
  "philodendron-micans": "sagittate", "pink-princess-philodendron": "sagittate",
  "arrowhead-plant": "sagittate", "hoya-carnosa": "sagittate",
  "english-ivy": "sagittate", "creeping-fig": "sagittate",
  "inch-plant": "sagittate", "tradescantia-nanouk": "sagittate",
  "string-of-hearts": "pearls", "string-of-pearls": "pearls",
  "string-of-bananas": "pearls", "string-of-turtles": "pearls",
  "burros-tail": "pearls", "ruby-cascade-peperomia": "pearls",
  "mistletoe-cactus": "pearls", "christmas-cactus": "segments", "fishbone-cactus": "segments",
  "goldfish-plant": "pearls", "lipstick-plant": "pearls", "tropical-pitcher-plant": "pearls",
  // blades & tufts
  "spider-plant": "spiky", "dracaena-marginata": "spiky", "yucca": "spiky",
  "ponytail-palm": "spiky", "lucky-bamboo": "spiky", "air-plant": "spiky",
  "lemongrass": "spiky", "corn": "spiky", "pineapple": "spiky",
  "chives": "shoots", "green-onion": "shoots", "garlic": "shoots", "leek": "shoots",
  "dwarf-banana": "palm", "avocado": "tree",
  // rosettes & fat leaves
  "aloe-vera": "aloe", "climbing-aloe": "aloe", "haworthia": "aloe",
  "echeveria": "succulent", "hen-and-chicks": "succulent", "lithops": "succulent",
  "venus-flytrap": "succulent",
  // round-leaf bushes
  "jade-plant": "bush", "pilea-peperomioides": "bush", "peperomia-obtusifolia": "bush",
  "watermelon-peperomia": "bush", "fittonia": "bush", "polka-dot-plant": "bush",
  "aluminum-plant": "bush", "babys-tears": "bush", "coleus": "bush",
  "purple-shamrock": "bush", "strawberry": "bush", "blueberry": "bush",
  "tomato": "bush", "chili-pepper": "bush", "bell-pepper": "bush", "eggplant": "bush",
  // trees & trunks
  "fiddle-leaf-fig": "broadtree", "rubber-plant": "broadtree", "weeping-fig": "tree",
  "ficus-tineke": "broadtree", "ficus-audrey": "broadtree",
  "money-tree": "tree", "schefflera": "tree", "ming-aralia": "tree",
  "coffee-plant": "tree", "bay-laurel": "tree", "meyer-lemon": "tree",
  // palms & big fans
  "bird-of-paradise": "palm", "norfolk-island-pine": "palm", "sago-palm": "palm",
  // blooms
  "peace-lily": "flower", "african-violet": "flower", "phalaenopsis-orchid": "flower",
  "anthurium": "flower", "kalanchoe": "flower", "bromeliad-guzmania": "flower",
  "cyclamen": "flower", "gardenia": "flower", "tropical-hibiscus": "flower",
  "lavender": "flower", "chamomile": "flower", "hosta": "generic",
  // broad-leaf classics
  "dieffenbachia": "generic", "aglaonema": "generic", "cast-iron-plant": "generic",
  "calathea-prayer": "generic", "croton": "generic", "rex-begonia": "generic",
  "polka-dot-begonia": "generic", "caladium": "generic", "alocasia-amazonica": "generic",
  "philodendron-birkin": "generic",
  // climbing edibles read as vines
  "cucumber": "sagittate", "pea": "sagittate", "green-bean": "sagittate",
  "dragon-fruit": "cactus", "pencil-cactus": "cactus",
};

/** Resolve an archetype from a species id + tags (works for custom species). */
export function archetypeFor(speciesId: string, tags: string[] = []): Archetype {
  const hit = ID[speciesId];
  if (hit) return hit;
  const has = (t: string) => tags.includes(t);
  if (has("cactus")) return "cactus";
  if (has("fern")) return "fern";
  if (has("palm")) return "palm";
  if (has("herb")) return "herb";
  if (has("carnivorous")) return "succulent";
  if (has("succulent") && (has("hanging") || has("trailing"))) return "pearls";
  if (has("succulent")) return "succulent";
  if (has("trailing")) return "pearls";
  if (has("vine") || has("climbing")) return "sagittate";
  if (has("tree")) return "tree";
  if (has("fruit")) return "bush";
  if (has("flower") || has("flowering")) return "flower";
  if (has("leafy")) return "generic";
  if (has("root")) return "herb";
  if (has("vegetable")) return "bush";
  if (has("succulent-like")) return "snake";
  if (has("hanging")) return "sagittate";
  return "generic";
}
