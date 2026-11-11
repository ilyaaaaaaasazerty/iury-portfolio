"use client";

/** Finale (the whole map, live), how I work, and contact. */

import type { Profile } from "@/lib/types";
import { useTx, type L } from "@/lib/erp/i18n";
import { NODES } from "@/lib/erp/nodes";
import { inv, lerp, seg } from "@/lib/erp/sv";
import { At, AtStack, CountUp, Reveal, Scene, useLitNodes, useScene } from "./engine";
import Schematic from "./schematic";
import { Section } from "./ui";

/* ------------------------------------------------------------------ */
/* The threads that run through every system                           */
/* ------------------------------------------------------------------ */

const SYSTEMS: (string | L)[] = ["Sayroura Immo", "SayrouraPOS", "SayrouraWash", "Dapper", { en: "Messaging layer", fr: "Couche messagerie", ar: "طبقة المراسلة" }];

/** ● = proven in the code. Kept honest: an empty cell means "not in that system". */
const MATRIX: { concern: L; cells: [boolean, boolean, boolean, boolean, boolean]; note?: L }[] = [
  {
    concern: { en: "Multi-organization isolation", fr: "Isolation multi-organisations", ar: "عزل المؤسسات المتعددة" },
    cells: [true, false, true, false, true],
  },
  {
    concern: { en: "Roles & permissions", fr: "Rôles & permissions", ar: "الأدوار والصلاحيات" },
    cells: [true, true, true, true, true],
  },
  {
    concern: { en: "Audit trail", fr: "Piste d'audit", ar: "سجل التدقيق" },
    cells: [true, true, true, true, false],
  },
  {
    concern: { en: "Legal documents & gap-free numbering", fr: "Documents légaux & numérotation sans trou", ar: "وثائق قانونية وترقيم بلا فجوات" },
    cells: [true, true, false, false, false],
  },
  {
    concern: { en: "Keeps working offline", fr: "Fonctionne hors ligne", ar: "يعمل دون اتصال" },
    cells: [false, true, true, true, false],
  },
  {
    concern: { en: "Live updates", fr: "Mises à jour en direct", ar: "تحديثات آنية" },
    cells: [false, true, true, false, true],
  },
  {
    concern: { en: "Background jobs & schedules", fr: "Tâches de fond & planification", ar: "مهام خلفية وجدولة" },
    cells: [true, false, true, false, true],
  },
  {
    concern: { en: "French / Arabic, right-to-left", fr: "Français / arabe, droite-à-gauche", ar: "الفرنسية / العربية، من اليمين لليسار" },
    cells: [true, true, true, true, false],
  },
  {
    concern: { en: "Automated test suites", fr: "Suites de tests automatisés", ar: "اختبارات آلية" },
    cells: [true, true, true, false, false],
  },
];

/** Totals across the five systems (rounded down from counts in the code). */
const TOTALS: { value: number; suffix?: string; label: L }[] = [
  { value: 2300, suffix: "+", label: { en: "automated test cases", fr: "cas de tests automatisés", ar: "حالة اختبار آلي" } },
  { value: 250, suffix: "+", label: { en: "database tables designed", fr: "tables de base de données conçues", ar: "جدول قاعدة بيانات" } },
  { value: 3, label: { en: "platforms: web, desktop, mobile", fr: "plateformes : web, desktop, mobile", ar: "منصّات: ويب، سطح المكتب، هاتف" } },
  { value: 3, label: { en: "interface languages, incl. right-to-left", fr: "langues d'interface, dont droite-à-gauche", ar: "لغات واجهة، منها من اليمين لليسار" } },
];

export function Finale() {
  const tx = useTx();
  return (
    <Scene id="finale" beats={3} length={90} label={tx({ en: "The complete map", fr: "La carte complète", ar: "الخريطة الكاملة" })}>
      <FinaleStage />
    </Scene>
  );
}

