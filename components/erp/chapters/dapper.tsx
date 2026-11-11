"use client";

/**
 * Chapter 4 — Dapper: the back office & the portal.
 * Order lifecycle as a state machine, a forged total caught by arithmetic,
 * a deny-by-default policy table, three installable apps on one core, and
 * the stock log behind the counter.
 */

import { useState, type ReactNode } from "react";
import { useNumber, useTx, type L } from "@/lib/erp/i18n";
import { CHAPTERS } from "@/lib/erp/nodes";
import { inv, lerp, seg } from "@/lib/erp/sv";
import { At, AtStack, LightUp, Scene, useScene, useSceneProgress } from "../engine";
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
  Walkthrough,
} from "../ui";

const META = CHAPTERS[3];

type Beat = { kicker: L; title: L; body: L; details?: L[] };

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

const COVER = {
  oneLiner: {
    en: "One order, three apps, and a record of everything that happened to it.",
    fr: "Une commande, trois applications, et la trace de tout ce qui lui est arrivé.",
    ar: "طلبية واحدة، ثلاثة تطبيقات، وسجلّ لكل ما جرى لها.",
  },
  context: [
    {
      en: "Dapper was built for an apparel brand in Algeria: a customer portal where orders are placed and followed, a back office where they are confirmed, prepared and shipped, and a counter app that staff install on a phone.",
      fr: "Dapper a été construit pour une marque de vêtements en Algérie : un portail client où les commandes sont passées et suivies, un back-office où elles sont confirmées, préparées et expédiées, et une application comptoir que le personnel installe sur un téléphone.",
      ar: "بُني Dapper لعلامة ملابس في الجزائر: بوابة للعملاء تُقدَّم فيها الطلبيات وتُتابَع، ومكتب خلفي تُؤكَّد فيه وتُحضَّر وتُشحن، وتطبيق للشبّاك يثبّته الموظفون على الهاتف.",
    },
    {
      en: "Underneath sits one data model and one access table. The interesting part is not the screens. It is what the system refuses: a total it did not compute, a permission nobody granted, a collection without a policy.",
      fr: "Dessous : un seul modèle de données et une seule table d'accès. L'intéressant n'est pas dans les écrans, mais dans ce que le système refuse : un total qu'il n'a pas calculé, une permission que personne n'a accordée, une collection sans politique.",
      ar: "وتحتها نموذج بيانات واحد وجدول صلاحيات واحد. الأهمّ ليس الشاشات، بل ما يرفضه النظام: مجموعًا لم يحسبه، وصلاحية لم يمنحها أحد، ومجموعة بيانات بلا سياسة وصول.",
    },
  ] as L[],
  roles: [
    {
      name: { en: "Customer", fr: "Client", ar: "العميل" },
      does: {
        en: "Places and follows orders in the portal, and sees only their own.",
        fr: "Passe et suit ses commandes sur le portail, et ne voit que les siennes.",
        ar: "يقدّم طلبياته ويتابعها في البوابة، ولا يرى إلا طلبياته.",
      },
    },
    {
      name: { en: "Order desk", fr: "Service commandes", ar: "مكتب الطلبيات" },
      does: {
        en: "Confirms by phone, moves orders through the board, books parcels with the carrier.",
        fr: "Confirme par téléphone, fait avancer les commandes sur le tableau, réserve les colis chez le transporteur.",
        ar: "يؤكّد هاتفيًا، يحرّك الطلبيات على اللوحة، ويحجز الطرود لدى شركة النقل.",
      },
    },
    {
      name: { en: "Counter staff", fr: "Personnel comptoir", ar: "موظفو الشبّاك" },
      does: {
        en: "Scans barcodes and looks up stock, without being able to touch a price.",
        fr: "Scanne les codes-barres et consulte le stock, sans pouvoir toucher à un prix.",
        ar: "يمسح الرموز الشريطية ويطّلع على المخزون، دون أن يستطيع تغيير أي سعر.",
      },
    },
    {
      name: { en: "Owner", fr: "Gérant", ar: "المالك" },
      does: {
        en: "Names the roles, ticks their permissions, exports the data.",
        fr: "Nomme les rôles, coche leurs permissions, exporte les données.",
        ar: "يسمّي الأدوار، يحدّد صلاحياتها، ويصدّر البيانات.",
      },
    },
  ],
  platforms: [
    { en: "Customer portal · installable web app", fr: "Portail client · web app installable", ar: "بوابة العملاء · تطبيق ويب قابل للتثبيت" },
    { en: "Back office · installable web app", fr: "Back-office · web app installable", ar: "المكتب الخلفي · تطبيق ويب قابل للتثبيت" },
    { en: "Counter app · on a staff phone", fr: "App comptoir · sur téléphone", ar: "تطبيق الشبّاك · على هاتف الموظف" },
    { en: "EN · FR · AR", fr: "EN · FR · AR", ar: "EN · FR · AR" },
  ] as L[],
  facts: [
    { value: 26, label: { en: "bo_ tables of jsonb documents", fr: "tables bo_ de documents jsonb", ar: "جدول bo_ لوثائق jsonb" } },
    { value: 20, label: { en: "API routes behind one policy table", fr: "routes API derrière une table de politiques", ar: "مسار API خلف جدول سياسات واحد" } },
    { value: 10, label: { en: "order statuses, each move stored", fr: "statuts de commande, chaque passage enregistré", ar: "حالات للطلبية، كل انتقال محفوظ" } },
    { value: 3, label: { en: "installable apps on one data model", fr: "apps installables, un seul modèle", ar: "تطبيقات قابلة للتثبيت بنموذج واحد" } },
  ],
};

const LIFECYCLE: Beat[] = [
  {
    kicker: { en: "04.1 — Order lifecycle", fr: "04.1 — Cycle de vie", ar: "04.1 — دورة حياة الطلبية" },
    title: {
      en: "An order is a state machine, not a row someone edits.",
      fr: "Une commande est une machine à états, pas une ligne qu'on modifie.",
      ar: "الطلبية آلة حالات، لا سطرًا يعدّله أحدهم.",
    },
    body: {
      en: "It carries a status and a history. Every change of status appends a status event: which status, when, by whom. The order can always say how it got where it is.",
      fr: "Elle porte un statut et un historique. Chaque changement de statut ajoute un événement : quel statut, quand, par qui. La commande peut toujours dire comment elle en est arrivée là.",
      ar: "تحمل حالة وتاريخًا. كل تغيير في الحالة يضيف حدثًا: أي حالة، متى، وبيد من. هكذا تستطيع الطلبية دائمًا أن تقول كيف وصلت إلى ما هي عليه.",
    },
    details: [
      {
        en: "pending is the only status an order may arrive in from outside. The server refuses anything else.",
        fr: "pending est le seul statut dans lequel une commande peut arriver de l'extérieur. Le serveur refuse tout le reste.",
        ar: "pending هي الحالة الوحيدة التي يمكن أن تصل بها طلبية من الخارج، والخادم يرفض ما عداها.",
      },
      {
        en: "Cash on delivery puts the first decision on the phone: the desk rings the customer, then moves the order to confirmed.",
        fr: "Avec le paiement à la livraison, la première décision se prend au téléphone : le service appelle le client, puis passe la commande en confirmed.",
        ar: "مع الدفع عند الاستلام، يُتّخذ القرار الأول عبر الهاتف: يتّصل المكتب بالعميل ثم ينقل الطلبية إلى confirmed.",
      },
    ],
  },
  {
    kicker: { en: "04.1 — Hand-offs", fr: "04.1 — Passages de relais", ar: "04.1 — تسليم المهام" },
    title: {
      en: "Each status tells the next person what is theirs to do.",
      fr: "Chaque statut dit à la personne suivante ce qui lui revient.",
      ar: "كل حالة تخبر الشخص التالي بما عليه أن يفعله.",
    },
    body: {
      en: "Confirmed, preparing, packed. The board is simply the list of what is waiting where, read from the status field. The history underneath grows by one event per move.",
      fr: "Confirmée, en préparation, emballée. Le tableau n'est que la liste de ce qui attend où, lue depuis le statut. L'historique en dessous s'allonge d'un événement à chaque passage.",
      ar: "مؤكَّدة، قيد التحضير، مغلَّفة. اللوحة ليست سوى قائمة بما ينتظر وأين، مقروءة من حقل الحالة. والتاريخ تحتها يزداد حدثًا مع كل انتقال.",
    },
    details: [
      {
        en: "Each event is the same small shape: { status, at, by }.",
        fr: "Chaque événement a la même forme : { status, at, by }.",
        ar: "لكل حدث الشكل نفسه: { status, at, by }.",
      },
      {
        en: "Who confirmed this, and when, is answered by the order itself, not by asking around.",
        fr: "Qui a confirmé, et quand : la commande répond elle-même, sans enquête.",
        ar: "من أكّد هذه الطلبية ومتى؟ الجواب في الطلبية نفسها، لا في السؤال هنا وهناك.",
      },
    ],
  },
  {
    kicker: { en: "04.1 — The carrier", fr: "04.1 — Le transporteur", ar: "04.1 — شركة النقل" },
    title: {
      en: "The carrier speaks its own language. The system translates.",
      fr: "Le transporteur parle sa langue. Le système traduit.",
      ar: "لشركة النقل لغتها الخاصة، والنظام يترجم.",
    },
    body: {
      en: "Parcels are booked through the carrier's API, in batches where each entry reports its own success. The carrier's status text is then mapped onto the same states. A failed delivery attempt maps back to shipped: the parcel is still with the courier.",
      fr: "Les colis sont réservés via l'API du transporteur, par lots où chaque entrée rapporte son propre résultat. Le texte de statut du transporteur est ensuite ramené aux mêmes états. Une tentative échouée revient à shipped : le colis est toujours chez le livreur.",
      ar: "تُحجز الطرود عبر واجهة برمجة شركة النقل، على دفعات يُبلغ فيها كل عنصر بنتيجته. ثم تُترجم نصوص حالات الناقل إلى الحالات نفسها. ومحاولة التسليم الفاشلة تعود إلى shipped: فالطرد ما زال لدى المندوب.",
    },
    details: [
      {
        en: "The carrier token never reaches a browser. The server asks; the portal is told a number.",
        fr: "Le jeton du transporteur n'atteint jamais un navigateur. Le serveur demande, le portail reçoit un chiffre.",
        ar: "رمز شركة النقل لا يصل أبدًا إلى المتصفح. الخادم يسأل، والبوابة تتلقّى رقمًا.",
      },
      {
        en: "Shipping fees are asked from the carrier instead of a hand-kept table of 58 wilayas × two prices that goes stale.",
        fr: "Les frais de livraison sont demandés au transporteur plutôt qu'à une table de 58 wilayas × deux prix tenue à la main.",
        ar: "تُطلب رسوم الشحن من الناقل بدل جدول يدوي من 58 ولاية × سعرين يتقادم بسرعة.",
      },
    ],
  },
  {
    kicker: { en: "04.1 — Exits", fr: "04.1 — Sorties", ar: "04.1 — المخارج" },
    title: {
      en: "Exits put back exactly what came out.",
      fr: "Les sorties remettent exactement ce qui est sorti.",
      ar: "المخارج تعيد بالضبط ما خرج.",
    },
    body: {
      en: "Cancelled, returned, refunded. When an order is delivered it records what it took off the shelves, size by size. An exit reads that record back, so the stock that returns is the stock that left. Nothing is estimated.",
      fr: "Annulée, retournée, remboursée. À la livraison, la commande enregistre ce qu'elle a retiré des rayons, taille par taille. Une sortie relit cet enregistrement : le stock qui revient est celui qui est parti. Rien n'est estimé.",
      ar: "ملغاة، مُرجَعة، مستردّة. عند التسليم تسجّل الطلبية ما أخذته من الرفوف، مقاسًا بمقاس. وعند الخروج يُقرأ ذلك السجل من جديد، فيعود إلى المخزون ما خرج منه بالضبط، دون تقدير.",
    },
    details: [
      {
        en: "Refund and cancel sit behind their own permission, orders.refund, apart from moving orders.",
        fr: "Rembourser et annuler relèvent d'une permission à part, orders.refund, distincte du déplacement des commandes.",
        ar: "الاسترداد والإلغاء خلف صلاحية مستقلة، orders.refund، منفصلة عن تحريك الطلبيات.",
      },
      {
        en: "Staff actions across the back office also land in an activity log, written from about 39 points.",
        fr: "Les actions du personnel alimentent aussi un journal d'activité, écrit depuis environ 39 points du back-office.",
        ar: "تُسجَّل أفعال الموظفين أيضًا في سجل نشاط يُكتب من نحو 39 موضعًا في المكتب الخلفي.",
      },
    ],
  },
];

