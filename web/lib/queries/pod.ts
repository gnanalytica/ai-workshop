import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseService } from "@/lib/supabase/service";
import { getPreviewUserId } from "@/lib/auth/persona";

export interface MyPodPerson {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  email?: string | null;
  college?: string | null;
}

export interface MyPod {
  pod_id: string;
  pod_name: string;
  shared_notes: string | null;
  faculty: MyPodPerson[];
  podmates: MyPodPerson[];
}

export const getMyPod = cache(async (cohortId: string): Promise<MyPod | null> => {
  const previewUid = await getPreviewUserId();
  const sb = await getSupabaseServer();

  // Resolve pod_id + base info. Two paths: real student (via RPC that uses
  // auth.uid()) or admin previewing as a student (service-role fetch).
  let podId: string;
  let podName: string;
  let sharedNotes: string | null;
  let viewerUid: string | null = null;
  let facultyFromRpc: MyPodPerson[] = [];

  if (previewUid) {
    const svc = getSupabaseService();
    const { data: member } = await svc
      .from("pod_members")
      .select("pod_id, pods!inner(id, name, shared_notes)")
      .eq("cohort_id", cohortId)
      .eq("student_user_id", previewUid)
      .maybeSingle();
    if (!member) return null;
    const pod = (member as unknown as { pods: { id: string; name: string; shared_notes: string | null } }).pods;
    podId = pod.id;
    podName = pod.name;
    sharedNotes = pod.shared_notes;
    viewerUid = previewUid;

    const { data: facultyRows } = await svc
      .from("pod_faculty")
      .select("faculty_user_id, profiles:faculty_user_id(full_name, avatar_url)")
      .eq("pod_id", podId);
    facultyFromRpc = ((facultyRows ?? []) as unknown as Array<{
      faculty_user_id: string;
      profiles: { full_name: string | null; avatar_url: string | null } | null;
    }>).map((f) => ({
      user_id: f.faculty_user_id,
      full_name: f.profiles?.full_name ?? null,
      avatar_url: f.profiles?.avatar_url ?? null,
    }));
  } else {
    const { data, error } = await sb.rpc("rpc_my_pod", { p_cohort: cohortId } as never);
    if (error || !data) return null;
    const rows = data as unknown as Array<{
      pod_id: string;
      pod_name: string;
      shared_notes: string | null;
      faculty: MyPodPerson[];
    }>;
    const row = rows[0];
    if (!row) return null;
    podId = row.pod_id;
    podName = row.pod_name;
    sharedNotes = row.shared_notes;
    facultyFromRpc = row.faculty ?? [];
    const { data: user } = await sb.auth.getUser();
    viewerUid = user.user?.id ?? null;
  }

  // Fetch podmates from this pod, excluding the viewer. Read-side RLS on
  // pod_members lets a student see other members of their pod.
  const client = previewUid ? getSupabaseService() : sb;
  const { data: mateRows } = await client
    .from("pod_members")
    .select("student_user_id, profiles:student_user_id(full_name, avatar_url, email, college)")
    .eq("pod_id", podId)
    .eq("cohort_id", cohortId);

  const podmates = ((mateRows ?? []) as unknown as Array<{
    student_user_id: string;
    profiles: {
      full_name: string | null;
      avatar_url: string | null;
      email: string | null;
      college: string | null;
    } | null;
  }>)
    .filter((m) => m.student_user_id !== viewerUid)
    .map((m) => ({
      user_id: m.student_user_id,
      full_name: m.profiles?.full_name ?? null,
      avatar_url: m.profiles?.avatar_url ?? null,
      email: m.profiles?.email ?? null,
      college: m.profiles?.college ?? null,
    }))
    .sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? ""));

  return {
    pod_id: podId,
    pod_name: podName,
    shared_notes: sharedNotes,
    faculty: facultyFromRpc,
    podmates,
  };
});
