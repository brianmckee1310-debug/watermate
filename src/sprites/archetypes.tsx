// Foliage silhouettes, one per botanical archetype. Flat-cute style: chunky
// fills, no outlines, tones derived from a single leaf color.
//
// Coordinate system (shared with PlantSprite): pot bottom sits at y=0, the
// foliage grows upward from the attach point (0,-46); the pot rim (drawn
// after the foliage) hides the stems' bases. `d` is droop in [0..1] —
// 0 = perky, 1 = fully parched — and continuously bends each silhouette.

import React from "react";
import { Circle, Ellipse, G, Path, Rect } from "react-native-svg";

export type Archetype =
  | "generic" | "monstera" | "sagittate" | "snake" | "spiky"
  | "zz" | "fern" | "palm" | "succulent" | "bush"
  | "cactus" | "pearls" | "tree" | "flower" | "herb"
  | "aloe" | "segments" | "broadtree" | "shoots";

export type LeafColors = {
  base: string;        // main foliage
  dark: string;        // shaded leaves / details
  light: string;       // highlight leaves
  stem: string;        // stems & veins
  bloom: string;       // flowering accent (petals)
  bloomCenter: string; // flower centers (gold, or dark for rudbeckia & co)
};

// -- shared leaf paths (drawn point-down, growing up from y=0) --------------
/** Broad teardrop leaf, height 45. */
const TEAR = "M0 0 C-11 -6 -14 -26 -7 -40 C-3 -47 3 -47 7 -40 C14 -26 11 -6 0 0 Z";
/** Monstera heart, height 50, with fenestration slits added separately. */
const HEART = "M0 0 C-19 -4 -27 -21 -19 -36 C-13 -48 -4 -52 0 -48 C4 -52 13 -48 19 -36 C27 -21 19 -4 0 0 Z";
const HEART_SLITS = "M-17 -31 L-5 -25 M17 -31 L5 -25 M-14 -13 L-4 -10 M14 -13 L4 -10";
/** Sagittate (pointed heart) leaf, height 25 — pothos & friends. */
const SAG = "M0 0 C-6 -7 -11 -11 -11 -17 C-11 -22 -7 -25 -3 -24 C-1 -23.5 0 -22 0 -21 C0 -22 1 -23.5 3 -24 C7 -25 11 -22 11 -17 C11 -11 6 -7 0 0 Z";
/** Fat pointed succulent leaf, height 26. */
const FAT = "M0 0 C-8 -5 -10 -16 -5 -23 C-2 -27 2 -27 5 -23 C10 -16 8 -5 0 0 Z";
/** Small oval leaflet, height 14 (zz, herbs, bushes). */
const OVAL = "M0 0 C-5 -3 -6 -9 -3 -12 C-1 -14 1 -14 3 -12 C6 -9 5 -3 0 0 Z";

/** Tapering blade of a given height (snake plants, spiky tufts, palms). */
const blade = (h: number, w: number) =>
  `M0 0 C${-w} ${-h * 0.32} ${-w} ${-h * 0.72} 0 ${-h} C${w} ${-h * 0.72} ${w} ${-h * 0.32} 0 0 Z`;

/** Blade whose tip reaches sideways — aloe's outward-curving spears. */
const curvedBlade = (h: number, w: number, bow: number) =>
  `M0 0 C${-w} ${-h * 0.35} ${-w + bow * 0.3} ${-h * 0.7} ${bow} ${-h} C${w + bow * 0.5} ${-h * 0.72} ${w} ${-h * 0.33} 0 0 Z`;

/** A hinged limb: stem + leaf swinging together from the attach point. */
function Limb({ angle, len, leaf, fill, stem, curl = 0 }: {
  angle: number; len: number; leaf: string; fill: string; stem: string; curl?: number;
}) {
  return (
    <G x={0} y={-46} rotation={angle} origin="0,0">
      <Path d={`M0 0 L0 ${-len}`} stroke={stem} strokeWidth={3.5} strokeLinecap="round" fill="none" />
      <G y={-len} rotation={curl} origin="0,0">
        <Path d={leaf} fill={fill} />
      </G>
    </G>
  );
}

// -- archetype renderers -----------------------------------------------------

function Generic(d: number, c: LeafColors) {
  return (
    <>
      <Limb angle={-26 - d * 58} len={16} leaf={TEAR} fill={c.base} stem={c.stem} curl={-d * 14} />
      <Limb angle={26 + d * 58} len={16} leaf={TEAR} fill={c.light} stem={c.stem} curl={d * 14} />
      <Limb angle={-d * 26} len={20} leaf={TEAR} fill={c.dark} stem={c.stem} curl={-d * 10} />
    </>
  );
}

