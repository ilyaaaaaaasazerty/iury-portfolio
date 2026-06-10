"use client";

import { useEffect, useRef } from "react";

/** A focus-reticle cursor — a camera AF box that locks onto interactive targets. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    document.body.classList.add("has-cursor");
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const rp = { ...pos };
    let hovering = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        dot.current.style.opacity = "1";
      }
      const target = e.target as HTMLElement | null;
      hovering = !!target?.closest("a, button, [data-cursor], input, textarea, select");
    };

    const loop = () => {
      rp.x += (pos.x - rp.x) * 0.2;
      rp.y += (pos.y - rp.y) * 0.2;
      if (ring.current) {
        const s = hovering ? 58 : 32;
        ring.current.style.transform = `translate(${rp.x}px, ${rp.y}px)`;
        ring.current.style.width = `${s}px`;
        ring.current.style.height = `${s}px`;
        ring.current.style.margin = `${-s / 2}px 0 0 ${-s / 2}px`;
        ring.current.style.opacity = hovering ? "1" : "0.55";
      }
      raf = requestAnimationFrame(loop);
    };

    const onLeave = () => {
      if (dot.current) dot.current.style.opacity = "0";
      if (ring.current) ring.current.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.body.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div ref={dot} className="cursor-dot" style={{ opacity: 0 }} />
      <div ref={ring} className="cursor-ring" style={{ opacity: 0 }}>
        <span style={{ top: -1, left: "50%", width: 1, height: 7, marginLeft: -0.5 }} />
        <span style={{ bottom: -1, left: "50%", width: 1, height: 7, marginLeft: -0.5 }} />
        <span style={{ left: -1, top: "50%", height: 1, width: 7, marginTop: -0.5 }} />
        <span style={{ right: -1, top: "50%", height: 1, width: 7, marginTop: -0.5 }} />
      </div>
    </>
  );
}
