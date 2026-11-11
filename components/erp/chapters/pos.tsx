"use client";

/**
 * Chapter 2 — The ledger. SayrouraPOS: a desktop commercial-management and
 * accounting system for Algerian businesses. Documents carry their own SCF
 * journal lines, gap-free numbering, TVA and stamp duty, payroll, purchasing,
 * two-phase depot transfers, receivables aging and an offline-first sync.
 * All figures below are demo data computed with the product's own rules.
 */

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useTx, type L } from "@/lib/erp/i18n";
import { CHAPTERS } from "@/lib/erp/nodes";
import { beatLocal, inv, lerp, local, rise, seg, win } from "@/lib/erp/sv";
import { At, AtStack, LightUp, Scene, useScene, useSceneProgress } from "../engine";
import {
  BeatCopy,
  BeatDots,
  ChapterCover,
  Code,
  Decisions,
  Figure,
  ProofStrip,
  SceneLayout,
  Section,
  StateTrack,
  Walkthrough,
} from "../ui";

const META = CHAPTERS[1];

/** Deterministic French money format: 61 915,00 */
function da(n: number): string {
  const [i, d] = n.toFixed(2).split(".");
  return `${i.replace(/\B(?=(\d{3})+(?!\d))/g, " ")},${d}`;
}

type Beat = { kicker: L; title: L; body: L; details?: L[] };

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

const COVER = {
  oneLiner: {
    en: "Books that cannot disagree with the documents, because they are written by them.",
    fr: "Une comptabilité qui ne peut pas contredire les documents, parce qu'elle est écrite par eux.",
    ar: "دفاتر لا يمكن أن تناقض الوثائق، لأن الوثائق نفسها هي التي تكتبها.",
  },
  context: [
    {
      en: "SayrouraPOS is a desktop commercial-management and accounting system built for Algerian businesses. It started life as a point of sale; this chapter is about everything behind it: commercial documents from quotation to invoice, SCF journals, TVA and stamp duty, payroll, depots and purchasing — the part an auditor reads.",
      fr: "SayrouraPOS est une gestion commerciale et comptable de bureau, conçue pour les entreprises algériennes. Il est né comme logiciel de caisse ; ce chapitre parle de tout ce qu'il y a derrière : documents commerciaux du devis à la facture, journaux SCF, TVA et droit de timbre, paie, dépôts et achats — la partie que lit un contrôleur.",
      ar: "SayrouraPOS نظام مكتبي للتسيير التجاري والمحاسبة صُمّم للمؤسسات الجزائرية. بدأ كبرنامج نقطة بيع؛ أمّا هذا الفصل فيتناول كل ما يقف خلفه: الوثائق التجارية من عرض السعر إلى الفاتورة، يوميات النظام المحاسبي المالي، الرسم على القيمة المضافة وحقوق الطابع، الأجور، المستودعات والمشتريات — الجزء الذي يقرؤه المراقب.",
    },
    {
      en: "It runs on one PC with its own database, keeps working without the internet, and serves the site's other terminals over the local network. The cloud is a relay and a mirror — never the source of truth.",
      fr: "Il tourne sur un poste avec sa propre base de données, continue de fonctionner sans internet et sert les autres postes du site par le réseau local. Le cloud est un relais et un miroir — jamais la source de vérité.",
      ar: "يعمل على حاسوب واحد بقاعدة بياناته الخاصة، ويواصل العمل دون إنترنت، ويخدم أجهزة الموقع الأخرى عبر الشبكة المحلية. السحابة مجرّد وسيط ونسخة مرآة — وليست أبدًا مصدر الحقيقة.",
    },
  ] as L[],
  roles: [
    {
      name: { en: "Owner", fr: "Gérant", ar: "المسيّر" },
      does: {
        en: "Approves transfers, allocates landed costs, closes the month.",
        fr: "Valide les transferts, répartit les frais d'approche, clôture le mois.",
        ar: "يصادق على التحويلات، يوزّع مصاريف الاستيراد، ويُقفل الشهر.",
      },
    },
    {
      name: { en: "Front office", fr: "Administration des ventes", ar: "المكتب الأمامي" },
      does: {
        en: "Issues devis, proformas, delivery notes, invoices and credit notes.",
        fr: "Émet devis, proformas, bons de livraison, factures et avoirs.",
        ar: "يُصدر عروض الأسعار والفواتير الشكلية ووصولات التسليم والفواتير والفواتير المضادّة.",
      },
    },
    {
      name: { en: "Depot", fr: "Dépôt", ar: "المستودع" },
      does: {
        en: "Receives purchase orders, ships and receives transfers, counts stock.",
        fr: "Réceptionne les commandes, expédie et reçoit les transferts, compte le stock.",
        ar: "يستلم طلبيات الشراء، يرسل التحويلات ويستلمها، ويجرد المخزون.",
      },
    },
    {
      name: { en: "Accountant", fr: "Comptable", ar: "المحاسب" },
      does: {
        en: "Receives journals, G50 and état 104 as files — and files them.",
        fr: "Reçoit journaux, G50 et état 104 sous forme de fichiers — et dépose.",
        ar: "يستلم اليوميات وG50 والكشف 104 كملفات — ثم يتولّى التصريح.",
      },
    },
  ],
  platforms: [
    { en: "Windows desktop · SQLite", fr: "Poste Windows · SQLite", ar: "حاسوب Windows · SQLite" },
    { en: "Site terminals over LAN", fr: "Postes du site en réseau local", ar: "أجهزة الموقع عبر الشبكة المحلية" },
    { en: "Mobile companion", fr: "Application mobile compagnon", ar: "تطبيق جوّال مرافق" },
    { en: "French · Arabic (RTL)", fr: "Français · Arabe (RTL)", ar: "الفرنسية · العربية" },
  ] as L[],
  facts: [
    { value: 9, label: { en: "SCF accounts written by documents", fr: "comptes SCF alimentés par les documents", ar: "حسابات محاسبية تغذّيها الوثائق" } },
    { value: 3, label: { en: "TVA rates, plus the IFU regime", fr: "taux de TVA, plus le régime IFU", ar: "نسب للرسم على القيمة المضافة + نظام IFU" } },
    { value: 5, label: { en: "aging buckets on receivables", fr: "tranches d'ancienneté des créances", ar: "شرائح أقدمية للديون" } },
    { value: 2091, label: { en: "interface lines in French, and as many in Arabic", fr: "lignes d'interface en français, autant en arabe", ar: "سطرًا للواجهة بالفرنسية، ومثلها بالعربية" } },
  ],
};

const JOURNAL_BEATS: Beat[] = [
  {
    kicker: { en: "02.1 — The document", fr: "02.1 — Le document", ar: "02.1 — الوثيقة" },
    title: {
      en: "Everything starts as a document with a legal shape.",
      fr: "Tout commence par un document à la forme légale.",
      ar: "كل شيء يبدأ بوثيقة ذات شكل قانوني.",
    },
    body: {
      en: "Devis, proforma and bon de commande are drafts: they never touch stock. Stock moves only when a document becomes a bon de livraison, and the facture carries what Algerian law asks for — NIF, NIS, RC, and the amount in words in French and Arabic.",
      fr: "Devis, proforma et bon de commande sont des brouillons : ils ne touchent jamais le stock. Le stock ne bouge que lorsqu'un document devient bon de livraison, et la facture porte ce qu'exige la loi algérienne — NIF, NIS, RC, et le montant en lettres en français et en arabe.",
      ar: "عرض السعر والفاتورة الشكلية ووصل الطلب مجرّد مسودّات: لا تمسّ المخزون أبدًا. لا يتحرك المخزون إلا عندما تتحول الوثيقة إلى وصل تسليم، وتحمل الفاتورة ما يفرضه القانون الجزائري — NIF وNIS وRC، والمبلغ بالحروف بالفرنسية والعربية.",
    },
    details: [
      {
        en: "One table, a doc_type discriminator: converting a devis into a delivery note is a state change, not a copy-paste.",
        fr: "Une seule table et un discriminant doc_type : transformer un devis en bon de livraison est un changement d'état, pas un copier-coller.",
        ar: "جدول واحد مع مميّز doc_type: تحويل عرض السعر إلى وصل تسليم تغيير حالة، لا نسخ ولصق.",
      },
      {
        en: "A facture récapitulative consolidates a month of delivery notes for one client and keeps each line's historical TVA.",
        fr: "La facture récapitulative regroupe un mois de bons de livraison d'un client et conserve la TVA historique de chaque ligne.",
        ar: "الفاتورة التجميعية تضمّ وصولات تسليم شهر كامل لزبون واحد وتحتفظ بالرسم التاريخي لكل سطر.",
      },
    ],
  },
  {
    kicker: { en: "02.2 — The number", fr: "02.2 — Le numéro", ar: "02.2 — الرقم" },
    title: {
      en: "A number is reserved, never guessed.",
      fr: "Un numéro se réserve, il ne se devine pas.",
      ar: "الرقم يُحجز، ولا يُخمَّن.",
    },
    body: {
      en: "Fiscal series must be continuous and never reset within a year: a missing invoice number is a question at a tax audit. The counter for each document type and year is incremented and read inside one database transaction, so two terminals asking at once get 214 and 215 — never the same number, never a hole.",
      fr: "Les séries fiscales doivent être continues et ne jamais repartir à zéro dans l'année : un numéro de facture manquant est une question lors d'un contrôle. Le compteur de chaque type et de chaque année est incrémenté et lu dans une seule transaction, donc deux postes qui demandent en même temps obtiennent 214 et 215 — jamais le même, jamais de trou.",
      ar: "يجب أن تكون السلاسل الجبائية متصلة ولا تُصفَّر خلال السنة: رقم فاتورة مفقود سؤالٌ عند المراقبة الجبائية. يُزاد عدّاد كل نوع وكل سنة ويُقرأ داخل معاملة واحدة في قاعدة البيانات، فإذا طلب جهازان في اللحظة نفسها حصلا على 214 و215 — لا تكرار، ولا ثغرة.",
    },
    details: [
      {
        en: "Format PREFIX-YYYY-000001 — FACT, AV, TK, PO, RETF, RET, TRF, BT, CNT, Z each keep their own series.",
        fr: "Format PRÉFIXE-AAAA-000001 — FACT, AV, TK, PO, RETF, RET, TRF, BT, CNT, Z ont chacun leur série.",
        ar: "الصيغة PREFIX-YYYY-000001 — لكلٍّ من FACT وAV وTK وPO وRETF وRET وTRF وBT وCNT وZ سلسلته.",
      },
      {
        en: "Only the desktop issues numbers. A phone working through the cloud sends lines; the number comes back from the system of record.",
        fr: "Seul le poste principal attribue les numéros. Un téléphone passant par le cloud envoie des lignes ; le numéro revient du système de référence.",
        ar: "الحاسوب الرئيسي وحده يمنح الأرقام. الهاتف الذي يعمل عبر السحابة يرسل الأسطر، والرقم يعود من نظام المرجع.",
      },
    ],
  },
  {
    kicker: { en: "02.3 — The journal", fr: "02.3 — Le journal", ar: "02.3 — اليومية" },
    title: {
      en: "The invoice writes its own journal lines.",
      fr: "La facture écrit ses propres lignes de journal.",
      ar: "الفاتورة تكتب أسطر يوميتها بنفسها.",
    },
    body: {
      en: "Each document type maps to SCF accounts: the client 411 is debited with the total, revenue 70 is credited with the amount before tax, TVA collected goes to 4457 and stamp duty to 4456. Nobody re-keys an invoice into accounting, so the two cannot drift apart.",
      fr: "Chaque type de document correspond à des comptes SCF : le client 411 est débité du TTC, les ventes 70 sont créditées du HT, la TVA collectée va en 4457 et le timbre en 4456. Personne ne ressaisit une facture en comptabilité, donc les deux ne peuvent pas diverger.",
      ar: "كل نوع وثيقة مربوط بحسابات النظام المحاسبي المالي: يُجعل الزبون 411 مدينًا بالمبلغ الإجمالي، وتُجعل المبيعات 70 دائنة بالمبلغ خارج الرسم، ويذهب الرسم المحصَّل إلى 4457 وحقوق الطابع إلى 4456. لا أحد يعيد إدخال الفاتورة في المحاسبة، فلا يمكن أن يفترق الاثنان.",
    },
    details: [
      {
        en: "Debits equal credits by construction: the TTC is the sum of the parts it is split into.",
        fr: "Débit = crédit par construction : le TTC est la somme des parts dans lesquelles il est ventilé.",
        ar: "المدين يساوي الدائن بحكم البناء: المبلغ الإجمالي هو مجموع الأجزاء التي يُوزَّع عليها.",
      },
    ],
  },
  {
    kicker: { en: "02.4 — Settlement & export", fr: "02.4 — Règlement & export", ar: "02.4 — التسوية والتصدير" },
    title: {
      en: "Payment clears the client. The accountant gets a file.",
      fr: "Le règlement solde le client. Le comptable reçoit un fichier.",
      ar: "الدفع يسوّي حساب الزبون. والمحاسب يستلم ملفًا.",
    },
    body: {
      en: "Cash lands in 53, a transfer in 512, and 411 goes back to zero. Journals export as CSV with semicolons — the convention Algerian and French spreadsheets expect — and any cell starting with = + − @ is neutralised so a client name cannot run a formula on the accountant's machine.",
      fr: "L'espèce entre en 53, le virement en 512, et le 411 revient à zéro. Les journaux s'exportent en CSV à point-virgule — la convention des tableurs algériens et français — et toute cellule commençant par = + − @ est neutralisée : un nom de client ne peut pas exécuter de formule chez le comptable.",
      ar: "النقد يدخل الحساب 53، والتحويل البنكي 512، ويعود 411 إلى الصفر. تُصدَّر اليوميات بصيغة CSV بفاصلة منقوطة — العرف الذي تنتظره الجداول الجزائرية والفرنسية — وتُحيَّد كل خانة تبدأ بـ = + − @ حتى لا يستطيع اسم زبون تشغيل صيغة على جهاز المحاسب.",
    },
  },
];

