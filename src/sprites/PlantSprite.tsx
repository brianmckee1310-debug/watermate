// The flat-cute plant sprite: foliage archetype + kawaii pot + mood.
// Pure react-native-svg, no assets. Both the leaf color and pot color are
// tintable; shading is derived so one hex drives the whole palette.

import React from "react";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import { ARCHETYPES, type Archetype, type LeafColors } from "./archetypes";
import { archetypeFor } from "./speciesMap";
import { bloomCenterFor, bloomFor, greenFor, mix, shade } from "./color";

export type Mood = "watered" | "thriving" | "thirsty" | "parched";

/** Droop per mood — feeds the archetype posture engine. */
const DROOP: Record<Mood, number> = { watered: 0, thriving: 0.06, thirsty: 0.5, parched: 1 };

/** viewBox shared by all sprites; keep in sync with archetype extents. */
export const SPRITE_VB = "-48 -130 96 140";
export const SPRITE_RATIO = 96 / 140; // width / height

const DRY_LEAF = "#b3a05f";
const SPARKLE = "M0 -6 L1.7 -1.7 L6 0 L1.7 1.7 L0 6 L-1.7 1.7 L-6 0 L-1.7 -1.7 Z";
const DROP = "M0 0 C2.8 3.5 4.5 6 4.5 8.5 A4.5 4.5 0 1 1 -4.5 8.5 C-4.5 6 -2.8 3.5 0 0 Z";

function Face({ mood, color }: { mood: Mood; color: string }) {
  const stroke = { stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, fill: "none" as const };
  return (
    <>
      {mood === "watered" ? (
        <>
          <Path d="M-13 -26 Q-10 -23 -7 -26 M7 -26 Q10 -23 13 -26" {...stroke} />
          <Ellipse cx={-15} cy={-19.5} rx={3} ry={1.8} fill="#e8a1a1" opacity={0.6} />
          <Ellipse cx={15} cy={-19.5} rx={3} ry={1.8} fill="#e8a1a1" opacity={0.6} />
          <Path d="M-4 -17 Q0 -13 4 -17" {...stroke} />
        </>
      ) : mood === "thriving" ? (
        <>
          <Path d="M-13 -24 Q-10 -27 -7 -24 M7 -24 Q10 -27 13 -24" {...stroke} />
          <Path d="M-5 -18 Q0 -13 5 -18" {...stroke} />
        </>
      ) : mood === "thirsty" ? (
        <>
          <Circle cx={-10} cy={-24} r={2.6} fill={color} />
          <Circle cx={10} cy={-24} r={2.6} fill={color} />
          <Path d="M-5 -16 L5 -16" {...stroke} />
        </>
      ) : (
        <>
          <Circle cx={-10} cy={-24} r={2.6} fill={color} />
          <Circle cx={10} cy={-24} r={2.6} fill={color} />
          <Path d="M-5 -15 Q-2.5 -18 0 -15 Q2.5 -12 5 -15" {...stroke} />
        </>
      )}
    </>
  );
}

function Extras({ mood }: { mood: Mood }) {
  if (mood === "thriving") {
    return (
      <>
        <G x={-34} y={-86}><Path d={SPARKLE} fill="#f2c94c" /></G>
        <G x={32} y={-98} scale={0.8}><Path d={SPARKLE} fill="#f2c94c" /></G>
      </>
    );
  }
  if (mood === "watered") {
    return (
      <>
        <G x={-32} y={-92} scale={0.8}><Path d={DROP} fill="#7fb6d9" /></G>
        <G x={36} y={-78} scale={0.7}><Path d={DROP} fill="#7fb6d9" /></G>
        <G x={32} y={-100} scale={0.6}><Path d={SPARKLE} fill="#a8d4ee" /></G>
      </>
    );
  }
  if (mood === "thirsty") {
    return <G x={30} y={-92} scale={0.9}><Path d={DROP} fill="#7fb6d9" /></G>;
  }
  return (
    <>
      <Path d="M-44 -74 L-38 -72 M-41 -66 L-35 -65" stroke="#c9a876" strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path d="M38 -70 L44 -68 M36 -62 L42 -61" stroke="#c9a876" strokeWidth={2} strokeLinecap="round" fill="none" />
    </>
  );
}

export type PlantSpriteProps = {
  /** Species id — picks the silhouette (with `tags` as fallback). */
  speciesId: string;
  tags?: string[];
  /** Explicit override; normally derived from speciesId. */
  archetype?: Archetype;
  mood?: Mood;
  /** Foliage hex. Defaults to a stable "random" green from colorSeed. */
  leafColor?: string;
  /** Pot hex. Defaults to terracotta. */
  potColor?: string;
  /** Seed for the default green (use the plant's own id so twins differ). */
  colorSeed?: string;
  /** Rendered height in px. Width follows the sprite ratio. */
  size?: number;
  /** Hide the kawaii face (e.g. tiny list thumbnails). */
  noFace?: boolean;
};

export default function PlantSprite({
  speciesId,
  tags,
  archetype,
  mood = "thriving",
  leafColor,
  potColor = "#c97b5d",
  colorSeed,
  size = 72,
  noFace,
}: PlantSpriteProps) {
  const kind = archetype ?? archetypeFor(speciesId, tags);
  const d = DROOP[mood];

  let base = leafColor ?? greenFor(colorSeed ?? speciesId);
  if (mood === "parched") base = mix(base, DRY_LEAF, 0.5);
  const colors: LeafColors = {
    base,
    dark: shade(base, -0.22),
    light: shade(base, 0.16),
    stem: shade(base, -0.34),
    bloom: bloomFor(speciesId),
    bloomCenter: bloomCenterFor(speciesId),
  };
  const rim = shade(potColor, -0.14);
  const faceColor = shade(potColor, -0.52);

  return (
    <Svg width={size * SPRITE_RATIO} height={size} viewBox={SPRITE_VB}>
      <Ellipse cx={0} cy={3} rx={30} ry={5} fill="#000000" opacity={0.08} />
      {ARCHETYPES[kind](d, colors)}
      <Path d="M-32 -40 L32 -40 L26 -6 Q25 0 18 0 L-18 0 Q-25 0 -26 -6 Z" fill={potColor} />
      <Rect x={-36} y={-54} width={72} height={15} rx={7} fill={rim} />
      {!noFace && <Face mood={mood} color={faceColor} />}
      <Extras mood={mood} />
    </Svg>
  );
}
