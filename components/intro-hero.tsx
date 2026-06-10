"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import type { Profile } from "@/lib/types";
import { bladePaths } from "@/lib/aperture";
import { useLocale } from "./locale-provider";
import { pick, t } from "@/lib/i18n";

const NAME: Record<string, [string, string]> = {
  en: ["Belkhiri", "Abdelaziz"],
  fr: ["Belkhiri", "Abdelaziz"],
  ar: ["بلخيري", "عبد العزيز"],
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const mix = (a: number, b: number, tt: number) => a + (b - a) * tt;

export default function IntroHero({ profile }: { profile: Profile }) {
  const ref = useRef<HTMLElement>(null);
  const { locale } = useLocale();
  const [p, setP] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => setP(v));

  const open = seg(p, 0, 0.62);
  const hole = mix(2.2, 150, open);
  const bladeRotate = mix(0, 64, open);
  const bladeScale = mix(1, 1.35, open);
  const shutterOp = 1 - seg(p, 0.5, 0.66);
  const slateOp = 1 - seg(p, 0, 0.16);
  const slateScale = mix(1, 1.3, seg(p, 0, 0.4));
  const heroOp = seg(p, 0.28, 0.52);
  const heroY = mix(40, 0, seg(p, 0.28, 0.66));
  const heroScale = mix(1.06, 1, seg(p, 0.28, 0.66));

  const blades = bladePaths({ ri: 2.5, ro: 96, span: 42, swirl: 26, count: 12 });
  const [first, last] = NAME[locale] ?? NAME.en;

  return (
    <section ref={ref} id="top" className="relative h-[230vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* ---- Hero content (revealed behind the shutter) ---- */}
        <div
          style={{
            opacity: heroOp,
            transform: `translateY(${heroY}px) scale(${heroScale})`,
          }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        >
          <div className="meta mb-7 text-smoke">{t(locale, "hero.role")}</div>
          <h1 className="display text-bone">
            <span className="block text-[clamp(3.2rem,13vw,12rem)]">{first}</span>
            <span className="-mt-[0.12em] block text-[clamp(3.2rem,13vw,12rem)] italic display-italic text-fog">
              {last}
            </span>
          </h1>
          <p className="mt-8 max-w-xl text-balance text-sm leading-relaxed text-smoke md:text-base">
            {pick(profile.tagline, locale)}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-5 meta text-[10px] text-ash">
            <span className="flex items-center gap-2">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {t(locale, profile.available ? "common.available" : "common.unavailable")}
            </span>
            <span className="h-3 w-px bg-line-2" />
            <span>{pick(profile.location, locale)}</span>
          </div>
        </div>

        {/* ---- The shutter ---- */}
        <div
          style={{
            WebkitMaskImage: `radial-gradient(circle at 50% 48%, transparent ${hole}vmax, #000 ${hole + 16}vmax)`,
            maskImage: `radial-gradient(circle at 50% 48%, transparent ${hole}vmax, #000 ${hole + 16}vmax)`,
            opacity: shutterOp,
          }}
          className="absolute inset-0 bg-ink"
        >
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_48%,rgba(255,255,255,0.06),transparent_70%)]" />
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 h-full w-full"
            style={{
              transform: `scale(${bladeScale}) rotate(${bladeRotate}deg)`,
              transformOrigin: "50% 48%",
            }}
          >
            <defs>
              <linearGradient id="blade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#101014" />
                <stop offset="1" stopColor="#050506" />
              </linearGradient>
            </defs>
            <g fill="url(#blade)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.3">
              {blades.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
          </svg>
        </div>

        {/* ---- Intro slate: the closed eye + invitation ---- */}
        <div
          style={{ opacity: slateOp, transform: `scale(${slateScale})` }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        >
          <ClosedEye />
          <div className="mt-10 flex flex-col items-center gap-3">
            <span className="meta text-[10px] text-smoke">{t(locale, "intro.scroll")}</span>
            <motion.span
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="block h-7 w-px bg-gradient-to-b from-smoke to-transparent"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ClosedEye() {
  const blades = bladePaths({ ri: 10, ro: 45, span: 38, swirl: 31, count: 12 });
  return (
    <motion.svg
      initial={{ rotate: -8, opacity: 0, scale: 0.92 }}
      animate={{ rotate: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      viewBox="0 0 100 100"
      className="h-28 w-28 text-bone md:h-36 md:w-36"
      style={{ filter: "drop-shadow(0 0 40px rgba(255,255,255,0.16))" }}
      fill="none"
    >
      <g fill="currentColor" stroke="var(--color-ink)" strokeWidth="0.6">
        {blades.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <circle cx="50" cy="50" r="11.4" fill="var(--color-ink)" />
      <circle cx="50" cy="50" r="11.4" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.92" />
      <circle cx="50" cy="50" r="4.1" fill="var(--color-ink)" />
      <circle cx="46.6" cy="46.6" r="1.6" fill="currentColor" />
    </motion.svg>
  );
}
