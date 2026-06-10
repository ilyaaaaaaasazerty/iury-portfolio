"use client";

import SectionHeader from "./section-header";
import TextReveal from "./text-reveal";
import Reveal from "./reveal";
import Atmosphere from "./atmosphere";
import { useLocale } from "./locale-provider";
import { pick, t } from "@/lib/i18n";
import type { Profile } from "@/lib/types";

export default function Process({ profile }: { profile: Profile }) {
  const { locale } = useLocale();
  const steps = profile.process ?? [];
  if (!steps.length) return null;

  return (
    <section
      id="process"
      className="relative overflow-hidden border-t border-line py-28 md:py-40"
    >
      <Atmosphere flip />
      <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">
        <SectionHeader num={5} labelKey="process.kicker" />

        <div className="mb-16 grid gap-8 md:grid-cols-12">
          <TextReveal className="display text-[clamp(2.1rem,6vw,5rem)] text-bone md:col-span-7">
            {t(locale, "process.title")}
          </TextReveal>
          <Reveal
            delay={0.08}
            className="self-end text-sm leading-relaxed text-smoke md:col-span-4 md:col-start-9 md:text-base"
          >
            {t(locale, "process.lead")}
          </Reveal>
        </div>

        <ol className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <li key={i} className="bg-ink">
              <Reveal delay={i * 0.06}>
                <div className="group flex h-full flex-col gap-4 p-6 transition-colors hover:bg-ink-2/40 md:p-7">
                  <div className="flex items-center justify-between">
                    <span className="numeral-ghost text-3xl md:text-4xl">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-fog/30 transition-colors group-hover:bg-bone" />
                  </div>
                  <h3 className="text-base font-medium text-bone">
                    {pick(s.title, locale)}
                  </h3>
                  <p className="text-sm leading-relaxed text-smoke">
                    {pick(s.desc, locale)}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
