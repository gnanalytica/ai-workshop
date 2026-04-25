import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface HandbookModule {
  id: string;
  slug: string;
  title: string;
  body_md: string | null;
  ordinal: number;
  status: "not_started" | "in_progress" | "completed" | null;
}

export const listFacultyHandbook = cache(async (): Promise<HandbookModule[]> => {
  const sb = await getSupabaseServer();
  const { data: user } = await sb.auth.getUser();
  const uid = user.user?.id;

  const { data: modules } = await sb
    .from("faculty_pretraining_modules")
    .select("id, slug, title, body_md, ordinal")
    .order("ordinal");
  if (!modules) return [];

  let progressMap = new Map<string, "not_started" | "in_progress" | "completed">();
  if (uid) {
    const { data: progress } = await sb
      .from("faculty_pretraining_progress")
      .select("module_id, status")
      .eq("faculty_user_id", uid);
    progressMap = new Map(
      ((progress ?? []) as Array<{ module_id: string; status: "not_started" | "in_progress" | "completed" }>).map((p) => [p.module_id, p.status]),
    );
  }

  return (modules as Array<{ id: string; slug: string; title: string; body_md: string | null; ordinal: number }>).map(
    (m) => ({
      id: m.id,
      slug: m.slug,
      title: m.title,
      body_md: m.body_md,
      ordinal: m.ordinal,
      status: progressMap.get(m.id) ?? null,
    }),
  );
});
