"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Project } from "@/lib/types";
import { useLocale } from "./locale-provider";
import { useIury } from "./iury-context";
import { useMounted } from "./iury";
import { Module } from "./modules";
import { projectTagline, t, timeAgo } from "@/lib/i18n";
import { languageColor } from "@/lib/languages";
import CoverImage from "./cover-image";
import ProjectModal from "./project-modal";
import { IconArrow, IconGithub, IconStar } from "./icons";

const primaryTag = (p: Project) => p.category.split("·")[0].trim();

export default function WorkGallery({
  projects,
  index,
  username,
}: {
  projects: Project[];
  index: number;
  username: string;
}) {
  const { locale } = useLocale();
  const mounted = useMounted();
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<number | null>(null);

  const tags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => set.add(primaryTag(p)));
    return Array.from(set);
  }, [projects]);

  const filtered = useMemo(() => {
    if (filter === "all") return projects;
    if (filter === "featured") return projects.filter((p) => p.featured);
    return projects.filter((p) => primaryTag(p) === filter);
  }, [projects, filter]);

  const latestPush = useMemo(
    () =>
      projects
        .map((p) => p.repo?.pushedAt)
        .filter(Boolean)
        .sort()
        .pop(),
    [projects]
  );
  const say =
    latestPush && mounted
      ? t(locale, "work.note", { count: projects.length, when: timeAgo(latestPush, locale) })
      : t(locale, "work.noteStatic");

  const changeFilter = (f: string) => {
    setSelected(null);
    setFilter(f);
  };
  const close = () => setSelected(null);
  const prev = () =>
    setSelected((s) => (s === null ? s : (s - 1 + filtered.length) % filtered.length));
  const next = () => setSelected((s) => (s === null ? s : (s + 1) % filtered.length));

  return (
    <Module
      id="work"
      index={index}
      label={t(locale, "work.kicker")}
      say={say}
      pose="point"
      meta={
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-ink"
        >
          <IconGithub size={12} /> {username}
        </a>
      }
    >
      <h2 className="display text-[clamp(2.2rem,4.4vw,3.8rem)] text-ink">{t(locale, "work.title")}</h2>
      <p className="mt-4 max-w-xl leading-relaxed text-mute">{t(locale, "work.lead")}</p>

      <div className="mt-8 flex flex-wrap items-center gap-1.5">
        <Chip active={filter === "all"} onClick={() => changeFilter("all")}>
          {t(locale, "work.all")}
          <span className="font-mono text-[10px] opacity-60">{projects.length}</span>
        </Chip>
        <Chip active={filter === "featured"} onClick={() => changeFilter("featured")}>
          <span className="h-1.5 w-1.5 rounded-full bg-signal" />
          {t(locale, "work.featured")}
        </Chip>
        {tags.map((tag) => (
          <Chip key={tag} active={filter === tag} onClick={() => changeFilter(tag)}>
            {tag}
          </Chip>
        ))}
      </div>

      <motion.div layout className="mt-6 grid grid-cols-1 gap-3 [grid-auto-flow:dense] sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((p, i) => (
            <Card key={p.id} project={p} onClick={() => setSelected(i)} />
          ))}
        </AnimatePresence>
      </motion.div>
      {!filtered.length && <p className="mt-10 text-center text-sm text-faint">{t(locale, "work.empty")}</p>}

      <AnimatePresence>
        {selected !== null && filtered[selected] && (
          <ProjectModal
            project={filtered[selected]}
            position={selected}
            total={filtered.length}
            onClose={close}
            onPrev={prev}
            onNext={next}
          />
        )}
      </AnimatePresence>
    </Module>
  );
}

function Card({ project, onClick }: { project: Project; onClick: () => void }) {
  const { locale } = useLocale();
  const { react, release } = useIury();
  const mounted = useMounted();
  const big = project.featured;
  const lang = project.repo?.language;
  const tagline = projectTagline(project, locale);

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      onPointerEnter={() => react(tagline ? `${project.name} — ${tagline}` : project.name, "point", 0)}
      onPointerLeave={release}
      className={`group flex flex-col overflow-hidden rounded-[22px] bg-panel p-1.5 text-start ring-1 ring-line transition-[box-shadow,transform] duration-500 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-26px_rgba(19,19,22,0.45)] ${
        big ? "sm:col-span-2" : ""
      }`}
    >
      <div className={`relative overflow-hidden rounded-[17px] ${big ? "aspect-[16/7]" : "aspect-[16/10]"}`}>
        <CoverImage project={project} className="absolute inset-0" />
        <div className="absolute inset-x-2.5 top-2.5 flex items-center justify-between gap-2">
          <span className="truncate rounded-full bg-panel/90 px-2.5 py-1 text-[11px] text-mute backdrop-blur">
            {project.category}
          </span>
          {project.comingSoon ? (
            <Badge>{t(locale, "common.comingSoon")}</Badge>
          ) : project.featured ? (
            <Badge led>{t(locale, "work.featured")}</Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-2.5 pt-3.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="display text-xl text-ink md:text-2xl">{project.name}</h3>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-mute ring-1 ring-line transition-all duration-500 group-hover:bg-ink group-hover:text-panel group-hover:ring-ink">
            <IconArrow size={14} />
          </span>
        </div>
        {tagline && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-mute">{tagline}</p>}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3.5 font-mono text-[11px] text-faint">
          {lang && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: languageColor(lang) }} />
              {lang}
            </span>
          )}
          {!!project.repo?.stars && (
            <span className="flex items-center gap-1">
              <IconStar size={12} /> {project.repo.stars}
            </span>
          )}
          {project.repo ? (
            <span className="flex items-center gap-1.5">
              <IconGithub size={12} />
              {mounted ? timeAgo(project.repo.pushedAt, locale) : project.repo.pushedAt.slice(0, 10)}
            </span>
          ) : (
            <span>{project.year}</span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

function Badge({ children, led }: { children: React.ReactNode; led?: boolean }) {
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-[11px] text-panel">
      {led && <span className="h-1.5 w-1.5 rounded-full bg-signal" />}
      {children}
    </span>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors ${
        active ? "bg-ink text-panel" : "bg-panel text-mute ring-1 ring-line hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
