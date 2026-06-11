"use client";

import SectionHeader from "./section-header";
import TextReveal from "./text-reveal";
import Reveal from "./reveal";
import Atmosphere from "./atmosphere";
import IuryMark from "./iury-mark";
import { useLocale } from "./locale-provider";
import { pick, t } from "@/lib/i18n";
import type { Profile } from "@/lib/types";

export default function Services({ profile }: { profile: Profile }) {
  const { locale } = useLocale();
  const services = profile.services ?? [];
  if (!services.length) return null;

  return (
    <section
      id="services"
      className="relative overflow-hidden border-t border-line py-28 md:py-40"
    >
      <Atmosphere flip />
      <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">
        <SectionHeader num={2} labelKey="services.kicker" />

        <div className="grid gap-8 md:grid-cols-12">
          <TextReveal className="display text-[clamp(2.1rem,6vw,5rem)] text-bone md:col-span-7">
            {t(locale, "services.title")}
          </TextReveal>
          <Reveal
            delay={0.08}
            className="self-end text-sm leading-relaxed text-smoke md:col-span-4 md:col-start-9 md:text-base"
          >
            {t(locale, "services.lead")}
          </Reveal>
        </div>

        <div className="mt-16 border-t border-line">
          {services.map((s, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="group grid grid-cols-1 items-baseline gap-3 border-b border-line py-8 transition-colors hover:bg-ink-2/30 md:grid-cols-12 md:gap-6 md:py-10">
                <div className="flex items-center gap-5 md:col-span-6">
                  <span className="numeral-ghost text-3xl md:text-4xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="display text-[clamp(1.6rem,3.4vw,2.8rem)] leading-none text-bone">
                    {pick(s.title, locale)}
                  </h3>
                  <IuryMark
                    size={22}
                    className="hidden opacity-40 transition-all duration-700 group-hover:rotate-[120deg] group-hover:opacity-90 sm:block"
                  />
                </div>
                <p className="text-pretty text-sm leading-relaxed text-smoke md:col-span-5 md:col-start-8 md:text-base">
                  {pick(s.desc, locale)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
