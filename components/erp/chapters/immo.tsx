"use client";

/**
 * Chapter 01 — Sayroura Immo, "The platform".
 * A multi-organization platform for property developers and residence managers.
 * Proves: tenancy, identity, crm, contracts, documents, maintenance, jobs.
 */

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { useNumber, useTx, type L } from "@/lib/erp/i18n";
import { CHAPTERS } from "@/lib/erp/nodes";
import { beatLocal } from "@/lib/erp/sv";
import { At, AtStack, LightUp, Reveal, Scene, useScene, useSceneProgress } from "../engine";
import {
  BeatCopy,
  BeatDots,
  ChapterCover,
  Code,
  Decisions,
  Figure,
  ProofStrip,
  Rule,
  SceneLayout,
  Section,
  Spec,
  StateTrack,
  Walkthrough,
} from "../ui";
import "./immo.css";

const META = CHAPTERS[0];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

type Beat = { kicker: L; title: L; body: L; details?: L[] };

/** Figure body height: bounded on mobile (copy sits above), roomy on desktop. */
const FIG_H = "h-[40svh] md:h-[min(60svh,540px)]";

/** Discrete step inside beat `i` of `n`, from scene progress `p`. */
function stepOf(p: number, i: number, n: number, steps: number, lead = 0.08, tail = 0.12) {
  const t = beatLocal(p, i, n);
  const k = (t - lead) / Math.max(0.0001, 1 - lead - tail);
  return Math.max(0, Math.min(steps - 1, Math.floor(k * steps)));
}

/** A React value derived from scene progress; re-renders only when it changes. */
function useStep(map: (p: number) => number) {
  const [s, setS] = useState(0);
  useSceneProgress((p) => {
    const n = map(p);
    setS((prev) => (prev === n ? prev : n));
  });
  return s;
}

function SceneCopy({ beats }: { beats: Beat[] }) {
  const { beat } = useScene();
  return (
    <div>
      <BeatDots count={beats.length} current={beat} className="mb-4 md:mb-6" />
      <AtStack>
        {beats.map((b, i) => (
          <At key={i} from={i}>
            <BeatCopy kicker={b.kicker} title={b.title} body={b.body} details={b.details} />
          </At>
        ))}
      </AtStack>
    </div>
  );
}

function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`erp-mono text-[0.66rem] uppercase tracking-[0.12em] text-faint md:text-[0.6rem] md:tracking-[0.14em] ${className}`}>{children}</p>;
}

type Ln = { t: string | L; k?: "c" | "e" | "h" | "ok" };

