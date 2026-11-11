"use client";

/** Header, ERP map rail and the small-screen map sheet. */

import { useEffect, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n";
import { useTx } from "@/lib/erp/i18n";
import { BANDS, CHAPTERS, NODES, type NodeId } from "@/lib/erp/nodes";
import { scrollToElement, scrollToNode, useLitNodes, useStoryPos } from "./engine";

const TOTAL = NODES.length;

export function Header() {
  const tx = useTx();
  const { locale, setLocale } = useLocale();
  const pos = useStoryPos();
  const { lit } = useLitNodes();
  const [sheet, setSheet] = useState(false);
  const ch = pos.chapter >= 0 ? CHAPTERS[pos.chapter] : null;

  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  return (
    <>
      <header className="erp-header fixed inset-x-0 top-0 z-[60]">
        <div className="flex h-full items-center gap-4 px-4 md:px-6">
          <button
            onClick={() => scrollToElement("opening")}
            className="flex shrink-0 items-center gap-3 text-start"
            aria-label={tx({ en: "Belkhiri Abdelaziz — top", fr: "Belkhiri Abdelaziz — haut de page", ar: "بلخيري عبد العزيز — أعلى الصفحة" })}
          >
            <span className="erp-mono flex h-7 items-center bg-ink px-2 text-[0.72rem] font-semibold tracking-[0.2em] text-white">
              IURY
            </span>
            <span className="hidden text-[0.86rem] font-medium text-ink sm:block">Belkhiri Abdelaziz</span>
          </button>

          <div className="mx-auto hidden min-w-0 items-center gap-3 md:flex">
            {ch && !pos.inFinale ? (
              <button onClick={() => scrollToElement(ch.id)} className="flex min-w-0 items-center gap-3">
                <span className="erp-mono text-[0.7rem] text-faint" dir="ltr">{String(ch.n).padStart(2, "0")} / 05</span>
                <span className="truncate text-[0.84rem] text-ink">{tx(ch.title)}</span>
                <span className="erp-mono truncate text-[0.7rem] text-faint">— {tx(ch.product)}</span>
              </button>
            ) : (
              <span className="erp-mono text-[0.7rem] text-faint">
                {pos.inFinale
                  ? tx({ en: "The map, complete", fr: "La carte, complète", ar: "الخريطة مكتملة" })
                  : tx({ en: "An ERP, module by module", fr: "Un ERP, module par module", ar: "نظام تخطيط موارد، وحدةً وحدة" })}
              </span>
            )}
          </div>

          <div className="ms-auto flex items-center gap-2 md:ms-0">
            <button
              onClick={() => setSheet(true)}
              className="erp-mono flex items-center gap-2 border border-[var(--erp-hair)] px-2.5 py-1.5 text-[0.7rem] text-ink xl:hidden"
              aria-label={tx({ en: "ERP map", fr: "Carte ERP", ar: "خريطة النظام" })}
            >
              <span className="erp-dot" data-lit={lit.size ? "" : undefined} />
              {String(lit.size).padStart(2, "0")}/{TOTAL}
            </button>
            <div className="flex items-center border border-[var(--erp-hair)]">
              {LOCALES.map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  aria-pressed={locale === l}
                  className={`min-w-8 px-2 py-1.5 text-[0.7rem] leading-none transition-colors ${
                    locale === l ? "bg-ink text-white" : "text-mute hover:text-ink"
                  } ${l === "ar" ? "font-ar text-[0.8rem]" : "erp-mono"}`}
                >
                  {LOCALE_LABELS[l]}
                </button>
              ))}
            </div>
            <button
              onClick={() => scrollToElement("contact")}
              className="hidden bg-signal px-3.5 py-1.5 text-[0.8rem] font-medium text-white transition-colors hover:bg-signal-deep sm:block"
            >
              {tx({ en: "Contact", fr: "Contact", ar: "تواصل" })}
            </button>
          </div>
        </div>
        {/* page progress */}
        <span
          aria-hidden
          className="absolute bottom-[-1px] start-0 h-px bg-ink transition-[width] duration-150"
          style={{ width: `${pos.page * 100}%` }}
        />
      </header>

      {sheet && (
        <div className="fixed inset-0 z-[70] xl:hidden" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-ink/40" onClick={() => setSheet(false)} aria-label={tx({ en: "Close", fr: "Fermer", ar: "إغلاق" })} />
          <div className="absolute inset-x-0 bottom-0 max-h-[80svh] overflow-y-auto border-t border-[var(--erp-hair-2)] bg-paper p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="erp-kicker">{tx({ en: "ERP map", fr: "Carte ERP", ar: "خريطة النظام" })}</p>
              <button onClick={() => setSheet(false)} className="erp-mono text-[0.75rem] text-mute">
                ✕
              </button>
            </div>
            <MapList onPick={() => setSheet(false)} />
          </div>
        </div>
      )}
    </>
  );
}

