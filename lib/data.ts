import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Profile, Project } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
const PROFILE_FILE = path.join(DATA_DIR, "profile.json");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function getProjects(): Promise<Project[]> {
  const data = await readJson<{ projects: Project[] } | Project[]>(
    PROJECTS_FILE,
    { projects: [] }
  );
  const list = Array.isArray(data) ? data : data.projects ?? [];
  return [...list].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

export async function getProfile(): Promise<Profile> {
  return readJson<Profile>(PROFILE_FILE, {
    name: "Belkhiri Abdelaziz",
    initials: "BA",
    brand: "IURY",
    roles: ["Autoentrepreneur", "AI Researcher"],
    location: { en: "Algeria" },
    email: "",
    available: true,
    tagline: { en: "" },
    bio: { en: "" },
    socials: {},
    stats: [],
    capabilities: [],
  });
}

export async function saveProjects(projects: Project[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    PROJECTS_FILE,
    JSON.stringify({ projects }, null, 2),
    "utf-8"
  );
}

export async function saveProfile(profile: Profile): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PROFILE_FILE, JSON.stringify(profile, null, 2), "utf-8");
}

export function getProjectBySlug(
  projects: Project[],
  slug: string
): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** True when the Studio dashboard is allowed to mutate data. */
export function studioEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ENABLE_STUDIO === "true"
  );
}