function Monstera(d: number, c: LeafColors) {
  const leaf = (fill: string) => (
    <>
      <Path d={HEART} fill={fill} />
      <Path d={HEART_SLITS} stroke={c.stem} strokeWidth={3} strokeLinecap="round" fill="none" />
    </>
  );
  return (
    <>
      <G x={0} y={-46} rotation={-37 - d * 46} origin="0,0">
        <Path d="M0 0 L0 -22" stroke={c.stem} strokeWidth={3.5} strokeLinecap="round" fill="none" />
        <G y={-22} scale={0.92}>{leaf(c.base)}</G>
      </G>
      <G x={0} y={-46} rotation={35 + d * 46} origin="0,0">
        <Path d="M0 0 L0 -19" stroke={c.stem} strokeWidth={3.5} strokeLinecap="round" fill="none" />
        <G y={-19} scale={0.8}>{leaf(c.light)}</G>
      </G>
      <G x={0} y={-46} rotation={-d * 24} origin="0,0">
        <Path d="M0 0 L0 -24" stroke={c.stem} strokeWidth={3.5} strokeLinecap="round" fill="none" />
        <G y={-24}>{leaf(c.dark)}</G>
      </G>
    </>
  );
}

function Sagittate(d: number, c: LeafColors) {
  const vine = (side: 1 | -1, fills: [string, string]) => (
    <G scaleY={1 + d * 0.05}>
      <Path
        d={`M${18 * side} -44 C${33 * side} -35 ${36 * side} -20 ${31 * side} -5`}
        stroke={c.stem} strokeWidth={2.5} strokeLinecap="round" fill="none"
      />
      <G x={34 * side} y={-24} rotation={102 * side} origin="0,0" scale={0.8}><Path d={SAG} fill={fills[0]} /></G>
      <G x={32 * side} y={-4} rotation={145 * side} origin="0,0" scale={0.72}><Path d={SAG} fill={fills[1]} /></G>
    </G>
  );
  return (
    <>
      {vine(-1, [c.base, c.light])}
      {vine(1, [c.light, c.dark])}
      <G x={-13} y={-47} rotation={-38 - d * 30} origin="0,0" scale={1.35}><Path d={SAG} fill={c.base} /></G>
      <G x={13} y={-47} rotation={38 + d * 30} origin="0,0" scale={1.35}><Path d={SAG} fill={c.light} /></G>
      <G x={-4} y={-49} rotation={-12 - d * 18} origin="0,0" scale={1.5}><Path d={SAG} fill={c.dark} /></G>
      <G x={6} y={-48} rotation={14 + d * 22} origin="0,0" scale={1.3}><Path d={SAG} fill={c.base} /></G>
    </>
  );
}

/** Snake plant — wide flat blades packed close together. */
function Snake(d: number, c: LeafColors) {
  const blades: [number, number, number, string][] = [
    [-15, -11, 54, c.light], [15, 11, 58, c.light],
    [-8, -5, 70, c.base], [8, 5, 74, c.base],
    [-3, -1, 84, c.dark], [4, 2, 64, c.base],
  ];
  return (
    <>
      {blades.map(([x, rot, h, fill], i) => (
        <G key={i} x={x} y={-44} rotation={rot + Math.sign(rot || 1) * d * 20} origin="0,0">
          <Path d={blade(h, 6.5)} fill={fill} />
        </G>
      ))}
    </>
  );
}

/** Thin arching blades from a tuft — dracaena, spider plant, pineapple top. */
function Spiky(d: number, c: LeafColors) {
  const blades: [number, number, string][] = [
    [-64, 46, c.light], [64, 48, c.light], [-40, 62, c.base],
    [40, 64, c.base], [-16, 76, c.dark], [16, 72, c.dark], [0, 82, c.base],
  ];
  return (
    <>
      {blades.map(([rot, h, fill], i) => (
        <G key={i} x={0} y={-44} rotation={rot * (0.55 + d * 0.5)} origin="0,0">
          <Path d={blade(h, 3.2)} fill={fill} />
        </G>
      ))}
    </>
  );
}

