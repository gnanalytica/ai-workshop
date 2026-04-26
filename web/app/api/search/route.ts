import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getMyCurrentCohort } from "@/lib/queries/cohort";
import { listDays } from "@/lib/content/loader";

export interface SearchHit {
  kind: "person" | "post" | "day";
  href: string;
  title: string;
  hint?: string;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ hits: [] });

  const cohort = await getMyCurrentCohort();
  const sb = await getSupabaseServer();

  const hits: SearchHit[] = [];

  const days = await listDays();
  for (const d of days) {
    if (
      d.topic.toLowerCase().includes(q) ||
      `day ${d.day}`.includes(q) ||
      `day${d.day}`.includes(q)
    ) {
      hits.push({
        kind: "day",
        href: `/day/${d.day}`,
        title: `Day ${d.day} · ${d.topic}`,
        hint: "lesson",
      });
    }
  }

  if (cohort) {
    const [people, posts] = await Promise.all([
      sb
        .from("registrations")
        .select("user_id, profiles!inner(full_name, email, college)")
        .eq("cohort_id", cohort.id)
        .eq("status", "confirmed")
        .or(`full_name.ilike.%${q}%,email.ilike.%${q}%,college.ilike.%${q}%`, { foreignTable: "profiles" })
        .limit(8),
      sb
        .from("board_posts")
        .select("id, title")
        .eq("cohort_id", cohort.id)
        .is("deleted_at", null)
        .ilike("title", `%${q}%`)
        .limit(8),
    ]);

    for (const r of (people.data ?? []) as unknown as Array<{
      user_id: string;
      profiles: { full_name: string | null; email: string; college: string | null };
    }>) {
      hits.push({
        kind: "person",
        href: `/people`,
        title: r.profiles.full_name ?? r.profiles.email,
        hint: r.profiles.college ?? r.profiles.email,
      });
    }
    for (const p of (posts.data ?? []) as unknown as Array<{ id: string; title: string }>) {
      hits.push({ kind: "post", href: `/board/${p.id}`, title: p.title, hint: "Q&A" });
    }
  }

  return NextResponse.json({ hits: hits.slice(0, 30) });
}