function CodeLines({ lines, className = "" }: { lines: Ln[]; className?: string }) {
  const tx = useTx();
  return (
    <div className={`erp-mono text-[0.68rem] leading-[1.6] md:text-[0.72rem] ${className}`}>
      {lines.map((l, i) => (
        <div
          key={i}
          className={`immo-in whitespace-pre-wrap break-words ${
            l.k === "c"
              ? "text-faint"
              : l.k === "e"
                ? "text-signal-deep"
                : l.k === "h"
                  ? "bg-[var(--erp-signal-soft)] text-signal-deep"
                  : l.k === "ok"
                    ? "text-ink"
                    : "text-graphite"
          }`}
          style={{ animationDelay: `${i * 70}ms` }}
        >
          {tx(l.t) || " "}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

const COPY = {
  oneLiner: {
    en: "Many developers on one database — and not one row visible to the wrong company.",
    fr: "Plusieurs promoteurs sur une seule base — et pas une ligne visible par la mauvaise société.",
    ar: "عدّة مرقّين على قاعدة بيانات واحدة — دون أن يرى أيّ منهم سطرًا واحدًا لا يخصّه.",
  },
  context: [
    {
      en: "Sayroura Immo runs real-estate development and residence management end to end: inventory and sales, contracts and payment schedules, construction milestones, handovers, then years of charges, general assemblies and maintenance.",
      fr: "Sayroura Immo couvre la promotion immobilière et la gestion de résidences de bout en bout : stock et commercialisation, contrats et échéanciers, jalons de chantier, livraisons, puis des années de charges, d'assemblées générales et de maintenance.",
      ar: "تغطّي Sayroura Immo الترقية العقارية وتسيير الإقامات من البداية إلى النهاية: المخزون والتسويق، العقود وجداول الدفع، مراحل الأشغال، التسليم، ثمّ سنوات من الأعباء والجمعيات العامة والصيانة.",
    },
    {
      en: "It is multi-organization from the first table: several companies share one PostgreSQL database, each with its own users, roles, numbering and documents. Everything in this chapter rests on one guarantee — an organization never sees another's rows — and that guarantee is enforced by the database itself.",
      fr: "Elle est multi-organisation dès la première table : plusieurs sociétés partagent une même base PostgreSQL, chacune avec ses utilisateurs, ses rôles, sa numérotation et ses documents. Tout ce chapitre repose sur une garantie — une organisation ne voit jamais les lignes d'une autre — et c'est la base de données elle-même qui l'impose.",
      ar: "وهي متعدّدة المؤسسات منذ الجدول الأول: عدّة شركات تتقاسم قاعدة PostgreSQL واحدة، ولكلّ منها مستخدموها وأدوارها وترقيمها ووثائقها. يقوم هذا الفصل كلّه على ضمان واحد — لا ترى مؤسسة أبدًا أسطر مؤسسة أخرى — وقاعدة البيانات نفسها هي التي تفرضه.",
    },
  ] as L[],
  roles: [
    { name: { en: "owner", fr: "owner (gérant)", ar: "owner (المسيّر)" }, does: { en: "Everything; approves withdrawals", fr: "Tout ; approuve les désistements", ar: "كلّ شيء؛ يوافق على التنازلات" } },
    { name: { en: "sales_manager" }, does: { en: "Decides discounts, signs contracts, validates milestones", fr: "Décide les remises, signe les contrats, valide les jalons", ar: "يبتّ في التخفيضات، يوقّع العقود، يعتمد المراحل" } },
    { name: { en: "sales_agent" }, does: { en: "Leads, visits, quotations, options", fr: "Prospects, visites, devis, options", ar: "العملاء المحتملون، الزيارات، عروض الأسعار، الخيارات" } },
    { name: { en: "cashier · accountant" }, does: { en: "Record payments · cancel receipts", fr: "Encaissent · annulent les reçus", ar: "تسجيل الدفعات · إلغاء الوصولات" } },
    { name: { en: "property_manager" }, does: { en: "Residences, charges, tickets", fr: "Résidences, charges, réclamations", ar: "الإقامات، الأعباء، التذاكر" } },
    { name: { en: "technical_manager" }, does: { en: "Construction, milestones, handovers", fr: "Chantier, jalons, livraisons", ar: "الأشغال، المراحل، التسليم" } },
    { name: { en: "resident" }, does: { en: "The portal only", fr: "Le portail uniquement", ar: "البوابة فقط" } },
  ],
  platforms: [
    { en: "Back office (web)", fr: "Back-office (web)", ar: "المكتب الخلفي (ويب)" },
    { en: "Buyer & resident portal", fr: "Portail acquéreur & résident", ar: "بوابة المشتري والساكن" },
    { en: "PDF documents", fr: "Documents PDF", ar: "وثائق PDF" },
    { en: "French · Arabic (RTL)", fr: "Français · arabe (RTL)", ar: "الفرنسية · العربية" },
    { en: "Docker production stack", fr: "Production Docker", ar: "إنتاج عبر Docker" },
  ] as L[],
  facts: [
    { value: 134, label: { en: "PostgreSQL tables", fr: "tables PostgreSQL", ar: "جدول PostgreSQL" } },
    { value: 344, label: { en: "server actions, each validated with zod", fr: "actions serveur, toutes validées par zod", ar: "إجراء خادم، كلّها مُتحقَّق منها بـ zod" } },
    { value: 150, prefix: "~", label: { en: "pages, in French and Arabic", fr: "pages, en français et en arabe", ar: "صفحة بالفرنسية والعربية" } },
    { value: 573, prefix: "~", label: { en: "Vitest cases", fr: "cas de test Vitest", ar: "حالة اختبار Vitest" } },
  ],

  iso: [
    {
      kicker: { en: "1.1 — Isolation · the risk", fr: "1.1 — Isolation · le risque", ar: "1.1 — العزل · الخطر" },
      title: { en: "Competing developers, one database.", fr: "Des promoteurs concurrents, une seule base.", ar: "مرقّون متنافسون، قاعدة واحدة." },
      body: {
        en: "Every organization's units, buyers and payments live in the same tables. The usual safeguard is a WHERE organization_id = … in every query. Forget it once, in one code path, and another company's buyers appear on screen.",
        fr: "Les lots, acquéreurs et paiements de toutes les organisations vivent dans les mêmes tables. La protection habituelle : un WHERE organization_id = … dans chaque requête. Oubliez-le une fois, dans un seul chemin de code, et les acquéreurs d'une autre société s'affichent.",
        ar: "وحدات كلّ المؤسسات ومشتروها ودفعاتها في الجداول نفسها. الحماية المعتادة: شرط WHERE organization_id = … في كلّ استعلام. انسَه مرّة واحدة، في مسار واحد من الشيفرة، فيظهر مشترو شركة أخرى على الشاشة.",
      },
      details: [
        { en: "Organizations here are competitors: El Bahdja Immobilier must never see Les Jardins d'Oran.", fr: "Les organisations sont concurrentes : El Bahdja Immobilier ne doit jamais voir Les Jardins d'Oran.", ar: "المؤسسات هنا متنافسة: يجب ألّا ترى El Bahdja Immobilier أبدًا بيانات Les Jardins d'Oran." },
        { en: "Code review cannot promise a filter is never forgotten. A mechanism can.", fr: "Une relecture ne peut pas promettre qu'un filtre ne sera jamais oublié. Un mécanisme, si.", ar: "لا تضمن مراجعة الشيفرة ألّا يُنسى شرط أبدًا. الآلية وحدها تضمن ذلك." },
      ],
    },
    {
      kicker: { en: "1.1 — Isolation · the mechanism", fr: "1.1 — Isolation · le mécanisme", ar: "1.1 — العزل · الآلية" },
      title: { en: "The database filters, not the code.", fr: "C'est la base qui filtre, pas le code.", ar: "قاعدة البيانات هي التي تُصفّي، لا الشيفرة." },
      body: {
        en: "Every request runs inside withTenant(): a transaction that first sets app.current_org. A tenant_isolation policy on each table compares organization_id with that setting. The same query, with no WHERE at all, now returns only El Bahdja's rows.",
        fr: "Chaque requête s'exécute dans withTenant() : une transaction qui commence par fixer app.current_org. Une politique tenant_isolation sur chaque table compare organization_id à ce réglage. La même requête, sans aucun WHERE, ne renvoie plus que les lignes d'El Bahdja.",
        ar: "يُنفَّذ كلّ طلب داخل withTenant(): معاملة تبدأ بضبط app.current_org. وسياسة tenant_isolation على كلّ جدول تقارن organization_id بهذا الإعداد. الاستعلام نفسه، دون أيّ WHERE، لا يُرجع الآن إلّا أسطر El Bahdja.",
      },
      details: [
        { en: "set_config(…, true) is transaction-local: safe with a connection pool, the next request starts blank.", fr: "set_config(…, true) est local à la transaction : sûr avec un pool de connexions, la requête suivante repart à vide.", ar: "set_config(…, true) محلّي في المعاملة: آمن مع تجمّع الاتصالات، والطلب التالي يبدأ فارغًا." },
        { en: "The policy is re-applied after every migration, to every table that has an organization_id.", fr: "La politique est réappliquée après chaque migration, à toute table qui porte un organization_id.", ar: "تُعاد السياسة بعد كلّ ترحيل على كلّ جدول يحمل organization_id." },
        { en: "WITH CHECK refuses inserts and updates aimed at another organization.", fr: "WITH CHECK refuse les insertions et mises à jour visant une autre organisation.", ar: "يرفض WITH CHECK كلّ إدراج أو تعديل يستهدف مؤسسة أخرى." },
      ],
    },
    {
      kicker: { en: "1.1 — Isolation · the failure mode", fr: "1.1 — Isolation · en cas d'oubli", ar: "1.1 — العزل · عند النسيان" },
      title: { en: "Forget the scope, get nothing.", fr: "Oubliez le périmètre, obtenez zéro.", ar: "انسَ النطاق، تحصل على لا شيء." },
      body: {
        en: "If a code path skips withTenant(), app.current_org is empty, NULLIF turns it into NULL, and no organization_id equals NULL. Zero rows. A forgotten scope shows up as an empty page during testing — never as a leak in production.",
        fr: "Si un chemin de code saute withTenant(), app.current_org est vide, NULLIF le transforme en NULL, et aucun organization_id n'est égal à NULL. Zéro ligne. Un oubli se voit comme une page vide pendant les tests — jamais comme une fuite en production.",
        ar: "إذا تجاوز مسارٌ ما withTenant() يكون app.current_org فارغًا، فيحوّله NULLIF إلى NULL، ولا يساوي أيّ organization_id القيمة NULL. صفر أسطر. يظهر النسيان صفحةً فارغة أثناء الاختبار — لا تسرّبًا في الإنتاج.",
      },
      details: [
        { en: "Fail closed: when in doubt, the database answers with nothing.", fr: "Échec fermé : dans le doute, la base ne renvoie rien.", ar: "الإخفاق المغلق: عند الشكّ لا تُرجع القاعدة شيئًا." },
        { en: "A dedicated test suite proves that reads across organizations return nothing.", fr: "Une suite de tests dédiée prouve que les lectures entre organisations ne renvoient rien.", ar: "مجموعة اختبارات مخصّصة تُثبت أنّ القراءة بين المؤسسات لا تُرجع شيئًا." },
      ],
    },
    {
      kicker: { en: "1.1 — Isolation · no way around", fr: "1.1 — Isolation · aucun contournement", ar: "1.1 — العزل · لا التفاف" },
      title: { en: "The application cannot switch it off.", fr: "L'application ne peut pas la désactiver.", ar: "التطبيق لا يستطيع تعطيله." },
      body: {
        en: "Row-level security is ENABLED and FORCED on every tenant table, and the app connects as realestate_app, a role with data rights only. It does not own the tables, so it cannot disable the policy — and on the audit log it cannot even update or delete.",
        fr: "La sécurité au niveau des lignes est ENABLE et FORCE sur chaque table d'organisation, et l'application se connecte en realestate_app, un rôle limité aux données. Il ne possède pas les tables : il ne peut pas désactiver la politique — et sur le journal d'audit, il ne peut même ni modifier ni supprimer.",
        ar: "أمان مستوى الأسطر مُفعَّل ومفروض (ENABLE وFORCE) على كلّ جدول، والتطبيق يتّصل بالدور realestate_app الذي لا يملك إلّا حقوق البيانات. لا يملك الجداول، فلا يستطيع تعطيل السياسة — وعلى سجلّ التدقيق لا يستطيع حتى التعديل أو الحذف.",
      },
      details: [
        { en: "Migrations run as a separate owner role; the running app never holds it.", fr: "Les migrations tournent sous un rôle propriétaire distinct ; l'application en marche ne le détient jamais.", ar: "تعمل الترحيلات بدور مالك منفصل لا يحمله التطبيق أثناء التشغيل أبدًا." },
        { en: "audit_log and unit_status_history are append-only for the app role.", fr: "audit_log et unit_status_history sont en ajout seul pour le rôle applicatif.", ar: "audit_log وunit_status_history للإضافة فقط بالنسبة لدور التطبيق." },
      ],
    },
  ] as Beat[],

  roles2: [
    {
      kicker: { en: "1.2 — Identity · roles", fr: "1.2 — Identités · rôles", ar: "1.2 — الهويات · الأدوار" },
      title: { en: "Same screen, different hands.", fr: "Même écran, d'autres mains.", ar: "الشاشة نفسها، أيدٍ مختلفة." },
      body: {
        en: "One reservation, opened by two people. The sales agent can ask for a discount; only the sales manager can decide it. The buttons are not a layout choice: each is a permission of the role, resource by resource.",
        fr: "Une réservation, ouverte par deux personnes. Le commercial peut demander une remise ; seul le directeur commercial peut la décider. Les boutons ne sont pas un choix de mise en page : chacun est une permission du rôle, ressource par ressource.",
        ar: "حجز واحد يفتحه شخصان. يستطيع المندوب طلب تخفيض، ولا يبتّ فيه إلّا مدير المبيعات. الأزرار ليست خيار تصميم: كلّ زرّ صلاحية للدور، موردًا بمورد.",
      },
      details: [
        { en: "Better Auth with the organization, two-factor and admin plugins; custom roles on top of the built-in ones.", fr: "Better Auth avec les plugins organisation, double authentification et admin ; des rôles personnalisés en plus des rôles fournis.", ar: "Better Auth مع إضافات المؤسسة والمصادقة الثنائية والإدارة؛ وأدوار مخصّصة فوق الأدوار المدمجة." },
        { en: "read vs read_all: an agent sees the leads and sales they follow, managers see everyone's.", fr: "read ou read_all : un commercial voit ses prospects et ses ventes, les managers voient tout.", ar: "read أو read_all: يرى المندوب عملاءه ومبيعاته، ويرى المديرون الجميع." },
      ],
    },
    {
      kicker: { en: "1.2 — Identity · separation of duties", fr: "1.2 — Identités · séparation des tâches", ar: "1.2 — الهويات · فصل المهام" },
      title: { en: "Whoever takes the money cannot erase it.", fr: "Qui encaisse ne peut pas effacer.", ar: "من يقبض المال لا يستطيع محوه." },
      body: {
        en: "The cashier records payments and issues receipts; cancelling a receipt belongs to the accountant. A withdrawal is proposed by sales management and approved by the owner. Every sensitive act needs a second pair of hands.",
        fr: "Le caissier encaisse et émet les reçus ; annuler un reçu revient au comptable. Un désistement est proposé par la direction commerciale et approuvé par le gérant. Chaque acte sensible passe par une seconde main.",
        ar: "يسجّل أمين الصندوق الدفعات ويصدر الوصولات، أمّا إلغاء الوصل فللمحاسب. يقترح المدير التجاري التنازل ويوافق عليه المسيّر. كلّ فعل حسّاس يحتاج يدًا ثانية.",
      },
      details: [
        { en: "A milestone is reported by the technical manager and validated by sales management — validation is what issues payment calls.", fr: "Un jalon est signalé par le responsable technique et validé par la direction commerciale — c'est la validation qui émet les appels de fonds.", ar: "يُبلغ المسؤول التقني عن بلوغ المرحلة وتعتمدها الإدارة التجارية — والاعتماد هو ما يُصدر طلبات الدفع." },
      ],
    },
    {
      kicker: { en: "1.2 — Identity · enforcement", fr: "1.2 — Identités · application", ar: "1.2 — الهويات · الإنفاذ" },
      title: { en: "Hidden in the UI, refused on the server.", fr: "Masqué à l'écran, refusé au serveur.", ar: "مخفيّ في الواجهة، مرفوض في الخادم." },
      body: {
        en: "The interface hides what a role cannot do — for comfort. Security lives on the server: server actions validate their input with zod and call assertCan before touching data. A forged request from a sales agent ends in FORBIDDEN.",
        fr: "L'interface masque ce qu'un rôle ne peut pas faire — par confort. La sécurité est au serveur : les actions serveur valident leurs entrées avec zod et appellent assertCan avant de toucher aux données. Une requête forgée par un commercial finit en FORBIDDEN.",
        ar: "تُخفي الواجهة ما لا يستطيعه الدور — للراحة فقط. الأمان في الخادم: تتحقّق إجراءات الخادم من مدخلاتها بـ zod وتستدعي assertCan قبل لمس البيانات. طلب مزوَّر من مندوب ينتهي بـ FORBIDDEN.",
      },
      details: [
        { en: "A module the organization has switched off refuses its permissions the same way.", fr: "Un module désactivé par l'organisation refuse ses permissions de la même façon.", ar: "الوحدة التي أوقفتها المؤسسة ترفض صلاحياتها بالطريقة نفسها." },
        { en: "Accounts with access to payments are prompted to turn on two-factor authentication.", fr: "Les comptes qui accèdent aux encaissements sont invités à activer la double authentification.", ar: "تُدعى الحسابات التي تصل إلى الدفعات إلى تفعيل المصادقة الثنائية." },
      ],
    },
  ] as Beat[],

  life: [
    {
      kicker: { en: "1.3 — CRM · pipeline", fr: "1.3 — CRM · pipeline", ar: "1.3 — إدارة العلاقات · المسار" },
      title: { en: "A lead moves forward by itself.", fr: "Un prospect avance tout seul.", ar: "العميل المحتمل يتقدّم وحده." },
      body: {
        en: "Nobody drags cards. Logging a follow-up makes a lead contacted, planning a visit makes it visit_scheduled, a done visit visited, a quotation negotiation, a reservation won. The stage only moves forward.",
        fr: "Personne ne déplace de cartes. Une relance passe le prospect en contacted, une visite planifiée en visit_scheduled, une visite faite en visited, un devis en negotiation, une réservation en won. L'étape ne fait qu'avancer.",
        ar: "لا أحد يسحب البطاقات. متابعةٌ تجعل العميل contacted، وزيارة مبرمجة visit_scheduled، وزيارة منجزة visited، وعرض سعر negotiation، وحجز won. المرحلة تتقدّم فقط.",
      },
      details: [
        { en: "advanceStage(current, reached): a closed lead stays closed — except a lost lead that reserves, which becomes won.", fr: "advanceStage(current, reached) : un prospect clôturé le reste — sauf un perdu qui réserve, qui devient gagné.", ar: "advanceStage(current, reached): العميل المُغلق يبقى مُغلقًا — إلّا الخاسر الذي يحجز فيصبح won." },
      ],
    },
    {
      kicker: { en: "1.3 — Inventory · state machine", fr: "1.3 — Stock · machine à états", ar: "1.3 — المخزون · آلة الحالات" },
      title: { en: "Seven states, and the rules between them.", fr: "Sept états, et les règles entre eux.", ar: "سبع حالات، والقواعد بينها." },
      body: {
        en: "A unit is available, optioned, reserved, sold, delivered, rented or blocked. The allowed transitions are a table in the code; anything else is INVALID_TRANSITION. An optioned unit cannot jump to sold — it is reserved first.",
        fr: "Un lot est available, optioned, reserved, sold, delivered, rented ou blocked. Les transitions permises sont une table dans le code ; tout le reste est INVALID_TRANSITION. Un lot optionné ne saute pas à sold — il est d'abord réservé.",
        ar: "الوحدة إمّا available أو optioned أو reserved أو sold أو delivered أو rented أو blocked. الانتقالات المسموحة جدول في الشيفرة، وكلّ ما عداها INVALID_TRANSITION. الوحدة المحجوزة بخيار لا تقفز إلى sold — تُحجز أوّلًا.",
      },
      details: [
        { en: "An option carries an expiry: a background job releases the unit if it was not converted.", fr: "Une option a une échéance : une tâche de fond libère le lot s'il n'a pas été converti.", ar: "للخيار أجل: تُحرّر مهمّة خلفية الوحدة إن لم يتحوّل إلى حجز." },
        { en: "delivered is terminal, reached through a signed handover.", fr: "delivered est terminal, atteint par une livraison signée.", ar: "delivered حالة نهائية، تُبلغ بمحضر تسليم موقَّع." },
        { en: "Every change writes a row to an append-only status history.", fr: "Chaque changement écrit une ligne dans un historique en ajout seul.", ar: "كلّ تغيير يكتب سطرًا في سجلّ حالات للإضافة فقط." },
      ],
    },
    {
      kicker: { en: "1.3 — Inventory · maquette", fr: "1.3 — Stock · maquette", ar: "1.3 — المخزون · المجسّم" },
      title: { en: "The portfolio, coloured by state.", fr: "Le portefeuille, coloré par état.", ar: "المحفظة ملوّنة حسب الحالة." },
      body: {
        en: "The 3D maquette draws every lot of every project in the colour of its state, read from the same table. Press play and it replays the sales month by month.",
        fr: "La maquette 3D dessine chaque lot de chaque projet dans la couleur de son état, lue dans la même table. Lancez la lecture : elle rejoue la commercialisation mois par mois.",
        ar: "يرسم المجسّم ثلاثي الأبعاد كلّ وحدة في كلّ مشروع بلون حالتها، من الجدول نفسه. اضغط تشغيل فيُعيد عرض المبيعات شهرًا بشهر.",
      },
    },
  ] as Beat[],

  money: [
    {
      kicker: { en: "1.4 — Contracts · payment plan", fr: "1.4 — Contrats · plan de paiement", ar: "1.4 — العقود · خطة الدفع" },
      title: { en: "A schedule that always adds up.", fr: "Un échéancier qui tombe toujours juste.", ar: "جدول دفع يتطابق دائمًا." },
      body: {
        en: "A plan splits the price into steps in basis points that must total exactly 10,000. buildSchedule turns it into dated lines — at signing, N months later, or at a construction milestone. Amounts are integer centimes split by allocate(), so the lines always sum to the price.",
        fr: "Un plan découpe le prix en tranches, en points de base qui doivent totaliser exactement 10 000. buildSchedule en fait des lignes datées — à la signature, N mois après, ou à un jalon de chantier. Les montants sont des centimes entiers répartis par allocate() : les lignes font toujours le prix.",
        ar: "تقسّم الخطة السعر إلى أقساط بنقاط أساس مجموعها 10000 بالضبط. تحوّلها buildSchedule إلى أسطر مؤرّخة — عند التوقيع، أو بعد N شهرًا، أو عند مرحلة من الأشغال. المبالغ بالسنتيمات الصحيحة وتوزّعها allocate()، فمجموع الأسطر يساوي السعر دائمًا.",
      },
      details: [
        { en: "checkVspLimits compares the cumulative share called at each construction stage with the limits the company set for off-plan sales (VSP), and warns when a plan exceeds them.", fr: "checkVspLimits compare la part cumulée appelée à chaque stade du chantier aux plafonds fixés par la société pour la vente sur plan (VSP), et avertit en cas de dépassement.", ar: "تقارن checkVspLimits الحصّة التراكمية المطلوبة عند كلّ مرحلة بالحدود التي حدّدتها الشركة للبيع على التصاميم (VSP)، وتنبّه عند تجاوزها." },
        { en: "Remainders of the split go to the largest fractions — no centime lost.", fr: "Les restes de la répartition vont aux plus grandes fractions — aucun centime perdu.", ar: "تذهب بواقي القسمة إلى أكبر الكسور — لا يضيع سنتيم." },
      ],
    },
    {
      kicker: { en: "1.4 — Contracts · milestones", fr: "1.4 — Contrats · jalons", ar: "1.4 — العقود · المراحل" },
      title: { en: "The building site triggers the calls.", fr: "Le chantier déclenche les appels.", ar: "الورشة هي التي تُطلق طلبات الدفع." },
      body: {
        en: "When sales management validates a milestone — here, the structural work — a job issues a payment call (ADF) to every buyer whose plan has a step on it. Due date: validation plus the company's delay, never before signing.",
        fr: "Quand la direction commerciale valide un jalon — ici, le gros œuvre — une tâche émet un appel de fonds (ADF) à chaque acquéreur dont le plan a une tranche dessus. Échéance : validation plus le délai de la société, jamais avant la signature.",
        ar: "عندما تعتمد الإدارة التجارية مرحلةً — هنا الهيكل — تُصدر مهمّةٌ طلبَ دفع (ADF) لكلّ مشترٍ في خطته قسط مرتبط بها. الاستحقاق: تاريخ الاعتماد زائد مهلة الشركة، ولا يسبق التوقيع أبدًا.",
      },
      details: [
        { en: "payment_call.issue is idempotent per installment: a retried job never issues a call twice.", fr: "payment_call.issue est idempotent par échéance : une tâche relancée n'émet jamais deux fois le même appel.", ar: "payment_call.issue متساوي الأثر لكلّ قسط: المهمّة المُعادة لا تُصدر الطلب مرّتين." },
        { en: "Overdue installments feed reminder letters and a daily digest per organization.", fr: "Les échéances en retard alimentent les lettres de relance et un récapitulatif quotidien par organisation.", ar: "تغذّي الأقساط المتأخّرة رسائل التذكير وملخّصًا يوميًا لكلّ مؤسسة." },
      ],
    },
    {
      kicker: { en: "1.4 — Documents · numbering", fr: "1.4 — Documents · numérotation", ar: "1.4 — الوثائق · الترقيم" },
      title: { en: "Receipt numbers with no holes.", fr: "Des numéros de reçu sans trou.", ar: "أرقام وصولات بلا ثغرات." },
      body: {
        en: "A receipt number comes from a counter row — per organization, document type and year — inside the very transaction that inserts the receipt. The UPDATE locks the row until commit: a second cashier waits, then gets the next number. A rollback gives the number back.",
        fr: "Un numéro de reçu vient d'une ligne compteur — par organisation, type de document et année — dans la transaction même qui insère le reçu. L'UPDATE verrouille la ligne jusqu'au commit : un second caissier attend, puis reçoit le numéro suivant. Un rollback rend le numéro.",
        ar: "يأتي رقم الوصل من سطر عدّاد — لكلّ مؤسسة ونوع وثيقة وسنة — داخل المعاملة نفسها التي تُدرج الوصل. يقفل UPDATE السطر حتى الالتزام: ينتظر أمين صندوق ثانٍ ثمّ يأخذ الرقم التالي. والتراجع يُعيد الرقم.",
      },
      details: [
        { en: "Format: prefix, year, six digits — REC-2026-000143.", fr: "Format : préfixe, année, six chiffres — REC-2026-000143.", ar: "الصيغة: بادئة، سنة، ستة أرقام — REC-2026-000143." },
        { en: "REC receipt · RES reservation · VSP contract · ADF payment call · DEV quotation · PVL handover.", fr: "REC reçu · RES réservation · VSP contrat · ADF appel de fonds · DEV devis · PVL livraison.", ar: "REC وصل · RES حجز · VSP عقد · ADF طلب دفع · DEV عرض سعر · PVL تسليم." },
      ],
    },
    {
      kicker: { en: "1.4 — Documents · rendering", fr: "1.4 — Documents · rendu", ar: "1.4 — الوثائق · الإخراج" },
      title: { en: "Numbered first, printed after.", fr: "Numéroté d'abord, imprimé ensuite.", ar: "يُرقَّم أوّلًا ثمّ يُطبع." },
      body: {
        en: "The number and the payment are committed; the PDF follows. A pdf.document job renders one of 23 templates — React components printed by headless Chromium — and stores the file. If rendering fails, the job retries; nothing already recorded is at risk.",
        fr: "Le numéro et le paiement sont validés ; le PDF suit. Une tâche pdf.document rend l'un des 23 modèles — des composants React imprimés par Chromium headless — et stocke le fichier. Si le rendu échoue, la tâche réessaie ; rien de ce qui est enregistré n'est en jeu.",
        ar: "الرقم والدفعة مُلتزَم بهما؛ ثمّ يأتي ملفّ PDF. تُخرج مهمّة pdf.document أحد 23 قالبًا — مكوّنات React يطبعها Chromium دون واجهة — وتحفظ الملف. إن فشل الإخراج تُعاد المحاولة، ولا خطر على ما سُجّل.",
      },
      details: [
        { en: "Payments arrive at the counter — cash, cheque, transfer, CCP, bank loan — or online by card through SATIM.", fr: "Les paiements arrivent au guichet — espèces, chèque, virement, CCP, crédit bancaire — ou en ligne par carte via SATIM.", ar: "تصل الدفعات إلى الشبّاك — نقدًا أو بشيك أو تحويل أو CCP أو قرض بنكي — أو عبر الإنترنت بالبطاقة من خلال SATIM." },
        { en: "The organization's legal identity is printed on every receipt, contract and payment call.", fr: "L'identité légale de l'organisation figure sur chaque reçu, contrat et appel de fonds.", ar: "الهوية القانونية للمؤسسة مطبوعة على كلّ وصل وعقد وطلب دفع." },
      ],
    },
  ] as Beat[],

  after: [
    {
      kicker: { en: "1.5 — Handover", fr: "1.5 — Livraison", ar: "1.5 — التسليم" },
      title: { en: "Keys, with a list of reserves.", fr: "Les clés, avec la liste des réserves.", ar: "المفاتيح مع قائمة التحفّظات." },
      body: {
        en: "A handover is scheduled, reserves are listed by trade — plumbing, joinery, painting — and the PV is signed. Signing moves the unit from sold to delivered, its last state. Each reserve stays open until the works lift it.",
        fr: "Une livraison est planifiée, les réserves sont listées par corps d'état — plomberie, menuiserie, peinture — et le PV est signé. La signature fait passer le lot de sold à delivered, son dernier état. Chaque réserve reste ouverte jusqu'à sa levée.",
        ar: "يُبرمج التسليم، وتُدرج التحفّظات حسب الحِرفة — سباكة، نجارة، طلاء — ثمّ يُوقَّع المحضر. ينقل التوقيع الوحدة من sold إلى delivered، حالتها الأخيرة. ويبقى كلّ تحفّظ مفتوحًا حتى تُرفع بالأشغال.",
      },
      details: [
        { en: "Handover PVs are numbered PVL like every other document.", fr: "Les PV de livraison sont numérotés PVL comme tout autre document.", ar: "محاضر التسليم مرقّمة PVL كأيّ وثيقة أخرى." },
      ],
    },
    {
      kicker: { en: "1.5 — Residence management", fr: "1.5 — Gestion de résidence", ar: "1.5 — تسيير الإقامة" },
      title: { en: "Years of work after the sale.", fr: "Des années de travail après la vente.", ar: "سنوات من العمل بعد البيع." },
      body: {
        en: "The same platform keeps the building running: annual budgets per charge category, called in equal parts each period and split over the lots by their distribution key; general assemblies; maintenance tickets that move open → in_progress → resolved → closed.",
        fr: "La même plateforme fait vivre l'immeuble : budgets annuels par catégorie de charges, appelés en parts égales à chaque période et répartis sur les lots selon leur clé ; assemblées générales ; réclamations qui passent open → in_progress → resolved → closed.",
        ar: "المنصّة نفسها تُسيّر العمارة: ميزانيات سنوية لكلّ فئة أعباء، تُطلب بأجزاء متساوية كلّ فترة وتوزَّع على الوحدات حسب مفتاح التوزيع؛ جمعيات عامة؛ وتذاكر صيانة تنتقل open → in_progress → resolved → closed.",
      },
      details: [
        { en: "Charge lines use the same allocate(): they always sum exactly to the charge.", fr: "Les lignes de charges utilisent le même allocate() : elles font toujours exactement la charge.", ar: "أسطر الأعباء تستعمل allocate() نفسها: مجموعها يساوي العبء بالضبط دائمًا." },
        { en: "Inspections and insurance have due dates; overdue ones surface on the dashboard.", fr: "Contrôles et assurances ont des échéances ; les retards remontent au tableau de bord.", ar: "للفحوص والتأمينات آجال، والمتأخّر منها يظهر في لوحة القيادة." },
        { en: "Residents are notified when their ticket changes status.", fr: "Les résidents sont notifiés quand leur réclamation change d'état.", ar: "يُشعَر السكّان عند تغيّر حالة تذكرتهم." },
      ],
    },
    {
      kicker: { en: "1.5 — Background jobs", fr: "1.5 — Tâches de fond", ar: "1.5 — المهامّ الخلفية" },
      title: { en: "Work that must happen, even when something fails.", fr: "Le travail qui doit se faire, même quand ça échoue.", ar: "عمل يجب أن يتمّ، حتى عند الإخفاق." },
      body: {
        en: "Emails, PDFs, payment calls, option expiries and online-payment checks run in pg-boss queues stored in PostgreSQL. Each queue has its own retry policy: a failed job waits and tries again with backoff instead of disappearing.",
        fr: "E-mails, PDF, appels de fonds, expirations d'options et vérifications de paiements en ligne passent par des files pg-boss stockées dans PostgreSQL. Chaque file a sa politique de reprise : une tâche échouée attend et réessaie avec backoff au lieu de disparaître.",
        ar: "الرسائل وملفات PDF وطلبات الدفع وانتهاء الخيارات والتحقّق من الدفع الإلكتروني تمرّ عبر طوابير pg-boss مخزّنة في PostgreSQL. لكلّ طابور سياسة إعادة: المهمّة الفاشلة تنتظر وتُعيد المحاولة بتباعد متزايد بدل أن تضيع.",
      },
      details: [
        { en: "15 queues and 4 cron schedules in Algiers time — overdue reminders at 08:00.", fr: "15 files et 4 tâches planifiées à l'heure d'Alger — relances à 08:00.", ar: "15 طابورًا و4 جداول زمنية بتوقيت الجزائر — التذكيرات على الساعة 08:00." },
        { en: "A card payment left on the gateway page is re-checked every 10 minutes, up to 6 times.", fr: "Un paiement par carte abandonné sur la page de la passerelle est revérifié toutes les 10 minutes, jusqu'à 6 fois.", ar: "الدفع بالبطاقة المتروك في صفحة البوابة يُعاد فحصه كلّ 10 دقائق، حتى 6 مرّات." },
      ],
    },
  ] as Beat[],

  screens: [
    {
      kicker: { en: "1.6 — Screens · back office", fr: "1.6 — Écrans · back-office", ar: "1.6 — الشاشات · المكتب الخلفي" },
      title: { en: "A developer's Monday morning.", fr: "Le lundi matin d'un promoteur.", ar: "صباح الإثنين لدى المرقّي." },
      body: {
        en: "The organization switcher, the decisions waiting — a withdrawal to approve, an inspection overdue — and a nudge to protect an account that touches payments with two-factor authentication.",
        fr: "Le sélecteur d'organisation, les décisions en attente — un désistement à valider, un contrôle en retard — et l'invitation à protéger un compte qui touche aux encaissements par la double authentification.",
        ar: "مُبدّل المؤسسات، والقرارات المنتظرة — تنازل للاعتماد، فحص متأخّر — ودعوة لحماية حساب يصل إلى الدفعات بالمصادقة الثنائية.",
      },
    },
    {
      kicker: { en: "1.6 — Screens · pipeline", fr: "1.6 — Écrans · pipeline", ar: "1.6 — الشاشات · المسار" },
      title: { en: "The pipeline, stage by stage.", fr: "Le pipeline, étape par étape.", ar: "المسار، مرحلةً بمرحلة." },
      body: {
        en: "Leads by stage, each with its project, typology, budget and agent. A filter narrows the board to one agent; cards move by themselves as follow-ups, visits and quotations are recorded.",
        fr: "Les prospects par étape, chacun avec son projet, sa typologie, son budget et son commercial. Un filtre réduit le tableau à un commercial ; les cartes avancent seules au fil des relances, visites et devis.",
        ar: "العملاء حسب المرحلة، لكلّ منهم مشروعه ونمطه وميزانيته ومندوبه. مُرشّح يحصر اللوحة في مندوب واحد، والبطاقات تتقدّم وحدها مع المتابعات والزيارات وعروض الأسعار.",
      },
    },
    {
      kicker: { en: "1.6 — Screens · portal", fr: "1.6 — Écrans · portail", ar: "1.6 — الشاشات · البوابة" },
      title: { en: "The buyer's side of the same rows.", fr: "Les mêmes lignes, côté acquéreur.", ar: "الأسطر نفسها من جهة المشتري." },
      body: {
        en: "Nineteen portal pages read the same tables through the same isolation: the reservation and its number, what is paid and what remains, the next due date, the residence's announcements.",
        fr: "Dix-neuf pages de portail lisent les mêmes tables à travers la même isolation : la réservation et son numéro, le payé et le reste, la prochaine échéance, les annonces de la résidence.",
        ar: "تسع عشرة صفحة في البوابة تقرأ الجداول نفسها عبر العزل نفسه: الحجز ورقمه، المدفوع والمتبقّي، الاستحقاق القادم، وإعلانات الإقامة.",
      },
    },
  ] as Beat[],
};

/* ------------------------------------------------------------------ */
/* Scene 1.1 — Isolation                                               */
/* ------------------------------------------------------------------ */

const ORG = {
  eb: { uuid: "3b9e…", name: "El Bahdja Immobilier", short: "EB" },
  jo: { uuid: "c41a…", name: "Les Jardins d'Oran", short: "JO" },
} as const;

const UNITS: { org: keyof typeof ORG; ref: string; project: string; status: string }[] = [
  { org: "eb", ref: "B-02-02", project: "Les Oliviers", status: "reserved" },
  { org: "jo", ref: "F-01-01", project: "Front de Mer", status: "available" },
  { org: "eb", ref: "A-03-01", project: "Les Oliviers", status: "sold" },
  { org: "jo", ref: "F-03-02", project: "Front de Mer", status: "optioned" },
  { org: "eb", ref: "C-05-02", project: "La Corniche", status: "available" },
  { org: "jo", ref: "F-04-01", project: "Front de Mer", status: "reserved" },
  { org: "eb", ref: "Y-01-03", project: "El Yasmine", status: "delivered" },
];

const ISO_SQL: Ln[][] = [
  [
    { t: { en: "-- connected as realestate_app", fr: "-- connecté en realestate_app", ar: "-- متّصل بالدور realestate_app" }, k: "c" },
    { t: "SELECT ref, project, status FROM unit;" },
    { t: { en: "-- WHERE organization_id = $1   ← forgotten", fr: "-- WHERE organization_id = $1   ← oublié", ar: "-- WHERE organization_id = $1   ← منسيّ" }, k: "e" },
  ],
  [
    { t: "BEGIN;  -- withTenant(El Bahdja Immobilier)", k: "c" },
    { t: "SELECT set_config('app.current_org', '3b9e…', true);", k: "h" },
    { t: "SELECT ref, project, status FROM unit;" },
  ],
  [
    { t: { en: "-- a code path that skipped withTenant()", fr: "-- un chemin de code qui a sauté withTenant()", ar: "-- مسار تجاوز withTenant()" }, k: "c" },
    { t: "SELECT ref, project, status FROM unit;" },
    { t: "-- app.current_org = ''  →  NULLIF(…) = NULL", k: "c" },
  ],
  [
    { t: "ALTER TABLE unit DISABLE ROW LEVEL SECURITY;" },
    { t: "ERROR:  must be owner of table unit", k: "e" },
    { t: "DELETE FROM audit_log;" },
    { t: "ERROR:  permission denied for table audit_log", k: "e" },
  ],
];

const POLICY: { t: string; on: number[] }[] = [
  { t: "ALTER TABLE unit", on: [] },
  { t: "  ENABLE ROW LEVEL SECURITY;", on: [3] },
  { t: "ALTER TABLE unit", on: [] },
  { t: "  FORCE ROW LEVEL SECURITY;", on: [3] },
  { t: "", on: [] },
  { t: "CREATE POLICY tenant_isolation ON unit", on: [1] },
  { t: "  USING (organization_id =", on: [1] },
  { t: "    NULLIF(current_setting(", on: [2] },
  { t: "      'app.current_org', true),", on: [1, 2] },
  { t: "    '')::uuid)", on: [2] },
  { t: "  WITH CHECK ( … same … );", on: [1] },
  { t: "", on: [] },
  { t: "GRANT SELECT, INSERT, UPDATE, DELETE", on: [3] },
  { t: "  ON ALL TABLES TO realestate_app;", on: [3] },
  { t: "REVOKE UPDATE, DELETE, TRUNCATE", on: [3] },
  { t: "  ON audit_log FROM realestate_app;", on: [3] },
];

function OrgTag({ org }: { org: keyof typeof ORG }) {
  return (
    <span
      className={`erp-mono inline-flex h-5 w-7 items-center justify-center border text-[0.6rem] ${
        org === "eb" ? "border-ink bg-ink text-paper" : "border-[var(--erp-hair-2)] bg-paper text-graphite"
      }`}
    >
      {ORG[org].short}
    </span>
  );
}

function IsolationFigure() {
  const tx = useTx();
  const { beat } = useScene();
  const result: { t: L; tone: string }[] = [
    { t: { en: "7 rows — 3 belong to another organization", fr: "7 lignes — 3 appartiennent à une autre organisation", ar: "7 أسطر — 3 منها لمؤسسة أخرى" }, tone: "text-signal-deep" },
    { t: { en: "4 rows — tenant_isolation filtered 3", fr: "4 lignes — tenant_isolation en a filtré 3", ar: "4 أسطر — صفّت tenant_isolation ثلاثة" }, tone: "text-ink" },
    { t: { en: "0 rows — the database refuses instead of leaking", fr: "0 ligne — la base refuse au lieu de fuir", ar: "0 سطر — القاعدة ترفض بدل أن تُسرّب" }, tone: "text-ink" },
    { t: { en: "2 errors — the role cannot bypass the policy", fr: "2 erreurs — le rôle ne peut pas contourner la politique", ar: "خطآن — الدور لا يستطيع الالتفاف على السياسة" }, tone: "text-signal-deep" },
  ];
  return (
    <Figure
      fig="FIG. 1.1"
      title={{ en: "table unit · two organizations", fr: "table unit · deux organisations", ar: "جدول unit · مؤسستان" }}
      className="w-full [contain:inline-size]"
      bodyClassName={`${FIG_H} overflow-hidden`}
    >
      <div className="grid h-full lg:grid-cols-[minmax(0,1fr)_16.5rem]">
        <div className="flex min-h-0 flex-col">
          <div className="min-h-[5.6rem] border-b border-[var(--erp-hair)] bg-shell/40 px-3.5 py-2.5">
            <Label>session · realestate_app</Label>
            <CodeLines key={beat} lines={ISO_SQL[beat] ?? []} className="mt-1" />
          </div>
          <div className="min-h-0 flex-1 overflow-hidden px-3.5 py-2">
            <table className="w-full border-collapse text-[0.74rem]">
              <thead>
                <tr className="border-b border-[var(--erp-hair-2)] text-left">
                  <th className="erp-mono py-1.5 pe-2 text-[0.66rem] font-normal uppercase tracking-[0.12em] text-faint md:text-[0.6rem]">org</th>
                  <th className="erp-mono py-1.5 pe-2 text-[0.66rem] font-normal uppercase tracking-[0.12em] text-faint md:text-[0.6rem]">ref</th>
                  <th className="erp-mono hidden py-1.5 pe-2 text-[0.6rem] font-normal uppercase tracking-[0.12em] text-faint sm:table-cell">project</th>
                  <th className="erp-mono py-1.5 pe-2 text-[0.66rem] font-normal uppercase tracking-[0.12em] text-faint md:text-[0.6rem]">status</th>
                  <th className="py-1.5" />
                </tr>
              </thead>
              <tbody>
                {UNITS.map((u, i) => {
                  const mine = u.org === "eb";
                  const state = beat === 0 ? (mine ? "ok" : "leak") : beat === 2 ? "blocked" : mine ? "ok" : "blocked";
                  return (
                    <tr
                      key={u.ref}
                      className={`${i >= 5 ? "hidden sm:table-row" : ""} border-b border-[var(--erp-hair)] transition-[opacity,background-color] duration-500 ${
                        state === "blocked" ? "opacity-30" : ""
                      } ${state === "leak" ? "bg-[var(--erp-signal-soft)]" : ""}`}
                      style={{ transitionDelay: `${i * 45}ms` }}
                    >
                      <td className="py-[0.3rem] pe-2 md:py-[0.45rem]">
                        <OrgTag org={u.org} />
                      </td>
                      <td className={`erp-mono pe-2 text-ink ${state === "blocked" ? "line-through" : ""}`}>{u.ref}</td>
                      <td className={`hidden pe-2 text-graphite sm:table-cell ${state === "blocked" ? "line-through" : ""}`}>{u.project}</td>
                      <td className="pe-2">
                        <span className="erp-mono text-[0.68rem] text-graphite">{u.status}</span>
                      </td>
                      <td className="erp-mono text-end text-[0.64rem] uppercase tracking-[0.08em] md:text-[0.6rem]">
                        {state === "leak" && <span className="text-signal-deep">{tx({ en: "leak", fr: "fuite", ar: "تسرّب" })}</span>}
                        {state === "blocked" && <span className="text-faint">{tx({ en: "policy", fr: "politique", ar: "السياسة" })}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-2 hidden flex-wrap gap-x-4 gap-y-1 text-[0.68rem] text-mute sm:flex">
              <span className="flex items-center gap-1.5"><OrgTag org="eb" /> {ORG.eb.name} · {ORG.eb.uuid}</span>
              <span className="flex items-center gap-1.5"><OrgTag org="jo" /> {ORG.jo.name} · {ORG.jo.uuid}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--erp-hair)] px-3.5 py-2">
            <span className={`erp-dot`} data-lit={beat === 1 || beat === 2 ? "" : undefined} />
            <span key={beat} className={`immo-in erp-mono text-[0.68rem] md:text-[0.72rem] ${result[beat]?.tone}`}>
              {tx(result[beat]?.t)}
            </span>
          </div>
        </div>

        <aside
          className={`hidden min-h-0 flex-col border-s border-[var(--erp-hair)] px-3.5 py-2.5 transition-opacity duration-500 lg:flex ${
            beat === 0 ? "opacity-35" : ""
          }`}
        >
          <Label>{beat === 0 ? tx({ en: "post-migrate · not yet", fr: "post-migration · pas encore", ar: "بعد الترحيل · ليس بعد" }) : tx({ en: "post-migrate · every tenant table", fr: "post-migration · chaque table d'organisation", ar: "بعد الترحيل · كلّ جدول مؤسسة" })}</Label>
          <div className="erp-mono mt-2 text-[0.64rem] leading-[1.65]">
            {POLICY.map((l, i) => (
              <div
                key={i}
                className={`whitespace-pre transition-colors duration-500 ${
                  l.on.includes(beat) ? "bg-[var(--erp-signal-soft)] text-signal-deep" : "text-graphite"
                }`}
              >
                {l.t || " "}
              </div>
            ))}
          </div>
          <p className="mt-auto pt-3 text-[0.7rem] leading-snug text-mute [@media(max-height:700px)]:hidden">
            {tx({
              en: "Applied to every table with an organization_id, after every migration batch.",
              fr: "Appliqué à toute table portant un organization_id, après chaque lot de migrations.",
              ar: "يُطبَّق على كلّ جدول يحمل organization_id بعد كلّ دفعة ترحيلات.",
            })}
          </p>
        </aside>
      </div>
    </Figure>
  );
}

function IsolationScene() {
  const tx = useTx();
  return (
    <Scene id="immo-isolation" beats={4} length={70} label={tx({ en: "Isolation", fr: "Isolation", ar: "العزل" })}>
      <SceneLayout wide copy={<SceneCopy beats={COPY.iso} />} figure={<IsolationFigure />} />
      <LightUp nodes={["tenancy"]} at={0.55} />
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 1.2 — Roles                                                   */
/* ------------------------------------------------------------------ */

const ROLES = ["sales_agent", "sales_manager", "cashier", "accountant", "technical_manager", "owner"] as const;
type Role = (typeof ROLES)[number];

const PERMS: { p: string; label: L; roles: Role[] }[] = [
  { p: "discount:request", label: { en: "Request a discount", fr: "Demander une remise", ar: "طلب تخفيض" }, roles: ["sales_agent"] },
  { p: "discount:decide", label: { en: "Decide the discount", fr: "Décider la remise", ar: "البتّ في التخفيض" }, roles: ["sales_manager", "owner"] },
  { p: "payment:create", label: { en: "Record a payment", fr: "Encaisser", ar: "تسجيل دفعة" }, roles: ["cashier", "accountant", "owner"] },
  { p: "payment:cancel", label: { en: "Cancel a receipt", fr: "Annuler un reçu", ar: "إلغاء وصل" }, roles: ["accountant", "owner"] },
  { p: "milestone:report", label: { en: "Report a milestone", fr: "Signaler un jalon", ar: "الإبلاغ عن مرحلة" }, roles: ["sales_manager", "technical_manager", "owner"] },
  { p: "milestone:validate", label: { en: "Validate a milestone", fr: "Valider un jalon", ar: "اعتماد مرحلة" }, roles: ["sales_manager", "owner"] },
  { p: "sale:approve", label: { en: "Approve a withdrawal", fr: "Approuver un désistement", ar: "الموافقة على تنازل" }, roles: ["owner"] },
];

/** Which role is "logged in" for each step of the scene. */
const ROLE_STEPS: Role[] = ["sales_agent", "sales_manager", "cashier", "accountant", "sales_agent", "sales_agent"];

function RolesFigure() {
  const tx = useTx();
  const { beat } = useScene();
  const step = useStep((p) => {
    const b = Math.min(2, Math.floor(p * 3));
    return b * 2 + stepOf(p, b, 3, 2);
  });
  const role = ROLE_STEPS[step] ?? "sales_agent";
  const forged = beat === 2;

  return (
    <Figure
      fig="FIG. 1.2"
      title={{ en: "one reservation · six roles", fr: "une réservation · six rôles", ar: "حجز واحد · ستّة أدوار" }}
      className="w-full [contain:inline-size]"
      bodyClassName={`${FIG_H} overflow-hidden`}
    >
      <div className="flex h-full flex-col">
        {/* role tabs */}
        <div className="flex flex-wrap gap-px border-b border-[var(--erp-hair)] bg-[var(--erp-hair)]">
          {ROLES.map((r) => (
            <span
              key={r}
              className={`erp-mono flex-1 px-2 py-1.5 text-center text-[0.6rem] transition-colors duration-300 sm:text-[0.64rem] ${
                r === role ? "bg-ink text-paper" : "bg-paper text-faint"
              } ${r === "technical_manager" || r === "owner" ? "hidden sm:block" : ""}`}
            >
              {r}
            </span>
          ))}
        </div>

        <div className="grid min-h-0 flex-1 gap-0 md:grid-rows-[auto_1fr]">
          {/* the screen as this role sees it */}
          <div className="relative border-b border-[var(--erp-hair)] px-3.5 py-3 [@media(max-height:700px)]:py-2">
            <div className={`transition-opacity duration-300 ${forged ? "opacity-0" : "opacity-100"}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="erp-mono text-[0.78rem] text-ink">RES-2026-000005</p>
                <p className="text-[0.74rem] text-mute">Résidence Les Oliviers · B-02-02 · <span className="erp-mono">reserved</span></p>
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
                {PERMS.map((pm) => {
                  const ok = pm.roles.includes(role);
                  return (
                    <span
                      key={pm.p}
                      className={`flex min-h-[2.1rem] flex-col justify-center border px-2 py-1 transition-all duration-300 [@media(max-height:700px)]:min-h-[1.8rem] [@media(max-height:700px)]:py-0.5 ${
                        ok ? "border-ink bg-paper text-ink" : "border-dashed border-[var(--erp-hair-2)] text-faint"
                      }`}
                    >
                      <span className={`text-[0.7rem] leading-tight ${ok ? "" : "opacity-0"}`}>{tx(pm.label)}</span>
                      <span className="erp-mono text-[0.62rem] leading-tight text-faint md:text-[0.56rem]">{ok ? pm.p : `${pm.p} · ${tx({ en: "hidden", fr: "masqué", ar: "مخفيّ" })}`}</span>
                    </span>
                  );
                })}
              </div>
            </div>
            {forged && (
              <div className="absolute inset-0 px-3.5 py-3">
                <Label>{tx({ en: "forged request — DevTools, replayed", fr: "requête forgée — rejouée depuis DevTools", ar: "طلب مزوَّر — أُعيد من أدوات المطوّر" })}</Label>
                <CodeLines
                  className="mt-1.5"
                  lines={[
                    { t: { en: "→ server action   record payment   (B-02-02)", fr: "→ action serveur   encaisser   (B-02-02)", ar: "→ إجراء خادم   تسجيل دفعة   (B-02-02)" } },
                    { t: "  session         sales_agent @ El Bahdja Immobilier", k: "c" },
                    { t: "  assertCan(ctx, \"payment:create\")", k: "h" },
                    { t: "← FORBIDDEN       errors.FORBIDDEN", k: "e" },
                    { t: { en: "  no row written · nothing to undo", fr: "  aucune ligne écrite · rien à annuler", ar: "  لم يُكتب أيّ سطر · لا شيء للتراجع عنه" }, k: "c" },
                  ]}
                />
              </div>
            )}
          </div>

          {/* the permission matrix */}
          <div className="hidden min-h-0 overflow-hidden px-3.5 py-2.5 md:block">
            <table className="h-full w-full border-collapse">
              <thead>
                <tr>
                  <th className="erp-mono pb-1.5 text-left text-[0.58rem] font-normal uppercase tracking-[0.12em] text-faint">permission</th>
                  {ROLES.map((r) => (
                    <th
                      key={r}
                      className={`erp-mono px-1 pb-1.5 text-center text-[0.56rem] font-normal leading-tight transition-colors ${r === role ? "text-signal-deep" : "text-faint"}`}
                    >
                      {r.split("_").map((w, i) => (
                        <span key={i} className="block">{w}</span>
                      ))}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMS.map((pm) => (
                  <tr key={pm.p} className="border-t border-[var(--erp-hair)]">
                    <td className="erp-mono py-[0.2rem] pe-2 text-[0.66rem] text-graphite [@media(max-height:700px)]:py-[0.1rem]">{pm.p}</td>
                    {ROLES.map((r) => {
                      const ok = pm.roles.includes(r);
                      const cur = r === role;
                      return (
                        <td key={r} className={`text-center transition-colors duration-300 ${cur ? "bg-[var(--erp-signal-soft)]" : ""}`}>
                          <span
                            className={`inline-block h-2.5 w-2.5 ${
                              ok ? (cur ? "bg-signal" : "bg-ink") : "border border-[var(--erp-hair-2)]"
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Figure>
  );
}

function RolesScene() {
  const tx = useTx();
  return (
    <Scene id="immo-roles" beats={3} length={70} label={tx({ en: "Roles", fr: "Rôles", ar: "الأدوار" })}>
      <SceneLayout wide copy={<SceneCopy beats={COPY.roles2} />} figure={<RolesFigure />} />
      <LightUp nodes={["identity"]} at={0.45} />
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 1.3 — CRM + unit lifecycle + maquette                         */
/* ------------------------------------------------------------------ */

const LEAD_STAGES = ["new", "contacted", "visit_scheduled", "visited", "negotiation", "won"];
const LEAD_EVENTS: { ev: L; token: string }[] = [
  { ev: { en: "lead created", fr: "prospect créé", ar: "إنشاء العميل" }, token: "new" },
  { ev: { en: "follow-up logged", fr: "relance enregistrée", ar: "تسجيل متابعة" }, token: "contacted" },
  { ev: { en: "visit planned", fr: "visite planifiée", ar: "برمجة زيارة" }, token: "visit_scheduled" },
  { ev: { en: "visit done", fr: "visite effectuée", ar: "إنجاز الزيارة" }, token: "visited" },
  { ev: { en: "quotation DEV-2026-000012 issued", fr: "devis DEV-2026-000012 émis", ar: "إصدار عرض السعر DEV-2026-000012" }, token: "negotiation" },
  { ev: { en: "reservation RES-2026-000005 signed", fr: "réservation RES-2026-000005 signée", ar: "توقيع الحجز RES-2026-000005" }, token: "won" },
];

function CrmPanel({ step }: { step: number }) {
  const tx = useTx();
  return (
    <div className="flex h-full flex-col px-3.5 py-3 md:px-5 md:py-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <Label>{tx({ en: "lead", fr: "prospect", ar: "عميل محتمل" })}</Label>
          <p className="mt-1 text-[0.95rem] text-ink">Mohamed Cherif</p>
          <p className="text-[0.74rem] text-mute">Résidence Les Oliviers · B-02-02</p>
        </div>
        <Code lit>{LEAD_STAGES[step]}</Code>
      </div>
      <div className="mt-5">
        <StateTrack states={LEAD_STAGES} active={step} branches={["lost"]} />
      </div>
      <div className="mt-4 min-h-0 flex-1 overflow-hidden border-t border-[var(--erp-hair)] pt-2">
        <Label>{tx({ en: "event → stage reached", fr: "événement → étape atteinte", ar: "حدث → مرحلة" })}</Label>
        <ul className="mt-1.5 space-y-1">
          {LEAD_EVENTS.map((e, i) => (
            <li
              key={i}
              className={`flex items-baseline justify-between gap-3 text-[0.74rem] transition-opacity duration-300 ${i <= step ? "opacity-100" : "opacity-0"}`}
            >
              <span className={i === step ? "text-ink" : "text-graphite"}>{tx(e.ev)}</span>
              <span className={`erp-mono text-[0.66rem] ${i === step ? "text-signal-deep" : "text-faint"}`}>→ {e.token}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const UNIT_NODES: Record<string, { x: number; y: number }> = {
  available: { x: 72, y: 150 },
  optioned: { x: 222, y: 58 },
  reserved: { x: 352, y: 150 },
  sold: { x: 482, y: 150 },
  delivered: { x: 600, y: 150 },
  rented: { x: 222, y: 252 },
  blocked: { x: 412, y: 252 },
};
/** Undirected pairs from the transition table (main path drawn separately). */
const UNIT_EDGES: [string, string][] = [
  ["available", "blocked"],
  ["available", "rented"],
  ["rented", "blocked"],
  ["blocked", "delivered"],
];
/** The path walked in the figure: from → to, and the step at which it lights. */
const UNIT_PATH: { a: string; b: string; at: number }[] = [
  { a: "available", b: "optioned", at: 1 },
  { a: "optioned", b: "reserved", at: 3 },
  { a: "reserved", b: "sold", at: 4 },
];
const UNIT_LOG: { t: string | L; err?: boolean; at: number }[] = [
  { t: { en: "available → optioned    option · expires automatically", fr: "available → optioned    option · expire seule", ar: "available → optioned    خيار · ينتهي تلقائيًا" }, at: 1 },
  { t: "optioned  → sold        INVALID_TRANSITION", err: true, at: 2 },
  { t: "optioned  → reserved    RES-2026-000005", at: 3 },
  { t: { en: "reserved  → sold        contract signed (VSP)", fr: "reserved  → sold        contrat signé (VSP)", ar: "reserved  → sold        توقيع العقد (VSP)" }, at: 4 },
];

/** Phone layout of the same machine: main path vertical, side states on the right. */
const UNIT_NODES_M: Record<string, { x: number; y: number }> = {
  available: { x: 110, y: 20 },
  optioned: { x: 110, y: 78 },
  reserved: { x: 110, y: 136 },
  sold: { x: 110, y: 194 },
  delivered: { x: 110, y: 256 },
  rented: { x: 270, y: 78 },
  blocked: { x: 270, y: 194 },
};

function UnitNodes({ nodes, current, visited, W, H }: { nodes: Record<string, { x: number; y: number }>; current: string; visited: Set<string>; W: number; H: number }) {
  return (
    <>
      {Object.entries(nodes).map(([k, n]) => {
        const cur = k === current;
        const done = visited.has(k) && !cur;
        return (
          <g key={k} transform={`translate(${n.x - W / 2} ${n.y - H / 2})`}>
            {k === "delivered" && <rect x={-3} y={-3} width={W + 6} height={H + 6} fill="none" stroke="var(--erp-hair-2)" />}
            <rect
              width={W}
              height={H}
              fill={cur ? "var(--color-signal)" : done ? "var(--color-ink)" : "var(--color-paper)"}
              stroke={cur ? "var(--color-signal)" : done ? "var(--color-ink)" : "var(--erp-hair-2)"}
              style={{ transition: "fill .4s, stroke .4s" }}
            />
            <text x={W / 2} y={H / 2 + 4} textAnchor="middle" className="erp-mono" fontSize={12} fill={cur || done ? "#fff" : "var(--color-graphite)"}>
              {k}
            </text>
          </g>
        );
      })}
    </>
  );
}

function UnitEdges({ nodes, step }: { nodes: Record<string, { x: number; y: number }>; step: number }) {
  return (
    <>
      {UNIT_EDGES.map(([a, b]) => (
        <line key={a + b} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="var(--erp-hair-2)" strokeWidth={1} strokeDasharray="3 4" />
      ))}
      {[...UNIT_PATH, { a: "sold", b: "delivered", at: 99 }].map((e) => {
        const on = step >= e.at;
        return (
          <line
            key={e.a + e.b}
            x1={nodes[e.a].x}
            y1={nodes[e.a].y}
            x2={nodes[e.b].x}
            y2={nodes[e.b].y}
            stroke={on ? "var(--color-signal)" : "var(--erp-hair-2)"}
            strokeWidth={on ? 2 : 1}
            style={{ transition: "stroke .4s, stroke-width .4s" }}
          />
        );
      })}
    </>
  );
}

function UnitPanel({ step }: { step: number }) {
  const tx = useTx();
  const current = step >= 4 ? "sold" : step >= 3 ? "reserved" : step >= 1 ? "optioned" : "available";
  const visited = new Set(["available", ...(step >= 1 ? ["optioned"] : []), ...(step >= 3 ? ["reserved"] : []), ...(step >= 4 ? ["sold"] : [])]);
  const rejected = { opacity: step === 2 ? 1 : step > 2 ? 0.25 : 0, transition: "opacity .4s" };
  const terminated = tx({ en: "↩ terminated", fr: "↩ résilié", ar: "↩ فُسخ" });
  const terminal = tx({ en: "terminal · via PVL", fr: "terminal · via PVL", ar: "نهائية · عبر PVL" });
  const last = [...UNIT_LOG].reverse().find((l) => step >= l.at);
  return (
    <div className="flex h-full flex-col px-3 py-3 md:px-4">
      {/* desktop: the machine laid out left to right */}
      <svg viewBox="0 0 680 300" className="hidden min-h-0 w-full flex-1 md:block" aria-hidden>
        {/* back edge: a sale terminated for non-payment */}
        <path d="M 482 166 C 440 214, 120 214, 72 166" fill="none" stroke="var(--erp-hair-2)" strokeDasharray="3 4" />
        <text x={470} y={194} textAnchor="end" className="erp-mono" fontSize={11} fill="var(--color-faint)">
          {terminated}
        </text>
        <UnitEdges nodes={UNIT_NODES} step={step} />
        <line x1={72} y1={150} x2={352} y2={150} stroke="var(--erp-hair-2)" strokeWidth={1} />
        {/* rejected attempt */}
        <g style={rejected}>
          <path d="M 276 58 C 400 40, 470 80, 482 134" fill="none" stroke="var(--color-signal-deep)" strokeWidth={1.5} strokeDasharray="5 4" />
          <g transform="translate(424 58)">
            <rect x={-9} y={-9} width={18} height={18} fill="var(--color-paper)" stroke="var(--color-signal-deep)" />
            <path d="M -4 -4 L 4 4 M 4 -4 L -4 4" stroke="var(--color-signal-deep)" strokeWidth={1.5} />
          </g>
          <text x={440} y={40} className="erp-mono" fontSize={11} fill="var(--color-signal-deep)">INVALID_TRANSITION</text>
        </g>
        <UnitNodes nodes={UNIT_NODES} current={current} visited={visited} W={108} H={32} />
        <text x={600} y={188} textAnchor="middle" className="erp-mono" fontSize={11} fill="var(--color-faint)">{terminal}</text>
      </svg>

      {/* phone: same states and transitions, main path vertical so labels stay legible */}
      <svg viewBox="0 0 340 290" className="min-h-0 w-full flex-1 md:hidden" aria-hidden>
        <path d="M 60 194 C 8 194, 8 20, 60 20" fill="none" stroke="var(--erp-hair-2)" strokeDasharray="3 4" />
        <text x={4} y={222} className="erp-mono" fontSize={11} fill="var(--color-faint)">
          {terminated}
        </text>
        <path d="M 60 26 C 40 50, 40 112, 60 130" fill="none" stroke="var(--erp-hair-2)" />
        <UnitEdges nodes={UNIT_NODES_M} step={step} />
        <g style={rejected}>
          <path d="M 160 84 C 198 100, 198 172, 160 188" fill="none" stroke="var(--color-signal-deep)" strokeWidth={1.5} strokeDasharray="5 4" />
          <g transform="translate(189 136)">
            <rect x={-9} y={-9} width={18} height={18} fill="var(--color-paper)" stroke="var(--color-signal-deep)" />
            <path d="M -4 -4 L 4 4 M 4 -4 L -4 4" stroke="var(--color-signal-deep)" strokeWidth={1.5} />
          </g>
          <rect x={202} y={128} width={124} height={17} fill="var(--color-paper)" />
          <text x={204} y={141} className="erp-mono" fontSize={11} fill="var(--color-signal-deep)">INVALID_TRANSITION</text>
        </g>
        <UnitNodes nodes={UNIT_NODES_M} current={current} visited={visited} W={100} H={26} />
        <text x={168} y={260} className="erp-mono" fontSize={11} fill="var(--color-faint)">{terminal}</text>
      </svg>

      <div className="mt-2 shrink-0 border-t border-[var(--erp-hair)] pt-2">
        <Label>unit_status_history · {tx({ en: "append-only", fr: "ajout seul", ar: "للإضافة فقط" })}</Label>
        <div className="erp-mono mt-1 hidden space-y-0.5 text-[0.68rem] md:block">
          {UNIT_LOG.map((l, i) => (
            <div
              key={i}
              className={`whitespace-pre transition-opacity duration-300 ${step >= l.at ? "opacity-100" : "opacity-0"} ${
                l.err ? "text-signal-deep line-through decoration-1" : "text-graphite"
              }`}
            >
              {tx(l.t)}
            </div>
          ))}
        </div>
        <p
          key={last ? UNIT_LOG.indexOf(last) : -1}
          className={`immo-in erp-mono mt-1 min-h-[1.1rem] text-[0.7rem] md:hidden ${last?.err ? "text-signal-deep line-through decoration-1" : "text-graphite"}`}
        >
          {last ? tx(last.t).replace(/\s+→\s+/, " → ").replace(/ {2,}/g, " · ") : " "}
        </p>
      </div>
    </div>
  );
}

const MAQ_LEGEND: [string, string][] = [
  ["Disponible", "available"],
  ["Optionné", "optioned"],
  ["Réservé", "reserved"],
  ["Vendu", "sold"],
  ["Livré", "delivered"],
  ["Bloqué", "blocked"],
  ["Loué", "rented"],
];

function MaquettePanel() {
  const tx = useTx();
  return (
    <div className="relative h-full">
      <Image
        src="/projects/sayroura/maquette.webp"
        alt={tx({ en: "Sayroura Immo — 3D maquette, every lot coloured by its state", fr: "Sayroura Immo — maquette 3D, chaque lot coloré selon son état", ar: "Sayroura Immo — مجسّم ثلاثي الأبعاد، كلّ وحدة ملوّنة حسب حالتها" })}
        width={1800}
        height={1125}
        className="h-full w-full object-cover object-[60%_50%] md:scale-125"
        style={{ transformOrigin: "88% 55%" }}
      />
      <div className="absolute bottom-2 end-2 hidden border border-[var(--erp-hair)] bg-paper/90 px-3 py-2 sm:block">
        <Label>{tx({ en: "legend", fr: "légende", ar: "مفتاح الألوان" })} → unit.status</Label>
        <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[0.66rem]">
          {MAQ_LEGEND.map(([fr, tok]) => (
            <span key={tok} className="flex justify-between gap-3">
              <span className="text-graphite">{fr}</span>
              <span className="erp-mono text-faint">{tok}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function LifecycleFigure() {
  const { beat } = useScene();
  const crm = useStep((p) => stepOf(p, 0, 3, 6, 0.04, 0.1));
  const unit = useStep((p) => stepOf(p, 1, 3, 5, 0.05, 0.1));
  const titles: L[] = [
    { en: "lead · stages advance on events", fr: "prospect · l'étape suit les événements", ar: "عميل · المرحلة تتبع الأحداث" },
    { en: "unit · allowed transitions", fr: "lot · transitions permises", ar: "وحدة · الانتقالات المسموحة" },
    { en: "maquette · demo data", fr: "maquette · données de démo", ar: "المجسّم · بيانات تجريبية" },
  ];
  return (
    <Figure fig="FIG. 1.3" title={titles[beat]} className="w-full [contain:inline-size]" bodyClassName={`${FIG_H} overflow-hidden`}>
      <AtStack className="h-full grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)]">
        <At from={0} className="h-full min-h-0 overflow-hidden">
          <CrmPanel step={crm} />
        </At>
        <At from={1} className="h-full min-h-0 overflow-hidden">
          <UnitPanel step={unit} />
        </At>
        <At from={2} className="h-full min-h-0 overflow-hidden">
          <MaquettePanel />
        </At>
      </AtStack>
    </Figure>
  );
}

function LifecycleScene() {
  const tx = useTx();
  return (
    <Scene id="immo-lifecycle" beats={3} length={75} label={tx({ en: "Lifecycle", fr: "Cycle de vie", ar: "دورة الحياة" })}>
      <SceneLayout wide copy={<SceneCopy beats={COPY.life} />} figure={<LifecycleFigure />} />
      <LightUp nodes={["crm"]} at={0.28} />
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 1.4 — Contracts, payment calls, numbering, PDF                */
/* ------------------------------------------------------------------ */

const PLAN = [
  { label: "Signature (réservation + fondations)", trigger: "signing", bp: 3500, amount: "4 623 500,00" },
  { label: "Gros œuvre", trigger: "milestone", bp: 3500, amount: "4 623 500,00" },
  { label: "Achèvement des travaux", trigger: "milestone", bp: 2500, amount: "3 302 500,00" },
  { label: "Remise des clés", trigger: "milestone", bp: 500, amount: "660 500,00" },
];
const CUMUL = [
  { stage: "signing", pct: 35 },
  { stage: "foundations", pct: 35 },
  { stage: "structure", pct: 70 },
  { stage: "completion", pct: 95 },
];

function SchedulePanel({ step }: { step: number }) {
  const tx = useTx();
  return (
    <div className="flex h-full flex-col px-3.5 py-3 md:px-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <Label>plan · VSP standard</Label>
          <p className="mt-1 text-[0.82rem] text-ink">Les Oliviers · B-02-02</p>
        </div>
        <p className="erp-mono text-[0.8rem] text-ink">13 210 000,00 DA</p>
      </div>
      <table className="mt-2.5 w-full border-collapse text-[0.72rem]">
        <thead>
          <tr className="border-b border-[var(--erp-hair-2)] text-left">
            <th className="erp-mono py-1 text-[0.58rem] font-normal uppercase tracking-[0.12em] text-faint">#</th>
            <th className="erp-mono py-1 text-[0.58rem] font-normal uppercase tracking-[0.12em] text-faint">{tx({ en: "step", fr: "tranche", ar: "القسط" })}</th>
            <th className="erp-mono hidden py-1 text-[0.58rem] font-normal uppercase tracking-[0.12em] text-faint sm:table-cell">{tx({ en: "trigger", fr: "déclencheur", ar: "المُطلِق" })}</th>
            <th className="erp-mono py-1 text-end text-[0.58rem] font-normal uppercase tracking-[0.12em] text-faint">{tx({ en: "bp", fr: "pb", ar: "ن.أ" })}</th>
            <th className="erp-mono py-1 text-end text-[0.58rem] font-normal uppercase tracking-[0.12em] text-faint">DA</th>
          </tr>
        </thead>
        <tbody>
          {PLAN.map((l, i) => (
            <tr key={i} className={`border-b border-[var(--erp-hair)] transition-opacity duration-300 ${step >= i ? "opacity-100" : "opacity-15"}`}>
              <td className="erp-mono py-1 pe-2 text-faint">{i + 1}</td>
              <td className="py-1 pe-2 text-graphite">{l.label}</td>
              <td className="erp-mono hidden py-1 pe-2 text-[0.66rem] text-mute sm:table-cell">{l.trigger}</td>
              <td className="erp-mono py-1 pe-2 text-end text-ink">{l.bp.toLocaleString("fr-FR")}</td>
              <td className="erp-mono py-1 text-end text-ink">{l.amount}</td>
            </tr>
          ))}
          <tr className={`transition-opacity duration-300 ${step >= 4 ? "opacity-100" : "opacity-0"}`}>
            <td />
            <td className="erp-mono py-1.5 text-[0.66rem] text-signal-deep">Σ</td>
            <td className="hidden sm:table-cell" />
            <td className="erp-mono py-1.5 pe-2 text-end text-signal-deep">10 000</td>
            <td className="erp-mono py-1.5 text-end text-signal-deep">13 210 000,00</td>
          </tr>
        </tbody>
      </table>
      <div className={`mt-auto hidden border-t border-[var(--erp-hair)] pt-2.5 transition-opacity duration-500 sm:block ${step >= 4 ? "opacity-100" : "opacity-30"}`}>
        <Label>{tx({ en: "cumulative share called, per construction stage", fr: "part cumulée appelée, par stade de chantier", ar: "الحصّة التراكمية المطلوبة حسب مرحلة الأشغال" })}</Label>
        <div className="mt-2 space-y-1">
          {CUMUL.map((c) => (
            <div key={c.stage} className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-2">
              <span className="erp-mono text-[0.64rem] text-graphite">{c.stage}</span>
              <span className="relative h-2 bg-shell">
                <span
                  className="absolute inset-y-0 start-0 bg-ink transition-transform duration-700"
                  style={{ width: `${c.pct}%`, transform: `scaleX(${step >= 4 ? 1 : 0})`, transformOrigin: "left" }}
                />
              </span>
              <span className="erp-mono text-end text-[0.64rem] text-ink">{c.pct} %</span>
            </div>
          ))}
        </div>
        <p className="erp-mono mt-2 text-[0.66rem] text-mute">checkVspLimits(steps, milestones, limits) → <span className="text-ink">[ ]</span></p>
      </div>
    </div>
  );
}

const MILESTONES = [
  { stage: "foundations", name: "Fondations" },
  { stage: "structure", name: "Achèvement du gros œuvre" },
  { stage: "completion", name: "Achèvement des travaux" },
  { stage: "handover", name: "Remise des clés" },
];
const CALLS = [
  { n: "ADF-2026-000031", unit: "B-02-02", buyer: "Mohamed Cherif" },
  { n: "ADF-2026-000032", unit: "B-03-01", buyer: "Amina Kaci" },
  { n: "ADF-2026-000033", unit: "A-03-01", buyer: "Rachid Ould Ali" },
  { n: "ADF-2026-000034", unit: "A-01-02", buyer: "Nesrine Belaïd" },
];

function MilestonePanel({ step }: { step: number }) {
  const tx = useTx();
  return (
    <div className="flex h-full flex-col px-3.5 py-3 md:px-5">
      <Label>{tx({ en: "construction · Les Oliviers, building B", fr: "chantier · Les Oliviers, bâtiment B", ar: "الورشة · Les Oliviers، العمارة B" })}</Label>
      <div className="mt-3">
        <StateTrack states={MILESTONES.map((m) => m.stage)} active={step >= 1 ? 1 : 0} />
      </div>
      <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 text-[0.72rem]">
        <span className={`erp-mono text-[0.62rem] ${step >= 1 ? "text-signal-deep" : "text-faint"}`}>01</span>
        <span className={`transition-opacity duration-300 ${step >= 1 ? "opacity-100" : "opacity-30"}`}>
          <span className="text-ink">sales_manager</span> <span className="erp-mono text-mute">milestone:validate</span> · {MILESTONES[1].name}
        </span>
        <span className={`erp-mono text-[0.62rem] ${step >= 2 ? "text-signal-deep" : "text-faint"}`}>02</span>
        <span className={`flex items-center gap-2 transition-opacity duration-300 ${step >= 2 ? "opacity-100" : "opacity-30"}`}>
          <span className="erp-mono text-ink">payment_call.issue</span>
          <span className="relative hidden h-1 w-16 overflow-hidden bg-shell sm:block">
            {step === 2 && <span className="immo-run absolute inset-y-0 w-1/4 bg-signal" />}
            {step > 2 && <span className="absolute inset-0 bg-ink" />}
          </span>
          <span className="erp-mono text-[0.62rem] text-faint">{tx({ en: "retry 5 · backoff", fr: "5 reprises · backoff", ar: "5 محاولات · تباعد" })}</span>
        </span>
      </div>
      <div className="mt-3 min-h-0 flex-1 overflow-hidden border-t border-[var(--erp-hair)] pt-2">
        <div className="space-y-1">
          {CALLS.map((c, i) => (
            <div
              key={c.n}
              className={`grid grid-cols-[1fr_auto] items-baseline gap-3 border-b border-[var(--erp-hair)] pb-1 text-[0.72rem] transition-all duration-500 sm:grid-cols-[9.5rem_4.5rem_1fr_auto] ${
                step >= 3 ? "translate-x-0 opacity-100" : "translate-x-3 opacity-0"
              }`}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <span className="erp-mono text-ink">{c.n}</span>
              <span className="erp-mono hidden text-graphite sm:inline">{c.unit}</span>
              <span className="hidden text-graphite sm:inline">{c.buyer}</span>
              <span className="erp-mono text-[0.66rem] text-mute">35 %</span>
            </div>
          ))}
        </div>
        <p className={`erp-mono mt-2 text-[0.66rem] text-mute transition-opacity duration-500 ${step >= 3 ? "opacity-100" : "opacity-0"}`}>
          due = max(validated_on + delay, signed_on)
        </p>
      </div>
    </div>
  );
}

/** Who holds the counter row's lock, and when (percent of the panel's time axis). */
const LOCK: { who: string; segs: { a: number; b: number; k: "hold" | "wait"; at: number }[]; commit: { x: number; at: number } }[] = [
  { who: "T1", segs: [{ a: 0, b: 50, k: "hold", at: 0 }], commit: { x: 50, at: 2 } },
  { who: "T2", segs: [{ a: 18, b: 50, k: "wait", at: 1 }, { a: 50, b: 80, k: "hold", at: 2 }], commit: { x: 80, at: 3 } },
];

function CounterPanel({ step }: { step: number }) {
  const tx = useTx();
  const value = step >= 2 ? 144 : 143;
  const lane = (who: string, how: string, lines: { t: string | L; at: number; k?: Ln["k"] }[], waiting: boolean) => (
    <div className="min-w-0 border border-[var(--erp-hair)] px-2.5 py-2">
      <p className="text-[0.74rem] text-ink">{who}</p>
      <p className="erp-mono text-[0.6rem] text-faint">{how}</p>
      <div className="erp-mono mt-1.5 space-y-0.5 text-[0.62rem] leading-snug md:text-[0.64rem]">
        {lines.map((l, i) => (
          <div
            key={i}
            className={`break-words transition-opacity duration-300 ${step >= l.at ? "opacity-100" : "opacity-0"} ${
              l.k === "h" ? "text-signal-deep" : l.k === "c" ? "text-faint" : "text-graphite"
            }`}
          >
            {tx(l.t)}
          </div>
        ))}
      </div>
      <div className={`relative mt-1.5 h-[3px] overflow-hidden bg-shell ${waiting ? "opacity-100" : "opacity-0"}`}>
        <span className="immo-wait absolute inset-0 bg-signal" />
      </div>
    </div>
  );
  return (
    <div className="flex h-full flex-col px-3.5 py-3 md:px-5">
      <Label>document_sequence</Label>
      <div className="mt-1.5 grid grid-cols-4 border border-[var(--erp-hair-2)] text-[0.68rem]">
        {["organization", "doc_type", "year", "last_value"].map((h) => (
          <span key={h} className="erp-mono border-b border-[var(--erp-hair)] px-2 py-1 text-[0.56rem] uppercase tracking-[0.1em] text-faint">
            {h}
          </span>
        ))}
        <span className="erp-mono px-2 py-1.5 text-graphite">3b9e…</span>
        <span className="erp-mono px-2 py-1.5 text-graphite">receipt</span>
        <span className="erp-mono px-2 py-1.5 text-graphite">2026</span>
        <span className={`erp-mono flex items-center gap-1.5 px-2 py-1.5 ${step <= 2 ? "bg-[var(--erp-signal-soft)] text-signal-deep" : "text-ink"}`}>
          <span key={value} className="immo-in">{value}</span>
          {step <= 2 && <span className="text-[0.56rem]">{tx({ en: "lock", fr: "verrou", ar: "قفل" })} · {step <= 1 ? "T1" : "T2"}</span>}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 items-start gap-2">
        {lane(
          tx({ en: "T1 · cashier", fr: "T1 · caissier", ar: "T1 · أمين الصندوق" }),
          tx({ en: "cash at the counter", fr: "espèces au guichet", ar: "نقدًا في الشبّاك" }),
          [
            { t: "UPDATE … SET last_value = last_value + 1", at: 0 },
            { t: "RETURNING → 143", at: 0, k: "h" },
            { t: "INSERT receipt REC-2026-000143", at: 1 },
            { t: { en: "COMMIT · lock released", fr: "COMMIT · verrou libéré", ar: "COMMIT · تحرير القفل" }, at: 2, k: "c" },
          ],
          false
        )}
        {lane(
          tx({ en: "T2 · online", fr: "T2 · en ligne", ar: "T2 · عبر الإنترنت" }),
          tx({ en: "card payment via SATIM", fr: "carte via SATIM", ar: "بطاقة عبر SATIM" }),
          [
            { t: "UPDATE … SET last_value = last_value + 1", at: 1 },
            { t: { en: "… waiting for T1's row lock", fr: "… attend le verrou de T1", ar: "… ينتظر قفل T1" }, at: 1, k: "c" },
            { t: "RETURNING → 144", at: 2, k: "h" },
            { t: "INSERT receipt REC-2026-000144 · COMMIT", at: 3 },
          ],
          step === 1
        )}
      </div>
      <div className="immo-tall-only mt-3">
        <div>
          <Label>{tx({ en: "the row lock over time", fr: "le verrou de ligne dans le temps", ar: "قفل السطر عبر الزمن" })}</Label>
          <div className="mt-1.5 space-y-1.5">
            {LOCK.map((l) => (
              <div key={l.who} className="grid grid-cols-[2rem_1fr] items-center gap-2">
                <span className="erp-mono text-[0.62rem] text-graphite">{l.who}</span>
                <span className="relative h-4 border-b border-[var(--erp-hair)]">
                  {l.segs.map((sg, i) => (
                    <span
                      key={i}
                      className={`absolute inset-y-0.5 transition-[opacity,transform] duration-500 ${
                        sg.k === "hold" ? "bg-ink" : "border border-dashed border-signal bg-[var(--erp-signal-soft)]"
                      }`}
                      style={{ left: `${sg.a}%`, width: `${sg.b - sg.a}%`, transformOrigin: "left", transform: `scaleX(${step >= sg.at ? 1 : 0})`, opacity: step >= sg.at ? 1 : 0 }}
                    />
                  ))}
                  <span
                    className="erp-mono absolute top-0 text-[0.62rem] leading-4 text-signal-deep transition-opacity duration-300"
                    style={{ left: `calc(${l.commit.x}% + 6px)`, opacity: step >= l.commit.at ? 1 : 0 }}
                  >
                    COMMIT
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 hidden min-h-0 flex-1 overflow-hidden sm:block">
        <Label>{tx({ en: "receipts", fr: "reçus", ar: "الوصولات" })}</Label>
        <div className="mt-1 border-t border-[var(--erp-hair)]">
          {[
            { n: "REC-2026-000142", by: tx({ en: "earlier", fr: "antérieur", ar: "سابق" }), at: -1 },
            { n: "REC-2026-000143", by: tx({ en: "T1 · cash", fr: "T1 · espèces", ar: "T1 · نقدًا" }), at: 2 },
            { n: "REC-2026-000144", by: tx({ en: "T2 · card (SATIM)", fr: "T2 · carte (SATIM)", ar: "T2 · بطاقة (SATIM)" }), at: 3 },
          ].map((r) => (
            <div
              key={r.n}
              className={`grid grid-cols-[9.5rem_1fr_auto] items-baseline gap-3 border-b border-[var(--erp-hair)] py-1 text-[0.7rem] transition-opacity duration-300 ${
                step >= r.at ? "opacity-100" : "opacity-15"
              }`}
            >
              <span className={`erp-mono ${step === r.at ? "text-signal-deep" : "text-ink"}`}>{r.n}</span>
              <span className="erp-mono text-[0.62rem] text-mute">{r.by}</span>
              <span className="erp-mono text-[0.62rem] text-faint">{step >= r.at ? tx({ en: "committed", fr: "validé", ar: "مُلتزَم" }) : "—"}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-auto pt-2 text-[0.7rem] leading-snug text-mute">
        {tx({
          en: "Had T1 rolled back, 143 would return to the counter and T2 would take it: the series never has a hole.",
          fr: "Si T1 avait annulé, 143 serait revenu au compteur et T2 l'aurait pris : la série n'a jamais de trou.",
          ar: "لو تراجعت T1 لعاد 143 إلى العدّاد وأخذته T2: السلسلة لا ثغرة فيها أبدًا.",
        })}
      </p>
    </div>
  );
}

function PdfPanel({ step }: { step: number }) {
  const tx = useTx();
  const stages = ["pdf.document", tx({ en: "React template", fr: "modèle React", ar: "قالب React" }), "Chromium", tx({ en: "stored", fr: "stocké", ar: "محفوظ" })];
  return (
    <div className="grid h-full gap-3 px-3.5 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:px-5">
      <div className="hidden min-h-0 flex-col sm:flex">
        <Label>{tx({ en: "pipeline · after commit", fr: "chaîne · après le commit", ar: "السلسلة · بعد الالتزام" })}</Label>
        <ol className="mt-2 space-y-1.5">
          {stages.map((s, i) => (
            <li key={s} className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 transition-colors duration-300 ${step > i ? "bg-ink" : step === i ? "bg-signal" : "border border-[var(--erp-hair-2)]"}`} />
              <span className={`erp-mono text-[0.7rem] ${step >= i ? "text-ink" : "text-faint"}`}>{s}</span>
              {i === 0 && <span className="erp-mono text-[0.6rem] text-faint">{tx({ en: "retry 3 · 15 s · backoff", fr: "3 reprises · 15 s · backoff", ar: "3 محاولات · 15 ث · تباعد" })}</span>}
            </li>
          ))}
        </ol>
        <div className="mt-auto">
          <Label>{tx({ en: "numbered series", fr: "séries numérotées", ar: "سلاسل مرقّمة" })}</Label>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {["REC", "RES", "VSP", "ADF", "DEV", "PVL"].map((p) => (
              <span key={p} className="erp-mono border border-[var(--erp-hair-2)] px-1.5 py-0.5 text-[0.62rem] text-graphite">{p}</span>
            ))}
            <span className="erp-mono px-1.5 py-0.5 text-[0.62rem] text-faint">· {tx({ en: "23 templates", fr: "23 modèles", ar: "23 قالبًا" })}</span>
          </div>
        </div>
      </div>
      <div className="relative min-h-0 overflow-hidden border border-[var(--erp-hair-2)] bg-paper px-3.5 py-3 shadow-none">
        <div className="flex items-start justify-between gap-2 border-b border-[var(--erp-hair)] pb-2">
          <div>
            <p className="text-[0.74rem] font-medium text-ink">El Bahdja Immobilier</p>
            <p className="text-[0.6rem] text-faint">SARL · RC · NIF</p>
          </div>
          <span className={`erp-mono border px-1.5 py-0.5 text-[0.6rem] transition-colors ${step >= 3 ? "border-ink text-ink" : "border-[var(--erp-hair-2)] text-faint"}`}>PDF</span>
        </div>
        <p className="mt-2.5 text-[0.82rem] text-ink">Reçu de paiement</p>
        <p className="erp-mono text-[0.78rem] text-signal-deep">REC-2026-000143</p>
        <dl className="mt-2.5 space-y-1 text-[0.68rem]">
          {[
            ["Reçu de", "Mohamed Cherif"],
            ["Lot", "Les Oliviers · B-02-02"],
            ["Objet", "Tranche 1 · signature"],
            ["Mode", "espèces"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b border-dotted border-[var(--erp-hair)] pb-0.5">
              <dt className="text-faint">{k}</dt>
              <dd className="text-end text-graphite">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="erp-mono mt-2.5 text-end text-[0.9rem] text-ink">4 623 500,00 DA</p>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-full bg-paper transition-transform duration-700 ease-[var(--erp-ease)]"
          style={{ transform: `translateY(${step >= 2 ? 100 : step === 1 ? 45 : 0}%)` }}
        />
      </div>
    </div>
  );
}

function MoneyFigure() {
  const { beat } = useScene();
  const sched = useStep((p) => stepOf(p, 0, 4, 5, 0.04, 0.1));
  const mile = useStep((p) => stepOf(p, 1, 4, 4, 0.04, 0.1));
  const count = useStep((p) => stepOf(p, 2, 4, 4, 0.04, 0.1));
  const pdf = useStep((p) => stepOf(p, 3, 4, 4, 0.04, 0.12));
  const titles: L[] = [
    { en: "buildSchedule · integer centimes", fr: "buildSchedule · centimes entiers", ar: "buildSchedule · سنتيمات صحيحة" },
    { en: "milestone → payment calls", fr: "jalon → appels de fonds", ar: "مرحلة → طلبات دفع" },
    { en: "gap-free counter · row lock", fr: "compteur sans trou · verrou de ligne", ar: "عدّاد بلا ثغرات · قفل السطر" },
    { en: "receipt · rendered after commit", fr: "reçu · rendu après le commit", ar: "وصل · يُخرج بعد الالتزام" },
  ];
  return (
    <Figure fig="FIG. 1.4" title={titles[beat]} className="w-full [contain:inline-size]" bodyClassName={`${FIG_H} overflow-hidden`}>
      <AtStack className="h-full grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)]">
        <At from={0} className="h-full min-h-0 overflow-hidden">
          <SchedulePanel step={sched} />
        </At>
        <At from={1} className="h-full min-h-0 overflow-hidden">
          <MilestonePanel step={mile} />
        </At>
        <At from={2} className="h-full min-h-0 overflow-hidden">
          <CounterPanel step={count} />
        </At>
        <At from={3} className="h-full min-h-0 overflow-hidden">
          <PdfPanel step={pdf} />
        </At>
      </AtStack>
    </Figure>
  );
}

function MoneyScene() {
  const tx = useTx();
  return (
    <Scene id="immo-money" beats={4} length={70} label={tx({ en: "Contracts and documents", fr: "Contrats et documents", ar: "العقود والوثائق" })}>
      <SceneLayout wide copy={<SceneCopy beats={COPY.money} />} figure={<MoneyFigure />} />
      <LightUp nodes={["contracts"]} at={0.42} />
      <LightUp nodes={["documents"]} at={0.62} />
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 1.5 — Handover, residence, jobs                               */
/* ------------------------------------------------------------------ */

const RESERVES: { trade: L; where: string }[] = [
  { trade: { en: "plumbing", fr: "plomberie", ar: "سباكة" }, where: "Salle de bain — fuite sous l'évier" },
  { trade: { en: "joinery", fr: "menuiserie", ar: "نجارة" }, where: "Chambre 2 — porte qui frotte" },
  { trade: { en: "painting", fr: "peinture", ar: "طلاء" }, where: "Séjour — reprise d'enduit" },
];

const WARRANTIES: { y: number; label: L }[] = [
  { y: 1, label: { en: "perfect completion", fr: "parfait achèvement", ar: "حسن الإنجاز" } },
  { y: 2, label: { en: "proper functioning", fr: "bon fonctionnement", ar: "حسن السير" } },
  { y: 10, label: { en: "ten-year liability", fr: "décennale", ar: "الضمان العشري" } },
];

function HandoverPanel({ step }: { step: number }) {
  const tx = useTx();
  const signed = step >= 2;
  return (
    <div className="flex h-full flex-col px-3.5 py-3 md:px-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <Label>PV de remise des clés</Label>
          <p className="erp-mono mt-1 text-[0.82rem] text-ink">PVL-2026-000009</p>
        </div>
        <span className="erp-mono text-[0.7rem]">
          <span className={signed ? "text-faint line-through" : "text-signal-deep"}>scheduled</span>
          <span className="text-faint"> → </span>
          <span className={signed ? "text-signal-deep" : "text-faint"}>signed</span>
        </span>
      </div>
      <div className="mt-3 border-t border-[var(--erp-hair)]">
        {RESERVES.map((r, i) => {
          const lifted = step >= 3 && i < 2;
          return (
            <div
              key={r.trade.en}
              className={`grid grid-cols-[5.4rem_1fr_auto] items-baseline gap-2 border-b border-[var(--erp-hair)] py-1.5 text-[0.72rem] transition-opacity duration-300 md:py-2 ${
                step >= 1 ? "opacity-100" : "opacity-20"
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <span className="erp-mono text-[0.64rem] text-mute">{tx(r.trade)}</span>
              <span className={`min-w-0 truncate ${lifted ? "text-faint line-through" : "text-graphite"}`}>{r.where}</span>
              <span className={`erp-mono text-[0.64rem] ${lifted ? "text-ink" : "text-signal-deep"}`}>{lifted ? tx({ en: "lifted", fr: "levée", ar: "مرفوع" }) : tx({ en: "open", fr: "ouverte", ar: "مفتوح" })}</span>
            </div>
          );
        })}
      </div>
      <p className="erp-mono mt-2 text-[0.64rem] text-mute">
        punch_item · {step >= 3 ? 2 : 0} / 3 {tx({ en: "lifted", fr: "levées", ar: "مرفوعة" })}
        <span className="text-faint"> · {tx({ en: "PV de levée once the last one is", fr: "PV de levée quand le dernier l'est", ar: "محضر رفع التحفّظات عند رفع آخرها" })}</span>
      </p>
      <div className="mt-5 hidden sm:block">
        <div className="flex items-baseline justify-between gap-2">
          <Label>warrantyEnds · {tx({ en: "counted from the PV", fr: "comptées depuis le PV", ar: "تُحسب من المحضر" })}</Label>
          <span className="erp-mono text-[0.62rem] text-faint">0 → 10 {tx({ en: "y", fr: "ans", ar: "سنوات" })}</span>
        </div>
        <div className="mt-2 space-y-2">
          {WARRANTIES.map((w, i) => (
            <div key={w.y} className="grid grid-cols-[9.5rem_1fr_3.6rem] items-center gap-3">
              <span className="text-[0.7rem] text-graphite">{tx(w.label)}</span>
              <span className="relative h-2 bg-shell">
                <span
                  className="absolute inset-y-0 start-0 bg-ink transition-transform duration-700"
                  style={{ width: `${w.y * 10}%`, transform: `scaleX(${signed ? 1 : 0})`, transformOrigin: "left", transitionDelay: `${i * 120}ms` }}
                />
              </span>
              <span className={`erp-mono text-end text-[0.64rem] ${signed ? "text-ink" : "text-faint"}`}>+{w.y} {w.y === 1 ? tx({ en: "y", fr: "an", ar: "سنة" }) : tx({ en: "y", fr: "ans", ar: "سنوات" })}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="immo-tall-only mt-5">
        <Label>{tx({ en: "same transaction as the signature", fr: "même transaction que la signature", ar: "في معاملة التوقيع نفسها" })}</Label>
        <div className="erp-mono mt-1.5 space-y-0.5 text-[0.66rem]">
          <p className={signed ? "bg-[var(--erp-signal-soft)] text-signal-deep" : "text-faint"}>enqueueInTx(tx, &quot;pdf.document&quot;, {"{"} kind: &quot;handover_pv&quot; {"}"})</p>
          <p className={signed ? "text-graphite" : "text-faint"}>
            reservation_annex · {tx({ en: "annex units delivered with the main unit", fr: "lots annexes livrés avec le lot principal", ar: "الوحدات الملحقة تُسلَّم مع الوحدة الرئيسية" })}
          </p>
        </div>
      </div>
      <div className="mt-auto flex items-center gap-3 pt-3">
        <Label className="!mb-0">{tx({ en: "unit", fr: "lot", ar: "الوحدة" })} B-02-02</Label>
        <span className={`erp-mono text-[0.78rem] ${signed ? "text-faint line-through" : "text-ink"}`}>sold</span>
        <span className="text-faint">→</span>
        <span className={`erp-mono border px-1.5 py-0.5 text-[0.78rem] transition-colors duration-300 ${signed ? "border-signal bg-signal text-white" : "border-[var(--erp-hair-2)] text-faint"}`}>
          delivered
        </span>
        <span className="hidden text-[0.68rem] text-mute sm:inline">
          {tx({ en: "terminal — no transition out", fr: "terminal — aucune sortie", ar: "نهائية — لا انتقال بعدها" })}
        </span>
      </div>
    </div>
  );
}

const SHARES = [
  { unit: "Y-01-01", w: 0.9 },
  { unit: "Y-01-02", w: 1.15 },
  { unit: "Y-02-01", w: 0.9 },
  { unit: "Y-02-02", w: 1.05 },
];
const TICKET = ["open", "in_progress", "resolved", "closed"];

function ResidencePanel({ step }: { step: number }) {
  const tx = useTx();
  const num = useNumber();
  const total = SHARES.reduce((s, x) => s + x.w, 0);
  return (
    <div className="flex h-full flex-col px-3.5 py-3 md:px-5">
      <Label>Résidence El Yasmine · {tx({ en: "charge call", fr: "appel de charges", ar: "طلب الأعباء" })}</Label>
      <div className="mt-2 grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 text-[0.7rem] md:gap-y-3">
        <span className="erp-mono text-[0.62rem] text-faint">{tx({ en: "budget", fr: "budget", ar: "الميزانية" })}</span>
        <span className="flex items-center gap-2">
          <span className="text-graphite">Ascenseur</span>
          <span className="erp-mono text-[0.62rem] text-mute">{tx({ en: "annual · called quarterly", fr: "annuel · appelé par trimestre", ar: "سنوية · تُطلب فصليًا" })}</span>
        </span>
        <span className="erp-mono text-[0.62rem] text-faint">{tx({ en: "period", fr: "période", ar: "الفترة" })}</span>
        <span className="grid grid-cols-4 gap-px bg-[var(--erp-hair)]">
          {["Q1", "Q2", "Q3", "Q4"].map((q, i) => (
            <span key={q} className={`erp-mono px-1.5 py-0.5 text-center text-[0.62rem] transition-colors ${i === 0 && step >= 0 ? "bg-ink text-paper" : "bg-paper text-faint"}`}>
              {q}
            </span>
          ))}
        </span>
        <span className="erp-mono self-start pt-1 text-[0.62rem] text-faint">{tx({ en: "lots", fr: "lots", ar: "الوحدات" })}</span>
        <span className="block space-y-1 md:space-y-2.5">
          {SHARES.map((s, i) => (
            <span key={s.unit} className="grid grid-cols-[4rem_1fr_3.6rem] items-center gap-2">
              <span className="erp-mono text-[0.62rem] text-graphite">{s.unit}</span>
              <span className="relative h-1.5 bg-shell md:h-2.5">
                <span
                  className="absolute inset-y-0 start-0 bg-ink transition-transform duration-500"
                  style={{ width: `${(s.w / total) * 100 * 2.2}%`, transform: `scaleX(${step >= 1 ? 1 : 0})`, transformOrigin: "left", transitionDelay: `${i * 70}ms` }}
                />
              </span>
              <span className={`erp-mono text-end text-[0.62rem] transition-opacity duration-300 ${step >= 1 ? "text-ink opacity-100" : "opacity-0"}`}>
                {num((s.w / total) * 100, 2)} %
              </span>
            </span>
          ))}
          <span className={`grid grid-cols-[4rem_1fr_3.6rem] items-center gap-2 border-t border-[var(--erp-hair)] pt-1 transition-opacity duration-300 ${step >= 1 ? "opacity-100" : "opacity-0"}`}>
            <span className="erp-mono text-[0.62rem] text-faint">Σ</span>
            <span className="erp-mono text-[0.62rem] text-mute">{tx({ en: "allocate(part, keys) → Σ lines = part", fr: "allocate(part, clés) → Σ lignes = part", ar: "allocate(part, keys) → Σ الأسطر = part" })}</span>
            <span className="erp-mono text-end text-[0.62rem] text-signal-deep">{num(100, 2)} %</span>
          </span>
        </span>
      </div>
      <div className={`immo-tall-only mt-4 transition-opacity duration-300 ${step >= 1 ? "opacity-100" : "opacity-30"}`}>
        <p className="erp-mono text-[0.64rem]">
          <span className="text-graphite">pdf.document · charge_call</span>
          <span className="text-faint"> → {tx({ en: "one numbered ADC per lot, addressed to its main co-owner", fr: "un ADC numéroté par lot, adressé à son copropriétaire principal", ar: "طلب ADC مرقّم لكلّ وحدة، موجّه إلى مالكها الرئيسي" })}</span>
        </p>
      </div>
      <div className="mt-auto border-t border-[var(--erp-hair)] pt-2.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[0.74rem] text-ink">{tx({ en: "Lift stuck on the 3rd floor", fr: "Ascenseur bloqué au 3e étage", ar: "المصعد عالق في الطابق الثالث" })}</p>
          <span className="erp-mono text-[0.62rem] text-faint">{tx({ en: "elevator · urgent", fr: "ascenseur · urgent", ar: "مصعد · عاجل" })}</span>
        </div>
        <div className="mt-3">
          <StateTrack states={TICKET} active={Math.max(0, Math.min(3, step - 1))} branches={["cancelled"]} />
        </div>
        <p className={`erp-mono mt-2 hidden text-[0.62rem] transition-opacity duration-300 sm:block ${step >= 2 ? "opacity-100" : "opacity-0"}`}>
          <span className="text-graphite">queuePush → push.send</span>
          <span className="text-faint"> · {tx({ en: "the resident's devices", fr: "les appareils du résident", ar: "أجهزة الساكن" })} · </span>
          <span className="text-signal-deep">{TICKET[Math.max(0, Math.min(3, step - 1))]}</span>
        </p>
      </div>
    </div>
  );
}

const retry = (n: number, rest: string): L => ({
  en: `retry ${n} · ${rest}`,
  fr: `${n} ${n > 1 ? "reprises" : "reprise"} · ${rest}`,
  ar: `${n} محاولات · ${rest}`,
});
const QUEUES: { q: string; cfg: L; tall?: boolean }[] = [
  { q: "email.send", cfg: retry(5, "30 s · backoff") },
  { q: "pdf.document", cfg: retry(3, "15 s · backoff") },
  { q: "payment_call.issue", cfg: retry(5, "30 s · backoff") },
  { q: "option.expire", cfg: retry(5, "60 s · backoff") },
  { q: "online_payment.check", cfg: { en: "every 600 s · up to 6", fr: "toutes les 600 s · 6 fois max", ar: "كلّ 600 ث · حتى 6 مرّات" } },
  { q: "push.send", cfg: retry(3, "60 s · backoff"), tall: true },
  { q: "reminders.digest", cfg: retry(3, "60 s · backoff"), tall: true },
  { q: "export.bundle", cfg: retry(1, "60 s"), tall: true },
];
const CRONS = [
  { q: "reminders.daily", at: "0 8 * * *" },
  { q: "privacy.daily", at: "0 3 * * *" },
];

function JobsPanel({ step }: { step: number }) {
  const tx = useTx();
  const attempts = [
    { label: tx({ en: "attempt 1", fr: "tentative 1", ar: "المحاولة 1" }), state: "failed" },
    { label: tx({ en: "retry · 30 s", fr: "reprise · 30 s", ar: "إعادة · 30 ث" }), state: "failed" },
    { label: tx({ en: "retry · backoff", fr: "reprise · backoff", ar: "إعادة · تباعد" }), state: "completed" },
  ];
  return (
    <div className="flex h-full flex-col px-3.5 py-3 md:px-5">
      <Label>enqueueInTx · {tx({ en: "the job commits with the write", fr: "la tâche est validée avec l'écriture", ar: "المهمّة تُلتزم مع الكتابة" })}</Label>
      <div className="erp-mono mt-1.5 hidden whitespace-pre border-s-2 border-ink ps-2.5 text-[0.66rem] leading-[1.65] md:block">
        <p className="text-graphite">
          <span className="text-faint">BEGIN </span> INSERT payment · REC-2026-000143
        </p>
        <p className={step === 0 ? "bg-[var(--erp-signal-soft)] text-signal-deep" : "text-graphite"}>
          <span className="text-faint">{"       "}</span> enqueueInTx(tx, &quot;pdf.document&quot;, {"{"} kind: &quot;receipt&quot; {"}"})
        </p>
        <p className="text-graphite">
          <span className="text-faint">COMMIT</span> {tx({ en: "→ no payment, no job", fr: "→ pas de paiement, pas de tâche", ar: "→ لا دفعة، لا مهمّة" })}
        </p>
        <p className="text-faint">pdf.document → {tx({ en: "links the PDF, queues", fr: "lie le PDF, met en file", ar: "يربط PDF ويضع في الطابور" })} email.send</p>
      </div>
      <Label className="mt-3">pg-boss · PostgreSQL</Label>
      <div className="mt-2 space-y-1">
        {QUEUES.map((q, i) => (
          <div
            key={q.q}
            className={`grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[var(--erp-hair)] pb-1 sm:grid-cols-[10.5rem_1fr_9.5rem] ${q.tall ? "immo-tall-only" : ""}`}
          >
            <span className={`erp-mono text-[0.68rem] ${i === 0 ? "text-ink" : "text-graphite"}`}>{q.q}</span>
            <span className="relative hidden h-1 overflow-hidden bg-shell sm:block">
              {i !== 0 && <span className="immo-run absolute inset-y-0 w-1/5 bg-[var(--erp-hair-2)]" style={{ animationDelay: `${i * 0.37}s`, animationDuration: `${2 + i * 0.4}s` }} />}
              {i === 0 && step < 3 && <span className="immo-run absolute inset-y-0 w-1/5 bg-signal" />}
              {i === 0 && step >= 3 && <span className="absolute inset-0 bg-ink" />}
            </span>
            <span className="erp-mono text-end text-[0.6rem] text-faint">{tx(q.cfg)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 border border-[var(--erp-hair)] px-2.5 py-2">
        <p className="erp-mono text-[0.62rem] text-faint">email.send · {tx({ en: "job", fr: "tâche", ar: "مهمّة" })} 7c1f… · {"{"} receipt REC-2026-000143 {"}"}</p>
        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
          {attempts.map((a, i) => {
            const shown = i <= Math.min(step, 2);
            const cur = i === Math.min(step, 2);
            const state = i === step && step < 3 ? "running" : a.state;
            return (
              <span
                key={i}
                className={`flex flex-col border px-2 py-1.5 transition-all duration-300 ${shown ? "opacity-100" : "opacity-0"} ${
                  cur ? "border-signal" : "border-[var(--erp-hair)]"
                }`}
              >
                <span className="erp-mono text-[0.6rem] text-mute">{a.label}</span>
                <span className={`erp-mono text-[0.66rem] ${state === "running" ? "text-signal" : state === "failed" ? "text-signal-deep" : "text-ink"}`}>{state}</span>
              </span>
            );
          })}
        </div>
      </div>
      <div className="mt-auto hidden pt-2 sm:block">
        <Label>cron · Africa/Algiers</Label>
        <div className="mt-1 flex flex-wrap gap-x-5 gap-y-0.5">
          {CRONS.map((c) => (
            <span key={c.q} className="erp-mono text-[0.64rem] text-graphite">
              {c.q} <span className="text-faint">{c.at}</span>
            </span>
          ))}
          <span className="erp-mono text-[0.64rem] text-faint">+ 2 · {tx({ en: "15 queues total", fr: "15 files au total", ar: "15 طابورًا إجمالًا" })}</span>
        </div>
      </div>
    </div>
  );
}

function AfterFigure() {
  const { beat } = useScene();
  const hand = useStep((p) => stepOf(p, 0, 3, 4, 0.04, 0.1));
  const res = useStep((p) => stepOf(p, 1, 3, 5, 0.04, 0.1));
  const jobs = useStep((p) => stepOf(p, 2, 3, 4, 0.04, 0.12));
  const titles: L[] = [
    { en: "handover · reserves by trade", fr: "livraison · réserves par corps d'état", ar: "التسليم · التحفّظات حسب الحرفة" },
    { en: "residence · charges and tickets", fr: "résidence · charges et réclamations", ar: "الإقامة · الأعباء والتذاكر" },
    { en: "queues · retries · cron", fr: "files · reprises · cron", ar: "طوابير · إعادة · جدولة" },
  ];
  return (
    <Figure fig="FIG. 1.5" title={titles[beat]} className="w-full [contain:inline-size]" bodyClassName={`${FIG_H} overflow-hidden`}>
      <AtStack className="h-full grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)]">
        <At from={0} className="h-full min-h-0 overflow-hidden">
          <HandoverPanel step={hand} />
        </At>
        <At from={1} className="h-full min-h-0 overflow-hidden">
          <ResidencePanel step={res} />
        </At>
        <At from={2} className="h-full min-h-0 overflow-hidden">
          <JobsPanel step={jobs} />
        </At>
      </AtStack>
    </Figure>
  );
}

function AfterScene() {
  const tx = useTx();
  return (
    <Scene id="immo-after" beats={3} length={70} label={tx({ en: "After handover", fr: "Après la livraison", ar: "بعد التسليم" })}>
      <SceneLayout wide copy={<SceneCopy beats={COPY.after} />} figure={<AfterFigure />} />
      <LightUp nodes={["maintenance"]} at={0.5} />
      <LightUp nodes={["jobs"]} at={0.8} />
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 1.6 — Real screens with pins                                  */
/* ------------------------------------------------------------------ */

type Shot = { src: string; w: number; h: number; alt: L; pins: { x: number; y: number; label: L }[]; tall?: boolean };

const SHOTS: Shot[] = [
  {
    src: "/projects/sayroura/dashboard.webp",
    w: 1800,
    h: 1125,
    alt: { en: "Sayroura Immo — back-office dashboard (demo data)", fr: "Sayroura Immo — tableau de bord du back-office (données de démo)", ar: "Sayroura Immo — لوحة قيادة المكتب الخلفي (بيانات تجريبية)" },
    pins: [
      { x: 8.5, y: 4.4, label: { en: "Organization switcher — one account, several companies, each sealed by RLS", fr: "Sélecteur d'organisation — un compte, plusieurs sociétés, chacune isolée par RLS", ar: "مُبدّل المؤسسات — حساب واحد وعدّة شركات، كلّ منها معزولة بـ RLS" } },
      { x: 23.5, y: 69, label: { en: "Two-factor prompt for accounts that touch payments", fr: "Invitation à la double authentification pour les comptes qui encaissent", ar: "دعوة للمصادقة الثنائية للحسابات التي تصل إلى الدفعات" } },
      { x: 21.5, y: 83, label: { en: "Withdrawal RES-2026-000004 waiting for the owner's approval", fr: "Désistement RES-2026-000004 en attente de l'approbation du gérant", ar: "تنازل RES-2026-000004 ينتظر موافقة المسيّر" } },
    ],
  },
  {
    src: "/projects/sayroura/pipeline.webp",
    w: 1800,
    h: 1125,
    alt: { en: "Sayroura Immo — CRM pipeline (demo data)", fr: "Sayroura Immo — pipeline CRM (données de démo)", ar: "Sayroura Immo — مسار إدارة العلاقات (بيانات تجريبية)" },
    pins: [
      { x: 21.5, y: 30, label: { en: "One column per stage, from new to won", fr: "Une colonne par étape, de new à won", ar: "عمود لكلّ مرحلة، من new إلى won" } },
      { x: 63, y: 30, label: { en: "visit_scheduled — reached automatically when a visit is planned", fr: "visit_scheduled — atteint automatiquement quand une visite est planifiée", ar: "visit_scheduled — تُبلغ تلقائيًا عند برمجة زيارة" } },
      { x: 86, y: 14.4, label: { en: "Filter by agent: read vs read_all decides who can use it", fr: "Filtre par commercial : read ou read_all décide qui peut l'utiliser", ar: "التصفية حسب المندوب: read أو read_all تحدّد من يستعملها" } },
    ],
  },
  {
    src: "/projects/sayroura/portal.webp",
    w: 1170,
    h: 2532,
    tall: true,
    alt: { en: "Sayroura Immo — buyer portal on a phone (demo data)", fr: "Sayroura Immo — portail acquéreur sur téléphone (données de démo)", ar: "Sayroura Immo — بوابة المشتري على الهاتف (بيانات تجريبية)" },
    pins: [
      { x: 9, y: 30.4, label: { en: "Reservation RES-2026-000005, unit state reserved", fr: "Réservation RES-2026-000005, lot à l'état reserved", ar: "الحجز RES-2026-000005، الوحدة في حالة reserved" } },
      { x: 9, y: 40.8, label: { en: "Paid and remaining — computed from the schedule lines", fr: "Payé et reste à payer — calculés depuis l'échéancier", ar: "المدفوع والمتبقّي — محسوبان من أسطر الجدول" } },
      { x: 12, y: 48.4, label: { en: "Next due date — the payment call of the structural work", fr: "Prochaine échéance — l'appel de fonds du gros œuvre", ar: "الاستحقاق القادم — طلب دفع مرحلة الهيكل" } },
      { x: 9, y: 67.5, label: { en: "Residence announcement — the general assembly", fr: "Annonce de la résidence — l'assemblée générale", ar: "إعلان الإقامة — الجمعية العامة" } },
    ],
  },
];

/** Phone: the screenshot magnified around the active pin, so the UI stays readable at 390 px. */
function ZoomShot({ shot, active, k, className = "" }: { shot: Shot; active: number; k: number; className?: string }) {
  const tx = useTx();
  const f = shot.pins[Math.max(0, active)] ?? shot.pins[0];
  return (
    <div className={`relative overflow-hidden border border-[var(--erp-hair)] ${className}`}>
      <Image
        src={shot.src}
        alt={tx(shot.alt)}
        width={shot.w}
        height={shot.h}
        className={shot.tall ? "block h-full w-auto max-w-none" : "block h-auto w-full"}
        style={{ transform: `scale(${k})`, transformOrigin: `${f.x}% ${f.y}%`, transition: "transform-origin .7s var(--erp-ease)" }}
      />
      {shot.pins.map((p, i) => {
        const x = f.x + k * (p.x - f.x);
        const y = f.y + k * (p.y - f.y);
        const inside = x > 2 && x < 98 && y > 2 && y < 98;
        return (
          <span
            key={i}
            className="absolute flex h-6 w-6 items-center justify-center bg-signal text-[0.68rem] font-semibold text-white transition-all duration-700"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              opacity: i <= active && inside ? 1 : 0,
              transform: "translate(-50%,-50%)",
              boxShadow: i === active ? "0 0 0 5px var(--erp-signal-soft)" : "none",
            }}
          >
            <span className="erp-mono">{i + 1}</span>
          </span>
        );
      })}
    </div>
  );
}

function PinnedShot({ shot, active }: { shot: Shot; active: number }) {
  const tx = useTx();
  const pins = shot.pins.map((p, i) => (
        <span
          key={i}
          className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-signal text-[0.68rem] font-semibold text-white transition-all duration-500"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: i <= active ? 1 : 0,
            transform: `translate(-50%,-50%) scale(${i <= active ? 1 : 0.6})`,
            boxShadow: i === active ? "0 0 0 5px var(--erp-signal-soft)" : "none",
          }}
        >
          <span className="erp-mono">{i + 1}</span>
        </span>
      ));
  const img = (
    <div className="relative">
      <Image src={shot.src} alt={tx(shot.alt)} width={shot.w} height={shot.h} className="block h-auto w-full" />
      {pins}
    </div>
  );
  const legend = (
    <ol className="space-y-2">
      {shot.pins.map((p, i) => (
        <li
          key={i}
          className={`flex gap-2.5 text-[0.8rem] leading-snug transition-opacity duration-300 ${i <= active ? "opacity-100" : "opacity-25"} ${
            i === active ? "text-ink" : "text-graphite"
          }`}
        >
          <span className={`erp-mono mt-[0.1rem] flex h-5 w-5 shrink-0 items-center justify-center text-[0.62rem] ${i === active ? "bg-signal text-white" : "border border-[var(--erp-hair-2)] text-faint"}`}>
            {i + 1}
          </span>
          <span>{tx(p.label)}</span>
        </li>
      ))}
    </ol>
  );
  if (shot.tall) {
    return (
      <div className="grid h-full grid-cols-[auto_minmax(0,1fr)] gap-4 p-3 md:gap-6 md:p-4">
        <ZoomShot shot={shot} active={active} k={1.7} className="h-[calc(42svh-1.5rem)] w-fit md:hidden" />
        <div className="relative hidden h-[calc(min(66svh,600px)-2rem)] w-fit md:block">
          <Image src={shot.src} alt={tx(shot.alt)} width={shot.w} height={shot.h} className="block h-full w-auto max-w-none border border-[var(--erp-hair)]" />
          {pins}
        </div>
        <div className="hidden min-w-0 items-center md:flex">{legend}</div>
        {active >= 0 && <p className="self-center text-[0.8rem] leading-snug text-ink md:hidden">{active + 1} — {tx(shot.pins[active]?.label)}</p>}
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col gap-3 p-3 md:p-4">
      <ZoomShot shot={shot} active={active} k={2.2} className="shrink-0 md:hidden" />
      <div className="hidden min-h-0 overflow-hidden md:block">{img}</div>
      <div className="hidden md:block">{legend}</div>
      {active >= 0 && <p className="text-[0.78rem] leading-snug text-ink md:hidden">{active + 1} — {tx(shot.pins[active]?.label)}</p>}
    </div>
  );
}

function ScreensFigure() {
  const { beat } = useScene();
  const pin = useStep((p) => {
    const b = Math.min(2, Math.floor(p * 3));
    return stepOf(p, b, 3, SHOTS[b].pins.length, 0.05, 0.15);
  });
  const titles: L[] = [
    { en: "back office · dashboard", fr: "back-office · tableau de bord", ar: "المكتب الخلفي · لوحة القيادة" },
    { en: "back office · pipeline", fr: "back-office · pipeline", ar: "المكتب الخلفي · المسار" },
    { en: "portal · buyer's phone", fr: "portail · téléphone de l'acquéreur", ar: "البوابة · هاتف المشتري" },
  ];
  return (
    <Figure fig="FIG. 1.6" title={titles[beat]} className="w-full [contain:inline-size]" bodyClassName="h-[42svh] md:h-[min(66svh,600px)] overflow-hidden">
      <AtStack className="h-full grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)]">
        {SHOTS.map((s, i) => (
          <At key={s.src} from={i} className="h-full min-h-0 overflow-hidden">
            <PinnedShot shot={s} active={beat === i ? pin : -1} />
          </At>
        ))}
      </AtStack>
    </Figure>
  );
}

function ScreensScene() {
  const tx = useTx();
  return (
    <Scene id="immo-screens" beats={3} length={60} label={tx({ en: "Screens", fr: "Écrans", ar: "الشاشات" })}>
      <SceneLayout wide copy={<SceneCopy beats={COPY.screens} />} figure={<ScreensFigure />} />
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* Flow sections                                                       */
/* ------------------------------------------------------------------ */

const JOURNEY: { actor: L; action: L; effect: L; token?: string }[] = [
  {
    actor: { en: "Sales agent", fr: "Commercial", ar: "المندوب" },
    action: { en: "Plans a visit for Mohamed Cherif.", fr: "Planifie une visite pour Mohamed Cherif.", ar: "يبرمج زيارة لمحمد شريف." },
    effect: { en: "The lead advances to visit_scheduled by itself; when the visit is marked done, to visited.", fr: "Le prospect passe seul en visit_scheduled ; une fois la visite faite, en visited.", ar: "يتقدّم العميل وحده إلى visit_scheduled، ثمّ إلى visited عند إنجاز الزيارة." },
    token: "visit_scheduled → visited",
  },
  {
    actor: { en: "Sales agent", fr: "Commercial", ar: "المندوب" },
    action: { en: "Issues a quotation on B-02-02 and puts an option on the unit.", fr: "Émet un devis sur B-02-02 et pose une option sur le lot.", ar: "يُصدر عرض سعر على B-02-02 ويضع خيارًا على الوحدة." },
    effect: { en: "Quotation numbered, lead in negotiation, unit available → optioned. An option.expire job is queued to release it if nothing follows.", fr: "Devis numéroté, prospect en negotiation, lot available → optioned. Une tâche option.expire est programmée pour le libérer si rien ne suit.", ar: "عرض سعر مرقّم، العميل في negotiation، الوحدة available → optioned. وتُبرمج مهمّة option.expire لتحريرها إن لم يتبع شيء." },
    token: "DEV-2026-000012",
  },
  {
    actor: { en: "Cashier", fr: "Caissier", ar: "أمين الصندوق" },
    action: { en: "Records the first installment at the counter.", fr: "Encaisse la première tranche au guichet.", ar: "يسجّل القسط الأول في الشبّاك." },
    effect: { en: "Reservation and receipt get their numbers from locked counters in one transaction; unit optioned → reserved; the lead becomes won.", fr: "Réservation et reçu prennent leurs numéros sur des compteurs verrouillés, dans une seule transaction ; lot optioned → reserved ; le prospect devient won.", ar: "يأخذ الحجز والوصل رقميهما من عدّادات مقفلة في معاملة واحدة؛ الوحدة optioned → reserved؛ ويصبح العميل won." },
    token: "RES-2026-000005 · REC-2026-000143",
  },
  {
    actor: { en: "Sales manager", fr: "Directeur commercial", ar: "مدير المبيعات" },
    action: { en: "Signs the off-plan contract.", fr: "Signe le contrat de vente sur plan.", ar: "يوقّع عقد البيع على التصاميم." },
    effect: { en: "Unit reserved → sold. The schedule is built from the plan — 35 / 35 / 25 / 5 % — and checked against the company's VSP limits.", fr: "Lot reserved → sold. L'échéancier est construit depuis le plan — 35 / 35 / 25 / 5 % — et contrôlé par rapport aux plafonds VSP de la société.", ar: "الوحدة reserved → sold. يُبنى الجدول من الخطة — 35 / 35 / 25 / 5 % — ويُقارن بحدود VSP للشركة." },
    token: "VSP",
  },
  {
    actor: { en: "Technical manager · sales manager", fr: "Responsable technique · direction commerciale", ar: "المسؤول التقني · الإدارة التجارية" },
    action: { en: "The structural work is reported reached, then validated.", fr: "Le gros œuvre est signalé atteint, puis validé.", ar: "يُبلَّغ عن إنجاز الهيكل ثمّ يُعتمد." },
    effect: { en: "payment_call.issue sends a numbered payment call to every buyer with a step on that milestone, due after the company's delay.", fr: "payment_call.issue envoie un appel de fonds numéroté à chaque acquéreur ayant une tranche sur ce jalon, dû après le délai de la société.", ar: "تُرسل payment_call.issue طلب دفع مرقّمًا لكلّ مشترٍ له قسط على هذه المرحلة، مستحقًّا بعد مهلة الشركة." },
    token: "ADF-2026-000031",
  },
  {
    actor: { en: "Buyer", fr: "Acquéreur", ar: "المشتري" },
    action: { en: "Pays the call online by card from the portal.", fr: "Règle l'appel en ligne par carte depuis le portail.", ar: "يدفع الطلب عبر الإنترنت بالبطاقة من البوابة." },
    effect: { en: "SATIM settles the payment; if the buyer leaves the gateway page, online_payment.check re-checks every 10 minutes. The receipt PDF is rendered by a job and appears in the portal.", fr: "SATIM règle le paiement ; si l'acquéreur quitte la page de la passerelle, online_payment.check revérifie toutes les 10 minutes. Le PDF du reçu est rendu par une tâche et apparaît dans le portail.", ar: "تُسوّي SATIM الدفع؛ وإن غادر المشتري صفحة البوابة تُعيد online_payment.check الفحص كلّ 10 دقائق. يُخرج ملفّ الوصل بمهمّة ويظهر في البوابة." },
  },
  {
    actor: { en: "Buyer", fr: "Acquéreur", ar: "المشتري" },
    action: { en: "Signs a schedule amendment in the portal.", fr: "Signe un avenant d'échéancier dans le portail.", ar: "يوقّع ملحق جدول الدفع في البوابة." },
    effect: { en: "A six-digit code is emailed, valid 10 minutes, 5 tries; only its keyed hash is stored, tied to the account and the document.", fr: "Un code à six chiffres est envoyé par e-mail, valable 10 minutes, 5 essais ; seule son empreinte (HMAC) est stockée, liée au compte et au document.", ar: "يُرسل رمز من ستة أرقام بالبريد، صالح 10 دقائق، 5 محاولات؛ ولا تُخزَّن إلّا بصمته (HMAC) مرتبطةً بالحساب والوثيقة." },
  },
  {
    actor: { en: "Technical manager", fr: "Responsable technique", ar: "المسؤول التقني" },
    action: { en: "Hands over the keys with three reserves.", fr: "Remet les clés avec trois réserves.", ar: "يسلّم المفاتيح مع ثلاثة تحفّظات." },
    effect: { en: "The PV is signed and numbered; unit sold → delivered, terminal. The reserves stay open until lifted.", fr: "Le PV est signé et numéroté ; lot sold → delivered, terminal. Les réserves restent ouvertes jusqu'à leur levée.", ar: "يُوقَّع المحضر ويُرقَّم؛ الوحدة sold → delivered، نهائية. وتبقى التحفّظات مفتوحة حتى رفعها." },
    token: "PVL-2026-000009",
  },
  {
    actor: { en: "Resident · property manager", fr: "Résident · gestionnaire", ar: "الساكن · مسيّر الإقامة" },
    action: { en: "Years later: a charge call, then a ticket for the lift.", fr: "Des années plus tard : un appel de charges, puis une réclamation pour l'ascenseur.", ar: "بعد سنوات: طلب أعباء، ثمّ تذكرة للمصعد." },
    effect: { en: "Charges split by distribution key, to the centime. The ticket moves open → in_progress → resolved → closed, and the resident is notified at each step.", fr: "Charges réparties par clé, au centime près. La réclamation passe open → in_progress → resolved → closed, et le résident est notifié à chaque étape.", ar: "أعباء موزّعة حسب المفتاح بدقّة السنتيم. تنتقل التذكرة open → in_progress → resolved → closed ويُشعَر الساكن عند كلّ خطوة." },
  },
];

const DECISIONS: { decision: L; alternative: L; reason: L }[] = [
  {
    decision: { en: "Row-level security in PostgreSQL, set per transaction by withTenant()", fr: "Sécurité au niveau des lignes dans PostgreSQL, fixée par transaction via withTenant()", ar: "أمان مستوى الأسطر في PostgreSQL، يُضبط لكلّ معاملة عبر withTenant()" },
    alternative: { en: "A WHERE organization_id = … written in every query", fr: "Un WHERE organization_id = … écrit dans chaque requête", ar: "شرط WHERE organization_id = … يُكتب في كلّ استعلام" },
    reason: { en: "One forgotten filter leaks a client's data to a competitor. With RLS forced and a role that cannot bypass it, the forgotten case returns zero rows — a bug you notice, not a breach you discover later.", fr: "Un seul filtre oublié livre les données d'un client à un concurrent. Avec RLS forcé et un rôle incapable de le contourner, l'oubli renvoie zéro ligne — un bug qu'on remarque, pas une fuite qu'on découvre trop tard.", ar: "شرط واحد منسيّ يسرّب بيانات عميل إلى منافس. مع RLS مفروض ودور لا يستطيع تجاوزه، يُرجع النسيان صفر أسطر — خلل يُلاحَظ، لا اختراق يُكتشف متأخّرًا." },
  },
  {
    decision: { en: "A counter row per organization, type and year, locked inside the inserting transaction", fr: "Une ligne compteur par organisation, type et année, verrouillée dans la transaction d'insertion", ar: "سطر عدّاد لكلّ مؤسسة ونوع وسنة، يُقفل داخل معاملة الإدراج" },
    alternative: { en: "A PostgreSQL sequence", fr: "Une séquence PostgreSQL", ar: "متتالية PostgreSQL" },
    reason: { en: "Sequences are not transactional: a rolled-back insert burns its number. A receipt series with a hole looks like a deleted receipt to an auditor. The lock costs a short wait; the series stays continuous.", fr: "Les séquences ne sont pas transactionnelles : une insertion annulée brûle son numéro. Une série de reçus trouée ressemble à un reçu supprimé pour un auditeur. Le verrou coûte une courte attente ; la série reste continue.", ar: "المتتاليات ليست معاملاتية: الإدراج المُتراجَع عنه يحرق رقمه. وسلسلة وصولات فيها ثغرة تبدو للمدقّق وصلًا محذوفًا. القفل يكلّف انتظارًا قصيرًا، والسلسلة تبقى متّصلة." },
  },
  {
    decision: { en: "Money as integer centimes, shares in basis points, split by allocate()", fr: "L'argent en centimes entiers, les parts en points de base, réparties par allocate()", ar: "المال بالسنتيمات الصحيحة والحصص بنقاط الأساس، توزّعها allocate()" },
    alternative: { en: "Floating-point amounts and rounded percentages", fr: "Des montants flottants et des pourcentages arrondis", ar: "مبالغ عشرية عائمة ونسب مقرّبة" },
    reason: { en: "A schedule or a charge call must add up to the exact price. allocate() hands remainders to the largest fractions, so lines always sum to the total — the same function for plans, quotations and residence charges.", fr: "Un échéancier ou un appel de charges doit faire le prix exact. allocate() donne les restes aux plus grandes fractions : les lignes font toujours le total — la même fonction pour les plans, les devis et les charges.", ar: "يجب أن يساوي الجدول أو طلب الأعباء السعر بالضبط. تمنح allocate() البواقي لأكبر الكسور فيتطابق المجموع دائمًا — الدالّة نفسها للخطط وعروض الأسعار والأعباء." },
  },
  {
    decision: { en: "pg-boss queues inside the same PostgreSQL", fr: "Des files pg-boss dans le même PostgreSQL", ar: "طوابير pg-boss داخل PostgreSQL نفسها" },
    alternative: { en: "A separate message broker", fr: "Un courtier de messages séparé", ar: "وسيط رسائل منفصل" },
    reason: { en: "Jobs live in the database that is already backed up and monitored; retries, backoff and cron in Algiers time come with it. One less service to run for a client's IT team.", fr: "Les tâches vivent dans la base déjà sauvegardée et surveillée ; reprises, backoff et cron à l'heure d'Alger sont inclus. Un service de moins à exploiter pour l'équipe informatique du client.", ar: "تعيش المهامّ في القاعدة المحفوظة والمراقَبة أصلًا، مع إعادة المحاولة والتباعد والجدولة بتوقيت الجزائر. خدمة أقلّ يشغّلها فريق المعلوماتية لدى العميل." },
  },
  {
    decision: { en: "Permissions checked on the server with assertCan; the UI only hides", fr: "Permissions vérifiées au serveur par assertCan ; l'interface ne fait que masquer", ar: "التحقّق من الصلاحيات في الخادم عبر assertCan؛ والواجهة تُخفي فقط" },
    alternative: { en: "Trusting hidden buttons and client-side checks", fr: "Se fier aux boutons masqués et aux contrôles côté client", ar: "الاعتماد على الأزرار المخفيّة والتحقّق من جهة العميل" },
    reason: { en: "Anything the browser sends can be forged. The role matrix is one shared definition: the UI reads it to stay tidy, the server reads it to refuse.", fr: "Tout ce que le navigateur envoie peut être forgé. La matrice des rôles est une définition partagée : l'interface la lit pour rester claire, le serveur pour refuser.", ar: "كلّ ما يرسله المتصفّح قابل للتزوير. مصفوفة الأدوار تعريف واحد مشترك: تقرؤه الواجهة لتبقى مرتّبة، ويقرؤه الخادم ليرفض." },
  },
  {
    decision: { en: "PDF templates as React components, printed by headless Chromium", fr: "Des modèles PDF en composants React, imprimés par Chromium headless", ar: "قوالب PDF كمكوّنات React يطبعها Chromium دون واجهة" },
    alternative: { en: "Drawing documents with a PDF library", fr: "Dessiner les documents avec une bibliothèque PDF", ar: "رسم الوثائق بمكتبة PDF" },
    reason: { en: "Twenty-three documents in French and Arabic: the browser already shapes Arabic and lays out right-to-left correctly, and templates share the app's components and type.", fr: "Vingt-trois documents en français et en arabe : le navigateur sait déjà composer l'arabe et la mise en page de droite à gauche, et les modèles partagent les composants et la typographie de l'application.", ar: "ثلاث وعشرون وثيقة بالفرنسية والعربية: المتصفّح يُحسن تشكيل العربية والتخطيط من اليمين إلى اليسار، والقوالب تتقاسم مكوّنات التطبيق وخطوطه." },
  },
];

const PROOF: { value: number; prefix?: string; suffix?: string; label: L; note?: L }[] = [
  { value: 134, label: { en: "PostgreSQL tables", fr: "tables PostgreSQL", ar: "جدول PostgreSQL" }, note: { en: "95 enums · 135 migrations", fr: "95 enums · 135 migrations", ar: "95 تعدادًا · 135 ترحيلًا" } },
  { value: 344, label: { en: "server actions validated with zod", fr: "actions serveur validées par zod", ar: "إجراء خادم مُتحقَّق منه بـ zod" } },
  { value: 23, label: { en: "PDF templates, gap-free numbering", fr: "modèles PDF, numérotation sans trou", ar: "قالب PDF بترقيم بلا ثغرات" } },
  { value: 15, label: { en: "job queues", fr: "files de tâches", ar: "طابور مهامّ" }, note: { en: "+ 4 cron schedules", fr: "+ 4 tâches planifiées", ar: "+ 4 جداول زمنية" } },
  { value: 573, prefix: "~", label: { en: "Vitest cases in 175 files", fr: "cas Vitest dans 175 fichiers", ar: "حالة Vitest في 175 ملفًا" } },
  { value: 27, label: { en: "Playwright specs", fr: "scénarios Playwright", ar: "سيناريو Playwright" }, note: { en: "~93 end-to-end tests · CI", fr: "~93 tests de bout en bout · CI", ar: "~93 اختبارًا شاملًا · CI" } },
  { value: 9668, label: { en: "lines of copy, in French and again in Arabic", fr: "lignes de textes, en français et autant en arabe", ar: "سطرًا من النصوص بالفرنسية ومثلها بالعربية" } },
  { value: 19, label: { en: "portal pages for buyers and residents", fr: "pages de portail acquéreurs et résidents", ar: "صفحة بوابة للمشترين والسكّان" } },
];

/* ------------------------------------------------------------------ */
/* Chapter                                                             */
/* ------------------------------------------------------------------ */

export default function ImmoChapter() {
  const tx = useTx();
  return (
    <>
      <ChapterCover
        n={META.n}
        title={META.title}
        product={META.product}
        oneLiner={COPY.oneLiner}
        context={COPY.context}
        roles={COPY.roles}
        platforms={COPY.platforms}
        nodes={META.nodes}
        facts={COPY.facts}
        aside={
          <Reveal delay={0.1}>
            <p className="erp-kicker mb-3">{tx({ en: "Built with", fr: "Construit avec", ar: "مبني بـ" })}</p>
            <Spec
              rows={[
                { k: { en: "Application", fr: "Application", ar: "التطبيق" }, v: "Next.js · React · TypeScript" },
                { k: { en: "Data", fr: "Données", ar: "البيانات" }, v: "PostgreSQL · Drizzle ORM · RLS" },
                { k: { en: "Identity", fr: "Identités", ar: "الهوية" }, v: "Better Auth · organization · 2FA · admin" },
                { k: { en: "Jobs · documents", fr: "Tâches · documents", ar: "المهامّ · الوثائق" }, v: "pg-boss · Chromium PDF" },
              ]}
            />
          </Reveal>
        }
      />

      <IsolationScene />
      <RolesScene />
      <LifecycleScene />
      <MoneyScene />
      <AfterScene />

      <Section
        id="immo-journey"
        kicker={{ en: "1.7 — Walkthrough", fr: "1.7 — Parcours", ar: "1.7 — المسار الكامل" }}
        title={{ en: "One buyer, from first visit to a ticket years later.", fr: "Un acquéreur, de la première visite à une réclamation des années plus tard.", ar: "مشترٍ واحد، من الزيارة الأولى إلى تذكرة بعد سنوات." }}
        intro={{
          en: "Every step below crosses the modules above: a role allows it, a state machine accepts it, a counter numbers it, a job finishes it — all inside one organization's walls.",
          fr: "Chaque étape croise les modules ci-dessus : un rôle l'autorise, une machine à états l'accepte, un compteur la numérote, une tâche la termine — le tout entre les murs d'une seule organisation.",
          ar: "كلّ خطوة أدناه تعبر الوحدات السابقة: دورٌ يسمح بها، وآلة حالات تقبلها، وعدّاد يرقّمها، ومهمّة تُكملها — كلّ ذلك داخل جدران مؤسسة واحدة.",
        }}
      >
        <Walkthrough steps={JOURNEY} />
      </Section>

      <ScreensScene />

      <Section
        id="immo-decisions"
        dark
        kicker={{ en: "1.8 — Decisions", fr: "1.8 — Décisions", ar: "1.8 — القرارات" }}
        title={{ en: "Why it is built this way.", fr: "Pourquoi c'est construit ainsi.", ar: "لماذا بُني بهذه الطريقة." }}
      >
        <Decisions items={DECISIONS} />
      </Section>

      <Section
        id="immo-proof"
        kicker={{ en: "1.9 — Proof", fr: "1.9 — Preuves", ar: "1.9 — الإثبات" }}
        title={{ en: "Measured, not estimated.", fr: "Mesuré, pas estimé.", ar: "مقيس، لا مقدَّر." }}
      >
        <ProofStrip items={PROOF} />
        <Reveal delay={0.1}>
          <p className="erp-display mt-14 max-w-[46rem] text-[clamp(1.4rem,2.4vw,2rem)] text-ink">
            {tx({
              en: "The database decides who sees what. Contracts, money, documents and residences are built on that guarantee.",
              fr: "La base décide qui voit quoi. Contrats, argent, documents et résidences sont construits sur cette garantie.",
              ar: "قاعدة البيانات تقرّر من يرى ماذا. والعقود والمال والوثائق والإقامات مبنيّة على هذا الضمان.",
            })}
          </p>
        </Reveal>
      </Section>
      <Rule label={{ en: "End of chapter 01", fr: "Fin du chapitre 01", ar: "نهاية الفصل 01" }} className="pb-16" />
    </>
  );
}
