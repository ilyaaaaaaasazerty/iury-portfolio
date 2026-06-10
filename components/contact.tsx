"use client";

import { motion } from "framer-motion";
import Reveal from "./reveal";
import TextReveal from "./text-reveal";
import SectionHeader from "./section-header";
import { useLocale } from "./locale-provider";
import { pick, t } from "@/lib/i18n";
import { useMagnetic } from "@/lib/use-magnetic";
import type { Profile } from "@/lib/types";
import { bladePaths } from "@/lib/aperture";
import { IconArrow, IconGithub } from "./icons";

export default function Contact({ profile }: { profile: Profile }) {
  const { locale } = useLocale();
  const mag = useMagnetic<HTMLSpanElement>(0.4);
  const s = profile.socials;

  const socials = [
    { label: "GitHub", href: s.github, icon: true },
    { label: "LinkedIn", href: s.linkedin },
    { label: "X", href: s.x },
    { label: "Instagram", href: s.instagram },
    { label: "Website", href: s.website },
  ].filter((x) => x.href);

  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-line py-32 text-center md:py-48"
    >
      <div className="absolute inset-0 bg-blueprint-fine opacity-25" aria-hidden />
      <ClosingEye />

      <div className="relative mx-auto max-w-4xl px-5">
        <SectionHeader num={7} labelKey="contact.kicker" />

        <TextReveal className="display mx-auto mt-4 max-w-[16ch] text-[clamp(2.4rem,8vw,6.5rem)] text-bone">
          {t(locale, "contact.title")}
        </TextReveal>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-7 max-w-xl text-pretty text-sm leading-relaxed text-smoke md:text-base">
            {t(locale, "contact.lead")}
          </p>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="mt-12 flex justify-center">
            <a
              href={`mailto:${profile.email}`}
              className="group inline-flex items-center gap-4"
              onMouseMove={mag.onMouseMove}
              onMouseLeave={mag.onMouseLeave}
            >
              <span className="display border-b border-line-2 pb-1 text-[clamp(1.4rem,5vw,2.8rem)] text-bone transition-colors group-hover:border-bone">
                {profile.email}
              </span>
              <span
                ref={mag.ref}
                className="magnetic flex h-11 w-11 items-center justify-center rounded-full border border-line-2 transition-colors group-hover:border-bone"
              >
                <IconArrow size={18} className="transition-transform duration-500 group-hover:rotate-45" />
              </span>
            </a>
          </div>
        </Reveal>

        {/* contact channels */}
        <Reveal delay={0.22}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
            {s.calendly && (
              <Channel href={s.calendly} primary>
                {t(locale, "common.schedule")}
              </Channel>
            )}
            {s.whatsapp && (
              <Channel href={s.whatsapp}>{t(locale, "common.whatsapp")}</Channel>
            )}
            {socials.map((soc) => (
              <Channel key={soc.label} href={soc.href!}>
                {soc.icon && <IconGithub size={15} />}
                {soc.label}
              </Channel>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.28}>
          <div className="mt-12 flex items-center justify-center gap-4 meta text-[10px] text-ash">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {t(locale, profile.available ? "common.available" : "common.unavailable")}
            </span>
            <span className="h-3 w-px bg-line-2" />
            <span>{pick(profile.location, locale)}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Channel({
  href,
  primary,
  children,
}: {
  href: string;
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto") ? undefined : "_blank"}
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
        primary
          ? "bg-bone text-ink hover:bg-fog"
          : "border border-line text-smoke hover:border-bone hover:text-bone"
      }`}
    >
      {children}
    </a>
  );
}

function ClosingEye() {
  const blades = bladePaths({ ri: 9, ro: 50, span: 41, swirl: 28, count: 12 });
  return (
    <motion.svg
      initial={{ rotate: 30, scale: 1.4, opacity: 0 }}
      whileInView={{ rotate: 0, scale: 1, opacity: 0.05 }}
      viewport={{ once: true, margin: "-20%" }}
      transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      viewBox="0 0 100 100"
      className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 text-fog"
      fill="currentColor"
      aria-hidden
    >
      {blades.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </motion.svg>
  );
}