const TAMPER: Beat[] = [
  {
    kicker: { en: "04.2 — Tamper check", fr: "04.2 — Contrôle d'intégrité", ar: "04.2 — كشف التلاعب" },
    title: {
      en: "The total arrives from the browser. It is treated as a claim.",
      fr: "Le total arrive du navigateur. Il est traité comme une affirmation.",
      ar: "المجموع يصل من المتصفح، فيُعامَل كادّعاء.",
    },
    body: {
      en: "The customer's browser works out lines, discount, shipping and total, and sends them with the order. Anyone can change the last number before it leaves. An order claiming to be worth 1 DZD looks like any other order on arrival.",
      fr: "Le navigateur du client calcule lignes, remise, livraison et total, et les envoie avec la commande. N'importe qui peut changer le dernier chiffre avant l'envoi. Une commande qui prétend valoir 1 DZD ressemble à toutes les autres à l'arrivée.",
      ar: "يحسب متصفح العميل البنود والخصم والشحن والمجموع ويرسلها مع الطلبية. ويمكن لأي أحد أن يغيّر الرقم الأخير قبل الإرسال. طلبية تدّعي أن قيمتها 1 دج تبدو عند وصولها كأي طلبية أخرى.",
    },
  },
  {
    kicker: { en: "04.2 — Shape gate", fr: "04.2 — Contrôle de forme", ar: "04.2 — بوابة الشكل" },
    title: {
      en: "The server bounds what a stranger can write.",
      fr: "Le serveur borne ce qu'un inconnu peut enregistrer.",
      ar: "الخادم يحدّ ما يمكن لغريب أن يخزّنه.",
    },
    body: {
      en: "The public may create an order, never read it back or update it. Creation passes a shape gate: it arrives pending, with 1 to 30 pieces, a name, a phone, a wilaya, a total from 0 to under 10 000 000, and no claim that stock is already held. The forged order passes. 1 is a possible number.",
      fr: "Le public peut créer une commande, jamais la relire ni la modifier. La création passe un contrôle de forme : arrivée en pending, 1 à 30 pièces, un nom, un téléphone, une wilaya, un total de 0 à moins de 10 000 000, et aucun stock prétendument réservé. La commande falsifiée passe : 1 est un nombre possible.",
      ar: "يمكن للعموم إنشاء طلبية، لا قراءتها ولا تعديلها. ويمرّ الإنشاء ببوابة شكل: تصل بحالة pending، من 1 إلى 30 قطعة، باسم وهاتف وولاية، ومجموع من 0 إلى أقل من 10 000 000، دون ادّعاء أن المخزون محجوز. والطلبية المزوّرة تمرّ، فالرقم 1 ممكن.",
    },
    details: [
      {
        en: "Create, never update: that is what stops a stranger editing an order's total by posting to its id.",
        fr: "Créer, jamais modifier : c'est ce qui empêche un inconnu de changer le total d'une commande en écrivant sur son identifiant.",
        ar: "إنشاء دون تعديل: هذا ما يمنع الغريب من تغيير مجموع طلبية بالكتابة على معرّفها.",
      },
      {
        en: "The gate is a bound, not business logic. It decides what may be stored, not whether it is honest.",
        fr: "Ce contrôle est une borne, pas une logique métier. Il décide de ce qui peut être stocké, pas de son honnêteté.",
        ar: "البوابة حدّ لا منطق عمل: تقرّر ما يمكن تخزينه، لا ما إذا كان صادقًا.",
      },
    ],
  },
  {
    kicker: { en: "04.2 — Recompute", fr: "04.2 — Recalcul", ar: "04.2 — إعادة الحساب" },
    title: {
      en: "Then the arithmetic is recomputed, and the edit shows.",
      fr: "Puis l'arithmétique est recalculée, et la retouche apparaît.",
      ar: "ثم يُعاد الحساب، فيظهر التعديل.",
    },
    body: {
      en: "Lines minus discount plus shipping, against the stated total. Every number involved was written into the same document at the same moment, so no price change can explain a mismatch: somebody edited the order. It is flagged at confirmation, before anything is packed.",
      fr: "Lignes moins remise plus livraison, comparé au total déclaré. Tous ces chiffres ont été écrits dans le même document au même instant : aucun changement de prix ne peut expliquer un écart. Quelqu'un a modifié la commande. Elle est signalée à la confirmation, avant toute préparation.",
      ar: "البنود ناقص الخصم زائد الشحن، مقابل المجموع المعلن. كل هذه الأرقام كُتبت في الوثيقة نفسها وفي اللحظة نفسها، فلا يمكن لتغيّر سعر أن يفسّر الفرق: أحدهم عدّل الطلبية. وتُعلَّم عند التأكيد، قبل تغليف أي شيء.",
    },
    details: [
      {
        en: "A second check compares line prices with today's catalogue. Prices drift honestly, so that one is a hint, never an alarm.",
        fr: "Un second contrôle compare les prix des lignes au catalogue du jour. Les prix évoluent honnêtement : c'est un indice, jamais une alarme.",
        ar: "فحص ثانٍ يقارن أسعار البنود بكتالوج اليوم. الأسعار تتغيّر بصدق، لذا فهو تلميح لا إنذار.",
      },
    ],
  },
];

const POLICY_COPY: Beat[] = [
  {
    kicker: { en: "04.3 — Access policy", fr: "04.3 — Politique d'accès", ar: "04.3 — سياسة الوصول" },
    title: {
      en: "One table decides who reads and writes what. The default is never.",
      fr: "Une table décide qui lit et écrit quoi. Par défaut : jamais.",
      ar: "جدول واحد يقرّر من يقرأ ومن يكتب ماذا. والأصل: لا أحد.",
    },
    body: {
      en: "Every collection has a row: who may read, who may write. Public, any staff, the owner, a named permission, or the row's own customer. A collection missing from the table is not open, it is an error: the first request fails loudly instead of quietly serving data.",
      fr: "Chaque collection a sa ligne : qui lit, qui écrit. Public, tout le personnel, le gérant, une permission nommée, ou le client propriétaire de la ligne. Une collection absente de la table n'est pas ouverte, c'est une erreur : la première requête échoue bruyamment au lieu de servir des données en silence.",
      ar: "لكل مجموعة بيانات سطر: من يقرأ ومن يكتب. العموم، أي موظف، المالك، صلاحية مسمّاة، أو العميل صاحب السطر. والمجموعة الغائبة عن الجدول ليست مفتوحة بل خطأ: يفشل أول طلب بصوت عالٍ بدل أن يقدّم البيانات بصمت.",
    },
    details: [
      {
        en: "Customers read orders through self: only rows whose customerUid is theirs.",
        fr: "Les clients lisent les commandes via self : seulement les lignes dont le customerUid est le leur.",
        ar: "يقرأ العملاء الطلبيات عبر self: فقط الأسطر التي يكون customerUid فيها لهم.",
      },
      {
        en: "Some collections are never through the generic route. The server writes them with its own hands.",
        fr: "Certaines collections sont never via la route générique : le serveur les écrit lui-même.",
        ar: "بعض المجموعات never عبر المسار العام؛ الخادم وحده يكتبها.",
      },
    ],
  },
  {
    kicker: { en: "04.3 — Roles", fr: "04.3 — Rôles", ar: "04.3 — الأدوار" },
    title: {
      en: "The business names its roles. The permissions are fixed.",
      fr: "L'entreprise nomme ses rôles. Les permissions sont fixes.",
      ar: "المؤسسة تسمّي أدوارها، والصلاحيات ثابتة.",
    },
    body: {
      en: "Each permission gates a real screen or action. The owner invents a role, here a counter role, and ticks what it may do. With till.sell and stock.view, the menu holds the counter and the stock lookup. Everything else is simply not there.",
      fr: "Chaque permission ouvre un écran ou une action réels. Le gérant invente un rôle, ici un rôle comptoir, et coche ce qu'il peut faire. Avec till.sell et stock.view, le menu contient le comptoir et la consultation du stock. Le reste n'existe tout simplement pas.",
      ar: "كل صلاحية تفتح شاشة أو إجراءً حقيقيًا. يبتكر المالك دورًا، هنا دور الشبّاك، ويحدّد ما يحقّ له. مع till.sell و stock.view تحتوي القائمة على الشبّاك والاطّلاع على المخزون، ولا شيء غير ذلك.",
    },
    details: [
      {
        en: "till.sell is kept apart from products.edit: someone scanning at the counter has no business rewriting a price.",
        fr: "till.sell est séparé de products.edit : scanner au comptoir ne donne aucun droit de réécrire un prix.",
        ar: "till.sell منفصلة عن products.edit: من يمسح الرموز على الشبّاك لا شأن له بتغيير الأسعار.",
      },
      {
        en: "stock.view reads counts without inventory.edit. A till looks things up all day and should never be one mis-tap from correcting a count.",
        fr: "stock.view lit les quantités sans inventory.edit. Une caisse consulte toute la journée et ne doit jamais être à un faux geste de corriger un stock.",
        ar: "stock.view تقرأ الكميات دون inventory.edit. الشبّاك يستعلم طوال اليوم ويجب ألّا يكون على بُعد لمسة خاطئة من تصحيح كمية.",
      },
    ],
  },
  {
    kicker: { en: "04.3 — Grant", fr: "04.3 — Attribution", ar: "04.3 — المنح" },
    title: {
      en: "Tick a permission, and the server agrees with the menu.",
      fr: "Cochez une permission, et le serveur s'accorde avec le menu.",
      ar: "فعّل صلاحية، فيتّفق الخادم مع القائمة.",
    },
    body: {
      en: "Granting orders.view and orders.edit adds the orders board to the menu and lets the same role's writes through. Menu and server read the same permission, so hiding a button is never the only protection.",
      fr: "Accorder orders.view et orders.edit ajoute le tableau des commandes au menu et laisse passer les écritures de ce rôle. Menu et serveur lisent la même permission : masquer un bouton n'est jamais la seule protection.",
      ar: "منح orders.view و orders.edit يضيف لوحة الطلبيات إلى القائمة ويسمح بكتابات هذا الدور. القائمة والخادم يقرآن الصلاحية نفسها، فإخفاء زر ليس أبدًا الحماية الوحيدة.",
    },
    details: [
      {
        en: "The owner always passes. Staff accounts and roles are writable by the owner alone.",
        fr: "Le gérant passe toujours. Comptes et rôles ne sont modifiables que par lui.",
        ar: "المالك يمرّ دائمًا، وحسابات الموظفين والأدوار لا يعدّلها سواه.",
      },
      {
        en: "Even the dashboard is a permission, so a role set up for one job does not land on the takings.",
        fr: "Même le tableau de bord est une permission : un rôle créé pour une tâche n'atterrit pas sur le chiffre d'affaires.",
        ar: "حتى لوحة القيادة صلاحية، كي لا يجد دورٌ أُنشئ لمهمة واحدة نفسه أمام الإيرادات.",
      },
    ],
  },
];

