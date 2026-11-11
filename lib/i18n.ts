import type { Locale, LocalizedText, Project } from "./types";

export const LOCALES: Locale[] = ["fr", "ar"];
export const DEFAULT_LOCALE: Locale = "fr";
export const RTL_LOCALES: Locale[] = ["ar"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
  ar: "ع",
};

export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

export function pick(text: LocalizedText | undefined, locale: Locale): string {
  if (!text) return "";
  return text[locale] || text.en || "";
}

export function projectTagline(p: Project, locale: Locale): string {
  if (locale === "en") return p.tagline;
  return p.i18n?.[locale]?.tagline || p.tagline;
}
export function projectDescription(p: Project, locale: Locale): string {
  if (locale === "en") return p.description;
  return p.i18n?.[locale]?.description || p.description;
}

type Dict = Record<string, string>;

const en: Dict = {
  "nav.work": "Projects",
  "nav.profile": "About",
  "nav.craft": "Skills",
  "nav.contact": "Contact",

  "boot.line": "IURY is waking up",

  "iury.role": "Assistant to Belkhiri Abdelaziz",
  "iury.online": "Online",
  "iury.hover": "Oh, hello! Click me if you're curious.",
  "iury.poke.1": "Beep! That tickles.",
  "iury.poke.2": "Fun fact: he speaks Arabic, French, English and Darija. I speak binary.",
  "iury.poke.3": "Every project here is synced from his GitHub — I check every hour.",
  "iury.poke.4": "I'm built from tracks, two big eyes and a lot of TypeScript.",
  "iury.localTime": "Local time",
  "nav.case": "Deep dives",
  "intro.cta.work": "See the projects",
  "intro.cta.contact": "Get in touch",
  "skills.services": "Services",
  "skills.toolbox": "Toolbox",
  "skills.process": "Process",
  "deep.more": "Read the story",
  "deep.less": "Close",

  "hero.hello": "Hi, I'm IURY.",
  "hero.intro":
    "I'm the robot assistant of Belkhiri Abdelaziz — autoentrepreneur and AI researcher. I keep track of everything he builds. Where should we start?",
  "hero.q.work": "Show me his projects",
  "hero.q.about": "Who is he?",
  "hero.q.skills": "What can he do?",
  "hero.q.contact": "I'd like to hire him",
  "hero.role": "Autoentrepreneur — AI Researcher",
  "hero.scroll": "Scroll — I'll lead the way",

  "common.available": "Available for work",
  "common.unavailable": "Currently booked",
  "common.source": "Source",
  "common.live": "Live",
  "common.demo": "Demo",
  "common.close": "Close",
  "common.year": "Year",
  "common.role": "Role",
  "common.stack": "Stack",
  "common.status": "Status",
  "common.category": "Category",
  "common.backToTop": "Back to top",
  "common.next": "Next",
  "common.prev": "Previous",
  "common.menu": "Menu",
  "common.whatsapp": "WhatsApp",
  "common.schedule": "Schedule a call",
  "common.comingSoon": "Coming soon",
  "common.updated": "Last push",
  "common.stars": "Stars",

  "about.kicker": "About",
  "about.note": "Let me introduce him properly.",
  "about.title": "A builder who ships software that sees, decides, and delivers.",
  "about.since": "Operating since",
  "about.openTo": "Open to",
  "about.openToValue": "Freelance · AI research · Product work",
  "about.addPortrait": "Add your portrait in Studio",
  "about.based": "Based in",
  "about.focus": "Focus",
  "about.languages": "Languages",

  "services.kicker": "Services",
  "services.note": "Here's how he can help you.",
  "services.title": "What he brings to the table",
  "services.lead": "Four ways he turns an idea into something people actually use.",

  "work.kicker": "Projects",
  "work.note": "I pulled these straight from his GitHub — {count} projects, last push {when}.",
  "work.noteStatic": "Here's what he has built so far.",
  "work.title": "Live from GitHub",
  "work.lead":
    "Repositories sync automatically — new work shows up here as soon as it's pushed. Curated projects carry screenshots and case studies.",
  "work.all": "All",
  "work.featured": "Featured",
  "work.empty": "Nothing matches this filter yet.",

  "spotlight.kicker": "Case studies",
  "spotlight.note": "These are the ones he's proudest of. Let's zoom in.",
  "spotlight.title": "A closer look",
  "spotlight.lead": "Flagship work, end to end — the problem, the thinking, the result.",
  "spotlight.challenge": "The challenge",
  "spotlight.approach": "The approach",
  "spotlight.result": "The result",

  "stats.kicker": "By the numbers",
  "stats.note": "Some numbers, for those who like data as much as I do.",

  "process.kicker": "Method",
  "process.note": "His method — I've watched it run many times.",
  "process.title": "How he works",
  "process.lead": "A calm, weekly rhythm from the first sketch to a live product.",

  "craft.kicker": "Skills",
  "craft.note": "His toolbox. I keep it well oiled.",
  "craft.title": "The full pipeline, end to end",
  "craft.lead": "Research-grade thinking, production-grade shipping.",

  "contact.kicker": "Contact",
  "contact.note": "Want me to pass him a message? He usually answers fast.",
  "contact.title": "Let's build something that works.",
  "contact.lead":
    "Open to freelance builds, AI research collaborations, and ambitious product work.",

  "footer.rights": "All rights reserved.",
  "footer.madeWith": "Built with Next.js · synced with GitHub",
  "footer.presented": "Presented by IURY, on behalf of",
};

