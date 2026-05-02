import { NextResponse } from "next/server";
import { getActiveQuiz } from "@/lib/queries/quiz-detail";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cohortId = url.searchParams.get("cohortId");
  if (!cohortId) return NextResponse.json({ quiz: null });
  try {
    const quiz = await getActiveQuiz(cohortId);
    return NextResponse.json({ quiz });
  } catch {
    return NextResponse.json({ quiz: null });
  }
}
