"use client";

import type { Profile, Project } from "@/lib/types";
import { IuryProvider } from "./iury-context";
import Stage, { Companion } from "./stage";
import { Intro, About, Skills, Contact } from "./modules";
import WorkGallery from "./work-gallery";
import DeepDives from "./deep-dives";

/**
 * IURY lives in the sticky stage on the left and narrates the feed on the
 * right as each block scrolls into view.
 */
export default function PortfolioClient({
  profile,
  projects,
  username,
}: {
  profile: Profile;
  projects: Project[];
  username: string;
}) {
  const hasDeepDives = projects.some((p) => p.spotlight && p.caseStudy);
  let n = 1;
  return (
    <IuryProvider>
      <div className="mx-auto max-w-[1600px] lg:grid lg:grid-cols-[minmax(400px,42%)_1fr]">
        <Stage profile={profile} />
        <main className="space-y-24 px-5 pb-10 md:px-10 lg:space-y-32 lg:px-12 lg:pt-3">
          <Intro profile={profile} />
          <WorkGallery projects={projects} index={n++} username={username} />
          {hasDeepDives && <DeepDives projects={projects} index={n++} />}
          <About profile={profile} index={n++} />
          <Skills profile={profile} index={n++} />
          <Contact profile={profile} index={n++} />
        </main>
      </div>
      <Companion />
    </IuryProvider>
  );
}
