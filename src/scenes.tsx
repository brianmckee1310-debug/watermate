// Cozy flat backdrops for each kind of room. No outlines, soft cottage palette.
// viewBox 320x150; things stand on the surface at y≈120.
import type { SceneKind } from "./logic";

const Window = ({ x, y, w = 62, h = 56, sky = "#cfe6f2" }: { x: number; y: number; w?: number; h?: number; sky?: string }) => (
  <g>
    <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx={7} fill="#fffdf6" />
    <rect x={x} y={y} width={w} height={h} rx={4} fill={sky} />
    <circle cx={x + w * 0.72} cy={y + h * 0.3} r={8} fill="#f6e3a1" opacity={0.9} />
    <rect x={x + w / 2 - 1.5} y={y} width={3} height={h} fill="#fffdf6" />
    <rect x={x} y={y + h / 2 - 1.5} width={w} height={3} fill="#fffdf6" />
    <rect x={x - 8} y={y + h + 4} width={w + 16} height={5} rx={2.5} fill="#e9dcc0" />
  </g>
);
const Wall = ({ wall, floor, base = "#fffdf6" }: { wall: string; floor: string; base?: string }) => (
  <g>
    <rect width={320} height={150} fill={wall} />
    <rect y={118} width={320} height={32} fill={floor} />
    <rect y={114} width={320} height={5} fill={base} opacity={0.7} />
  </g>
);

export const SCENE_LABEL: Record<SceneKind, string> = {
  living: "Living room", kitchen: "Kitchen", bedroom: "Bedroom", office: "Office", bath: "Bathroom",
  sunroom: "Sunroom", shelf: "Shelf", porch: "Front porch", yard: "Yard", garden: "Garden bed",
  coop: "Coop", hydro: "Hydroponics",
};
export const INDOOR_SCENES: SceneKind[] = ["living", "kitchen", "bedroom", "office", "bath", "sunroom", "shelf", "hydro"];
export const OUTDOOR_SCENES: SceneKind[] = ["porch", "yard", "garden", "coop"];

