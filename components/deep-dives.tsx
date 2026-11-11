"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Module } from "./modules";
import CoverImage from "./cover-image";
import Reveal from "./reveal";
import { useLocale } from "./locale-provider";
import { t } from "@/lib/i18n";
import type { Project } from "@/lib/types";

/** Spotlight projects as an accordion: the problem, the approach, the result. */
export default function DeepDives({ projects, index }: { projects: Project[]; index: number }) {
  const { locale } = useLocale();
  const spots = projects.filter((p) => p.spotlight && p.caseStudy);
  const [open, setOpen] = useState<string | null>(spots[0]?.id ?? null);
  if (!spots.length) return null;

  return (
    <Module id="case" index={index} label={t(locale, "spotlight.kicker")} say={t(locale, "spotlight.note")} pose="think">
      <div className="space-y-3">
        {spots.map((p, i) => {
          const isOpen = open === p.id;
          const cs = p.caseStudy!;
          return (
            <Reveal key={p.id} delay={i * 0.05}>
              <article className="overflow-hidden rounded-[24px] bg-panel ring-1 ring-line">
                <button
                  onClick={() => setOpen(isOpen ? null : p.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 p-3 text-start"
                >
                  <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-[14px]">
                    <CoverImage project={p} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="display block truncate text-2xl text-ink">{p.name}</span>
                    <span className="block truncate text-sm text-mute">{p.category} · {p.year}</span>
                  </span>
                  <span
                    className={`me-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg transition-all ${
                      isOpen ? "rotate-45 bg-ink text-panel" : "ring-1 ring-line-2 text-ink"
                    }`}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="grid gap-5 border-t border-line p-6 md:grid-cols-3">
                        <Block label={t(locale, "spotlight.challenge")} text={cs.challenge} />
                        <Block label={t(locale, "spotlight.approach")} text={cs.approach} />
                        <Block label={t(locale, "spotlight.result")} text={cs.result} />
                      </div>
                      {cs.metrics && cs.metrics.length > 0 && (
                        <div className="grid grid-cols-3 gap-px border-t border-line bg-line">
                          {cs.metrics.map((m, j) => (
                            <div key={j} className="bg-panel px-6 py-4">
                              <div className="display text-2xl text-ink">{m.value}</div>
                              <div className="mt-1 text-xs text-mute">{m.label}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Module>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-signal">{label}</span>
      <p className="mt-2 max-h-56 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-mute" data-lenis-prevent>
        {text}
      </p>
    </div>
  );
}
