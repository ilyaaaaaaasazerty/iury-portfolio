"use client";

/**
 * Opening: who, what, and the empty ERP map drawing itself — then the map
 * shrinks away toward the rail and the chapters begin.
 */

import type { ReactNode } from "react";
import { useTx } from "@/lib/erp/i18n";
import { BANDS, NODES } from "@/lib/erp/nodes";
import { inv, lerp, seg } from "@/lib/erp/sv";
import { At, AtStack, Scene, useLitNodes } from "./engine";
import Schematic from "./schematic";

export default function Opening() {
  return (
    <Scene id="opening" beats={4} length={85} label="Opening">
      <OpeningStage />
    </Scene>
  );
}

function OpeningStage() {
  const tx = useTx();
  const { lit } = useLitNodes();

  const heroOut = seg("--b0", 0.4, 0.95);
  const mapIn = seg("--b0", 0.65, 1);
  const mapOut = seg("--b3", 0.35, 0.95);

  return (
    <div className="erp-grid relative h-full w-full">
      {/* hero — sized by viewport height too, so it fits a short laptop screen */}
      <div
        className="absolute inset-0 flex flex-col justify-center px-5 pb-5 pt-[calc(var(--erp-header)+1rem)] md:px-10"
        style={{
          opacity: inv(heroOut),
          transform: `translate3d(0, ${lerp(heroOut, 0, -70, "px")}, 0)`,
        }}
      >
        <div className="mx-auto grid w-full max-w-[1280px] items-end gap-6 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-8">
            <p className="erp-kicker">
              Belkhiri Abdelaziz —{" "}
              {tx({
                en: "independent software engineer · Algeria",
                fr: "ingénieur logiciel indépendant · Algérie",
                ar: "مهندس برمجيات مستقل · الجزائر",
              })}
            </p>
            <h1 className="erp-display mt-4 text-[clamp(2.15rem,min(6vw,9.2svh),6.4rem)] text-ink md:mt-5">
              {tx({
                en: "I build the systems an organization runs on.",
                fr: "Je construis les systèmes sur lesquels une organisation fonctionne.",
                ar: "أبني الأنظمة التي تقوم عليها المؤسسات.",
              })}
            </h1>
            <p className="erp-body mt-4 max-w-[44rem] text-[0.98rem] md:mt-6 md:text-[clamp(1rem,2.4svh,1.18rem)]">
              {tx({
                en: "Contracts and payment schedules, accounting journals, warehouses, field crews, portals, real-time messaging — five systems designed and built end to end. Scroll, and each one is taken apart: what it solves, how it works, and why it was built that way.",
                fr: "Contrats et échéanciers, journaux comptables, entrepôts, équipes terrain, portails, messagerie temps réel — cinq systèmes conçus et construits de bout en bout. Faites défiler : chacun est démonté pièce par pièce — ce qu'il résout, comment il fonctionne, et pourquoi il a été construit ainsi.",
                ar: "عقود وجداول دفع، يوميات محاسبية، مستودعات، فرق ميدانية، بوابات، ومراسلة آنية — خمسة أنظمة صُمّمت وبُنيت من البداية إلى النهاية. مرّر الصفحة، وستُفكَّك كلّ منظومة أمامك: ماذا تحلّ، كيف تعمل، ولماذا بُنيت بهذه الطريقة.",
              })}
            </p>
          </div>

          <div className="lg:col-span-4">
            <div className="erp-frame bg-paper p-3.5 md:p-4" dir="ltr">
              <span className="erp-tick tl" />
              <span className="erp-tick tr" />
              <span className="erp-tick bl" />
              <span className="erp-tick br" />
              <p className="erp-mono mb-2 text-[0.62rem] uppercase tracking-[0.16em] text-faint md:mb-3">
                {tx({ en: "Spec · 00", fr: "Fiche · 00", ar: "Spec · 00" })}
              </p>
              <dl className="divide-y divide-[var(--erp-hair)] text-[0.85rem]">
                {[
                  [tx({ en: "Systems built", fr: "Systèmes construits", ar: "أنظمة مبنية" }), "05"],
                  [tx({ en: "ERP modules proven", fr: "Modules ERP prouvés", ar: "وحدات مُثبتة" }), String(NODES.length)],
                  [tx({ en: "Platforms", fr: "Plateformes", ar: "المنصّات" }), tx({ en: "Web · Desktop · Mobile", fr: "Web · Bureau · Mobile", ar: "Web · Desktop · Mobile" })],
                  [tx({ en: "Languages", fr: "Langues", ar: "اللغات" }), "FR · AR · EN"],
                ].map(([k, v], i) => (
                  <div key={k} className={`items-baseline justify-between gap-4 py-1.5 md:py-2 ${i > 1 ? "hidden sm:flex" : "flex"}`}>
                    <dt className="text-mute">{k}</dt>
                    <dd className="erp-mono text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-6 flex w-full max-w-[1280px] items-center gap-4 md:mt-[clamp(1.25rem,5svh,3rem)]">
          <span className="erp-cue" aria-hidden />
          <span className="erp-kicker">
            {tx({ en: "Scroll — the map assembles", fr: "Défilez — la carte s'assemble", ar: "مرّر — الخريطة تُبنى" })}
          </span>
        </div>
      </div>

      {/* the map: big drawing beside the captions on wide screens, a module list on phones */}
      <div className="absolute inset-0 pt-[var(--erp-header)]">
        <div className="relative mx-auto h-full w-full max-w-[1440px]">
          <div
            className="pointer-events-none absolute inset-x-4 top-3 md:inset-x-8 md:bottom-[13.5rem] md:top-6 lg:bottom-6 lg:end-8 lg:start-[calc(2.5rem+20rem+2rem)] lg:flex lg:items-center lg:justify-center"
            style={{ opacity: `calc(${mapIn} * ${inv(mapOut)})` }}
          >
            <div
              className="mx-auto w-full"
              style={{
                maxWidth: "min(100%, 1240px, calc((100svh - var(--erp-header) - 3rem) * 1.935))",
                transform: `translate3d(calc(var(--dir) * ${lerp(mapOut, 0, 26, "vw")}), ${lerp(mapOut, 0, -8, "vh")}, 0) scale(${lerp(mapOut, 1, 0.4)})`,
                transformOrigin: "center",
              }}
            >
              <Schematic lit={lit} draw="--b1" labels="--b2" className="hidden h-auto w-full md:block" />
              <PhoneMap />
            </div>
          </div>

          {/* captions */}
          <AtStack className="absolute inset-x-4 bottom-4 md:inset-x-8 md:bottom-8 lg:bottom-auto lg:end-auto lg:start-10 lg:top-1/2 lg:w-[20rem] lg:-translate-y-1/2">
            <At from={1}>
              <Caption
                fig={tx({ en: "FIG. 00 — THE MAP", fr: "FIG. 00 — LA CARTE", ar: "الشكل 00 — الخريطة" })}
                text={tx({
                  en: "An ERP is not one feature. It is eighteen modules that have to agree with each other — every second, at every site, in every language, even when the network drops.",
                  fr: "Un ERP n'est pas une fonctionnalité. Ce sont dix-huit modules qui doivent rester d'accord entre eux — à chaque seconde, sur chaque site, dans chaque langue, même quand le réseau tombe.",
                  ar: "نظام تخطيط الموارد ليس ميزة واحدة. إنه ثماني عشرة وحدة يجب أن تبقى متّفقة فيما بينها — في كل ثانية، وفي كل موقع، وبكل لغة، حتى عندما تنقطع الشبكة.",
                })}
              />
            </At>
            <At from={2}>
              <Caption
                fig={tx({ en: "FIG. 00 — THE CORE", fr: "FIG. 00 — LE SOCLE", ar: "الشكل 00 — النواة" })}
                text={tx({
                  en: "Modules usually arrive as separate products that take years to connect. The systems in this story were built core-first: identities, permissions, numbering and audit underneath — the business modules on top.",
                  fr: "Les modules arrivent souvent comme des produits séparés qu'on met des années à relier. Les systèmes de cette histoire ont été construits par le socle : identités, permissions, numérotation et audit en dessous — les modules métier au-dessus.",
                  ar: "غالبًا ما تأتي الوحدات كمنتجات منفصلة يستغرق ربطها سنوات. أمّا الأنظمة في هذه القصة فقد بُنيت انطلاقًا من النواة: الهويات والصلاحيات والترقيم والتدقيق في الأساس — ووحدات العمل فوقها.",
                })}
              />
            </At>
            <At from={3}>
              <Caption
                fig={tx({ en: "FIG. 00 — HOW TO READ", fr: "FIG. 00 — MODE DE LECTURE", ar: "الشكل 00 — طريقة القراءة" })}
                text={tx({
                  en: "Five systems, five chapters. Each one is taken apart — what it solves, how it works, the decisions behind it. The map stays on screen and lights up as each module is proven.",
                  fr: "Cinq systèmes, cinq chapitres. Chacun est démonté — ce qu'il résout, comment il fonctionne, les décisions derrière. La carte reste à l'écran et s'allume à mesure que chaque module est prouvé.",
                  ar: "خمسة أنظمة، خمسة فصول. يُفكَّك كلّ منها — ماذا يحلّ، كيف يعمل، والقرارات التي تقف خلفه. تبقى الخريطة أمامك وتضيء كلّما ثبتت وحدة.",
                })}
              >
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[0.78rem] text-mute">
                  <span className="flex items-center gap-2">
                    <span className="erp-dot" /> {tx({ en: "not proven yet", fr: "pas encore prouvé", ar: "لم يثبت بعد" })}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="erp-dot" data-lit="" /> {tx({ en: "proven in this story", fr: "prouvé dans cette histoire", ar: "ثبت في هذه القصة" })}
                  </span>
                </div>
              </Caption>
            </At>
          </AtStack>
        </div>
      </div>
    </div>
  );
}

/** Phone version of the map: the same four bands and eighteen modules as a legible list. */
function PhoneMap() {
  const tx = useTx();
  const { lit } = useLitNodes();
  let i = 0;
  return (
    <div className="space-y-1.5 md:hidden" aria-hidden>
      {BANDS.map((b) => (
        <div key={b.id} className="flex gap-1.5">
          <div style={{ opacity: seg("--b2", 0, 0.4) }} className="flex w-5 shrink-0 flex-col items-center gap-1 border-e border-[var(--erp-hair-2)] pe-1.5">
            <span className="erp-mono text-[0.62rem] text-faint">{b.code}</span>
            <span className="erp-mono text-[0.55rem] uppercase tracking-[0.14em] text-faint [writing-mode:vertical-rl]">
              {tx(b.label)}
            </span>
          </div>
          <div className="grid flex-1 grid-cols-3 gap-1">
            {NODES.filter((n) => n.band === b.id).map((n) => {
              const k = i++;
              const on = lit.has(n.id);
              return (
                <div
                  key={n.id}
                  className="flex min-h-[2.35rem] items-center gap-1 border bg-paper px-1.5 py-1 text-[0.68rem] leading-[1.15] text-ink"
                  style={{
                    borderColor: on ? "var(--color-signal)" : "var(--erp-hair-2)",
                    opacity: seg("--b1", 0.02 + k * 0.03, 0.25 + k * 0.03),
                  }}
                >
                  <span className={`erp-mono shrink-0 text-[0.56rem] ${on ? "text-signal" : "text-faint"}`}>{n.code}</span>
                  <span className="min-w-0">{tx(n.label)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Caption({ fig, text, children }: { fig: string; text: string; children?: ReactNode }) {
  return (
    <div className="border-s-2 border-signal bg-paper py-2.5 pe-4 ps-4 md:py-4 md:ps-5">
      <p className="erp-mono text-[0.62rem] uppercase tracking-[0.16em] text-faint">{fig}</p>
      <p className="mt-1.5 text-[0.92rem] leading-relaxed text-ink md:mt-2 md:text-[1.05rem]">{text}</p>
      {children}
    </div>
  );
}
