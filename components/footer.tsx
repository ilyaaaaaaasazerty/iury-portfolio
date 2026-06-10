"use client";

import Link from "next/link";
import { IuryLockup } from "./iury-mark";
import { useLocale } from "./locale-provider";
import { t } from "@/lib/i18n";
import { scrollToId } from "./smooth-scroll";
import type { Profile } from "@/lib/types";
import { IconArrow } from "./icons";

const NAV = [
  { id: "profile", key: "nav.profile" },
  { id: "work", key: "nav.index" },
  { id: "craft", key: "nav.craft" },
  { id: "contact", key: "nav.contact" },
];

export default function Footer({ profile }: { profile: Profile }) {
  const { locale } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-line">
      <div className="film-edge h-4 w-full opacity-40" aria-hidden />
      <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* brand */}
          <div className="md:col-span-5">
            <IuryLockup size={26} />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-smoke">
              {profile.name} — {profile.roles.join(" · ")}.
            </p>
            <p className="mt-4 text-xs text-ash">
              © {year} {profile.brand}. {t(locale, "footer.rights")}
            </p>
          </div>

          {/* nav */}
          <nav className="md:col-span-3">
            <span className="meta text-[10px] text-ash">{t(locale, "nav.index")}</span>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => scrollToId(n.id)}
                    className="text-sm text-smoke transition-colors hover:text-bone"
                  >
                    {t(locale, n.key)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* meta + actions */}
          <div className="flex flex-col items-start gap-5 md:col-span-4 md:items-end md:text-end">
            <Link href="/studio" className="meta text-[10px] text-smoke hover:text-bone">
              {t(locale, "nav.studio")} →
            </Link>
            <button
              onClick={() => scrollToId("top")}
              className="group flex items-center gap-3 meta text-[10px] text-smoke transition-colors hover:text-bone"
            >
              {t(locale, "common.backToTop")}
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line transition-colors group-hover:border-bone">
                <IconArrow size={13} className="-rotate-45" />
              </span>
            </button>
            <span className="meta text-[9px] text-ash/70">{t(locale, "footer.madeWith")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
