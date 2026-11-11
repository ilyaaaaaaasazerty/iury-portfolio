import { NextResponse } from "next/server";
import { getProjects, studioEnabled } from "@/lib/data";
import { fetchRepos, getGithubConfig, saveGithubConfig } from "@/lib/github";
import { findCuratedMatch, isRepoShown } from "@/lib/repos";
import type { GithubConfig } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Live repo list for the Studio, annotated with visibility and curated links. */
export async function GET() {
  const [config, curated] = await Promise.all([getGithubConfig(), getProjects()]);
  const result = await fetchRepos(config.username, { fresh: studioEnabled() });
  const repos = result.repos.map((repo) => {
    const match = findCuratedMatch(repo, curated);
    return {
      ...repo,
      shown: isRepoShown(repo, config),
      linkedTo: match ? { id: match.id, name: match.name } : null,
    };
  });
  return NextResponse.json({ config, repos, fetchedAt: result.fetchedAt, from: result.from, error: result.error });
}

export async function PUT(req: Request) {
  if (!studioEnabled()) {
    return NextResponse.json(
      { error: "Studio is disabled in this environment." },
      { status: 403 }
    );
  }
  try {
    const body = (await req.json()) as { config?: GithubConfig };
    const c = body.config;
    if (!c || typeof c.username !== "string" || !c.username.trim()) {
      throw new Error("Missing GitHub username");
    }
    const config: GithubConfig = {
      username: c.username.trim(),
      autoInclude: !!c.autoInclude,
      includeForks: !!c.includeForks,
      visibility: c.visibility ?? {},
      featured: Array.isArray(c.featured) ? c.featured : [],
      overrides: c.overrides ?? {},
    };
    await saveGithubConfig(config);
    return NextResponse.json({ ok: true, config });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid payload" },
      { status: 400 }
    );
  }
}
