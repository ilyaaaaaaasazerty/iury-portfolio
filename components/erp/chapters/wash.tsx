"use client";

/**
 * Chapter 3 — The field (SayrouraWash).
 * Work orders born offline on a crew phone, a supervisor's live board,
 * commission snapshotted in basis points, and the audit / session trail.
 */

import type { ReactNode } from "react";
import { CHAPTERS } from "@/lib/erp/nodes";
import { useNumber, useTx, type L } from "@/lib/erp/i18n";
import { lerp, rise, seg } from "@/lib/erp/sv";
import { At, AtStack, LightUp, Scene, useScene } from "../engine";
import {
  BeatCopy,
  BeatDots,
  ChapterCover,
  Decisions,
  Figure,
  ProofStrip,
  SceneLayout,
  Section,
  Walkthrough,
} from "../ui";

const META = CHAPTERS[2];

type Beat = { kicker: L; title: L; body: L; details: L[] };

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

const COVER = {
  oneLiner: {
    en: "Work orders opened on a phone in the field, followed on a live board in the office — with or without a network.",
    fr: "Des ordres de travail ouverts sur un téléphone sur le terrain, suivis en direct au bureau — avec ou sans réseau.",
    ar: "أوامر عمل تُفتح على هاتف في الميدان، وتُتابَع مباشرةً من المكتب — بشبكة أو من دونها.",
  },
  context: [
    {
      en: "The context is vehicle care: crews receive vehicles on site, a supervisor runs the day and pays commission. The problem is the one every field operation has — the work happens where coverage is weak, several people touch the same job, and money depends on records nobody can quietly rewrite.",
      fr: "Le contexte : l'entretien de véhicules. Des équipes reçoivent les véhicules sur site, un superviseur pilote la journée et verse les commissions. Le problème est celui de toute opération terrain — le travail se fait là où le réseau est faible, plusieurs personnes touchent au même ordre, et l'argent dépend d'enregistrements que personne ne doit pouvoir réécrire en silence.",
      ar: "السياق: العناية بالمركبات. فرق تستقبل المركبات في الموقع، ومشرف يدير اليوم ويصرف العمولات. والمشكلة هي مشكلة كل عمل ميداني — العمل يجري حيث التغطية ضعيفة، وعدّة أشخاص يتعاملون مع الأمر نفسه، والمال يعتمد على سجلات لا ينبغي لأحد أن يعيد كتابتها خفيةً.",
    },
    {
      en: "SayrouraWash is a field-operations system: an offline-first mobile app for crews and supervisors, a web back office, and an API that reconciles them. States, prices, commission and audit are decided on the server — and nothing typed on a phone is lost on the way.",
      fr: "SayrouraWash est un système d'opérations terrain : une application mobile offline-first pour les équipes et les superviseurs, un back-office web, et une API qui les réconcilie. États, prix, commissions et audit sont décidés côté serveur — et rien de ce qui est saisi sur un téléphone ne se perd en route.",
      ar: "SayrouraWash منظومة للعمليات الميدانية: تطبيق جوّال يعمل دون اتصال أولًا للفرق والمشرفين، وواجهة إدارة على الويب، وواجهة برمجية توفّق بينهما. الحالات والأسعار والعمولات والتدقيق تُحسم على الخادم — ولا يضيع في الطريق شيء ممّا أُدخل على الهاتف.",
    },
  ] as L[],
  roles: [
    {
      name: { en: "SUPERVISOR", fr: "SUPERVISOR", ar: "SUPERVISOR" },
      does: {
        en: "Watches the live board, sets prices and the commission rate, cancels, resolves flags, records payouts.",
        fr: "Suit le tableau en direct, fixe les prix et le taux de commission, annule, traite les signalements, enregistre les versements.",
        ar: "يتابع اللوحة الحيّة، يحدّد الأسعار ونسبة العمولة، يلغي، يعالج التنبيهات، ويسجّل الدفعات.",
      },
    },
    {
      name: { en: "AGENT", fr: "AGENT", ar: "AGENT" },
      does: {
        en: "Opens and closes work orders on the phone, online or not. Sees only their own jobs.",
        fr: "Ouvre et clôture les ordres de travail sur le téléphone, connecté ou non. Ne voit que ses propres ordres.",
        ar: "يفتح أوامر العمل ويغلقها على الهاتف، متصلًا أو لا. لا يرى إلا أوامره.",
      },
    },
  ],
  platforms: [
    { en: "Mobile · offline-first", fr: "Mobile · offline-first", ar: "الجوّال · دون اتصال أولًا" },
    { en: "Web back office", fr: "Back-office web", ar: "إدارة عبر الويب" },
    { en: "API · REST + Socket.IO", fr: "API · REST + Socket.IO", ar: "API · REST + Socket.IO" },
  ] as L[],
};

const OFFLINE: Beat[] = [
  {
    kicker: { en: "03.1 — Read on the device", fr: "03.1 — Lu sur l'appareil", ar: "03.1 — القراءة على الجهاز" },
    title: {
      en: "The plate is read on the phone, not in the cloud.",
      fr: "La plaque est lue sur le téléphone, pas dans le cloud.",
      ar: "تُقرأ اللوحة على الهاتف، لا في السحابة.",
    },
    body: {
      en: "The crew member points the camera at the plate. Text recognition runs on the device, so a job can start in a basement or a yard with no signal at all.",
      fr: "Le membre de l'équipe vise la plaque avec la caméra. La reconnaissance de texte tourne sur l'appareil : un ordre peut démarrer dans un sous-sol ou une cour sans aucun signal.",
      ar: "يوجّه عضو الفريق الكاميرا نحو اللوحة. التعرّف على النص يجري على الجهاز نفسه، فيمكن بدء العمل في قبو أو ساحة بلا أي إشارة.",
    },
    details: [
      { en: "No image leaves the phone to read a plate.", fr: "Aucune image ne quitte le téléphone pour lire une plaque.", ar: "لا تغادر أي صورة الهاتف لقراءة اللوحة." },
      {
        en: "Stored as digits, shown as 09876-219-16; unique per organization among live vehicles.",
        fr: "Stockée en chiffres, affichée 09876-219-16 ; unique par organisation parmi les véhicules actifs.",
        ar: "تُخزَّن أرقامًا وتُعرض بالشكل 09876-219-16؛ فريدة داخل كل مؤسسة بين المركبات القائمة.",
      },
      {
        en: "Online, an AI vision model can propose brand, model and colour — matched to the catalog afterwards.",
        fr: "En ligne, un modèle de vision IA peut proposer marque, modèle et couleur — rapprochés du catalogue ensuite.",
        ar: "عند الاتصال، يمكن لنموذج رؤية بالذكاء الاصطناعي اقتراح العلامة والطراز واللون — تُطابَق مع الدليل لاحقًا.",
      },
    ],
  },
  {
    kicker: { en: "03.1 — Saved locally", fr: "03.1 — Enregistré localement", ar: "03.1 — حُفظ محليًا" },
    title: {
      en: "The work order exists before the server knows about it.",
      fr: "L'ordre de travail existe avant que le serveur ne le sache.",
      ar: "أمر العمل موجود قبل أن يعلم به الخادم.",
    },
    body: {
      en: "The phone writes the order into its own database with an id it generates itself. Price comes from the grid on the phone, the commission rate is copied onto the order, the state is IN_PROGRESS. The change waits in a queue.",
      fr: "Le téléphone écrit l'ordre dans sa propre base avec un identifiant qu'il génère lui-même. Le prix vient de la grille du téléphone, le taux de commission est copié sur l'ordre, l'état est IN_PROGRESS. La modification attend dans une file.",
      ar: "يكتب الهاتف الأمر في قاعدة بياناته الخاصة بمعرّف يولّده بنفسه. السعر من الجدول المخزّن في الهاتف، ونسبة العمولة تُنسخ على الأمر، والحالة IN_PROGRESS. ثمّ ينتظر التغيير في طابور.",
    },
    details: [
      {
        en: "Ids are UUIDs made on the device, so the order can point at a vehicle created seconds earlier, offline.",
        fr: "Les identifiants sont des UUID créés sur l'appareil : l'ordre peut pointer vers un véhicule créé quelques secondes plus tôt, hors ligne.",
        ar: "المعرّفات UUID تُنشأ على الجهاز، فيمكن للأمر أن يشير إلى مركبة أُنشئت قبل ثوانٍ دون اتصال.",
      },
      {
        en: "Price and rate are snapshots; the server later checks them against the grid as it was at started_at.",
        fr: "Prix et taux sont des instantanés ; le serveur les vérifie ensuite contre la grille telle qu'elle était à started_at.",
        ar: "السعر والنسبة لقطات؛ يتحقّق منها الخادم لاحقًا مقابل الجدول كما كان عند started_at.",
      },
      { en: "Local storage: WatermelonDB.", fr: "Stockage local : WatermelonDB.", ar: "التخزين المحلي: WatermelonDB." },
    ],
  },
  {
    kicker: { en: "03.1 — Reconnect", fr: "03.1 — Reconnexion", ar: "03.1 — عودة الاتصال" },
    title: {
      en: "On reconnect, the queue drains — one record at a time.",
      fr: "À la reconnexion, la file se vide — un enregistrement à la fois.",
      ar: "عند عودة الاتصال، يُفرَّغ الطابور — سجلًّا بعد سجل.",
    },
    body: {
      en: "The app pushes its changes and pulls what it missed. The server applies them record by record, in foreign-key order — clients, vehicles, then work orders — so one bad record never blocks the rest.",
      fr: "L'application pousse ses modifications et récupère ce qu'elle a manqué. Le serveur les applique enregistrement par enregistrement, dans l'ordre des clés étrangères — clients, véhicules, puis ordres — pour qu'un enregistrement fautif ne bloque jamais le reste.",
      ar: "يدفع التطبيق تغييراته ويسحب ما فاته. يطبّقها الخادم سجلًّا سجلًّا بترتيب المفاتيح الأجنبية — العملاء، ثم المركبات، ثم الأوامر — فلا يعطّل سجلّ معيب بقية الطابور.",
    },
    details: [
      {
        en: "Each pull re-sends rows changed 10 s before the cursor, to catch transactions that committed late.",
        fr: "Chaque pull renvoie les lignes modifiées 10 s avant le curseur, pour rattraper les transactions validées en retard.",
        ar: "كل سحب يعيد إرسال الصفوف المعدّلة قبل المؤشّر بـ10 ثوانٍ، لالتقاط المعاملات التي تأخّر تثبيتها.",
      },
      {
        en: "Status changes are replayed as state-machine actions; one no longer valid is dropped, never an error.",
        fr: "Les changements d'état sont rejoués comme actions de la machine à états ; une action devenue invalide est ignorée, jamais une erreur.",
        ar: "تُعاد تغييرات الحالة كأفعال في آلة الحالات؛ والفعل الذي لم يعد صالحًا يُسقَط، ولا يُعدّ خطأً.",
      },
      {
        en: "A crew member only ever receives their own work orders.",
        fr: "Un membre d'équipe ne reçoit jamais que ses propres ordres.",
        ar: "لا يستلم عضو الفريق إلا أوامر عمله.",
      },
    ],
  },
  {
    kicker: { en: "03.1 — Two devices, one vehicle", fr: "03.1 — Deux appareils, un véhicule", ar: "03.1 — جهازان، مركبة واحدة" },
    title: {
      en: "A duplicate is mapped, not created twice.",
      fr: "Un doublon est rattaché, pas créé deux fois.",
      ar: "المكرَّر يُربط، ولا يُنشأ مرّتين.",
    },
    body: {
      en: "This plate was already on the server, registered from another device before this phone pulled. The server keeps the real row, records the phone's id as an alias, rewrites later pushes that point at it, and the next pull removes the local copy.",
      fr: "Cette plaque existait déjà sur le serveur, enregistrée depuis un autre appareil avant le dernier pull de ce téléphone. Le serveur garde la vraie ligne, enregistre l'identifiant du téléphone comme alias, réécrit les envois suivants qui y pointent, et le prochain pull supprime la copie locale.",
      ar: "كانت هذه اللوحة موجودة على الخادم، سُجّلت من جهاز آخر قبل أن يسحب هذا الهاتف. يحتفظ الخادم بالصف الحقيقي، ويسجّل معرّف الهاتف كاسم بديل، ويعيد كتابة الإرسالات اللاحقة التي تشير إليه، ثم يحذف السحب التالي النسخة المحلية.",
    },
    details: [
      {
        en: "Same plate means same vehicle; same phone number means same client.",
        fr: "Même plaque, même véhicule ; même numéro de téléphone, même client.",
        ar: "اللوحة نفسها تعني المركبة نفسها؛ ورقم الهاتف نفسه يعني العميل نفسه.",
      },
      {
        en: "A replayed creation of an aliased record never overwrites the real one.",
        fr: "Une création rejouée d'un enregistrement aliasé n'écrase jamais le vrai.",
        ar: "إعادة إنشاء سجلّ له اسم بديل لا تكتب أبدًا فوق السجلّ الحقيقي.",
      },
      {
        en: "The alias table: SyncAlias (table, alias_id → target_id).",
        fr: "La table d'alias : SyncAlias (table, alias_id → target_id).",
        ar: "جدول الأسماء البديلة: SyncAlias (table، alias_id → target_id).",
      },
    ],
  },
];