const APPS: Beat[] = [
  {
    kicker: { en: "04.4 — Three apps, one core", fr: "04.4 — Trois apps, un socle", ar: "04.4 — ثلاثة تطبيقات ونواة واحدة" },
    title: {
      en: "A portal, a back office, a counter. One data model.",
      fr: "Un portail, un back-office, un comptoir. Un seul modèle de données.",
      ar: "بوابة، مكتب خلفي، شبّاك. ونموذج بيانات واحد.",
    },
    body: {
      en: "Three installable web apps, each with its own manifest and start address. Underneath: 20 API routes, the policy table, and 26 bo_ tables of jsonb documents in Postgres plus the auth tables. The customer, the packer and the owner are looking at the same order.",
      fr: "Trois web apps installables, chacune avec son manifeste et son adresse de départ. Dessous : 20 routes API, la table de politiques, et 26 tables bo_ de documents jsonb dans Postgres, plus les tables d'authentification. Le client, l'emballeur et le gérant regardent la même commande.",
      ar: "ثلاثة تطبيقات ويب قابلة للتثبيت، لكلٍّ منها بيانه وعنوان انطلاقه. وتحتها: 20 مسار API، وجدول السياسات، و26 جدول bo_ لوثائق jsonb في Postgres إضافة إلى جداول المصادقة. العميل والمُغلِّف والمالك ينظرون إلى الطلبية نفسها.",
    },
    details: [
      {
        en: "No browser talks to the database. Every read and write goes through a route and the policy table.",
        fr: "Aucun navigateur ne parle à la base. Chaque lecture et écriture passe par une route et la table de politiques.",
        ar: "لا متصفح يخاطب قاعدة البيانات مباشرة؛ كل قراءة وكتابة تمرّ بمسار وبجدول السياسات.",
      },
      {
        en: "The portal reads orders through self: a customer sees their own, nobody else's.",
        fr: "Le portail lit les commandes via self : un client voit les siennes, pas celles des autres.",
        ar: "البوابة تقرأ الطلبيات عبر self: العميل يرى طلبياته وحدها.",
      },
    ],
  },
  {
    kicker: { en: "04.4 — Offline", fr: "04.4 — Hors ligne", ar: "04.4 — دون اتصال" },
    title: {
      en: "When the network drops, the order is not lost.",
      fr: "Quand le réseau tombe, la commande n'est pas perdue.",
      ar: "حين تنقطع الشبكة، لا تضيع الطلبية.",
    },
    body: {
      en: "If the order cannot reach the server, the portal keeps it in a local ledger on the device, with its own id and marked offline: true. The customer gets an answer, not an error page.",
      fr: "Si la commande ne peut pas joindre le serveur, le portail la garde dans un registre local sur l'appareil, avec son propre identifiant et marquée offline: true. Le client reçoit une réponse, pas une page d'erreur.",
      ar: "إذا تعذّر وصول الطلبية إلى الخادم، تحفظها البوابة في دفتر محلي على الجهاز، بمعرّف خاص وبعلامة offline: true. يتلقّى العميل جوابًا لا صفحة خطأ.",
    },
    details: [
      {
        en: "Local ids are DPR- plus eight characters, recognisable at a glance.",
        fr: "Les identifiants locaux sont DPR- suivi de huit caractères, reconnaissables d'un coup d'œil.",
        ar: "المعرّفات المحلية تبدأ بـ DPR- يليها ثمانية محارف، فتُعرف من النظرة الأولى.",
      },
      {
        en: "The flag says where the order lives: true means the local ledger only.",
        fr: "Le drapeau dit où vit la commande : true signifie le registre local uniquement.",
        ar: "العلامة تقول أين توجد الطلبية: true تعني الدفتر المحلي فقط.",
      },
    ],
  },
  {
    kicker: { en: "04.4 — Languages", fr: "04.4 — Langues", ar: "04.4 — اللغات" },
    title: {
      en: "English, French, Arabic. The layout turns around.",
      fr: "Anglais, français, arabe. La mise en page se retourne.",
      ar: "الإنجليزية، الفرنسية، العربية. والتخطيط ينقلب.",
    },
    body: {
      en: "The apps run in EN, FR and AR. Arabic is not a string table on a left-to-right page: the layout mirrors, so the reading order is right for the person reading.",
      fr: "Les apps tournent en EN, FR et AR. L'arabe n'est pas une table de chaînes posée sur une page de gauche à droite : la mise en page se reflète, et l'ordre de lecture est juste pour qui lit.",
      ar: "تعمل التطبيقات بالإنجليزية والفرنسية والعربية. والعربية ليست جدول نصوص فوق صفحة من اليسار إلى اليمين: التخطيط ينعكس، فيصحّ ترتيب القراءة لقارئها.",
    },
  },
];

const STOCK: Beat[] = [
  {
    kicker: { en: "04.5 — Stock movements", fr: "04.5 — Mouvements de stock", ar: "04.5 — حركات المخزون" },
    title: {
      en: "The counter scans. The log remembers.",
      fr: "Le comptoir scanne. Le journal se souvient.",
      ar: "الشبّاك يمسح، والسجلّ يتذكّر.",
    },
    body: {
      en: "Counts arrive as absolute values: this size is now 7. Written straight onto the piece, that leaves a number and no story. So every change also writes a movement row: what it was, what it is now, and what moved.",
      fr: "Les quantités arrivent en valeurs absolues : cette taille est maintenant à 7. Écrites directement sur l'article, elles laissent un chiffre sans histoire. Chaque changement écrit donc aussi une ligne de mouvement : avant, maintenant, et ce qui a bougé.",
      ar: "تصل الكميات بقيم مطلقة: هذا المقاس صار 7. وكتابتها مباشرة على القطعة تترك رقمًا بلا قصة. لذلك يكتب كل تغيير سطر حركة أيضًا: ما كان، وما صار، وما تحرّك.",
    },
    details: [
      {
        en: "moved is stored, not computed, so the database can filter and total it.",
        fr: "moved est stocké, pas calculé, pour que la base puisse filtrer et totaliser.",
        ar: "moved مخزّن لا محسوب، كي تستطيع قاعدة البيانات التصفية والجمع.",
      },
      {
        en: "Each row keeps the piece's name as it was at the time, not a live lookup.",
        fr: "Chaque ligne garde le nom de l'article tel qu'il était à ce moment, pas une recherche en direct.",
        ar: "كل سطر يحتفظ باسم القطعة كما كان حينها، لا ببحث آني.",
      },
    ],
  },
  {
    kicker: { en: "04.5 — The log", fr: "04.5 — Le journal", ar: "04.5 — السجل" },
    title: {
      en: "Every movement, out and back, exportable.",
      fr: "Chaque mouvement, sortie et retour, exportable.",
      ar: "كل حركة، خروجًا وعودة، قابلة للتصدير.",
    },
    body: {
      en: "The counter app lists what moved, out and back, per piece, and exports it as CSV with the same columns. A count that dropped by nine is explained by reading, not by asking.",
      fr: "L'app comptoir liste ce qui a bougé, sorties et retours, par article, et l'exporte en CSV avec les mêmes colonnes. Une quantité qui a baissé de neuf s'explique en lisant, pas en demandant.",
      ar: "يعرض تطبيق الشبّاك ما تحرّك، خروجًا وعودة، لكل قطعة، ويصدّره بصيغة CSV بالأعمدة نفسها. كمية نقصت تسعًا تُفسَّر بالقراءة لا بالسؤال.",
    },
  },
  {
    kicker: { en: "04.5 — Days of cover", fr: "04.5 — Jours de couverture", ar: "04.5 — أيام التغطية" },
    title: {
      en: "How long the shelf lasts at the current pace.",
      fr: "Combien de temps le rayon tient au rythme actuel.",
      ar: "كم يصمد الرفّ بالوتيرة الحالية.",
    },
    body: {
      en: "For each piece: units on hand divided by the daily rate over the last 30 days, read from the orders themselves. 14 on hand, 21 sold in 30 days, 0.7 a day: 20 days of cover. Next to it, stock value: on hand × cost.",
      fr: "Pour chaque article : unités en stock divisées par le rythme quotidien des 30 derniers jours, lu dans les commandes elles-mêmes. 14 en stock, 21 vendues en 30 jours, 0,7 par jour : 20 jours de couverture. À côté, la valeur du stock : quantité × coût.",
      ar: "لكل قطعة: الوحدات المتوفّرة مقسومة على المعدّل اليومي خلال آخر 30 يومًا، مقروءًا من الطلبيات نفسها. 14 متوفّرة، 21 بيعت في 30 يومًا، أي 0.7 يوميًا: 20 يوم تغطية. وبجانبها قيمة المخزون: الكمية × التكلفة.",
    },
    details: [
      {
        en: "A piece that is not moving gets no cover figure rather than an infinite one.",
        fr: "Un article qui ne part pas n'a pas de couverture plutôt qu'une couverture infinie.",
        ar: "القطعة التي لا تتحرّك لا تحصل على رقم تغطية بدل رقم لا نهائي.",
      },
      {
        en: "Low stock uses a per-piece threshold or the default. In stock, never sold, listed a while: flagged as dead stock.",
        fr: "Le stock bas suit un seuil par article ou celui par défaut. En stock, jamais vendu, listé depuis un moment : signalé comme stock dormant.",
        ar: "المخزون المنخفض يتبع عتبة لكل قطعة أو العتبة الافتراضية. متوفّرة، لم تُبع قط، ومعروضة منذ مدة: تُعلَّم كمخزون راكد.",
      },
    ],
  },
];

const WALK = {
  kicker: { en: "04.6 — Walkthrough", fr: "04.6 — Parcours", ar: "04.6 — مسار كامل" },
  title: {
    en: "One order, from the portal to the doorstep.",
    fr: "Une commande, du portail jusqu'à la porte.",
    ar: "طلبية واحدة، من البوابة إلى عتبة الباب.",
  },
  intro: {
    en: "Seven moves, three apps, one record. Each step names who acts and what the system does about it.",
    fr: "Sept étapes, trois apps, un seul enregistrement. Chaque étape dit qui agit et ce que fait le système.",
    ar: "سبع خطوات، ثلاثة تطبيقات، سجلّ واحد. كل خطوة تذكر من يتصرّف وماذا يفعل النظام.",
  },
  steps: [
    {
      actor: { en: "Customer · portal, in French", fr: "Client · portail, en français", ar: "العميل · البوابة، بالفرنسية" },
      action: { en: "Places an order for two pieces, delivery to Oran.", fr: "Commande deux pièces, livraison à Oran.", ar: "يطلب قطعتين مع التوصيل إلى وهران." },
      effect: {
        en: "Shipping fee asked from the carrier on the server. The order passes the shape gate and is stored pending; the first status event is written.",
        fr: "Frais demandés au transporteur côté serveur. La commande passe le contrôle de forme et est stockée en pending ; le premier événement est écrit.",
        ar: "تُطلب رسوم الشحن من الناقل عبر الخادم. تمرّ الطلبية ببوابة الشكل وتُحفظ بحالة pending، ويُكتب أول حدث.",
      },
      token: "status: \"pending\"",
    },
    {
      actor: { en: "Order desk · back office", fr: "Service commandes · back-office", ar: "مكتب الطلبيات · المكتب الخلفي" },
      action: { en: "Opens the order and rings the customer.", fr: "Ouvre la commande et appelle le client.", ar: "يفتح الطلبية ويتّصل بالعميل." },
      effect: {
        en: "The arithmetic is recomputed on screen: it adds up, no line has drifted. The desk moves it to confirmed.",
        fr: "L'arithmétique est recalculée à l'écran : elle tombe juste, aucune ligne n'a dérivé. Le service passe en confirmed.",
        ar: "يُعاد الحساب على الشاشة: المجموع صحيح ولا سعر تغيّر. ينقلها المكتب إلى confirmed.",
      },
      token: "lines − discount + shipping = total",
    },
    {
      actor: { en: "Preparer · back office", fr: "Préparateur · back-office", ar: "المحضّر · المكتب الخلفي" },
      action: { en: "Picks the pieces and packs the parcel.", fr: "Prépare les pièces et emballe le colis.", ar: "يجمع القطع ويغلّف الطرد." },
      effect: {
        en: "Two status events, preparing then packed, each with time and author.",
        fr: "Deux événements, preparing puis packed, chacun avec heure et auteur.",
        ar: "حدثان، preparing ثم packed، لكلٍّ منهما وقته وصاحبه.",
      },
      token: "{ status, at, by }",
    },
    {
      actor: { en: "Order desk · back office", fr: "Service commandes · back-office", ar: "مكتب الطلبيات · المكتب الخلفي" },
      action: { en: "Books the parcel with the carrier.", fr: "Réserve le colis chez le transporteur.", ar: "يحجز الطرد لدى شركة النقل." },
      effect: {
        en: "The server calls the carrier API with its own token; the answer comes back keyed by order id with a tracking number. Status: shipped.",
        fr: "Le serveur appelle l'API du transporteur avec son propre jeton ; la réponse revient indexée par commande, avec un numéro de suivi. Statut : shipped.",
        ar: "يستدعي الخادم واجهة الناقل برمزه الخاص؛ ويعود الجواب مفهرسًا بمعرّف الطلبية مع رقم تتبّع. الحالة: shipped.",
      },
      token: "shipped",
    },
    {
      actor: { en: "Carrier", fr: "Transporteur", ar: "شركة النقل" },
      action: { en: "Reports the parcel out for delivery.", fr: "Signale le colis en cours de livraison.", ar: "يبلّغ بأن الطرد خرج للتوصيل." },
      effect: {
        en: "The carrier's own wording is mapped onto the order's states.",
        fr: "Le libellé du transporteur est ramené aux états de la commande.",
        ar: "تُترجم عبارة الناقل إلى حالات الطلبية.",
      },
      token: "\"Sorti en livraison\" → out_for_delivery",
    },
    {
      actor: { en: "Carrier", fr: "Transporteur", ar: "شركة النقل" },
      action: { en: "Hands the parcel over; cash is collected.", fr: "Remet le colis ; l'argent est encaissé.", ar: "يسلّم الطرد ويحصّل المبلغ." },
      effect: {
        en: "Delivered. The order records what it took off the shelves, size by size, and the customer's portal shows it.",
        fr: "Livrée. La commande enregistre ce qu'elle a retiré des rayons, taille par taille, et le portail du client l'affiche.",
        ar: "سُلّمت. تسجّل الطلبية ما أخذته من الرفوف مقاسًا بمقاس، وتعرض بوابة العميل ذلك.",
      },
      token: "delivered",
    },
    {
      actor: { en: "Owner · back office", fr: "Gérant · back-office", ar: "المالك · المكتب الخلفي" },
      action: { en: "A week later, accepts a return.", fr: "Une semaine plus tard, accepte un retour.", ar: "بعد أسبوع، يقبل إرجاعًا." },
      effect: {
        en: "Needs orders.refund. The record of what was taken is read back, and exactly those sizes return to stock.",
        fr: "Exige orders.refund. L'enregistrement de ce qui a été pris est relu, et exactement ces tailles reviennent en stock.",
        ar: "يتطلّب orders.refund. يُقرأ سجل ما أُخذ، وتعود تلك المقاسات بالضبط إلى المخزون.",
      },
      token: "returned",
    },
  ],
};

