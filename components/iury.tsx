"use client";

import { useEffect, useState } from "react";

/** Types `text` out once `start` is true. Reduced-motion users get it whole. */
export function useTyped(text: string, start = true, speed = 22): string {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(text.length);
      return;
    }
    setN(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, start, speed]);
  return text.slice(0, n);
}

/** False during SSR and the hydration pass — for values that depend on the current time. */
export function useMounted(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}