function FinaleStage() {
  const tx = useTx();
  const { lit } = useLitNodes();
  const { beat } = useScene();
  const mapShrink = seg("--b0", 0.55, 1);

  return (
    <div className="erp-grid relative h-full w-full px-5 pt-[calc(var(--erp-header)+1.25rem)] md:px-10">
      <div className="mx-auto flex h-full max-w-[1280px] flex-col">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="erp-kicker">{tx({ en: "Finale", fr: "Finale", ar: "الخاتمة" })}</p>
            <h2 className="erp-display mt-3 text-[clamp(2rem,4.6vw,4rem)] text-ink [@media(max-height:760px)]:text-[clamp(1.8rem,3.2vw,2.6rem)]">
              {tx({ en: "The map, complete.", fr: "La carte, complète.", ar: "الخريطة، مكتملة." })}
            </h2>
          </div>
          <p className="erp-mono text-[clamp(1.6rem,3vw,2.6rem)] text-ink" dir="ltr">
            <span className="text-signal">{String(lit.size).padStart(2, "0")}</span>
            <span className="text-faint"> / {NODES.length}</span>
          </p>
        </div>

        <div className="relative mt-4 min-h-0 flex-1">
          {/* full map, flowing */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: `calc(${seg("--b0", 0, 0.25)} * ${inv(seg("--b1", 0, 0.3))})`,
              transform: `scale(${lerp(mapShrink, 1, 0.96)})`,
            }}
          >
            <Schematic lit={lit} flowing className="h-full max-h-[62vh] w-auto max-w-full" />
          </div>

          <AtStack className="absolute inset-0 items-center">
            <At from={1}>
              <Matrix />
            </At>
            <At from={2}>
              <div className="grid grid-cols-2 gap-px border border-[var(--erp-hair)] bg-[var(--erp-hair)] lg:grid-cols-4">
                {TOTALS.map((t, i) => (
                  <div key={i} className="bg-paper p-4 md:p-6">
                    <div className="erp-display text-[clamp(2rem,5vw,4.2rem)] text-ink">
                      <CountUp value={t.value} suffix={t.suffix} start={beat >= 2} />
                    </div>
                    <p className="mt-2 text-[0.86rem] leading-snug text-graphite md:text-[0.92rem]">{tx(t.label)}</p>
                  </div>
                ))}
              </div>
              <p className="erp-body mt-4 max-w-[52rem] md:mt-6">
                {tx({
                  en: "Eighteen modules, proven across five systems — designed, built and tested by one engineer, in French, Arabic and English, on web, desktop and mobile.",
                  fr: "Dix-huit modules, prouvés sur cinq systèmes — conçus, construits et testés par un seul ingénieur, en français, arabe et anglais, sur web, desktop et mobile.",
                  ar: "ثماني عشرة وحدة، ثبتت عبر خمسة أنظمة — صمّمها وبناها واختبرها مهندس واحد، بالفرنسية والعربية والإنجليزية، على الويب وسطح المكتب والهاتف.",
                })}
              </p>
            </At>
          </AtStack>
        </div>

        <div className={`pb-6 pt-3 ${beat >= 1 ? "max-md:hidden [@media(max-height:760px)]:hidden" : ""}`}>
          <At from={0} to={0}>
            <p className="erp-body max-w-[48rem] text-[0.98rem]">
              {tx({
                en: "Every module on this map is running in one of the five systems above — with its own data model, permissions and history. The wires are the flows a real ERP needs between them.",
                fr: "Chaque module de cette carte tourne dans l'un des cinq systèmes — avec son modèle de données, ses permissions et son historique. Les fils sont les flux qu'un vrai ERP exige entre eux.",
                ar: "كل وحدة على هذه الخريطة تعمل داخل أحد الأنظمة الخمسة — بنموذج بياناتها وصلاحياتها وسجلّها. أمّا الخطوط فهي التدفقات التي يحتاجها نظام حقيقي بينها.",
              })}
            </p>
          </At>
        </div>
      </div>
    </div>
  );
}

