// Flat-cute pet sprites — same sticker style as the plants, tintable.
// Chicken, cat (with tabby stripes!), dog, bird, rabbit, and a generic pal.

import React from "react";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import { shade } from "./color";

export const PET_TINTS = [
  "#d99a56", // tabby orange
  "#a9794f", // hen brown
  "#9a9a94", // gray
  "#565550", // soot
  "#efe3cb", // cream
  "#f7f4ec", // snow
  "#e2b25c", // golden
  "#e2a7a0", // blossom
];

const DEFAULT_TINT: Record<string, string> = {
  chicken: "#d99a56",
  cat: "#d99a56",
  dog: "#e2b25c",
  bird: "#7fb6d9",
  rabbit: "#cfc3ad",
};

export type PetSpriteProps = {
  kind: string; // chicken | cat | dog | bird | rabbit | anything else
  tint?: string;
  size?: number; // rendered height
};

/** viewBox: ground at y=0, pet grows upward. */
const VB = "-40 -78 80 84";
const RATIO = 80 / 84;

export default function PetSprite({ kind, tint, size = 56 }: PetSpriteProps) {
  const base = tint ?? DEFAULT_TINT[kind] ?? "#e2a7a0";
  const dark = shade(base, -0.24);
  const light = shade(base, 0.22);
  const face = shade(base, -0.55);
  const c = { base, dark, light, face };

  return (
    <Svg width={size * RATIO} height={size} viewBox={VB}>
      <Ellipse cx={0} cy={2} rx={26} ry={4.5} fill="#000000" opacity={0.08} />
      {kind === "chicken" ? (
        <Chicken {...c} />
      ) : kind === "cat" ? (
        <Cat {...c} />
      ) : kind === "dog" ? (
        <Dog {...c} />
      ) : kind === "bird" ? (
        <Bird {...c} />
      ) : kind === "rabbit" ? (
        <Rabbit {...c} />
      ) : (
        <Blob {...c} />
      )}
    </Svg>
  );
}

type C = { base: string; dark: string; light: string; face: string };

function Chicken({ base, dark, light, face }: C) {
  return (
    <>
      {/* tail feathers */}
      <Ellipse cx={-20} cy={-34} rx={6} ry={11} fill={dark} rotation={-28} origin="-20,-34" />
      <Ellipse cx={-24} cy={-28} rx={5} ry={9} fill={base} rotation={-40} origin="-24,-28" />
      {/* body */}
      <Path d="M-24 -18 C-26 -34 -12 -44 4 -42 C18 -40 26 -30 24 -17 C22 -6 10 0 -2 0 C-14 0 -22 -8 -24 -18 Z" fill={base} />
      {/* wing */}
      <Ellipse cx={-4} cy={-18} rx={11} ry={7.5} fill={light} rotation={-18} origin="-4,-18" />
      {/* head */}
      <Circle cx={13} cy={-46} r={11.5} fill={base} />
      {/* comb */}
      <Circle cx={8} cy={-58} r={3.4} fill="#cf6a5b" />
      <Circle cx={14} cy={-60} r={3.8} fill="#cf6a5b" />
      <Circle cx={20} cy={-57} r={3.2} fill="#cf6a5b" />
      {/* beak + wattle */}
      <Path d="M24 -47 L31 -44.5 L24 -42 Z" fill="#e8a13c" />
      <Circle cx={22} cy={-40} r={2.6} fill="#cf6a5b" />
      {/* eye */}
      <Circle cx={17} cy={-48} r={2.2} fill={face} />
      {/* legs */}
      <Path d="M-4 0 L-4 -4 M6 0 L6 -4" stroke="#c98f3f" strokeWidth={2.4} strokeLinecap="round" fill="none" />
    </>
  );
}

function Cat({ base, dark, light, face }: C) {
  return (
    <>
      {/* tail curled around */}
      <Path d="M20 -6 C30 -4 32 -14 27 -20" stroke={base} strokeWidth={6.5} strokeLinecap="round" fill="none" />
      <Path d="M27.5 -19 C25 -22 26 -24 27.5 -25" stroke={dark} strokeWidth={6.5} strokeLinecap="round" fill="none" />
      {/* sitting body */}
      <Path d="M-16 0 C-20 -14 -14 -28 0 -30 C14 -28 20 -14 16 0 Z" fill={base} />
      {/* chest */}
      <Ellipse cx={0} cy={-9} rx={8} ry={10} fill={light} />
      {/* back stripes */}
      <Path d="M-14 -16 C-11 -18 -8 -18 -5 -17 M-15 -9 C-12 -11 -9 -11 -6 -10" stroke={dark} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      {/* head */}
      <Circle cx={0} cy={-42} r={14} fill={base} />
      {/* ears */}
      <Path d="M-13 -50 L-11 -62 L-3 -53 Z" fill={base} />
      <Path d="M13 -50 L11 -62 L3 -53 Z" fill={base} />
      <Path d="M-10.5 -52 L-9.5 -58 L-5.5 -53.5 Z" fill="#e2a7a0" />
      <Path d="M10.5 -52 L9.5 -58 L5.5 -53.5 Z" fill="#e2a7a0" />
      {/* tabby forehead stripes */}
      <Path d="M-4 -54 L-4 -49 M0 -55.5 L0 -50 M4 -54 L4 -49" stroke={dark} strokeWidth={2.2} strokeLinecap="round" fill="none" />
      {/* cheek stripes */}
      <Path d="M-14 -42 L-9 -41.5 M14 -42 L9 -41.5" stroke={dark} strokeWidth={2} strokeLinecap="round" fill="none" />
      {/* face */}
      <Circle cx={-5} cy={-43} r={2.1} fill={face} />
      <Circle cx={5} cy={-43} r={2.1} fill={face} />
      <Path d="M-1.6 -38.5 L1.6 -38.5 L0 -36.6 Z" fill="#d98a94" />
      <Path d="M0 -36.6 L0 -35 M0 -35 C-1.5 -33.5 -3.5 -33.8 -4.5 -35 M0 -35 C1.5 -33.5 3.5 -33.8 4.5 -35" stroke={face} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </>
  );
}

