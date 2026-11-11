import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { GithubConfig, RepoMeta } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(DATA_DIR, "github.json");
// Last successful fetch — used when the GitHub API is unreachable or rate-limited.
const CACHE_FILE = path.join(DATA_DIR, "github-cache.json");

/** How often the public site re-reads GitHub, in seconds. */
export const GITHUB_REVALIDATE = 3600;

const DEFAULT_CONFIG: GithubConfig = {
  username: "ilyaaaaaaasazerty",
  autoInclude: true,
  includeForks: false,
  visibility: {},
  featured: [],
  overrides: {},
};

export async function getGithubConfig(): Promise<GithubConfig> {
  try {
    const raw = await fs.readFile(CONFIG_FILE, "utf-8");
    return { ...DEFAULT_CONFIG, ...(JSON.parse(raw) as Partial<GithubConfig>) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function saveGithubConfig(config: GithubConfig): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

interface ApiRepo {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics?: string[];
  fork: boolean;
  archived: boolean;
  private: boolean;
  created_at: string;
  pushed_at: string;
}

const toMeta = (r: ApiRepo): RepoMeta => ({
  name: r.name,
  fullName: r.full_name,
  url: r.html_url,
  description: r.description ?? "",
  homepage: r.homepage || undefined,
  language: r.language ?? undefined,
  stars: r.stargazers_count,
  forks: r.forks_count,
  topics: r.topics ?? [],
  fork: r.fork,
  archived: r.archived,
  createdAt: r.created_at,
  pushedAt: r.pushed_at,
});

export interface RepoFetch {
  repos: RepoMeta[];
  fetchedAt: string;
  /** "live" from the API, "cache" from the last saved snapshot, "none" if neither worked. */
  from: "live" | "cache" | "none";
  error?: string;
}

/**
 * All public repos for the configured user, newest push first.
 * `fresh` bypasses Next's fetch cache (used by the Studio).
 */
export async function fetchRepos(
  username: string,
  { fresh = false }: { fresh?: boolean } = {}
): Promise<RepoFetch> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed&type=owner`,
      fresh
        ? { headers, cache: "no-store" }
        : { headers, next: { revalidate: GITHUB_REVALIDATE } }
    );
    if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
    const data = (await res.json()) as ApiRepo[];
    const repos = data.filter((r) => !r.private).map(toMeta);
    const result: RepoFetch = { repos, fetchedAt: new Date().toISOString(), from: "live" };
    // Studio syncs refresh the snapshot used for offline/rate-limited builds.
    if (fresh) {
      await fs.writeFile(CACHE_FILE, JSON.stringify(result, null, 2), "utf-8").catch(() => {});
    }
    return result;
  } catch (err) {
    const error = err instanceof Error ? err.message : "GitHub fetch failed";
    try {
      const cached = JSON.parse(await fs.readFile(CACHE_FILE, "utf-8")) as RepoFetch;
      return { ...cached, from: "cache", error };
    } catch {
      return { repos: [], fetchedAt: new Date().toISOString(), from: "none", error };
    }
  }
}
