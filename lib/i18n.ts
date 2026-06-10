import type { Locale, LocalizedText, Project } from "./types";

export const LOCALES: Locale[] = ["en", "fr", "ar"];
export const DEFAULT_LOCALE: Locale = "en";
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
  "nav.index": "Index",
  "nav.profile": "Profile",
  "nav.craft": "Craft",
  "nav.contact": "Contact",
  "nav.studio": "Studio",

  "preloader.line": "Calibrating the aperture",
  "preloader.enter": "Enter",

  "intro.scroll": "Scroll to open the aperture",

  "hero.role": "Autoentrepreneur — AI Researcher",
  "hero.based": "Based in Algeria",

  "common.exposure": "Exposure",
  "common.available": "Available for work",
  "common.unavailable": "Currently booked",
  "common.viewProject": "View project",
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

  "about.kicker": "Profile",
  "about.title": "A builder who treats software like cinema.",
  "about.since": "Operating since",
  "about.openTo": "Open to",
  "about.openToValue": "Freelance · AI research · Product work",
  "about.portrait": "Portrait",
  "about.addPortrait": "Add your portrait in Studio",

  "services.kicker": "Practice",
  "services.title": "What I bring to the table",
  "services.lead": "Four ways I turn an idea into something people actually use.",

  "work.kicker": "Selected work",
  "work.title": "Frames from the studio",
  "work.lead":
    "A deduplicated cut of what I've shipped — AI systems, real-time platforms, and interfaces built to feel like motion pictures.",
  "work.frame": "Frame",
  "work.all": "All",
  "work.featured": "Featured",

  "spotlight.kicker": "Case study",
  "spotlight.title": "A closer look",
  "spotlight.lead": "Flagship work, end to end — the problem, the thinking, the result.",
  "spotlight.challenge": "The challenge",
  "spotlight.approach": "The approach",
  "spotlight.result": "The result",
  "spotlight.open": "Open project",

  "stats.kicker": "Light meter",

  "process.kicker": "Method",
  "process.title": "How I work",
  "process.lead": "A calm, weekly rhythm from the first sketch to a live product.",

  "craft.kicker": "Capability",
  "craft.title": "What I bring into focus",
  "craft.lead":
    "Research-grade thinking, production-grade shipping. The full pipeline, end to end.",

  "contact.kicker": "Contact",
  "contact.title": "Let's make something worth watching.",
  "contact.lead":
    "Open to freelance builds, AI research collaborations, and ambitious product work.",
  "contact.cta": "Start a conversation",
  "contact.email": "Email",
  "contact.elsewhere": "Elsewhere",

  "footer.rights": "All rights reserved.",
  "footer.builtBy": "Designed & built by Belkhiri Abdelaziz",
  "footer.madeWith": "Shot on Next.js · Lenis · Framer Motion",
};

const fr: Dict = {
  "nav.index": "Index",
  "nav.profile": "Profil",
  "nav.craft": "Savoir-faire",
  "nav.contact": "Contact",
  "nav.studio": "Studio",

  "preloader.line": "Calibrage du diaphragme",
  "preloader.enter": "Entrer",

  "intro.scroll": "Défilez pour ouvrir le diaphragme",

  "hero.role": "Autoentrepreneur — Chercheur en IA",
  "hero.based": "Basé en Algérie",

  "common.exposure": "Exposition",
  "common.available": "Disponible pour missions",
  "common.unavailable": "Actuellement réservé",
  "common.viewProject": "Voir le projet",
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

  "about.kicker": "Profil",
  "about.title": "Un créateur qui traite le logiciel comme du cinéma.",
  "about.since": "En activité depuis",
  "about.openTo": "Ouvert à",
  "about.openToValue": "Freelance · Recherche IA · Produit",
  "about.portrait": "Portrait",
  "about.addPortrait": "Ajoutez votre portrait dans le Studio",

  "services.kicker": "Pratique",
  "services.title": "Ce que j'apporte",
  "services.lead": "Quatre façons de transformer une idée en produit réellement utilisé.",

  "work.kicker": "Projets choisis",
  "work.title": "Plans tirés du studio",
  "work.lead":
    "Une sélection dédupliquée de mes réalisations — systèmes d'IA, plateformes temps réel et interfaces pensées comme des films.",
  "work.frame": "Plan",
  "work.all": "Tout",
  "work.featured": "À la une",

  "spotlight.kicker": "Étude de cas",
  "spotlight.title": "Regard rapproché",
  "spotlight.lead": "Mes projets phares, de bout en bout — le problème, la réflexion, le résultat.",
  "spotlight.challenge": "Le défi",
  "spotlight.approach": "L'approche",
  "spotlight.result": "Le résultat",
  "spotlight.open": "Ouvrir le projet",

  "stats.kicker": "Cellule de mesure",

  "process.kicker": "Méthode",
  "process.title": "Comment je travaille",
  "process.lead": "Un rythme hebdomadaire serein, du premier croquis au produit en ligne.",

  "craft.kicker": "Capacité",
  "craft.title": "Ce que je mets au point",
  "craft.lead":
    "Une réflexion de chercheur, une exécution de production. Toute la chaîne, de bout en bout.",

  "contact.kicker": "Contact",
  "contact.title": "Créons quelque chose qui mérite d'être regardé.",
  "contact.lead":
    "Ouvert au freelance, aux collaborations de recherche en IA et aux projets ambitieux.",
  "contact.cta": "Démarrer la conversation",
  "contact.email": "Email",
  "contact.elsewhere": "Ailleurs",

  "footer.rights": "Tous droits réservés.",
  "footer.builtBy": "Conçu & développé par Belkhiri Abdelaziz",
  "footer.madeWith": "Tourné sur Next.js · Lenis · Framer Motion",
};