const DECISIONS = {
  kicker: { en: "04.7 — Decisions", fr: "04.7 — Décisions", ar: "04.7 — القرارات" },
  title: {
    en: "What was chosen, and what it was chosen over.",
    fr: "Ce qui a été choisi, et à la place de quoi.",
    ar: "ما الذي اختير، وبدلًا من ماذا.",
  },
  items: [
    {
      decision: {
        en: "Every access rule in one table, with no default",
        fr: "Toutes les règles d'accès dans une table, sans valeur par défaut",
        ar: "كل قواعد الوصول في جدول واحد، دون قيمة افتراضية",
      },
      alternative: {
        en: "A permission check written inside each route handler",
        fr: "Une vérification écrite dans chaque route",
        ar: "فحص صلاحيات مكتوب داخل كل مسار",
      },
      reason: {
        en: "Every decision is visible at once. Scattered checks are how one route ends up quietly more permissive than the rest. A collection without a row fails at the first request.",
        fr: "Toutes les décisions sont visibles d'un coup. Des vérifications dispersées, c'est ainsi qu'une route finit plus permissive que les autres sans que personne ne le voie. Une collection sans ligne échoue dès la première requête.",
        ar: "كل القرارات مرئية دفعة واحدة. الفحوص المبعثرة هي ما يجعل مسارًا ما أكثر تساهلًا من غيره دون أن ينتبه أحد. والمجموعة التي لا سطر لها تفشل عند أول طلب.",
      },
    },
    {
      decision: {
        en: "jsonb documents in bo_ tables, behind API routes",
        fr: "Documents jsonb dans des tables bo_, derrière des routes API",
        ar: "وثائق jsonb في جداول bo_ خلف مسارات API",
      },
      alternative: {
        en: "A database the browser talks to directly, guarded by rules",
        fr: "Une base que le navigateur interroge directement, gardée par des règles",
        ar: "قاعدة بيانات يخاطبها المتصفح مباشرة وتحرسها قواعد",
      },
      reason: {
        en: "The records kept their document shape, and the 43 database rules that once decided what came back became one table of code that can be read and compared.",
        fr: "Les enregistrements ont gardé leur forme de document, et les 43 règles qui décidaient de ce qui revenait sont devenues une table de code lisible et comparable.",
        ar: "حافظت السجلات على شكل الوثيقة، وصارت القواعد الـ43 التي كانت تقرّر ما يُعاد جدولًا برمجيًا واحدًا يُقرأ ويُقارن.",
      },
    },
    {
      decision: {
        en: "The public may create an order, never update it",
        fr: "Le public peut créer une commande, jamais la modifier",
        ar: "يمكن للعموم إنشاء طلبية لا تعديلها",
      },
      alternative: {
        en: "Letting the customer's session edit its own order",
        fr: "Laisser la session du client modifier sa commande",
        ar: "السماح لجلسة العميل بتعديل طلبيتها",
      },
      reason: {
        en: "An order's total cannot be changed by posting to its id. Changes after creation belong to staff, behind orders.edit.",
        fr: "Le total d'une commande ne peut pas être changé en écrivant sur son identifiant. Les changements après création reviennent au personnel, derrière orders.edit.",
        ar: "لا يمكن تغيير مجموع طلبية بالكتابة على معرّفها. التعديلات بعد الإنشاء للموظفين وحدهم خلف orders.edit.",
      },
    },
    {
      decision: {
        en: "Arithmetic check and price check kept apart",
        fr: "Contrôle arithmétique et contrôle de prix séparés",
        ar: "فصل فحص الحساب عن فحص الأسعار",
      },
      alternative: {
        en: "One \"suspicious order\" score",
        fr: "Un seul score de « commande suspecte »",
        ar: "مؤشّر واحد لـ«طلبية مشبوهة»",
      },
      reason: {
        en: "A total that disagrees with its own lines is proof of an edit. A price that differs from today's is usually an honest change. Mixing them would make every price update look like fraud.",
        fr: "Un total en désaccord avec ses propres lignes prouve une retouche. Un prix différent de celui du jour est souvent un changement honnête. Les mêler ferait passer chaque mise à jour de prix pour une fraude.",
        ar: "مجموع يخالف بنوده دليل على تعديل. وسعر يختلف عن سعر اليوم غالبًا تغيير صادق. ودمجهما يجعل كل تحديث سعر يبدو احتيالًا.",
      },
    },
    {
      decision: {
        en: "Counter permissions separate from catalogue permissions",
        fr: "Permissions comptoir séparées des permissions catalogue",
        ar: "صلاحيات الشبّاك منفصلة عن صلاحيات الكتالوج",
      },
      alternative: {
        en: "Giving the counter products.edit so it can change counts",
        fr: "Donner products.edit au comptoir pour qu'il ajuste les quantités",
        ar: "منح الشبّاك products.edit ليعدّل الكميات",
      },
      reason: {
        en: "till.sell changes how many are on the shelf and nothing else, and stock.view reads without adjusting. The limit holds in the database, not only in the menu.",
        fr: "till.sell change la quantité en rayon et rien d'autre, stock.view lit sans ajuster. La limite tient dans la base, pas seulement dans le menu.",
        ar: "till.sell تغيّر الكمية على الرف ولا شيء غيرها، و stock.view تقرأ دون تعديل. والحدّ قائم في قاعدة البيانات لا في القائمة فقط.",
      },
    },
    {
      decision: {
        en: "A movement row for every count change",
        fr: "Une ligne de mouvement à chaque changement de quantité",
        ar: "سطر حركة لكل تغيّر في الكمية",
      },
      alternative: {
        en: "Overwriting the count with the latest absolute value",
        fr: "Écraser la quantité avec la dernière valeur absolue",
        ar: "استبدال الكمية بآخر قيمة مطلقة",
      },
      reason: {
        en: "Overwriting leaves a number and no story: nobody can ask what left this morning. One extra insert on a write that was already happening buys the whole history.",
        fr: "Écraser laisse un chiffre sans histoire : personne ne peut demander ce qui est sorti ce matin. Une insertion de plus sur une écriture déjà faite achète tout l'historique.",
        ar: "الاستبدال يترك رقمًا بلا قصة: لا أحد يستطيع أن يسأل ما الذي خرج هذا الصباح. إدراج إضافي واحد على كتابة تحدث أصلًا يشتري التاريخ كله.",
      },
    },
  ],
};

const PROOF = [
  { value: 26, label: { en: "bo_ tables of jsonb documents", fr: "tables bo_ de documents jsonb", ar: "جدول bo_ لوثائق jsonb" }, note: { en: "29 tables with auth", fr: "29 tables avec l'auth", ar: "29 جدولًا مع المصادقة" } },
  { value: 20, label: { en: "API routes", fr: "routes API", ar: "مسار API" }, note: { en: "all through one policy table", fr: "toutes via une table de politiques", ar: "كلها عبر جدول سياسات واحد" } },
  { value: 34, prefix: "~", label: { en: "pages across three apps", fr: "pages sur trois apps", ar: "صفحة عبر ثلاثة تطبيقات" } },
  { value: 10, label: { en: "order statuses", fr: "statuts de commande", ar: "حالات للطلبية" }, note: { en: "7 forward · 3 exits", fr: "7 en avant · 3 sorties", ar: "7 للأمام · 3 مخارج" } },
  { value: 3, label: { en: "web manifests, installable", fr: "manifestes web, installables", ar: "بيانات ويب قابلة للتثبيت" }, note: { en: "portal · back office · counter", fr: "portail · back-office · comptoir", ar: "بوابة · مكتب خلفي · شبّاك" } },
  { value: 3, label: { en: "languages, Arabic mirrored", fr: "langues, arabe en miroir", ar: "لغات، والعربية معكوسة" }, note: { en: "EN · FR · AR", fr: "EN · FR · AR", ar: "EN · FR · AR" } },
  { value: 39, prefix: "~", label: { en: "activity-log write points", fr: "points d'écriture du journal d'activité", ar: "موضع كتابة في سجل النشاط" } },
  { value: 30, label: { en: "day window behind days of cover", fr: "jours de fenêtre pour la couverture", ar: "يومًا نافذة حساب التغطية" } },
];

const CLOSING: L = {
  en: "Orders and the customer portal, proven: a state machine with its own history, totals that are checked rather than trusted, and access that is denied until someone grants it.",
  fr: "Commandes et portail client, prouvés : une machine à états avec son propre historique, des totaux vérifiés plutôt que crus, et un accès refusé tant que personne ne l'accorde.",
  ar: "الطلبيات وبوابة العملاء، ثابتتان: آلة حالات بتاريخها الخاص، ومجاميع تُفحص بدل أن تُصدَّق، ووصول ممنوع ما لم يمنحه أحد.",
};

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

/** Short laptops (≈1366×620): smaller titles, two details, so the copy column is not clipped. */
const SHORT_COPY =
  "[@media(min-width:1024px)_and_(max-height:760px)]:[&_h3]:text-[clamp(1.45rem,2.3vw,2rem)] [@media(min-width:1024px)_and_(max-height:700px)]:[&_li:nth-child(n+3)]:hidden";

