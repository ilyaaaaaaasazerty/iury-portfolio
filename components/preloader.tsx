"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import IuryMark from "./iury-mark";
import { useLocale } from "./locale-provider";
import { t } from "@/lib/i18n";

export default function Preloader() {
  const { locale } = useLocale();
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDone(true);
      return;
    }
    const lenis = (window as unknown as { __lenis?: { stop: () => void } }).__lenis;
    lenis?.stop?.();
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    const dur = 1900;
    const start = performance.now();
    let raf = 0;
    const tick = (ts: number) => {
      const p = Math.min(1, (ts - start) / dur);
      setCount(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setDone(true), 220);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!done) return;
    const lenis = (window as unknown as { __lenis?: { start: () => void } }).__lenis;
    lenis?.start?.();
    document.body.style.overflow = "";
    window.scrollTo(0, 0);
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-void"
        >
          <div className="absolute inset-0 bg-blueprint-fine opacity-30" />
          <motion.div
            exit={{ scale: 1.18, opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex h-28 w-28 items-center justify-center"
          >
            <motion.span
              className="absolute inset-0 rounded-full border border-line-2 border-t-bone"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
            />
            <IuryMark size={66} />
          </motion.div>

          <div className="mt-10 flex flex-col items-center gap-3">
            <span className="meta text-[10px] text-smoke">{t(locale, "preloader.line")}</span>
            <span className="font-mono text-3xl tabular-nums text-bone">
              {String(count).padStart(3, "0")}
            </span>
          </div>

          {/* progress hairline */}
          <div className="absolute bottom-0 left-0 h-px bg-bone" style={{ width: `${count}%` }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
