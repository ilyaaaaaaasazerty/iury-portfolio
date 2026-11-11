"use client";

/**
 * The enterprise story: opening → five chapters, each proving ERP modules
 * on a real system → the complete map → how I work → contact.
 */

import "./erp.css";
import type { Profile } from "@/lib/types";
import { CHAPTERS } from "@/lib/erp/nodes";
import { DeepLink, StoryTracker } from "./engine";
import { Footer, Header, MapRail } from "./chrome";
import Opening from "./opening";
import { Contact, Finale, HowIWork } from "./finale";
import ImmoChapter from "./chapters/immo";
import PosChapter from "./chapters/pos";
import WashChapter from "./chapters/wash";
import DapperChapter from "./chapters/dapper";
import ChatChapter from "./chapters/chat";

const CHAPTER_VIEWS = {
  immo: ImmoChapter,
  pos: PosChapter,
  wash: WashChapter,
  dapper: DapperChapter,
  chat: ChatChapter,
} as const;

export default function Story({ profile }: { profile: Profile }) {
  return (
    <div className="erp-page min-h-screen">
      <StoryTracker />
      <DeepLink />
      <Header />
      <MapRail />
      <main>
        <Opening />
        {CHAPTERS.map((c) => {
          const View = CHAPTER_VIEWS[c.id as keyof typeof CHAPTER_VIEWS];
          return (
            <div key={c.id} id={c.id} className="relative border-t border-[var(--erp-hair-2)]">
              <View />
            </div>
          );
        })}
        <Finale />
        <HowIWork />
        <Contact profile={profile} />
      </main>
      <Footer />
    </div>
  );
}
