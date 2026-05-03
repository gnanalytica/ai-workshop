import { NextResponse } from "next/server";
import { getPollResults } from "@/lib/queries/polls";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const rows = await getPollResults(id);
    return NextResponse.json({ rows });
  } catch {
    return NextResponse.json({ rows: [] }, { status: 200 });
  }
}
