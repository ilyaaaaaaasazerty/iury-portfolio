"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Project } from "@/lib/types";
import { useLocale } from "./locale-provider";
import { projectTagline, t } from "@/lib/i18n";
import CoverImage from "./cover-image";
import ProjectModal from "./project-modal";
import SectionHeader from "./section-header";
import TextReveal from "./text-reveal";
import { IconArrow } from "./icons";

const primaryTag = (p: Project) => p.category.split("·")[0].trim();

export default function WorkGallery({ projects }: { projects: Project[] }) {
  const { locale } = useLocale();
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

  const numberOf = (p: Project) => projects.findIndex((x) => x.id === p.id) + 1;

  const changeFilter = (f: string) => {
    setSelected(null);
    setFilter(f);
  };
  const close = () => setSelected(null);
  const prev = () =>
    setSelected((s) => (s === null ? s : (s - 1 + filtered.length) % filtered.length));
  const next = () => setSelected((s) => (s === null ? s : (s + 1) % filtered.length));

  return (
    <section id="work" className="border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <SectionHeader num={3} labelKey="work.kicker" />

        <div className="grid gap-8 md:grid-cols-12">
          <TextReveal className="display text-[clamp(2.1rem,6vw,5.2rem)] text-bone md:col-span-7">
            {t(locale, "work.title")}
          </TextReveal>
          <p className="self-end text-sm leading-relaxed text-smoke md:col-span-4 md:col-start-9 md:text-base">
            {t(locale, "work.lead")}
          </p>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-2">
          <Chip active={filter === "all"} onClick={() => changeFilter("all")}>
            {t(locale, "work.all")}
          </Chip>
          <Chip active={filter === "featured"} onClick={() => changeFilter("featured")}>
            {t(locale, "work.featured")}
          </Chip>
          <span className="mx-1 h-4 w-px bg-line-2" />
          {tags.map((tag) => (
            <Chip key={tag} active={filter === tag} onClick={() => changeFilter(tag)}>
              {tag}
            </Chip>
          ))}
        </div>

        <motion.div
          layout
          className="mt-10 grid grid-cols-2 gap-3 [grid-auto-flow:dense] md:grid-cols-6 md:gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <Frame
                key={p.id}
                project={p}
                number={numberOf(p)}
                onClick={() => setSelected(i)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {selected !== null && filtered[selected] && (
          <ProjectModal
            project={filtered[selected]}
            index={numberOf(filtered[selected])}
            position={selected}
            total={filtered.length}
            onClose={close}
            onPrev={prev}
            onNext={next}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function Frame({
  project,
  number,
  onClick,
}: {
  project: Project;
  number: number;
  onClick: () => void;
}) {
  const { locale } = useLocale();
  const big = project.featured;
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      data-cursor
      className={`group relative overflow-hidden border border-line bg-ink text-start ${
        big
          ? "col-span-2 aspect-[4/3] md:col-span-3"
          : "col-span-1 aspect-[4/5] md:col-span-2"
      }`}
    >
      <CoverImage project={project} index={number - 1} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/15 to-void/5 transition-opacity duration-700 group-hover:from-void/80" />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
        <span className="meta text-[10px] text-fog/80">
          {t(locale, "work.frame")} {String(number).padStart(2, "0")}
        </span>
        {project.comingSoon ? (
          <span className="rounded-full border border-line-2 bg-void/60 px-2 py-0.5 meta text-[8px] text-fog backdrop-blur-sm">
            {t(locale, "common.comingSoon")}
          </span>
        ) : project.featured ? (
          <span className="h-1.5 w-1.5 rounded-full bg-fog/80" aria-hidden />
        ) : null}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="display text-2xl leading-none text-bone md:text-3xl">
              {project.name}
            </h3>
            <p className="meta mt-2.5 text-[10px] text-smoke">{project.category}</p>
          </div>
          <span className="mb-1 flex h-9 w-9 shrink-0 translate-y-2 items-center justify-center rounded-full border border-line-2 text-bone opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <IconArrow size={16} />
          </span>
        </div>
        {big && (
          <p className="mt-3 max-w-md text-sm leading-snug text-smoke opacity-0 transition-opacity duration-700 group-hover:opacity-100">
            {projectTagline(project, locale)}
          </p>
        )}
      </div>
    </motion.button>
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
      className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
        active
          ? "border-bone bg-bone text-ink"
          : "border-line text-smoke hover:border-line-2 hover:text-fog"
      }`}
    >
      {children}
    </button>
  );
}