const ar: Dict = {
  "nav.index": "الفهرس",
  "nav.profile": "نبذة",
  "nav.craft": "المهارات",
  "nav.contact": "تواصل",
  "nav.studio": "الاستوديو",

  "preloader.line": "معايرة العدسة",
  "preloader.enter": "دخول",

  "intro.scroll": "مرّر لفتح العدسة",

  "hero.role": "مقاول ذاتي — باحث في الذكاء الاصطناعي",
  "hero.based": "مقيم في الجزائر",

  "common.exposure": "لقطة",
  "common.available": "متاح للعمل",
  "common.unavailable": "محجوز حاليًا",
  "common.viewProject": "عرض المشروع",
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

  "about.kicker": "نبذة",
  "about.title": "صانع يتعامل مع البرمجيات كأنها سينما.",
  "about.since": "نشِط منذ",
  "about.openTo": "متاح لـ",
  "about.openToValue": "عمل حر · بحث في الذكاء الاصطناعي · بناء منتجات",
  "about.portrait": "صورة",
  "about.addPortrait": "أضف صورتك من الاستوديو",

  "services.kicker": "الممارسة",
  "services.title": "ما الذي أقدّمه",
  "services.lead": "أربع طرق أحوّل بها الفكرة إلى منتج يُستخدم فعلًا.",

  "work.kicker": "أعمال مختارة",
  "work.title": "لقطات من الاستوديو",
  "work.lead":
    "مجموعة منقّاة مما أنجزت — أنظمة ذكاء اصطناعي، ومنصّات آنية، وواجهات صُمّمت لتبدو كالأفلام.",
  "work.frame": "لقطة",
  "work.all": "الكل",
  "work.featured": "مميّز",

  "spotlight.kicker": "دراسة حالة",
  "spotlight.title": "نظرة أقرب",
  "spotlight.lead": "أبرز أعمالي، من البداية للنهاية — المشكلة، والتفكير، والنتيجة.",
  "spotlight.challenge": "التحدّي",
  "spotlight.approach": "المقاربة",
  "spotlight.result": "النتيجة",
  "spotlight.open": "فتح المشروع",

  "stats.kicker": "مقياس الضوء",

  "process.kicker": "المنهجية",
  "process.title": "كيف أعمل",
  "process.lead": "إيقاعٌ أسبوعيّ هادئ من أوّل رسمٍ إلى منتجٍ حيّ.",

  "craft.kicker": "القدرات",
  "craft.title": "ما أُركّز عليه",
  "craft.lead": "تفكيرٌ بحثيّ وتنفيذٌ احترافيّ. السلسلة كاملة من البداية إلى النهاية.",

  "contact.kicker": "تواصل",
  "contact.title": "لنصنع شيئًا يستحقّ المشاهدة.",
  "contact.lead": "متاح للأعمال الحرّة، والتعاون البحثي في الذكاء الاصطناعي، والمشاريع الطموحة.",
  "contact.cta": "ابدأ المحادثة",
  "contact.email": "البريد",
  "contact.elsewhere": "روابط أخرى",

  "footer.rights": "جميع الحقوق محفوظة.",
  "footer.builtBy": "تصميم وتطوير بلخيري عبد العزيز",
  "footer.madeWith": "صُوِّر على Next.js · Lenis · Framer Motion",
};

const DICTS: Record<Locale, Dict> = { en, fr, ar };

export function t(locale: Locale, key: string): string {
  return DICTS[locale]?.[key] ?? DICTS.en[key] ?? key;
}