function Art({ kind }: { kind: SceneKind }) {
  switch (kind) {
    case "living":
      return (<>
        <Wall wall="#efe4cf" floor="#d9c3a0" />
        <Window x={30} y={22} />
        <rect x={212} y={26} width={34} height={42} rx={4} fill="#fffdf6" /><rect x={217} y={31} width={24} height={32} rx={2} fill="#c9ddc0" />
        <circle cx={229} cy={50} r={7} fill="#9bb392" />
        <rect x={250} y={36} width={26} height={30} rx={4} fill="#fffdf6" /><rect x={254} y={40} width={18} height={22} rx={2} fill="#e9c8bf" />
        <path d="M176 118 v-34 q0 -12 12 -12 h92 q12 0 12 12 v34 z" fill="#c9907a" />
        <path d="M168 118 v-20 q0 -9 9 -9 q9 0 9 9 v20 z M282 118 v-20 q0 -9 9 -9 q9 0 9 9 v20 z" fill="#b97a64" />
        <rect x={188} y={96} width={92} height={12} rx={6} fill="#d9a48f" />
        <ellipse cx={120} cy={134} rx={86} ry={9} fill="#e8d8ba" />
      </>);
    case "kitchen":
      return (<>
        <Wall wall="#e6ecdd" floor="#d7c9ad" />
        <g opacity={0.55}>{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={i * 40 + 2} y={78} width={36} height={16} rx={3} fill="#f6f8ef" />)}</g>
        <Window x={128} y={14} w={66} h={50} />
        <rect x={18} y={18} width={84} height={44} rx={5} fill="#c7d3b6" /><rect x={58} y={18} width={3} height={44} fill="#e6ecdd" />
        <rect x={222} y={18} width={84} height={44} rx={5} fill="#c7d3b6" /><rect x={262} y={18} width={3} height={44} fill="#e6ecdd" />
        <rect y={98} width={320} height={52} fill="#b9c8a6" />
        <rect y={96} width={320} height={8} rx={3} fill="#f3ead6" />
        {[40, 120, 200, 280].map((x) => <rect key={x} x={x - 9} y={116} width={18} height={4} rx={2} fill="#93a680" />)}
      </>);
    case "bedroom":
      return (<>
        <Wall wall="#e9dfe2" floor="#d9c6ab" />
        <Window x={24} y={22} w={56} sky="#d6e3f0" />
        <path d="M150 118 v-52 q0 -14 14 -14 h118 q14 0 14 14 v52 z" fill="#c9a98f" />
        <rect x={142} y={92} width={162} height={28} rx={9} fill="#f7efe2" />
        <rect x={142} y={100} width={162} height={22} rx={8} fill="#a9bfd3" />
        <rect x={160} y={78} width={46} height={20} rx={9} fill="#fffdf6" /><rect x={214} y={78} width={46} height={20} rx={9} fill="#fffdf6" />
        <rect x={98} y={92} width={34} height={28} rx={4} fill="#b99777" /><rect x={110} y={103} width={10} height={3} rx={1.5} fill="#8e7256" />
      </>);
    case "office":
      return (<>
        <Wall wall="#e3e7e1" floor="#cfbda0" />
        <Window x={22} y={20} />
        <rect x={150} y={24} width={150} height={6} rx={3} fill="#b99777" />
        {[[158, "#cf8a6b", 20], [166, "#9bb392", 24], [175, "#6fb1d6", 18], [183, "#e2b25c", 22], [240, "#a99cc4", 22], [249, "#cf8a6b", 17]].map(([x, c, h]) =>
          <rect key={x as number} x={x as number} y={24 - (h as number)} width={7} height={h as number} rx={1.5} fill={c as string} />)}
        <rect x={140} y={92} width={170} height={8} rx={4} fill="#b99777" />
        <rect x={150} y={100} width={7} height={22} fill="#a38264" /><rect x={293} y={100} width={7} height={22} fill="#a38264" />
        <rect x={196} y={56} width={58} height={32} rx={4} fill="#6b7a7f" /><rect x={200} y={60} width={50} height={24} rx={2} fill="#bfdcea" />
        <rect x={221} y={88} width={8} height={5} fill="#6b7a7f" />
      </>);
    case "bath":
      return (<>
        <Wall wall="#dcebee" floor="#cfd9d6" />
        <g opacity={0.5}>{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => [0, 1, 2].map((j) => <rect key={`${i}${j}`} x={i * 40 + 2} y={60 + j * 18} width={36} height={15} rx={3} fill="#f4fafb" />))}</g>
        <Window x={36} y={12} w={50} h={40} />
        <path d="M150 122 q-6 -34 0 -34 h140 q6 0 0 34 z" fill="#fffdf6" /><rect x={142} y={84} width={156} height={9} rx={4.5} fill="#f1ece0" />
        <circle cx={250} cy={40} r={20} fill="#fffdf6" /><circle cx={250} cy={40} r={16} fill="#cfe6f2" />
      </>);
    case "sunroom":
      return (<>
        <Wall wall="#f3ecd4" floor="#d6c39d" />
        {[14, 92, 170, 248].map((x) => <Window key={x} x={x} y={14} w={58} h={72} sky="#cfe9f1" />)}
        <path d="M0 150 L80 118 L140 118 L40 150 Z" fill="#f6e9b8" opacity={0.5} />
      </>);
    case "hydro":
      return (<>
        <Wall wall="#e4eaea" floor="#cfc6b2" />
        <rect x={40} y={10} width={240} height={10} rx={5} fill="#f1e7ff" /><rect x={52} y={20} width={216} height={5} rx={2.5} fill="#c9b6f0" opacity={0.8} />
        <path d="M52 25 L20 118 H300 L268 25 Z" fill="#e9defc" opacity={0.35} />
        <rect x={34} y={10} width={7} height={110} rx={3} fill="#9aa5a6" /><rect x={279} y={10} width={7} height={110} rx={3} fill="#9aa5a6" />
        <rect x={28} y={112} width={264} height={9} rx={4.5} fill="#7f8c8d" />
      </>);
    case "porch":
      return (<>
        <rect width={320} height={150} fill="#cfe6f2" />
        <circle cx={270} cy={30} r={15} fill="#f6e3a1" />
        <rect x={26} y={30} width={190} height={92} fill="#e9d9bd" />
        <path d="M10 34 L121 -6 L232 34 Z" fill="#b9806a" />
        <rect x={92} y={62} width={40} height={60} rx={4} fill="#7f9aa8" /><circle cx={124} cy={94} r={2.5} fill="#f6e3a1" />
        <rect x={44} y={58} width={34} height={34} rx={3} fill="#fffdf6" /><rect x={48} y={62} width={26} height={26} rx={2} fill="#bfdcea" />
        <rect x={150} y={58} width={34} height={34} rx={3} fill="#fffdf6" /><rect x={154} y={62} width={26} height={26} rx={2} fill="#bfdcea" />
        <rect y={118} width={320} height={32} fill="#b9cf9f" />
        <rect x={14} y={114} width={214} height={10} rx={3} fill="#cdb894" />
        <path d="M228 150 q10 -24 40 -30 h52 v30 z" fill="#e0d2b4" />
      </>);
    case "yard":
      return (<>
        <rect width={320} height={150} fill="#cfe6f2" />
        <circle cx={48} cy={30} r={15} fill="#f6e3a1" />
        <ellipse cx={170} cy={34} rx={26} ry={9} fill="#fffdf6" opacity={0.8} /><ellipse cx={194} cy={30} rx={18} ry={8} fill="#fffdf6" opacity={0.8} />
        {Array.from({ length: 17 }).map((_, i) => <path key={i} d={`M${i * 20 - 4} 122 v-44 l8 -8 l8 8 v44 z`} fill={i % 2 ? "#e3d2b2" : "#dcc9a6"} />)}
        <rect y={92} width={320} height={5} fill="#cdb894" />
        <circle cx={270} cy={54} r={30} fill="#8fb383" /><circle cx={246} cy={66} r={20} fill="#9dc08f" /><rect x={266} y={78} width={9} height={44} fill="#a38264" />
        <rect y={118} width={320} height={32} fill="#a9c98f" />
        <path d="M0 150 q60 -22 150 -18 q90 4 170 -8 v26 z" fill="#b7d49d" />
      </>);
    case "garden":
      return (<>
        <rect width={320} height={150} fill="#d3e9f0" />
        <circle cx={262} cy={28} r={15} fill="#f6e3a1" />
        <path d="M0 96 q80 -26 160 -8 q80 18 160 -10 v72 H0 z" fill="#bcd6a3" />
        <rect y={112} width={320} height={38} fill="#a9c98f" />
        <rect x={16} y={110} width={288} height={30} rx={6} fill="#b99777" />
        <rect x={22} y={110} width={276} height={12} rx={6} fill="#7d5c44" />
        {[60, 130, 200, 270].map((x) => <rect key={x} x={x} y={122} width={3} height={18} fill="#a38264" />)}
      </>);
    case "coop":
      return (<>
        <rect width={320} height={150} fill="#d6e9f1" />
        <circle cx={40} cy={28} r={14} fill="#f6e3a1" />
        <rect y={116} width={320} height={34} fill="#cdbf94" />
        <rect x={168} y={50} width={124} height={70} rx={4} fill="#c9856b" />
        <path d="M156 54 L230 14 L304 54 Z" fill="#8e5d4a" />
        <path d="M212 120 v-30 q0 -14 14 -14 q14 0 14 14 v30 z" fill="#5d4034" />
        <rect x={252} y={64} width={26} height={22} rx={3} fill="#f6e9cf" /><rect x={264} y={64} width={2.5} height={22} fill="#c9856b" />
        <path d="M212 120 l-34 22 h20 l34 -22 z" fill="#b99777" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={10 + i * 22} y={84} width={3} height={36} fill="#b9a983" />)}
        <rect x={6} y={90} width={150} height={3} fill="#b9a983" /><rect x={6} y={106} width={150} height={3} fill="#b9a983" />
      </>);
    default:
      return (<>
        <Wall wall="#efe6d3" floor="#d9c6a6" />
        <rect x={20} y={56} width={280} height={7} rx={3.5} fill="#b99777" />
        <rect x={40} y={63} width={5} height={10} fill="#a38264" /><rect x={275} y={63} width={5} height={10} fill="#a38264" />
      </>);
  }
}

export function Scene({ kind, className }: { kind: SceneKind; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 320 150" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <Art kind={kind} />
    </svg>
  );
}