function SceneCopy({ beats }: { beats: Beat[] }) {
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

/** On mobile only the panel for the current beat shows; md+ shows all. */
function mob(on: boolean) {
  return on ? "" : "hidden md:block";
}

function Lab({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`erp-mono text-[0.68rem] uppercase tracking-[0.14em] text-faint ${className}`}>{children}</p>;
}

function Panel({
  label,
  children,
  className = "",
  bodyClassName = "",
  lit = false,
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  lit?: boolean;
}) {
  return (
    <div className={`border bg-paper/90 ${lit ? "border-signal" : "border-[var(--erp-hair-2)]"} ${className}`}>
      <div className={`flex items-center justify-between gap-2 border-b px-2.5 py-1.5 ${lit ? "border-signal/50" : "border-[var(--erp-hair)]"}`}>
        <span className="erp-mono truncate text-[0.68rem] uppercase tracking-[0.12em] text-mute">{label}</span>
      </div>
      <div className={`p-2.5 ${bodyClassName}`}>{children}</div>
    </div>
  );
}

const DISCOUNT: L = { en: "discount", fr: "remise", ar: "الخصم" };
const SHIPPING: L = { en: "shipping", fr: "livraison", ar: "الشحن" };
const GATE_L: L = { en: "shape gate", fr: "contrôle de forme", ar: "بوابة الشكل" };
const BO: L = { en: "back office", fr: "back-office", ar: "المكتب الخلفي" };

const money = (n: number) => n.toLocaleString("fr-FR").replace(/ | /g, " ");

/* ------------------------------------------------------------------ */
/* 04.1 — Order lifecycle                                              */
/* ------------------------------------------------------------------ */

const STATES = ["pending", "confirmed", "preparing", "packed", "shipped", "out_for_delivery", "delivered"];
const VIA_PORTAL: L = { en: "portal", fr: "portail", ar: "البوابة" };
const VIA_DESK: L = { en: "desk · Amina", fr: "cdes · Amina", ar: "الطلبيات · Amina" };
const VIA_PREP: L = { en: "prep · Yacine", fr: "prépa · Yacine", ar: "التحضير · Yacine" };
const VIA_CARRIER: L = { en: "carrier", fr: "transporteur", ar: "الناقل" };
const EVENTS: { at: string; via: L }[] = [
  { at: "11-03 09:41", via: VIA_PORTAL },
  { at: "11-03 10:14", via: VIA_DESK },
  { at: "11-03 11:02", via: VIA_PREP },
  { at: "11-03 15:30", via: VIA_PREP },
  { at: "11-04 09:05", via: VIA_DESK },
  { at: "11-04 10:48", via: VIA_CARRIER },
  { at: "11-04 14:22", via: VIA_CARRIER },
];
const WITH_CARRIER: L = { en: "With carrier", fr: "Chez le transporteur", ar: "لدى الناقل" };
const NEXT_ACTION: L[] = [
  { en: "Confirm · call done", fr: "Confirmer · appel passé", ar: "تأكيد · تمّ الاتصال" },
  { en: "Start preparing", fr: "Lancer la préparation", ar: "بدء التحضير" },
  { en: "Mark packed", fr: "Marquer emballée", ar: "تعليمها مغلّفة" },
  { en: "Book parcel", fr: "Réserver le colis", ar: "حجز الطرد" },
  WITH_CARRIER,
  WITH_CARRIER,
  { en: "Closed", fr: "Clôturée", ar: "مغلقة" },
];
const SHIRT: L = { en: "Oxford shirt", fr: "Chemise Oxford", ar: "قميص Oxford" };

function LifecycleStage() {
  const { beat } = useScene();
  const [idx, setIdx] = useState(0);
  useSceneProgress((p) => {
    const i = Math.min(6, Math.floor(p * 8));
    setIdx((prev) => (prev === i ? prev : i));
  });
  return <SceneLayout wide copy={<SceneCopy beats={LIFECYCLE} />} figure={<FigLifecycle idx={idx} beat={beat} />} />;
}

function FigLifecycle({ idx, beat }: { idx: number; beat: number }) {
  const tx = useTx();
  // Stations sit at the centre of 7 equal columns, so the labels below can share one row.
  const col = (i: number) => `calc(100% * ${(2 * i + 1) / 14})`;
  const HIST_COLS = "grid-cols-[1.4rem_minmax(0,1fr)_6.2rem] sm:grid-cols-[1.4rem_minmax(0,1fr)_6.4rem_6.2rem]";
  return (
    <Figure fig="FIG. 04.1" title={{ en: "order · status events", fr: "commande · événements", ar: "طلبية · أحداث" }} className="w-full max-w-[820px] bg-paper/70 [contain:inline-size]" bodyClassName="p-3 md:p-5">
      {/* rail */}
      <div className="relative h-[15px]">
        <span className="absolute top-[7px] h-px bg-[var(--erp-hair-2)]" style={{ left: col(0), right: col(0) }} />
        <span
          className="absolute top-[7px] h-px bg-signal transition-[width] duration-500"
          style={{ left: col(0), width: `calc((100% - 100% / 7) * ${idx / 6})` }}
        />
        {STATES.map((s, i) => (
          <span
            key={s}
            className={`absolute top-0 h-[15px] w-[15px] -translate-x-1/2 border transition-colors duration-300 ${
              i === idx ? "border-signal bg-signal shadow-[0_0_0_4px_var(--erp-signal-soft)]" : i < idx ? "border-ink bg-ink" : "border-[var(--erp-hair-2)] bg-paper"
            }`}
            style={{ left: col(i) }}
          />
        ))}
      </div>
      <div className="mt-2 hidden grid-cols-7 md:grid">
        {STATES.map((s, i) => (
          <span
            key={s}
            className={`erp-mono px-0.5 text-center text-[0.68rem] leading-tight transition-colors duration-300 ${i === idx ? "text-signal" : i < idx ? "text-ink" : "text-faint"}`}
          >
            {s === "out_for_delivery" ? (
              <>
                out_for_
                <wbr />
                delivery
              </>
            ) : (
              s
            )}
          </span>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2 md:hidden">
        <Lab>{tx({ en: "status", fr: "statut", ar: "الحالة" })}</Lab>
        <Code lit>{STATES[idx]}</Code>
      </div>

      <div className="mt-3 grid gap-3 md:mt-4 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* order card */}
        <Panel label={tx({ en: "Order · 2 pieces", fr: "Commande · 2 pièces", ar: "طلبية · قطعتان" })} className="hidden sm:flex sm:flex-col" bodyClassName="flex flex-1 flex-col">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[0.82rem] text-ink">Sara B. · Oran (31)</span>
            <Code lit className="!text-[0.68rem]">{STATES[idx]}</Code>
          </div>
          <div className="erp-mono mt-2 space-y-1 text-[0.72rem] text-graphite">
            <div className="flex justify-between"><span>{tx(SHIRT)} · M × 1</span><span>4 900</span></div>
            <div className="flex justify-between"><span>Chino · 32 × 1</span><span>5 400</span></div>
            <div className="flex justify-between text-mute"><span>{tx({ en: "shipping · home", fr: "livraison · domicile", ar: "الشحن · المنزل" })}</span><span>600</span></div>
            <div className="flex justify-between border-t border-[var(--erp-hair)] pt-1 text-ink"><span>total · DZD</span><span>10 900</span></div>
          </div>
          <div className="erp-mono mt-2 flex justify-between gap-2 text-[0.68rem] text-mute">
            <span className="whitespace-nowrap">{tx({ en: "cash on delivery", fr: "paiement à la livraison", ar: "الدفع عند الاستلام" })}</span>
            <span className="whitespace-nowrap">
              <span className="text-ink">{idx + 1}</span> {idx === 0 ? tx({ en: "event", fr: "événement", ar: "حدث" }) : tx({ en: "events", fr: "événements", ar: "أحداث" })}
            </span>
          </div>
          <div className="mt-auto pt-3">
            <div className={`erp-mono border px-2 py-1.5 text-center text-[0.7rem] ${idx >= 4 && idx < 6 ? "border-dashed border-[var(--erp-hair-2)] text-faint" : "border-ink text-ink"}`}>
              {tx(NEXT_ACTION[idx])}
            </div>
          </div>
        </Panel>

        {/* history: every move appends one row; future rows are empty slots */}
        <Panel label="statusHistory" lit>
          <div className={`erp-mono grid ${HIST_COLS} gap-x-2 border-b border-[var(--erp-hair)] pb-1 text-[0.66rem] uppercase tracking-[0.1em] text-faint`}>
            <span>#</span><span>status</span><span className="hidden sm:block">at</span><span>by</span>
          </div>
          <ol className="mt-1">
            {STATES.map((s, i) => {
              const done = i <= idx;
              // Mobile keeps the last three events only, so the figure height stays bounded.
              const onMobile = done && i > idx - 3;
              return (
                <li
                  key={s}
                  className={`erp-mono items-center gap-x-2 py-[3px] text-[0.72rem] transition-colors duration-300 sm:grid ${HIST_COLS} ${onMobile ? "grid" : "hidden"} ${
                    i === idx ? "bg-[var(--erp-signal-soft)] text-signal-deep" : "text-graphite"
                  }`}
                >
                  <span className={done ? "text-faint" : "text-[var(--erp-hair-2)]"}>{String(i + 1).padStart(2, "0")}</span>
                  {done ? (
                    <>
                      <span className="truncate">{s}</span>
                      <span className="hidden text-mute sm:block">{EVENTS[i].at}</span>
                      <span className="truncate text-mute">{tx(EVENTS[i].via)}</span>
                    </>
                  ) : (
                    <span className="col-span-3 h-px self-center border-t border-dashed border-[var(--erp-hair-2)]" />
                  )}
                </li>
              );
            })}
          </ol>
        </Panel>
      </div>

      {/* event shape / carrier mapping / exits */}
      <div className="relative mt-3 min-h-[86px] sm:min-h-[66px]">
        <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: beat < 2 ? 1 : 0 }}>
          <Lab className="mb-1.5">{tx({ en: "event shape · appended, never edited", fr: "forme de l'événement · ajouté, jamais modifié", ar: "شكل الحدث · يُضاف ولا يُعدَّل" })}</Lab>
          <div className="erp-mono text-[0.72rem] text-graphite">
            <span className="whitespace-nowrap">{"{ "}status: <span className="text-signal-deep">&quot;{STATES[idx]}&quot;</span>,</span>{" "}
            <span className="whitespace-nowrap">at: &quot;2026-{EVENTS[idx].at.replace(" ", "T")}&quot;,</span>{" "}
            <span className="whitespace-nowrap">by: &quot;{tx(EVENTS[idx].via)}&quot;{" }"}</span>
          </div>
          <p className="erp-mono mt-1.5 hidden text-[0.68rem] text-faint sm:block">
            {beat === 0 ? tx({ en: "from outside, pending is the only accepted status · anything else is refused", fr: "de l'extérieur, pending est le seul statut accepté · tout autre est refusé", ar: "من الخارج، pending هي الحالة الوحيدة المقبولة · وكل ما عداها مرفوض" }) : tx({ en: "the board reads this field · one column per status", fr: "le tableau lit ce champ · une colonne par statut", ar: "اللوحة تقرأ هذا الحقل · عمود لكل حالة" })}
          </p>
        </div>
        <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: beat === 2 ? 1 : 0 }}>
          <Lab className="mb-1.5">{tx({ en: "carrier status → order state", fr: "statut transporteur → état de commande", ar: "حالة الناقل → حالة الطلبية" })}</Lab>
          <div className="erp-mono grid gap-1 text-[0.72rem] sm:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            {[
              ["\"Sorti en livraison\"", "out_for_delivery", false],
              ["\"Tentative échouée\"", "shipped", true],
            ].map(([a, b, back]) => (
              <div key={String(a)} className="flex items-center justify-between gap-2 border border-[var(--erp-hair)] px-2 py-1">
                <span className="truncate text-mute">{a}</span>
                <span className={`whitespace-nowrap ${back ? "text-signal-deep" : "text-ink"}`}>→ {b}</span>
              </div>
            ))}
          </div>
          <p className="erp-mono mt-1.5 hidden text-[0.68rem] text-faint sm:block">{tx({ en: "failed attempt → back to shipped · the parcel is still with the courier", fr: "tentative échouée → retour à shipped · le colis est toujours chez le livreur", ar: "محاولة فاشلة → عودة إلى shipped · الطرد ما زال لدى الموزّع" })}</p>
        </div>
        <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: beat === 3 ? 1 : 0 }}>
          <Lab className="mb-1.5">{tx({ en: "exits · stock read back from the order", fr: "sorties · stock relu depuis la commande", ar: "المخارج · المخزون يُقرأ من الطلبية" })}</Lab>
          <div className="flex flex-wrap gap-1.5">
            {["cancelled", "returned", "refunded"].map((x) => (
              <span key={x} className="erp-mono relative border border-dashed border-[var(--erp-hair-2)] px-2 py-0.5 text-[0.72rem] text-graphite">
                {x === "returned" && (
                  <span className="absolute -inset-px border border-signal bg-[var(--erp-signal-soft)]" style={{ opacity: seg("--b3", 0.05, 0.25) }} />
                )}
                <span className="relative">↳ {x}</span>
              </span>
            ))}
            <span className="erp-mono px-1 py-0.5 text-[0.72rem] text-faint">{tx({ en: "needs", fr: "exige", ar: "يتطلّب" })} orders.refund</span>
          </div>
          <div className="erp-mono mt-1.5 hidden text-[0.68rem] text-mute sm:block">
            stockTaken: [ {"{"} {tx(SHIRT)} · {tx(NAVY)} · M · 1 {"}"}, {"{"} Chino · {tx(SAND)} · 32 · 1 {"}"} ]{" "}
            <span className="text-signal-deep" style={{ opacity: seg("--b3", 0.2, 0.4) }}>
              → {tx({ en: "back to the same sizes", fr: "retour aux mêmes tailles", ar: "عودة إلى المقاسات نفسها" })}
            </span>
          </div>
        </div>
      </div>
    </Figure>
  );
}

/* ------------------------------------------------------------------ */
/* 04.2 — Tamper check                                                 */
/* ------------------------------------------------------------------ */

function TamperStage() {
  const { beat } = useScene();
  return <SceneLayout wide copy={<SceneCopy beats={TAMPER} />} figure={<FigTamper beat={beat} />} />;
}