/** Green onions & chives: bolt-upright hollow blades, one with a folded tip. */
function Shoots(d: number, c: LeafColors) {
  const straights: [number, number, number, string][] = [
    [-10, -3, 56, c.light], [10, 3, 60, c.light],
    [-5, -1.5, 72, c.base], [5, 1.5, 76, c.base], [0, 0.5, 84, c.dark],
  ];
  const lean = 1 + d * 8; // parched onions flop outward
  return (
    <>
      {straights.map(([x, rot, h, fill], i) => (
        <G key={i} x={x} y={-44} rotation={rot * lean} origin="0,0">
          <Path d={blade(h, 2.4)} fill={fill} />
        </G>
      ))}
      {/* the one that always bends */}
      <G x={-2} y={-44} rotation={-2 * lean} origin="0,0">
        <Path d={blade(52, 2.4)} fill={c.base} />
        <G y={-50} rotation={54 + d * 30} origin="0,0">
          <Path d={blade(20, 2)} fill={c.dark} />
        </G>
      </G>
    </>
  );
}

function Zz(d: number, c: LeafColors) {
  const stemWithLeaflets = (angle: number, len: number, fill: string) => (
    <G x={0} y={-46} rotation={angle} origin="0,0">
      <Path d={`M0 0 C0 ${-len * 0.5} 0 ${-len * 0.8} 0 ${-len}`} stroke={c.stem} strokeWidth={3} strokeLinecap="round" fill="none" />
      {[0.35, 0.55, 0.75, 0.95].map((t, i) => (
        <G key={i}>
          <G x={-2} y={-len * t} rotation={-42} origin="0,0"><Path d={OVAL} fill={fill} /></G>
          <G x={2} y={-len * t} rotation={42} origin="0,0"><Path d={OVAL} fill={i % 2 ? c.light : fill} /></G>
        </G>
      ))}
    </G>
  );
  return (
    <>
      {stemWithLeaflets(-16 - d * 28, 62, c.base)}
      {stemWithLeaflets(16 + d * 28, 56, c.light)}
      {stemWithLeaflets(-d * 16, 72, c.dark)}
    </>
  );
}

/** True pinnate fronds: a midrib with little leaflets marching up each side. */
function Fern(d: number, c: LeafColors) {
  const frond = (rot: number, h: number, fill: string, key: number) => {
    const steps = [0.14, 0.26, 0.38, 0.5, 0.62, 0.74, 0.85, 0.95];
    return (
      <G key={key} x={0} y={-44} rotation={rot * (1 + d * 0.45)} origin="0,0">
        <Path d={`M0 0 C1 ${-h * 0.4} 3 ${-h * 0.75} 5 ${-h}`} stroke={c.stem} strokeWidth={1.8} strokeLinecap="round" fill="none" />
        {steps.map((t, i) => {
          const size = 1 - t * 0.55;
          const x = t * 4;
          return (
            <G key={i}>
              <Ellipse cx={x - 5 * size} cy={-h * t} rx={5.6 * size} ry={2.6 * size} fill={fill} rotation={-24} origin={`${x - 5 * size},${-h * t}`} />
              <Ellipse cx={x + 5 * size} cy={-h * t - 2 * size} rx={5.6 * size} ry={2.6 * size} fill={fill} rotation={24} origin={`${x + 5 * size},${-h * t - 2 * size}`} />
            </G>
          );
        })}
      </G>
    );
  };
  const fronds: [number, number, string][] = [
    [-62, 42, c.light], [62, 44, c.light], [-42, 56, c.base],
    [42, 58, c.base], [-22, 68, c.dark], [22, 66, c.dark], [0, 74, c.base],
  ];
  return <>{fronds.map(([r, h, f], i) => frond(r, h, f, i))}</>;
}

function Palm(d: number, c: LeafColors) {
  const frond = (rot: number, fill: string, i: number) => (
    <G key={i} x={0} y={-70} rotation={rot + Math.sign(rot || 1) * d * 24} origin="0,0">
      <Path d="M0 0 C-6 -14 -18 -24 -33 -26 C-18 -32 -5 -23 0 -9 C5 -23 18 -32 33 -26 C18 -24 6 -14 0 0 Z" fill={fill} />
    </G>
  );
  return (
    <>
      <Path d="M-3 -44 C-3 -54 -2 -62 0 -70 C2 -62 3 -54 3 -44 Z" fill="#9a7a52" />
      {frond(-52, c.light, 0)}
      {frond(52, c.light, 1)}
      {frond(-22, c.base, 2)}
      {frond(22, c.base, 3)}
      {frond(0, c.dark, 4)}
    </>
  );
}