const TAX_BEATS: Beat[] = [
  {
    kicker: { en: "02.5 — TVA by rate", fr: "02.5 — TVA par taux", ar: "02.5 — الرسم حسب النسبة" },
    title: {
      en: "Tax is computed per line, then grouped per rate.",
      fr: "La taxe se calcule par ligne, puis se regroupe par taux.",
      ar: "يُحسب الرسم لكل سطر، ثم يُجمَّع حسب النسبة.",
    },
    body: {
      en: "Each article carries its rate — 19 %, 9 % or 0 %. Prices entered tax-inclusive are split back with HT = TTC ÷ (1 + rate), so the base is exact whichever way the price was typed. A business under the IFU regime charges no TVA at all, and the same documents follow.",
      fr: "Chaque article porte son taux — 19 %, 9 % ou 0 %. Les prix saisis TTC sont ventilés avec HT = TTC ÷ (1 + taux) : la base est exacte quelle que soit la saisie. Une entreprise au régime IFU ne facture aucune TVA, et les mêmes documents suivent.",
      ar: "يحمل كل صنف نسبته — 19 % أو 9 % أو 0 %. الأسعار المُدخلة متضمّنة الرسم تُفكَّك بالعلاقة HT = TTC ÷ (1 + النسبة)، فتكون القاعدة دقيقة أيًّا كانت طريقة الإدخال. المؤسسة الخاضعة لنظام IFU لا تفوتر أي رسم، والوثائق نفسها تتبع ذلك.",
    },
  },
  {
    kicker: { en: "02.6 — Stamp duty", fr: "02.6 — Droit de timbre", ar: "02.6 — حقوق الطابع" },
    title: {
      en: "Cash settlement adds a graduated stamp duty.",
      fr: "Le règlement en espèces ajoute un timbre progressif.",
      ar: "التسوية نقدًا تضيف حقوق طابع متدرّجة.",
    },
    body: {
      en: "The droit de timbre is charged per 100 DA tranche of the cash total: 1 % up to 30 000, 1.5 % up to 100 000, 2 % above, with a 5 DA floor, a 10 000 DA cap, and nothing at or under 300 DA. The brackets live in one function, so when the finance law changes the accountant confirms a single line.",
      fr: "Le droit de timbre se calcule par tranche de 100 DA du total payé en espèces : 1 % jusqu'à 30 000, 1,5 % jusqu'à 100 000, 2 % au-delà, minimum 5 DA, plafond 10 000 DA, rien jusqu'à 300 DA. Les tranches vivent dans une seule fonction : quand la loi de finances change, le comptable valide une ligne.",
      ar: "تُحسب حقوق الطابع لكل شريحة 100 دج من المبلغ المدفوع نقدًا: 1 % حتى 30 000، و1.5 % حتى 100 000، و2 % فوق ذلك، بحدّ أدنى 5 دج وسقف 10 000 دج، ولا شيء حتى 300 دج. تعيش الشرائح في دالّة واحدة، فإذا تغيّر قانون المالية صادق المحاسب على سطر واحد.",
    },
  },
  {
    kicker: { en: "02.7 — The month", fr: "02.7 — Le mois", ar: "02.7 — الشهر" },
    title: {
      en: "Every document of the month feeds the G50.",
      fr: "Chaque document du mois alimente la G50.",
      ar: "كل وثائق الشهر تغذّي التصريح G50.",
    },
    body: {
      en: "TVA collected by rate comes from invoice lines, deductible TVA from received purchases, stamp duty from cash settlements, IRG from payslips. The result is TVA to pay or a TVA credit carried forward. The same data feeds the annual état 104, a Jibaya'tic-ready CSV bundle and the liasse fiscale figures.",
      fr: "La TVA collectée par taux vient des lignes de factures, la TVA déductible des achats réceptionnés, le timbre des règlements en espèces, l'IRG des bulletins de paie. Le résultat : TVA à payer ou crédit de TVA. Les mêmes données alimentent l'état 104 annuel, un export CSV prêt pour Jibaya'tic et les chiffres de la liasse fiscale.",
      ar: "الرسم المحصَّل حسب النسبة يأتي من أسطر الفواتير، والرسم القابل للخصم من المشتريات المستلمة، وحقوق الطابع من التسويات النقدية، والضريبة على الدخل الإجمالي من كشوف الأجور. النتيجة: رسم واجب الدفع أو رصيد دائن يُرحَّل. والبيانات نفسها تغذّي الكشف 104 السنوي، وملف CSV جاهزًا لجباية تيك، وأرقام الحزمة الجبائية.",
    },
    details: [
      {
        en: "Prepared, not filed: the software builds the worksheet, the accountant signs and declares.",
        fr: "Préparé, pas déposé : le logiciel construit l'état, le comptable signe et déclare.",
        ar: "يُحضَّر ولا يُودَع: البرنامج يبني الكشف، والمحاسب يوقّع ويصرّح.",
      },
    ],
  },
];

const PAYROLL_BEATS: Beat[] = [
  {
    kicker: { en: "02.8 — The payslip", fr: "02.8 — Le bulletin", ar: "02.8 — كشف الراتب" },
    title: {
      en: "Gross to net, in the order the law applies it.",
      fr: "Du brut au net, dans l'ordre où la loi l'applique.",
      ar: "من الإجمالي إلى الصافي، بالترتيب الذي يفرضه القانون.",
    },
    body: {
      en: "The employee's CNAS share, 9 %, comes off the gross first. IRG is then computed on what remains, slice by slice through a progressive monthly scale. Net pay is what is left — and every intermediate figure is stored on the payslip, so it can be re-read and checked.",
      fr: "La part salariale CNAS, 9 %, est retenue d'abord sur le brut. L'IRG est ensuite calculé sur le reste, tranche par tranche, selon un barème mensuel progressif. Le net est ce qui reste — et chaque chiffre intermédiaire est conservé sur le bulletin pour être relu et vérifié.",
      ar: "تُقتطع أولًا حصة العامل في CNAS، أي 9 %، من الأجر الإجمالي. ثم تُحسب الضريبة على الدخل الإجمالي على الباقي، شريحة بشريحة، وفق جدول شهري تصاعدي. الصافي هو ما يتبقّى — وكل رقم وسيط يُحفظ في الكشف ليُعاد قراءته والتحقق منه.",
    },
  },
  {
    kicker: { en: "02.9 — The cost", fr: "02.9 — Le coût", ar: "02.9 — الكلفة" },
    title: {
      en: "The books record what the employee costs, not what they receive.",
      fr: "Les livres enregistrent ce que coûte le salarié, pas ce qu'il touche.",
      ar: "الدفاتر تسجّل ما يكلّفه العامل، لا ما يتقاضاه.",
    },
    body: {
      en: "The employer adds 25.5 % CNAS — and 12.21 % CACOBATPH for construction staff. Posting net pay would understate the wage bill by about a third, so the employer cost is what reaches expenses: one row per employee per period, behind a unique index that turns a second click into a no-op. The IRG withheld goes to the G50.",
      fr: "L'employeur ajoute 25,5 % de CNAS — et 12,21 % de CACOBATPH pour le personnel du BTP. Comptabiliser le net sous-estimerait la masse salariale d'environ un tiers : c'est donc le coût employeur qui passe en charges, une ligne par salarié et par période, derrière un index unique qui rend un second clic sans effet. L'IRG retenu part dans la G50.",
      ar: "يضيف صاحب العمل 25.5 % لـ CNAS — و12.21 % لـ CACOBATPH لعمال البناء. تسجيل الصافي كان سيُنقص كتلة الأجور بنحو الثلث، لذلك تُسجَّل كلفة صاحب العمل في الأعباء: سطر واحد لكل عامل ولكل فترة، خلف فهرس فريد يجعل النقرة الثانية بلا أثر. والضريبة المقتطعة تذهب إلى G50.",
    },
  },
];

const STOCK_BEATS: Beat[] = [
  {
    kicker: { en: "02.10 — Purchasing", fr: "02.10 — Achats", ar: "02.10 — المشتريات" },
    title: {
      en: "Stock rises by what arrived, not by what was ordered.",
      fr: "Le stock monte de ce qui est arrivé, pas de ce qui est commandé.",
      ar: "يرتفع المخزون بما وصل، لا بما طُلب.",
    },
    body: {
      en: "A bon de commande records ordered quantities; the reception records received ones, line by line, and a short delivery leaves the order partial. Freight and customs are spread across the lines by value to give a landed unit cost, and stock is valued at weighted average cost (CMUP).",
      fr: "Le bon de commande enregistre les quantités commandées ; la réception enregistre les quantités reçues, ligne par ligne, et une livraison incomplète laisse la commande partielle. Le fret et la douane sont répartis sur les lignes au prorata de la valeur pour donner un coût de revient unitaire, et le stock est valorisé au CMUP.",
      ar: "يسجّل وصل الطلب الكميات المطلوبة؛ ويسجّل الاستلام الكميات المستلمة سطرًا بسطر، والتسليم الناقص يُبقي الطلبية جزئية. تُوزَّع مصاريف الشحن والجمارك على الأسطر حسب القيمة لإعطاء كلفة وحدة فعلية، ويُقيَّم المخزون بالتكلفة الوسطية المرجّحة (CMUP).",
    },
    details: [
      {
        en: "Deductible TVA is derived from received quantities × each article's rate, then posted 60 / 44566 / 401.",
        fr: "La TVA déductible est dérivée des quantités reçues × le taux de chaque article, puis passée en 60 / 44566 / 401.",
        ar: "يُستخرج الرسم القابل للخصم من الكميات المستلمة × نسبة كل صنف، ثم يُقيَّد في 60 / 44566 / 401.",
      },
    ],
  },
  {
    kicker: { en: "02.11 — Transfers", fr: "02.11 — Transferts", ar: "02.11 — التحويلات" },
    title: {
      en: "Goods in a truck belong to neither depot.",
      fr: "La marchandise dans le camion n'appartient à aucun dépôt.",
      ar: "البضاعة في الشاحنة لا تنتمي إلى أي مستودع.",
    },
    body: {
      en: "A transfer is two phases, not one: the source decrements when it ships, the destination increments when it receives, and the gap in between is reported as in transit. Each line keeps three quantities — requested, shipped, received — because a box can be short.",
      fr: "Un transfert se fait en deux phases : la source décrémente à l'expédition, la destination incrémente à la réception, et l'entre-deux est affiché « en transit ». Chaque ligne garde trois quantités — demandée, expédiée, reçue — parce qu'un carton peut arriver incomplet.",
      ar: "التحويل مرحلتان لا مرحلة واحدة: ينقص المصدر عند الإرسال، ويزيد المستودع المستقبِل عند الاستلام، وما بينهما يُعرض «قيد النقل». يحتفظ كل سطر بثلاث كميات — المطلوبة والمُرسلة والمستلمة — لأن صندوقًا قد يصل ناقصًا.",
    },
    details: [
      {
        en: "Idempotent by state: every transition asserts the current status first, so a double-click or a retried sync cannot receive the same goods twice.",
        fr: "Idempotent par l'état : chaque transition vérifie d'abord le statut, donc un double-clic ou une synchro rejouée ne peut pas recevoir deux fois.",
        ar: "ثابت بالحالة: كل انتقال يتحقق أولًا من الحالة الراهنة، فلا يمكن لنقرة مزدوجة أو مزامنة معادة أن تستلم البضاعة مرتين.",
      },
    ],
  },
  {
    kicker: { en: "02.12 — Who owes whom", fr: "02.12 — Qui doit quoi", ar: "02.12 — من يدين لمن" },
    title: {
      en: "Receivables age in buckets; cheques wait for their date.",
      fr: "Les créances vieillissent par tranches ; les chèques attendent leur date.",
      ar: "الديون تتقادم في شرائح؛ والشيكات تنتظر تاريخها.",
    },
    body: {
      en: "Every unpaid or partly paid invoice is aged from its due date into current, 30, 60, 90 and 90+ days, per client. Supplier payables are tracked on the other side, and post-dated cheques — incoming and outgoing, a common instrument in Algeria — sit in their own register until they clear.",
      fr: "Chaque facture impayée ou partiellement payée est classée selon son échéance : courant, 30, 60, 90 et plus de 90 jours, par client. Les dettes fournisseurs sont suivies de l'autre côté, et les chèques post-datés — reçus et émis, très courants en Algérie — ont leur propre registre jusqu'à encaissement.",
      ar: "تُصنَّف كل فاتورة غير مدفوعة أو مدفوعة جزئيًا حسب تاريخ استحقاقها: جارية، 30، 60، 90، وأكثر من 90 يومًا، لكل زبون. وتُتابع ديون الموردين في الجهة الأخرى، وللشيكات المؤجلة — الواردة والصادرة، وهي شائعة في الجزائر — سجلّها الخاص حتى تحصيلها.",
    },
  },
];

