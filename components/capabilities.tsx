"use client";

import Reveal from "./reveal";
import TextReveal from "./text-reveal";
import SectionHeader from "./section-header";
import Atmosphere from "./atmosphere";
import IuryMark from "./iury-mark";
import { useLocale } from "./locale-provider";
import { pick, t } from "@/lib/i18n";
import type { Profile } from "@/lib/types";

export default function Capabilities({ profile }: { profile: Profile }) {
  const { locale } = useLocale();
  const ticker = profile.capabilities.flatMap((c) => c.items);

  return (
    <section
      id="craft"
      className="relative overflow-hidden border-t border-line py-28 md:py-40"
    >
      <Atmosphere />
      <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">
        <SectionHeader num={6} labelKey="craft.kicker" />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <TextReveal className="display text-[clamp(2.1rem,6vw,5rem)] text-bone md:col-span-7">
            {t(locale, "craft.title")}
          </TextReveal>
          <Reveal
            delay={0.08}
            className="self-end text-sm leading-relaxed text-smoke md:col-span-4 md:col-start-9 md:text-base"
          >
            {t(locale, "craft.lead")}
          </Reveal>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-x-10 border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {profile.capabilities.map((cap, i) => (
            <Reveal
              key={i}
              delay={i * 0.06}
              className="border-b border-line py-9 lg:border-b-0 lg:border-e lg:py-12 lg:pe-8 lg:ps-0 lg:last:border-e-0 lg:[&:not(:first-child)]:ps-8"
            >
              <div className="mb-6 flex items-baseline justify-between border-b border-line pb-4">
                <h3 className="text-base font-medium tracking-tight text-bone">
                  {pick(cap.title, locale)}
                </h3>
                <span className="numeral-ghost text-xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <ul className="space-y-3">
                {cap.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm leading-snug text-smoke transition-colors hover:text-fog"
                  >
                    <span className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-fog/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>

      {/* tech ticker — film strip */}
      <div className="relative mt-24 overflow-hidden border-y border-line">
        <div className="film-edge absolute inset-x-0 top-0 h-3 opacity-50" aria-hidden />
        <div className="film-edge absolute inset-x-0 bottom-0 h-3 opacity-50" aria-hidden />
        <div className="py-8">
          <div className="marquee">
            {[0, 1].map((dup) => (
              <span key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
                {ticker.map((tech, i) => (
                  <span key={i} className="flex items-center">
                    <span className="px-7 text-2xl text-fog/80 md:text-3xl">{tech}</span>
                    <IuryMark size={14} className="text-fog/25" />
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
