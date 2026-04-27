import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseService } from "@/lib/supabase/service";
import { getPreviewUserId } from "@/lib/auth/persona";

export interface MyPodFaculty {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface MyPod {
  pod_id: string;
  pod_name: string;
  shared_notes: string | null;
  faculty: MyPodFaculty[];
}

export const getMyPod = cache(async (cohortId: string): Promise<MyPod | null> => {
  const previewUid = await getPreviewUserId();
  if (previewUid) {
    // Admin previewing as a student: rpc_my_pod uses auth.uid() and would
    // resolve to the admin (who has no pod). Build the same shape directly
    // via the service role client.
    const svc = getSupabaseService();
    const { data: member } = await svc
      .from("pod_members")
      .select("pod_id, pods!inner(id, name, shared_notes)")
      .eq("cohort_id", cohortId)
      .eq("student_user_id", previewUid)
      .maybeSingle();
    if (!member) return null;
    const pod = (member as unknown as { pods: { id: string; name: string; shared_notes: string | null } }).pods;
    const { data: facultyRows } = await svc
      .from("pod_faculty")
      .select("faculty_user_id, profiles:faculty_user_id(full_name, avatar_url)")
      .eq("pod_id", pod.id);
    const faculty = ((facultyRows ?? []) as unknown as Array<{
      faculty_user_id: string;
      profiles: { full_name: string | null; avatar_url: string | null } | null;
    }>).map((f) => ({
      user_id: f.faculty_user_id,
      full_name: f.profiles?.full_name ?? null,
      avatar_url: f.profiles?.avatar_url ?? null,
    }));
    return {
      pod_id: pod.id,
      pod_name: pod.name,
      shared_notes: pod.shared_notes,
      faculty,
    };
  }

  const sb = await getSupabaseServer();
  const { data, error } = await sb.rpc("rpc_my_pod", { p_cohort: cohortId } as never);
  if (error || !data) return null;
  const rows = data as unknown as MyPod[];
  return rows[0] ?? null;
});
