// Web stand-in for react-native-svg so the original WaterMate sprites run unchanged.
import React from "react";

type AnyProps = Record<string, any>;

function conv(props: AnyProps, selfPositioned: boolean): AnyProps {
  const { x, y, rotation, origin, scale, children, ...rest } = props;
  const t: string[] = [];
  if (!selfPositioned && (x != null || y != null)) t.push(`translate(${x ?? 0} ${y ?? 0})`);
  if (rotation != null) {
    const [ox, oy] = String(origin ?? "0,0").split(",").map(Number);
    t.push(`rotate(${rotation} ${ox || 0} ${oy || 0})`);
  }
  if (scale != null) t.push(`scale(${scale})`);
  const out: AnyProps = { ...rest };
  if (selfPositioned) { if (x != null) out.x = x; if (y != null) out.y = y; }
  if (t.length) out.transform = t.join(" ");
  return out;
}
const mk = (tag: string, selfPositioned = false) =>
  function El(props: AnyProps) { return React.createElement(tag, conv(props, selfPositioned), props.children); };

export const G = mk("g");
export const Path = mk("path");
export const Circle = mk("circle");
export const Ellipse = mk("ellipse");
export const Rect = mk("rect", true);
export const Line = mk("line");
export default function Svg(props: AnyProps) {
  return React.createElement("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", style: { display: "block", overflow: "visible", ...(props.style || {}) } }, props.children);
}