const fr: Dict = {
  "nav.work": "Projets",
  "nav.profile": "Profil",
  "nav.craft": "Compétences",
  "nav.contact": "Contact",

  "boot.line": "IURY se réveille",

  "iury.role": "Assistant de Belkhiri Abdelaziz",
  "iury.online": "En ligne",
  "iury.hover": "Oh, bonjour ! Cliquez-moi si vous êtes curieux.",
  "iury.poke.1": "Bip ! Ça chatouille.",
  "iury.poke.2": "Le saviez-vous : il parle arabe, français, anglais et derja. Moi, je parle binaire.",
  "iury.poke.3": "Chaque projet ici vient de son GitHub — je vérifie toutes les heures.",
  "iury.poke.4": "Je suis fait de chenilles, de deux grands yeux et de beaucoup de TypeScript.",
  "iury.localTime": "Heure locale",
  "nav.case": "Études de cas",
  "intro.cta.work": "Voir les projets",
  "intro.cta.contact": "Le contacter",
  "skills.services": "Services",
  "skills.toolbox": "Boîte à outils",
  "skills.process": "Méthode",
  "deep.more": "Lire l'histoire",
  "deep.less": "Fermer",

  "hero.hello": "Salut, je suis IURY.",
  "hero.intro":
    "Je suis l'assistant robot de Belkhiri Abdelaziz — autoentrepreneur et chercheur en IA. Je garde la trace de tout ce qu'il construit. Par où commençons-nous ?",
  "hero.q.work": "Montre-moi ses projets",
  "hero.q.about": "Qui est-il ?",
  "hero.q.skills": "Que sait-il faire ?",
  "hero.q.contact": "Je veux l'engager",
  "hero.role": "Autoentrepreneur — Chercheur en IA",
  "hero.scroll": "Défilez — je vous guide",

  "common.available": "Disponible pour missions",
  "common.unavailable": "Actuellement réservé",
  "common.source": "Code",
  "common.live": "En ligne",
  "common.demo": "Démo",
  "common.close": "Fermer",
  "common.year": "Année",
  "common.role": "Rôle",
  "common.stack": "Stack",
  "common.status": "Statut",
  "common.category": "Catégorie",
  "common.backToTop": "Haut de page",
  "common.next": "Suivant",
  "common.prev": "Précédent",
  "common.menu": "Menu",
  "common.whatsapp": "WhatsApp",
  "common.schedule": "Planifier un appel",
  "common.comingSoon": "Bientôt disponible",
  "common.updated": "Dernier push",
  "common.stars": "Étoiles",

  "about.kicker": "Profil",
  "about.note": "Laissez-moi vous le présenter.",
  "about.title": "Un créateur qui livre des logiciels qui voient, décident et délivrent.",
  "about.since": "En activité depuis",
  "about.openTo": "Ouvert à",
  "about.openToValue": "Freelance · Recherche IA · Produit",
  "about.addPortrait": "Ajoutez votre portrait dans le Studio",
  "about.based": "Basé en",
  "about.focus": "Focus",
  "about.languages": "Langues",

  "services.kicker": "Services",
  "services.note": "Voici comment il peut vous aider.",
  "services.title": "Ce qu'il apporte",
  "services.lead": "Quatre façons de transformer une idée en produit réellement utilisé.",

  "work.kicker": "Projets",
  "work.note": "Je les ai tirés directement de son GitHub — {count} projets, dernier push {when}.",
  "work.noteStatic": "Voici ce qu'il a construit jusqu'ici.",
  "work.title": "En direct de GitHub",
  "work.lead":
    "Les dépôts se synchronisent automatiquement — chaque nouveau projet apparaît ici dès qu'il est poussé. Les projets choisis ont captures et études de cas.",
  "work.all": "Tout",
  "work.featured": "À la une",
  "work.empty": "Rien ne correspond à ce filtre pour l'instant.",

  "spotlight.kicker": "Études de cas",
  "spotlight.note": "Ce sont ceux dont il est le plus fier. Zoomons.",
  "spotlight.title": "Regard rapproché",
  "spotlight.lead": "Ses projets phares, de bout en bout — le problème, la réflexion, le résultat.",
  "spotlight.challenge": "Le défi",
  "spotlight.approach": "L'approche",
  "spotlight.result": "Le résultat",

  "stats.kicker": "En chiffres",
  "stats.note": "Quelques chiffres, pour ceux qui aiment les données autant que moi.",

  "process.kicker": "Méthode",
  "process.note": "Sa méthode — je l'ai vue tourner bien des fois.",
  "process.title": "Comment il travaille",
  "process.lead": "Un rythme hebdomadaire serein, du premier croquis au produit en ligne.",

  "craft.kicker": "Compétences",
  "craft.note": "Sa boîte à outils. Je la garde bien huilée.",
  "craft.title": "Toute la chaîne, de bout en bout",
  "craft.lead": "Une réflexion de chercheur, une exécution de production.",

  "contact.kicker": "Contact",
  "contact.note": "Je lui transmets un message ? Il répond vite, en général.",
  "contact.title": "Construisons quelque chose qui fonctionne.",
  "contact.lead":
    "Ouvert au freelance, aux collaborations de recherche en IA et aux projets ambitieux.",

  "footer.rights": "Tous droits réservés.",
  "footer.madeWith": "Construit avec Next.js · synchronisé avec GitHub",
  "footer.presented": "Présenté par IURY, au nom de",
};

