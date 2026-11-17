import { useEffect, useRef, useState, type ReactNode } from "react";

export const Icon = ({ d, size = 22, fill }: { d: string; size?: number; fill?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke={fill ? "none" : "currentColor"}
    strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
export const I = {
  drop: "M12 3 C15.5 7.5 18 10.6 18 14 a6 6 0 0 1 -12 0 C6 10.6 8.5 7.5 12 3 Z",
  home: "M4 11 L12 4 L20 11 V20 H14.5 V14.5 H9.5 V20 H4 Z",
  cal: "M5 6 H19 V20 H5 Z M5 10 H19 M9 3.5 V7 M15 3.5 V7",
  gear: "M12 8.5 a3.5 3.5 0 1 0 0 7 a3.5 3.5 0 0 0 0 -7 Z M12 2.5 v3 M12 18.5 v3 M2.5 12 h3 M18.5 12 h3 M5.3 5.3 l2.1 2.1 M16.6 16.6 l2.1 2.1 M18.7 5.3 l-2.1 2.1 M7.4 16.6 l-2.1 2.1",
  plus: "M12 5 V19 M5 12 H19",
  back: "M15 5 L8 12 L15 19",
  x: "M6 6 L18 18 M18 6 L6 18",
  check: "M5 12.5 L10 17.5 L19 7",
  clock: "M12 4 a8 8 0 1 0 0 16 a8 8 0 0 0 0 -16 Z M12 8 V12 L15 14",
  move: "M4 12 H20 M14 6 L20 12 L14 18",
};

export function Btn({ children, onClick, tone = "blue", small, wide, disabled }: {
  children: ReactNode; onClick?: () => void; tone?: "blue" | "cream" | "sage" | "clay" | "brown"; small?: boolean; wide?: boolean; disabled?: boolean;
}) {
  return (
    <button type="button" disabled={disabled} className={`btn ${tone}${small ? " small" : ""}${wide ? " wide" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

/** Bottom sheet that slides up; closes on backdrop tap. */
export function Sheet({ children, onClose, title, tall }: { children: ReactNode; onClose: () => void; title?: ReactNode; tall?: boolean }) {
  const [closing, setClosing] = useState(false);
  const close = () => { setClosing(true); window.setTimeout(onClose, 220); };
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });
  return (
    <div className={`backdrop${closing ? " closing" : ""}`} onClick={close}>
      <div className={`sheet${tall ? " tall" : ""}`} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="sheet-head">
          <div className="grab" />
          <div className="sheet-title">{title}</div>
          <button type="button" className="icon-btn" onClick={close} aria-label="Close"><Icon d={I.x} /></button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}

export function Stepper({ value, onChange, min = 1, max = 120, label }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label: (n: number) => string }) {
  return (
    <div className="stepper">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label="Less">−</button>
      <span>{label(value)}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} aria-label="More">+</button>
    </div>
  );
}

/** Seven droplets that pop out of a card when it's watered. */
export function Burst({ tint = "#6fb1d6" }: { tint?: string }) {
  return (
    <div className="burst" aria-hidden="true">
      {[[-34, -40, 8], [-18, -56, 6], [2, -62, 9], [22, -54, 6], [36, -40, 8], [-28, -20, 5], [30, -18, 5]].map(([dx, dy, s], i) => (
        <i key={i} style={{ ["--dx" as any]: `${dx}px`, ["--dy" as any]: `${dy}px`, width: s, height: s, background: tint }} />
      ))}
    </div>
  );
}

/** Play an exit (fill + collapse), then run `done`. Returns [ref, phase, start]. */
export function useLeave(done: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"" | "wet" | "pushed">("");
  const start = (kind: "wet" | "pushed") => {
    const el = ref.current;
    if (!el || phase) return;
    el.style.height = el.offsetHeight + "px";
    setPhase(kind);
    window.setTimeout(() => { el.style.height = "0px"; el.classList.add("gone"); }, kind === "wet" ? 520 : 240);
    window.setTimeout(done, kind === "wet" ? 800 : 520);
  };
  return [ref, phase, start] as const;
}
