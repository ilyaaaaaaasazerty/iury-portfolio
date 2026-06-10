export type Locale = "en" | "fr" | "ar";

export interface LocalizedText {
  en: string;
  fr?: string;
  ar?: string;
}

export interface ProjectLinks {
  github?: string;
  live?: string;
  demo?: string;
}

export interface ProjectI18n {
  tagline?: string;
  description?: string;
}

export interface CaseStudyMetric {
  value: string;
  label: string;
}

export interface CaseStudy {
  challenge: string;
  approach: string;
  result: string;
  metrics?: CaseStudyMetric[];
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  /** Optional secondary name, e.g. an Arabic brand name */
  alt?: string;
  tagline: string;
  description: string;
  category: string;
  year: string;
  role: string;
  stack: string[];
  status: string;
  links: ProjectLinks;
  /** Paths relative to /public. First entry is the cover. */
  images: string[];
  featured: boolean;
  /** When true, the project appears in the Featured Case Study spotlight. */
  spotlight?: boolean;
  /** Marks an unfinished project — shows a "Coming soon" badge. */
  comingSoon?: boolean;
  caseStudy?: CaseStudy;
  order: number;
  i18n?: {
    fr?: ProjectI18n;
    ar?: ProjectI18n;
  };
}

export interface Socials {
  github?: string;
  linkedin?: string;
  x?: string;
  instagram?: string;
  dribbble?: string;
  website?: string;
  whatsapp?: string;
  calendly?: string;
}

export interface Service {
  title: LocalizedText;
  desc: LocalizedText;
}

export interface ProcessStep {
  title: LocalizedText;
  desc: LocalizedText;
}

export interface Stat {
  value: string;
  label: LocalizedText;
}

export interface Capability {
  title: LocalizedText;
  items: string[];
}

export interface Profile {
  name: string;
  initials: string;
  brand: string;
  roles: string[];
  location: LocalizedText;
  email: string;
  phone?: string;
  available: boolean;
  /** Optional portrait image path under /public; an elegant placeholder shows when empty. */
  portraitUrl?: string;
  /** e.g. "2021" — drives "Operating since". */
  since?: string;
  tagline: LocalizedText;
  bio: LocalizedText;
  /** Short headline that sits above the bio in About. */
  statement?: LocalizedText;
  socials: Socials;
  stats: Stat[];
  capabilities: Capability[];
  services?: Service[];
  process?: ProcessStep[];
}

export interface PortfolioData {
  profile: Profile;
  projects: Project[];
}
