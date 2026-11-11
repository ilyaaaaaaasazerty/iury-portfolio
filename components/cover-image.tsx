"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import { languageColor } from "@/lib/languages";

interface Props {
  project: Project;
  className?: string;
}

/** A project cover: the first screenshot, or a generated repository card. */
export default function CoverImage({ project, className = "" }: Props) {
  const [errored, setErrored] = useState(false);
  const src = project.images?.[0];
  const showImage = src && !errored;

  return (
    <div className={`relative h-full w-full overflow-hidden bg-shell ${className}`}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={project.name}
          loading="lazy"
          onError={() => setErrored(true)}
          className="h-full w-full select-none object-contain p-5 transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          draggable={false}
        />
      ) : (
        <RepoCover project={project} />
      )}
    </div>
  );
}

/** Generated cover for projects without screenshots — a terminal-style repo card. */
export function RepoCover({ project }: { project: Project }) {
  const lang = project.repo?.language ?? project.stack[0];
  const color = languageColor(lang);
  const owner = project.repo?.fullName.split("/")[0];
  return (
    <div className="bg-dots relative flex h-full w-full flex-col justify-between p-5">
      <div className="flex items-center gap-1.5" aria-hidden>
        <span className="h-2 w-2 rounded-full bg-steel" />
        <span className="h-2 w-2 rounded-full bg-steel" />
        <span className="h-2 w-2 rounded-full bg-steel" />
      </div>
      <div className="min-w-0">
        <div className="truncate font-mono text-[11px] text-faint">
          {owner ? `${owner} /` : "~ /"}
        </div>
        <div
          className="display mt-1 truncate text-[clamp(1.6rem,3.2vw,2.4rem)] text-ink/85 transition-transform duration-700 group-hover:translate-x-1"
          dir="ltr"
        >
          {project.repo?.name ?? project.slug}
        </div>
      </div>
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
    </div>
  );
}