const GATE: (string | L)[] = [
  "status === \"pending\"",
  "1 ≤ items ≤ 30",
  "0 ≤ total < 10 000 000",
  { en: "name · phone · wilaya", fr: "nom · téléphone · wilaya", ar: "الاسم · الهاتف · الولاية" },
  "stockHeld !== true",
];

function FigTamper({ beat }: { beat: number }) {
  const tx = useTx();
  return (
    <Figure fig="FIG. 04.2" title={{ en: "order arrives · checked twice", fr: "commande · contrôlée deux fois", ar: "طلبية · تُفحص مرّتين" }} className="w-full max-w-[860px] bg-paper/70 [contain:inline-size]" bodyClassName="p-3 md:p-5">
      <div className="grid gap-3 md:grid-cols-3">
        {/* A — what the browser sent */}
        <div className={mob(beat === 0)}>
          <Panel label={`01 · ${tx({ en: "browser sends", fr: "le navigateur envoie", ar: "المتصفح يرسل" })}`} lit={beat === 0} className="h-full">
            <div className="erp-mono space-y-1 text-[0.74rem] text-graphite">
              <Row k="status" v={'"pending"'} />
              <Row k="wilaya" v="Oran (31)" />
              <Row k={tx(SHIRT)} v="4 900 × 1" />
              <Row k={tx(CHINO)} v="5 400 × 1" />
              <Row k={tx(DISCOUNT)} v="0" />
              <Row k={tx(SHIPPING)} v="600" />
              <div className="flex items-baseline justify-between border-t border-[var(--erp-hair)] pt-1.5">
                <span>total</span>
                <span className="flex items-baseline gap-2">
                  <span className="relative text-mute">
                    10 900
                    <span className="absolute left-0 top-1/2 h-px bg-signal" style={{ width: lerp(seg("--b0", 0.15, 0.45), 0, 100, "%") }} />
                  </span>
                  <span className="text-[0.95rem] font-semibold text-signal" style={{ opacity: seg("--b0", 0.4, 0.6) }}>
                    1
                  </span>
                </span>
              </div>
            </div>
            <p className="erp-mono mt-2 text-[0.68rem] text-faint" style={{ opacity: seg("--b0", 0.4, 0.6) }}>
              {tx({ en: "edited before sending", fr: "modifié avant l'envoi", ar: "عُدّل قبل الإرسال" })}
            </p>
          </Panel>
        </div>

        {/* B — shape gate */}
        <div className={mob(beat === 1)}>
          <Panel label={`02 · ${tx(GATE_L)}`} lit={beat === 1} className="h-full">
            <ul className="erp-mono space-y-1 text-[0.72rem]">
              {GATE.map((rule, i) => (
                <li key={i} className="flex items-center justify-between gap-2 text-graphite">
                  <span className="truncate">{tx(rule)}</span>
                  <span className="text-ink" style={{ opacity: seg("--b1", 0.08 + i * 0.1, 0.16 + i * 0.1) }}>
                    ✓
                  </span>
                </li>
              ))}
            </ul>
            <div className="erp-mono mt-2 border-t border-[var(--erp-hair)] pt-1.5 text-[0.72rem]" style={{ opacity: seg("--b1", 0.62, 0.75) }}>
              <div className="flex justify-between"><span className="text-mute">{tx({ en: "public create", fr: "création publique", ar: "إنشاء عام" })}</span><span className="text-ink">{tx({ en: "stored", fr: "stockée", ar: "محفوظة" })} · pending</span></div>
              <div className="flex justify-between"><span className="text-mute">{tx({ en: "public update", fr: "modification publique", ar: "تعديل عام" })}</span><span className="text-signal-deep">{tx({ en: "refused", fr: "refusée", ar: "مرفوض" })}</span></div>
            </div>
            <p className="mt-2 text-[0.76rem] leading-snug text-mute" style={{ opacity: seg("--b1", 0.75, 0.9) }}>
              {tx({ en: "1 DZD is a possible number. The forged order is stored.", fr: "1 DZD est un nombre possible. La commande falsifiée est stockée.", ar: "1 DZD رقم ممكن. فتُحفظ الطلبية المزوّرة." })}
            </p>
          </Panel>
        </div>

        {/* C — recompute */}
        <div className={mob(beat === 2)}>
          <Panel label={`03 · ${tx(BO)}`} lit={beat === 2} className="h-full">
            <div className="erp-mono space-y-1 text-[0.74rem] text-graphite">
              <Row k={tx({ en: "lines", fr: "lignes", ar: "البنود" })} v="10 300" />
              <Row k={`− ${tx(DISCOUNT)}`} v="0" />
              <Row k={`+ ${tx(SHIPPING)}`} v="600" />
              <div className="flex justify-between border-t border-[var(--erp-hair)] pt-1 text-ink"><span>= {tx({ en: "expected", fr: "attendu", ar: "المتوقّع" })}</span><span>10 900</span></div>
              <Row k={tx({ en: "stated", fr: "déclaré", ar: "المصرَّح" })} v="1" />
              <div className="flex justify-between" style={{ opacity: seg("--b2", 0.2, 0.35) }}>
                <span>{tx({ en: "off", fr: "écart", ar: "الفرق" })}</span>
                <span className="text-signal">−10 899</span>
              </div>
            </div>
            <div
              className="erp-mono mt-2 border border-signal bg-[var(--erp-signal-soft)] px-2 py-1.5 text-[0.72rem] uppercase tracking-[0.1em] text-signal-deep"
              style={{ opacity: seg("--b2", 0.35, 0.5), transform: `translateY(${lerp(seg("--b2", 0.35, 0.5), 6, 0, "px")})` }}
            >
              {tx({ en: "does not add up · held at confirmation", fr: "le compte n'y est pas · bloquée à la confirmation", ar: "المجموع لا يستقيم · موقوفة عند التأكيد" })}
            </div>
            <div className="erp-mono mt-2 flex justify-between text-[0.68rem] text-faint" style={{ opacity: seg("--b2", 0.55, 0.7) }}>
              <span>{tx({ en: "price drift vs today", fr: "écart de prix vs aujourd'hui", ar: "انحراف السعر عن اليوم" })}</span>
              <span>{tx({ en: "0 lines · hint only", fr: "0 ligne · simple indice", ar: "0 بنود · مجرّد تلميح" })}</span>
            </div>
          </Panel>
        </div>
      </div>

      {/* flow strip */}
      <div className="erp-mono mt-3 hidden items-center gap-2 text-[0.68rem] text-faint md:flex">
        <span className={beat >= 0 ? "text-ink" : ""}>{tx({ en: "browser", fr: "navigateur", ar: "المتصفح" })}</span>
        <span className="h-px flex-1 bg-[var(--erp-hair-2)]" />
        <span className={beat >= 1 ? "text-ink" : ""}>{tx(GATE_L)}</span>
        <span className="h-px flex-1 bg-[var(--erp-hair-2)]" />
        <span className={beat >= 1 ? "text-ink" : ""}>{tx({ en: "stored", fr: "stockée", ar: "محفوظة" })} pending</span>
        <span className="h-px flex-1 bg-[var(--erp-hair-2)]" />
        <span className={beat >= 2 ? "text-signal" : ""}>{tx({ en: "arithmetic", fr: "arithmétique", ar: "الحساب" })}</span>
        <span className="h-px flex-1 bg-[var(--erp-hair-2)]" />
        <span className={beat >= 2 ? "text-signal" : ""}>{tx({ en: "flagged before packing", fr: "signalée avant emballage", ar: "مُعلَّمة قبل التغليف" })}</span>
      </div>
    </Figure>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="truncate">{k}</span>
      <span>{v}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 04.3 — Access policy                                                */
/* ------------------------------------------------------------------ */

const POLICY_ROWS: { c: string; r: string; w: string }[] = [
  { c: "orders", r: "self · orders.view", w: "need orders.edit" },
  { c: "products", r: "public", w: "need products.edit" },
  { c: "staff", r: "staff", w: "owner" },
  { c: "roles", r: "staff", w: "owner" },
  { c: "credentials", r: "owner", w: "owner" },
  { c: "posSync", r: "never", w: "never" },
];

const COUNTER: L = { en: "Counter", fr: "Comptoir", ar: "الشبّاك" };
const PERMS: { p: string; menu: L }[] = [
  { p: "till.sell", menu: COUNTER },
  { p: "stock.view", menu: { en: "Stock lookup", fr: "Consulter le stock", ar: "الاطّلاع على المخزون" } },
  { p: "orders.view", menu: { en: "Orders board", fr: "Tableau commandes", ar: "لوحة الطلبيات" } },
  { p: "orders.edit", menu: { en: "Move orders", fr: "Avancer commandes", ar: "تحريك الطلبيات" } },
  { p: "inventory.edit", menu: { en: "Adjust inventory", fr: "Ajuster l'inventaire", ar: "تعديل الجرد" } },
  { p: "products.edit", menu: { en: "Products", fr: "Produits", ar: "المنتجات" } },
  { p: "revenue.view", menu: { en: "Revenue", fr: "Recettes", ar: "الإيرادات" } },
  { p: "dashboard.view", menu: { en: "Dashboard", fr: "Tableau de bord", ar: "لوحة القيادة" } },
];

function PolicyStage() {
  const { beat } = useScene();
  return <SceneLayout wide copy={<SceneCopy beats={POLICY_COPY} />} figure={<FigPolicy beat={beat} />} />;
}

function FigPolicy({ beat }: { beat: number }) {
  const tx = useTx();
  const granted = (p: string) =>
    (beat >= 1 && (p === "till.sell" || p === "stock.view")) || (beat >= 2 && (p === "orders.view" || p === "orders.edit"));
  return (
    <Figure fig="FIG. 04.3" title={{ en: "policy table · role editor", fr: "table de politiques · rôles", ar: "جدول السياسات · الأدوار" }} className="w-full max-w-[860px] bg-paper/70 [contain:inline-size]" bodyClassName="p-3 md:p-5">
      <div className="grid gap-3 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
        {/* policy table */}
        <div className={mob(beat === 0)}>
          <Panel label={`POLICY · ${tx({ en: "read / write", fr: "lecture / écriture", ar: "قراءة / كتابة" })}`} lit={beat === 0} className="flex h-full flex-col" bodyClassName="flex flex-1 flex-col">
            <div className="erp-mono grid grid-cols-[5.4rem_minmax(0,1fr)_minmax(0,1fr)] gap-x-2 border-b border-[var(--erp-hair)] pb-1 text-[0.66rem] uppercase tracking-[0.1em] text-faint">
              <span>collection</span><span>{tx({ en: "read", fr: "lecture", ar: "قراءة" })}</span><span>{tx({ en: "write", fr: "écriture", ar: "كتابة" })}</span>
            </div>
            {POLICY_ROWS.map((r) => {
              const hot = beat === 2 && r.c === "orders";
              return (
                <div
                  key={r.c}
                  className={`erp-mono grid grid-cols-[5.4rem_minmax(0,1fr)_minmax(0,1fr)] gap-x-2 border-b border-[var(--erp-hair)] py-1 text-[0.72rem] transition-colors duration-300 ${
                    hot ? "bg-[var(--erp-signal-soft)] text-signal-deep" : "text-graphite"
                  }`}
                >
                  <span className="truncate text-ink">{r.c}</span>
                  <span className={`break-words ${r.r === "never" ? "text-faint line-through" : ""}`}>{r.r}</span>
                  <span className={`break-words ${r.w === "never" ? "text-faint line-through" : ""}`}>{r.w}</span>
                </div>
              );
            })}
            <div
              className="erp-mono mt-1.5 grid grid-cols-[5.4rem_minmax(0,1fr)] gap-x-2 border border-dashed border-signal px-1.5 py-1 text-[0.72rem]"
              style={{ opacity: `calc(0.35 + 0.65 * ${seg("--b0", 0.35, 0.55)})` }}
            >
              <span className="truncate text-mute">giftcards ?</span>
              <span className="truncate text-signal-deep">throw · No policy for collection</span>
            </div>
            <p className="erp-mono mt-auto pt-1.5 text-[0.66rem] text-faint">{tx({ en: "a collection without a row is refused, not defaulted", fr: "une collection sans ligne est refusée, sans valeur par défaut", ar: "المجموعة التي لا سطر لها تُرفض، ولا تأخذ قيمة افتراضية" })}</p>
          </Panel>
        </div>

        {/* role editor + menu */}
        <div className={mob(beat >= 1)}>
          <Panel label={<>{tx({ en: "role", fr: "rôle", ar: "الدور" })} · <span className="text-ink">{tx(COUNTER)}</span></>} lit={beat >= 1} className="h-full">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {PERMS.map(({ p }) => {
                const on = granted(p);
                const fresh = beat === 2 && (p === "orders.view" || p === "orders.edit");
                return (
                  <label key={p} className="erp-mono flex items-center gap-1.5 text-[0.7rem]">
                    <span
                      className={`flex h-[11px] w-[11px] shrink-0 items-center justify-center border transition-colors duration-300 ${
                        on ? (fresh ? "border-signal bg-signal" : "border-ink bg-ink") : "border-[var(--erp-hair-2)]"
                      }`}
                    />
                    <span className={`truncate ${on ? "text-ink" : "text-faint"}`}>{p}</span>
                  </label>
                );
              })}
            </div>
            <Lab className="mb-1 mt-3">{tx({ en: "menu this role sees", fr: "menu visible pour ce rôle", ar: "القائمة التي يراها هذا الدور" })}</Lab>
            <div className="grid grid-cols-2 gap-1">
              {PERMS.map(({ p, menu }) => {
                const on = granted(p);
                return (
                  <span
                    key={p}
                    className={`truncate border px-1.5 py-0.5 text-[0.72rem] transition-all duration-300 ${
                      on ? "border-ink text-ink" : "border-dashed border-[var(--erp-hair)] text-faint line-through opacity-50"
                    }`}
                  >
                    {tx(menu)}
                  </span>
                );
              })}
            </div>
            <div className="erp-mono mt-2.5 flex items-center justify-between gap-3 border-t border-[var(--erp-hair)] pt-1.5 text-[0.7rem]">
              <span className="text-mute">{tx({ en: "write orders as Counter", fr: "écrire une commande en Comptoir", ar: "كتابة طلبية بدور الشبّاك" })}</span>
              <span className={`text-end ${beat >= 2 ? "text-ink" : "text-signal-deep"}`}>{beat >= 2 ? tx({ en: "allowed", fr: "autorisé", ar: "مسموح" }) : tx({ en: "refused · needs orders.edit", fr: "refusé · exige orders.edit", ar: "مرفوض · يتطلّب orders.edit" })}</span>
            </div>
          </Panel>
        </div>
      </div>
      <p className="erp-mono mt-3 hidden text-[0.68rem] text-faint md:block">
        {tx({ en: "access kinds · public · staff · owner · need <permission> · self <field> · never — owner always passes", fr: "types d'accès · public · staff · owner · need <permission> · self <champ> · never — owner passe toujours", ar: "أنواع الوصول · public · staff · owner · need <permission> · self <field> · never — owner يمرّ دائمًا" })}
      </p>
    </Figure>
  );
}

/* ------------------------------------------------------------------ */
/* 04.4 — Three apps, one core                                         */
/* ------------------------------------------------------------------ */

function AppsStage() {
  const { beat } = useScene();
  return <SceneLayout wide copy={<SceneCopy beats={APPS} />} figure={<FigApps beat={beat} />} />;
}

function AppFrame({
  name,
  start,
  children,
  dim = false,
  badge,
}: {
  name: ReactNode;
  start: string;
  children: ReactNode;
  dim?: boolean;
  badge?: ReactNode;
}) {
  return (
    <div className={`relative flex flex-col border bg-paper ${dim ? "border-dashed border-[var(--erp-hair-2)]" : "border-ink"}`}>
      <div className="flex items-center justify-between gap-1 border-b border-[var(--erp-hair)] px-2 py-1">
        <span className="erp-mono truncate text-[11px] text-ink sm:text-[0.66rem]">{name}</span>
        <span className="erp-mono hidden shrink-0 text-[0.66rem] text-faint sm:inline">{start}</span>
      </div>
      <div className="flex-1 p-2">{children}</div>
      {badge}
    </div>
  );
}

function FigApps({ beat }: { beat: number }) {
  const tx = useTx();
  const offline = beat === 1;
  const ar = beat === 2;
  return (
    <Figure fig="FIG. 04.4" title={{ en: "three manifests · one core", fr: "trois manifestes · un socle", ar: "ثلاثة بيانات · نواة واحدة" }} className="w-full max-w-[860px] bg-paper/70 [contain:inline-size]" bodyClassName="p-3 md:p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,1fr)] gap-2 md:gap-3">
        {/* portal */}
        <AppFrame
          name="Dapper"
          start='"/"'
          dim={offline}
          badge={
            <span
              className="erp-mono absolute -bottom-2.5 end-1 whitespace-nowrap bg-signal px-1.5 text-[11px] uppercase tracking-[0.04em] sm:bottom-auto sm:-top-2.5 sm:text-[0.62rem] sm:tracking-[0.1em] text-white transition-opacity duration-300"
              style={{ opacity: offline ? 1 : 0 }}
            >
              {tx({ en: "offline", fr: "hors ligne", ar: "دون اتصال" })}
            </span>
          }
        >
          <div dir={ar ? "rtl" : "ltr"} className="text-start">
            <p className="text-[0.74rem] font-medium text-ink">{ar ? "طلبياتي" : tx({ en: "My orders", fr: "Mes commandes", ar: "طلبياتي" })}</p>
            <div className="mt-1.5 space-y-1">
              {[
                ["shipped", true],
                ["delivered", false],
              ].map(([s, cur]) => (
                <div key={String(s)} className="flex items-center justify-between gap-1 border border-[var(--erp-hair)] px-1 py-0.5">
                  <span className="hidden text-[0.66rem] text-mute sm:inline">{ar ? "طلبية" : tx({ en: "Order", fr: "Commande", ar: "طلبية" })}</span>
                  <span className={`erp-mono truncate text-[11px] sm:text-[0.62rem] ${cur ? "text-signal" : "text-graphite"}`}>{s}</span>
                </div>
              ))}
            </div>
            <div className="erp-mono mt-1.5 hidden text-[0.62rem] text-faint sm:block">self · customerUid</div>
          </div>
        </AppFrame>

        {/* back office */}
        <AppFrame name={<><span className="hidden sm:inline">Dapper </span>Admin</>} start='"/atelier"'>
          <div dir={ar ? "rtl" : "ltr"}>
            <div className="grid grid-cols-4 gap-1">
              {(ar ? ["pending", "confirmed", "preparing", "packed"].reverse() : ["pending", "confirmed", "preparing", "packed"]).map((c, i) => (
                <div key={c} className="min-w-0">
                  <div className="erp-mono hidden truncate border-b border-[var(--erp-hair)] pb-0.5 text-[0.6rem] text-faint sm:block">{c}</div>
                  {Array.from({ length: ar ? 3 - (i % 3) : 1 + (i % 3) }, (_, k) => (
                    <div key={k} className="mt-1 h-3 border border-[var(--erp-hair)] bg-shell/40" />
                  ))}
                </div>
              ))}
            </div>
            <div className="erp-mono mt-1.5 hidden text-[0.62rem] text-faint sm:block">{tx({ en: "orders board · read from status", fr: "tableau des commandes · lu depuis status", ar: "لوحة الطلبيات · تُقرأ من status" })}</div>
          </div>
        </AppFrame>

        {/* counter */}
        <AppFrame name={<><span className="hidden sm:inline">Dapper </span>Staff</>} start='"/comptoir"'>
          <div dir={ar ? "rtl" : "ltr"} className="text-start">
            <p className="text-[0.74rem] font-medium text-ink">{ar ? "مسح" : tx({ en: "Scan", fr: "Scanner", ar: "مسح" })}</p>
            <div className="mt-1.5 flex h-6 items-stretch gap-[2px] border border-[var(--erp-hair)] px-1 py-1" dir="ltr">
              {[2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2].map((w, i) => (
                <span key={i} className="bg-ink" style={{ width: w }} />
              ))}
            </div>
            <div className="erp-mono mt-1.5 text-[11px] text-faint sm:text-[0.62rem]">till.sell · stock.view</div>
          </div>
        </AppFrame>
      </div>

      {/* connectors */}
      <svg viewBox="0 0 300 36" preserveAspectRatio="none" className="block h-8 w-full md:h-10" aria-hidden>
        {[
          [50, offline],
          [150, false],
          [250, false],
        ].map(([x, cut]) => (
          <path
            key={String(x)}
            d={`M ${x} 0 L ${x} 18 L 150 30 L 150 36`}
            fill="none"
            stroke={cut ? "var(--erp-hair-2)" : "var(--color-signal)"}
            strokeWidth={1}
            strokeDasharray="4 10"
            vectorEffect="non-scaling-stroke"
            className={cut ? "" : "erp-flow"}
            opacity={cut ? 0.6 : 0.9}
          />
        ))}
      </svg>

      {/* core */}
      <div className="border border-ink bg-paper">
        <div className="grid grid-cols-3 divide-x divide-[var(--erp-hair)]">
          <div className="px-2 py-1.5">
            <Lab>routes</Lab>
            <p className="erp-display text-[1.3rem] text-ink">20</p>
            <p className="erp-mono hidden text-[0.62rem] text-faint sm:block">API</p>
          </div>
          <div className="px-2 py-1.5">
            <Lab>{tx({ en: "policy", fr: "politique", ar: "السياسة" })}</Lab>
            <p className="erp-display text-[1.3rem] text-ink">1</p>
            <p className="erp-mono hidden text-[0.62rem] text-faint sm:block">{tx({ en: "table · default", fr: "table · défaut", ar: "جدول · الافتراضي" })} never</p>
          </div>
          <div className="px-2 py-1.5">
            <Lab>Postgres</Lab>
            <p className="erp-display text-[1.3rem] text-ink">26</p>
            <p className="erp-mono hidden text-[0.62rem] text-faint sm:block">bo_* jsonb + auth</p>
          </div>
        </div>
      </div>

      {/* beat panels */}
      <div className="relative mt-3 min-h-[64px]">
        <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: beat === 0 ? 1 : 0 }}>
          <div className="erp-mono hidden grid-cols-3 gap-2 text-[0.64rem] text-mute sm:grid">
            <span className="truncate">{tx({ en: "manifest", fr: "manifeste", ar: "بيان" })} · {tx({ en: "portal", fr: "portail", ar: "البوابة" })}</span>
            <span className="truncate">{tx({ en: "manifest", fr: "manifeste", ar: "بيان" })} · {tx(BO)}</span>
            <span className="truncate">{tx({ en: "manifest", fr: "manifeste", ar: "بيان" })} · {tx({ en: "counter", fr: "comptoir", ar: "الشبّاك" })}</span>
          </div>
          <p className="erp-mono mt-1 text-[0.68rem] text-faint">{tx({ en: "three start addresses · one order record", fr: "trois adresses de départ · un seul enregistrement de commande", ar: "ثلاثة عناوين انطلاق · سجلّ طلبية واحد" })}</p>
        </div>
        <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: offline ? 1 : 0 }}>
          <Lab className="mb-1">{tx({ en: "local ledger · on the device", fr: "registre local · sur l'appareil", ar: "سجلّ محلي · على الجهاز" })}</Lab>
          <div className="erp-mono border border-signal bg-[var(--erp-signal-soft)] px-2 py-1 text-[0.72rem] text-signal-deep">
            {"{ "}id: &quot;DPR-3F9A0C12&quot;, status: &quot;pending&quot;, offline: true{" }"}
          </div>
        </div>
        <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: ar ? 1 : 0 }}>
          <Lab className="mb-1">{tx({ en: "locale", fr: "langue", ar: "اللغة" })}</Lab>
          <div className="flex gap-1.5">
            {["EN", "FR", "AR"].map((l) => (
              <span key={l} className={`erp-mono border px-2 py-0.5 text-[0.72rem] ${l === "AR" ? "border-signal text-signal" : "border-[var(--erp-hair-2)] text-mute"}`}>
                {l}
              </span>
            ))}
            <span className="erp-mono self-center text-[0.68rem] text-faint">dir=&quot;rtl&quot; · {tx({ en: "layout mirrored", fr: "mise en page en miroir", ar: "تخطيط معكوس" })}</span>
          </div>
        </div>
      </div>
    </Figure>
  );
}

