"use client";

/**
 * Chapter 5 — The wire. An embeddable real-time messaging layer (widget + SDK):
 * how one message reaches every server and only the right room, and how its
 * events leave as signed, queued, retried webhooks behind a rate limit.
 */

import type { CSSProperties, ReactNode } from "react";
import { useTx, type L } from "@/lib/erp/i18n";
import { CHAPTERS } from "@/lib/erp/nodes";
import { draw, inv, lerp, seg, win } from "@/lib/erp/sv";
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
} from "../ui";

const META = CHAPTERS[4];

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

const COPY = {
  product: { en: "Messaging layer — widget + SDK", fr: "Couche messagerie — widget + SDK", ar: "طبقة المراسلة — أداة + SDK" } as L,
  oneLiner: {
    en: "The wire every module talks over.",
    fr: "Le fil sur lequel chaque module communique.",
    ar: "السلك الذي تتخاطب عبره كلّ الوحدات.",
  },
  context: [
    {
      en: "Modules have to reach people, and each other: a crew lead asks about a work order, a supervisor answers from the office, another system needs to know a conversation happened. This is the layer that carries it — a real-time messaging service any internal system can embed with one script tag, or drive from code through an SDK.",
      fr: "Les modules doivent joindre des personnes, et se joindre entre eux : un chef d'équipe pose une question sur un ordre de travail, un superviseur répond depuis le bureau, un autre système doit savoir qu'un échange a eu lieu. C'est la couche qui transporte tout cela — un service de messagerie temps réel que n'importe quel système interne intègre avec une seule balise script, ou pilote par code via un SDK.",
      ar: "على الوحدات أن تصل إلى الأشخاص وإلى بعضها البعض: رئيس فرقة يسأل عن أمر عمل، ومشرف يجيب من المكتب، ونظام آخر يحتاج إلى معرفة أنّ محادثة قد جرت. هذه هي الطبقة التي تنقل ذلك كلّه — خدمة مراسلة آنية يدمجها أيّ نظام داخلي بوسم script واحد، أو يتحكّم بها برمجيًا عبر SDK.",
    },
    {
      en: "It is a prototype — one focused build, not a finished product. What it proves is the plumbing an ERP needs underneath its conversations: workspaces isolated by API key, messages fanned out across server instances, events handed to other systems as signed, queued, retried webhooks, and a rate limit in front of everything.",
      fr: "C'est un prototype — une réalisation ciblée, pas un produit fini. Ce qu'il prouve, c'est la tuyauterie dont un ERP a besoin sous ses échanges : des espaces de travail isolés par clé d'API, des messages diffusés sur plusieurs instances serveur, des événements transmis aux autres systèmes sous forme de webhooks signés, mis en file et relancés, et une limite de débit devant le tout.",
      ar: "إنّه نموذج أوّلي — بناء مركّز واحد، وليس منتجًا مكتملًا. ما يثبته هو البنية التحتية التي يحتاجها نظام تخطيط الموارد تحت محادثاته: مساحات عمل معزولة بمفتاح API، ورسائل تُوزَّع على عدّة نسخ من الخادم، وأحداث تُسلَّم إلى الأنظمة الأخرى كـ webhooks موقّعة ومُصطفّة ومُعادة المحاولة، وحدّ للمعدّل أمام كلّ ذلك.",
    },
  ] as L[],
  roles: [
    {
      name: { en: "Integrator", fr: "Intégrateur", ar: "المُدمِج" },
      does: {
        en: "Drops the widget into a page, or calls the SDK with the workspace key.",
        fr: "Insère le widget dans une page, ou appelle le SDK avec la clé de l'espace.",
        ar: "يضع الأداة في صفحة، أو يستدعي SDK بمفتاح مساحة العمل.",
      },
    },
    {
      name: { en: "Member", fr: "Membre", ar: "العضو" },
      does: {
        en: "Writes in channels and threads, edits, reacts, sees who is typing.",
        fr: "Écrit dans les canaux et les fils, modifie, réagit, voit qui est en train d'écrire.",
        ar: "يكتب في القنوات والسلاسل، يعدّل، يتفاعل، ويرى من يكتب الآن.",
      },
    },
    {
      name: { en: "Other systems", fr: "Autres systèmes", ar: "الأنظمة الأخرى" },
      does: {
        en: "Receive chosen events as signed webhooks and act on them.",
        fr: "Reçoivent les événements choisis en webhooks signés et y réagissent.",
        ar: "تستقبل الأحداث المختارة كـ webhooks موقّعة وتتصرّف بناءً عليها.",
      },
    },
  ],
  platforms: [
    { en: "Embeddable web widget", fr: "Widget web intégrable", ar: "أداة ويب قابلة للتضمين" },
    { en: "TypeScript SDK", fr: "SDK TypeScript", ar: "SDK بلغة TypeScript" },
    { en: "REST + socket.io API", fr: "API REST + socket.io", ar: "واجهة REST + socket.io" },
  ] as L[],
  facts: [
    { value: 20, suffix: " /s", label: { en: "requests per second, short window", fr: "requêtes par seconde, fenêtre courte", ar: "طلبًا في الثانية، النافذة القصيرة" } },
    { value: 100, suffix: " /min", label: { en: "requests per minute, long window", fr: "requêtes par minute, fenêtre longue", ar: "طلب في الدقيقة، النافذة الطويلة" } },
    { value: 3, label: { en: "delivery attempts per webhook", fr: "tentatives de livraison par webhook", ar: "محاولات تسليم لكل webhook" } },
    { value: 1, label: { en: "script tag to embed the widget", fr: "balise script pour intégrer le widget", ar: "وسم script لتضمين الأداة" } },
  ],

  fanout: [
    {
      kicker: { en: "Fan-out · 01 — the write", fr: "Diffusion · 01 — l'écriture", ar: "التوزيع · 01 — الكتابة" },
      title: {
        en: "A message is written once, on whichever server receives it.",
        fr: "Un message est écrit une seule fois, sur le serveur qui le reçoit.",
        ar: "تُكتب الرسالة مرّة واحدة، على أيّ خادم يستقبلها.",
      },
      body: {
        en: "The widget posts to POST /messages with the user's token and the workspace key ws_…. Three guards run first — token, workspace, permission — then the row is stored. Nothing is broadcast before the record exists.",
        fr: "Le widget envoie POST /messages avec le jeton de l'utilisateur et la clé d'espace ws_…. Trois gardes passent d'abord — jeton, espace, permission — puis la ligne est enregistrée. Rien n'est diffusé avant que l'enregistrement n'existe.",
        ar: "ترسل الأداة الطلب POST /messages مع رمز المستخدم ومفتاح مساحة العمل ws_…. تمرّ ثلاثة حرّاس أوّلًا — الرمز، ومساحة العمل، والصلاحية — ثمّ يُحفظ السطر. لا يُبثّ شيء قبل أن يوجد السجلّ.",
      },
      details: [
        {
          en: "A request that targets another workspace is refused with 403 — “Cross-workspace access is not allowed”.",
          fr: "Une requête qui vise un autre espace est refusée en 403 — « Cross-workspace access is not allowed ».",
          ar: "يُرفض كلّ طلب يستهدف مساحة عمل أخرى برمز 403 — «Cross-workspace access is not allowed».",
        },
        {
          en: "Typing indicators ride the same wire as typing.started / typing.stopped — they are relayed, never stored.",
          fr: "Les indicateurs de saisie empruntent le même fil (typing.started / typing.stopped) — relayés, jamais stockés.",
          ar: "مؤشّرات الكتابة تسلك السلك نفسه (typing.started / typing.stopped) — تُمرَّر ولا تُخزَّن أبدًا.",
        },
      ] as L[],
    },
    {
      kicker: { en: "Fan-out · 02 — the bus", fr: "Diffusion · 02 — le bus", ar: "التوزيع · 02 — الناقل" },
      title: {
        en: "Redis carries it to every server.",
        fr: "Redis le porte vers chaque serveur.",
        ar: "ينقلها Redis إلى كلّ خادم.",
      },
      body: {
        en: "Instance A publishes message.created on Redis pub/sub. Every API instance is subscribed to that channel — A included. Which server a recipient happens to be connected to stops mattering, so the socket tier grows by adding instances, with no sticky routing between sender and receiver.",
        fr: "L'instance A publie message.created sur Redis pub/sub. Chaque instance de l'API est abonnée à ce canal — A comprise. Le serveur auquel un destinataire est connecté n'a plus d'importance : la couche socket grandit en ajoutant des instances, sans routage collant entre émetteur et destinataire.",
        ar: "تنشر النسخة A الحدث message.created عبر Redis pub/sub. كلّ نسخ الواجهة مشتركة في هذه القناة — بما فيها A. لم يعد يهمّ بأيّ خادم اتّصل المستلم، فتتوسّع طبقة المقابس بإضافة نسخ جديدة، دون توجيه ثابت بين المرسل والمستلم.",
      },
      details: [
        {
          en: "The publish happens after the insert, in the same service call that queues the webhook.",
          fr: "La publication suit l'insertion, dans le même appel de service qui met le webhook en file.",
          ar: "يتمّ النشر بعد الإدراج، في نداء الخدمة نفسه الذي يضع الـ webhook في الطابور.",
        },
      ] as L[],
    },
    {
      kicker: { en: "Fan-out · 03 — the room", fr: "Diffusion · 03 — la salle", ar: "التوزيع · 03 — الغرفة" },
      title: {
        en: "Each server delivers only into the right room.",
        fr: "Chaque serveur ne livre que dans la bonne salle.",
        ar: "كلّ خادم يسلّم إلى الغرفة الصحيحة فقط.",
      },
      body: {
        en: "A socket joins channel:{workspace}:{channel} only after its token is verified and the channel is found inside its own workspace. On message.created, each instance emits new_message to that room alone. A client of another workspace, on the same server, receives nothing.",
        fr: "Un socket ne rejoint channel:{workspace}:{channel} qu'après vérification de son jeton, et seulement si le canal existe dans son propre espace. Sur message.created, chaque instance émet new_message vers cette salle uniquement. Un client d'un autre espace, sur le même serveur, ne reçoit rien.",
        ar: "لا ينضمّ المقبس إلى channel:{workspace}:{channel} إلّا بعد التحقّق من رمزه ووجود القناة داخل مساحة عمله. عند message.created، تبثّ كلّ نسخة new_message إلى تلك الغرفة وحدها. عميل من مساحة عمل أخرى، على الخادم نفسه، لا يتلقّى شيئًا.",
      },
      details: [
        {
          en: "Isolation is decided on the server, before any event is emitted — not filtered in the browser.",
          fr: "L'isolation se décide côté serveur, avant toute émission — pas par un filtre dans le navigateur.",
          ar: "يُحسم العزل على الخادم قبل بثّ أيّ حدث — لا بتصفية داخل المتصفّح.",
        },
      ] as L[],
    },
  ],

  hooks: [
    {
      kicker: { en: "Webhooks · 01 — the signature", fr: "Webhooks · 01 — la signature", ar: "Webhooks · 01 — التوقيع" },
      title: {
        en: "An event leaves as a signed request.",
        fr: "Un événement part sous forme de requête signée.",
        ar: "يغادر الحدث في صورة طلب موقّع.",
      },
      body: {
        en: "Each endpoint a workspace registers receives the event as { event, data, timestamp }, with an HMAC-SHA256 of that exact body — keyed with the endpoint's own secret — in the x-webhook-signature header. The receiver recomputes it: same secret and same bytes give the same signature. Anything else can be turned away.",
        fr: "Chaque point de terminaison enregistré par un espace reçoit l'événement sous la forme { event, data, timestamp }, avec un HMAC-SHA256 de ce corps exact — calculé avec le secret propre à ce point — dans l'en-tête x-webhook-signature. Le destinataire le recalcule : même secret et mêmes octets donnent la même signature. Tout le reste peut être rejeté.",
        ar: "تستقبل كلّ نقطة نهاية تسجّلها مساحة العمل الحدث بالشكل { event, data, timestamp }، مع بصمة HMAC-SHA256 لهذا الجسم بالضبط — بالسرّ الخاص بتلك النقطة — في الترويسة x-webhook-signature. يعيد المستلم حسابها: السرّ نفسه والبايتات نفسها تعطي التوقيع نفسه. وما عدا ذلك يمكن رفضه.",
      },
      details: [
        {
          en: "Events: message.created, message.updated, channel.created, channel.member_added, channel.member_removed.",
          fr: "Événements : message.created, message.updated, channel.created, channel.member_added, channel.member_removed.",
          ar: "الأحداث: message.created وmessage.updated وchannel.created وchannel.member_added وchannel.member_removed.",
        },
        {
          en: "Why: a maintenance or HR module can react to a conversation — and know the call really came from the messaging layer.",
          fr: "Pourquoi : un module maintenance ou RH peut réagir à un échange — et savoir que l'appel vient bien de la messagerie.",
          ar: "لماذا: تستطيع وحدة الصيانة أو الموارد البشرية التفاعل مع محادثة — وهي متأكّدة أنّ النداء صادر فعلًا عن طبقة المراسلة.",
        },
      ] as L[],
    },
    {
      kicker: { en: "Webhooks · 02 — the queue", fr: "Webhooks · 02 — la file", ar: "Webhooks · 02 — الطابور" },
      title: {
        en: "A receiver that is down does not slow the sender.",
        fr: "Un destinataire en panne ne ralentit pas l'émetteur.",
        ar: "المستلم المتعطّل لا يُبطئ المرسل.",
      },
      body: {
        en: "Delivery is a job on a BullMQ queue, not an HTTP call inside the request. The person who wrote the message gets their answer at once; a worker posts the event, five deliveries in parallel. A non-2xx response throws, and the queue retries: three attempts, exponential backoff from 5 seconds.",
        fr: "La livraison est une tâche dans une file BullMQ, pas un appel HTTP à l'intérieur de la requête. L'auteur du message a sa réponse tout de suite ; un worker poste l'événement, cinq livraisons en parallèle. Une réponse hors 2xx lève une erreur et la file relance : trois tentatives, attente exponentielle à partir de 5 secondes.",
        ar: "التسليم مهمّة في طابور BullMQ، وليس نداء HTTP داخل الطلب. يحصل كاتب الرسالة على الردّ فورًا؛ ويتولّى عامل إرسال الحدث، خمس عمليات تسليم بالتوازي. أيّ ردّ خارج 2xx يرفع خطأ، فيعيد الطابور المحاولة: ثلاث محاولات، بانتظار أسّي يبدأ من 5 ثوانٍ.",
      },
      details: [
        {
          en: "Demo run: 503, 503, then 200 — delivered on the third attempt, 15 s after the first.",
          fr: "Exécution de démonstration : 503, 503, puis 200 — livré à la troisième tentative, 15 s après la première.",
          ar: "تشغيل تجريبي: 503، 503، ثمّ 200 — سُلِّم في المحاولة الثالثة، بعد 15 ثانية من الأولى.",
        },
        {
          en: "Completed jobs are removed: the queue only holds work still to do.",
          fr: "Les tâches terminées sont retirées : la file ne contient que le travail restant.",
          ar: "تُحذف المهامّ المنجزة: لا يحمل الطابور إلّا ما تبقّى من عمل.",
        },
      ] as L[],
    },
    {
      kicker: { en: "Rate limit", fr: "Limite de débit", ar: "حدّ المعدّل" },
      title: {
        en: "A burst is cut at the door.",
        fr: "Une rafale est coupée à l'entrée.",
        ar: "الدفعة المفاجئة تُقطع عند الباب.",
      },
      body: {
        en: "Two windows guard every route: short, 20 requests per second, and long, 100 per minute. The short window catches a spike from one runaway integration; the long one caps sustained load. Over either, the request is refused with HTTP 429 before any controller runs.",
        fr: "Deux fenêtres gardent chaque route : short, 20 requêtes par seconde, et long, 100 par minute. La fenêtre courte arrête le pic d'une intégration emballée ; la longue plafonne la charge soutenue. Au-delà de l'une ou l'autre, la requête est refusée en HTTP 429 avant qu'aucun contrôleur ne s'exécute.",
        ar: "نافذتان تحرسان كلّ مسار: short بعشرين طلبًا في الثانية، وlong بمئة طلب في الدقيقة. تلتقط النافذة القصيرة ذروة تكامل منفلت؛ وتضع الطويلة سقفًا للحمل المستمرّ. عند تجاوز أيّ منهما يُرفض الطلب برمز HTTP 429 قبل تشغيل أيّ متحكّم.",
      },
      details: [
        {
          en: "The guard is global: no route can forget it.",
          fr: "La garde est globale : aucune route ne peut l'oublier.",
          ar: "الحارس عامّ: لا يمكن لأيّ مسار أن يغفل عنه.",
        },
      ] as L[],
    },
  ],

  decisions: [
    {
      decision: { en: "Redis pub/sub between API instances", fr: "Redis pub/sub entre les instances de l'API", ar: "Redis pub/sub بين نسخ الواجهة" },
      alternative: { en: "Sticky sessions pinning everyone in a channel to one server", fr: "Des sessions collantes qui fixent tout un canal sur un seul serveur", ar: "جلسات ثابتة تربط كلّ أعضاء القناة بخادم واحد" },
      reason: {
        en: "Any instance can deliver to any connected client, so capacity grows by adding instances, and one conversation can span several servers.",
        fr: "N'importe quelle instance peut livrer à n'importe quel client connecté : la capacité grandit en ajoutant des instances, et une même conversation peut s'étendre sur plusieurs serveurs.",
        ar: "أيّ نسخة تستطيع التسليم لأيّ عميل متّصل، فتنمو السعة بإضافة نسخ، ويمكن للمحادثة الواحدة أن تمتدّ عبر عدّة خوادم.",
      },
    },
    {
      decision: { en: "Webhooks as queued BullMQ jobs, signed with HMAC", fr: "Des webhooks en tâches BullMQ, signés en HMAC", ar: "Webhooks كمهامّ BullMQ في طابور، موقّعة بـ HMAC" },
      alternative: { en: "Calling the receiver inline, unsigned", fr: "Appeler le destinataire en ligne, sans signature", ar: "نداء المستلم مباشرة ودون توقيع" },
      reason: {
        en: "A slow or offline module must not slow the person writing; retries absorb short outages; the signature lets the receiver trust the origin.",
        fr: "Un module lent ou hors ligne ne doit pas ralentir celui qui écrit ; les relances absorbent les coupures courtes ; la signature permet au destinataire de faire confiance à l'origine.",
        ar: "الوحدة البطيئة أو غير المتّصلة يجب ألّا تُبطئ من يكتب؛ وإعادة المحاولة تمتصّ الانقطاعات القصيرة؛ والتوقيع يتيح للمستلم الوثوق بالمصدر.",
      },
    },
    {
      decision: { en: "One API key per workspace, rooms keyed by workspace", fr: "Une clé d'API par espace, des salles indexées par espace", ar: "مفتاح API لكلّ مساحة عمل، وغرف مفهرسة بمساحة العمل" },
      alternative: { en: "A shared key, with filtering in the client", fr: "Une clé partagée, avec filtrage côté client", ar: "مفتاح مشترك مع تصفية لدى العميل" },
      reason: {
        en: "Isolation is enforced on the server before anything is emitted; an embedding system only ever holds its own ws_ key.",
        fr: "L'isolation est appliquée côté serveur avant toute émission ; un système intégrateur ne détient que sa propre clé ws_.",
        ar: "يُفرض العزل على الخادم قبل أيّ بثّ؛ والنظام المُدمِج لا يحمل إلّا مفتاح ws_ الخاص به.",
      },
    },
    {
      decision: { en: "Two throttle windows: 20 per second, 100 per minute", fr: "Deux fenêtres de limitation : 20 par seconde, 100 par minute", ar: "نافذتا تقييد: 20 في الثانية، و100 في الدقيقة" },
      alternative: { en: "A single limit", fr: "Une limite unique", ar: "حدّ واحد" },
      reason: {
        en: "One window cannot both tolerate a short burst and cap a steady flood; two windows do.",
        fr: "Une seule fenêtre ne peut pas à la fois tolérer une rafale courte et plafonner un flot continu ; deux le peuvent.",
        ar: "نافذة واحدة لا تستطيع أن تتسامح مع دفعة قصيرة وأن تحدّ من تدفّق مستمرّ معًا؛ أمّا نافذتان فتستطيعان.",
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Chapter                                                             */
/* ------------------------------------------------------------------ */

export default function ChatChapter() {
  const tx = useTx();
  return (
    <>
      <ChapterCover
        n={META.n}
        title={META.title}
        product={COPY.product}
        oneLiner={COPY.oneLiner}
        context={COPY.context}
        roles={COPY.roles}
        platforms={COPY.platforms}
        nodes={["comms", "tenancy", "jobs"]}
        facts={COPY.facts}
        aside={<SdkCard />}
      />

      <Scene id="chat-fanout" beats={3} length={70} label={tx({ en: "Fan-out", fr: "Diffusion", ar: "التوزيع" })}>
        <FanoutStage />
        <LightUp nodes={["comms"]} at={0.74} />
        <LightUp nodes={["tenancy", "identity"]} at={0.86} />
      </Scene>

      <Scene id="chat-webhooks" beats={3} length={70} label={tx({ en: "Webhooks", fr: "Webhooks", ar: "Webhooks" })}>
        <HooksStage />
        <LightUp nodes={["jobs"]} at={0.5} />
      </Scene>

      <Section
        id="chat-decisions"
        dark
        kicker={{ en: "Decisions", fr: "Décisions", ar: "القرارات" }}
        title={{
          en: "Small surface, deliberate plumbing.",
          fr: "Petite surface, tuyauterie réfléchie.",
          ar: "واجهة صغيرة، وبنية تحتية مدروسة.",
        }}
        intro={{
          en: "A prototype is where the expensive choices get made early. These are the ones that decide whether the wire holds when more modules start talking over it.",
          fr: "C'est dans un prototype que les choix coûteux se font tôt. Voici ceux qui décident si le fil tient quand davantage de modules communiquent dessus.",
          ar: "في النموذج الأوّلي تُتّخذ الخيارات المكلفة مبكرًا. هذه هي الخيارات التي تحدّد ما إذا كان السلك سيصمد حين تبدأ وحدات أكثر بالتخاطب عبره.",
        }}
      >
        <Decisions items={COPY.decisions} />
        <ProofStrip
          dark
          className="mt-16"
          items={[
            { value: 20, suffix: " /s", label: { en: "short window, per caller", fr: "fenêtre courte, par appelant", ar: "النافذة القصيرة، لكلّ مُستدعٍ" }, note: { en: "ttl 1 000 ms", fr: "ttl 1 000 ms", ar: "ttl 1 000 ms" } },
            { value: 100, suffix: " /min", label: { en: "long window, per caller", fr: "fenêtre longue, par appelant", ar: "النافذة الطويلة، لكلّ مُستدعٍ" }, note: { en: "ttl 60 000 ms", fr: "ttl 60 000 ms", ar: "ttl 60 000 ms" } },
            { value: 3, label: { en: "attempts per webhook delivery", fr: "tentatives par livraison de webhook", ar: "محاولات لكلّ تسليم webhook" }, note: { en: "exponential backoff, 5 s base", fr: "attente exponentielle, base 5 s", ar: "انتظار أسّي، أساس 5 ث" } },
            { value: 1, label: { en: "script tag to embed the widget", fr: "balise script pour intégrer le widget", ar: "وسم script لتضمين الأداة" }, note: { en: "or the SDK, from code", fr: "ou le SDK, par code", ar: "أو SDK برمجيًا" } },
          ]}
        />
        <p className="erp-mono mt-14 text-[0.72rem] uppercase tracking-[0.16em] text-white/45">
          {tx({
            en: "Prototype · one focused build — the last module is wired. Next: the map, complete.",
            fr: "Prototype · une réalisation ciblée — le dernier module est câblé. Ensuite : la carte, complète.",
            ar: "نموذج أوّلي · بناء مركّز واحد — آخر وحدة موصولة. التالي: الخريطة، مكتملة.",
          })}
        </p>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Cover aside: the SDK surface                                        */
/* ------------------------------------------------------------------ */

function SdkCard() {
  const tx = useTx();
  const lines: [string, string][] = [
    ["chatSDK.initialize", '({ apiKey: "ws_1f3a…", token })'],
    ["chatSDK.joinChannel", "(channelId)"],
    ["chatSDK.subscribe", "(channelId, onMessage)"],
    ["chatSDK.onTyping", "(onTyping)"],
    ["await chatSDK.sendMessage", `(channelId, "${tx(MSG)}")`],
  ];
  return (
    <Figure
      fig="FIG. 05.0"
      title={{ en: "Drop-in surface", fr: "Surface d'intégration", ar: "واجهة التضمين" }}
      footer={
        <p dir="auto" className="erp-mono text-[0.62rem] uppercase tracking-[0.14em] text-faint">
          {tx({ en: "Status · prototype", fr: "Statut · prototype", ar: "الحالة · نموذج أوّلي" })}
        </p>
      }
    >
      <div className="px-3.5 py-3">
        <p className="erp-mono text-[0.66rem] text-faint">{"<script src=\"…\"></script>"}</p>
        <p dir="auto" className="mt-1 text-start text-[0.8rem] leading-snug text-mute">
          {tx({
            en: "One tag mounts a floating chat panel on any internal page.",
            fr: "Une balise monte un panneau de discussion flottant sur n'importe quelle page interne.",
            ar: "وسم واحد يركّب لوحة محادثة عائمة على أيّ صفحة داخلية.",
          })}
        </p>
        <div className="mt-3 space-y-1 border-t border-[var(--erp-hair)] pt-3">
          {lines.map(([fn, args]) => (
            <p key={fn} className="erp-mono overflow-hidden text-ellipsis whitespace-nowrap text-[0.7rem] text-graphite">
              <span className="text-ink">{fn}</span>
              <span className="text-faint">{args}</span>
            </p>
          ))}
        </div>
      </div>
    </Figure>
  );
}

/* ------------------------------------------------------------------ */
/* Scroll helpers                                                      */
/* ------------------------------------------------------------------ */

const MSG: L = { en: "Crew 4 on site", fr: "Équipe 4 sur site", ar: "الفرقة 4 في الموقع" };
const TYPING: L = { en: "Ana is typing…", fr: "Ana écrit…", ar: "Ana تكتب…" };
const KEY: L = { en: "key", fr: "clé", ar: "مفتاح" };
const SEND: L = { en: "send", fr: "envoyer", ar: "إرسال" };
const WRITE: L = { en: "write", fr: "écriture", ar: "كتابة" };
const FANOUT: L = { en: "fan-out", fr: "diffusion", ar: "توزيع" };
const NOTROOM: L = { en: "not in room", fr: "hors salle", ar: "خارج الغرفة" };
const WS: L = { en: "workspace", fr: "espace", ar: "المساحة" };
const ARIA: L = {
  en: "Message fan-out across server instances through Redis",
  fr: "Diffusion d'un message sur les instances serveur via Redis",
  ar: "توزيع رسالة على نسخ الخادم عبر Redis",
};

/** Short laptops (≈1366×620): smaller titles, two details, so the copy column is not clipped. */
const SHORT_COPY =
  "[@media(min-width:1024px)_and_(max-height:760px)]:[&_h3]:text-[clamp(1.45rem,2.3vw,2rem)] [@media(min-width:1024px)_and_(max-height:700px)]:[&_li:nth-child(n+3)]:hidden";

type Pt = [number, number];

/** Move a packet along a polyline while `v` goes a → b (fades in/out at the ends). */
function along(v: string, a: number, b: number, pts: Pt[]): CSSProperties {
  const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = lens.reduce((s, l) => s + l, 0) || 1;
  let acc = 0;
  const xs: string[] = [];
  const ys: string[] = [];
  lens.forEach((l, i) => {
    const s0 = a + (b - a) * (acc / total);
    acc += l;
    const s1 = a + (b - a) * (acc / total);
    const t = seg(v, s0, s1);
    const dx = pts[i + 1][0] - pts[i][0];
    const dy = pts[i + 1][1] - pts[i][1];
    if (dx) xs.push(`${t} * ${dx}px`);
    if (dy) ys.push(`${t} * ${dy}px`);
  });
  const x = xs.length ? `calc(${pts[0][0]}px + ${xs.join(" + ")})` : `${pts[0][0]}px`;
  const y = ys.length ? `calc(${pts[0][1]}px + ${ys.join(" + ")})` : `${pts[0][1]}px`;
  return { transform: `translate(${x}, ${y})`, opacity: win(v, a, b, 0.04, 0.04) };
}

function pathOf(pts: Pt[]) {
  return pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
}

function lenOf(pts: Pt[]) {
  return pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
}

/** A hairline wire that lights in signal orange as its packet passes. */
function Wire({ pts, v, a, b, dashed = false }: { pts: Pt[]; v: string; a: number; b: number; dashed?: boolean }) {
  const d = pathOf(pts);
  const len = lenOf(pts);
  return (
    <g>
      <path d={d} fill="none" stroke="var(--erp-hair-2)" strokeWidth={1} strokeDasharray={dashed ? "3 4" : undefined} />
      {!dashed && <path d={d} fill="none" stroke="var(--color-signal)" strokeWidth={1.6} style={draw(v, a, b, len)} />}
    </g>
  );
}

function Packet({ v, a, b, pts }: { v: string; a: number; b: number; pts: Pt[] }) {
  return (
    <g style={along(v, a, b, pts)}>
      <rect x={-5} y={-5} width={10} height={10} fill="var(--color-signal)" />
      <rect x={-9} y={-9} width={18} height={18} fill="none" stroke="var(--color-signal)" strokeOpacity={0.35} />
    </g>
  );
}

const INK = "var(--color-ink)";
const MUTE = "var(--color-mute)";
const FAINT = "var(--color-faint)";
const SIGNAL = "var(--color-signal)";
const HAIR = "var(--erp-hair-2)";

function Box({ x, y, w, h, children, faint = false }: { x: number; y: number; w: number; h: number; children?: ReactNode; faint?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="var(--color-paper)" stroke={faint ? "var(--erp-hair)" : HAIR} strokeDasharray={faint ? "4 3" : undefined} />
      {children}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 1 — fan-out                                                   */
/* ------------------------------------------------------------------ */

// geometry (viewBox 640 × 372)
const CA = { x: 16, y: 12, w: 200, h: 140 }; // client A (sender)
const CB = { x: 424, y: 12, w: 200, h: 140 }; // client B (receiver)
const SA = { x: 16, y: 196, w: 200, h: 60 }; // instance A
const SB = { x: 424, y: 196, w: 200, h: 60 }; // instance B
const DB = { x: 16, y: 300, w: 170, h: 60 }; // messages table
const RD = { x: 245, y: 300, w: 150, h: 60 }; // redis
const CC = { x: 424, y: 300, w: 200, h: 60 }; // client of another workspace

const P_SEND: Pt[] = [[84, CA.y + CA.h], [84, SA.y]];
const P_DB: Pt[] = [[70, SA.y + SA.h], [70, DB.y]];
const P_PUB: Pt[] = [[SA.x + SA.w, 226], [290, 226], [290, RD.y]];
const P_SUBB: Pt[] = [[340, RD.y], [340, 226], [SB.x, 226]];
const P_SUBA: Pt[] = [[RD.x, 340], [206, 340], [206, SA.y + SA.h]];
const P_EMITB: Pt[] = [[520, SB.y], [520, CB.y + CB.h]];
const P_EMITA: Pt[] = [[206, SA.y], [206, CA.y + CA.h]];
const P_EMITC: Pt[] = [[560, SB.y + SB.h], [560, CC.y]];

function FanoutStage() {
  const tx = useTx();
  const { beat } = useScene();
  return (
    <SceneLayout
      wide
      copy={
        <div className={SHORT_COPY}>
          <BeatDots count={3} current={beat} className="mb-5" />
          <AtStack>
            {COPY.fanout.map((c, i) => (
              <At key={i} from={i}>
                <BeatCopy kicker={c.kicker} title={c.title} body={c.body} details={c.details} />
              </At>
            ))}
          </AtStack>
        </div>
      }
      figure={
        <div className="w-full [contain:inline-size]">
          <Figure fig="FIG. 05.1" title={{ en: "One write, one room", fr: "Une écriture, une salle", ar: "كتابة واحدة، غرفة واحدة" }} className="w-full min-w-0 md:hidden">
            <FanoutSvgMobile />
          </Figure>
          <Figure
            fig="FIG. 05.1"
            title={{ en: "One write, every instance, one room", fr: "Une écriture, chaque instance, une salle", ar: "كتابة واحدة، كلّ النسخ، غرفة واحدة" }}
            className="hidden w-full min-w-0 md:block"
            footer={
              <p className="erp-mono truncate text-[0.66rem] text-faint">
                {tx({ en: "room", fr: "salle", ar: "الغرفة" })} = channel:{"{workspaceId}"}:{"{channelId}"} · emit new_message
              </p>
            }
          >
            <FanoutSvg />
          </Figure>
        </div>
      }
    />
  );
}

function WidgetHead({ x, y, w, label, keyLabel, faint = false }: { x: number; y: number; w: number; label: string; keyLabel: string; faint?: boolean }) {
  return (
    <g>
      <line x1={x} x2={x + w} y1={y + 22} y2={y + 22} stroke="var(--erp-hair)" />
      <text x={x + 10} y={y + 15} fontSize={11} fill={faint ? FAINT : INK} className="erp-mono">
        {label}
      </text>
      <text x={x + w - 10} y={y + 15} fontSize={10} fill={FAINT} textAnchor="end" className="erp-mono">
        {keyLabel}
      </text>
    </g>
  );
}

/** The existing conversation shown in both same-workspace widgets: an edited message with a thread and reactions. */
function History({ x, y }: { x: number; y: number }) {
  const tx = useTx();
  return (
    <g>
      <text x={x + 10} y={y + 40} fontSize={11} fill={INK}>
        <tspan fontWeight={600}>Lina</tspan>
        <tspan dx={6} fill={MUTE}>{tx({ en: "Dock 2 cleared", fr: "Quai 2 dégagé", ar: "الرصيف 2 أُخلي" })}</tspan>
      </text>
      <text x={x + 190} y={y + 40} fontSize={10} fill={FAINT} textAnchor="end" className="erp-mono">
        {tx({ en: "edited", fr: "modifié", ar: "معدّل" })}
      </text>
      <text x={x + 18} y={y + 56} fontSize={10} fill={FAINT} className="erp-mono">
        ↳ 2 {tx({ en: "replies", fr: "réponses", ar: "ردود" })} · +1 3
      </text>
    </g>
  );
}

function FanoutSvg() {
  const tx = useTx();
  const b0 = "--b0";
  const b1 = "--b1";
  const b2 = "--b2";
  const typed = seg(b0, 0.02, 0.14);
  const sent = seg(b0, 0.2, 0.26);
  const guards = ["JWT", tx(WS), "permission"];
  return (
    <svg viewBox="0 0 640 372" className="block h-auto max-h-[44svh] w-full lg:max-h-[62svh]" role="img" aria-label={tx(ARIA)}>
      {/* wires */}
      <Wire pts={P_SEND} v={b0} a={0.14} b={0.3} />
      <Wire pts={P_DB} v={b0} a={0.6} b={0.76} />
      <Wire pts={P_PUB} v={b1} a={0.05} b={0.4} />
      <Wire pts={P_SUBB} v={b1} a={0.5} b={0.85} />
      <Wire pts={P_SUBA} v={b1} a={0.5} b={0.85} />
      <Wire pts={P_EMITB} v={b2} a={0.1} b={0.35} />
      <Wire pts={P_EMITA} v={b2} a={0.1} b={0.35} />
      <Wire pts={P_EMITC} v={b2} a={0} b={1} dashed />

      {/* client A — sender */}
      <Box {...CA}>
        <WidgetHead x={CA.x} y={CA.y} w={CA.w} label="#ops-floor" keyLabel={`${tx(KEY)} ws_1f3a…`} />
        <History x={CA.x} y={CA.y} />
        <g style={{ opacity: seg(b2, 0.35, 0.5) }}>
          <rect x={CA.x + 6} y={CA.y + 66} width={2} height={18} fill={SIGNAL} />
          <text x={CA.x + 14} y={CA.y + 79} fontSize={10.5} fill={INK}>
            <tspan fontWeight={600}>Ana</tspan>
            <tspan dx={6}>{tx(MSG)}</tspan>
          </text>
        </g>
        <rect x={CA.x + 8} y={CA.y + CA.h - 30} width={CA.w - 16} height={22} fill="none" stroke="var(--erp-hair)" />
        <text x={CA.x + 16} y={CA.y + CA.h - 15} fontSize={10} fill={INK} style={{ opacity: `calc(${typed} * ${inv(sent)})` }}>
          {tx(MSG)}
        </text>
        <text x={CA.x + CA.w - 14} y={CA.y + CA.h - 15} fontSize={10} fill={FAINT} textAnchor="end" className="erp-mono">
          {tx(SEND)} ↵
        </text>
      </Box>

      {/* client B — same workspace, another server */}
      <Box {...CB}>
        <WidgetHead x={CB.x} y={CB.y} w={CB.w} label="#ops-floor" keyLabel={`${tx(KEY)} ws_1f3a…`} />
        <History x={CB.x} y={CB.y} />
        <text
          x={CB.x + 10}
          y={CB.y + CB.h - 15}
          fontSize={10.5}
          fill={FAINT}
          className="erp-mono"
          style={{ opacity: `calc(${seg(b0, 0.04, 0.1)} * ${inv(seg(b0, 0.3, 0.36))})` }}
        >
          {tx(TYPING)}
        </text>
        <g style={{ opacity: seg(b2, 0.35, 0.5), transform: `translateY(${lerp(seg(b2, 0.35, 0.5), 6, 0, "px")})` }}>
          <rect x={CB.x + 6} y={CB.y + 66} width={2} height={18} fill={SIGNAL} />
          <text x={CB.x + 14} y={CB.y + 79} fontSize={10.5} fill={INK}>
            <tspan fontWeight={600}>Ana</tspan>
            <tspan dx={6}>{tx(MSG)}</tspan>
          </text>
          <text x={CB.x + 14} y={CB.y + 95} fontSize={10} fill={SIGNAL} className="erp-mono">
            new_message
          </text>
        </g>
      </Box>

      {/* instance A */}
      <Box {...SA}>
        <text x={SA.x + 10} y={SA.y + 18} fontSize={12} fill={INK} fontWeight={600}>
          API · instance A
        </text>
        <text x={SA.x + 10} y={SA.y + 32} fontSize={10} fill={FAINT} className="erp-mono">
          socket.io /chat · REST
        </text>
        {guards.map((g, i) => (
          <text
            key={g}
            x={SA.x + 10 + [0, 40, 112][i]}
            y={SA.y + 50}
            fontSize={10}
            fill={MUTE}
            className="erp-mono"
            style={{ opacity: seg(b0, 0.32 + i * 0.07, 0.38 + i * 0.07) }}
          >
            {g} ✓
          </text>
        ))}
      </Box>

      {/* instance B */}
      <Box {...SB}>
        <text x={SB.x + 10} y={SB.y + 18} fontSize={12} fill={INK} fontWeight={600}>
          API · instance B
        </text>
        <text x={SB.x + 10} y={SB.y + 32} fontSize={10} fill={FAINT} className="erp-mono">
          socket.io /chat · REST
        </text>
        <text x={SB.x + 10} y={SB.y + 50} fontSize={10} fill={SIGNAL} className="erp-mono" style={{ opacity: seg(b2, 0.05, 0.15) }}>
          emit → channel:{"{ws}"}:{"{ch}"}
        </text>
      </Box>

      {/* messages table */}
      <Box {...DB}>
        <text x={DB.x + 10} y={DB.y + 17} fontSize={10} fill={MUTE} className="erp-mono">
          messages
        </text>
        <line x1={DB.x} x2={DB.x + DB.w} y1={DB.y + 25} y2={DB.y + 25} stroke="var(--erp-hair)" />
        <g style={{ opacity: seg(b0, 0.72, 0.82) }}>
          <rect x={DB.x + 6} y={DB.y + 32} width={2} height={18} fill={SIGNAL} />
          <text x={DB.x + 14} y={DB.y + 45} fontSize={10.5} fill={INK} className="erp-mono">
            INSERT · {tx(MSG)}
          </text>
        </g>
      </Box>

      {/* redis */}
      <Box {...RD}>
        <text x={RD.x + RD.w / 2} y={RD.y + 22} fontSize={13} fill={INK} fontWeight={600} textAnchor="middle">
          Redis
        </text>
        <text x={RD.x + RD.w / 2} y={RD.y + 36} fontSize={10} fill={FAINT} textAnchor="middle" className="erp-mono">
          pub/sub
        </text>
        <text x={RD.x + RD.w / 2} y={RD.y + 52} fontSize={10.5} fill={SIGNAL} textAnchor="middle" className="erp-mono" style={{ opacity: seg(b1, 0.3, 0.42) }}>
          message.created
        </text>
      </Box>

      {/* another workspace, same server */}
      <g style={{ opacity: 0.85 }}>
        <Box {...CC} faint>
          <text x={CC.x + 10} y={CC.y + 17} fontSize={10} fill={FAINT} className="erp-mono">
            #yard
          </text>
          <text x={CC.x + CC.w - 10} y={CC.y + 17} fontSize={10} fill={FAINT} textAnchor="end" className="erp-mono">
            {tx(KEY)} ws_9c27…
          </text>
          <text x={CC.x + 10} y={CC.y + 43} fontSize={10.5} fill={MUTE} style={{ opacity: seg(b2, 0.4, 0.55) }}>
            {tx({ en: "other workspace · nothing received", fr: "autre espace · rien reçu", ar: "مساحة أخرى · لم يصل شيء" })}
          </text>
        </Box>
      </g>
      <g style={{ opacity: seg(b2, 0.3, 0.42) }}>
        <rect x={553} y={271} width={14} height={14} fill="var(--color-paper)" stroke={INK} />
        <path d="M556 274 L564 282 M564 274 L556 282" stroke={INK} strokeWidth={1.3} />
      </g>

      {/* labels (hidden on small screens) */}
      <g className="hidden md:inline">
        <text x={92} y={172} fontSize={10} fill={MUTE} className="erp-mono">
          POST /messages
        </text>
        <text x={92} y={185} fontSize={10} fill={FAINT} className="erp-mono">
          x-api-key ws_1f3a…
        </text>
        <text x={78} y={282} fontSize={10} fill={FAINT} className="erp-mono">
          1 · {tx(WRITE)}
        </text>
        <text x={222} y={218} fontSize={10} fill={FAINT} className="erp-mono">
          2 · PUBLISH
        </text>
        <text x={347} y={218} fontSize={10} fill={FAINT} className="erp-mono">
          3 · {tx(FANOUT)}
        </text>
        <text x={214} y={178} fontSize={10} fill={FAINT} className="erp-mono">
          {tx({ en: "echo", fr: "écho", ar: "صدى" })}
        </text>
        <text x={528} y={178} fontSize={10} fill={FAINT} className="erp-mono">
          4 · new_message
        </text>
        <text x={572} y={282} fontSize={10} fill={FAINT} className="erp-mono">
          {tx(NOTROOM)}
        </text>
      </g>

      {/* packets */}
      <Packet v={b0} a={0.14} b={0.3} pts={P_SEND} />
      <Packet v={b0} a={0.6} b={0.76} pts={P_DB} />
      <Packet v={b1} a={0.05} b={0.4} pts={P_PUB} />
      <Packet v={b1} a={0.5} b={0.85} pts={P_SUBB} />
      <Packet v={b1} a={0.5} b={0.85} pts={P_SUBA} />
      <Packet v={b2} a={0.1} b={0.35} pts={P_EMITB} />
      <Packet v={b2} a={0.1} b={0.35} pts={P_EMITA} />
    </svg>
  );
}

/* Mobile variant: the same mechanism as one vertical flow, fewer boxes, 11px+ text. */

// geometry (viewBox 340 × 338)
const M_CA = { x: 10, y: 8, w: 320, h: 46 }; // client A (sender)
const M_SA = { x: 10, y: 78, w: 320, h: 44 }; // instance A
const M_DB = { x: 10, y: 146, w: 140, h: 40 }; // messages table
const M_RD = { x: 170, y: 146, w: 160, h: 40 }; // redis
const M_SB = { x: 10, y: 210, w: 320, h: 36 }; // instance B
const M_CB = { x: 10, y: 270, w: 155, h: 60 }; // client B (same workspace)
const M_CC = { x: 175, y: 270, w: 155, h: 60 }; // client of another workspace

const M_SEND: Pt[] = [[60, 54], [60, 78]];
const M_WRITE: Pt[] = [[60, 122], [60, 146]];
const M_PUB: Pt[] = [[250, 122], [250, 146]];
const M_SUB: Pt[] = [[250, 186], [250, 210]];
const M_EMITB: Pt[] = [[88, 246], [88, 270]];
const M_EMITC: Pt[] = [[240, 246], [240, 270]];

function FanoutSvgMobile() {
  const tx = useTx();
  const b0 = "--b0";
  const b1 = "--b1";
  const b2 = "--b2";
  const typed = seg(b0, 0.02, 0.14);
  const sent = seg(b0, 0.2, 0.26);
  const echo = seg(b2, 0.35, 0.5);
  const guards: [string, number][] = [["JWT ✓", 20], [`${tx(WS)} ✓`, 70], ["permission ✓", 160]];
  return (
    <svg viewBox="0 0 340 338" className="block h-auto max-h-[42svh] w-full" role="img" aria-label={tx(ARIA)}>
      <Wire pts={M_SEND} v={b0} a={0.14} b={0.3} />
      <Wire pts={M_WRITE} v={b0} a={0.6} b={0.76} />
      <Wire pts={M_PUB} v={b1} a={0.05} b={0.4} />
      <Wire pts={M_SUB} v={b1} a={0.5} b={0.85} />
      <Wire pts={M_EMITB} v={b2} a={0.1} b={0.35} />
      <Wire pts={M_EMITC} v={b2} a={0} b={1} dashed />

      {/* wire labels */}
      <text x={70} y={70} fontSize={11} fill={MUTE} className="erp-mono">POST /messages · ws_1f3a…</text>
      <text x={70} y={138} fontSize={11} fill={FAINT} className="erp-mono">1 · {tx(WRITE)}</text>
      <text x={260} y={138} fontSize={11} fill={FAINT} className="erp-mono">2 · PUBLISH</text>
      <text x={240} y={202} fontSize={11} fill={FAINT} textAnchor="end" className="erp-mono">3 · {tx(FANOUT)}</text>
      <text x={98} y={262} fontSize={11} fill={FAINT} className="erp-mono">{tx({ en: "room", fr: "salle", ar: "الغرفة" })}</text>
      <text x={254} y={262} fontSize={11} fill={FAINT} className="erp-mono">{tx(NOTROOM)}</text>

      {/* client A — sender */}
      <Box {...M_CA}>
        <text x={M_CA.x + 10} y={M_CA.y + 16} fontSize={11} fill={INK} className="erp-mono">#ops-floor · Ana</text>
        <text x={M_CA.x + M_CA.w - 10} y={M_CA.y + 16} fontSize={11} fill={FAINT} textAnchor="end" className="erp-mono">{tx(KEY)} ws_1f3a…</text>
        <line x1={M_CA.x} x2={M_CA.x + M_CA.w} y1={M_CA.y + 23} y2={M_CA.y + 23} stroke="var(--erp-hair)" />
        <text x={M_CA.x + 10} y={M_CA.y + 39} fontSize={12} fill={INK} style={{ opacity: `calc(${typed} * ${inv(sent)})` }}>
          {tx(MSG)}
        </text>
        <g style={{ opacity: echo }}>
          <rect x={M_CA.x + 4} y={M_CA.y + 28} width={2} height={14} fill={SIGNAL} />
          <text x={M_CA.x + 10} y={M_CA.y + 39} fontSize={12} fill={INK}>
            <tspan fontWeight={600}>Ana</tspan>
            <tspan dx={6}>{tx(MSG)}</tspan>
          </text>
        </g>
        <text x={M_CA.x + M_CA.w - 10} y={M_CA.y + 39} fontSize={11} fill={FAINT} textAnchor="end" className="erp-mono">
          {tx(SEND)} ↵
        </text>
      </Box>

      {/* instance A */}
      <Box {...M_SA}>
        <text x={M_SA.x + 10} y={M_SA.y + 17} fontSize={12} fill={INK} fontWeight={600}>
          API · instance A
        </text>
        <text x={M_SA.x + M_SA.w - 10} y={M_SA.y + 17} fontSize={11} fill={FAINT} textAnchor="end" className="erp-mono">
          socket.io · REST
        </text>
        {guards.map(([g, x], i) => (
          <text key={g} x={M_SA.x + x - 10} y={M_SA.y + 35} fontSize={11} fill={MUTE} className="erp-mono" style={{ opacity: `max(0.25, ${seg(b0, 0.32 + i * 0.07, 0.38 + i * 0.07)})` }}>
            {g}
          </text>
        ))}
      </Box>

      {/* messages table */}
      <Box {...M_DB}>
        <text x={M_DB.x + 10} y={M_DB.y + 16} fontSize={11} fill={MUTE} className="erp-mono">messages</text>
        <g style={{ opacity: seg(b0, 0.72, 0.82) }}>
          <rect x={M_DB.x + 4} y={M_DB.y + 23} width={2} height={12} fill={SIGNAL} />
          <text x={M_DB.x + 10} y={M_DB.y + 33} fontSize={11} fill={INK} className="erp-mono">INSERT ✓</text>
        </g>
      </Box>

      {/* redis */}
      <Box {...M_RD}>
        <text x={M_RD.x + 10} y={M_RD.y + 17} fontSize={13} fill={INK} fontWeight={600}>Redis</text>
        <text x={M_RD.x + M_RD.w - 10} y={M_RD.y + 17} fontSize={11} fill={FAINT} textAnchor="end" className="erp-mono">pub/sub</text>
        <text x={M_RD.x + 10} y={M_RD.y + 33} fontSize={11} fill={SIGNAL} className="erp-mono" style={{ opacity: seg(b1, 0.3, 0.42) }}>
          message.created
        </text>
      </Box>

      {/* instance B */}
      <Box {...M_SB}>
        <text x={M_SB.x + 10} y={M_SB.y + 23} fontSize={12} fill={INK} fontWeight={600}>
          API · instance B
        </text>
        <text x={M_SB.x + M_SB.w - 10} y={M_SB.y + 23} fontSize={11} fill={SIGNAL} textAnchor="end" className="erp-mono" style={{ opacity: seg(b2, 0.05, 0.15) }}>
          emit → channel:{"{ws}"}:{"{ch}"}
        </text>
      </Box>

      {/* client B — same workspace, another server */}
      <Box {...M_CB}>
        <text x={M_CB.x + 10} y={M_CB.y + 16} fontSize={11} fill={INK} className="erp-mono">#ops-floor</text>
        <line x1={M_CB.x} x2={M_CB.x + M_CB.w} y1={M_CB.y + 23} y2={M_CB.y + 23} stroke="var(--erp-hair)" />
        <text
          x={M_CB.x + 10}
          y={M_CB.y + 40}
          fontSize={11}
          fill={FAINT}
          className="erp-mono"
          style={{ opacity: `calc(${seg(b0, 0.04, 0.1)} * ${inv(seg(b0, 0.3, 0.36))})` }}
        >
          {tx(TYPING)}
        </text>
        <g style={{ opacity: echo, transform: `translateY(${lerp(echo, 6, 0, "px")})` }}>
          <rect x={M_CB.x + 4} y={M_CB.y + 29} width={2} height={14} fill={SIGNAL} />
          <text x={M_CB.x + 10} y={M_CB.y + 40} fontSize={12} fill={INK}>
            <tspan fontWeight={600}>Ana</tspan>
            <tspan dx={6}>{tx(MSG)}</tspan>
          </text>
          <text x={M_CB.x + 10} y={M_CB.y + 54} fontSize={11} fill={SIGNAL} className="erp-mono">
            new_message
          </text>
        </g>
      </Box>

      {/* another workspace, same server */}
      <g style={{ opacity: 0.85 }}>
        <Box {...M_CC} faint>
          <text x={M_CC.x + 10} y={M_CC.y + 16} fontSize={11} fill={FAINT} className="erp-mono">#yard</text>
          <text x={M_CC.x + M_CC.w - 10} y={M_CC.y + 16} fontSize={11} fill={FAINT} textAnchor="end" className="erp-mono">ws_9c27…</text>
          <line x1={M_CC.x} x2={M_CC.x + M_CC.w} y1={M_CC.y + 23} y2={M_CC.y + 23} stroke="var(--erp-hair)" />
          <text x={M_CC.x + 10} y={M_CC.y + 40} fontSize={11} fill={MUTE} className="erp-mono" style={{ opacity: seg(b2, 0.4, 0.55) }}>
            {tx({ en: "other workspace", fr: "autre espace", ar: "مساحة أخرى" })}
          </text>
          <text x={M_CC.x + 10} y={M_CC.y + 54} fontSize={11} fill={MUTE} className="erp-mono" style={{ opacity: seg(b2, 0.4, 0.55) }}>
            {tx({ en: "nothing received", fr: "rien reçu", ar: "لم يصل شيء" })}
          </text>
        </Box>
      </g>
      <g style={{ opacity: seg(b2, 0.3, 0.42) }}>
        <rect x={233} y={251} width={14} height={14} fill="var(--color-paper)" stroke={INK} />
        <path d="M236 254 L244 262 M244 254 L236 262" stroke={INK} strokeWidth={1.3} />
      </g>

      <Packet v={b0} a={0.14} b={0.3} pts={M_SEND} />
      <Packet v={b0} a={0.6} b={0.76} pts={M_WRITE} />
      <Packet v={b1} a={0.05} b={0.4} pts={M_PUB} />
      <Packet v={b1} a={0.5} b={0.85} pts={M_SUB} />
      <Packet v={b2} a={0.1} b={0.35} pts={M_EMITB} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 2 — webhooks, retries, throttling                             */
/* ------------------------------------------------------------------ */

const SIG = "9f2c41e7b05d8a3361c4fe0a92d7b815e6043acf7d29b18c55e0f3a4dc7b2961";

function HooksStage() {
  const { beat } = useScene();
  return (
    <SceneLayout
      flip
      copy={
        <div className={SHORT_COPY}>
          <BeatDots count={3} current={beat} className="mb-5" />
          <AtStack>
            {COPY.hooks.map((c, i) => (
              <At key={i} from={i}>
                <BeatCopy kicker={c.kicker} title={c.title} body={c.body} details={c.details} />
              </At>
            ))}
          </AtStack>
        </div>
      }
      figure={
        <div className="flex w-full justify-center [contain:inline-size]">
        <Figure
          fig="FIG. 05.2"
          title={[
            { en: "Signed payload", fr: "Charge signée", ar: "حمولة موقّعة" },
            { en: "Queue and retries", fr: "File et relances", ar: "الطابور وإعادة المحاولة" },
            { en: "Throttle windows", fr: "Fenêtres de limitation", ar: "نوافذ التقييد" },
          ][beat]}
          className="w-full min-w-0 max-w-[640px]"
        >
          <AtStack className="max-h-[50svh] overflow-hidden lg:max-h-none">
            <At from={0}>
              <SignPanel />
            </At>
            <At from={1}>
              <QueuePanel />
            </At>
            <At from={2}>
              <ThrottlePanel />
            </At>
          </AtStack>
        </Figure>
        </div>
      }
    />
  );
}

function Chip({ children, lit = false }: { children: ReactNode; lit?: boolean }) {
  return (
    <span
      className={`erp-mono inline-block border px-2 py-1 text-[11px] md:text-[0.66rem] leading-none ${
        lit ? "border-signal text-signal-deep" : "border-[var(--erp-hair-2)] text-graphite"
      }`}
    >
      {children}
    </span>
  );
}

function SignPanel() {
  const tx = useTx();
  const chunks = SIG.match(/.{8}/g) ?? [];
  return (
    <div className="p-3.5 md:p-5">
      <div className="hidden flex-wrap items-center gap-1.5 text-faint sm:flex">
        <Chip lit>message.created</Chip>
        <span className="erp-mono text-[0.7rem]">→</span>
        <Chip>{"{ event, data, timestamp }"}</Chip>
        <span className="erp-mono text-[0.7rem]">→</span>
        <Chip>HMAC-SHA256 · {tx({ en: "endpoint secret", fr: "secret de l'endpoint", ar: "سرّ نقطة الاستقبال" })}</Chip>
      </div>

      <div className="border border-[var(--erp-hair-2)] bg-paper sm:mt-4">
        <div className="erp-mono border-b border-[var(--erp-hair)] px-3 py-2 text-[0.7rem] text-ink">
          <span className="text-signal-deep">POST</span> https://hooks.example/erp/chat
        </div>
        <div className="erp-mono space-y-1 px-3 py-2 text-[11px] md:text-[0.66rem] leading-relaxed text-graphite">
          <p>Content-Type: application/json</p>
          <p className="break-all">
            <span className="text-ink">x-webhook-signature: </span>
            {chunks.map((c, i) => (
              <span key={i} className="text-signal-deep" style={{ opacity: seg("--b0", 0.12 + i * 0.05, 0.17 + i * 0.05) }}>
                {c}
              </span>
            ))}
          </p>
        </div>
        <pre className="erp-mono hidden whitespace-pre-wrap border-t border-[var(--erp-hair)] px-3 py-2 text-[11px] md:text-[0.64rem] leading-relaxed text-mute sm:block">
{`{
  "event": "message.created",
  "data": {
    "content": "${tx(MSG)}",
    "parentMessageId": null,
    "user": { "name": "Ana" }, …
  },
  "timestamp": "2026-11-11T08:42:10.512Z"
}`}
        </pre>
      </div>

      <div className="mt-4 grid gap-1.5 text-[0.72rem]" style={{ opacity: seg("--b0", 0.6, 0.72) }}>
        <p className="erp-kicker !text-[0.64rem]">{tx({ en: "Receiving system", fr: "Système destinataire", ar: "النظام المستلم" })}</p>
        <p className="erp-mono flex flex-wrap items-center gap-x-2 text-graphite">
          <span>HMAC(secret, {tx({ en: "raw body", fr: "corps brut", ar: "الجسم الخام" })})</span>
          <span className="text-faint">=</span>
          <span className="text-signal-deep">9f2c41e7…</span>
          <span className="text-ink">✓ {tx({ en: "match", fr: "identique", ar: "مطابق" })}</span>
        </p>
        <p className="erp-mono flex flex-wrap items-center gap-x-2 text-faint" style={{ opacity: seg("--b0", 0.75, 0.85) }}>
          <span>{tx({ en: "one byte changed", fr: "un octet modifié", ar: "تغيّر بايت واحد" })}</span>
          <span>=</span>
          <span className="line-through">4b07e9d1…</span>
          <span>✕ {tx({ en: "reject", fr: "rejet", ar: "رفض" })}</span>
        </p>
      </div>
    </div>
  );
}

function QueuePanel() {
  const tx = useTx();
  const jobs = [
    { id: "#41", ev: "message.created", lit: true },
    { id: "#40", ev: "channel.member_added", lit: false },
    { id: "#39", ev: "message.updated", lit: false },
  ];
  const attempts = [
    { n: 1, at: "t+0 s", code: "503", ok: false, wait: "+5 s" },
    { n: 2, at: "t+5 s", code: "503", ok: false, wait: "+10 s" },
    { n: 3, at: "t+15 s", code: "200", ok: true, wait: "" },
  ];
  return (
    <div className="p-3.5 md:p-5">
      {/* queue lane */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,0.8fr)] items-center gap-3">
        <div className="border border-[var(--erp-hair-2)]">
          <p className="erp-mono border-b border-[var(--erp-hair)] px-2.5 py-1.5 text-[11px] md:text-[0.66rem] uppercase tracking-[0.12em] text-faint">
            {tx({ en: "queue · webhooks", fr: "file · webhooks", ar: "الطابور · webhooks" })}
          </p>
          <div className="space-y-1 p-2">
            {jobs.map((j, i) => (
              <div key={j.id} className={`relative ${i === 2 ? "hidden sm:block" : ""}`}>
                <div
                  className={`erp-mono flex items-center justify-between gap-2 border px-2 py-1 text-[11px] md:text-[0.64rem] ${
                    j.lit ? "border-signal text-ink" : "border-[var(--erp-hair)] text-faint"
                  }`}
                  style={i === 0 ? { opacity: inv(seg("--b1", 0.12, 0.2)) } : undefined}
                >
                  <span>{j.id}</span>
                  <span className="truncate">{j.ev}</span>
                </div>
                {i === 0 && (
                  <div
                    className="erp-mono absolute inset-0 flex items-center border border-dashed border-[var(--erp-hair-2)] px-2 text-[11px] md:text-[0.64rem] text-faint"
                    style={{ opacity: seg("--b1", 0.12, 0.2) }}
                  >
                    {j.id} → worker
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <span className="erp-mono text-[0.8rem] text-faint">→</span>
        <div className="border border-[var(--erp-hair-2)] p-2.5">
          <p className="erp-mono text-[11px] md:text-[0.66rem] uppercase tracking-[0.12em] text-faint">worker</p>
          <p className="erp-mono mt-1 text-[11px] md:text-[0.66rem] text-graphite">concurrency 5</p>
          <p className="erp-mono mt-1.5 border border-signal px-1.5 py-0.5 text-[11px] md:text-[0.66rem] text-ink" style={{ opacity: seg("--b1", 0.14, 0.22) }}>
            #41 message.created
          </p>
        </div>
      </div>

      {/* attempts */}
      <div className="mt-4 border-t border-[var(--erp-hair)] pt-3 sm:mt-5 sm:pt-4">
        <p className="erp-kicker !text-[0.64rem]">{tx({ en: "Delivery log · demo run", fr: "Journal de livraison · démonstration", ar: "سجلّ التسليم · تشغيل تجريبي" })}</p>
        <ol className="mt-3 space-y-2">
          {attempts.map((a, i) => (
            <li key={a.n} style={{ opacity: seg("--b1", 0.22 + i * 0.2, 0.3 + i * 0.2) }}>
              <div
                className={`erp-mono grid grid-cols-[4.6rem_3.6rem_1fr] items-center gap-2 border px-2.5 py-1.5 text-[11px] md:text-[0.66rem] ${
                  a.ok ? "border-signal bg-[var(--erp-signal-soft)] text-ink" : "border-[var(--erp-hair-2)] text-graphite"
                }`}
              >
                <span>{tx({ en: "attempt", fr: "essai", ar: "محاولة" })} {a.n}</span>
                <span className="text-faint">{a.at}</span>
                <span className="truncate">
                  {a.ok ? `✓ ${a.code} — ${tx({ en: "delivered, job removed", fr: "livré, tâche retirée", ar: "سُلِّم، وحُذفت المهمّة" })}` : (
                    <>
                      <span className="sm:hidden">✕ HTTP {a.code}</span>
                      <span className="hidden sm:inline">✕ {tx({ en: "Webhook responded with status", fr: "Le webhook a répondu avec le statut", ar: "ردّ الـ webhook بالحالة" })} {a.code}</span>
                    </>
                  )}
                </span>
              </div>
              {a.wait && (
                <p className="erp-mono ms-[4.6rem] mt-1 text-[11px] md:text-[0.64rem] text-faint">
                  ↓ {tx({ en: "backoff", fr: "attente", ar: "انتظار" })} {a.wait}
                </p>
              )}
            </li>
          ))}
        </ol>
        <p className="erp-mono mt-4 hidden text-[11px] md:text-[0.64rem] text-faint sm:block">attempts: 3 · backoff: exponential, 5 000 ms · removeOnComplete</p>
      </div>
    </div>
  );
}

function ThrottlePanel() {
  const tx = useTx();
  const cells = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="p-3.5 md:p-5">
      <p className="erp-kicker !text-[0.64rem]">
        {tx({
          en: "Burst · 24 requests from one caller within 1 s",
          fr: "Rafale · 24 requêtes d'un même appelant en 1 s",
          ar: "دفعة · 24 طلبًا من مُستدعٍ واحد خلال ثانية",
        })}
      </p>
      <div className="mt-3 grid grid-cols-8 gap-1 sm:grid-cols-12">
        {cells.map((i) => {
          const refused = i >= 20;
          return (
            <div key={i} className="relative h-7 border border-dashed border-[var(--erp-hair-2)]">
              <div
                className={`erp-mono absolute -inset-px flex items-center justify-center border text-[11px] md:text-[0.66rem] ${
                  refused ? "border-dashed border-ink bg-paper text-ink" : "border-[var(--erp-hair-2)] bg-ink/85 text-paper"
                }`}
                style={{ opacity: seg("--b2", 0.04 + i * 0.022, 0.07 + i * 0.022) }}
              >
                {refused ? "429" : String(i + 1).padStart(2, "0")}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        <Meter name="short" spec="ttl 1 000 ms · limit 20" used={20} limit={20} t={seg("--b2", 0.04, 0.48)} />
        <Meter name="long" spec="ttl 60 000 ms · limit 100" used={20} limit={100} t={seg("--b2", 0.04, 0.48)} />
      </div>

      <div className="erp-mono mt-5 hidden items-center gap-1.5 text-[11px] md:text-[0.66rem] sm:flex" style={{ opacity: seg("--b2", 0.5, 0.6) }}>
        <span className="border border-ink px-2 py-1 text-ink">{tx({ en: "request", fr: "requête", ar: "الطلب" })} #21</span>
        <span className="text-faint">→</span>
        <span className="border border-signal px-2 py-1 text-signal-deep">{tx({ en: "throttle guard · global", fr: "garde de débit · globale", ar: "حارس المعدّل · عامّ" })}</span>
        <span className="text-ink">✕ 429</span>
        <span className="text-faint">···</span>
        <span className="border border-dashed border-[var(--erp-hair-2)] px-2 py-1 text-faint line-through">{tx({ en: "controller", fr: "contrôleur", ar: "المتحكّم" })}</span>
      </div>

      <p className="erp-mono mt-4 border-s-2 border-signal ps-3 text-[11px] md:text-[0.66rem] text-ink" style={{ opacity: seg("--b2", 0.52, 0.62) }}>
        HTTP 429 Too Many Requests × 4 —{" "}
        <span className="text-mute">
          {tx({ en: "refused before any controller runs", fr: "refusées avant tout contrôleur", ar: "رُفضت قبل تشغيل أيّ متحكّم" })}
        </span>
      </p>
    </div>
  );
}

function Meter({ name, spec, used, limit, t }: { name: string; spec: string; used: number; limit: number; t: string }) {
  const tx = useTx();
  const frac = used / limit;
  return (
    <div>
      <div className="erp-mono flex items-baseline justify-between gap-3 text-[11px] md:text-[0.64rem]">
        <span className="text-ink">{name}</span>
        <span className="truncate text-faint">{spec}</span>
      </div>
      <div className="relative mt-1 h-2.5 border border-[var(--erp-hair-2)]">
        <span
          className={`absolute inset-y-0 start-0 w-full origin-left ${frac >= 1 ? "bg-signal" : "bg-ink"}`}
          style={{ transform: `scaleX(calc(${t} * ${frac}))` }}
        />
      </div>
      <p className="erp-mono mt-1 text-[11px] md:text-[0.64rem] text-faint">
        <span>
          {used} / {limit}
        </span>{" "}
        · {tx({ en: "accepted", fr: "acceptées", ar: "مقبولة" })}
        {frac >= 1 ? ` · ${tx({ en: "full", fr: "pleine", ar: "ممتلئة" })}` : ""}
      </p>
    </div>
  );
}
