import PlantSprite from "./sprites/PlantSprite";
import PetSprite from "./sprites/PetSprite";
import type { Mood, Thing } from "./logic";
import { speciesById } from "./seed";

/** The hydroponics tower: a little blue reservoir with sprouts and the same pot face. */
function HydroSprite({ mood, size }: { mood: Mood; size: number }) {
  const low = mood === "thirsty" || mood === "parched";
  const level = mood === "parched" ? 8 : low ? 14 : 26;
  const leaf = mood === "parched" ? "#a8a56a" : "#6fa05c";
  return (
    <svg width={size * (96 / 140)} height={size} viewBox="-48 -130 96 140" style={{ display: "block", overflow: "visible" }}>
      <ellipse cx={0} cy={3} rx={32} ry={5} fill="#000" opacity={0.08} />
      {[-22, 0, 22].map((x, i) => (
        <g key={x} transform={`translate(${x} -54) rotate(${low ? (i - 1) * 16 : (i - 1) * 6})`}>
          <path d="M0 0 L0 -26" stroke="#4e7c42" strokeWidth={3.5} strokeLinecap="round" />
          <path d="M0 -22 C-14 -26 -16 -44 -6 -52 C-2 -40 2 -30 0 -22 Z" fill={leaf} />
          <path d="M0 -22 C14 -26 16 -44 6 -52 C2 -40 -2 -30 0 -22 Z" fill={i === 1 ? "#87b46e" : leaf} />
        </g>
      ))}
      <rect x={-38} y={-58} width={76} height={12} rx={6} fill="#8795a0" />
      <rect x={-34} y={-48} width={68} height={48} rx={10} fill="#dfeef6" />
      <rect x={-34} y={-level - 2} width={68} height={level + 2} rx={8} fill="#8cc3e3" />
      <path d="M-13 -30 Q-10 -33 -7 -30 M7 -30 Q10 -33 13 -30" stroke="#3a6f8a" strokeWidth={2} strokeLinecap="round" fill="none" />
      {low ? <path d="M-5 -21 L5 -21" stroke="#3a6f8a" strokeWidth={2} strokeLinecap="round" />
        : <path d="M-5 -23 Q0 -18 5 -23" stroke="#3a6f8a" strokeWidth={2} strokeLinecap="round" fill="none" />}
    </svg>
  );
}

export function ThingSprite({ t, mood, size = 64, noFace }: { t: Thing; mood: Mood; size?: number; noFace?: boolean }) {
  if (t.kind === "pet") {
    return <div style={{ height: size, display: "flex", alignItems: "flex-end" }}><PetSprite kind={t.petKind ?? "other"} tint={t.tint} size={size * 0.74} /></div>;
  }
  if (t.kind === "system") return <HydroSprite mood={mood} size={size} />;
  const sp = t.speciesId ? speciesById.get(t.speciesId) : undefined;
  return (
    <PlantSprite speciesId={t.speciesId ?? "custom"} tags={sp?.tags} mood={mood}
      leafColor={t.leafColor} potColor={t.potColor} colorSeed={t.id} size={size} noFace={noFace} />
  );
}
