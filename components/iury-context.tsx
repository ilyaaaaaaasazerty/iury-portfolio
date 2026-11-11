"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Pose } from "./robot";
import { useLocale } from "./locale-provider";

interface Line {
  text: string;
  pose: Pose;
  /** Changes whenever a new line is spoken, so the same text can be retyped. */
  id: number;
}

interface IuryValue {
  line: Line;
  /** The section IURY is currently narrating. */
  active: string;
  /** Say something for a while, then fall back to narrating the current section. */
  react: (text: string, pose: Pose, ms?: number) => void;
  /** End a reaction early (e.g. when the pointer leaves a card). */
  release: () => void;
}

const Ctx = createContext<IuryValue | null>(null);

/**
 * Sections opt in with `data-iury-text` (what IURY says there) and
 * `data-iury-pose`. Whichever section crosses the middle of the viewport
 * becomes the narration.
 */
export function IuryProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const [active, setActive] = useState("intro");
  const [base, setBase] = useState<Line>({ text: "", pose: "sleep", id: 0 });
  const [reaction, setReaction] = useState<Line | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const counter = useRef(1);
  const awake = useRef(false);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-iury-text]"));
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        }),
      { rootMargin: "-42% 0px -42% 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Re-read the narration when the section or language changes.
  useEffect(() => {
    const read = () => {
      const el = document.getElementById(active);
      if (!el?.dataset.iuryText) return;
      setBase({
        text: el.dataset.iuryText,
        pose: (el.dataset.iuryPose as Pose) || "idle",
        id: counter.current++,
      });
    };
    if (awake.current) {
      read();
      return;
    }
    // First load: IURY "wakes up" before he starts talking.
    const id = setTimeout(() => {
      awake.current = true;
      read();
    }, 900);
    return () => clearTimeout(id);
  }, [active, locale]);

  // A short grace period, so gliding from one card to the next doesn't flash the narration.
  const release = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setReaction(null), 350);
  }, []);

  const react = useCallback((text: string, pose: Pose, ms = 3200) => {
    if (!awake.current) return;
    clearTimeout(timer.current);
    setReaction({ text, pose, id: counter.current++ });
    if (ms > 0) timer.current = setTimeout(() => setReaction(null), ms);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <Ctx.Provider value={{ line: reaction ?? base, active, react, release }}>{children}</Ctx.Provider>
  );
}

export function useIury(): IuryValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useIury must be used within IuryProvider");
  return ctx;
}
