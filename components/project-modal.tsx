"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Project } from "@/lib/types";
import { useLocale } from "./locale-provider";
import { projectDescription, projectTagline, t } from "@/lib/i18n";
import { AperturePlate } from "./cover-image";
import { IconClose, IconArrow, IconGithub, IconExternal } from "./icons";

interface Props {
  project: Project;
  index: number;
  position: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function ProjectModal({
  project,
  index,
  position,
  total,
  onClose,
  onPrev,
  onNext,
}: Props) {
  const { locale } = useLocale();
  const [active, setActive] = useState(0);
  const [errored, setErrored] = useState<Record<number, boolean>>({});
  const [ar, setAr] = useState<number | null>(null);

  useEffect(() => {
    setActive(0);
    setErrored({});
    setAr(null);
  }, [project.id]);

  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop?.();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start?.();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onNext, onPrev]);

  const images = project.images ?? [];
  const hasImages = images.length > 0;
  const showPlate = !hasImages || errored[active];
  // Adapt the viewer frame to each image's real orientation (clamped) so portrait
  // phone screenshots and landscape shots both display in full — no cropping.
  const frameRatio = ar ? Math.min(1.8, Math.max(0.66, ar)) : 1.6;

  const meta: { k: string; v: string }[] = [
    { k: t(locale, "common.year"), v: project.year },
    { k: t(locale, "common.role"), v: project.role },
    { k: t(locale, "common.status"), v: project.status },
    { k: t(locale, "common.category"), v: project.category },
  ];

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center overflow-hidden p-0 sm:items-center sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-void/85 backdrop-blur-md"
      />

      <motion.div
        data-lenis-prevent
        initial={{ opacity: 0, y: 40, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.985 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-h-[92vh] w-full max-w-5xl overflow-y-auto border border-line bg-ink-2 sm:max-h-[88vh]"
      >
        {/* top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-ink-2/80 px-5 py-3 backdrop-blur-md">
          <span className="meta text-[10px] text-ash">
            {t(locale, "work.frame")} {String(index).padStart(2, "0")} — {project.category}
          </span>
          <button
            onClick={onClose}
            aria-label={t(locale, "common.close")}
            className="flex items-center gap-2 text-smoke transition-colors hover:text-bone"
          >
            <span className="meta text-[10px]">{t(locale, "common.close")}</span>
            <IconClose size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* media */}
          <div className="min-w-0 border-b border-line p-5 md:border-b-0 md:border-e">
            <div className="film-edge h-2 opacity-50" aria-hidden />
            <div
              className="group relative max-h-[72vh] w-full overflow-hidden border-y border-line bg-ink"
              style={{ aspectRatio: showPlate ? "16 / 10" : String(frameRatio) }}
            >
              {!showPlate && (
                <>
                  {/* blurred backdrop fills the frame for any aspect ratio */}
                  <img
                    src={images[active]}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl"
                  />
                  <img
                    key={images[active]}
                    src={images[active]}
                    alt={project.name}
                    onLoad={(e) =>
                      setAr(
                        e.currentTarget.naturalWidth / e.currentTarget.naturalHeight
                      )
                    }
                    onError={() => setErrored((e) => ({ ...e, [active]: true }))}
                    className="relative h-full w-full object-contain"
                  />
                </>
              )}
              {showPlate && <AperturePlate project={project} index={index - 1} />}
            </div>
            <div className="film-edge h-2 opacity-50" aria-hidden />
            {hasImages && images.length > 1 && (
              <div className="thumb-rail mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((im, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden border transition-colors ${
                      i === active ? "border-bone" : "border-line hover:border-line-2"
                    }`}
                  >
                    <img src={im} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* info */}
          <div className="flex min-w-0 flex-col p-7 md:p-9">
            {project.comingSoon && (
              <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-line-2 px-2.5 py-1 meta text-[9px] text-fog">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {t(locale, "common.comingSoon")}
              </span>
            )}
            <h3 className="display text-[clamp(2rem,5vw,3.2rem)] leading-[0.95] text-bone">
              {project.name}
            </h3>
            {project.alt && (
              <span className="font-ar mt-1 text-lg text-smoke">{project.alt}</span>
            )}
            <p className="display-italic mt-4 text-lg italic text-fog">
              {projectTagline(project, locale)}
            </p>
            <p className="mt-5 text-sm leading-relaxed text-smoke">
              {projectDescription(project, locale)}
            </p>

            {project.caseStudy && (
              <div className="mt-7 space-y-4 border-t border-line pt-7">
                <CaseBlock label={t(locale, "spotlight.challenge")} text={project.caseStudy.challenge} />
                <CaseBlock label={t(locale, "spotlight.approach")} text={project.caseStudy.approach} />
                <CaseBlock label={t(locale, "spotlight.result")} text={project.caseStudy.result} />
              </div>
            )}

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-7">
              {meta.map((m) => (
                <div key={m.k}>
                  <dt className="meta text-[10px] text-ash">{m.k}</dt>
                  <dd className="mt-1.5 text-sm text-fog">{m.v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-7">
              <span className="meta text-[10px] text-ash">{t(locale, "common.stack")}</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.stack.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-line px-3 py-1 font-mono text-[11px] text-smoke"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {(project.links.github || project.links.live || project.links.demo) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {project.links.live && (
                  <LinkBtn href={project.links.live} primary>
                    <IconExternal size={15} />
                    {t(locale, "common.live")}
                  </LinkBtn>
                )}
                {project.links.demo && (
                  <LinkBtn href={project.links.demo}>
                    <IconExternal size={15} />
                    {t(locale, "common.demo")}
                  </LinkBtn>
                )}
                {project.links.github && (
                  <LinkBtn href={project.links.github}>
                    <IconGithub size={15} />
                    {t(locale, "common.source")}
                  </LinkBtn>
                )}
              </div>
            )}

            <div className="mt-auto flex items-center justify-between gap-4 border-t border-line pt-7 mt-9">
              <span className="meta text-[10px] text-ash tnum">
                {String(position + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-2">
                <NavBtn onClick={onPrev} label={t(locale, "common.prev")} dir="prev" />
                <NavBtn onClick={onNext} label={t(locale, "common.next")} dir="next" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function CaseBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <span className="meta text-[10px] text-ash">{label}</span>
      <p className="mt-1.5 text-sm leading-relaxed text-fog">{text}</p>
    </div>
  );
}

function LinkBtn({
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
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
        primary
          ? "bg-bone text-ink hover:bg-fog"
          : "border border-line-2 text-fog hover:border-bone hover:text-bone"
      }`}
    >
      {children}
    </a>
  );
}

function NavBtn({
  onClick,
  label,
  dir,
}: {
  onClick: () => void;
  label: string;
  dir: "prev" | "next";
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-smoke transition-colors hover:border-bone hover:text-bone"
    >
      <IconArrow
        size={16}
        className={dir === "prev" ? "rotate-[225deg]" : "rotate-45"}
      />
    </button>
  );
}