const BOARD: Beat[] = [
  {
    kicker: { en: "03.2 — Live board", fr: "03.2 — Tableau en direct", ar: "03.2 — اللوحة الحيّة" },
    title: {
      en: "The supervisor sees the order the moment it lands.",
      fr: "Le superviseur voit l'ordre à l'instant où il arrive.",
      ar: "يرى المشرف الأمر لحظة وصوله.",
    },
    body: {
      en: "The board holds a Socket.IO connection on the /live namespace. Every work-order event goes to two rooms: the organization's room, where supervisors listen, and the room of the crew member who owns the job.",
      fr: "Le tableau garde une connexion Socket.IO sur l'espace /live. Chaque événement d'ordre part vers deux salons : celui de l'organisation, où écoutent les superviseurs, et celui du membre d'équipe qui porte l'ordre.",
      ar: "تحتفظ اللوحة باتصال Socket.IO على المجال ‎/live. كل حدث لأمر عمل يُرسل إلى غرفتين: غرفة المؤسسة حيث يستمع المشرفون، وغرفة عضو الفريق صاحب الأمر.",
    },
    details: [
      {
        en: "Five events: service.created, .finished, .paid, .cancelled, .updated.",
        fr: "Cinq événements : service.created, .finished, .paid, .cancelled, .updated.",
        ar: "خمسة أحداث: service.created و‎.finished و‎.paid و‎.cancelled و‎.updated.",
      },
      {
        en: "Supervisors join the organization room; agents join only their own room.",
        fr: "Les superviseurs rejoignent le salon de l'organisation ; les agents seulement le leur.",
        ar: "ينضمّ المشرفون إلى غرفة المؤسسة؛ والأعوان إلى غرفهم فقط.",
      },
      {
        en: "When the access token expires, the server sends auth.expired before dropping the socket.",
        fr: "Quand le jeton d'accès expire, le serveur envoie auth.expired avant de couper la socket.",
        ar: "عند انتهاء رمز الوصول، يرسل الخادم auth.expired قبل قطع الاتصال.",
      },
    ],
  },
  {
    kicker: { en: "03.2 — State in real time", fr: "03.2 — L'état en temps réel", ar: "03.2 — الحالة في الوقت الفعلي" },
    title: {
      en: "Every transition is an event — including the ones a phone must hear.",
      fr: "Chaque transition est un événement — y compris celles qu'un téléphone doit entendre.",
      ar: "كل انتقال حدث — بما فيها تلك التي يجب أن يسمعها الهاتف.",
    },
    body: {
      en: "Finished, paid, cancelled: rows move as crews work. When the supervisor cancels a job from the office, the owner's phone also receives sync.hint and pulls at once, instead of finding out at its next sync.",
      fr: "Terminé, payé, annulé : les lignes bougent au rythme des équipes. Quand le superviseur annule un ordre depuis le bureau, le téléphone du titulaire reçoit aussi sync.hint et se synchronise aussitôt, au lieu de l'apprendre au prochain cycle.",
      ar: "أُنجز، دُفع، أُلغي: تتحرّك الصفوف مع عمل الفرق. وحين يلغي المشرف أمرًا من المكتب، يتلقّى هاتف صاحبه sync.hint فيتزامن فورًا، بدل أن يكتشف ذلك في المزامنة التالية.",
    },
    details: [
      {
        en: "IN_PROGRESS → DONE by finish; IN_PROGRESS or DONE → CANCELLED by cancel.",
        fr: "IN_PROGRESS → DONE par finish ; IN_PROGRESS ou DONE → CANCELLED par cancel.",
        ar: "IN_PROGRESS → DONE عبر finish؛ IN_PROGRESS أو DONE → CANCELLED عبر cancel.",
      },
      {
        en: "Payment is a separate fact (is_paid), allowed on any order that is not cancelled.",
        fr: "Le paiement est un fait séparé (is_paid), permis sur tout ordre non annulé.",
        ar: "الدفع واقعة منفصلة (is_paid)، مسموحة على كل أمر غير ملغى.",
      },
      {
        en: "Commission is computed at DONE and reset to 0 on cancel.",
        fr: "La commission est calculée à DONE et remise à 0 à l'annulation.",
        ar: "تُحسب العمولة عند DONE وتعود إلى 0 عند الإلغاء.",
      },
    ],
  },
  {
    kicker: { en: "03.2 — Duplicate guard", fr: "03.2 — Garde anti-doublon", ar: "03.2 — حارس التكرار" },
    title: {
      en: "Two open orders on one vehicle: both kept, one flagged.",
      fr: "Deux ordres ouverts sur un véhicule : les deux gardés, l'un signalé.",
      ar: "أمران مفتوحان على مركبة واحدة: يُحفظ الاثنان ويُنبَّه على أحدهما.",
    },
    body: {
      en: "A second phone, offline until now, pushes an order for the same plate that overlaps the first. Rejecting it would erase work that really happened. The server keeps both, flags the later one DUPLICATE_IN_PROGRESS and writes an audit row.",
      fr: "Un second téléphone, hors ligne jusque-là, pousse un ordre sur la même plaque qui chevauche le premier. Le rejeter effacerait un travail réellement fait. Le serveur garde les deux, signale le plus tardif DUPLICATE_IN_PROGRESS et écrit une ligne d'audit.",
      ar: "هاتف ثانٍ، كان دون اتصال، يدفع أمرًا للّوحة نفسها يتداخل مع الأول. رفضه يمحو عملًا حدث فعلًا. يحتفظ الخادم بالاثنين، ويضع على الأحدث علامة DUPLICATE_IN_PROGRESS ويكتب سطر تدقيق.",
    },
    details: [
      {
        en: "Overlap: intervals [started_at, finished_at or open) intersect, among non-cancelled orders.",
        fr: "Chevauchement : les intervalles [started_at, finished_at ou ouvert) se croisent, parmi les ordres non annulés.",
        ar: "التداخل: تقاطع المجالين [started_at، finished_at أو مفتوح) بين الأوامر غير الملغاة.",
      },
      {
        en: "Other flags: PRICE_MISMATCH, AGENT_DISCOUNT_REJECTED, PHOTO_MISSING, LOYALTY_INVALID.",
        fr: "Autres signalements : PRICE_MISMATCH, AGENT_DISCOUNT_REJECTED, PHOTO_MISSING, LOYALTY_INVALID.",
        ar: "تنبيهات أخرى: PRICE_MISMATCH وAGENT_DISCOUNT_REJECTED وPHOTO_MISSING وLOYALTY_INVALID.",
      },
      {
        en: "Clearing a flag is itself an audited action (resolve_flag).",
        fr: "Lever un signalement est lui-même une action auditée (resolve_flag).",
        ar: "رفع التنبيه هو نفسه فعل مُدقَّق (resolve_flag).",
      },
    ],
  },
];