function MapList({ onPick }: { onPick?: () => void }) {
  const tx = useTx();
  const { lit, pulses } = useLitNodes();
  return (
    <div className="erp-maplist flex flex-col gap-4">
      {BANDS.map((b) => (
        <div key={b.id}>
          <p className="erp-mono mb-1.5 text-[0.6rem] uppercase tracking-[0.18em] text-faint">
            {b.code} · {tx(b.label)}
          </p>
          <div>
            {NODES.filter((n) => n.band === b.id).map((n) => {
              const on = lit.has(n.id);
              return (
                <button
                  key={n.id}
                  data-lit={on ? "" : undefined}
                  className="erp-rail-node"
                  onClick={() => {
                    scrollToNode(n.id as NodeId);
                    onPick?.();
                  }}
                  title={tx(n.label)}
                >
                  <span className="erp-dot" data-lit={on ? "" : undefined}>
                    {on && <span key={pulses[n.id]} className="erp-pulse" />}
                  </span>
                  <span className="erp-mono w-6 shrink-0 text-[0.6rem] text-faint">{n.code}</span>
                  <span className="truncate">{tx(n.label)}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The ERP map, fixed on the right on wide screens; lights as modules are proven. */
export function MapRail() {
  const tx = useTx();
  const pos = useStoryPos();
  const { lit } = useLitNodes();
  const hidden = !pos.pastOpening || pos.inFinale;
  return (
    <aside
      data-hidden={hidden ? "" : undefined}
      className="erp-rail fixed end-5 top-[calc(var(--erp-header)+1.25rem)] z-50 hidden w-[13.5rem] xl:block"
      aria-label={tx({ en: "ERP map", fr: "Carte ERP", ar: "خريطة النظام" })}
    >
      <div className="erp-frame bg-paper/95 p-3.5">
        <span className="erp-tick tl" />
        <span className="erp-tick tr" />
        <span className="erp-tick bl" />
        <span className="erp-tick br" />
        <div className="mb-3 flex items-baseline justify-between">
          <p className="erp-kicker !text-[0.6rem]">{tx({ en: "ERP map", fr: "Carte ERP", ar: "خريطة النظام" })}</p>
          <p className="erp-mono text-[0.72rem] text-ink">
            <span className="text-signal">{String(lit.size).padStart(2, "0")}</span>
            <span className="text-faint">/{TOTAL}</span>
          </p>
        </div>
        <div className="mb-3 h-[3px] w-full bg-[var(--erp-hair)]">
          <div className="h-full bg-signal transition-[width] duration-700" style={{ width: `${(lit.size / TOTAL) * 100}%` }} />
        </div>
        <MapList />
      </div>
    </aside>
  );
}

export function Footer() {
  const tx = useTx();
  return (
    <footer className="border-t border-[var(--erp-hair)] px-5 py-8 md:px-10 xl:pe-[16rem]">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4">
        <p className="erp-mono text-[0.7rem] text-faint">© {new Date().getFullYear()} Belkhiri Abdelaziz · IURY</p>
        <p className="erp-mono text-[0.7rem] text-faint">
          {tx({
            en: "Every figure on this page was counted in the code.",
            fr: "Chaque chiffre de cette page a été compté dans le code.",
            ar: "كل رقم في هذه الصفحة أُحصي من الشيفرة نفسها.",
          })}
        </p>
      </div>
    </footer>
  );
}