/**
 * Aloe — fleshy spears that rise then REACH outward, a loose whorl.
 * Distinct from snake (straight) and succulent (low rosette).
 */
function Aloe(d: number, c: LeafColors) {
  const spears: [number, number, number, number, string][] = [
    // [rotation, height, width, bow, fill]
    [-26, 42, 7.5, -15, c.light], [26, 44, 7.5, 15, c.light],
    [-15, 58, 8.5, -18, c.base], [15, 60, 8.5, 18, c.base],
    [-6, 70, 9, -12, c.dark], [7, 68, 9, 13, c.base], [0, 76, 8.5, 5, c.dark],
  ];
  return (
    <>
      {spears.map(([rot, h, w, bow, fill], i) => (
        <G key={i} x={0} y={-44} rotation={rot * (1 + d * 0.5)} origin="0,0">
          <Path d={curvedBlade(h, w, bow * (1 + d * 0.4))} fill={fill} />
          <Path d={`M0 ${-h * 0.15} C${bow * 0.2} ${-h * 0.4} ${bow * 0.5} ${-h * 0.55} ${bow * 0.8} ${-h * 0.75}`} stroke={c.light} strokeWidth={1.3} strokeLinecap="round" fill="none" opacity={0.65} />
        </G>
      ))}
    </>
  );
}

/** Echeveria-style rosette of fat leaves. Succulents barely droop. */
function Succulent(d: number, c: LeafColors) {
  const ring = (angles: number[], fill: string, scale: number) =>
    angles.map((a, i) => (
      <G key={fill + i} x={0} y={-44} rotation={a + Math.sign(a || 1) * d * 10} origin="0,0" scale={scale}>
        <Path d={FAT} fill={fill} />
      </G>
    ));
  return (
    <>
      {ring([-78, -48, 48, 78], c.light, 1.4)}
      {ring([-62, 62], c.base, 1.45)}
      {ring([-28, 28], c.base, 1.4)}
      {ring([-10, 10], c.dark, 1.25)}
      <Circle cx={0} cy={-52} r={5.5} fill={c.stem} />
    </>
  );
}

/** Rounded-leaf cluster — jade, pilea, peperomia, bushy veggies. */
function Bush(d: number, c: LeafColors) {
  const leaves: [number, number, number, string][] = [
    [-20, -62, 8, c.light], [20, -60, 8, c.light], [-11, -72, 9, c.base],
    [12, -71, 9, c.base], [0, -79, 10, c.dark], [-24, -50, 7, c.base],
    [24, -49, 7, c.dark], [0, -60, 9, c.base],
  ];
  return (
    <>
      <Path d="M0 -44 L0 -58 M-4 -46 L-16 -56 M4 -46 L16 -55" stroke={c.stem} strokeWidth={2.5} strokeLinecap="round" fill="none" />
      {leaves.map(([x, y, r, fill], i) => (
        <Ellipse key={i} cx={x} cy={y + d * 7} rx={r} ry={r * 1.15} fill={fill} />
      ))}
    </>
  );
}

/** Columnar cactus with one arm. Cacti sulk by leaning, not wilting. */
function Cactus(d: number, c: LeafColors) {
  return (
    <G rotation={d * 7} origin="0,-40">
      <Path d="M-15 -38 L-15 -81 A15 15 0 0 1 15 -81 L15 -38 Z" fill={c.base} />
      <Path d="M-40 -68 A6.5 6.5 0 0 1 -27 -68 L-27 -50 L-40 -50 Z" fill={c.base} />
      <Path d="M-38 -59 L-15 -59 L-15 -48 L-38 -48 Z" fill={c.base} />
      <Path d="M-7 -84 L-7 -44 M0 -88 L0 -42 M7 -84 L7 -44" stroke={c.dark} strokeWidth={2} strokeLinecap="round" fill="none" />
      <Circle cx={0} cy={-101} r={3.2} fill={c.bloom} opacity={1 - d * 0.7} />
      <Circle cx={-5.5} cy={-97} r={3} fill={c.bloom} opacity={1 - d * 0.7} />
      <Circle cx={5.5} cy={-97} r={3} fill={c.bloom} opacity={1 - d * 0.7} />
      <Circle cx={0} cy={-97} r={2.6} fill={c.bloomCenter} opacity={1 - d * 0.7} />
    </G>
  );
}