const MONEY: Beat[] = [
  {
    kicker: { en: "03.3 — Commission in basis points", fr: "03.3 — Commission en points de base", ar: "03.3 — العمولة بنقاط الأساس" },
    title: {
      en: "The rate is copied onto the job when it starts.",
      fr: "Le taux est copié sur l'ordre à son ouverture.",
      ar: "تُنسخ النسبة على الأمر لحظة فتحه.",
    },
    body: {
      en: "Commission is stored as integer basis points: 3333 bp is 33.33 %. Each work order snapshots the organization's rate at creation; the amount is computed once, at DONE: round(price × bp / 10 000).",
      fr: "La commission est stockée en points de base entiers : 3333 bp valent 33,33 %. Chaque ordre fige le taux de l'organisation à sa création ; le montant est calculé une seule fois, à DONE : round(prix × bp / 10 000).",
      ar: "تُخزَّن العمولة بنقاط أساس صحيحة: 3333 bp تساوي 33.33 %. كل أمر يلتقط نسبة المؤسسة عند إنشائه؛ ويُحسب المبلغ مرّة واحدة عند DONE: round(السعر × bp / 10 000).",
    },
    details: [
      { en: "3333 bp is the default rate of a new organization.", fr: "3333 bp est le taux par défaut d'une nouvelle organisation.", ar: "3333 bp هي النسبة الافتراضية لمؤسسة جديدة." },
      { en: "0 while IN_PROGRESS, back to 0 if CANCELLED.", fr: "0 tant que IN_PROGRESS, retour à 0 si CANCELLED.", ar: "0 ما دام IN_PROGRESS، ويعود إلى 0 عند CANCELLED." },
      {
        en: "The base includes a loyalty discount, so a loyalty reward still pays the crew member.",
        fr: "La base inclut la remise fidélité : une récompense fidélité rémunère quand même l'équipier.",
        ar: "الأساس يشمل خصم الوفاء، فمكافأة الوفاء تدفع لعضو الفريق أيضًا.",
      },
    ],
  },
  {
    kicker: { en: "03.3 — Rate change", fr: "03.3 — Changement de taux", ar: "03.3 — تغيير النسبة" },
    title: {
      en: "Change the rate at 14:20 — the morning stays as it was.",
      fr: "Changez le taux à 14:20 — la matinée reste ce qu'elle était.",
      ar: "غيّر النسبة عند 14:20 — ويبقى الصباح كما كان.",
    },
    body: {
      en: "The supervisor lowers the rate to 3000 bp. Orders opened before keep their 3333 snapshot; new ones take 3000. A settings screen never rewrites history, and what was owed for the morning is still what is owed.",
      fr: "Le superviseur baisse le taux à 3000 bp. Les ordres ouverts avant gardent leur instantané à 3333 ; les nouveaux prennent 3000. Un écran de réglages ne réécrit jamais l'historique, et ce qui était dû pour la matinée reste dû.",
      ar: "يخفض المشرف النسبة إلى 3000 bp. الأوامر المفتوحة قبلها تحتفظ بلقطة 3333؛ والجديدة تأخذ 3000. شاشة الإعدادات لا تعيد كتابة التاريخ، وما كان مستحقًا عن الصباح يبقى مستحقًا.",
    },
    details: [
      {
        en: "The organization records when the rate last changed, apart from any other edit.",
        fr: "L'organisation enregistre quand le taux a changé, à part de toute autre modification.",
        ar: "تسجّل المؤسسة وقت آخر تغيير للنسبة، بمعزل عن أي تعديل آخر.",
      },
      {
        en: "That timestamp tells a phone's stale offline snapshot from a real mismatch.",
        fr: "Cet horodatage distingue l'instantané périmé d'un téléphone hors ligne d'une vraie anomalie.",
        ar: "يميّز هذا الطابع الزمني لقطة هاتف قديمة دون اتصال عن تعارض حقيقي.",
      },
    ],
  },
  {
    kicker: { en: "03.3 — Payouts", fr: "03.3 — Versements", ar: "03.3 — الدفعات" },
    title: {
      en: "What is owed is a subtraction, not a spreadsheet.",
      fr: "Ce qui est dû est une soustraction, pas un tableur.",
      ar: "المستحقّ عملية طرح، لا جدول حسابات.",
    },
    body: {
      en: "When the supervisor hands over cash, a payout is recorded against the crew member. The balance due is earned commission minus payouts — both read from records, never typed in.",
      fr: "Quand le superviseur remet l'argent, un versement est enregistré au nom de l'équipier. Le solde dû est la commission acquise moins les versements — les deux lus dans les enregistrements, jamais saisis.",
      ar: "حين يسلّم المشرف المبلغ نقدًا، تُسجَّل دفعة باسم عضو الفريق. الرصيد المستحقّ هو العمولة المكتسبة ناقص الدفعات — وكلاهما يُقرأ من السجلات، لا يُكتب يدويًا.",
    },
    details: [
      { en: "Payouts are online-only and supervisor-only.", fr: "Les versements se font en ligne et par un superviseur uniquement.", ar: "الدفعات تتمّ عبر الاتصال ومن المشرف فقط." },
      {
        en: "A payout recorded by mistake is soft-deleted; its amount is owed again.",
        fr: "Un versement saisi par erreur est supprimé logiquement ; son montant redevient dû.",
        ar: "الدفعة المسجّلة خطأً تُحذف حذفًا منطقيًا؛ فيعود مبلغها مستحقًا.",
      },
      { en: "Every payout writes an audit row.", fr: "Chaque versement écrit une ligne d'audit.", ar: "كل دفعة تكتب سطر تدقيق." },
    ],
  },
];

const TRUST: Beat[] = [
  {
    kicker: { en: "03.4 — Audit trail", fr: "03.4 — Piste d'audit", ar: "03.4 — سجل التدقيق" },
    title: {
      en: "Every change leaves a JSON diff, in the same transaction.",
      fr: "Chaque modification laisse un diff JSON, dans la même transaction.",
      ar: "كل تغيير يترك فرقًا بصيغة JSON، في المعاملة نفسها.",
    },
    body: {
      en: "Status changes, cancellations, payments, discounts, flags, prices, payouts: nine services write an audit row with the actor and a before/after diff — inside the change's own transaction. If the change commits, its trace commits with it.",
      fr: "Changements d'état, annulations, paiements, remises, signalements, prix, versements : neuf services écrivent une ligne d'audit avec l'auteur et un diff avant/après — dans la transaction même de la modification. Si elle est validée, sa trace l'est avec elle.",
      ar: "تغييرات الحالة والإلغاءات والدفع والخصومات والتنبيهات والأسعار والدفعات: تسع خدمات تكتب سطر تدقيق بالفاعل وبفرق قبل/بعد — داخل معاملة التغيير نفسها. إن ثُبّت التغيير، ثُبّت أثره معه.",
    },
    details: [
      {
        en: "Diffs store pairs: \"status\": [\"IN_PROGRESS\", \"CANCELLED\"].",
        fr: "Les diffs stockent des paires : \"status\": [\"IN_PROGRESS\", \"CANCELLED\"].",
        ar: "تخزّن الفروق أزواجًا: \"status\": [\"IN_PROGRESS\", \"CANCELLED\"].",
      },
      {
        en: "System actions, like a duplicate flag, are recorded with no user.",
        fr: "Les actions système, comme un signalement de doublon, sont enregistrées sans utilisateur.",
        ar: "أفعال النظام، كتنبيه التكرار، تُسجَّل دون مستخدم.",
      },
    ],
  },
  {
    kicker: { en: "03.4 — Sessions on lost phones", fr: "03.4 — Sessions et téléphones perdus", ar: "03.4 — الجلسات والهواتف المفقودة" },
    title: {
      en: "A copied refresh token works once — then every session ends.",
      fr: "Un jeton de rafraîchissement copié sert une fois — puis toutes les sessions tombent.",
      ar: "رمز التحديث المنسوخ يعمل مرّة — ثم تنتهي كل الجلسات.",
    },
    body: {
      en: "Each refresh returns a new token and retires the old one; the server stores only its SHA-256 hash. If a retired token is ever presented again, someone copied it: every session of that user is revoked.",
      fr: "Chaque rafraîchissement renvoie un nouveau jeton et retire l'ancien ; le serveur n'en garde que l'empreinte SHA-256. Si un jeton retiré est présenté à nouveau, quelqu'un l'a copié : toutes les sessions de l'utilisateur sont révoquées.",
      ar: "كل تحديث يعيد رمزًا جديدًا ويُبطل القديم؛ ولا يحفظ الخادم إلا بصمته SHA-256. وإن قُدّم رمز مُبطَل مجددًا، فقد نسخه أحدهم: تُلغى كل جلسات ذلك المستخدم.",
    },
    details: [
      {
        en: "A phone whose refresh response was lost gets one retry in a short grace window — weak coverage does not log a crew member out.",
        fr: "Un téléphone dont la réponse s'est perdue a droit à un essai dans une courte fenêtre de grâce — un réseau faible ne déconnecte pas l'équipier.",
        ar: "الهاتف الذي ضاع ردّ تحديثه يحق له محاولة واحدة في مهلة قصيرة — فالتغطية الضعيفة لا تُخرج عضو الفريق.",
      },
      { en: "Login is rate-limited: 5 attempts per minute.", fr: "Connexion limitée : 5 tentatives par minute.", ar: "تسجيل الدخول محدود: 5 محاولات في الدقيقة." },
      {
        en: "An end-to-end test proves one organization can never read another's data.",
        fr: "Un test de bout en bout prouve qu'une organisation ne peut jamais lire les données d'une autre.",
        ar: "اختبار شامل يثبت أن مؤسسة لا تستطيع أبدًا قراءة بيانات أخرى.",
      },
    ],
  },
];

