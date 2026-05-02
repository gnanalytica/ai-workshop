import { NextResponse } from "next/server";
import { getActiveBanner } from "@/lib/queries/banners";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cohortId = url.searchParams.get("cohortId");
  if (!cohortId) return NextResponse.json({ banner: null });
  try {
    const banner = await getActiveBanner(cohortId);
    return NextResponse.json({ banner });
  } catch {
    return NextResponse.json({ banner: null });
  }
}