/** Short column heads for the phone matrix (the full names do not fit five across at 390px). */
const SYSTEMS_SHORT: (string | L)[] = ["Immo", "POS", "Wash", "Dapper", { en: "Msg.", fr: "Msg.", ar: "مراسلة" }];

function Matrix() {
  return (
    <>
      <MatrixPhone />
      <MatrixFull />
    </>
  );
}

function MatrixPhone() {
  const tx = useTx();
  return (
    <div className="erp-frame w-full bg-paper md:hidden" dir="ltr">
      <span className="erp-tick tl" />
      <span className="erp-tick tr" />
      <span className="erp-tick bl" />
      <span className="erp-tick br" />
      <table className="w-full table-fixed border-collapse text-[0.8rem] leading-snug">
        <colgroup>
          <col />
          {SYSTEMS_SHORT.map((_, i) => (
            <col key={i} className="w-[2.6rem]" />
          ))}
        </colgroup>
        <thead>
          <tr className="border-b border-[var(--erp-hair-2)]">
            <th className="erp-mono px-2 py-2 text-start text-[11px] font-normal uppercase tracking-[0.12em] text-faint">
              {tx({ en: "Thread", fr: "Fil", ar: "الخيط" })}
            </th>
            {SYSTEMS_SHORT.map((s, i) => (
              <th key={i} className="erp-mono px-0 py-2 text-center text-[11px] font-normal text-mute">
                {tx(s)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MATRIX.map((row, i) => (
            <tr key={i} className="border-b border-[var(--erp-hair)] last:border-0">
              <td className="px-2 py-1.5 text-ink" dir="auto">
                {tx(row.concern)}
              </td>
              {row.cells.map((c, j) => (
                <td key={j} className="px-0 py-1.5 text-center">
                  {c ? (
                    <span className="inline-block h-2 w-2 bg-signal" aria-label={tx({ en: "yes", fr: "oui", ar: "نعم" })} />
                  ) : (
                    <span className="inline-block h-px w-2.5 bg-[var(--erp-hair-2)] align-middle" aria-label={tx({ en: "no", fr: "non", ar: "لا" })} />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MatrixFull() {
  const tx = useTx();
  return (
    <div className="erp-frame hidden overflow-x-auto bg-paper md:block" dir="ltr">
      <span className="erp-tick tl" />
      <span className="erp-tick tr" />
      <span className="erp-tick bl" />
      <span className="erp-tick br" />
      <table className="w-full min-w-[640px] border-collapse text-[0.86rem]">
        <thead>
          <tr className="border-b border-[var(--erp-hair-2)]">
            <th className="erp-kicker p-3 text-start font-normal [@media(max-height:760px)]:py-2">
              {tx({ en: "Runs through every chapter", fr: "Le fil de chaque chapitre", ar: "الخيط المشترك" })}
            </th>
            {SYSTEMS.map((s, i) => (
              <th key={i} className="erp-mono p-3 text-center text-[0.68rem] font-normal text-mute [@media(max-height:760px)]:py-2">
                {tx(s)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MATRIX.map((row, i) => (
            <tr key={i} className="border-b border-[var(--erp-hair)] last:border-0">
              <td className="p-3 text-ink [@media(max-height:760px)]:py-1.5" dir="auto">
                {tx(row.concern)}
              </td>
              {row.cells.map((c, j) => (
                <td key={j} className="p-3 text-center [@media(max-height:760px)]:py-1.5">
                  {c ? (
                    <span className="inline-block h-2.5 w-2.5 bg-signal shadow-[0_0_0_3px_var(--erp-signal-soft)]" aria-label={tx({ en: "yes", fr: "oui", ar: "نعم" })} />
                  ) : (
                    <span className="inline-block h-px w-3 bg-[var(--erp-hair-2)] align-middle" aria-label={tx({ en: "no", fr: "non", ar: "لا" })} />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* How I work                                                          */
/* ------------------------------------------------------------------ */

const STEPS: { title: L; body: L; out: L }[] = [
  {
    title: { en: "Map the flows", fr: "Cartographier les flux", ar: "رسم التدفقات" },
    body: {
      en: "Before any screen: the documents, their lifecycles, who touches them and what the law requires of them. The state machines on this page started as drawings like these.",
      fr: "Avant tout écran : les documents, leurs cycles de vie, qui les touche et ce que la loi exige d'eux. Les machines à états de cette page ont commencé comme ces dessins.",
      ar: "قبل أي شاشة: الوثائق، ودورات حياتها، ومن يتعامل معها، وما يفرضه القانون عليها. آلات الحالات في هذه الصفحة بدأت رسومًا كهذه.",
    },
    out: { en: "Flow map · states · roles", fr: "Carte des flux · états · rôles", ar: "خريطة التدفقات · الحالات · الأدوار" },
  },
  {
    title: { en: "Ship one module", fr: "Livrer un module", ar: "تسليم وحدة" },
    body: {
      en: "One module, usable by real people within weeks — not a big-bang release. Each delivery sits on the same core: identities, permissions, numbering, audit.",
      fr: "Un module, utilisable par de vraies personnes en quelques semaines — pas une livraison « big bang ». Chaque livraison repose sur le même socle : identités, permissions, numérotation, audit.",
      ar: "وحدة واحدة يستعملها أشخاص حقيقيون في غضون أسابيع — لا إطلاقًا ضخمًا دفعة واحدة. وكل تسليم يقوم على النواة نفسها: الهويات، الصلاحيات، الترقيم، التدقيق.",
    },
    out: { en: "Working module in production", fr: "Module en production", ar: "وحدة عاملة في الإنتاج" },
  },
  {
    title: { en: "Prove it", fr: "Le prouver", ar: "إثباته" },
    body: {
      en: "Rules become tests the day they are written: isolation between organizations, tax arithmetic, numbering without gaps. Continuous integration runs them on every change.",
      fr: "Les règles deviennent des tests le jour où elles sont écrites : isolation entre organisations, calculs fiscaux, numérotation sans trou. L'intégration continue les exécute à chaque changement.",
      ar: "تتحوّل القواعد إلى اختبارات يوم كتابتها: العزل بين المؤسسات، والحسابات الجبائية، والترقيم بلا فجوات. والتكامل المستمر يشغّلها مع كل تغيير.",
    },
    out: { en: "Tests · CI · audit trail", fr: "Tests · CI · piste d'audit", ar: "اختبارات · تكامل مستمر · سجل تدقيق" },
  },
  {
    title: { en: "Connect the next", fr: "Connecter le suivant", ar: "ربط الوحدة التالية" },
    body: {
      en: "Each new module reuses the identities, documents and history of the previous ones, so every delivery makes the earlier ones more valuable instead of creating another island.",
      fr: "Chaque nouveau module réutilise les identités, documents et historiques des précédents : chaque livraison valorise les précédentes au lieu de créer un îlot de plus.",
      ar: "تعيد كل وحدة جديدة استعمال هويات الوحدات السابقة ووثائقها وسجلّها، فيزيد كل تسليم من قيمة ما قبله بدل أن يصنع جزيرة معزولة أخرى.",
    },
    out: { en: "One system, growing", fr: "Un système qui grandit", ar: "نظام واحد ينمو" },
  },
];

export function HowIWork() {
  const tx = useTx();
  return (
    <Section
      id="method"
      kicker={{ en: "How I work", fr: "Ma méthode", ar: "طريقة عملي" }}
      title={{
        en: "Module by module, on one core — each step usable on its own.",
        fr: "Module par module, sur un seul socle — chaque étape utilisable seule.",
        ar: "وحدةً وحدة، على نواة واحدة — وكل خطوة قابلة للاستعمال وحدها.",
      }}
    >
      <div className="grid gap-px border border-[var(--erp-hair)] bg-[var(--erp-hair)] md:grid-cols-2 xl:grid-cols-4">
        {STEPS.map((s, i) => (
          <Reveal key={i} delay={i * 0.07} className="flex flex-col bg-paper p-6">
            <span className="erp-mono text-[0.72rem] text-signal-deep">{String(i + 1).padStart(2, "0")}</span>
            <h4 className="erp-display mt-5 text-[1.5rem] text-ink">{tx(s.title)}</h4>
            <p className="erp-body mt-3 flex-1 text-[0.95rem]">{tx(s.body)}</p>
            <p className="erp-mono mt-6 border-t border-[var(--erp-hair)] pt-3 text-[11px] uppercase tracking-[0.12em] text-faint md:text-[0.66rem]">
              → {tx(s.out)}
            </p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

export function Contact({ profile }: { profile: Profile }) {
  const tx = useTx();
  const phone = profile.phone?.replace(/\s+/g, "");
  return (
    <section id="contact" className="erp-steel relative overflow-hidden px-5 py-28 md:px-10 md:py-36 xl:pe-[16rem]">
      <div className="mx-auto max-w-[1180px]">
        <Reveal>
          <p className="erp-kicker !text-white/50">{tx({ en: "Contact", fr: "Contact", ar: "تواصل" })}</p>
          <h2 className="erp-display mt-6 max-w-[18ch] text-[clamp(2.4rem,6vw,5.6rem)] text-white">
            {tx({
              en: "Operations running on spreadsheets and disconnected tools? Let's map them.",
              fr: "Des opérations qui tournent sur des tableurs et des outils déconnectés ? Cartographions-les.",
              ar: "عمليات تدور على جداول ومجموعة أدوات منفصلة؟ لنرسم خريطتها معًا.",
            })}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="erp-body mt-8 max-w-[44rem] !text-white/65">
            {tx({
              en: "Tell me which documents, sites and teams are involved. I'll come back with a first flow map and the module I would build first.",
              fr: "Dites-moi quels documents, sites et équipes sont concernés. Je reviens avec une première carte des flux et le module que je construirais en premier.",
              ar: "أخبرني بالوثائق والمواقع والفرق المعنية، وسأعود إليك بخريطة تدفقات أولى والوحدة التي سأبنيها أولًا.",
            })}
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mt-12 flex flex-wrap gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="bg-signal px-6 py-4 text-[1rem] font-medium text-white transition-colors hover:bg-signal-deep"
            >
              {profile.email}
            </a>
            {phone && (
              <a
                href={`tel:${phone}`}
                className="erp-mono border border-white/25 px-6 py-4 text-[0.95rem] text-white transition-colors hover:border-white/60"
                dir="ltr"
              >
                {profile.phone}
              </a>
            )}
          </div>
        </Reveal>
        <Reveal delay={0.24}>
          <dl className="mt-16 grid max-w-[44rem] grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
            {[
              [tx({ en: "Based in", fr: "Basé en", ar: "المقرّ" }), tx(profile.location)],
              [tx({ en: "Works in", fr: "Travaille en", ar: "يعمل بـ" }), "FR · AR · EN"],
              [
                tx({ en: "Availability", fr: "Disponibilité", ar: "التوفّر" }),
                profile.available
                  ? tx({ en: "Open to new work", fr: "Disponible", ar: "متاح لعمل جديد" })
                  : tx({ en: "Booked", fr: "Indisponible", ar: "غير متاح" }),
              ],
            ].map(([k, v]) => (
              <div key={k} className="bg-[#1d1e22] p-4">
                <dt className="erp-mono text-[11px] uppercase tracking-[0.16em] text-white/40 md:text-[0.6rem]">{k}</dt>
                <dd className="mt-2 text-[0.95rem] text-white">{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