const JOURNEY = {
  kicker: { en: "Walkthrough", fr: "Parcours", ar: "مسار كامل" } as L,
  title: { en: "One job, from arrival to payout.", fr: "Un ordre, de l'arrivée au versement.", ar: "أمر واحد، من الوصول إلى الدفع." } as L,
  intro: {
    en: "Nadia Khelifi's Tucson arrives while the yard has no coverage. Demo data from the seed; every system step is real.",
    fr: "Le Tucson de Nadia Khelifi arrive alors que la cour n'a pas de réseau. Données de démonstration ; chaque étape système est réelle.",
    ar: "تصل سيارة Tucson الخاصة بنادية خليفي والساحة بلا تغطية. بيانات تجريبية؛ وكل خطوة في النظام حقيقية.",
  } as L,
  steps: [
    {
      actor: { en: "Agent · offline", fr: "Agent · hors ligne", ar: "العون · دون اتصال" },
      action: { en: "Scans the plate of the arriving vehicle.", fr: "Scanne la plaque du véhicule qui arrive.", ar: "يمسح لوحة المركبة الواصلة." },
      effect: {
        en: "Text recognition on the device returns the plate. No request leaves the phone.",
        fr: "La reconnaissance de texte sur l'appareil renvoie la plaque. Aucune requête ne quitte le téléphone.",
        ar: "يعيد التعرّف على النص في الجهاز اللوحة. لا يغادر أي طلب الهاتف.",
      },
      token: "09876-219-16",
    },
    {
      actor: { en: "Agent · offline", fr: "Agent · hors ligne", ar: "العون · دون اتصال" },
      action: { en: "Starts a full service on the vehicle.", fr: "Lance une prestation complète sur le véhicule.", ar: "يبدأ خدمة كاملة على المركبة." },
      effect: {
        en: "A local row with a device UUID: price 1 500 DA from the phone's grid, rate 3333 bp copied, state IN_PROGRESS. Queued.",
        fr: "Une ligne locale avec un UUID de l'appareil : prix 1 500 DA depuis la grille du téléphone, taux 3333 bp copié, état IN_PROGRESS. En file.",
        ar: "صف محلي بمعرّف UUID من الجهاز: السعر 1 500 DA من جدول الهاتف، النسبة 3333 bp منسوخة، الحالة IN_PROGRESS. في الطابور.",
      },
      token: "IN_PROGRESS · 3333 bp",
    },
    {
      actor: { en: "Phone · back online", fr: "Téléphone · de retour en ligne", ar: "الهاتف · عاد الاتصال" },
      action: { en: "Syncs without anyone pressing a button.", fr: "Se synchronise sans que personne n'appuie sur un bouton.", ar: "يتزامن دون أن يضغط أحد زرًّا." },
      effect: {
        en: "Push applies records in foreign-key order; the plate already exists, so the local vehicle id is aliased to the real one.",
        fr: "Le push applique les enregistrements dans l'ordre des clés étrangères ; la plaque existe déjà, l'id local du véhicule est donc aliasé vers le vrai.",
        ar: "يطبّق الدفع السجلات بترتيب المفاتيح الأجنبية؛ اللوحة موجودة، فيُربط معرّف المركبة المحلي بالمعرّف الحقيقي.",
      },
      token: "SyncAlias v-7f3a → v-21c0",
    },
    {
      actor: { en: "Supervisor · board", fr: "Superviseur · tableau", ar: "المشرف · اللوحة" },
      action: { en: "Sees the new order appear, without refreshing.", fr: "Voit le nouvel ordre apparaître, sans rafraîchir.", ar: "يرى الأمر الجديد يظهر دون تحديث الصفحة." },
      effect: {
        en: "service.created is emitted on /live to the organization room and to the agent's own room.",
        fr: "service.created est émis sur /live vers le salon de l'organisation et celui de l'agent.",
        ar: "يُبثّ service.created على ‎/live إلى غرفة المؤسسة وغرفة العون.",
      },
      token: "service.created",
    },
    {
      actor: { en: "Agent", fr: "Agent", ar: "العون" },
      action: { en: "Marks the job done.", fr: "Marque l'ordre comme terminé.", ar: "يعلّم الأمر منجزًا." },
      effect: {
        en: "DONE; commission computed from the snapshot: round(1 500 × 3333 / 10 000) = 500 DA. If the client linked Telegram, a SERVICE_READY message is queued and retried until sent.",
        fr: "DONE ; commission calculée sur l'instantané : round(1 500 × 3333 / 10 000) = 500 DA. Si le client a lié Telegram, un message SERVICE_READY est mis en file et réessayé jusqu'à l'envoi.",
        ar: "DONE؛ تُحسب العمولة من اللقطة: round(1 500 × 3333 / 10 000) = 500 DA. وإن ربط العميل Telegram، تُوضع رسالة SERVICE_READY في الطابور وتُعاد حتى تُرسل.",
      },
      token: "commission_da = 500",
    },
    {
      actor: { en: "Agent", fr: "Agent", ar: "العون" },
      action: { en: "Records the cash payment.", fr: "Enregistre le paiement en espèces.", ar: "يسجّل الدفع نقدًا." },
      effect: {
        en: "is_paid flips, service.paid reaches the board, and an audit row stores the pair [false, true].",
        fr: "is_paid bascule, service.paid arrive au tableau, et une ligne d'audit garde la paire [false, true].",
        ar: "يتحوّل is_paid، ويصل service.paid إلى اللوحة، ويحفظ سطر تدقيق الزوج [false, true].",
      },
      token: "pay · CASH",
    },
    {
      actor: { en: "Supervisor", fr: "Superviseur", ar: "المشرف" },
      action: { en: "Hands over commission and records the payout.", fr: "Remet la commission et enregistre le versement.", ar: "يسلّم العمولة ويسجّل الدفعة." },
      effect: {
        en: "The balance due drops by the payout amount; the payout itself is audited and can only be undone by a soft delete.",
        fr: "Le solde dû baisse du montant versé ; le versement est audité et ne peut être annulé que par suppression logique.",
        ar: "ينقص الرصيد المستحقّ بمبلغ الدفعة؛ والدفعة نفسها مُدقَّقة ولا تُلغى إلا بحذف منطقي.",
      },
      token: "due_da = earned_da − paid_da",
    },
  ],
};

const DECISIONS = {
  kicker: { en: "Decisions", fr: "Décisions", ar: "القرارات" } as L,
  title: { en: "Why it was built this way.", fr: "Pourquoi c'est construit ainsi.", ar: "لماذا بُني هكذا." } as L,
  items: [
    {
      decision: {
        en: "Attach anomaly flags and keep the record.",
        fr: "Attacher des signalements et garder l'enregistrement.",
        ar: "إرفاق تنبيهات بالشذوذ والاحتفاظ بالسجلّ.",
      },
      alternative: { en: "Rejecting suspicious records at sync.", fr: "Rejeter les enregistrements suspects à la synchro.", ar: "رفض السجلات المشبوهة عند المزامنة." },
      reason: {
        en: "A phone that was offline for an hour cannot be told no — the work already happened. A flag keeps the data and routes it to a person who can decide.",
        fr: "On ne peut pas dire non à un téléphone resté hors ligne une heure — le travail a déjà eu lieu. Un signalement garde la donnée et l'envoie à quelqu'un qui peut trancher.",
        ar: "لا يمكن رفض ما أرسله هاتف ظلّ دون اتصال ساعة — فالعمل قد تمّ. التنبيه يحفظ البيانات ويوجّهها إلى شخص يستطيع الحسم.",
      },
    },
    {
      decision: {
        en: "Ids generated on the device, duplicates mapped through an alias table.",
        fr: "Identifiants générés sur l'appareil, doublons rattachés via une table d'alias.",
        ar: "معرّفات تُولَّد على الجهاز، والمكرّرات تُربط عبر جدول أسماء بديلة.",
      },
      alternative: { en: "Server-assigned ids at sync time.", fr: "Identifiants attribués par le serveur à la synchro.", ar: "معرّفات يمنحها الخادم عند المزامنة." },
      reason: {
        en: "An offline order must reference a vehicle created seconds earlier on the same phone. Merging by mapping ids never deletes what a crew member typed.",
        fr: "Un ordre hors ligne doit référencer un véhicule créé quelques secondes plus tôt sur le même téléphone. Rattacher par correspondance d'ids ne supprime jamais ce qu'un équipier a saisi.",
        ar: "الأمر دون اتصال يجب أن يشير إلى مركبة أُنشئت قبل ثوانٍ على الهاتف نفسه. والدمج بربط المعرّفات لا يحذف أبدًا ما أدخله عضو الفريق.",
      },
    },
    {
      decision: {
        en: "Server wins on state; the device wins on free text.",
        fr: "Le serveur gagne sur l'état ; l'appareil gagne sur le texte libre.",
        ar: "الخادم يغلب في الحالة؛ والجهاز يغلب في النص الحر.",
      },
      alternative: { en: "Last write wins on the whole row.", fr: "La dernière écriture gagne sur toute la ligne.", ar: "آخر كتابة تغلب على الصف كله." },
      reason: {
        en: "A cancellation decided in the office must not be undone by a phone replaying an old status — and a crew member's notes should never be lost.",
        fr: "Une annulation décidée au bureau ne doit pas être défaite par un téléphone qui rejoue un ancien état — et les notes d'un équipier ne doivent jamais se perdre.",
        ar: "الإلغاء المقرَّر في المكتب لا يجوز أن يُنقض بهاتف يعيد حالة قديمة — وملاحظات عضو الفريق لا ينبغي أن تضيع.",
      },
    },
    {
      decision: {
        en: "Integer basis points, snapshotted on each job.",
        fr: "Des points de base entiers, figés sur chaque ordre.",
        ar: "نقاط أساس صحيحة تُلتقط على كل أمر.",
      },
      alternative: { en: "A live percentage read at payout time.", fr: "Un pourcentage lu en direct au moment du versement.", ar: "نسبة مئوية تُقرأ لحظة الدفع." },
      reason: {
        en: "Commission is money owed to people. A rate change must not rewrite yesterday, and integers do not drift.",
        fr: "La commission, c'est de l'argent dû à des personnes. Un changement de taux ne doit pas réécrire la veille, et les entiers ne dérivent pas.",
        ar: "العمولة مال مستحقّ لأشخاص. تغيير النسبة لا يجوز أن يعيد كتابة الأمس، والأعداد الصحيحة لا تنحرف.",
      },
    },
  ],
};

