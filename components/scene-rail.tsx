"use client";

import { useEffect, useState } from "react";
import { useLocale } from "./locale-provider";
import { t } from "@/lib/i18n";
import { scrollToId } from "./smooth-scroll";
import type { Locale } from "@/lib/types";

const SCENES = [
  { id: "top", key: "" },
  { id: "profile", key: "about.kicker" },
  { id: "services", key: "services.kicker" },
  { id: "work", key: "work.kicker" },
  { id: "case", key: "spotlight.kicker" },
  { id: "process", key: "process.kicker" },
  { id: "craft", key: "craft.kicker" },
  { id: "contact", key: "contact.kicker" },
];

const TOP_LABEL: Record<Locale, string> = { en: "Top", fr: "Haut", ar: "البداية" };

export default function SceneRail() {
  const { locale } = useLocale();
  const [active, setActive] = useState("top");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        }),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    SCENES.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <nav
      aria-label="Scenes"
      className="fixed end-5 top-1/2 z-[97] hidden -translate-y-1/2 flex-col items-end gap-3.5 lg:flex"
    >
      {SCENES.map((s, i) => {
        const on = active === s.id;
        const label = s.key ? t(locale, s.key) : TOP_LABEL[locale];
        return (
          <button
            key={s.id}
            onClick={() => scrollToId(s.id)}
            aria-label={label}
            className="group flex items-center justify-end gap-2.5"
          >
            <span
              className={`meta whitespace-nowrap text-[8px] transition-all duration-300 ${
                on
                  ? "text-bone opacity-100"
                  : "text-smoke opacity-0 group-hover:opacity-70"
              }`}
            >
              {String(i + 1).padStart(2, "0")} · {label}
            </span>
            <span
              className={`block h-px transition-all duration-300 ${
                on ? "w-8 bg-bone" : "w-4 bg-line-2 group-hover:w-6"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
