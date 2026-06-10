import { NextResponse } from "next/server";
import { getProjects, saveProjects, studioEnabled } from "@/lib/data";
import type { Project } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json({ projects });
}

export async function PUT(req: Request) {
  if (!studioEnabled()) {
    return NextResponse.json(
      { error: "Studio is disabled in this environment." },
      { status: 403 }
    );
  }
  try {
    const body = (await req.json()) as { projects?: Project[] };
    const projects = Array.isArray(body.projects) ? body.projects : [];
    projects.forEach((p, i) => {
      p.order = i + 1;
    });
    await saveProjects(projects);
    return NextResponse.json({ ok: true, projects });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid payload" },
      { status: 400 }
    );
  }
}