const PROOF = {
  kicker: { en: "Proof", fr: "Preuves", ar: "الإثبات" } as L,
  title: { en: "Measured in the system, not estimated.", fr: "Mesuré dans le système, pas estimé.", ar: "مقيس في النظام، لا مقدَّر." } as L,
  items: [
    { value: 25, label: { en: "data models", fr: "modèles de données", ar: "نموذج بيانات" } },
    { value: 13, label: { en: "migrations", fr: "migrations", ar: "ترحيلًا" } },
    { value: 18, label: { en: "controllers", fr: "contrôleurs", ar: "متحكّمًا" } },
    { value: 76, label: { en: "API endpoints", fr: "points d'accès API", ar: "نقطة وصول API" } },
    {
      value: 1250,
      prefix: "~",
      label: { en: "automated tests", fr: "tests automatisés", ar: "اختبار آلي" },
      note: { en: "incl. an end-to-end tenant-isolation test", fr: "dont un test e2e d'isolation", ar: "منها اختبار شامل للعزل" },
    },
    { value: 9, label: { en: "services writing JSON audit diffs", fr: "services écrivant des diffs d'audit JSON", ar: "خدمات تكتب فروق تدقيق JSON" } },
    { value: 5, label: { en: "live events on /live", fr: "événements en direct sur /live", ar: "أحداث حيّة على ‎/live" } },
    { value: 5, label: { en: "anomaly flags, none rejecting", fr: "signalements d'anomalie, aucun rejet", ar: "تنبيهات شذوذ، دون رفض" } },
  ],
  closing: {
    en: "A field system is judged on the day the network drops. This one was designed for that day.",
    fr: "Un système terrain se juge le jour où le réseau tombe. Celui-ci a été conçu pour ce jour-là.",
    ar: "يُحكم على النظام الميداني يوم تنقطع الشبكة. وهذا صُمّم لذلك اليوم.",
  } as L,
};

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

/** Short laptops (≈1366×620): smaller titles, two details, so the copy column is not clipped. */
const SHORT_COPY =
  "[@media(min-width:1024px)_and_(max-height:760px)]:[&_h3]:text-[clamp(1.45rem,2.3vw,2rem)] [@media(min-width:1024px)_and_(max-height:700px)]:[&_li:nth-child(n+3)]:hidden";

function CopyCol({ beats }: { beats: Beat[] }) {
  const { beat } = useScene();
  return (
    <div className={SHORT_COPY}>
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

/** Crossfade layers in one grid cell (inside figures). */
function Layers({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`grid [&>*]:col-start-1 [&>*]:row-start-1 ${className}`}>{children}</div>;
}

function Layer({ on, children, className = "" }: { on: boolean; children: ReactNode; className?: string }) {
  return (
    <div
      aria-hidden={!on}
      className={`transition-[opacity,transform] duration-500 ease-[var(--erp-ease)] ${on ? "opacity-100" : "pointer-events-none translate-y-1 opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
}

const MONO_XS = "erp-mono text-[11px] md:text-[0.7rem]";

const Q_QUEUED: L = { en: "queued", fr: "en file", ar: "في الطابور" };
const Q_PUSHED: L = { en: "pushed ✓", fr: "poussé ✓", ar: "أُرسل ✓" };

function Pill({ s, lit = false }: { s: string; lit?: boolean }) {
  const tone =
    s === "CANCELLED"
      ? "border-[var(--erp-hair-2)] text-faint line-through decoration-1"
      : s === "DONE"
        ? "border-ink bg-ink text-paper"
        : "border-signal text-signal-deep";
  return (
    <span
      className={`${MONO_XS} inline-block whitespace-nowrap border px-1.5 py-px leading-[1.35] transition-colors duration-500 ${tone} ${
        lit ? "shadow-[0_0_0_3px_var(--erp-signal-soft)]" : ""
      }`}
    >
      {s}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Cover aside: the state machine of a work order                      */
/* ------------------------------------------------------------------ */

function LifeFigure() {
  const tx = useTx();
  return (
    <Figure fig="FIG. 03.0" title={{ en: "A work order's life", fr: "Vie d'un ordre de travail", ar: "حياة أمر العمل" }} bodyClassName="p-4">
      <svg viewBox="0 12 360 128" className="h-auto w-full" role="img" aria-label={tx({ en: "IN_PROGRESS to DONE or CANCELLED", fr: "IN_PROGRESS vers DONE ou CANCELLED", ar: "من IN_PROGRESS إلى DONE أو CANCELLED" })}>
        <defs>
          <marker id="wash-arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="var(--color-ink)" />
          </marker>
        </defs>
        {/* nodes */}
        <g className="erp-mono" fontSize="11">
          <rect x="6" y="20" width="118" height="30" fill="var(--color-paper)" stroke="var(--color-signal)" strokeWidth="1.5" />
          <text x="65" y="39.5" textAnchor="middle" fill="var(--color-signal-deep)">IN_PROGRESS</text>
          <rect x="244" y="20" width="110" height="30" fill="var(--color-ink)" />
          <text x="299" y="39.5" textAnchor="middle" fill="var(--color-paper)">DONE</text>
          <rect x="120" y="104" width="120" height="30" fill="var(--color-paper)" stroke="var(--erp-hair-2)" strokeDasharray="3 3" />
          <text x="180" y="123.5" textAnchor="middle" fill="var(--color-mute)">CANCELLED</text>
        </g>
        {/* edges */}
        <g fill="none" stroke="var(--color-ink)" strokeWidth="1">
          <path d="M124 35 H240" markerEnd="url(#wash-arr)" />
          <path d="M70 50 V119 H116" markerEnd="url(#wash-arr)" />
          <path d="M299 50 V119 H244" markerEnd="url(#wash-arr)" />
        </g>
        <g className="erp-mono" fontSize="10" fill="var(--color-mute)">
          <text x="182" y="29" textAnchor="middle">finish</text>
          <text x="76" y="90">cancel</text>
          <text x="292" y="90" textAnchor="end">cancel</text>
        </g>
      </svg>
      <dl className="mt-3 space-y-1.5 border-t border-[var(--erp-hair)] pt-3 text-[0.8rem] leading-snug text-graphite">
        <div className="flex gap-2">
          <dt className="erp-mono shrink-0 text-[11px] text-faint">pay</dt>
          <dd>{tx({ en: "is_paid, on any order not cancelled", fr: "is_paid, sur tout ordre non annulé", ar: "is_paid، على كل أمر غير ملغى" })}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="erp-mono shrink-0 text-[11px] text-faint">{tx({ en: "flags", fr: "signalements", ar: "تنبيهات" })}</dt>
          <dd>{tx({ en: "attached by the server, never a rejection", fr: "attachés par le serveur, jamais un rejet", ar: "يرفقها الخادم، ولا رفض أبدًا" })}</dd>
        </div>
      </dl>
    </Figure>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 1 — offline creation and sync                                 */
/* ------------------------------------------------------------------ */

function OfflineScene() {
  const tx = useTx();
  return (
    <Scene id="wash-offline" beats={4} length={65} label={tx({ en: "Offline work order", fr: "Ordre de travail hors ligne", ar: "أمر عمل دون اتصال" })}>
      <SceneLayout copy={<CopyCol beats={OFFLINE} />} figure={<OfflineFigure />} />
      <LightUp nodes={["field"]} at={0.55} />
    </Scene>
  );
}

function OfflineFigure() {
  const tx = useTx();
  const { beat } = useScene();
  const online = beat >= 2;
  return (
    <Figure
      fig="FIG. 03.1"
      title={{ en: "Crew phone ⇄ server", fr: "Téléphone ⇄ serveur", ar: "الهاتف ⇄ الخادم" }}
      className="w-full max-w-[720px] [contain:inline-size]"
      bodyClassName="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] items-start gap-3 p-3 sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)] md:gap-6 md:p-6"
    >
      {/* phone */}
      <div className="w-full">
        <div className="border border-ink/80 bg-panel p-1.5">
          <div className="flex h-[272px] flex-col bg-paper sm:h-[340px]">
            <div className="flex items-center justify-between border-b border-[var(--erp-hair)] px-2 py-1">
              <span className={`${MONO_XS} text-faint`}>10:42</span>
              <span className={`${MONO_XS} flex items-center gap-1 ${online ? "text-ink" : "text-signal-deep"}`}>
                <span className={`erp-dot ${online ? "" : "erp-blink"}`} data-lit={online ? undefined : ""} />
                {online ? tx({ en: "ONLINE", fr: "EN LIGNE", ar: "متصل" }) : tx({ en: "OFFLINE", fr: "HORS LIGNE", ar: "دون اتصال" })}
              </span>
            </div>
            <Layers className="min-h-0 flex-1">
              {/* scan */}
              <Layer on={beat === 0} className="flex flex-col p-2">
                <p className={`${MONO_XS} uppercase tracking-[0.12em] text-faint`}>{tx({ en: "Scan plate", fr: "Scanner la plaque", ar: "مسح اللوحة" })}</p>
                <div className="relative mt-2 flex flex-1 items-center justify-center overflow-hidden bg-graphite">
                  <div className="relative border border-white/70 bg-white px-2 py-1">
                    <span className="erp-mono text-[12px] tracking-[0.08em] text-ink sm:text-[15px]" style={{ opacity: seg("--b0", 0.35, 0.55) }}>
                      09876-219-16
                    </span>
                    <span className="erp-tick tl" />
                    <span className="erp-tick br" />
                  </div>
                  <div className="absolute inset-x-0 top-0 h-full" style={{ transform: `translateY(${lerp(seg("--b0", 0.05, 0.55), 0, 100, "%")})` }}>
                    <span className="absolute inset-x-0 top-0 h-px bg-signal shadow-[0_0_8px_var(--erp-signal-glow)]" />
                  </div>
                </div>
                <div className="mt-2 border-t border-[var(--erp-hair)] pt-1.5" style={{ opacity: seg("--b0", 0.5, 0.7) }}>
                  <p className={`${MONO_XS} text-ink`}>✓ 09876-219-16</p>
                  <p className={`${MONO_XS} hidden text-faint sm:block`}>{tx({ en: "read on device · 0 requests", fr: "lu sur l'appareil · 0 requête", ar: "قُرئت على الجهاز · 0 طلب" })}</p>
                </div>
              </Layer>
              {/* new order */}
              <Layer on={beat >= 1} className="flex flex-col p-2">
                <p className={`${MONO_XS} uppercase tracking-[0.12em] text-faint`}>{tx({ en: "New job", fr: "Nouvel ordre", ar: "أمر جديد" })}</p>
                <dl className="mt-1.5 divide-y divide-[var(--erp-hair)]">
                  {[
                    ["id", "s-90b2"],
                    ["plate", "09876-219-16"],
                    ["vehicle", "Tucson · SUV"],
                    ["service", "Complet"],
                    ["price_da", "1 500"],
                    ["rate_bp", "3333"],
                    ["started_at", "10:42"],
                  ].map(([k, v]) => (
                    <div key={k} className={`items-baseline justify-between gap-1 py-[3px] sm:flex sm:py-1 ${k === "vehicle" || k === "started_at" ? "hidden" : "flex"}`}>
                      <dt className={`${MONO_XS} shrink-0 text-faint`}>{k}</dt>
                      <dd className={`${MONO_XS} min-w-0 truncate text-ink`}>{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-2">
                  <Pill s="IN_PROGRESS" lit={beat === 1} />
                </div>
                <div className={`mt-auto border-t border-[var(--erp-hair)] pt-1.5 ${MONO_XS}`}>
                  <span className={online ? "text-ink" : "text-signal-deep"}>
                    {beat === 1
                      ? tx({ en: "saved · 2 queued", fr: "enregistré · 2 en file", ar: "حُفظ · 2 في الطابور" })
                      : tx({ en: "synced · 0 queued", fr: "synchronisé · 0 en file", ar: "متزامن · 0 في الطابور" })}
                  </span>
                </div>
              </Layer>
            </Layers>
          </div>
        </div>
        <p className={`${MONO_XS} mt-1.5 text-center text-faint`}>{tx({ en: "crew app", fr: "app équipe", ar: "تطبيق الفريق" })}</p>
      </div>

      {/* sync lane */}
      <div className="min-w-0 space-y-2 md:space-y-3">
        <LaneBox
          head={
            <>
              {tx({ en: "PHONE", fr: "TÉLÉPHONE", ar: "الهاتف" })}<span className="hidden sm:inline"> · WatermelonDB</span>
            </>
          }
          badge={online ? tx({ en: "online", fr: "en ligne", ar: "متصل" }) : tx({ en: "offline", fr: "hors ligne", ar: "دون اتصال" })}
          badgeLit={!online}
        >
          {beat === 0 ? (
            <p className={`${MONO_XS} py-1 text-faint`}>{tx({ en: "queue empty", fr: "file vide", ar: "الطابور فارغ" })}</p>
          ) : (
            <>
              <LaneRow
                k="vehicles"
                id="+ v-7f3a"
                state={beat === 1 ? tx(Q_QUEUED) : beat === 2 ? tx(Q_PUSHED) : tx({ en: "deleted by pull", fr: "supprimé par le pull", ar: "حذفه السحب" })}
                strike={beat === 3}
                lit={beat === 3}
              />
              <LaneRow k="services" id="+ s-90b2" state={beat === 1 ? tx(Q_QUEUED) : tx(Q_PUSHED)} />
            </>
          )}
        </LaneBox>

        {/* link */}
        <div className="flex items-center gap-2 px-1">
          <svg viewBox="0 0 20 44" className="h-9 w-4 shrink-0 md:h-11" aria-hidden>
            <path
              d="M6 0 V44"
              stroke={online ? "var(--color-signal)" : "var(--erp-hair-2)"}
              strokeWidth="1.5"
              strokeDasharray="4 10"
              className={online ? "erp-flow" : ""}
            />
            <path d="M14 44 V0" stroke={online ? "var(--color-ink)" : "var(--erp-hair-2)"} strokeWidth="1" strokeDasharray="2 4" />
          </svg>
          <div className={`${MONO_XS} leading-relaxed`}>
            <p className={online ? "text-ink" : "text-faint"}>POST /sync/push ↓</p>
            <p className={online ? "text-ink" : "text-faint"}>GET /sync/pull ↑</p>
            {online ? (
              <p className="hidden text-mute sm:block">{tx({ en: "pull re-reads 10 s before the cursor", fr: "le pull relit 10 s avant le curseur", ar: "السحب يعيد قراءة 10 ث قبل المؤشّر" })}</p>
            ) : (
              <p className="text-signal-deep">{tx({ en: "no network — job continues", fr: "pas de réseau — l'ordre continue", ar: "لا شبكة — العمل مستمر" })}</p>
            )}
          </div>
        </div>

        <LaneBox head={`${tx({ en: "SERVER", fr: "SERVEUR", ar: "الخادم" })} · PostgreSQL`}>
          {beat < 2 ? (
            <p className={`${MONO_XS} py-1 text-faint`}>{tx({ en: "waiting for the device", fr: "en attente de l'appareil", ar: "في انتظار الجهاز" })}</p>
          ) : (
            <>
              <LaneRow k="1 clients" id="—" state={tx({ en: "nothing new", fr: "rien de neuf", ar: "لا جديد" })} dim />
              <LaneRow
                k="2 vehicles"
                id={beat === 3 ? "v-21c0" : "v-7f3a"}
                state={beat === 3 ? tx({ en: "plate exists", fr: "plaque existante", ar: "اللوحة موجودة" }) : "✓"}
                lit={beat === 3}
              />
              <LaneRow k="3 services" id="s-90b2" state={beat === 3 ? `${tx({ en: "vehicle", fr: "véhicule", ar: "المركبة" })} → v-21c0` : "✓"} lit={beat === 3} />
              <div
                className={`overflow-hidden transition-[max-height,opacity] duration-500 ${beat === 3 ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="mt-1.5 border border-signal/60 bg-[var(--erp-signal-soft)] px-2 py-1.5">
                  <p className={`${MONO_XS} text-signal-deep`}>sync_aliases</p>
                  <p className={`${MONO_XS} text-ink`}>vehicles · 7f3a… → 21c0…</p>
                </div>
              </div>
            </>
          )}
        </LaneBox>
      </div>
    </Figure>
  );
}

function LaneBox({ head, badge, badgeLit = false, children }: { head: ReactNode; badge?: string; badgeLit?: boolean; children: ReactNode }) {
  return (
    <div className="border border-[var(--erp-hair-2)] bg-paper/90">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--erp-hair)] px-2 py-1 md:px-2.5">
        <span className={`${MONO_XS} truncate uppercase tracking-[0.1em] text-mute`}>{head}</span>
        {badge && <span className={`${MONO_XS} shrink-0 ${badgeLit ? "text-signal-deep" : "text-ink"}`}>{badge}</span>}
      </div>
      <div className="px-2 py-1.5 md:px-2.5">{children}</div>
    </div>
  );
}

