// Computes per-student signals for a cohort (faculty dashboards).
// Schema corrections vs plan:
// - lab_progress (not day_progress). Completed = completed_at is not null.
// - submissions has no cohort_id; join via assignments!inner.
// - attendance: present = checked_in_at is not null. No `status` column.
// - stuck_queue: open = status != 'resolved'.
// - peer_reviews: no reviewee_id column; join submissions!inner(user_id) for reviewee.
// - There's no `activity` table. Compute last-active as max of
//   submissions.submitted_at, stuck_queue.created_at, lab_progress.completed_at.
// - Total days = count of cohort_days rows for the cohort.

import { supabase } from '../supabase.js';

export async function loadStudentSignals(cohortId, userIds) {
  if (!userIds || !userIds.length) return new Map();

  const [
    { data: progress },
    { data: subs },
    { data: stuck },
    { data: att },
    { data: reviewsGiven },
    { data: reviewsReceived },
    { data: daysRows },
  ] = await Promise.all([
    supabase.from('lab_progress')
      .select('user_id,day_number,completed_at')
      .in('user_id', userIds)
      .eq('cohort_id', cohortId),
    supabase.from('submissions')
      .select('user_id,status,submitted_at,assignments!inner(day_number,cohort_id)')
      .in('user_id', userIds)
      .eq('assignments.cohort_id', cohortId),
    supabase.from('stuck_queue')
      .select('user_id,status,created_at,resolved_at')
      .in('user_id', userIds)
      .eq('cohort_id', cohortId),
    supabase.from('attendance')
      .select('user_id,checked_in_at,day_number')
      .in('user_id', userIds)
      .eq('cohort_id', cohortId),
    supabase.from('peer_reviews')
      .select('reviewer_id,submitted_at')
      .in('reviewer_id', userIds),
    // Peer reviews received — join submissions to get reviewee (submission author).
    supabase.from('peer_reviews')
      .select('submitted_at,submissions!inner(user_id)')
      .in('submissions.user_id', userIds),
    supabase.from('cohort_days').select('day_number').eq('cohort_id', cohortId),
  ]);

  const daysTotal = (daysRows || []).length;

  const out = new Map();
  for (const uid of userIds) {
    const done = (progress || []).filter(p => p.user_id === uid && p.completed_at);
    const ss = (subs || []).filter(s => s.user_id === uid);
    const attRows = (att || []).filter(a => a.user_id === uid);
    const stuckOpen = (stuck || []).filter(s => s.user_id === uid && s.status !== 'resolved').length;
    const revGiven = (reviewsGiven || []).filter(r => r.reviewer_id === uid).length;
    const revRecvd = (reviewsReceived || []).filter(r => r.submissions?.user_id === uid).length;

    // last-active: max across submissions.submitted_at, stuck.created_at, progress.completed_at
    const candidates = [];
    ss.forEach(s => s.submitted_at && candidates.push(new Date(s.submitted_at).getTime()));
    (stuck || []).filter(s => s.user_id === uid).forEach(s => s.created_at && candidates.push(new Date(s.created_at).getTime()));
    done.forEach(p => p.completed_at && candidates.push(new Date(p.completed_at).getTime()));
    const lastActive = candidates.length ? new Date(Math.max(...candidates)).toISOString() : null;

    const daysDone = done.length;
    const subsGraded = ss.filter(s => s.status === 'graded').length;
    const subsPending = ss.filter(s => s.status === 'submitted' || s.status === 'pending').length;
    const attended = attRows.filter(a => a.checked_in_at).length;

    // at-risk heuristic: behind on >3 days AND attendance rate <50%
    const daysBehind = Math.max(0, daysTotal - daysDone);
    const attRate = attRows.length ? attended / attRows.length : 0;
    const atRisk = daysBehind > 3 && attRows.length > 0 && attRate < 0.5;

    out.set(uid, {
      daysDone, daysTotal,
      subsGraded, subsPending,
      attended, attMarked: attRows.length,
      stuckOpen,
      lastActive,
      reviewsGiven: revGiven,
      reviewsReceived: revRecvd,
      atRisk,
    });
  }
  return out;
}
