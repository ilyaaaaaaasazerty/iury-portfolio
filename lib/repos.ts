// Pure repo → project logic, shared by the server (site build) and the Studio UI.
import type { GithubConfig, Project, RepoMeta } from "./types";

/** Whether a repo should appear on the site under the given config. */
export function isRepoShown(repo: RepoMeta, config: GithubConfig): boolean {
  const explicit = config.visibility[repo.name];
  if (explicit !== undefined) return explicit;
  if (repo.fork && !config.includeForks) return false;
  return config.autoInclude;
}

const lastSegment = (url?: string) =>
  url?.replace(/\.git$/, "").replace(/\/+$/, "").split("/").pop()?.toLowerCase();

/** The curated project (if any) that a repo belongs to. */
export function findCuratedMatch(repo: RepoMeta, projects: Project[]): Project | undefined {
  const name = repo.name.toLowerCase();
  return (
    projects.find((p) => lastSegment(p.links.github) === name) ??
    projects.find((p) => p.slug.toLowerCase() === name || p.id.toLowerCase() === name)
  );
}

const titleCase = (s: string) =>
  s
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** Turn a bare repo into a portfolio project. */
export function repoToProject(repo: RepoMeta, config: GithubConfig, order: number): Project {
  const o = config.overrides[repo.name] ?? {};
  const category =
    o.category || (repo.topics[0] ? titleCase(repo.topics[0]) : repo.language) || "Repository";
  return {
    id: `gh-${repo.name.toLowerCase()}`,
    slug: repo.name.toLowerCase(),
    name: o.name || titleCase(repo.name),
    tagline: o.tagline || repo.description,
    description: repo.description,
    category,
    year: repo.pushedAt.slice(0, 4),
    role: "Author",
    stack: [repo.language, ...repo.topics].filter(Boolean) as string[],
    status: repo.archived ? "Archived" : "Active",
    links: { github: repo.url, live: repo.homepage },
    images: [],
    featured: config.featured.includes(repo.name),
    order,
    source: "github",
    repo,
  };
}

/**
 * Curated projects enriched with live repo data, plus every shown repo that has
 * no curated entry. Hiding a repo also hides the curated project linked to it.
 */
export function mergeProjects(
  curated: Project[],
  repos: RepoMeta[],
  config: GithubConfig
): Project[] {
  const hidden = new Set<string>();
  const attached = new Map<string, RepoMeta>();
  const extra: RepoMeta[] = [];

  for (const repo of repos) {
    const match = findCuratedMatch(repo, curated);
    if (!isRepoShown(repo, config)) {
      // An explicit "hide" on a linked repo hides the curated card too.
      if (match && config.visibility[repo.name] === false) hidden.add(match.id);
      continue;
    }
    if (match) attached.set(match.id, repo);
    else extra.push(repo);
  }

  const merged: Project[] = curated
    .filter((p) => !p.hidden && !hidden.has(p.id))
    .map((p) => {
      const repo = attached.get(p.id);
      if (!repo) return { ...p, source: "manual" as const };
      return {
        ...p,
        source: "manual" as const,
        repo,
        links: { ...p.links, github: p.links.github || repo.url, live: p.links.live || repo.homepage },
        featured: p.featured || config.featured.includes(repo.name),
      };
    });

  extra.forEach((repo, i) => merged.push(repoToProject(repo, config, curated.length + i + 1)));
  return merged;
}
