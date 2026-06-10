"use client";

import type { Profile, Project } from "@/lib/types";
import Preloader from "./preloader";
import Header from "./header";
import SceneRail from "./scene-rail";
import IntroHero from "./intro-hero";
import About from "./about";
import Services from "./services";
import WorkGallery from "./work-gallery";
import CaseStudies from "./case-study";
import Stats from "./stats";
import Process from "./process";
import Capabilities from "./capabilities";
import Contact from "./contact";
import Footer from "./footer";

export default function PortfolioClient({
  profile,
  projects,
}: {
  profile: Profile;
  projects: Project[];
}) {
  return (
    <>
      <Preloader />
      <Header />
      <SceneRail />
      <main>
        <IntroHero profile={profile} />
        <About profile={profile} />
        <Services profile={profile} />
        <WorkGallery projects={projects} />
        <CaseStudies projects={projects} />
        <Stats profile={profile} />
        <Process profile={profile} />
        <Capabilities profile={profile} />
        <Contact profile={profile} />
      </main>
      <Footer profile={profile} />
    </>
  );
}
