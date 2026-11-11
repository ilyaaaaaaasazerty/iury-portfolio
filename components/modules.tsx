"use client";

import { useState } from "react";
import Reveal from "./reveal";
import { useLocale } from "./locale-provider";
import { scrollToId } from "./smooth-scroll";
import { useMagnetic } from "@/lib/use-magnetic";
import { pick, t } from "@/lib/i18n";
import type { Pose } from "./robot";
import type { Profile } from "@/lib/types";
import { IconArrow, IconGithub } from "./icons";

/**
 * One block of the feed. `say` is what IURY narrates while this block is in
 * view; `pose` is how he stands while saying it.
 */
export function Module({
  id,
  index,
  label,
  meta,
  say,
  pose = "idle",
  children,
  className = "",
}: {
  id: string;
  index?: number;
  label?: string;
  meta?: React.ReactNode;
  say: string;
  pose?: Pose;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} data-iury-text={say} data-iury-pose={pose} className={`scroll-mt-4 ${className}`}>
      {label && (
        <div className="mb-5 flex items-center gap-3 font-mono text-[11px] text-faint">
          {index !== undefined && <span className="text-signal">{String(index).padStart(2, "0")}</span>}
          <span className="uppercase tracking-[0.14em]">{label}</span>
          <span className="h-px flex-1 bg-line" />
          {meta && <span className="normal-case">{meta}</span>}
        </div>
      )}
      {children}
    </section>
  );
}

const NAME: Record<string, [string, string]> = {
  en: ["Belkhiri", "Abdelaziz"],
  fr: ["Belkhiri", "Abdelaziz"],
  ar: ["بلخيري", "عبد العزيز"],
};

/* ---------------------------------- intro ---------------------------------- */