function LaneRow({ k, id, state, lit = false, strike = false, dim = false }: { k: string; id: string; state: string; lit?: boolean; strike?: boolean; dim?: boolean }) {
  return (
    <div className={`flex items-baseline gap-2 py-[3px] ${dim ? "opacity-50" : ""}`}>
      <span className={`${MONO_XS} hidden w-[5.5rem] shrink-0 text-faint sm:inline`}>{k}</span>
      <span className={`${MONO_XS} shrink-0 text-ink ${strike ? "line-through decoration-1" : ""}`}>{id}</span>
      <span className={`${MONO_XS} ms-auto truncate text-end transition-colors duration-500 ${lit ? "text-signal-deep" : "text-mute"}`}>{state}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 2 — live board                                                */
/* ------------------------------------------------------------------ */

type BoardRow = {
  id: string;
  plate: string;
  what: string;
  agent: string;
  st: [string, string, string];
  paid?: [boolean, boolean, boolean];
  from?: number;
  flag?: number;
};

const ROWS: BoardRow[] = [
  { id: "s-31c7", plate: "12345-116-16", what: "Clio · Extérieur", agent: "Yacine", st: ["IN_PROGRESS", "DONE", "DONE"] },
  { id: "s-5d02", plate: "55663-316-09", what: "Hilux · Complet", agent: "Sofiane", st: ["DONE", "DONE", "DONE"], paid: [false, true, true] },
  { id: "s-77e1", plate: "77880-122-31", what: "Berline · Intérieur", agent: "Yacine", st: ["IN_PROGRESS", "CANCELLED", "CANCELLED"] },
  { id: "s-90b2", plate: "09876-219-16", what: "Tucson · Complet", agent: "Yacine", st: ["IN_PROGRESS", "IN_PROGRESS", "IN_PROGRESS"], from: 0 },
  { id: "s-a4f0", plate: "09876-219-16", what: "Tucson · Extérieur", agent: "Sofiane", st: ["IN_PROGRESS", "IN_PROGRESS", "IN_PROGRESS"], from: 2, flag: 2 },
];

const EVENTS: { b: number; t: string; ev: string; rest: string | L }[] = [
  { b: 0, t: "10:58:02", ev: "service.created", rest: "s-90b2 → tenant:8c1e, agent:41d2" },
  { b: 1, t: "11:06:40", ev: "service.finished", rest: "s-31c7 commission_da 167" },
  { b: 1, t: "11:07:15", ev: "service.paid", rest: "s-5d02 CASH" },
  { b: 1, t: "11:09:31", ev: "service.cancelled", rest: { en: "s-77e1 by supervisor", fr: "s-77e1 par le superviseur", ar: "s-77e1 من المشرف" } },
  { b: 1, t: "11:09:31", ev: "sync.hint", rest: "{ service_id: s-77e1 } → agent:41d2" },
  { b: 2, t: "11:12:48", ev: "service.created", rest: "s-a4f0 flags [DUPLICATE_IN_PROGRESS]" },
  { b: 2, t: "11:12:48", ev: "audit · flag", rest: "{ overlaps: s-90b2 }" },
];

function BoardScene() {
  const tx = useTx();
  return (
    <Scene id="wash-board" beats={3} length={65} label={tx({ en: "Live board", fr: "Tableau en direct", ar: "اللوحة الحيّة" })}>
      <SceneLayout copy={<CopyCol beats={BOARD} />} figure={<BoardFigure />} wide />
    </Scene>
  );
}

function BoardFigure() {
  const tx = useTx();
  const { beat } = useScene();
  const events = EVENTS.filter((e) => e.b <= beat).slice(-5);
  return (
    <Figure
      fig="FIG. 03.2"
      title={{ en: "Supervisor · live board", fr: "Superviseur · tableau en direct", ar: "المشرف · اللوحة الحيّة" }}
      className="w-full max-w-[780px] [contain:inline-size]"
      bodyClassName="p-3 md:p-5"
    >
      <div className="flex items-center justify-between border-b border-[var(--erp-hair)] pb-2">
        <span className={`${MONO_XS} uppercase tracking-[0.12em] text-mute`}>{tx({ en: "Today · all crews", fr: "Aujourd'hui · toutes équipes", ar: "اليوم · كل الفرق" })}</span>
        <span className={`${MONO_XS} flex items-center gap-1.5 text-ink`}>
          <span className="erp-dot erp-breathe" data-lit="" /> socket /live
        </span>
      </div>

      <div className="mt-1">
        <div className={`${MONO_XS} grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-1.5 uppercase tracking-[0.1em] text-faint sm:grid-cols-[6.6rem_minmax(0,1fr)_4.2rem_minmax(0,7.5rem)]`}>
          <span>{tx({ en: "plate", fr: "plaque", ar: "اللوحة" })}</span>
          <span className="hidden sm:block">{tx({ en: "vehicle · service", fr: "véhicule · prestation", ar: "المركبة · الخدمة" })}</span>
          <span className="hidden sm:block">agent</span>
          <span className="text-end sm:text-start">{tx({ en: "status", fr: "statut", ar: "الحالة" })}</span>
        </div>
        {ROWS.map((r) => {
          const visible = r.from === undefined || beat >= r.from;
          const s = r.st[beat];
          const paid = r.paid?.[beat] ?? false;
          const changed =
            (r.from !== undefined && r.from === beat) ||
            (beat > 0 && (r.st[beat] !== r.st[beat - 1] || (r.paid && r.paid[beat] !== r.paid[beat - 1])));
          const flagged = r.flag !== undefined && beat >= r.flag;
          return (
            <div
              key={r.id}
              className={`grid overflow-hidden transition-[max-height,opacity] duration-700 ease-[var(--erp-ease)] ${visible ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}`}
            >
              <div
                className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-[var(--erp-hair)] py-1 ps-1.5 sm:py-1.5 transition-colors duration-500 sm:grid-cols-[6.6rem_minmax(0,1fr)_4.2rem_minmax(0,7.5rem)] ${
                  changed ? "border-s-2 border-s-signal bg-[var(--erp-signal-soft)]" : "border-s-2 border-s-transparent"
                }`}
              >
                <span className={`${MONO_XS} text-ink`}>{r.plate}</span>
                <span className="hidden truncate text-[0.8rem] text-graphite sm:block">{r.what}</span>
                <span className="hidden text-[0.8rem] text-graphite sm:block">{r.agent}</span>
                <span className="flex flex-wrap items-center justify-end gap-1 sm:justify-start">
                  <Pill s={s} lit={changed && !flagged} />
                  {paid && <span className={`${MONO_XS} text-ink`}>· {tx({ en: "paid", fr: "payé", ar: "مدفوع" })}</span>}
                </span>
              </div>
              {flagged && (
                <div className="flex flex-wrap items-center gap-2 border-s-2 border-s-signal bg-[var(--erp-signal-soft)] px-1.5 pb-1.5">
                  <span className={`${MONO_XS} border border-signal bg-paper px-1.5 py-px text-signal-deep`}>⚑ DUPLICATE_IN_PROGRESS</span>
                  <span className={`${MONO_XS} hidden text-graphite sm:inline`}>
                    {tx({ en: "overlaps s-90b2 · kept for review", fr: "chevauche s-90b2 · gardé pour revue", ar: "يتداخل مع s-90b2 · محفوظ للمراجعة" })}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* socket frames */}
      <div className="mt-3 border border-[var(--erp-hair)] bg-shell/40 p-2 md:p-2.5">
        <p className={`${MONO_XS} mb-1 uppercase tracking-[0.12em] text-faint`}>{tx({ en: "frames received", fr: "trames reçues", ar: "الإطارات المستلمة" })}</p>
        <ul className="space-y-0.5">
          {events.map((e, i) => (
            <li key={`${e.t}-${e.ev}-${i}`} className={`${MONO_XS} gap-2 truncate ${i < events.length - 3 ? "hidden sm:flex" : "flex"}`}>
              <span className="hidden shrink-0 text-faint sm:inline">{e.t}</span>
              <span className={`shrink-0 ${e.b === beat ? "text-signal-deep" : "text-ink"}`}>{e.ev}</span>
              <span className="truncate text-mute">{tx(e.rest)}</span>
            </li>
          ))}
        </ul>
      </div>
    </Figure>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 3 — commission and payouts                                    */
/* ------------------------------------------------------------------ */

type Job = { id: string; what: string; price: number; bp: number; st: string; com: number; from: number };

const JOBS: Job[] = [
  { id: "s-90b2", what: "Complet · SUV", price: 1500, bp: 3333, st: "DONE", com: 500, from: 0 },
  { id: "s-31c7", what: "Extérieur · Citadine", price: 500, bp: 3333, st: "DONE", com: 167, from: 0 },
  { id: "s-77e1", what: "Intérieur · Berline", price: 700, bp: 3333, st: "CANCELLED", com: 0, from: 0 },
  { id: "s-c3e0", what: "Complet · Berline", price: 1200, bp: 3000, st: "DONE", com: 360, from: 1 },
  { id: "s-d915", what: "Intérieur · Berline", price: 700, bp: 3000, st: "DONE", com: 210, from: 1 },
];

const fmt = (n: number) => n.toLocaleString("fr-FR").replace(/ | /g, " ");

function MoneyScene() {
  const tx = useTx();
  return (
    <Scene id="wash-money" beats={3} length={65} label={tx({ en: "Commission", fr: "Commission", ar: "العمولة" })}>
      <SceneLayout copy={<CopyCol beats={MONEY} />} figure={<MoneyFigure />} />
      <LightUp nodes={["payroll"]} at={0.72} />
    </Scene>
  );
}

function MoneyFigure() {
  const tx = useTx();
  const num = useNumber();
  const { beat } = useScene();
  const rate = beat >= 1 ? 3000 : 3333;
  const earned = JOBS.filter((j) => j.from <= beat).reduce((a, j) => a + j.com, 0);
  return (
    <Figure
      fig="FIG. 03.3"
      title={{ en: "Yacine Agent · commission", fr: "Yacine Agent · commission", ar: "Yacine Agent · العمولة" }}
      className="w-full max-w-[680px] [contain:inline-size]"
      bodyClassName="p-3 md:p-5"
    >
      {/* organization rate */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--erp-hair)] pb-3">
        <div>
          <p className={`${MONO_XS} uppercase tracking-[0.12em] text-faint`}>{tx({ en: "organization", fr: "organisation", ar: "المؤسسة" })} · commission_rate_bp</p>
          <div className="mt-1 flex items-baseline gap-3">
            <span className={`erp-display text-[2rem] leading-none transition-colors duration-500 md:text-[2.6rem] ${beat === 1 ? "text-signal-deep" : "text-ink"}`}>
              {rate}
            </span>
            <span className={`${MONO_XS} text-mute`} dir="ltr">= {num(rate / 100, 2)} %</span>
          </div>
        </div>
        <span
          className={`${MONO_XS} border px-2 py-0.5 transition-opacity duration-500 ${beat >= 1 ? "border-signal text-signal-deep opacity-100" : "opacity-0"}`}
        >
          {tx({ en: "changed 14:20 · 3333 → 3000", fr: "modifié 14:20 · 3333 → 3000", ar: "عُدّل 14:20 · 3333 → 3000" })}
        </span>
      </div>

      {/* jobs */}
      <div className={`${MONO_XS} mt-2 grid grid-cols-[3.4rem_3rem_2.6rem_minmax(0,1fr)_2.6rem] gap-x-2 py-1 uppercase tracking-[0.08em] text-faint sm:grid-cols-[4rem_minmax(0,1fr)_3.8rem_3.6rem_6rem_4rem] sm:gap-x-4`}>
        <span>{tx({ en: "job", fr: "ordre", ar: "الأمر" })}</span>
        <span className="hidden sm:block">{tx({ en: "work", fr: "travail", ar: "العمل" })}</span>
        <span className="text-end">DA</span>
        <span className="text-end">bp</span>
        <span>{tx({ en: "state", fr: "état", ar: "الحالة" })}</span>
        <span className="text-end">{tx({ en: "comm.", fr: "comm.", ar: "عمولة" })}</span>
      </div>
      {JOBS.map((j) => {
        const on = beat >= j.from;
        const fresh = j.from === 1 && beat === 1;
        const kept = j.bp === 3333 && beat >= 1;
        return (
          <div
            key={j.id}
            className={`grid overflow-hidden transition-[max-height,opacity] duration-700 ease-[var(--erp-ease)] ${on ? "max-h-16 opacity-100" : "max-h-0 opacity-0"}`}
          >
            <div
              className={`grid grid-cols-[3.4rem_3rem_2.6rem_minmax(0,1fr)_2.6rem] items-center gap-x-2 border-t border-[var(--erp-hair)] py-1.5 sm:grid-cols-[4rem_minmax(0,1fr)_3.8rem_3.6rem_6rem_4rem] sm:gap-x-4 ${
                fresh ? "bg-[var(--erp-signal-soft)]" : ""
              }`}
            >
              <span className={`${MONO_XS} text-ink`}>{j.id}</span>
              <span className="hidden truncate text-[0.8rem] text-graphite sm:block">{j.what}</span>
              <span className={`${MONO_XS} text-end text-ink`}>{fmt(j.price)}</span>
              <span className={`${MONO_XS} text-end ${kept ? "text-ink underline decoration-signal decoration-2 underline-offset-4" : fresh ? "text-signal-deep" : "text-ink"}`}>
                {j.bp}
              </span>
              <span className="min-w-0">
                <Pill s={j.st} />
              </span>
              <span className={`${MONO_XS} text-end ${j.com ? "text-ink" : "text-faint"}`}>{fmt(j.com)}</span>
            </div>
          </div>
        );
      })}

      {/* formula / payout */}
      <Layers className="mt-3">
        <Layer on={beat === 0}>
          <Formula
            label={tx({ en: "computed at DONE", fr: "calculé à DONE", ar: "يُحسب عند DONE" })}
            expr="round(1 500 × 3333 / 10 000) = round(499.95) = 500"
          />
        </Layer>
        <Layer on={beat === 1}>
          <Formula
            label={tx({ en: "snapshots kept · new rate on new jobs", fr: "instantanés gardés · nouveau taux sur les nouveaux", ar: "اللقطات محفوظة · النسبة الجديدة على الجديد" })}
            expr="round(1 200 × 3000 / 10 000) = 360"
          />
        </Layer>
        <Layer on={beat === 2}>
          <div className="border border-ink bg-paper">
            <div className="grid grid-cols-3 divide-x divide-[var(--erp-hair)]">
              <Cell k="earned_da" v={fmt(earned)} />
              <Cell k="paid_da" v={`− ${fmt(1000)}`} note={tx({ en: "payout · Karim Supervisor", fr: "versement · Karim Supervisor", ar: "دفعة · Karim Supervisor" })} />
              <Cell k="due_da" v={fmt(earned - 1000)} lit />
            </div>
          </div>
        </Layer>
      </Layers>
    </Figure>
  );
}

function Formula({ label, expr }: { label: string; expr: string }) {
  return (
    <div className="border border-[var(--erp-hair-2)] bg-shell/40 px-3 py-2">
      <p className={`${MONO_XS} uppercase tracking-[0.1em] text-faint`}>{label}</p>
      <p className="erp-mono mt-1 text-[12px] text-ink md:text-[0.82rem]">{expr}</p>
    </div>
  );
}

function Cell({ k, v, note, lit = false }: { k: string; v: string; note?: string; lit?: boolean }) {
  return (
    <div className={`px-2 py-2 md:px-3 ${lit ? "bg-[var(--erp-signal-soft)]" : ""}`}>
      <p className={`${MONO_XS} text-faint`}>{k}</p>
      <p className={`erp-display mt-0.5 text-[1.25rem] leading-none md:text-[1.6rem] ${lit ? "text-signal-deep" : "text-ink"}`}>{v}</p>
      {note && <p className={`${MONO_XS} mt-1 hidden text-mute sm:block`}>{note}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 4 — audit diffs and refresh-token rotation                    */
/* ------------------------------------------------------------------ */

/** Each diff is a list of `"key":value` pairs; lines may only wrap between pairs. */
const AUDIT_ROWS: { act: string; who: string; diff: string[] }[] = [
  { act: "finish", who: "Yacine", diff: [`"status":["IN_PROGRESS","DONE"]`, `"commission_da":500`] },
  { act: "pay", who: "Yacine", diff: [`"is_paid":[false,true]`, `"payment_method":"CASH"`] },
  { act: "flag", who: "system", diff: [`"flag":"DUPLICATE_IN_PROGRESS"`, `"overlaps":"s-90b2"`] },
  { act: "cancel", who: "Karim", diff: [`"status":["IN_PROGRESS","CANCELLED"]`, `"commission_da":[0,0]`] },
];

function DiffLine({ pairs }: { pairs: string[] }) {
  return (
    <p className="erp-mono mt-0.5 text-[11px] leading-snug text-graphite md:text-[0.72rem]">
      {"{"}
      {pairs.map((p, i) => (
        <span key={p}>
          <span className="whitespace-nowrap">
            {p}
            {i < pairs.length - 1 ? "," : "}"}
          </span>
          {i < pairs.length - 1 && <wbr />}
        </span>
      ))}
    </p>
  );
}

function TrustScene() {
  const tx = useTx();
  return (
    <Scene id="wash-trust" beats={2} length={70} label={tx({ en: "Audit and sessions", fr: "Audit et sessions", ar: "التدقيق والجلسات" })}>
      <SceneLayout copy={<CopyCol beats={TRUST} />} figure={<TrustFigure />} />
      <LightUp nodes={["audit"]} at={0.25} />
    </Scene>
  );
}

function TrustFigure() {
  const tx = useTx();
  const { beat } = useScene();
  return (
    <div className="w-full max-w-[680px] space-y-4 [contain:inline-size]">
      <Figure
        fig="FIG. 03.4a"
        title={{ en: "audit_logs · entity = service", fr: "audit_logs · entity = service", ar: "audit_logs · entity = service" }}
        bodyClassName="p-3 md:p-4"
        className={`transition-opacity duration-500 ${beat === 0 ? "opacity-100" : "max-md:hidden opacity-40"}`}
      >
        <ul className="space-y-2">
          {AUDIT_ROWS.map((r, i) => (
            <li key={r.act} className="border-s-2 border-[var(--erp-hair-2)] ps-2.5" style={rise("--b0", 0.05 + i * 0.13, 0.2 + i * 0.13, 10)}>
              <p className={`${MONO_XS} flex flex-wrap gap-x-2 text-faint`}>
                <span className={r.act === "flag" ? "text-signal-deep" : "text-ink"}>{r.act}</span>
                <span>· {r.who === "system" ? "user_id null" : r.who}</span>
              </p>
              <DiffLine pairs={r.diff} />
            </li>
          ))}
        </ul>
        <p className={`${MONO_XS} mt-3 border-t border-[var(--erp-hair)] pt-2 text-mute`}>
          {tx({ en: "same transaction as the change", fr: "même transaction que la modification", ar: "في معاملة التغيير نفسها" })}
        </p>
      </Figure>

      <Figure
        fig="FIG. 03.4b"
        title={{ en: "refresh_tokens · one user", fr: "refresh_tokens · un utilisateur", ar: "refresh_tokens · مستخدم واحد" }}
        bodyClassName="p-3 md:p-4"
        className={`transition-opacity duration-500 ${beat === 1 ? "opacity-100" : "max-md:hidden opacity-40"}`}
      >
        <TokenChain />
      </Figure>
    </div>
  );
}

function TokenChain() {
  const tx = useTx();
  const replay = seg("--b1", 0.15, 0.4);
  const kill = seg("--b1", 0.45, 0.7);
  const tokens = [
    { n: "rt·1", h: "9f2c…e1", note: "replaced_by rt·2" },
    { n: "rt·2", h: "41ab…07", note: "replaced_by rt·3" },
    { n: "rt·3", h: "c83d…5a", note: tx({ en: "active", fr: "actif", ar: "نشط" }) },
  ];
  return (
    <div>
      <div className="grid grid-cols-3 gap-2" dir="ltr">
        {tokens.map((t, i) => (
          <div key={t.n} className="relative border border-[var(--erp-hair-2)] bg-paper p-2">
            {i === 0 && <span className="pointer-events-none absolute -inset-px border border-dashed border-signal" style={{ opacity: replay }} aria-hidden />}
            {i === 2 && <span className="pointer-events-none absolute inset-0 border-2 border-signal bg-[var(--erp-signal-soft)]" style={{ opacity: kill }} aria-hidden />}
            <p className={`${MONO_XS} relative ${i === 2 ? "text-ink" : "text-faint"}`}>{t.n}</p>
            <p className={`${MONO_XS} relative truncate text-mute`}>
              <span className="hidden sm:inline">sha256 </span>
              {t.h}
            </p>
            {i < 2 ? (
              <p className={`${MONO_XS} relative mt-1 text-faint`}>{t.note}</p>
            ) : (
              <Layers className="relative mt-1">
                <p className={`${MONO_XS} text-ink`} style={{ opacity: `calc(1 - ${kill})` }}>{t.note}</p>
                <p className={`${MONO_XS} text-signal-deep`} style={{ opacity: kill }}>revoked_at · reuse</p>
              </Layers>
            )}
            {i < 2 && <span className={`${MONO_XS} absolute -end-2 top-1/2 z-10 -translate-y-1/2 translate-x-1/2 bg-paper text-faint`}>→</span>}
          </div>
        ))}
      </div>
      <Layers className="mt-3">
        <div className="flex items-start gap-2" style={{ opacity: `calc(1 - ${replay})` }}>
          <span className={`${MONO_XS} shrink-0 border border-[var(--erp-hair-2)] bg-paper px-1.5 py-px text-ink`}>POST /auth/refresh rt·2</span>
          <span className={`${MONO_XS} text-graphite`}>
            {tx({ en: "→ rt·3 issued, rt·2 retired", fr: "→ rt·3 émis, rt·2 retiré", ar: "صدر rt·3، وأُبطل rt·2" })}
          </span>
        </div>
        <div className="flex items-start gap-2" style={{ opacity: replay }}>
          <span className={`${MONO_XS} shrink-0 border border-signal bg-[var(--erp-signal-soft)] px-1.5 py-px text-signal-deep`}>POST /auth/refresh rt·1</span>
          <span className={`${MONO_XS} text-graphite`}>
            {tx({ en: "a retired token, presented again = reuse", fr: "un jeton retiré, présenté à nouveau = réutilisation", ar: "رمز مُبطَل يُقدَّم مجددًا = إعادة استخدام" })}
          </span>
        </div>
      </Layers>
      <p className={`${MONO_XS} mt-2 text-ink`} style={{ opacity: kill }}>
        → {tx({ en: "every session of this user revoked · 401", fr: "toutes les sessions de l'utilisateur révoquées · 401", ar: "أُلغيت كل جلسات المستخدم · 401" })}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter                                                             */
/* ------------------------------------------------------------------ */

export default function WashChapter() {
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
        facts={[
          { value: 25, label: { en: "data models", fr: "modèles de données", ar: "نموذج بيانات" } },
          { value: 76, label: { en: "API endpoints", fr: "points d'accès API", ar: "نقطة وصول API" } },
          { value: 2, label: { en: "roles: SUPERVISOR, AGENT", fr: "rôles : SUPERVISOR, AGENT", ar: "دوران: SUPERVISOR وAGENT" } },
          { value: 1250, prefix: "~", label: { en: "automated tests", fr: "tests automatisés", ar: "اختبار آلي" } },
        ]}
        aside={<LifeFigure />}
      />

      <OfflineScene />
      <BoardScene />
      <MoneyScene />
      <TrustScene />

      <Section id="wash-journey" kicker={JOURNEY.kicker} title={JOURNEY.title} intro={JOURNEY.intro}>
        <Walkthrough steps={JOURNEY.steps} />
      </Section>

      <Section id="wash-decisions" kicker={DECISIONS.kicker} title={DECISIONS.title} dark>
        <Decisions items={DECISIONS.items} />
      </Section>

      <Section id="wash-proof" kicker={PROOF.kicker} title={PROOF.title}>
        <ProofStrip items={PROOF.items} />
        <p className="erp-display mt-12 max-w-[40ch] text-[clamp(1.3rem,2.2vw,1.9rem)] text-ink">{tx(PROOF.closing)}</p>
      </Section>
    </>
  );
}
