"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "./locale-provider";
import { pick, t } from "@/lib/i18n";
import type { Profile } from "@/lib/types";

export default function Stats({ profile }: { profile: Profile }) {
  const { locale } = useLocale();
  return (
    <section className="relative overflow-hidden border-y border-line bg-ink-2/40">
      <div className="absolute inset-0 bg-blueprint-fine opacity-30" aria-hidden />
      <div className="light-drift absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="flex items-center gap-3 py-5">
          <span className="meta text-[10px] text-ash">{t(locale, "stats.kicker")}</span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <dl className="grid grid-cols-2 border-s border-t border-line md:grid-cols-4">
          {profile.stats.map((s, i) => (
            <div
              key={i}
              className="group relative border-b border-e border-line px-5 py-9 md:px-7 md:py-14"
            >
              <dt
                className="display text-[clamp(2.4rem,5vw,4rem)] leading-none text-bone tnum"
                style={{ textShadow: "0 0 32px rgba(255,255,255,0.12)" }}
              >
                <CountUp value={s.value} />
              </dt>
              <Meter />
              <dd className="mt-4 max-w-[22ch] text-xs leading-relaxed text-smoke">
                {pick(s.label, locale)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Meter() {
  return (
    <div className="mt-5 flex items-end gap-[3px]" aria-hidden>
      {Array.from({ length: 16 }).map((_, i) => (
        <span
          key={i}
          className={i < 10 ? "w-full bg-fog/70" : "w-full bg-line-2"}
          style={{ height: 4 + (i % 3) * 3 }}
        />
      ))}
    </div>
  );
}

function CountUp({ value }: { value: string }) {
  const isNumeric = /^\d+$/.test(value);
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(isNumeric ? "0" : value);

  useEffect(() => {
    if (!isNumeric) return;
    const node = ref.current;
    if (!node) return;
    let raf = 0;
    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      const target = parseInt(value, 10);
      const dur = 1300;
      let startTs = 0;
      const tick = (ts: number) => {
        if (!startTs) startTs = ts;
        const p = Math.min(1, (ts - startTs) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(String(Math.round(eased * target)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          obs.disconnect();
          run();
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(node);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [isNumeric, value]);

  return <span ref={ref}>{display}</span>;
}
