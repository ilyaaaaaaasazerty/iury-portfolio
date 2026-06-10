"use client";

import { useEffect, useRef, useState, type ElementType } from "react";

interface Props {
  children: React.ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
}

/** A heading that wipes in behind a diagonal mask when it scrolls into view. */
export default function TextReveal({
  children,
  as: Tag = "h2",
  className = "",
  delay = 0,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(node);
    const fallback = setTimeout(() => setInView(true), 1600);
    return () => {
      obs.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal-mask ${inView ? "is-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </Tag>
  );
}