function Dog({ base, dark, light, face }: C) {
  return (
    <>
      {/* wagging tail */}
      <Path d="M18 -8 C26 -12 28 -20 24 -26" stroke={base} strokeWidth={6} strokeLinecap="round" fill="none" />
      {/* sitting body */}
      <Path d="M-17 0 C-21 -14 -14 -29 0 -31 C14 -29 21 -14 17 0 Z" fill={base} />
      <Ellipse cx={0} cy={-9} rx={8.5} ry={10} fill={light} />
      {/* head */}
      <Circle cx={0} cy={-44} r={14.5} fill={base} />
      {/* floppy ears */}
      <Ellipse cx={-14} cy={-46} rx={5.5} ry={10.5} fill={dark} rotation={12} origin="-14,-46" />
      <Ellipse cx={14} cy={-46} rx={5.5} ry={10.5} fill={dark} rotation={-12} origin="14,-46" />
      {/* muzzle */}
      <Ellipse cx={0} cy={-38} rx={7} ry={5.5} fill={light} />
      <Ellipse cx={0} cy={-41.5} rx={3} ry={2.3} fill={face} />
      {/* eyes + mouth */}
      <Circle cx={-5.5} cy={-47} r={2.2} fill={face} />
      <Circle cx={5.5} cy={-47} r={2.2} fill={face} />
      <Path d="M-3 -36 Q0 -33.5 3 -36" stroke={face} strokeWidth={1.7} strokeLinecap="round" fill="none" />
      {/* brow patch */}
      <Circle cx={-5.5} cy={-51.5} r={1.4} fill={light} />
    </>
  );
}

function Bird({ base, dark, light, face }: C) {
  return (
    <>
      {/* tail */}
      <Path d="M-14 -18 L-26 -12 M-14 -16 L-25 -8" stroke={dark} strokeWidth={3} strokeLinecap="round" fill="none" />
      {/* body (round, head merged) */}
      <Circle cx={2} cy={-20} r={16} fill={base} />
      <Ellipse cx={-2} cy={-16} rx={9} ry={7} fill={light} />
      {/* wing */}
      <Ellipse cx={7} cy={-18} rx={8} ry={5.5} fill={dark} rotation={-24} origin="7,-18" />
      {/* beak */}
      <Path d="M16 -24 L23 -21.5 L16 -19 Z" fill="#e8a13c" />
      {/* eye */}
      <Circle cx={10} cy={-26} r={2} fill={face} />
      {/* feet */}
      <Path d="M-2 -4 L-2 0 M6 -4 L6 0" stroke="#c98f3f" strokeWidth={2} strokeLinecap="round" fill="none" />
    </>
  );
}

function Rabbit({ base, dark, light, face }: C) {
  return (
    <>
      {/* body */}
      <Path d="M-16 0 C-19 -12 -13 -24 0 -26 C13 -24 19 -12 16 0 Z" fill={base} />
      <Ellipse cx={0} cy={-8} rx={8} ry={9} fill={light} />
      {/* tail puff */}
      <Circle cx={-16} cy={-6} r={4.5} fill={light} />
      {/* head */}
      <Circle cx={0} cy={-36} r={12.5} fill={base} />
      {/* upright ears */}
      <Ellipse cx={-6} cy={-56} rx={4.2} ry={12} fill={base} rotation={-8} origin="-6,-56" />
      <Ellipse cx={6} cy={-56} rx={4.2} ry={12} fill={base} rotation={8} origin="6,-56" />
      <Ellipse cx={-6} cy={-55} rx={2} ry={8.5} fill="#e2a7a0" rotation={-8} origin="-6,-55" />
      <Ellipse cx={6} cy={-55} rx={2} ry={8.5} fill="#e2a7a0" rotation={8} origin="6,-55" />
      {/* face */}
      <Circle cx={-4.5} cy={-37} r={2} fill={face} />
      <Circle cx={4.5} cy={-37} r={2} fill={face} />
      <Path d="M-1.4 -33.5 L1.4 -33.5 L0 -31.8 Z" fill="#d98a94" />
      <Path d="M0 -31.8 L0 -30.4 M0 -30.4 C-1.4 -29 -3 -29.3 -3.8 -30.3 M0 -30.4 C1.4 -29 3 -29.3 3.8 -30.3" stroke={face} strokeWidth={1.5} strokeLinecap="round" fill="none" />
    </>
  );
}

function Blob({ base, dark, light, face }: C) {
  return (
    <>
      <Path d="M-18 0 C-22 -16 -12 -30 0 -30 C12 -30 22 -16 18 0 Z" fill={base} />
      <Ellipse cx={0} cy={-8} rx={9} ry={9} fill={light} />
      {/* nubby ears */}
      <Circle cx={-10} cy={-29} r={4.5} fill={dark} />
      <Circle cx={10} cy={-29} r={4.5} fill={dark} />
      <Circle cx={-4.5} cy={-20} r={2.1} fill={face} />
      <Circle cx={4.5} cy={-20} r={2.1} fill={face} />
      <Path d="M-3 -15.5 Q0 -13 3 -15.5" stroke={face} strokeWidth={1.7} strokeLinecap="round" fill="none" />
    </>
  );
}