/** Christmas/holiday cactus: arching chains of flat rectangular segments. */
function Segments(d: number, c: LeafColors) {
  const chain = (a0: number, bend: number, count: number, fill: string, tipBloom: boolean, key: number) => {
    const segs: React.ReactNode[] = [];
    let px = a0 > 0 ? 8 : a0 < 0 ? -8 : 0;
    let py = -48;
    let ang = a0;
    for (let i = 0; i < count; i++) {
      const rad = (ang * Math.PI) / 180;
      const cx = px + 5.5 * Math.sin(rad);
      const cy = py - 5.5 * Math.cos(rad);
      segs.push(
        <G key={`${key}-${i}`} x={cx} y={cy} rotation={ang} origin="0,0">
          <Rect x={-3.6} y={-6} width={7.2} height={12} rx={3.2} fill={i % 2 ? fill : c.light} />
        </G>,
      );
      px = px + 11 * Math.sin(rad);
      py = py - 11 * Math.cos(rad);
      ang += bend * (1 + d * 0.9);
    }
    if (tipBloom) {
      segs.push(
        <G key={`${key}-b`} x={px} y={py}>
          <Circle cx={-2.5} cy={-2} r={2.6} fill={c.bloom} opacity={1 - d * 0.6} />
          <Circle cx={2.5} cy={-2} r={2.6} fill={c.bloom} opacity={1 - d * 0.6} />
          <Circle cx={0} cy={-4.5} r={2.6} fill={c.bloom} opacity={1 - d * 0.6} />
        </G>,
      );
    }
    return segs;
  };
  return (
    <>
      {chain(-24, -16, 4, c.base, true, 0)}
      {chain(-6, -9, 5, c.dark, false, 1)}
      {chain(8, 10, 5, c.base, true, 2)}
      {chain(28, 17, 4, c.dark, true, 3)}
    </>
  );
}

/** Cloud-canopy tree — weeping fig, money tree, bay laurel. */
function Tree(d: number, c: LeafColors) {
  return (
    <>
      <Path d="M-5 -42 C-5 -58 -3 -70 0 -80 C3 -70 5 -58 5 -42 Z" fill="#8a6a48" />
      <Path d="M0 -66 C-6 -71 -12 -74 -17 -76" stroke="#8a6a48" strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <Path d="M0 -71 C6 -76 11 -79 16 -81" stroke="#8a6a48" strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <G y={d * 8}>
        <Ellipse cx={-19} cy={-80 + d * 4} rx={13} ry={14} fill={c.light} />
        <Ellipse cx={19} cy={-82 + d * 4} rx={13} ry={15} fill={c.base} />
        <Ellipse cx={0} cy={-96 + d * 6} rx={15} ry={16} fill={c.dark} />
        <Ellipse cx={-8} cy={-84} rx={13} ry={14} fill={c.base} />
        <Ellipse cx={9} cy={-88} rx={12} ry={13} fill={c.light} />
      </G>
    </>
  );
}

/** Rubber plant & fiddle-leaf: a trunk with BIG oblong leaves, not a cloud. */
function Broadtree(d: number, c: LeafColors) {
  const leaves: [number, number, number, number, string][] = [
    // [trunkY, side, rotation, size, fill]
    [-58, -1, -52, 0.85, c.light], [-64, 1, 50, 0.9, c.base],
    [-72, -1, -40, 1, c.base], [-80, 1, 38, 1, c.light],
    [-88, -1, -24, 1.05, c.dark], [-93, 1, 18, 0.95, c.base],
  ];
  return (
    <>
      <Path d="M-4.5 -42 C-4.5 -60 -3 -78 0 -94 C3 -78 4.5 -60 4.5 -42 Z" fill="#8a6a48" />
      {leaves.map(([y, side, rot, size, fill], i) => (
        <G key={i} x={side * 3} y={y} rotation={rot + side * d * 34} origin="0,0">
          <Path d={`M0 0 L0 ${-6}`} stroke={c.stem} strokeWidth={2} strokeLinecap="round" fill="none" />
          <Ellipse cx={0} cy={-6 - 13 * size} rx={7 * size} ry={14 * size} fill={fill} />
          <Path d={`M0 ${-8} L0 ${-6 - 24 * size}`} stroke={c.stem} strokeWidth={1.2} strokeLinecap="round" fill="none" opacity={0.6} />
        </G>
      ))}
      <G x={0} y={-96} rotation={-d * 20} origin="0,0">
        <Ellipse cx={0} cy={-11} rx={6.5} ry={12} fill={c.dark} />
      </G>
    </>
  );
}

