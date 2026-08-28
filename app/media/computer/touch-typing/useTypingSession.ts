"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CHAR_TO_KEY, type KeyTarget } from "./keyboardLayout";

export type PressState = "correct" | "error";
export type LastPress = { code: string; state: PressState; nonce: number };
export type KeyStats = { hits: number; misses: number };

function nextTypeable(chars: string[], from: number): number {
  let cursor = from;
  while (cursor < chars.length && !CHAR_TO_KEY[chars[cursor]]) cursor += 1;
  return cursor;
}

export function useTypingSession(target: string, active: boolean, onComplete: () => void, resetToken = 0) {
  const chars = useMemo(() => Array.from(target), [target]);
  const [cursor, setCursor] = useState(() => nextTypeable(chars, 0));
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [lastPress, setLastPress] = useState<LastPress | null>(null);
  const [perKey, setPerKey] = useState<Map<string, KeyStats>>(() => new Map());
  const startedAt = useRef<number | null>(null);
  const completed = useRef(false);

  useEffect(() => {
    const reset = window.setTimeout(() => {
      setCursor(nextTypeable(chars, 0));
      setHits(0);
      setMisses(0);
      setElapsed(0);
      setLastPress(null);
      setPerKey(new Map());
      startedAt.current = null;
      completed.current = false;
    }, 0);
    return () => window.clearTimeout(reset);
  }, [chars, resetToken]);

  useEffect(() => {
    if (!active || completed.current) return;
    const timer = window.setInterval(() => {
      if (startedAt.current) setElapsed((performance.now() - startedAt.current) / 1000);
    }, 250);
    return () => window.clearInterval(timer);
  }, [active]);

  const hint: KeyTarget | null = cursor < chars.length ? CHAR_TO_KEY[chars[cursor]] ?? null : null;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!active || completed.current || event.repeat || event.ctrlKey || event.altKey || event.metaKey) return false;
    if (["Tab", "Space", "ArrowUp", "ArrowDown"].includes(event.code)) event.preventDefault();
    const expected = cursor < chars.length ? CHAR_TO_KEY[chars[cursor]] : null;
    if (!expected || !(event.code.startsWith("Key") || event.code.startsWith("Digit") || ["Space", "Backquote", "Minus", "Equal", "BracketLeft", "BracketRight", "Backslash", "Semicolon", "Quote", "Comma", "Period", "Slash"].includes(event.code))) return false;

    startedAt.current ??= performance.now();
    const correct = event.code === expected.code && (!expected.shift || event.shiftKey);
    const state: PressState = correct ? "correct" : "error";
    setLastPress({ code: event.code, state, nonce: performance.now() });
    setPerKey((previous) => {
      const next = new Map(previous);
      const old = next.get(expected.code) ?? { hits: 0, misses: 0 };
      next.set(expected.code, correct ? { ...old, hits: old.hits + 1 } : { ...old, misses: old.misses + 1 });
      return next;
    });

    if (!correct) {
      setMisses((value) => value + 1);
      return true;
    }

    setHits((value) => value + 1);
    const next = nextTypeable(chars, cursor + 1);
    setCursor(next);
    if (next >= chars.length) {
      completed.current = true;
      const finalElapsed = startedAt.current ? (performance.now() - startedAt.current) / 1000 : 0;
      setElapsed(finalElapsed);
      window.setTimeout(onComplete, 350);
    }
    return true;
  }, [active, chars, cursor, onComplete]);

  const total = hits + misses;
  const stats = {
    wpm: elapsed > 0 ? Math.round((hits / 5) / (elapsed / 60)) : 0,
    accuracy: total ? Math.round((hits / total) * 100) : 100,
    elapsed,
  };

  return { target, chars, cursor, hintCode: hint?.code ?? null, hintShift: hint?.shift ?? false, lastPress, stats, perKey, handleKeyDown };
}