/* ------------------------------------------------------------------ */
/* 04.5 — Stock                                                        */
/* ------------------------------------------------------------------ */

const NAVY: L = { en: "Navy", fr: "Marine", ar: "كحلي" };
const SAND: L = { en: "Sand", fr: "Sable", ar: "رملي" };
const CHINO: L = { en: "Chino", fr: "Chino", ar: "Chino" };
const MOVES: { at: string; bc: string; p: L; c: L; s: string; was: number; now: number }[] = [
  { at: "10:42", bc: "2001000004217", p: SHIRT, c: NAVY, s: "M", was: 8, now: 7 },
  { at: "10:31", bc: "2001000004200", p: SHIRT, c: NAVY, s: "S", was: 5, now: 4 },
  { at: "10:05", bc: "2001000003128", p: CHINO, c: SAND, s: "32", was: 6, now: 7 },
  { at: "09:52", bc: "2001000003135", p: CHINO, c: SAND, s: "34", was: 4, now: 3 },
  { at: "09:20", bc: "2001000005011", p: { en: "Overshirt", fr: "Surchemise", ar: "قميص علوي" }, c: { en: "Olive", fr: "Olive", ar: "زيتوني" }, s: "L", was: 3, now: 2 },
];
const WAS: L = { en: "was", fr: "avant", ar: "قبل" };
const NOW: L = { en: "now", fr: "après", ar: "بعد" };
const MOVED: L = { en: "moved", fr: "écart", ar: "الحركة" };
const ON_HAND: L = { en: "on hand", fr: "en stock", ar: "المتوفّر" };