export function Intro({ profile }: { profile: Profile }) {
  const { locale } = useLocale();
  const [first, last] = NAME[locale] ?? NAME.en;
  return (
    <Module
      id="intro"
      say={`${t(locale, "hero.hello")} ${t(locale, "hero.intro")}`}
      pose="wave"
      className="flex flex-col justify-center pt-10 lg:min-h-[calc(100svh-24px)] lg:py-10"
    >
      <Reveal>
        <span className="inline-flex items-center gap-2 rounded-full bg-panel px-3 py-1.5 text-xs text-mute ring-1 ring-line">
          <span className="h-1.5 w-1.5 rounded-full bg-signal" />
          {t(locale, "hero.role")}
        </span>
        <h1 className="display mt-6 text-[clamp(3.2rem,8vw,8rem)] text-ink">
          {first}
          <br />
          <span className="text-ink/45">{last}</span>
        </h1>
        <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-mute">
          {pick(profile.tagline, locale)}
        </p>
        <div className="mt-9 flex flex-wrap gap-2.5">
          <button
            onClick={() => scrollToId("work")}
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-panel transition-colors hover:bg-graphite"
          >
            {t(locale, "intro.cta.work")}
            <IconArrow size={15} className="rotate-45 transition-transform group-hover:translate-x-0.5 rtl:-rotate-[135deg]" />
          </button>
          <button
            onClick={() => scrollToId("contact")}
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm text-ink ring-1 ring-line-2 transition-colors hover:ring-ink"
          >
            {t(locale, "intro.cta.contact")}
          </button>
        </div>
      </Reveal>

      {profile.stats.length > 0 && (
        <Reveal delay={0.1}>
          <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-[22px] bg-line ring-1 ring-line sm:grid-cols-4">
            {profile.stats.map((s, i) => (
              <div key={i} className="bg-panel px-4 py-5">
                <dt className="display text-3xl text-ink">{s.value}</dt>
                <dd className="mt-1.5 text-xs leading-snug text-mute">{pick(s.label, locale)}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      )}
    </Module>
  );
}

/* ---------------------------------- about ---------------------------------- */

export function About({ profile, index }: { profile: Profile; index: number }) {
  const { locale } = useLocale();
  const [errored, setErrored] = useState(false);
  const portrait = profile.portraitUrl && !errored
    ? profile.portraitUrl.startsWith("/") ? profile.portraitUrl : `/${profile.portraitUrl}`
    : null;
  const facts = [
    { k: t(locale, "about.based"), v: pick(profile.location, locale) },
    { k: t(locale, "about.since"), v: profile.since },
    { k: t(locale, "about.focus"), v: "AI · Realtime · Product" },
    { k: t(locale, "about.languages"), v: "العربية · Français · English" },
    { k: t(locale, "about.openTo"), v: t(locale, "about.openToValue") },
  ].filter((f) => f.v);

  return (
    <Module id="profile" index={index} label={t(locale, "about.kicker")} say={t(locale, "about.note")} pose="happy">
      <Reveal className="grid gap-6 sm:grid-cols-[minmax(0,220px)_1fr]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-shell ring-1 ring-line">
          {portrait ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={portrait}
              alt={profile.name}
              onError={() => setErrored(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="bg-dots flex h-full items-center justify-center">
              <span className="display text-5xl text-ink/35">{profile.initials}</span>
            </div>
          )}
        </div>
        <div>
          <h2 className="display text-[clamp(1.8rem,3.2vw,2.8rem)] text-ink">
            {profile.statement ? pick(profile.statement, locale) : t(locale, "about.title")}
          </h2>
          <p className="mt-5 text-pretty leading-relaxed text-mute">{pick(profile.bio, locale)}</p>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <dl className="mt-6 flex flex-wrap gap-2">
          {facts.map((f) => (
            <div key={f.k} className="rounded-2xl bg-panel px-4 py-2.5 ring-1 ring-line">
              <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">{f.k}</dt>
              <dd className="mt-0.5 text-sm text-ink">{f.v}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </Module>
  );
}

/* --------------------------------- skills ---------------------------------- */

export function Skills({ profile, index }: { profile: Profile; index: number }) {
  const { locale } = useLocale();
  const services = profile.services ?? [];
  const steps = profile.process ?? [];
  return (
    <Module id="craft" index={index} label={t(locale, "craft.kicker")} say={t(locale, "craft.note")} pose="amazed">
      <Reveal>
        <h2 className="display max-w-[18ch] text-[clamp(1.8rem,3.2vw,2.8rem)] text-ink">
          {t(locale, "craft.title")}
        </h2>
      </Reveal>

      {services.length > 0 && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {services.map((s, i) => (
            <Reveal key={i} delay={(i % 2) * 0.05}>
              <article className="group h-full rounded-[22px] bg-panel p-6 ring-1 ring-line transition-shadow duration-500 hover:shadow-[0_18px_40px_-24px_rgba(19,19,22,0.4)]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <span className="h-2 w-2 rounded-full bg-steel transition-colors duration-500 group-hover:bg-signal" />
                </div>
                <h3 className="display mt-6 text-xl text-ink">{pick(s.title, locale)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{pick(s.desc, locale)}</p>
              </article>
            </Reveal>
          ))}
        </div>
      )}

      <Reveal delay={0.05}>
        <div className="mt-10 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
          {t(locale, "skills.toolbox")}
        </div>
        <div className="mt-4 space-y-4">
          {profile.capabilities.map((cap, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[160px_1fr] sm:items-baseline">
              <h3 className="text-sm font-medium text-ink">{pick(cap.title, locale)}</h3>
              <div className="flex flex-wrap gap-1.5">
                {cap.items.map((item) => (
                  <span key={item} className="rounded-full bg-panel px-3 py-1 text-[13px] text-mute ring-1 ring-line">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {steps.length > 0 && (
        <Reveal delay={0.05}>
          <div className="mt-10 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
            {t(locale, "skills.process")}
          </div>
          <ol className="mt-4 grid gap-px overflow-hidden rounded-[22px] bg-line ring-1 ring-line sm:grid-cols-5">
            {steps.map((s, i) => (
              <li key={i} className="bg-panel p-4">
                <span className="font-mono text-xs text-signal">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 text-sm font-semibold text-ink">{pick(s.title, locale)}</h3>
                <p className="mt-1 text-xs leading-relaxed text-mute">{pick(s.desc, locale)}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      )}
    </Module>
  );
}

/* --------------------------------- contact --------------------------------- */

export function Contact({ profile, index }: { profile: Profile; index: number }) {
  const { locale } = useLocale();
  const mag = useMagnetic<HTMLSpanElement>(0.4);
  const s = profile.socials;
  const channels = [
    s.calendly && { label: t(locale, "common.schedule"), href: s.calendly },
    s.whatsapp && { label: t(locale, "common.whatsapp"), href: s.whatsapp },
    s.github && { label: "GitHub", href: s.github, github: true },
    s.linkedin && { label: "LinkedIn", href: s.linkedin },
    s.x && { label: "X", href: s.x },
    s.instagram && { label: "Instagram", href: s.instagram },
    s.website && { label: "Website", href: s.website },
  ].filter(Boolean) as { label: string; href: string; github?: boolean }[];

  return (
    <Module id="contact" index={index} label={t(locale, "contact.kicker")} say={t(locale, "contact.note")} pose="happy">
      <Reveal className="rounded-[28px] bg-ink p-7 text-panel md:p-10">
        <h2 className="display max-w-[14ch] text-[clamp(2.2rem,4.6vw,4rem)]">{t(locale, "contact.title")}</h2>
        <p className="mt-5 max-w-md leading-relaxed text-panel/65">{t(locale, "contact.lead")}</p>
        <a
          href={`mailto:${profile.email}`}
          className="group mt-9 flex max-w-full items-center gap-4"
          onMouseMove={mag.onMouseMove}
          onMouseLeave={mag.onMouseLeave}
        >
          <span className="display truncate border-b-2 border-white/20 pb-1 text-[clamp(1.1rem,2.6vw,1.9rem)] transition-colors group-hover:border-signal">
            {profile.email}
          </span>
          <span
            ref={mag.ref}
            className="magnetic flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-signal text-ink"
          >
            <IconArrow size={18} />
          </span>
        </a>
        {channels.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {channels.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-panel/80 ring-1 ring-white/15 transition-colors hover:text-panel hover:ring-white/50"
              >
                {c.github && <IconGithub size={15} />}
                {c.label}
              </a>
            ))}
          </div>
        )}
      </Reveal>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 pb-6 text-xs text-faint">
        <span>
          © {new Date().getFullYear()} {profile.name} · {t(locale, "footer.rights")}
        </span>
        <span className="font-mono">{t(locale, "footer.madeWith")}</span>
      </footer>
    </Module>
  );
}
