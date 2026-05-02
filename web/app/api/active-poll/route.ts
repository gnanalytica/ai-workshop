import { NextResponse } from "next/server";
import { getActivePoll } from "@/lib/queries/polls";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cohortId = url.searchParams.get("cohortId");
  if (!cohortId) return NextResponse.json({ poll: null });
  try {
    const poll = await getActivePoll(cohortId);
    return NextResponse.json({ poll });
  } catch {
    return NextResponse.json({ poll: null });
  }
}