function Flower(d: number, c: LeafColors) {
  const bloom = (angle: number, len: number, scale: number, key: number) => (
    <G key={key} x={0} y={-46} rotation={angle + Math.sign(angle || 1) * d * 46} origin="0,0">
      <Path d={`M0 0 C0 ${-len * 0.6} 0 ${-len * 0.8} 0 ${-len}`} stroke={c.stem} strokeWidth={2.6} strokeLinecap="round" fill="none" />
      <G y={-len} scale={scale}>
        {[0, 72, 144, 216, 288].map((a) => (
          <Circle key={a} cx={5.2 * Math.sin((a * Math.PI) / 180)} cy={-5.2 * Math.cos((a * Math.PI) / 180)} r={3.6} fill={c.bloom} />
        ))}
        <Circle cx={0} cy={0} r={3.1} fill={c.bloomCenter} />
      </G>
    </G>
  );
  return (
    <>
      <G x={-9} y={-46} rotation={-42 - d * 20} origin="0,0"><Path d={TEAR} fill={c.base} scale={0.62} /></G>
      <G x={9} y={-46} rotation={42 + d * 20} origin="0,0"><Path d={TEAR} fill={c.light} scale={0.62} /></G>
      {bloom(-27, 40, 0.95, 0)}
      {bloom(28, 36, 0.8, 1)}
      {bloom(0, 56, 1.1, 2)}
    </>
  );
}

function Herb(d: number, c: LeafColors) {
  const sprig = (angle: number, len: number, fill: string, key: number) => (
    <G key={key} x={0} y={-46} rotation={angle + Math.sign(angle || 1) * d * 30} origin="0,0">
      <Path d={`M0 0 L0 ${-len}`} stroke={c.stem} strokeWidth={2} strokeLinecap="round" fill="none" />
      {[0.45, 0.7, 0.95].map((t, i) => (
        <G key={i}>
          <G x={-1.5} y={-len * t} rotation={-48} origin="0,0" scale={0.72}><Path d={OVAL} fill={fill} /></G>
          <G x={1.5} y={-len * t} rotation={48} origin="0,0" scale={0.72}><Path d={OVAL} fill={i % 2 ? c.light : fill} /></G>
        </G>
      ))}
    </G>
  );
  return (
    <>
      {sprig(-30, 40, c.base, 0)}
      {sprig(30, 42, c.base, 1)}
      {sprig(-13, 52, c.light, 2)}
      {sprig(13, 50, c.dark, 3)}
      {sprig(0, 58, c.base, 4)}
    </>
  );
}

/** Strings of beads spilling over the pot — string-of-pearls & kin. */
function Pearls(d: number, c: LeafColors) {
  const strand = (side: 1 | -1, sway: number, len: number, fill: string) => {
    const beads = [0.15, 0.35, 0.55, 0.75, 0.95];
    const x = (t: number) => side * (28 + sway * t + 8 * t * t);
    const y = (t: number) => -50 + len * (1 + d * 0.08) * t;
    return (
      <>
        <Path
          d={`M${side * 22} -52 C${x(0.35)} ${y(0.35)} ${x(0.7)} ${y(0.7)} ${x(1)} ${y(1)}`}
          stroke={c.stem} strokeWidth={2} strokeLinecap="round" fill="none"
        />
        {beads.map((t, i) => <Circle key={i} cx={x(t)} cy={y(t)} r={4} fill={i % 2 ? fill : c.light} />)}
      </>
    );
  };
  return (
    <>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <Circle key={i} cx={-18 + t * 36} cy={-53 - (i % 2) * 6} r={5} fill={i % 2 ? c.dark : c.base} />
      ))}
      {strand(-1, 6, 50, c.base)}
      {strand(-1, 1, 38, c.dark)}
      {strand(1, 5, 48, c.base)}
      {strand(1, 0, 36, c.dark)}
    </>
  );
}

export const ARCHETYPES: Record<Archetype, (d: number, c: LeafColors) => React.ReactNode> = {
  generic: Generic, monstera: Monstera, sagittate: Sagittate, snake: Snake,
  spiky: Spiky, zz: Zz, fern: Fern, palm: Palm, succulent: Succulent,
  bush: Bush, cactus: Cactus, pearls: Pearls, tree: Tree, flower: Flower,
  herb: Herb, aloe: Aloe, segments: Segments, broadtree: Broadtree, shoots: Shoots,
};
