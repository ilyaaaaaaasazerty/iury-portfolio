"use client";

import SectionHeader from "./section-header";
import TextReveal from "./text-reveal";
import Reveal from "./reveal";
import Atmosphere from "./atmosphere";
import CoverImage from "./cover-image";
import { useLocale } from "./locale-provider";
import { t } from "@/lib/i18n";
import type { Project } from "@/lib/types";

export default function CaseStudies({ projects }: { projects: Project[] }) {
  const { locale } = useLocale();
  const spots = projects.filter((p) => p.spotlight && p.caseStudy);
  if (!spots.length) return null;

  return (
    <section
      id="case"
      className="relative overflow-hidden border-t border-line py-28 md:py-40"
    >
      <Atmosphere />
      <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">
        <SectionHeader num={4} labelKey="spotlight.kicker" />

        <div className="mb-20 grid gap-8 md:grid-cols-12">
          <TextReveal className="display text-[clamp(2.1rem,6vw,5rem)] text-bone md:col-span-7">
            {t(locale, "spotlight.title")}
          </TextReveal>
          <Reveal
            delay={0.08}
            className="self-end text-sm leading-relaxed text-smoke md:col-span-4 md:col-start-9 md:text-base"
          >
            {t(locale, "spotlight.lead")}
          </Reveal>
        </div>

        <div className="space-y-24 md:space-y-36">
          {spots.map((p, i) => (
            <Spot key={p.id} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Spot({ project, index }: { project: Project; index: number }) {
  const { locale } = useLocale();
  const cs = project.caseStudy!;
  const flip = index % 2 === 1;

  return (
    <Reveal>
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <div
          className={`group relative aspect-[4/3] overflow-hidden border border-line sheen ${
            flip ? "md:order-2" : ""
          }`}
        >
          <CoverImage project={project} index={index} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/45 to-transparent" />
          <span className="meta absolute start-4 top-4 text-[10px] text-fog/80">
            {project.category}
          </span>
          <span className="meta absolute end-4 top-4 text-[10px] text-fog/60">
            {project.year}
          </span>
        </div>

        <div className={flip ? "md:order-1" : ""}>
          <div className="flex items-baseline gap-4">
            <span className="numeral-ghost text-4xl md:text-5xl">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="display text-4xl text-bone md:text-5xl">{project.name}</h3>
          </div>
          {project.alt && (
            <span className="font-ar mt-1 block text-smoke">{project.alt}</span>
          )}

          <div className="mt-7 space-y-5">
            <Block label={t(locale, "spotlight.challenge")} text={cs.challenge} />
            <Block label={t(locale, "spotlight.approach")} text={cs.approach} />
            <Block label={t(locale, "spotlight.result")} text={cs.result} />
          </div>

          {cs.metrics && cs.metrics.length > 0 && (
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-6">
              {cs.metrics.map((m, j) => (
                <div key={j}>
                  <div className="display text-2xl leading-none text-bone md:text-3xl">
                    {m.value}
                  </div>
                  <div className="meta mt-2 text-[9px] text-ash">{m.label}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-7 flex flex-wrap gap-2">
            {project.stack.slice(0, 5).map((s) => (
              <span
                key={s}
                className="rounded-full border border-line px-3 py-1 font-mono text-[11px] text-smoke"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <span className="meta text-[10px] text-ash">{label}</span>
      <p className="mt-1.5 text-sm leading-relaxed text-fog">{text}</p>
    </div>
  );
}
