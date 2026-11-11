"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Project } from "@/lib/types";
import { useLocale } from "./locale-provider";
import { projectDescription, projectTagline, t, timeAgo } from "@/lib/i18n";
import { languageColor } from "@/lib/languages";
import { RepoCover } from "./cover-image";
import { IconClose, IconArrow, IconGithub, IconExternal, IconStar } from "./icons";

interface Props {
  project: Project;
  position: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function ProjectModal({
  project,
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
  const showCover = !hasImages || errored[active];
  // Adapt the viewer to each image's real orientation (clamped) so portrait
  // phone screenshots and landscape shots both display in full.
  const frameRatio = ar ? Math.min(1.8, Math.max(0.66, ar)) : 1.6;
  const repo = project.repo;

  const meta: { k: string; v: React.ReactNode }[] = [
    { k: t(locale, "common.year"), v: project.year },
    { k: t(locale, "common.role"), v: project.role },
    { k: t(locale, "common.status"), v: project.status },
    { k: t(locale, "common.category"), v: project.category },
  ];
  if (repo) {
    meta.push({ k: t(locale, "common.updated"), v: timeAgo(repo.pushedAt, locale) });
    meta.push({
      k: t(locale, "common.stars"),
      v: (
        <span className="inline-flex items-center gap-1">
          <IconStar size={13} /> {repo.stars}
        </span>
      ),
    });
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center overflow-hidden p-0 sm:items-center sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-graphite/45 backdrop-blur-md"
      />

      <motion.div
        data-lenis-prevent
        initial={{ opacity: 0, y: 40, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.985 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-t-[28px] bg-panel shadow-2xl sm:max-h-[88vh] sm:rounded-[28px]"
      >
        {/* top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-panel/85 px-5 py-3 backdrop-blur-md">
          <span className="meta text-[10px]">
            {String(position + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} — {project.category}
          </span>
          <button
            onClick={onClose}
            aria-label={t(locale, "common.close")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-mute transition-colors hover:border-ink hover:text-ink"
          >
            <IconClose size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* media */}
          <div className="min-w-0 p-4 md:p-5">
            <div
              className="group relative max-h-[72vh] w-full overflow-hidden rounded-[20px] bg-shell"
              style={{ aspectRatio: showCover ? "16 / 10" : String(frameRatio) }}
            >
              {!showCover && (
                <>
                  <img
                    src={images[active]}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl"
                  />
                  <img
                    key={images[active]}
                    src={images[active]}
                    alt={project.name}
                    onLoad={(e) =>
                      setAr(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)
                    }
                    onError={() => setErrored((e) => ({ ...e, [active]: true }))}
                    className="relative h-full w-full object-contain"
                  />
                </>
              )}
              {showCover && <RepoCover project={project} />}
            </div>
            {hasImages && images.length > 1 && (
              <div className="thumb-rail mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((im, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      i === active ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={im} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* info */}
          <div className="flex min-w-0 flex-col p-6 md:p-8">
            {project.comingSoon && (
              <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-ink px-2.5 py-1 text-[11px] text-panel">
                <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                {t(locale, "common.comingSoon")}
              </span>
            )}
            <h3 className="display text-[clamp(2rem,4.4vw,3rem)] text-ink">{project.name}</h3>
            {project.alt && <span className="font-ar mt-1 text-lg text-faint">{project.alt}</span>}
            {projectTagline(project, locale) && (
              <p className="mt-4 text-lg leading-snug text-ink/80">{projectTagline(project, locale)}</p>
            )}
            {projectDescription(project, locale) !== projectTagline(project, locale) && (
              <p className="mt-4 text-sm leading-relaxed text-mute">
                {projectDescription(project, locale)}
              </p>
            )}

            {project.caseStudy && (
              <div className="mt-7 space-y-4 border-t border-line pt-6">
                <CaseBlock label={t(locale, "spotlight.challenge")} text={project.caseStudy.challenge} />
                <CaseBlock label={t(locale, "spotlight.approach")} text={project.caseStudy.approach} />
                <CaseBlock label={t(locale, "spotlight.result")} text={project.caseStudy.result} />
              </div>
            )}

            <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6">
              {meta.map((m) => (
                <div key={m.k}>
                  <dt className="meta text-[10px]">{m.k}</dt>
                  <dd className="mt-1 text-sm text-ink">{m.v}</dd>
                </div>
              ))}
            </dl>

            {project.stack.length > 0 && (
              <div className="mt-6">
                <span className="meta text-[10px]">{t(locale, "common.stack")}</span>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {project.stack.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper/60 px-2.5 py-1 font-mono text-[11px] text-mute"
                    >
                      {s === repo?.language && (
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: languageColor(s) }} />
                      )}
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(project.links.github || project.links.live || project.links.demo) && (
              <div className="mt-7 flex flex-wrap gap-2.5">
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

            <div className="mt-auto flex items-center justify-end gap-2 pt-8">
              <NavBtn onClick={onPrev} label={t(locale, "common.prev")} dir="prev" />
              <NavBtn onClick={onNext} label={t(locale, "common.next")} dir="next" />
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
      <span className="meta text-[10px]">{label}</span>
      <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-mute">{text}</p>
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
          ? "bg-ink text-panel hover:bg-graphite"
          : "border border-line-2 text-ink hover:border-ink"
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
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-mute transition-colors hover:border-ink hover:text-ink"
    >
      <IconArrow size={16} className={dir === "prev" ? "rotate-[225deg]" : "rotate-45"} />
    </button>
  );
}