const SYNC_BEATS: Beat[] = [
  {
    kicker: { en: "02.13 — One system of record", fr: "02.13 — Un seul système de référence", ar: "02.13 — نظام مرجعي واحد" },
    title: {
      en: "The desktop owns the books. Everything else is a client.",
      fr: "Le poste principal détient les livres. Tout le reste est client.",
      ar: "الحاسوب الرئيسي يملك الدفاتر. وكل ما عداه عميل.",
    },
    body: {
      en: "Other terminals on the site talk to a local server on the desktop and hear about changes through a one-way event stream (SSE). Away from the site, a cloud relay carries deltas — only what changed since the last push — and a read-only PostgreSQL mirror behind the owner's website receives batched pushes. Nothing on the site ever waits for either.",
      fr: "Les autres postes du site parlent à un serveur local sur le poste principal et sont prévenus des changements par un flux d'événements à sens unique (SSE). Hors du site, un relais cloud transporte des deltas — seulement ce qui a changé depuis le dernier envoi — et un miroir PostgreSQL en lecture seule, derrière le site du gérant, reçoit des envois par lots. Rien sur le site n'attend jamais l'un ou l'autre.",
      ar: "تتحدث أجهزة الموقع الأخرى مع خادم محلي على الحاسوب الرئيسي وتُبلَّغ بالتغييرات عبر تدفق أحداث أحادي الاتجاه (SSE). خارج الموقع، ينقل وسيط سحابي الفروقات فقط — ما تغيّر منذ آخر إرسال — وتستقبل نسخة PostgreSQL مرآة للقراءة فقط، خلف موقع المسيّر، دفعات مُجمَّعة. ولا شيء في الموقع ينتظر أيًّا منهما.",
    },
  },
  {
    kicker: { en: "02.14 — Offline", fr: "02.14 — Hors ligne", ar: "02.14 — دون اتصال" },
    title: {
      en: "When the internet drops, the business does not.",
      fr: "Quand internet tombe, l'activité continue.",
      ar: "حين ينقطع الإنترنت، لا يتوقف العمل.",
    },
    body: {
      en: "Documents keep being numbered, taxed and posted locally; the site's terminals stay connected over the LAN. Outbound deltas queue up and drain when the link returns. Because numbering and the TVA recompute only ever run on the desktop, reconnecting cannot create a duplicate invoice number.",
      fr: "Les documents continuent d'être numérotés, taxés et comptabilisés localement ; les postes du site restent connectés en réseau local. Les deltas sortants s'accumulent et se vident au retour de la liaison. Comme la numérotation et le recalcul de la TVA ne tournent que sur le poste principal, la reconnexion ne peut pas créer un numéro de facture en double.",
      ar: "تواصل الوثائق ترقيمها وحساب رسومها وتقييدها محليًا، وتبقى أجهزة الموقع متصلة عبر الشبكة المحلية. تتراكم الفروقات الصادرة ثم تُفرَّغ عند عودة الاتصال. ولأن الترقيم وإعادة حساب الرسم لا يجريان إلا على الحاسوب الرئيسي، لا يمكن لإعادة الاتصال أن تُنتج رقم فاتورة مكررًا.",
    },
    details: [
      {
        en: "A site offline for a month pushes in bounded batches; every row carries its business key (its document number), so a resent batch is upserted, never duplicated.",
        fr: "Un site resté hors ligne un mois envoie par lots bornés ; chaque ligne porte sa clé métier (son numéro de document), donc un lot renvoyé est mis à jour, jamais dupliqué.",
        ar: "الموقع الذي بقي دون اتصال شهرًا يرسل على دفعات محدودة؛ وكل سطر يحمل مفتاحه التجاري (رقم وثيقته)، فالدفعة المعادة تُحدَّث ولا تتكرر أبدًا.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function SceneCopy({ beats }: { beats: Beat[] }) {
  const { beat } = useScene();
  return (
    /* Short laptop screens (≤ 700 px tall): the numbered details give way so the beat never overflows the stage. */
    <div className="[@media(min-width:768px)_and_(max-height:700px)]:[&_ul]:!hidden">
      <BeatDots count={beats.length} current={beat} className="mb-5" />
      <AtStack className="grid-cols-[minmax(0,1fr)]">
        {beats.map((b, i) => (
          <At key={i} from={i} to={i}>
            <BeatCopy kicker={b.kicker} title={b.title} body={b.body} details={b.details} />
          </At>
        ))}
      </AtStack>
    </div>
  );
}

/** Dimmed until its moment, then lit: the row is in the frame from the start of the beat. */
function dim(name: string, a: number, b: number): CSSProperties {
  return { opacity: lerp(seg(name, a, b), 0.22, 1) };
}

function Cap({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`erp-mono text-[0.62rem] uppercase tracking-[0.14em] text-faint ${className}`}>{children}</p>;
}

/** One journal line: account, label, debit, credit. */
function JRow({
  acc,
  label,
  d,
  c,
  style,
  strong = false,
}: {
  acc: string;
  label: string;
  d?: number;
  c?: number;
  style?: CSSProperties;
  strong?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[2.6rem_minmax(0,1fr)_4.4rem_4.4rem] items-baseline gap-2 border-b border-[var(--erp-hair)] py-1.5 ${strong ? "text-ink" : "text-graphite"}`}
      style={style}
    >
      <span className="text-signal-deep">{acc}</span>
      <span className="truncate">{label}</span>
      <span className="text-end tnum">{d !== undefined ? da(d) : ""}</span>
      <span className="text-end tnum">{c !== undefined ? da(c) : ""}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 1 — document → number → journal → settlement                 */
/* ------------------------------------------------------------------ */

const INV = {
  lines: [
    { name: "Article A", qty: 8, pu: 5000, rate: 19 },
    { name: "Article B", qty: 4, pu: 2500, rate: 9 },
    { name: "Article C", qty: 1, pu: 2500, rate: 0 },
  ],
  ht: 52500,
  tva19: 7600,
  tva9: 900,
  tva: 8500,
  ttc: 61000,
  timbre: 915,
  total: 61915,
};

function JournalScene() {
  const tx = useTx();
  return (
    <Scene id="pos-journal" beats={4} length={55} label={tx({ en: "Document to journal", fr: "Du document au journal", ar: "من الوثيقة إلى اليومية" })}>
      <SceneLayout wide copy={<SceneCopy beats={JOURNAL_BEATS} />} figure={<JournalFigure />} />
      <LightUp nodes={["documents"]} at={0.3} />
      <LightUp nodes={["ledger"]} at={0.56} />
    </Scene>
  );
}

function JournalFigure() {
  const { beat } = useScene();
  return (
    <Figure
      fig="FIG. 02.1"
      title={{ en: "Facture → journal des ventes", fr: "Facture → journal des ventes", ar: "Facture → journal des ventes" }}
      className="w-full [contain:inline-size]"
      bodyClassName="grid max-h-[46svh] overflow-hidden md:max-h-none md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)]"
    >
      <div className={beat >= 1 ? "hidden md:block" : ""}>
        <InvoiceDoc numbered={beat >= 1} />
      </div>
      <div className={`border-[var(--erp-hair)] p-3 md:border-s md:p-4 ${beat === 0 ? "hidden md:block" : ""}`}>
        <AtStack className="grid-cols-[minmax(0,1fr)]">
          <At from={0} to={0}>
            <DocChain />
          </At>
          <At from={1} to={1}>
            <SequencePanel />
          </At>
          <At from={2} to={3}>
            <JournalPanel />
          </At>
        </AtStack>
      </div>
    </Figure>
  );
}

function InvoiceDoc({ numbered }: { numbered: boolean }) {
  return (
    <div className="erp-mono p-3 text-[11px] leading-snug text-graphite md:p-4 md:text-[11.5px]">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--erp-hair-2)] pb-2">
        <div>
          <p className="text-[13px] font-semibold tracking-[0.12em] text-ink">FACTURE</p>
          <p className="mt-0.5 text-faint">Démo SARL · Alger</p>
        </div>
        <div className="text-end">
          <p className={`transition-colors duration-500 ${numbered ? "text-signal-deep" : "text-faint"}`}>
            {numbered ? "FACT-2026-000214" : "FACT-2026-······"}
          </p>
          <p className="mt-0.5 text-faint">2026-03-14</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 border-b border-[var(--erp-hair)] py-2">
        <span className="text-faint">Client</span>
        <span className="text-ink">SARL Démo Nord</span>
        <span className="text-faint sm:hidden">NIF · NIS · RC</span>
        <span className="sm:hidden">··· · ··· · ···</span>
        {["NIF", "NIS", "RC"].map((k) => (
          <span key={k} className="hidden sm:contents">
            <span className="text-faint">{k}</span>
            <span>··· ··· ···</span>
          </span>
        ))}
        <span className="text-faint">Règlement</span>
        <span>espèces</span>
      </div>
      <div className="py-2">
        <div className="grid grid-cols-[1fr_2rem_2.6rem_5rem] gap-2 text-faint">
          <span>Désignation</span>
          <span className="text-end">Qté</span>
          <span className="text-end">TVA</span>
          <span className="text-end">HT</span>
        </div>
        {INV.lines.map((l) => (
          <div key={l.name} className="grid grid-cols-[1fr_2rem_2.6rem_5rem] gap-2 border-b border-dashed border-[var(--erp-hair)] py-1">
            <span>{l.name}</span>
            <span className="text-end">{l.qty}</span>
            <span className="text-end">{l.rate}%</span>
            <span className="text-end tnum">{da(l.qty * l.pu)}</span>
          </div>
        ))}
      </div>
      <div className="ms-auto w-full max-w-[15rem] space-y-0.5">
        {[
          ["Total HT", INV.ht],
          ["TVA 19 %", INV.tva19],
          ["TVA 9 %", INV.tva9],
          ["Total TTC", INV.ttc],
          ["Droit de timbre", INV.timbre],
        ].map(([k, v]) => (
          /* Phone: the per-rate TVA lines are shown in the next scene; keep the invoice inside the frame. */
          <div key={k as string} className={`flex justify-between gap-3 ${String(k).startsWith("TVA ") ? "hidden sm:flex" : ""}`}>
            <span className="text-faint">{k}</span>
            <span className="tnum">{da(v as number)}</span>
          </div>
        ))}
        <div className="flex justify-between gap-3 border-t border-ink pt-1 text-ink">
          <span>Net à payer</span>
          <span className="tnum font-semibold">{da(INV.total)}</span>
        </div>
      </div>
      <div className="mt-3 border-t border-[var(--erp-hair)] pt-2 text-[10.5px] leading-relaxed [@media(min-width:768px)_and_(max-height:760px)]:hidden">
        <p className="hidden text-faint sm:block">Arrêtée la présente facture à la somme de :</p>
        <p className="text-ink">soixante et un mille neuf cent quinze dinars algériens</p>
        <p dir="rtl" className="mt-1 text-end font-sans text-[12px] text-ink">
          واحد وستون ألفًا وتسعمائة وخمسة عشر دينارًا جزائريًا
        </p>
      </div>
    </div>
  );
}

function DocChain() {
  const tx = useTx();
  const steps: { code: string; name: string; note: L; lit?: boolean }[] = [
    { code: "DEV", name: "devis", note: { en: "draft · no stock", fr: "brouillon · pas de stock", ar: "مسودّة · دون مخزون" } },
    { code: "PRO", name: "proforma", note: { en: "draft · no stock", fr: "brouillon · pas de stock", ar: "مسودّة · دون مخزون" } },
    { code: "BC", name: "bon de commande", note: { en: "draft · no stock", fr: "brouillon · pas de stock", ar: "مسودّة · دون مخزون" } },
    { code: "BL", name: "bon de livraison", note: { en: "stock moves here", fr: "le stock bouge ici", ar: "هنا يتحرك المخزون" }, lit: true },
    { code: "FACT", name: "facture · récapitulative", note: { en: "tax document", fr: "document fiscal", ar: "وثيقة جبائية" }, lit: true },
  ];
  return (
    <div className="erp-mono text-[11px] md:text-[11.5px]">
      <Cap>{tx({ en: "Document chain · doc_type", fr: "Chaîne documentaire · doc_type", ar: "سلسلة الوثائق · doc_type" })}</Cap>
      <ol className="relative mt-3 space-y-2.5 ps-5">
        <span className="absolute bottom-2 start-[5px] top-2 w-px bg-[var(--erp-hair-2)]" />
        {steps.map((s, i) => (
          <li key={s.code} className="relative" style={rise("--b0", 0.05 + i * 0.1, 0.25 + i * 0.1, 8)}>
            <span className={`absolute -start-5 top-1 h-[11px] w-[11px] border ${s.lit ? "border-signal bg-signal" : "border-ink bg-paper"}`} />
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-ink">
                <span className={s.lit ? "text-signal-deep" : "text-faint"}>{s.code}</span> {s.name}
              </span>
              <span className={`shrink-0 text-[10.5px] ${s.lit ? "text-signal-deep" : "text-faint"}`}>{tx(s.note)}</span>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex items-center gap-2 border-t border-dashed border-[var(--erp-hair-2)] pt-3" style={rise("--b0", 0.6, 0.8, 8)}>
        <span className="text-faint">↳</span>
        <span className="text-ink">AV</span>
        <span className="text-graphite">avoir</span>
        <span className="ms-auto text-[10.5px] text-faint">
          {tx({ en: "credit note, own series", fr: "série propre", ar: "سلسلة خاصة" })}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-px bg-[var(--erp-hair)]" style={rise("--b0", 0.7, 0.9, 8)}>
        {["NIF · NIS · RC", "FR · lettres", "AR · حروف"].map((k) => (
          <span key={k} className="bg-paper px-2 py-1.5 text-center text-[10.5px] text-graphite">
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}

function SequencePanel() {
  const tx = useTx();
  const step = (a: number) => ({ opacity: lerp(seg("--b1", a, a + 0.08), 0.28, 1) });
  return (
    <div className="erp-mono text-[11px] md:text-[11.5px]">
      <Cap>doc_sequences</Cap>
      <div className="mt-2 border border-[var(--erp-hair)]">
        <div className="grid grid-cols-[1fr_3.2rem_5rem] gap-2 border-b border-[var(--erp-hair)] bg-shell/50 px-2 py-1 text-faint">
          <span>doc_type</span>
          <span>year</span>
          <span className="text-end">last_number</span>
        </div>
        {[
          ["avoir", "2026", "31"],
          ["purchase_order", "2026", "57"],
        ].map(([t, y, n]) => (
          <div key={t} className="grid grid-cols-[1fr_3.2rem_5rem] gap-2 border-b border-[var(--erp-hair)] px-2 py-1 text-graphite">
            <span>{t}</span>
            <span>{y}</span>
            <span className="text-end">{n}</span>
          </div>
        ))}
        <div className="grid grid-cols-[1fr_3.2rem_5rem] gap-2 bg-[var(--erp-signal-soft)] px-2 py-1 text-ink">
          <span>facture</span>
          <span>2026</span>
          <span className="relative text-end">
            <span className="absolute end-0" style={{ opacity: inv(seg("--b1", 0.36, 0.42)) }}>
              213
            </span>
            <span className="text-signal-deep" style={{ opacity: seg("--b1", 0.36, 0.42) }}>
              214
            </span>
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-1 border-s-2 border-[var(--erp-hair-2)] ps-3 text-graphite">
        <p style={step(0.08)}>BEGIN</p>
        <p style={step(0.18)}>
          INSERT OR IGNORE <span className="text-faint">(facture, 2026, 0)</span>
        </p>
        <p style={step(0.3)}>
          UPDATE <span className="text-faint">… last_number = last_number + 1</span>
        </p>
        <p style={step(0.44)}>
          SELECT last_number <span className="text-signal-deep">→ 214</span>
        </p>
        <p style={step(0.54)}>COMMIT</p>
      </div>

      <div className="mt-3 grid gap-1.5">
        <div className="flex items-center justify-between gap-2 border border-[var(--erp-hair)] px-2 py-1.5" style={rise("--b1", 0.58, 0.7, 6)}>
          <span className="text-faint">{tx({ en: "terminal 1", fr: "poste 1", ar: "الجهاز 1" })}</span>
          <span className="text-signal-deep">FACT-2026-000214</span>
        </div>
        <div className="flex items-center justify-between gap-2 border border-dashed border-[var(--erp-hair-2)] px-2 py-1.5" style={rise("--b1", 0.7, 0.82, 6)}>
          <span className="text-faint">
            {tx({ en: "terminal 2 · waited for the lock", fr: "poste 2 · a attendu le verrou", ar: "الجهاز 2 · انتظر القفل" })}
          </span>
          <span className="shrink-0 whitespace-nowrap text-ink">FACT-2026-000215</span>
        </div>
      </div>
    </div>
  );
}

function JournalPanel() {
  const tx = useTx();
  const { beat } = useScene();
  /** Lines stand dimmed as the mapping, then light up one by one as the invoice posts them. */
  const r = (i: number): CSSProperties => ({ opacity: lerp(seg("--b2", 0.04 + i * 0.09, 0.14 + i * 0.09), 0.2, 1) });
  /** Settlement lines wait, dimmed, under the sales journal until payment arrives (beat 3). */
  const pay = (a: number, b: number): CSSProperties => ({ opacity: lerp(seg("--b3", a, b), 0.22, 1) });
  return (
    <div className="erp-mono text-[10.5px] md:text-[11px]">
      <div className="flex items-baseline justify-between gap-2">
        <Cap>{tx({ en: "Journal des ventes · 2026-03", fr: "Journal des ventes · 2026-03", ar: "Journal des ventes · 2026-03" })}</Cap>
        <span className="hidden text-[10px] text-faint min-[1400px]:inline">FACT-2026-000214</span>
      </div>
      <div className="mt-2 grid grid-cols-[2.6rem_minmax(0,1fr)_4.4rem_4.4rem] gap-2 border-b border-[var(--erp-hair-2)] pb-1 text-faint">
        <span>{tx({ en: "Acct", fr: "Cpte", ar: "Cpte" })}</span>
        <span>{tx({ en: "Label", fr: "Libellé", ar: "Libellé" })}</span>
        <span className="text-end">{tx({ en: "Debit", fr: "Débit", ar: "Débit" })}</span>
        <span className="text-end">{tx({ en: "Credit", fr: "Crédit", ar: "Crédit" })}</span>
      </div>
      <JRow acc="411" label="Clients · Démo Nord" d={INV.total} style={r(0)} />
      <JRow acc="70" label="Ventes HT" c={INV.ht} style={r(1)} />
      <JRow acc="4457" label="TVA collectée" c={INV.tva} style={r(2)} />
      <JRow acc="4456" label="Droit de timbre" c={INV.timbre} style={r(3)} />
      <div
        className="grid grid-cols-[2.6rem_minmax(0,1fr)_4.4rem_4.4rem] gap-2 border-b border-ink py-1.5 text-ink"
        style={r(4)}
      >
        <span>Σ</span>
        <span className="text-faint">{tx({ en: "balance", fr: "équilibre", ar: "التوازن" })}</span>
        <span className="text-end tnum">{da(INV.total)}</span>
        <span className="text-end tnum">{da(INV.total)}</span>
      </div>
      <div className="mt-1.5 flex items-center justify-end gap-2" style={r(5)}>
        <span className="text-faint">{tx({ en: "difference", fr: "écart", ar: "الفرق" })}</span>
        <span className="bg-[var(--erp-signal-soft)] px-1.5 py-0.5 text-signal-deep">0,00 ✓</span>
      </div>

      <div className="mt-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
          <Cap className="whitespace-nowrap">{tx({ en: "Journal de caisse · settlement", fr: "Journal de caisse · règlement", ar: "Journal de caisse · règlement" })}</Cap>
          <span className={`whitespace-nowrap text-[10px] ${beat >= 3 ? "text-signal-deep" : "text-faint"}`}>
            {beat >= 3 ? tx({ en: "paid · cash", fr: "réglé · espèces", ar: "مدفوع · نقدًا" }) : tx({ en: "awaiting payment", fr: "en attente du règlement", ar: "في انتظار الدفع" })}
          </span>
        </div>
        <div className="mt-1">
          <JRow acc="53" label="Caisse" d={INV.total} style={pay(0.05, 0.2)} />
          <JRow acc="411" label="Clients" c={INV.total} style={pay(0.15, 0.3)} />
        </div>
        <div className="mt-2.5 hidden overflow-hidden border border-dashed border-[var(--erp-hair-2)] bg-paper/70 px-2 py-1.5 md:block text-[10px] leading-relaxed text-graphite" style={pay(0.35, 0.55)}>
          <p className="break-all text-faint">Date;Pièce;Client;NIF;Compte client;HT;Compte vente;TVA;Compte TVA;Timbre;TTC</p>
          <p className="break-all">2026-03-14;FACT-2026-000214;SARL Démo Nord;…;411;52500.00;70;8500.00;4457;915.00;61915.00</p>
          <p className="mt-0.5 truncate border-t border-dashed border-[var(--erp-hair)] pt-0.5" style={{ opacity: lerp(seg("--b3", 0.5, 0.65), 0.2, 1) }}>
            <span className="text-faint">{tx({ en: "cell", fr: "cellule", ar: "خانة" })} </span>
            =HYPERLINK(…) <span className="text-signal-deep">→ &apos;=HYPERLINK(…)</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 2 — TVA, stamp duty, G50                                      */
/* ------------------------------------------------------------------ */

function TaxScene() {
  const tx = useTx();
  return (
    <Scene id="pos-tax" beats={3} length={55} label={tx({ en: "Tax", fr: "Fiscalité", ar: "الجباية" })}>
      <SceneLayout flip copy={<SceneCopy beats={TAX_BEATS} />} figure={<TaxFigure />} />
      <LightUp nodes={["tax"]} at={0.7} />
    </Scene>
  );
}

function TaxFigure() {
  const tx = useTx();
  return (
    <Figure
      fig="FIG. 02.2"
      title={{ en: "TVA · timbre · G50", fr: "TVA · timbre · G50", ar: "TVA · timbre · G50" }}
      className="w-full max-w-[40rem] [contain:inline-size]"
      bodyClassName="p-3 md:p-5 max-h-[50svh] overflow-hidden md:max-h-none"
    >
      <AtStack className="grid-cols-[minmax(0,1fr)]">
        <At from={0} to={0}>
          <RateSplit />
        </At>
        <At from={1} to={1}>
          <Timbre />
        </At>
        <At from={2} to={2}>
          <G50 />
        </At>
      </AtStack>
      <p className="erp-mono mt-3 text-[10px] text-faint">
        {tx({ en: "Demo figures, computed with the product's rules.", fr: "Chiffres de démonstration, calculés avec les règles du produit.", ar: "أرقام توضيحية محسوبة بقواعد البرنامج." })}
      </p>
    </Figure>
  );
}

function RateSplit() {
  const tx = useTx();
  const rows = [
    { rate: "19 %", base: 40000, tva: 7600 },
    { rate: "9 %", base: 10000, tva: 900 },
    { rate: "0 %", base: 2500, tva: 0 },
  ];
  /** Base + its TVA must fit the track: the widest row is 40 000 + 7 600. */
  const max = 47600;
  return (
    <div className="erp-mono text-[11px] md:text-[12px]">
      <Cap>FACT-2026-000214 · {tx({ en: "base and TVA per rate", fr: "base et TVA par taux", ar: "القاعدة والرسم حسب النسبة" })}</Cap>
      <div className="mt-4 space-y-4">
        {rows.map((r, i) => (
          <div key={r.rate}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-ink">TVA {r.rate}</span>
              <span className="text-graphite">
                {da(r.base)} <span className="text-faint">HT →</span> <span className="text-signal-deep">{da(r.tva)}</span>
              </span>
            </div>
            <div className="relative mt-1.5 h-3 bg-shell/60">
              <span
                className="absolute inset-y-0 start-0 origin-left bg-ink"
                style={{ width: `${(r.base / max) * 100}%`, transform: `scaleX(${seg("--b0", 0.05 + i * 0.12, 0.3 + i * 0.12)})` }}
              />
              <span
                className="absolute inset-y-0 origin-left bg-signal"
                style={{
                  left: `${(r.base / max) * 100}%`,
                  width: `${(r.tva / max) * 100}%`,
                  transform: `scaleX(${seg("--b0", 0.35 + i * 0.12, 0.55 + i * 0.12)})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-px border border-[var(--erp-hair)] bg-[var(--erp-hair)]" style={rise("--b0", 0.6, 0.8, 8)}>
        {[
          ["Σ HT", INV.ht],
          ["Σ TVA", INV.tva],
          ["TTC", INV.ttc],
        ].map(([k, v]) => (
          <div key={k as string} className="bg-paper px-3 py-2">
            <p className="text-[10px] text-faint">{k}</p>
            <p className="mt-0.5 text-ink">{da(v as number)}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 border-s-2 border-signal/70 ps-3 text-graphite" style={rise("--b0", 0.7, 0.9, 8)}>
        <p>
          {tx({ en: "price typed TTC", fr: "prix saisi TTC", ar: "سعر مُدخل TTC" })} : HT = TTC ÷ (1 + {tx({ en: "rate", fr: "taux", ar: "النسبة" })})
        </p>
        <p className="text-faint">
          {tx({ en: "IFU regime → rate 0, documents unchanged", fr: "régime IFU → taux 0, documents inchangés", ar: "نظام IFU ← نسبة 0، والوثائق كما هي" })}
        </p>
      </div>
    </div>
  );
}

function Timbre() {
  const tx = useTx();
  const brackets = [
    { k: "≤ 300", v: tx({ en: "exempt", fr: "exonéré", ar: "معفى" }) },
    { k: "≤ 30 000", v: "1 %" },
    { k: "≤ 100 000", v: "1,5 %", on: true },
    { k: "> 100 000", v: "2 %" },
  ];
  return (
    <div className="erp-mono text-[11px] md:text-[12px]">
      <Cap>computeTimbre(TTC) · {tx({ en: "cash settlement", fr: "règlement en espèces", ar: "تسوية نقدية" })}</Cap>
      <div className="mt-3 grid grid-cols-4 gap-px border border-[var(--erp-hair)] bg-[var(--erp-hair)]">
        {brackets.map((b) => (
          <div key={b.k} className={`px-2 py-2 ${b.on ? "bg-[var(--erp-signal-soft)]" : "bg-paper"}`}>
            <p className="text-[10px] text-faint">{b.k}</p>
            <p className={`mt-0.5 ${b.on ? "text-signal-deep" : "text-ink"}`}>{b.v}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-2.5 text-graphite">
        <div className="flex justify-between gap-3" style={dim("--b1", 0.1, 0.25)}>
          <span className="text-faint">TTC</span>
          <span>{da(INV.ttc)}</span>
        </div>
        <div className="flex justify-between gap-3" style={dim("--b1", 0.25, 0.4)}>
          <span className="text-faint">{tx({ en: "tranches", fr: "tranches", ar: "الشرائح" })}</span>
          <span>⌈ 61 000 ÷ 100 ⌉ = 610</span>
        </div>
        <div className="flex justify-between gap-3" style={dim("--b1", 0.4, 0.55)}>
          <span className="text-faint">{tx({ en: "duty", fr: "droit", ar: "الحق" })}</span>
          <span>610 × 100 × 1,5 %</span>
        </div>
        <div className="flex justify-between gap-3" style={dim("--b1", 0.5, 0.62)}>
          <span className="text-faint">{tx({ en: "floor · cap", fr: "plancher · plafond", ar: "الحد الأدنى · السقف" })}</span>
          <span>5 · 10 000</span>
        </div>
        <div className="flex justify-between gap-3 border-t border-ink pt-2 text-ink" style={dim("--b1", 0.6, 0.75)}>
          <span>{tx({ en: "droit de timbre", fr: "droit de timbre", ar: "حقوق الطابع" })} → 4456</span>
          <span className="bg-[var(--erp-signal-soft)] px-1.5 text-signal-deep">{da(INV.timbre)}</span>
        </div>
      </div>
      <p className="mt-4 text-[10.5px] text-faint" style={dim("--b1", 0.75, 0.9)}>
        {tx({
          en: "Cash total rounded to the nearest 5 DA — 1 and 2 DA coins are scarce.",
          fr: "Total espèces arrondi aux 5 DA — les pièces de 1 et 2 DA sont rares.",
          ar: "يُدوَّر المبلغ النقدي إلى أقرب 5 دج — قطع 1 و2 دج نادرة.",
        })}
      </p>
    </div>
  );
}

function G50() {
  const tx = useTx();
  const rows: { k: string; v: number; lit?: boolean; strong?: boolean }[] = [
    { k: "TVA collectée 19 % (base 1 240 000,00)", v: 235600 },
    { k: "TVA collectée 9 % (base 310 000,00)", v: 27900 },
    { k: "TVA collectée 0 % (base 58 000,00)", v: 0 },
    { k: "TVA collectée totale", v: 263500, strong: true },
    { k: "TVA déductible", v: 171000 },
    { k: "TVA nette à payer", v: 92500, lit: true },
    { k: "Crédit de TVA", v: 0 },
    { k: "Droit de timbre", v: 6385 },
    { k: "IRG salaires", v: 18276 },
  ];
  return (
    <div className="erp-mono text-[10.5px] md:text-[11.5px]">
      <div className="flex items-baseline justify-between gap-2">
        <Cap>G50 · 2026-03</Cap>
        <span className="text-[10px] text-faint">Rubrique ; Montant</span>
      </div>
      <div className="mt-2">
        {rows.map((r, i) => (
          <div
            key={r.k}
            className={`flex justify-between gap-3 border-b border-[var(--erp-hair)] py-1 ${r.strong ? "text-ink" : "text-graphite"}`}
            style={dim("--b2", 0.04 + i * 0.065, 0.14 + i * 0.065)}
          >
            <span className="truncate">{r.k}</span>
            <span className={`tnum ${r.lit ? "bg-[var(--erp-signal-soft)] px-1.5 text-signal-deep" : ""}`}>{da(r.v)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5" style={rise("--b2", 0.7, 0.85, 6)}>
        {["G50", "état 104", "Jibaya'tic CSV", "liasse fiscale", "CMUP"].map((k) => (
          <span key={k} className="border border-[var(--erp-hair-2)] px-1.5 py-0.5 text-[10px] text-ink">
            {k}
          </span>
        ))}
        <span className="px-1 py-0.5 text-[10px] text-faint">
          → {tx({ en: "accountant files", fr: "le comptable dépose", ar: "المحاسب يصرّح" })}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 3 — payroll                                                   */
/* ------------------------------------------------------------------ */

const PAY = {
  base: 55000,
  allow: 5000,
  gross: 60000,
  cnasE: 5400,
  taxable: 54600,
  irg: 6092,
  net: 48508,
  cnasR: 15300,
  cost: 75300,
  slices: [
    { r: "0 – 30 000", p: "0 %", v: 0 },
    { r: "30 000 – 35 000", p: "20 %", v: 1000 },
    { r: "35 000 – 40 000", p: "23 %", v: 1150 },
    { r: "40 000 – 54 600", p: "27 %", v: 3942 },
  ],
};

/** The employer cost, split by who receives it: 48 508 + 20 700 + 6 092 = 75 300. */
const SPLIT: { k: string; v: number; bar: string; l: L }[] = [
  { k: "net", v: PAY.net, bar: "bg-ink", l: { en: "employee · net pay", fr: "salarié · net à payer", ar: "العامل · الصافي" } },
  { k: "cnas", v: PAY.cnasE + PAY.cnasR, bar: "bg-steel", l: { en: "CNAS · 9 % + 25,5 %", fr: "CNAS · 9 % + 25,5 %", ar: "CNAS · 9 % + 25,5 %" } },
  { k: "irg", v: PAY.irg, bar: "bg-signal", l: { en: "IRG withheld → G50", fr: "IRG retenu → G50", ar: "IRG المقتطعة → G50" } },
];

/** Payroll employer column: visible but dimmed until beat 1 lights it. */
const ghost = (a: number, b: number): CSSProperties => ({ opacity: lerp(seg("--b1", a, b), 0.28, 1) });

function PayrollScene() {
  const tx = useTx();
  return (
    <Scene id="pos-payroll" beats={2} length={55} label={tx({ en: "Payroll", fr: "Paie", ar: "الأجور" })}>
      <SceneLayout copy={<SceneCopy beats={PAYROLL_BEATS} />} figure={<PayrollFigure />} />
      <LightUp nodes={["payroll"]} at={0.35} />
    </Scene>
  );
}

function Step({
  sign,
  k,
  v,
  style,
  strong,
  lit,
}: {
  sign: string;
  k: string;
  v: number;
  style?: CSSProperties;
  strong?: boolean;
  lit?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[1.2rem_1fr_auto] items-baseline gap-2 border-b py-1.5 ${
        strong ? "border-ink text-ink" : "border-[var(--erp-hair)] text-graphite"
      }`}
      style={style}
    >
      <span className="text-faint">{sign}</span>
      <span className="truncate">{k}</span>
      <span className={`tnum ${lit ? "bg-[var(--erp-signal-soft)] px-1.5 text-signal-deep" : ""}`}>{da(v)}</span>
    </div>
  );
}

function PayrollFigure() {
  const tx = useTx();
  const { beat } = useScene();
  return (
    <Figure
      fig="FIG. 02.3"
      title={{ en: "Bulletin de paie · 2026-03", fr: "Bulletin de paie · 2026-03", ar: "Bulletin de paie · 2026-03" }}
      className="w-full max-w-[42rem] [contain:inline-size]"
      bodyClassName="grid max-h-[50svh] overflow-hidden md:max-h-none md:grid-cols-2"
    >
      <div className={`erp-mono p-3 text-[11px] md:p-4 md:text-[12px] ${beat >= 1 ? "hidden md:block" : ""}`}>
        <Cap>{tx({ en: "Employee side", fr: "Côté salarié", ar: "جهة العامل" })}</Cap>
        <div className="mt-2">
          <Step sign="" k="Salaire de base" v={PAY.base} style={rise("--b0", 0.02, 0.12, 6)} />
          <Step sign="+" k="Indemnités" v={PAY.allow} style={rise("--b0", 0.08, 0.18, 6)} />
          <Step sign="=" k="Brut" v={PAY.gross} strong style={rise("--b0", 0.14, 0.24, 6)} />
          <Step sign="−" k="CNAS salarié 9 %" v={PAY.cnasE} style={rise("--b0", 0.22, 0.32, 6)} />
          <Step sign="=" k="Imposable" v={PAY.taxable} strong style={rise("--b0", 0.3, 0.4, 6)} />
          <div className="my-2 border border-dashed border-[var(--erp-hair-2)] px-2 py-1.5 text-[10.5px]" style={rise("--b0", 0.38, 0.5, 6)}>
            <p className="text-faint">IRG · {tx({ en: "progressive monthly scale", fr: "barème mensuel progressif", ar: "جدول شهري تصاعدي" })}</p>
            {PAY.slices.map((s, i) => (
              <div key={s.r} className="mt-0.5 grid grid-cols-[1fr_2.6rem_4.4rem] gap-2 text-graphite" style={{ opacity: seg("--b0", 0.42 + i * 0.05, 0.5 + i * 0.05) }}>
                <span>{s.r}</span>
                <span className="text-end">{s.p}</span>
                <span className="text-end tnum">{da(s.v)}</span>
              </div>
            ))}
          </div>
          <Step sign="−" k="IRG" v={PAY.irg} style={rise("--b0", 0.66, 0.76, 6)} />
          <Step sign="=" k="Net à payer" v={PAY.net} strong lit style={rise("--b0", 0.76, 0.88, 6)} />
        </div>
      </div>
      <div className={`erp-mono border-[var(--erp-hair)] p-3 text-[11px] md:border-s md:p-4 md:text-[12px] ${beat === 0 ? "hidden md:block" : ""}`}>
        <Cap>{tx({ en: "Employer side", fr: "Côté employeur", ar: "جهة صاحب العمل" })}</Cap>
        {/* Ghosted while the employee side computes (beat 0), lit row by row in beat 1. */}
        <div className="mt-2">
          <Step sign="" k="Brut" v={PAY.gross} style={ghost(0, 0.08)} />
          <Step sign="+" k="CNAS employeur 25,5 %" v={PAY.cnasR} style={ghost(0.06, 0.16)} />
          <Step sign="+" k="CACOBATPH 12,21 % (BTP)" v={0} style={ghost(0.12, 0.22)} />
          <Step sign="=" k="Coût employeur" v={PAY.cost} strong lit style={ghost(0.2, 0.32)} />
        </div>

        {/* Where the employer cost goes: net is only part of it. */}
        <div className="mt-3">
          <div className="flex items-baseline justify-between gap-2" style={ghost(0.3, 0.4)}>
            <Cap>{tx({ en: "Where the cost goes", fr: "Où va le coût", ar: "إلى أين تذهب الكلفة" })}</Cap>
            <span className="text-[10.5px] text-faint tnum">{da(PAY.cost)}</span>
          </div>
          <div className="relative mt-1.5 flex h-2.5 bg-shell/60">
            {SPLIT.map((s, i) => (
              <span
                key={s.k}
                className={`block h-full origin-left ${s.bar}`}
                style={{ width: `${(s.v / PAY.cost) * 100}%`, transform: `scaleX(${seg("--b1", 0.34 + i * 0.06, 0.44 + i * 0.06)})` }}
              />
            ))}
          </div>
          <div className="mt-1.5">
            {SPLIT.map((s, i) => (
              <div key={s.k} className="grid grid-cols-[0.6rem_1fr_auto] items-center gap-2 py-0.5 text-graphite" style={ghost(0.38 + i * 0.06, 0.46 + i * 0.06)}>
                <span className={`block h-2 w-2 ${s.bar}`} />
                <span className="truncate">{tx(s.l)}</span>
                <span className="tnum">{da(s.v)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* The row it produces: employer cost, not net, dated to the period. */}
        <div className="mt-3 hidden border border-[var(--erp-hair-2)] md:block">
          <div className="flex items-baseline justify-between gap-2 border-b border-[var(--erp-hair)] bg-shell/50 px-2 py-1" style={ghost(0.56, 0.66)}>
            <span className="text-[10.5px] text-faint">{tx({ en: "expenses · posted", fr: "charges · comptabilisé", ar: "الأعباء · مُقيَّد" })}</span>
            <span className="text-[10.5px] text-faint">2026-03-28</span>
          </div>
          <div className="flex items-baseline justify-between gap-2 px-2 py-1.5" style={ghost(0.6, 0.7)}>
            <span className="truncate text-ink">salaires · 2026-03</span>
            <span className="tnum text-signal-deep">{da(PAY.cost)}</span>
          </div>
          <div className="border-t border-dashed border-[var(--erp-hair)] px-2 py-1 text-[10.5px] text-graphite" style={ghost(0.7, 0.82)}>
            <span className="text-faint">UNIQUE (source_type, source_ref) · </span>
            {tx({ en: "2nd post updates this row — never a second wage bill", fr: "2e envoi → même ligne mise à jour, jamais de 2e masse salariale", ar: "الإرسال الثاني يحدّث السطر نفسه — لا كتلة أجور ثانية" })}
          </div>
        </div>
      </div>
    </Figure>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 4 — purchasing, transfers, receivables                        */
/* ------------------------------------------------------------------ */

const TRANSFER_STATES = ["draft", "requested", "approved", "prepared", "shipped", "received"];

function StockScene() {
  const tx = useTx();
  return (
    <Scene id="pos-stock" beats={3} length={55} label={tx({ en: "Stock and purchasing", fr: "Stocks et achats", ar: "المخزون والمشتريات" })}>
      <SceneLayout wide copy={<SceneCopy beats={STOCK_BEATS} />} figure={<StockFigure />} />
      <LightUp nodes={["procurement"]} at={0.18} />
      <LightUp nodes={["inventory"]} at={0.5} />
      <LightUp nodes={["arap"]} at={0.8} />
    </Scene>
  );
}

function StockFigure() {
  return (
    <Figure
      fig="FIG. 02.4"
      title={{ en: "Achats · transferts · créances", fr: "Achats · transferts · créances", ar: "Achats · transferts · créances" }}
      className="w-full [contain:inline-size]"
      bodyClassName="p-3 md:p-5 max-h-[50svh] overflow-hidden md:max-h-none"
    >
      <AtStack className="grid-cols-[minmax(0,1fr)]">
        <At from={0} to={0}>
          <Purchase />
        </At>
        <At from={1} to={1}>
          <Transfer />
        </At>
        <At from={2} to={2}>
          <Aging />
        </At>
      </AtStack>
    </Figure>
  );
}

function Purchase() {
  const tx = useTx();
  const lines = [
    { item: "Article X", ord: 120, rec: 120, pu: 450, landed: 517.5 },
    { item: "Article Y", ord: 60, rec: 40, pu: 1100, landed: 1265 },
  ];
  return (
    <div className="erp-mono text-[11px] md:text-[12px]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Cap>PO-2026-000057 · bon de commande</Cap>
        <span className="border border-[var(--erp-hair-2)] px-1.5 py-0.5 text-[10px] text-signal-deep" style={{ opacity: seg("--b0", 0.3, 0.4) }}>
          {tx({ en: "status: partial", fr: "statut : partial", ar: "الحالة: partial" })}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-[1fr_3.5rem_3.5rem_5rem] gap-2 border-b border-[var(--erp-hair-2)] pb-1 text-faint md:grid-cols-[1fr_4rem_4rem_5.5rem_5.5rem]">
        <span>{tx({ en: "item", fr: "article", ar: "الصنف" })}</span>
        <span className="text-end">{tx({ en: "ordered", fr: "cdé", ar: "مطلوب" })}</span>
        <span className="text-end">{tx({ en: "received", fr: "reçu", ar: "مستلم" })}</span>
        <span className="text-end">PU</span>
        <span className="hidden text-end md:block">{tx({ en: "landed", fr: "revient", ar: "الكلفة" })}</span>
      </div>
      {lines.map((l, i) => (
        <div key={l.item} className="grid grid-cols-[1fr_3.5rem_3.5rem_5rem] gap-2 border-b border-[var(--erp-hair)] py-1.5 text-graphite md:grid-cols-[1fr_4rem_4rem_5.5rem_5.5rem]">
          <span className="text-ink">{l.item}</span>
          <span className="text-end">{l.ord}</span>
          <span className={`text-end ${l.rec < l.ord ? "text-signal-deep" : ""}`} style={{ opacity: seg("--b0", 0.1 + i * 0.1, 0.2 + i * 0.1) }}>
            {l.rec}
          </span>
          <span className="text-end tnum">{da(l.pu)}</span>
          <span className="hidden text-end tnum text-ink md:block" style={{ opacity: seg("--b0", 0.5 + i * 0.06, 0.6 + i * 0.06) }}>
            {da(l.landed)}
          </span>
        </div>
      ))}
      <div className="mt-3 border-s-2 border-signal/70 ps-3 text-graphite" style={rise("--b0", 0.42, 0.55, 6)}>
        <p>
          {tx({ en: "freight + customs", fr: "fret + douane", ar: "الشحن + الجمارك" })} 18 000,00 →{" "}
          {tx({ en: "spread by line value", fr: "réparti au prorata de la valeur", ar: "يُوزَّع حسب قيمة السطر" })}
        </p>
        <p className="text-faint">X 54 000 / 120 000 → 8 100,00 · Y 66 000 / 120 000 → 9 900,00</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-px border border-[var(--erp-hair)] bg-[var(--erp-hair)]" style={rise("--b0", 0.62, 0.78, 6)}>
        {[
          ["60", "Achats HT"],
          ["44566", "TVA déductible"],
          ["401", "Fournisseur TTC"],
        ].map(([a, l]) => (
          <div key={a} className="bg-paper px-2 py-2">
            <p className="text-signal-deep">{a}</p>
            <p className="mt-0.5 text-[10.5px] text-graphite">{l}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10.5px] text-graphite" style={rise("--b0", 0.75, 0.9, 6)}>
        {tx({ en: "CMUP = Σ (qty × cost) ÷ Σ qty", fr: "CMUP = Σ (qté × coût) ÷ Σ qté", ar: "CMUP = Σ (الكمية × الكلفة) ÷ Σ الكمية" })} <span className="text-faint">→ livre d&apos;inventaire</span>
      </p>
    </div>
  );
}

function Transfer() {
  const tx = useTx();
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  useSceneProgress((p) => {
    const b = beatLocal(p, 1, 3);
    const s = Math.min(5, Math.floor(local(b, 0.02, 0.8) * 6));
    if (s !== stepRef.current) {
      stepRef.current = s;
      setStep(s);
    }
  });
  const shipped = step >= 4;
  const received = step >= 5;
  return (
    <div className="erp-mono text-[11px] md:text-[12px]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Cap>TRF-2026-000019</Cap>
        <span className="text-[10px] text-faint">Dépôt Central → Dépôt Est</span>
      </div>
      <StateTrack states={TRANSFER_STATES} active={step} className="mt-4" />
      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-4">
        <div className="border border-[var(--erp-hair-2)] p-2.5">
          <p className="text-[10px] text-faint">Dépôt Central</p>
          <p className="mt-1 text-[1.1rem] text-ink tnum">{shipped ? 260 : 300}</p>
          <p className="text-[10px] text-faint">{shipped ? `−40 · ${tx({ en: "ship", fr: "expédition", ar: "إرسال" })}` : " "}</p>
        </div>
        <div className="flex flex-col items-center px-1 text-center">
          <span className={`border px-2 py-1 text-[10px] transition-colors duration-500 ${shipped && !received ? "border-signal text-signal-deep" : "border-[var(--erp-hair)] text-faint"}`}>
            {tx({ en: "in transit", fr: "en transit", ar: "قيد النقل" })} · {shipped && !received ? 40 : 0}
          </span>
          <svg viewBox="0 0 80 10" className="mt-1 w-16" aria-hidden>
            <path d="M0 5 H74" stroke="currentColor" className={shipped && !received ? "erp-flow text-signal" : "text-faint"} strokeDasharray="4 10" fill="none" />
            <path d="M72 1 L78 5 L72 9" stroke="currentColor" className="text-faint" fill="none" />
          </svg>
        </div>
        <div className="border border-[var(--erp-hair-2)] p-2.5">
          <p className="text-[10px] text-faint">Dépôt Est</p>
          <p className="mt-1 text-[1.1rem] text-ink tnum">{received ? 50 : 12}</p>
          <p className="text-[10px] text-faint">{received ? `+38 · ${tx({ en: "receive", fr: "réception", ar: "استلام" })}` : " "}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-px border border-[var(--erp-hair)] bg-[var(--erp-hair)]">
        {[
          { k: tx({ en: "requested", fr: "demandé", ar: "مطلوب" }), v: 40, on: step >= 1 },
          { k: tx({ en: "shipped", fr: "expédié", ar: "مُرسل" }), v: 40, on: shipped },
          { k: tx({ en: "received", fr: "reçu", ar: "مستلم" }), v: 38, on: received, lit: true },
        ].map((q) => (
          <div key={q.k} className="bg-paper px-2 py-2">
            <p className="text-[10px] text-faint">{q.k}</p>
            <p className={`mt-0.5 transition-opacity duration-500 ${q.on ? "opacity-100" : "opacity-20"} ${q.lit ? "text-signal-deep" : "text-ink"}`}>{q.v}</p>
          </div>
        ))}
      </div>
      <p className={`mt-2 text-[10.5px] transition-opacity duration-500 ${received ? "text-graphite opacity-100" : "opacity-0"}`}>
        {tx({ en: "discrepancy 2 — visible, not absorbed", fr: "écart 2 — visible, pas absorbé", ar: "فرق 2 — ظاهر، لا مُمتصّ" })}
      </p>
    </div>
  );
}

function Aging() {
  const tx = useTx();
  const buckets = [
    { k: tx({ en: "current", fr: "courant", ar: "جارية" }), v: 184000 },
    { k: "1–30", v: 126500 },
    { k: "31–60", v: 61915 },
    { k: "61–90", v: 38000 },
    { k: "90+", v: 22400, lit: true },
  ];
  const max = 184000;
  return (
    <div className="erp-mono text-[11px] md:text-[12px]">
      <Cap>{tx({ en: "Receivables aging · per client", fr: "Balance âgée · par client", ar: "أقدمية الديون · لكل زبون" })}</Cap>
      <div className="mt-3 flex h-[7.5rem] items-end gap-2 border-b border-ink md:h-[9rem]">
        {buckets.map((b, i) => (
          <div key={b.k} className="flex h-full flex-1 flex-col justify-end">
            <span className="mb-1 text-center text-[10px] text-graphite tnum" style={{ opacity: seg("--b2", 0.2 + i * 0.07, 0.3 + i * 0.07) }}>
              {Math.round(b.v / 1000)}k
            </span>
            <span
              className={`block origin-bottom ${b.lit ? "bg-signal" : "bg-ink"}`}
              style={{ height: `${(b.v / max) * 100}%`, transform: `scaleY(${seg("--b2", 0.05 + i * 0.07, 0.25 + i * 0.07)})` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-2">
        {buckets.map((b) => (
          <span key={b.k} className="flex-1 truncate text-center text-[10px] text-faint">
            {b.k}
          </span>
        ))}
      </div>
      <div className="mt-4" style={rise("--b2", 0.5, 0.65, 6)}>
        <Cap>{tx({ en: "Post-dated cheques", fr: "Chèques post-datés", ar: "الشيكات المؤجلة" })}</Cap>
        <div className="mt-1.5">
          {[
            { dir: "incoming", party: "SARL Démo Nord", due: "2026-04-30", amt: 61915, st: "pending" },
            { dir: "outgoing", party: "Fournisseur Démo", due: "2026-05-15", amt: 142800, st: "pending" },
          ].map((c) => (
            <div key={c.dir} className="grid grid-cols-[4.6rem_1fr_5.6rem] gap-2 border-b border-[var(--erp-hair)] py-1 text-graphite md:grid-cols-[4.6rem_1fr_5.4rem_5.6rem]">
              <span className={c.dir === "incoming" ? "text-signal-deep" : "text-ink"}>{c.dir === "incoming" ? tx({ en: "incoming", fr: "reçu", ar: "وارد" }) : tx({ en: "outgoing", fr: "émis", ar: "صادر" })}</span>
              <span className="truncate">{c.party}</span>
              <span className="hidden text-faint md:block">{c.due}</span>
              <span className="text-end tnum">{da(c.amt)}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-2 text-[10.5px] text-faint" style={rise("--b2", 0.7, 0.85, 6)}>
        {tx({
          en: "Age measured from the due date; partial payments reduce the outstanding line.",
          fr: "Ancienneté mesurée depuis l'échéance ; les paiements partiels réduisent le reste dû.",
          ar: "تُقاس الأقدمية من تاريخ الاستحقاق؛ والدفعات الجزئية تُنقص المبلغ المتبقّي.",
        })}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 5 — sync                                                      */
/* ------------------------------------------------------------------ */

function SyncScene() {
  const tx = useTx();
  return (
    <Scene id="pos-sync" beats={2} length={55} label={tx({ en: "Sync", fr: "Synchronisation", ar: "المزامنة" })}>
      <SceneLayout copy={<SceneCopy beats={SYNC_BEATS} />} figure={<SyncFigure />} />
    </Scene>
  );
}

function SyncFigure() {
  const tx = useTx();
  const qRef = useRef<SVGTextElement>(null);
  const qBar = useRef<SVGRectElement>(null);
  const qRefM = useRef<SVGTextElement>(null);
  const qBarM = useRef<SVGRectElement>(null);
  useSceneProgress((p) => {
    const b = beatLocal(p, 1, 2);
    const q = b < 0.7 ? 37 * local(b, 0.12, 0.6) : 37 * (1 - local(b, 0.74, 0.92));
    const n = Math.round(q);
    for (const t of [qRef.current, qRefM.current]) if (t) t.textContent = String(n);
    if (qBar.current) qBar.current.setAttribute("width", String((n / 37) * 120));
    if (qBarM.current) qBarM.current.setAttribute("width", String((n / 37) * 110));
  });
  const off = win("--b1", 0.08, 0.74, 0.06, 0.04);
  const on = inv(off);
  const terminals = [
    { y: 60, l: tx({ en: "Terminal 2", fr: "Poste 2", ar: "الجهاز 2" }) },
    { y: 150, l: tx({ en: "Terminal 3", fr: "Poste 3", ar: "الجهاز 3" }) },
    { y: 240, l: tx({ en: "Mobile · LAN", fr: "Mobile · LAN", ar: "جوّال · LAN" }) },
  ];
  const cloud = [
    { y: 85, l: tx({ en: "Relay · Firestore", fr: "Relais · Firestore", ar: "وسيط · Firestore" }), s: "delta · updatedAt" },
    { y: 215, l: tx({ en: "Mirror · PostgreSQL", fr: "Miroir · PostgreSQL", ar: "مرآة · PostgreSQL" }), s: tx({ en: "read-only · upsert", fr: "lecture seule · upsert", ar: "قراءة فقط · upsert" }) },
  ];
  return (
    <Figure
      fig="FIG. 02.5"
      title={{ en: "LAN · relay · mirror", fr: "LAN · relais · miroir", ar: "LAN · وسيط · مرآة" }}
      className="w-full max-w-[44rem] [contain:inline-size]"
      bodyClassName="p-2 md:p-4"
    >
      {/* Phone: the same topology stacked vertically, so labels stay ≥ 11px. */}
      <svg viewBox="0 0 360 334" className="h-auto max-h-[46svh] w-full md:hidden" role="img" aria-label={tx({ en: "Sync topology", fr: "Topologie de synchronisation", ar: "بنية المزامنة" })}>
        {[64, 180, 296].map((x) => (
          <g key={x}>
            <path d={`M${x} 44 C ${x} 80, 105 74, 105 112`} fill="none" stroke="var(--erp-hair-2)" />
            <path d={`M${x} 44 C ${x} 80, 105 74, 105 112`} fill="none" stroke="var(--color-signal)" strokeDasharray="4 10" className="erp-flow" />
          </g>
        ))}
        {terminals.map((t, i) => (
          <g key={t.l}>
            <rect x={6 + i * 117} y="8" width="114" height="36" fill="var(--color-paper)" stroke="var(--erp-hair-2)" />
            <text x={63 + i * 117} y="31" textAnchor="middle" className="erp-mono" fontSize="12" fill="var(--color-ink)">
              {t.l}
            </text>
          </g>
        ))}
        <text x="354" y="92" textAnchor="end" className="erp-mono" fontSize="11.5" fill="var(--color-faint)">
          LAN · HTTP + SSE
        </text>

        {[91, 269].map((x, i) => (
          <g key={x}>
            <path d={`M105 210 C 105 244, ${x} 242, ${x} 278`} fill="none" stroke="var(--erp-hair-2)" strokeDasharray="3 5" />
            <path d={`M105 210 C 105 244, ${x} 242, ${x} 278`} fill="none" stroke="var(--color-signal)" strokeDasharray="4 10" className="erp-flow" style={{ opacity: on }} />
            <rect x={8 + i * 178} y="278" width="166" height="50" fill="var(--color-paper)" stroke="var(--erp-hair-2)" />
            <text x={91 + i * 178} y="299" textAnchor="middle" className="erp-mono" fontSize="12" fill="var(--color-ink)">
              {cloud[i].l}
            </text>
            <text x={91 + i * 178} y="317" textAnchor="middle" className="erp-mono" fontSize="11.5" fill="var(--color-faint)">
              {cloud[i].s}
            </text>
          </g>
        ))}
        <g style={{ opacity: off }}>
          <line x1="170" y1="230" x2="190" y2="256" stroke="var(--color-signal)" strokeWidth="2" />
          <line x1="190" y1="230" x2="170" y2="256" stroke="var(--color-signal)" strokeWidth="2" />
          <text x="162" y="248" textAnchor="end" className="erp-mono" fontSize="11.5" fill="var(--color-signal)">
            {tx({ en: "offline", fr: "hors ligne", ar: "دون اتصال" })}
          </text>
        </g>
        <text x="354" y="248" textAnchor="end" className="erp-mono" fontSize="11.5" fill="var(--color-faint)">
          {tx({ en: "internet", fr: "internet", ar: "الإنترنت" })}
        </text>

        <rect x="20" y="112" width="170" height="98" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="1.5" />
        <text x="105" y="136" textAnchor="middle" className="erp-mono" fontSize="13" fontWeight="600" fill="var(--color-ink)">
          {tx({ en: "Desktop", fr: "Poste principal", ar: "الحاسوب الرئيسي" })}
        </text>
        <text x="105" y="155" textAnchor="middle" className="erp-mono" fontSize="11.5" fill="var(--color-graphite)">
          SQLite · Fastify
        </text>
        <text x="105" y="176" textAnchor="middle" className="erp-mono" fontSize="11.5" fill="var(--color-signal-deep)">
          {tx({ en: "system of record", fr: "système de référence", ar: "نظام المرجع" })}
        </text>
        <text x="105" y="196" textAnchor="middle" className="erp-mono" fontSize="11.5" fill="var(--color-faint)">
          {tx({ en: "N° · TVA · journals", fr: "N° · TVA · journaux", ar: "الأرقام · TVA · اليوميات" })}
        </text>

        <g style={{ opacity: seg("--b1", 0.05, 0.14) }}>
          <text x="210" y="140" className="erp-mono" fontSize="11.5" fill="var(--color-faint)">
            {tx({ en: "sync queue", fr: "file de synchro", ar: "طابور المزامنة" })}
          </text>
          <rect x="210" y="150" width="110" height="10" fill="none" stroke="var(--erp-hair-2)" />
          <rect ref={qBarM} x="210" y="150" width="0" height="10" fill="var(--color-signal)" />
          <text ref={qRefM} x="326" y="159" className="erp-mono" fontSize="12" fill="var(--color-ink)">
            0
          </text>
          <text x="210" y="180" className="erp-mono" fontSize="11.5" fill="var(--color-faint)">
            {tx({ en: "deltas", fr: "deltas", ar: "الفروقات" })}
          </text>
        </g>
      </svg>

      <svg viewBox="0 0 660 310" className="hidden h-auto w-full md:block" role="img" aria-label={tx({ en: "Sync topology", fr: "Topologie de synchronisation", ar: "بنية المزامنة" })}>
        {/* LAN links */}
        {terminals.map((t) => (
          <g key={t.l}>
            <path d={`M150 ${t.y} C 200 ${t.y}, 210 150, 255 150`} fill="none" stroke="var(--erp-hair-2)" />
            <path d={`M150 ${t.y} C 200 ${t.y}, 210 150, 255 150`} fill="none" stroke="var(--color-signal)" strokeDasharray="4 10" className="erp-flow" />
            <rect x="20" y={t.y - 20} width="130" height="40" fill="var(--color-paper)" stroke="var(--erp-hair-2)" />
            <text x="85" y={t.y + 4} textAnchor="middle" className="erp-mono" fontSize="12" fill="var(--color-ink)">
              {t.l}
            </text>
          </g>
        ))}
        <text x="205" y="292" textAnchor="middle" className="erp-mono" fontSize="11" fill="var(--color-faint)">
          LAN · HTTP + SSE
        </text>

        {/* cloud links */}
        {cloud.map((c) => (
          <g key={c.l}>
            <path d={`M405 150 C 450 150, 455 ${c.y}, 490 ${c.y}`} fill="none" stroke="var(--erp-hair-2)" strokeDasharray="3 5" />
            <path
              d={`M405 150 C 450 150, 455 ${c.y}, 490 ${c.y}`}
              fill="none"
              stroke="var(--color-signal)"
              strokeDasharray="4 10"
              className="erp-flow"
              style={{ opacity: on }}
            />
            <rect x="490" y={c.y - 24} width="164" height="48" fill="var(--color-paper)" stroke="var(--erp-hair-2)" />
            <text x="572" y={c.y - 3} textAnchor="middle" className="erp-mono" fontSize="12" fill="var(--color-ink)">
              {c.l}
            </text>
            <text x="572" y={c.y + 14} textAnchor="middle" className="erp-mono" fontSize="11" fill="var(--color-faint)">
              {c.s}
            </text>
          </g>
        ))}
        <g style={{ opacity: off }}>
          <line x1="440" y1="128" x2="462" y2="172" stroke="var(--color-signal)" strokeWidth="2" />
          <line x1="462" y1="128" x2="440" y2="172" stroke="var(--color-signal)" strokeWidth="2" />
          <text x="451" y="196" textAnchor="middle" className="erp-mono" fontSize="11" fill="var(--color-signal)">
            {tx({ en: "offline", fr: "hors ligne", ar: "دون اتصال" })}
          </text>
        </g>
        <text x="520" y="292" textAnchor="middle" className="erp-mono" fontSize="11" fill="var(--color-faint)">
          {tx({ en: "internet", fr: "internet", ar: "الإنترنت" })}
        </text>

        {/* system of record */}
        <rect x="255" y="100" width="150" height="100" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="1.5" />
        <text x="330" y="128" textAnchor="middle" className="erp-mono" fontSize="12.5" fontWeight="600" fill="var(--color-ink)">
          {tx({ en: "Desktop", fr: "Poste principal", ar: "الحاسوب الرئيسي" })}
        </text>
        <text x="330" y="146" textAnchor="middle" className="erp-mono" fontSize="11" fill="var(--color-graphite)">
          SQLite · Fastify
        </text>
        <text x="330" y="168" textAnchor="middle" className="erp-mono" fontSize="10.5" fill="var(--color-signal-deep)">
          {tx({ en: "system of record", fr: "système de référence", ar: "نظام المرجع" })}
        </text>
        <text x="330" y="187" textAnchor="middle" className="erp-mono" fontSize="11" fill="var(--color-faint)">
          {tx({ en: "N° · TVA · journals", fr: "N° · TVA · journaux", ar: "الأرقام · TVA · اليوميات" })}
        </text>

        {/* outbound queue */}
        <g style={{ opacity: seg("--b1", 0.05, 0.14) }}>
          <text x="270" y="232" className="erp-mono" fontSize="10.5" fill="var(--color-faint)">
            {tx({ en: "sync queue", fr: "file de synchro", ar: "طابور المزامنة" })}
          </text>
          <rect x="270" y="240" width="120" height="10" fill="none" stroke="var(--erp-hair-2)" />
          <rect ref={qBar} x="270" y="240" width="0" height="10" fill="var(--color-signal)" />
          <text ref={qRef} x="398" y="249" className="erp-mono" fontSize="11" fill="var(--color-ink)">
            0
          </text>
          <text x="270" y="268" className="erp-mono" fontSize="11" fill="var(--color-faint)">
            {tx({ en: "deltas", fr: "deltas", ar: "الفروقات" })}
          </text>
        </g>
      </svg>
    </Figure>
  );
}

/* ------------------------------------------------------------------ */
/* Walkthrough, decisions, proof                                       */
/* ------------------------------------------------------------------ */

const WALK = [
  {
    actor: { en: "Depot · day 1", fr: "Dépôt · jour 1", ar: "المستودع · اليوم 1" },
    action: {
      en: "Raises a bon de commande for 120 × Article X and 60 × Article Y.",
      fr: "Émet un bon de commande : 120 × Article X et 60 × Article Y.",
      ar: "يُصدر وصل طلب: 120 × الصنف X و60 × الصنف Y.",
    },
    effect: {
      en: "The purchase-order counter for 2026 is incremented inside a transaction. Nothing enters stock yet.",
      fr: "Le compteur des commandes 2026 est incrémenté dans une transaction. Rien n'entre encore en stock.",
      ar: "يُزاد عدّاد طلبيات 2026 داخل معاملة. لا شيء يدخل المخزون بعد.",
    },
    token: "PO-2026-000057",
  },
  {
    actor: { en: "Depot · day 9", fr: "Dépôt · jour 9", ar: "المستودع · اليوم 9" },
    action: {
      en: "Receives 120 of 120 and 40 of 60.",
      fr: "Réceptionne 120 sur 120 et 40 sur 60.",
      ar: "يستلم 120 من 120 و40 من 60.",
    },
    effect: {
      en: "Stock rises by the received quantities only; the order stays partial. Deductible TVA is derived from what arrived.",
      fr: "Le stock n'augmente que des quantités reçues ; la commande reste partielle. La TVA déductible est calculée sur ce qui est arrivé.",
      ar: "يرتفع المخزون بالكميات المستلمة فقط؛ وتبقى الطلبية جزئية. ويُحسب الرسم القابل للخصم على ما وصل.",
    },
    token: "status = partial",
  },
  {
    actor: { en: "Owner", fr: "Gérant", ar: "المسيّر" },
    action: {
      en: "Allocates 18 000,00 DA of freight and customs to the order.",
      fr: "Affecte 18 000,00 DA de fret et de douane à la commande.",
      ar: "يُحمِّل الطلبية 18 000,00 دج من مصاريف الشحن والجمارك.",
    },
    effect: {
      en: "The cost is spread by line value; unit costs become 517,50 and 1 265,00, and the CMUP valuation follows.",
      fr: "Le coût est réparti au prorata de la valeur des lignes ; les coûts unitaires passent à 517,50 et 1 265,00, et la valorisation CMUP suit.",
      ar: "تُوزَّع الكلفة حسب قيمة الأسطر؛ فتصبح كلفة الوحدة 517,50 و1 265,00، ويتبعها تقييم CMUP.",
    },
    token: "60 · 44566 · 401",
  },
  {
    actor: { en: "Owner", fr: "Gérant", ar: "المسيّر" },
    action: {
      en: "Pays the supplier with a cheque dated six weeks ahead.",
      fr: "Règle le fournisseur par un chèque daté de six semaines plus tard.",
      ar: "يدفع للمورد بشيك مؤرَّخ بعد ستة أسابيع.",
    },
    effect: {
      en: "The cheque enters the post-dated register as outgoing, pending until its due date — the payable is visible until it clears.",
      fr: "Le chèque entre au registre des post-datés comme émis, en attente jusqu'à l'échéance — la dette reste visible jusqu'à l'encaissement.",
      ar: "يدخل الشيك سجلّ الشيكات المؤجلة كصادر، معلّقًا حتى تاريخ استحقاقه — ويبقى الدَّين ظاهرًا حتى تحصيله.",
    },
    token: "direction = outgoing",
  },
  {
    actor: { en: "Depot", fr: "Dépôt", ar: "المستودع" },
    action: {
      en: "Ships 40 units to the eastern depot; 38 arrive.",
      fr: "Expédie 40 unités au dépôt Est ; 38 arrivent.",
      ar: "يرسل 40 وحدة إلى المستودع الشرقي؛ تصل منها 38.",
    },
    effect: {
      en: "Source −40 at ship, destination +38 at receive, 2 units of discrepancy on the line. A second click on Recevoir is refused by the state check.",
      fr: "Source −40 à l'expédition, destination +38 à la réception, écart de 2 sur la ligne. Un second clic sur « Recevoir » est refusé par le contrôle d'état.",
      ar: "المصدر −40 عند الإرسال، والوجهة +38 عند الاستلام، وفرق وحدتين على السطر. والنقرة الثانية على «استلام» يرفضها فحص الحالة.",
    },
    token: "TRF-2026-000019",
  },
  {
    actor: { en: "Month end", fr: "Fin de mois", ar: "نهاية الشهر" },
    action: {
      en: "Payslips are computed and posted; the G50, the journals and the Jibaya'tic bundle are exported.",
      fr: "Les bulletins sont calculés et comptabilisés ; la G50, les journaux et l'export Jibaya'tic sont générés.",
      ar: "تُحسب كشوف الأجور وتُقيَّد؛ ثم يُصدَّر G50 واليوميات وملف جباية تيك.",
    },
    effect: {
      en: "Semicolon CSV files land with the accountant: TVA to pay, stamp duty, IRG withheld. The software prepares; the accountant files.",
      fr: "Des CSV à point-virgule arrivent chez le comptable : TVA à payer, timbre, IRG retenu. Le logiciel prépare ; le comptable dépose.",
      ar: "تصل ملفات CSV بفاصلة منقوطة إلى المحاسب: الرسم الواجب، حقوق الطابع، الضريبة المقتطعة. البرنامج يُحضِّر؛ والمحاسب يصرّح.",
    },
    token: "G50 · 2026-03",
  },
];

const DECISIONS = [
  {
    decision: {
      en: "The desktop database is the system of record; the cloud relays and mirrors.",
      fr: "La base du poste principal est le système de référence ; le cloud relaie et duplique.",
      ar: "قاعدة بيانات الحاسوب الرئيسي هي المرجع؛ والسحابة تنقل وتنسخ.",
    },
    alternative: {
      en: "A cloud database as the single source of truth.",
      fr: "Une base cloud comme source unique de vérité.",
      ar: "قاعدة بيانات سحابية كمصدر وحيد للحقيقة.",
    },
    reason: {
      en: "A business must keep issuing numbered, taxed documents when the line drops. Numbering and the TVA recompute stay in one place, so reconnecting cannot fork the books.",
      fr: "Une entreprise doit continuer à émettre des documents numérotés et taxés quand la ligne tombe. Numérotation et recalcul de TVA restent à un seul endroit : la reconnexion ne peut pas dédoubler les livres.",
      ar: "يجب أن تواصل المؤسسة إصدار وثائق مرقّمة ومحسوبة الرسوم حين ينقطع الخط. يبقى الترقيم وإعادة حساب الرسم في مكان واحد، فلا يمكن لإعادة الاتصال أن تشطر الدفاتر.",
    },
  },
  {
    decision: {
      en: "Gap-free counters per document type and year, inside a transaction.",
      fr: "Compteurs sans trou par type de document et par année, dans une transaction.",
      ar: "عدّادات بلا ثغرات لكل نوع وثيقة ولكل سنة، داخل معاملة.",
    },
    alternative: {
      en: "Date-plus-random identifiers, which the early versions used.",
      fr: "Des identifiants date + aléatoire, comme dans les premières versions.",
      ar: "معرّفات بتاريخ + جزء عشوائي، كما في النسخ الأولى.",
    },
    reason: {
      en: "Random identifiers are unique but prove nothing: they cannot show that no invoice is missing. A continuous series can.",
      fr: "Un identifiant aléatoire est unique mais ne prouve rien : il ne montre pas qu'aucune facture ne manque. Une série continue, si.",
      ar: "المعرّف العشوائي فريد لكنه لا يُثبت شيئًا: لا يُظهر أن أي فاتورة لم تُفقد. أمّا السلسلة المتصلة فتُظهر ذلك.",
    },
  },
  {
    decision: {
      en: "Prepare G50, état 104 and Jibaya'tic files for the accountant.",
      fr: "Préparer G50, état 104 et fichiers Jibaya'tic pour le comptable.",
      ar: "تحضير G50 والكشف 104 وملفات جباية تيك للمحاسب.",
    },
    alternative: { en: "Filing declarations automatically.", fr: "Déposer les déclarations automatiquement.", ar: "إيداع التصريحات آليًا." },
    reason: {
      en: "Rates and brackets change with every finance law and the accountant signs. Every rate lives in one place, so confirming a change is a one-line edit.",
      fr: "Taux et tranches changent à chaque loi de finances et c'est le comptable qui signe. Chaque taux vit à un seul endroit : valider un changement est une modification d'une ligne.",
      ar: "تتغير النسب والشرائح مع كل قانون مالية، والمحاسب هو من يوقّع. كل نسبة تعيش في مكان واحد، فالمصادقة على تغيير تعديلُ سطر واحد.",
    },
  },
  {
    decision: {
      en: "Two-phase transfers with three quantities per line, idempotent by state.",
      fr: "Transferts en deux phases, trois quantités par ligne, idempotents par l'état.",
      ar: "تحويلات بمرحلتين وثلاث كميات لكل سطر، ثابتة بالحالة.",
    },
    alternative: {
      en: "An instant move with a received flag.",
      fr: "Un déplacement instantané avec un drapeau « reçu ».",
      ar: "نقل فوري مع علامة «مستلم».",
    },
    reason: {
      en: "An instant move makes stock exist in both depots or in neither. A boolean flag is one forgotten check away from receiving goods twice.",
      fr: "Un déplacement instantané fait exister le stock dans les deux dépôts ou dans aucun. Un booléen n'est qu'à un contrôle oublié d'une double réception.",
      ar: "النقل الفوري يجعل المخزون موجودًا في المستودعين معًا أو في لا أحد منهما. والعلامة المنطقية لا تبعد عن الاستلام المزدوج إلا بفحص منسيّ.",
    },
  },
  {
    decision: {
      en: "Post the employer cost of payroll to expenses.",
      fr: "Passer en charges le coût employeur de la paie.",
      ar: "تقييد كلفة صاحب العمل للأجور في الأعباء.",
    },
    alternative: { en: "Posting net pay.", fr: "Comptabiliser le net à payer.", ar: "تقييد الأجر الصافي." },
    reason: {
      en: "Withheld CNAS and IRG still leave the business, addressed to the state. Posting net would understate the largest cost by about a third.",
      fr: "La CNAS et l'IRG retenus quittent quand même l'entreprise, à destination de l'État. Comptabiliser le net sous-estimerait le premier poste de coût d'environ un tiers.",
      ar: "اقتطاعات CNAS والضريبة تغادر المؤسسة على أي حال، نحو الدولة. تقييد الصافي كان سيُنقص أكبر بند كلفة بنحو الثلث.",
    },
  },
  {
    decision: {
      en: "Server-sent events on the local network.",
      fr: "Des événements serveur (SSE) sur le réseau local.",
      ar: "أحداث يرسلها الخادم (SSE) على الشبكة المحلية.",
    },
    alternative: { en: "WebSockets.", fr: "Des WebSockets.", ar: "WebSockets." },
    reason: {
      en: "The traffic is one-way. SSE rides plain HTTP, inherits the same pairing-token check as every route, and reconnects on its own — no second auth path to get wrong.",
      fr: "Le trafic est à sens unique. SSE passe par HTTP simple, hérite du même contrôle de jeton d'appairage que toutes les routes et se reconnecte seul — pas de second chemin d'authentification à rater.",
      ar: "الحركة أحادية الاتجاه. يمرّ SSE عبر HTTP عادي، ويرث فحص رمز الاقتران نفسه المطبَّق على كل المسارات، ويعيد الاتصال وحده — دون مسار مصادقة ثانٍ قد يُخطأ فيه.",
    },
  },
];

const PROOF = [
  { value: 9, label: { en: "SCF accounts mapped", fr: "comptes SCF mappés", ar: "حسابات محاسبية مربوطة" }, note: "411 · 401 · 70 · 60 · 4457 · 44566 · 53 · 512 · 4456" },
  { value: 3, label: { en: "TVA rates, plus IFU", fr: "taux de TVA, plus IFU", ar: "نسب للرسم + IFU" }, note: "19 % · 9 % · 0 %" },
  { value: 2091, label: { en: "interface lines in French — and in Arabic", fr: "lignes d'interface en français — et en arabe", ar: "سطرًا للواجهة بالفرنسية — ومثلها بالعربية" }, note: "FR · AR (RTL)" },
  { value: 4, label: { en: "roles, with a before/after audit log", fr: "rôles, avec journal d'audit avant/après", ar: "أدوار، مع سجل تدقيق قبل/بعد" }, note: { en: "before → after", fr: "avant → après", ar: "قبل → بعد" } },
  { value: 460, label: { en: "automated tests, about", fr: "tests automatisés, environ", ar: "اختبارًا آليًا تقريبًا" }, note: "CI · gitleaks" },
  { value: 64, label: { en: "database tables, about", fr: "tables, environ", ar: "جدولًا تقريبًا" }, note: "SQLite" },
  { value: 49, label: { en: "schema migrations, about", fr: "migrations de schéma, environ", ar: "ترحيلًا للمخطط تقريبًا" }, note: { en: "versioned", fr: "versionnées", ar: "مُرقّمة الإصدارات" } },
  { value: 5, label: { en: "aging buckets on receivables", fr: "tranches de balance âgée", ar: "شرائح أقدمية" }, note: "0 · 30 · 60 · 90 · 90+" },
];

/* ------------------------------------------------------------------ */
/* Chapter                                                             */
/* ------------------------------------------------------------------ */

export default function PosChapter() {
  const tx = useTx();
  return (
    <>
      <ChapterCover
        n={META.n}
        title={META.title}
        product={META.product}
        oneLiner={COVER.oneLiner}
        context={COVER.context}
        roles={COVER.roles}
        platforms={COVER.platforms}
        nodes={META.nodes}
        facts={COVER.facts}
      />

      <JournalScene />
      <TaxScene />
      <PayrollScene />
      <StockScene />
      <SyncScene />

      <Section
        id="pos-walkthrough"
        kicker={{ en: "Walkthrough — purchase to month end", fr: "Parcours — de l'achat à la clôture", ar: "مسار — من الشراء إلى إقفال الشهر" }}
        title={{
          en: "One order, followed until it reaches the declaration.",
          fr: "Une commande, suivie jusqu'à la déclaration.",
          ar: "طلبية واحدة، نتتبّعها حتى تصل إلى التصريح.",
        }}
        intro={{
          en: "Six steps across the depot, the office and the accountant — one database. Each step leaves a numbered document and the lines the accountant will read.",
          fr: "Six étapes entre le dépôt, le bureau et le comptable — une seule base. Chaque étape laisse un document numéroté et les lignes que lira le comptable.",
          ar: "ست خطوات بين المستودع والمكتب والمحاسب — قاعدة بيانات واحدة. كل خطوة تترك وثيقة مرقّمة والأسطر التي سيقرؤها المحاسب.",
        }}
      >
        <Walkthrough steps={WALK} />
      </Section>

      <Section
        id="pos-decisions"
        dark
        kicker={{ en: "Engine room — decisions", fr: "Salle des machines — décisions", ar: "غرفة المحرّك — القرارات" }}
        title={{
          en: "Six choices that keep the books honest.",
          fr: "Six choix qui gardent les livres honnêtes.",
          ar: "ستة خيارات تُبقي الدفاتر صادقة.",
        }}
      >
        <Decisions items={DECISIONS} />
      </Section>

      <Section
        id="pos-proof"
        kicker={{ en: "Proof", fr: "Preuves", ar: "الإثبات" }}
        title={{
          en: "Built to be read by an accountant, and by an auditor after them.",
          fr: "Conçu pour être lu par un comptable, puis par un contrôleur.",
          ar: "بُني ليقرأه محاسب، ومن بعده مراقب.",
        }}
      >
        <ProofStrip items={PROOF} />
        <p className="erp-body mt-10 max-w-[60ch]">
          {tx({
            en: "Ledger, tax, receivables and payables, payroll, inventory and purchasing — six modules of the map, proven by one system that keeps working when the network does not.",
            fr: "Journaux, fiscalité, créances et dettes, paie, stocks et achats — six modules de la carte, prouvés par un seul système qui continue de fonctionner quand le réseau s'arrête.",
            ar: "اليوميات والجباية والذمم والأجور والمخزون والمشتريات — ست وحدات من الخريطة، يُثبتها نظام واحد يواصل العمل حين تتوقف الشبكة.",
          })}{" "}
          <Code lit>ledger · tax · arap · payroll · inventory · procurement</Code>
        </p>
      </Section>
    </>
  );
}
