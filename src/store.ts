import { useCallback, useEffect, useRef, useState } from "react";
import type { State } from "./logic";
import { starterState } from "./seed";

const KEY = "watermate.v1";

export function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const s = JSON.parse(raw); if (s && s.v === 1 && Array.isArray(s.things)) return s; }
  } catch { /* fall through to starter */ }
  return starterState();
}
function save(s: State) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage full/blocked */ } }

export type Toast = { id: number; text: string; undo?: State };

export function useStore() {
  const [state, setState] = useState<State>(load);
  const [toast, setToast] = useState<Toast | null>(null);
  const ref = useRef(state);
  ref.current = state;
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => { save(state); }, [state]);
  useEffect(() => { navigator.storage?.persist?.().catch(() => {}); }, []);

  const say = useCallback((text: string, undo?: State) => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), text, undo });
    timer.current = window.setTimeout(() => setToast(null), 6000);
  }, []);

  /** Apply a change; if `text` is given, show a toast with Undo. */
  const act = useCallback((fn: (s: State) => State, text?: string) => {
    const prev = ref.current;
    const next = fn(prev);
    ref.current = next;
    setState(next);
    if (text) say(text, prev);
  }, [say]);

  const undo = useCallback(() => {
    setToast((t) => { if (t?.undo) { ref.current = t.undo; setState(t.undo); } return null; });
  }, []);

  const replace = useCallback((s: State) => { ref.current = s; setState(s); }, []);
  return { state, act, toast, undo, say, replace, dismiss: () => setToast(null) };
}
export type Store = ReturnType<typeof useStore>;
