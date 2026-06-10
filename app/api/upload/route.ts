import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { studioEnabled } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!studioEnabled()) {
    return NextResponse.json(
      { error: "Studio is disabled in this environment." },
      { status: 403 }
    );
  }
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const rawId = (form.get("projectId") as string) || "misc";
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const safeId = rawId.replace(/[^a-z0-9-_]/gi, "_").toLowerCase() || "misc";
    const ext =
      (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") ||
      "png";
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)
      .toString(36)
      .padStart(4, "0")}.${ext}`;

    const dir = path.join(process.cwd(), "public", "projects", safeId);
    await fs.mkdir(dir, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(dir, filename), bytes);

    return NextResponse.json({ path: `/projects/${safeId}/${filename}` });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