const ar: Dict = {
  "nav.work": "المشاريع",
  "nav.profile": "نبذة",
  "nav.craft": "المهارات",
  "nav.contact": "تواصل",

  "boot.line": "IURY يستيقظ",

  "iury.role": "مساعد بلخيري عبد العزيز",
  "iury.online": "متصل",
  "iury.hover": "أهلًا! انقر عليّ إن كنت فضوليًا.",
  "iury.poke.1": "بيب! هذا يدغدغ.",
  "iury.poke.2": "معلومة: يتحدث العربية والفرنسية والإنجليزية والدارجة. أما أنا فأتحدث الثنائي.",
  "iury.poke.3": "كل مشروع هنا متزامن مع GitHub الخاص به — أتحقق كل ساعة.",
  "iury.poke.4": "أنا مصنوع من جنازير، وعينين كبيرتين، والكثير من TypeScript.",
  "iury.localTime": "التوقيت المحلي",
  "nav.case": "دراسات حالة",
  "intro.cta.work": "شاهد المشاريع",
  "intro.cta.contact": "تواصل معه",
  "skills.services": "الخدمات",
  "skills.toolbox": "صندوق الأدوات",
  "skills.process": "المنهجية",
  "deep.more": "اقرأ القصة",
  "deep.less": "إغلاق",

  "hero.hello": "مرحبًا، أنا IURY.",
  "hero.intro":
    "أنا المساعد الآلي لبلخيري عبد العزيز — مقاول ذاتي وباحث في الذكاء الاصطناعي. أتابع كل ما يبنيه. من أين نبدأ؟",
  "hero.q.work": "أرني مشاريعه",
  "hero.q.about": "من هو؟",
  "hero.q.skills": "ماذا يستطيع أن يفعل؟",
  "hero.q.contact": "أريد التعاقد معه",
  "hero.role": "مقاول ذاتي — باحث في الذكاء الاصطناعي",
  "hero.scroll": "مرّر — سأرشدك",

  "common.available": "متاح للعمل",
  "common.unavailable": "محجوز حاليًا",
  "common.source": "الشيفرة",
  "common.live": "مباشر",
  "common.demo": "تجربة",
  "common.close": "إغلاق",
  "common.year": "السنة",
  "common.role": "الدور",
  "common.stack": "التقنيات",
  "common.status": "الحالة",
  "common.category": "الفئة",
  "common.backToTop": "إلى الأعلى",
  "common.next": "التالي",
  "common.prev": "السابق",
  "common.menu": "القائمة",
  "common.whatsapp": "واتساب",
  "common.schedule": "حجز مكالمة",
  "common.comingSoon": "قريبًا",
  "common.updated": "آخر تحديث",
  "common.stars": "النجوم",

  "about.kicker": "نبذة",
  "about.note": "دعني أعرّفك به كما يجب.",
  "about.title": "صانع يُطلق برمجيات ترى وتقرّر وتُنجز.",
  "about.since": "نشِط منذ",
  "about.openTo": "متاح لـ",
  "about.openToValue": "عمل حر · بحث في الذكاء الاصطناعي · بناء منتجات",
  "about.addPortrait": "أضف صورتك من الاستوديو",
  "about.based": "مقيم في",
  "about.focus": "التركيز",
  "about.languages": "اللغات",

  "services.kicker": "الخدمات",
  "services.note": "إليك كيف يمكنه مساعدتك.",
  "services.title": "ما الذي يقدّمه",
  "services.lead": "أربع طرق يحوّل بها الفكرة إلى منتج يُستخدم فعلًا.",

  "work.kicker": "المشاريع",
  "work.note": "جلبتها مباشرة من GitHub الخاص به — {count} مشروعًا، آخر تحديث {when}.",
  "work.noteStatic": "إليك ما بناه حتى الآن.",
  "work.title": "مباشرة من GitHub",
  "work.lead":
    "تتزامن المستودعات تلقائيًا — يظهر كل عمل جديد هنا فور رفعه. المشاريع المختارة تتضمّن صورًا ودراسات حالة.",
  "work.all": "الكل",
  "work.featured": "مميّز",
  "work.empty": "لا شيء يطابق هذا التصنيف بعد.",

  "spotlight.kicker": "دراسات حالة",
  "spotlight.note": "هذه أكثر ما يفخر به. لنقترب أكثر.",
  "spotlight.title": "نظرة أقرب",
  "spotlight.lead": "أبرز أعماله، من البداية للنهاية — المشكلة، والتفكير، والنتيجة.",
  "spotlight.challenge": "التحدّي",
  "spotlight.approach": "المقاربة",
  "spotlight.result": "النتيجة",

  "stats.kicker": "بالأرقام",
  "stats.note": "بعض الأرقام، لمن يحبّ البيانات مثلي.",

  "process.kicker": "المنهجية",
  "process.note": "منهجيته — رأيتها تعمل مرّات عديدة.",
  "process.title": "كيف يعمل",
  "process.lead": "إيقاعٌ أسبوعيّ هادئ من أوّل رسمٍ إلى منتجٍ حيّ.",

  "craft.kicker": "المهارات",
  "craft.note": "صندوق أدواته. أحافظ عليه جاهزًا دائمًا.",
  "craft.title": "السلسلة كاملة، من البداية إلى النهاية",
  "craft.lead": "تفكيرٌ بحثيّ وتنفيذٌ احترافيّ.",

  "contact.kicker": "تواصل",
  "contact.note": "هل أوصل له رسالة؟ عادةً ما يردّ بسرعة.",
  "contact.title": "لنبنِ شيئًا يعمل فعلًا.",
  "contact.lead": "متاح للأعمال الحرّة، والتعاون البحثي في الذكاء الاصطناعي، والمشاريع الطموحة.",

  "footer.rights": "جميع الحقوق محفوظة.",
  "footer.madeWith": "بُني بـ Next.js · متزامن مع GitHub",
  "footer.presented": "يقدّمه IURY نيابةً عن",
};

const DICTS: Record<Locale, Dict> = { en, fr, ar };

/** Look up a UI string; `{name}` placeholders are filled from `vars`. */
export function t(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const str = DICTS[locale]?.[key] ?? DICTS.en[key] ?? key;
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** "3 days ago", localized. */
export function timeAgo(iso: string, locale: Locale): string {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, sec] of steps) {
    if (Math.abs(diff) >= sec) return rtf.format(Math.round(diff / sec), unit);
  }
  return rtf.format(0, "minute");
}
