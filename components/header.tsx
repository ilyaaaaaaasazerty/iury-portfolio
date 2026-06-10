"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { IuryLockup } from "./iury-mark";
import { useLocale } from "./locale-provider";
import { scrollToId } from "./smooth-scroll";
import { LOCALES, LOCALE_LABELS, t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { IconMenu, IconClose } from "./icons";

const NAV: { id: string; key: string }[] = [
  { id: "work", key: "nav.index" },
  { id: "profile", key: "nav.profile" },
  { id: "craft", key: "nav.craft" },
  { id: "contact", key: "nav.contact" },
];

export default function Header() {
  const { locale, setLocale } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[100] transition-colors duration-500 ${
          scrolled
            ? "border-b border-line bg-ink/70 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5 md:px-10">
          <button
            onClick={() => go("top")}
            aria-label="IURY — top"
            className="transition-opacity hover:opacity-70"
          >
            <IuryLockup size={26} />
          </button>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 md:flex">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className="meta text-[11px] text-smoke transition-colors hover:text-bone"
              >
                {t(locale, item.key)}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-5">
            <LocaleToggle locale={locale} setLocale={setLocale} />
            <Link
              href="/studio"
              className="hidden meta text-[11px] text-smoke transition-colors hover:text-bone md:inline"
            >
              {t(locale, "nav.studio")}
            </Link>
            <button
              onClick={() => setOpen(true)}
              aria-label={t(locale, "common.menu")}
              className="md:hidden"
            >
              <IconMenu size={22} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[110] flex flex-col bg-ink/95 backdrop-blur-2xl md:hidden"
          >
            <div className="flex h-16 items-center justify-between px-5">
              <IuryLockup size={26} />
              <button onClick={() => setOpen(false)} aria-label={t(locale, "common.close")}>
                <IconClose size={24} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col justify-center gap-2 px-7">
              {NAV.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i + 0.1, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => go(item.id)}
                  className="display text-start text-6xl text-bone"
                >
                  {t(locale, item.key)}
                </motion.button>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-10 border-t border-line pt-6"
              >
                <Link
                  href="/studio"
                  className="meta text-xs text-smoke"
                  onClick={() => setOpen(false)}
                >
                  {t(locale, "nav.studio")} →
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function LocaleToggle({
  locale,
  setLocale,
}: {
  locale: Locale;
  setLocale: (l: Locale) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-line p-0.5">
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={`min-w-7 rounded-full px-2 py-1 text-[11px] font-medium leading-none transition-colors ${
            locale === l
              ? "bg-bone text-ink"
              : "text-smoke hover:text-bone"
          } ${l === "ar" ? "font-ar text-[13px]" : "font-mono"}`}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
