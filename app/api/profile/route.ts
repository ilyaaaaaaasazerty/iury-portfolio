import { NextResponse } from "next/server";
import { getProfile, saveProfile, studioEnabled } from "@/lib/data";
import type { Profile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await getProfile();
  return NextResponse.json({ profile });
}

export async function PUT(req: Request) {
  if (!studioEnabled()) {
    return NextResponse.json(
      { error: "Studio is disabled in this environment." },
      { status: 403 }
    );
  }
  try {
    const body = (await req.json()) as { profile?: Profile };
    if (!body.profile) throw new Error("Missing profile");
    await saveProfile(body.profile);
    return NextResponse.json({ ok: true, profile: body.profile });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid payload" },
      { status: 400 }
    );
  }
}
