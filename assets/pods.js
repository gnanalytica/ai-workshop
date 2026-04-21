// Shared helpers for pod data loading and mutations.
// Used by admin-pods.html and faculty tabs.

import { supabase } from './supabase.js';

export async function loadPodsForCohort(cohortId) {
  const { data: pods, error } = await supabase
    .from('cohort_pods')
    .select('id,name,mentor_note,created_at')
    .eq('cohort_id', cohortId)
    .order('created_at', { ascending: true });
  if (error) throw error;

  const podIds = (pods || []).map(p => p.id);
  if (!podIds.length) return [];

  const [{ data: faculty }, { data: members }] = await Promise.all([
    supabase.from('pod_faculty').select('pod_id,faculty_user_id,is_primary,contact_note').in('pod_id', podIds),
    supabase.from('pod_members').select('pod_id,student_user_id').in('pod_id', podIds),
  ]);

  const facultyByPod = new Map();
  (faculty || []).forEach(f => {
    if (!facultyByPod.has(f.pod_id)) facultyByPod.set(f.pod_id, []);
    facultyByPod.get(f.pod_id).push(f);
  });
  const membersByPod = new Map();
  (members || []).forEach(m => {
    if (!membersByPod.has(m.pod_id)) membersByPod.set(m.pod_id, []);
    membersByPod.get(m.pod_id).push(m);
  });

  return pods.map(p => ({
    ...p,
    faculty: facultyByPod.get(p.id) || [],
    members: membersByPod.get(p.id) || [],
  }));
}

// Enrolled (confirmed) students for a cohort (registrations then profiles).
// Two queries: PostgREST only embeds when an FK is registered between tables;
// without registrations.user_id → profiles.id, nested select throws schema-cache errors.
export async function loadEnrolledStudents(cohortId) {
  const { data: regs, error } = await supabase
    .from('registrations')
    .select('user_id')
    .eq('cohort_id', cohortId)
    .eq('status', 'confirmed');
  if (error) throw error;
  const ids = [...new Set((regs || []).map((r) => r.user_id).filter(Boolean))];
  if (!ids.length) return [];
  const { data: profs, error: pErr } = await supabase
    .from('profiles')
    .select('id,full_name,college')
    .in('id', ids);
  if (pErr) throw pErr;
  return profs || [];
}

export async function loadCohortFaculty(cohortId) {
  const { data: fac } = await supabase.from('cohort_faculty').select('user_id,role').eq('cohort_id', cohortId);
  const ids = (fac || []).map(r => r.user_id);
  if (!ids.length) return [];
  const { data: profs } = await supabase.from('profiles').select('id,full_name,college').in('id', ids);
  const byId = new Map((profs || []).map(p => [p.id, p]));
  return (fac || []).map(f => ({ ...f, profile: byId.get(f.user_id) || {} }));
}

export async function callPodFacultyEvent(podId, kind, fromUserId, toUserId, note) {
  const { error } = await supabase.rpc('rpc_pod_faculty_event', {
    p_pod_id: podId,
    p_kind: kind,
    p_from_user_id: fromUserId,
    p_to_user_id: toUserId,
    p_note: note,
  });
  if (error) throw error;
}

export function parsePodCsv(text) {
  const rows = text.trim().split(/\r?\n/).map(r => r.split(',').map(c => c.trim()));
  if (!rows.length) throw new Error('Empty CSV');
  const [header, ...data] = rows;
  const emailIdx = header.indexOf('student_email');
  const podIdx = header.indexOf('pod_name');
  if (emailIdx < 0 || podIdx < 0) throw new Error('CSV needs student_email,pod_name columns');
  return data.filter(r => r[emailIdx] && r[podIdx]).map(r => ({ email: r[emailIdx], pod: r[podIdx] }));
}
