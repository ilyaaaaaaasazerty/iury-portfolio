"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import { bladePaths } from "@/lib/aperture";
import { plateConfig, type PlateConfig } from "@/lib/plate";

interface Props {
  project: Project;
  index?: number;
  className?: string;
}

/** A project cover. Falls back to a distinct, seeded film-plate when no image exists. */
export default function CoverImage({ project, index = 0, className = "" }: Props) {
  const [errored, setErrored] = useState(false);
  const src = project.images?.[0];
  const showImage = src && !errored;

  return (
    <div className={`relative h-full w-full overflow-hidden bg-ink-2 ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt={project.name}
          loading="lazy"
          onError={() => setErrored(true)}
          className="h-full w-full select-none object-cover grayscale-[0.5] contrast-[1.05] transition-[transform,filter] duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] group-hover:grayscale-0"
          draggable={false}
        />
      ) : (
        <AperturePlate project={project} index={index} />
      )}
    </div>
  );
}

export function AperturePlate({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const cfg = plateConfig(project.id, project.category);
  const blades = bladePaths({ ri: 9, ro: 60, span: 40, swirl: cfg.swirl, count: cfg.blades });

  return (
    <div className="relative h-full w-full noise-card">
      {/* blueprint grid */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)",
          backgroundSize: `${cfg.grid}px ${cfg.grid}px`,
        }}
      />
      <div className="light-drift absolute inset-0" />

      {/* the aperture motif */}
      <svg
        viewBox="0 0 100 100"
        className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 text-fog/[0.09] transition-transform duration-[1.6s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-[20deg]"
        fill="currentColor"
        style={{ transform: `rotate(${cfg.rotate}deg)` }}
      >
        <g fill="currentColor" stroke="var(--color-ink)" strokeWidth="0.4">
          {blades.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <circle cx="50" cy="50" r="9" fill="var(--color-ink-2)" />
      </svg>

      <PlateVariantLayer cfg={cfg} />

      {/* ghost frame numeral */}
      <span className="numeral-ghost pointer-events-none absolute -bottom-3 end-3 text-[7rem] opacity-[0.55] md:text-[9rem]">
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  );
}

function PlateVariantLayer({ cfg }: { cfg: PlateConfig }) {
  if (cfg.variant === "rings") {
    return (
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full text-fog/10" fill="none">
        {Array.from({ length: cfg.ringCount }).map((_, i) => (
          <circle
            key={i}
            cx="50"
            cy="50"
            r={12 + i * (38 / cfg.ringCount)}
            stroke="currentColor"
            strokeWidth="0.4"
          />
        ))}
      </svg>
    );
  }
  if (cfg.variant === "sprockets") {
    return (
      <>
        <div className="film-edge absolute inset-x-0 top-0 h-5 opacity-70" />
        <div className="film-edge absolute inset-x-0 bottom-0 h-5 opacity-70" />
      </>
    );
  }
  if (cfg.variant === "waveform") {
    return (
      <div className="absolute inset-x-6 top-1/2 flex h-16 -translate-y-1/2 items-center justify-between gap-[3px] opacity-25">
        {cfg.bars.map((b, i) => (
          <span
            key={i}
            className="w-full rounded-full bg-fog"
            style={{ height: `${Math.round(b * 100)}%` }}
          />
        ))}
      </div>
    );
  }
  if (cfg.variant === "scan") {
    return (
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 5px)",
        }}
      />
    );
  }
  // specsheet
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full text-fog/12" fill="none">
        <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2 3" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2 3" />
      </svg>
      <span className="meta absolute start-4 top-4 text-[9px] text-ash/70">ƒ/1.4 · ISO 800</span>
    </div>
  );
}
