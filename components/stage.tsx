"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Robot from "./robot";
import { useIury } from "./iury-context";
import { useLocale } from "./locale-provider";
import { scrollToId } from "./smooth-scroll";
import { useMounted, useTyped } from "./iury";
import { LOCALES, LOCALE_LABELS, pick, t } from "@/lib/i18n";
import type { Locale, Profile } from "@/lib/types";

const NAV = [
  { id: "work", key: "nav.work" },
  { id: "case", key: "nav.case" },
  { id: "profile", key: "nav.profile" },
  { id: "craft", key: "nav.craft" },
  { id: "contact", key: "nav.contact" },
];

const POKES = ["iury.poke.1", "iury.poke.2", "iury.poke.3", "iury.poke.4"];

/** IURY's live head + wordmark. */
export function IuryLockup({ sub }: { sub?: string }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex h-9 w-14 items-center justify-center rounded-full bg-panel ring-1 ring-line">
        <Robot variant="head" className="h-6 w-auto" />
      </span>
      <span className="flex flex-col items-start leading-none">
        <span className="font-display text-lg font-bold tracking-[-0.02em] text-ink">IURY</span>
        {sub && <span className="mt-1 hidden text-[11px] text-faint sm:block">{sub}</span>}
      </span>
    </span>
  );
}

/** Pokes and hover greetings, shared by the stage and the mobile companion. */
function usePoke() {
  const { locale } = useLocale();
  const { react, line } = useIury();
  const n = useRef(0);
  return {
    poke: () => react(t(locale, POKES[n.current++ % POKES.length]), "happy", 3600),
    greet: () => {
      if (line.pose !== "happy") react(t(locale, "iury.hover"), "wave", 2400);
    },
  };
}

/**
 * The left pane on desktop (sticky, always on screen) and the opening block
 * on mobile: IURY himself, what he's saying, and the page's navigation.
 */
export default function Stage({ profile }: { profile: Profile }) {
  const { locale, setLocale, dir } = useLocale();
  const { line, active } = useIury();
  const { poke, greet } = usePoke();
  const typed = useTyped(line.text, true, 15);
  const speaking = typed.length < line.text.length;

  return (
    <aside id="stage" className="relative p-3 lg:sticky lg:top-0 lg:h-[100svh]">
      <div className="relative flex h-full flex-col overflow-hidden rounded-[32px] bg-shell ring-1 ring-line">
        <div className="bg-dots pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-[#cbcbcf]"
        />

        {/* top bar */}
        <div className="relative flex items-center justify-between px-5 pt-5">
          <button onClick={() => scrollToId("intro")} aria-label="IURY" className="transition-opacity hover:opacity-80">
            <IuryLockup sub={t(locale, "iury.role")} />
          </button>
          <LocaleToggle locale={locale} setLocale={setLocale} />
        </div>

        {/* IURY + speech */}
        <div className="relative flex min-h-0 flex-1 flex-col items-center justify-end px-5 pt-6">
          <div className="relative z-10 mb-3 w-full max-w-[420px]" aria-live="polite">
            <AnimatePresence mode="wait">
              {line.text && (
                <motion.div
                  key={line.id}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="speech mx-auto w-fit max-w-full px-5 py-3.5 text-[15px] leading-relaxed text-ink"
                >
                  <span className={speaking ? "caret" : ""}>{typed}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={poke}
            onPointerEnter={greet}
            aria-label="IURY"
            className="relative w-full max-w-[400px] cursor-pointer outline-none lg:max-w-[min(460px,54vh)]"
          >
            <Robot pose={line.pose} speaking={speaking} mirror={dir === "rtl"} className="h-auto w-full" />
          </button>
        </div>

        {/* navigation, as replies */}
        <div className="relative px-5 pb-5 pt-3">
          <nav className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => scrollToId(n.id)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-sm transition-colors ${
                  active === n.id
                    ? "bg-ink text-panel"
                    : "bg-panel/80 text-mute ring-1 ring-line hover:text-ink"
                }`}
              >
                {t(locale, n.key)}
              </button>
            ))}
          </nav>
          <StatusRow profile={profile} />
        </div>
      </div>
    </aside>
  );
}

function StatusRow({ profile }: { profile: Profile }) {
  const { locale } = useLocale();
  const mounted = useMounted();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Algiers",
  }).format(now);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] text-mute">
      <span className="flex items-center gap-2">
        <span className={`led ${profile.available ? "led-green" : ""}`} />
        {t(locale, profile.available ? "common.available" : "common.unavailable")}
      </span>
      <span>{pick(profile.location, locale)}</span>
      {mounted && (
        <span>
          {t(locale, "iury.localTime")} {time}
        </span>
      )}
    </div>
  );
}

function LocaleToggle({ locale, setLocale }: { locale: Locale; setLocale: (l: Locale) => void }) {
  return (
    <div className="flex items-center gap-0.5 rounded-full bg-panel/80 p-0.5 ring-1 ring-line">
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={`min-w-8 rounded-full px-2.5 py-1.5 text-[11px] font-medium leading-none transition-colors ${
            locale === l ? "bg-ink text-panel" : "text-mute hover:text-ink"
          } ${l === "ar" ? "font-ar text-[13px]" : "font-mono"}`}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}

/** On small screens, once the stage scrolls away IURY follows as a small floating head. */
export function Companion() {
  const { line } = useIury();
  const { poke } = usePoke();
  const [away, setAway] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = document.getElementById("stage");
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setAway(!e.isIntersecting), { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Pop the bubble open for each new line, then tuck it away.
  useEffect(() => {
    if (!line.text) return;
    setOpen(true);
    const id = setTimeout(() => setOpen(false), 5000);
    return () => clearTimeout(id);
  }, [line.id, line.text]);

  return (
    <AnimatePresence>
      {away && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 end-4 z-[90] flex items-end gap-2 lg:hidden"
        >
          <AnimatePresence>
            {open && (
              <motion.p
                key={line.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="speech mb-2 w-64 max-w-[calc(100vw-7rem)] px-3.5 py-2.5 text-[13px] leading-snug text-ink after:hidden"
              >
                {line.text}
              </motion.p>
            )}
          </AnimatePresence>
          <button
            onClick={() => {
              poke();
              setOpen(true);
            }}
            aria-label="IURY"
            className="plate flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
          >
            <Robot variant="head" pose={line.pose} className="h-8 w-auto" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