function StockStage() {
  const { beat } = useScene();
  return <SceneLayout wide copy={<SceneCopy beats={STOCK} />} figure={<FigStock beat={beat} />} />;
}

function FigStock({ beat }: { beat: number }) {
  const tx = useTx();
  const num = useNumber();
  return (
    <Figure fig="FIG. 04.5" title={{ en: "scan · movement log · cover", fr: "scan · mouvements · couverture", ar: "مسح · الحركات · التغطية" }} className="w-full max-w-[860px] bg-paper/70 [contain:inline-size]" bodyClassName="p-3 md:p-5">
      <div className="grid gap-3 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
        {/* scan */}
        <div className={mob(beat === 0)}>
          <Panel label={`${tx({ en: "counter", fr: "comptoir", ar: "الشبّاك" })} · scan`} lit={beat === 0} className="flex h-full flex-col" bodyClassName="flex flex-1 flex-col">
            <div className="relative mx-auto flex min-h-14 w-full flex-1 max-w-[220px] items-stretch justify-center gap-[2px] overflow-hidden border border-[var(--erp-hair)] px-3 py-2">
              {[2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2].map((w, i) => (
                <span key={i} className="bg-ink" style={{ width: w }} />
              ))}
              <span
                className="absolute inset-x-0 h-px bg-signal shadow-[0_0_0_2px_var(--erp-signal-soft)]"
                style={{ top: lerp(seg("--b0", 0.05, 0.4), 6, 90, "%"), opacity: inv(seg("--b0", 0.4, 0.5)) }}
              />
            </div>
            <p className="erp-mono mt-1.5 text-center text-[0.72rem] text-ink">2001000004217</p>
            <div className="erp-mono mt-2 space-y-1 text-[0.72rem]" style={{ opacity: seg("--b0", 0.4, 0.55) }}>
              <div className="flex justify-between text-graphite"><span>{tx(SHIRT)} · {tx(NAVY)} · M</span></div>
              <div className="flex justify-between"><span className="text-mute">{tx({ en: "count arrives", fr: "quantité reçue", ar: "وصلت الكمية" })}</span><span className="text-ink">{tx(NOW)} 7</span></div>
            </div>
            <div
              className="erp-mono mt-2 border border-signal bg-[var(--erp-signal-soft)] px-2 py-1 text-[0.7rem] text-signal-deep"
              style={{ opacity: seg("--b0", 0.6, 0.75) }}
            >
              {tx(WAS)} 8 · {tx(NOW)} 7 · {tx(MOVED)} −1
            </div>
            {/* the same piece, size by size: M steps 8 → 7 and the total follows */}
            <div className="mt-3">
              <Lab className="mb-1">{tx(ON_HAND)} · {tx(SHIRT)}</Lab>
              <div className="erp-mono grid grid-cols-4 divide-x divide-[var(--erp-hair)] border border-[var(--erp-hair)] text-center text-[0.72rem]">
                {[
                  ["S", "4", "4"],
                  ["M", "8", "7"],
                  ["L", "3", "3"],
                  [tx({ en: "all", fr: "tout", ar: "الكل" }), "15", "14"],
                ].map(([k, was, now]) => (
                  <div key={k} className="py-1">
                    <p className="text-[0.66rem] uppercase text-faint">{k}</p>
                    {was === now ? (
                      <p className="text-ink">{now}</p>
                    ) : (
                      <p className="relative">
                        <span className="text-ink" style={{ opacity: inv(seg("--b0", 0.6, 0.75)) }}>{was}</span>
                        <span className="absolute inset-0 text-signal" style={{ opacity: seg("--b0", 0.6, 0.75) }}>{now}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>

        {/* log */}
        <div className={mob(beat >= 1)}>
          <Panel label={tx({ en: "movement log", fr: "journal des mouvements", ar: "سجلّ الحركات" })} lit={beat === 1} className={beat === 2 ? "hidden md:block" : ""}>
            <div className="erp-mono grid grid-cols-[minmax(0,1fr)_2.6rem_2.4rem_2.4rem_2.6rem] gap-x-1.5 border-b border-[var(--erp-hair)] pb-1 text-[11px] uppercase tracking-[0.02em] text-faint sm:text-[0.64rem] sm:grid-cols-[2.6rem_minmax(0,1fr)_3.2rem_2.6rem_2.4rem_2.4rem_2.6rem]">
              <span className="hidden sm:block">{tx({ en: "when", fr: "heure", ar: "الوقت" })}</span><span>{tx({ en: "piece", fr: "pièce", ar: "القطعة" })}</span><span className="hidden sm:block">{tx({ en: "colour", fr: "coul.", ar: "اللون" })}</span><span>{tx({ en: "size", fr: "taille", ar: "المقاس" })}</span><span>{tx(WAS)}</span><span>{tx(NOW)}</span><span className="text-end">{tx(MOVED)}</span>
            </div>
            {MOVES.map((m, i) => {
              const d = m.now - m.was;
              return (
                <div
                  key={i}
                  className={`erp-mono grid grid-cols-[minmax(0,1fr)_2.6rem_2.4rem_2.4rem_2.6rem] gap-x-1.5 border-b border-[var(--erp-hair)] py-[3px] text-[0.7rem] sm:grid-cols-[2.6rem_minmax(0,1fr)_3.2rem_2.6rem_2.4rem_2.4rem_2.6rem] ${
                    i === 0 ? "bg-[var(--erp-signal-soft)] text-signal-deep" : "text-graphite"
                  }`}
                  style={i === 0 ? { opacity: `calc(0.3 + 0.7 * ${seg("--b0", 0.6, 0.8)})` } : undefined}
                >
                  <span className="hidden text-mute sm:block">{m.at}</span>
                  <span className="truncate">{tx(m.p)}</span>
                  <span className="hidden truncate sm:block">{tx(m.c)}</span>
                  <span>{m.s}</span>
                  <span>{m.was}</span>
                  <span>{m.now}</span>
                  <span className={`text-end ${d < 0 ? "" : "text-ink"}`}>{d > 0 ? `+${d}` : d}</span>
                </div>
              );
            })}
            <div className="mt-2 flex items-center justify-between gap-2" style={{ opacity: `calc(0.25 + 0.75 * ${seg("--b1", 0.2, 0.4)})` }}>
              <span className="erp-mono text-[0.68rem] text-mute">{tx({ en: "out 4 · back 1 · 3 pieces", fr: "sorties 4 · retours 1 · 3 pièces", ar: "خروج 4 · عودة 1 · 3 قطع" })}</span>
              <span className="erp-mono shrink-0 whitespace-nowrap border border-ink px-2 py-0.5 text-[0.7rem] text-ink">{tx({ en: "Export CSV", fr: "Exporter CSV", ar: "تصدير CSV" })}</span>
            </div>
            <div className="erp-mono mt-1.5 truncate text-[0.66rem] text-faint" style={{ opacity: seg("--b1", 0.4, 0.6) }}>
              when,barcode,piece,colour,size,was,now,moved
            </div>
          </Panel>

          {/* cover */}
          <div className={`md:mt-3 ${beat === 2 ? "" : "hidden md:block"}`} style={{ opacity: `calc(0.35 + 0.65 * ${seg("--b2", 0.05, 0.25)})` }}>
            <Panel label={`${tx(SHIRT)} · ${tx({ en: "days of cover", fr: "jours de couverture", ar: "أيام التغطية" })}`} lit={beat === 2}>
              <div className="erp-mono grid grid-cols-2 gap-x-4 gap-y-1 text-[0.72rem] text-graphite sm:grid-cols-4">
                <div><Lab>{tx(ON_HAND)}</Lab><p className="text-[0.95rem] text-ink">14</p></div>
                <div><Lab className="whitespace-nowrap">{tx({ en: "sold 30 d", fr: "vendu 30 j", ar: "مُباع 30 ي" })}</Lab><p className="text-[0.95rem] text-ink">21</p></div>
                <div><Lab>{tx({ en: "per day", fr: "par jour", ar: "في اليوم" })}</Lab><p className="text-[0.95rem] text-ink">{num(0.7, 1)}</p></div>
                <div><Lab>{tx({ en: "cover", fr: "couverture", ar: "التغطية" })}</Lab><p className="text-[0.95rem] text-signal" style={{ opacity: seg("--b2", 0.3, 0.45) }}>20 {tx({ en: "d", fr: "j", ar: "ي" })}</p></div>
              </div>
              <div className="erp-mono mt-2 flex flex-wrap justify-between gap-x-3 border-t border-[var(--erp-hair)] pt-1.5 text-[0.7rem] text-mute" style={{ opacity: seg("--b2", 0.45, 0.6) }}>
                <span>14 ÷ (21 ÷ 30) = 20</span>
                <span>{tx({ en: "stock value", fr: "valeur du stock", ar: "قيمة المخزون" })} · 14 × {money(2400)} = <span className="text-ink">{money(33600)} DZD</span></span>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </Figure>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter                                                             */
/* ------------------------------------------------------------------ */

export default function DapperChapter() {
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

      <Scene id="dapper-lifecycle" beats={4} length={55} label={tx({ en: "Order lifecycle", fr: "Cycle de vie de la commande", ar: "دورة حياة الطلبية" })}>
        <LifecycleStage />
        <LightUp nodes={["orders"]} at={0.3} />
        <LightUp nodes={["audit"]} at={0.85} />
      </Scene>

      <Scene id="dapper-tamper" beats={3} length={50} label={tx({ en: "Tamper check", fr: "Contrôle d'intégrité", ar: "فحص التلاعب" })}>
        <TamperStage />
      </Scene>

      <Scene id="dapper-policy" beats={3} length={50} label={tx({ en: "Access policy", fr: "Politique d'accès", ar: "سياسة الوصول" })}>
        <PolicyStage />
        <LightUp nodes={["identity"]} at={0.4} />
      </Scene>

      <Scene id="dapper-apps" beats={3} length={50} label={tx({ en: "Three apps, one core", fr: "Trois apps, un socle", ar: "ثلاثة تطبيقات، نواة واحدة" })}>
        <AppsStage />
        <LightUp nodes={["portal"]} at={0.2} />
      </Scene>

      <Scene id="dapper-stock" beats={3} length={50} label={tx({ en: "Stock movements", fr: "Mouvements de stock", ar: "حركات المخزون" })}>
        <StockStage />
        <LightUp nodes={["inventory"]} at={0.4} />
      </Scene>

      <Section id="dapper-walkthrough" kicker={WALK.kicker} title={WALK.title} intro={WALK.intro}>
        <Walkthrough steps={WALK.steps} />
      </Section>

      <Section id="dapper-decisions" kicker={DECISIONS.kicker} title={DECISIONS.title} dark>
        <Decisions items={DECISIONS.items} />
      </Section>

      <Section id="dapper-proof" kicker={{ en: "04.8 — Proof", fr: "04.8 — Preuves", ar: "04.8 — الأدلّة" }}>
        <ProofStrip items={PROOF} />
        <p className="erp-display mt-12 max-w-[52rem] text-[clamp(1.3rem,2.2vw,1.9rem)] text-ink">{tx(CLOSING)}</p>
      </Section>

      <Rule label={{ en: "End of chapter 04", fr: "Fin du chapitre 04", ar: "نهاية الفصل 04" }} className="pb-10" />
    </>
  );
}
