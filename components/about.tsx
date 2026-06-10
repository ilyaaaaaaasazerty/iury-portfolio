"use client";

import { useState } from "react";
import Reveal from "./reveal";
import TextReveal from "./text-reveal";
import SectionHeader from "./section-header";
import Atmosphere from "./atmosphere";
import { bladePaths } from "@/lib/aperture";
import { useLocale } from "./locale-provider";
import { pick, t } from "@/lib/i18n";
import type { Profile } from "@/lib/types";

export default function About({ profile }: { profile: Profile }) {
  const { locale } = useLocale();
  const statement = profile.statement
    ? pick(profile.statement, locale)
    : t(locale, "about.title");

  const spec: { k: string; v: string }[] = [
    { k: t(locale, "hero.based"), v: pick(profile.location, locale) },
    { k: t(locale, "common.role"), v: profile.roles.join(" · ") },
    { k: "Focus", v: "AI · Realtime · Motion" },
    { k: "Languages", v: "العربية · Français · English" },
  ];

  return (
    <section
      id="profile"
      className="relative overflow-hidden border-t border-line py-28 md:py-40"
    >
      <Atmosphere />
      <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">
        <SectionHeader num={1} labelKey="about.kicker" />

        <div className="grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-12">
          {/* left — statement + bio */}
          <div className="md:col-span-7">
            <TextReveal className="display max-w-[20ch] text-[clamp(2rem,5.4vw,4.6rem)] text-bone">
              {statement}
            </TextReveal>

            <Reveal delay={0.1}>
              <p className="mt-10 max-w-2xl text-pretty text-lg leading-relaxed text-fog md:text-xl">
                {pick(profile.bio, locale)}
              </p>
            </Reveal>

            <Reveal delay={0.16}>
              <div className="mt-10 flex flex-wrap gap-x-12 gap-y-5">
                {profile.since && (
                  <div>
                    <div className="meta text-[10px] text-ash">{t(locale, "about.since")}</div>
                    <div className="mt-1.5 text-sm text-fog">{profile.since}</div>
                  </div>
                )}
                <div>
                  <div className="meta text-[10px] text-ash">{t(locale, "about.openTo")}</div>
                  <div className="mt-1.5 text-sm text-fog">{t(locale, "about.openToValue")}</div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* right — portrait + spec */}
          <div className="md:col-span-4 md:col-start-9">
            <Reveal delay={0.08}>
              <Portrait profile={profile} locale={locale} />
            </Reveal>
            <Reveal delay={0.14}>
              <dl className="mt-8 border-t border-line">
                {spec.map((row) => (
                  <div
                    key={row.k}
                    className="flex items-baseline justify-between gap-6 border-b border-line py-3.5"
                  >
                    <dt className="flex items-center gap-2 meta text-[10px] text-ash">
                      <span className="h-1 w-1 rounded-full bg-fog/40" />
                      {row.k}
                    </dt>
                    <dd className="text-end text-sm text-fog">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Portrait({
  profile,
  locale,
}: {
  profile: Profile;
  locale: "en" | "fr" | "ar";
}) {
  const blades = bladePaths({ ri: 10, ro: 50, span: 39, swirl: 29, count: 12 });
  const [errored, setErrored] = useState(false);
  const showImage = !!profile.portraitUrl && !errored;
  return (
    <div className="group relative aspect-[4/5] w-full overflow-hidden border border-line bg-ink-2">
      {/* corner ticks */}
      <Tick className="left-2 top-2" d="M0 8V0h8" />
      <Tick className="right-2 top-2" d="M8 8V0H0" />
      <Tick className="left-2 bottom-2" d="M0 0v8h8" />
      <Tick className="right-2 bottom-2" d="M8 0v8H0" />

      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.portraitUrl}
          alt={profile.name}
          onError={() => setErrored(true)}
          className="h-full w-full object-cover grayscale-[0.55] contrast-[1.05] transition-[transform,filter] duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:grayscale-0"
        />
      ) : (
        <div className="relative flex h-full w-full flex-col items-center justify-center noise-card">
          <div className="absolute inset-0 bg-blueprint-fine opacity-40" />
          <svg
            viewBox="0 0 100 100"
            className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 text-fog/[0.07]"
            fill="currentColor"
          >
            <g stroke="var(--color-ink)" strokeWidth="0.4">
              {blades.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
            <circle cx="50" cy="50" r="9" fill="var(--color-ink-2)" />
          </svg>
          <span className="display relative text-6xl text-fog/70">{profile.initials}</span>
          <span className="meta absolute bottom-4 text-[8px] text-ash">
            {t(locale, "about.portrait")} · {t(locale, "about.addPortrait")}
          </span>
        </div>
      )}
      <span className="meta absolute left-3 top-3 z-10 text-[9px] text-fog/70">{profile.brand}</span>
    </div>
  );
}

function Tick({ className, d }: { className: string; d: string }) {
  return (
    <svg
      className={`absolute z-10 text-fog/50 ${className}`}
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
    >
      <path d={d} stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
