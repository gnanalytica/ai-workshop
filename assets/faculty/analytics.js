// Analytics loaders: pod-vs-pod and faculty-vs-faculty.
//
// Schema notes:
// - pod_members has a cohort_id column (denormalised) — use it directly.
// - submissions has no graded_by column; we report graded-submission counts
//   for each faculty's mentees. Grading turnaround uses submitted_at →
//   graded_at (column added in migration 0400) and reports the pod-wide
//   median for the faculty's mentee pool.

import { supabase } from '../supabase.js';
import { loadStudentSignals } from './signals.js';

export async function loadPodAnalytics(cohortId) {
  const { data: pods } = await supabase.from('cohort_pods')
    .select('id,name').eq('cohort_id', cohortId);
  const { data: members } = await supabase.from('pod_members')
    .select('pod_id,student_user_id').eq('cohort_id', cohortId);

  const byPod = new Map((pods || []).map(p => [p.id, { ...p, uids: [] }]));
  (members || []).forEach(m => { if (byPod.has(m.pod_id)) byPod.get(m.pod_id).uids.push(m.student_user_id); });

  const allIds = [...new Set((members || []).map(m => m.student_user_id))];
  const signals = await loadStudentSignals(cohortId, allIds);

  return Array.from(byPod.values()).map(p => {
    const sigs = p.uids.map(u => signals.get(u)).filter(Boolean);
    const n = sigs.length || 1;
    const avgPct = sigs.reduce((s, x) => s + (x.daysTotal ? x.daysDone / x.daysTotal : 0), 0) / n * 100;
    const attendanceAvg = sigs.reduce((s, x) => s + (x.attended || 0), 0) / n;
    const atRisk = sigs.filter(x => x.atRisk).length;
    const subsGraded = sigs.reduce((s, x) => s + (x.subsGraded || 0), 0);
    const subsPending = sigs.reduce((s, x) => s + (x.subsPending || 0), 0);
    return {
      pod: p,
      students: p.uids.length,
      avgPct,
      attendanceAvg,
      atRisk,
      subsGraded,
      subsPending,
    };
  });
}

export async function loadFacultyAnalytics(cohortId) {
  const { data: fac } = await supabase.from('cohort_faculty').select('user_id').eq('cohort_id', cohortId);
  const ids = (fac || []).map(f => f.user_id);
  const { data: profs } = ids.length
    ? await supabase.from('profiles').select('id,full_name').in('id', ids)
    : { data: [] };
  const profById = new Map((profs || []).map(p => [p.id, p]));

  const { data: podFac } = await supabase.from('pod_faculty')
    .select('pod_id,faculty_user_id,cohort_pods!inner(cohort_id)')
    .eq('cohort_pods.cohort_id', cohortId);
  const { data: members } = await supabase.from('pod_members')
    .select('pod_id,student_user_id').eq('cohort_id', cohortId);
  const { data: events } = await supabase.from('pod_faculty_events')
    .select('pod_id,from_user_id,to_user_id,kind,cohort_pods:cohort_pods!inner(cohort_id)')
    .eq('cohort_pods.cohort_id', cohortId);

  const membersByPod = new Map();
  (members || []).forEach(m => {
    if (!membersByPod.has(m.pod_id)) membersByPod.set(m.pod_id, new Set());
    membersByPod.get(m.pod_id).add(m.student_user_id);
  });

  const allStudentIds = [...new Set((members || []).map(m => m.student_user_id))];
  const signals = await loadStudentSignals(cohortId, allStudentIds);

  // Pull graded submissions for the whole mentee pool once; compute per-faculty medians by membership.
  const gradedSubs = allStudentIds.length
    ? (await supabase.from('submissions')
        .select('user_id,submitted_at,graded_at,assignments!inner(cohort_id)')
        .in('user_id', allStudentIds)
        .eq('assignments.cohort_id', cohortId)
        .not('graded_at', 'is', null)
        .not('submitted_at', 'is', null)).data || []
    : [];

  function median(xs) {
    if (!xs.length) return null;
    const s = [...xs].sort((a,b)=>a-b);
    return s[Math.floor(s.length/2)];
  }

  return ids.map(uid => {
    const podsOwned = (podFac || []).filter(pf => pf.faculty_user_id === uid).map(pf => pf.pod_id);
    const studentSet = new Set();
    podsOwned.forEach(pid => (membersByPod.get(pid) || new Set()).forEach(sid => studentSet.add(sid)));
    const sigs = [...studentSet].map(u => signals.get(u)).filter(Boolean);
    const n = sigs.length || 1;
    const avgPct = sigs.reduce((s, x) => s + (x.daysTotal ? x.daysDone / x.daysTotal : 0), 0) / n * 100;

    const gradedCount = sigs.reduce((s, x) => s + (x.subsGraded || 0), 0);

    const turnaroundsHrs = gradedSubs
      .filter(g => studentSet.has(g.user_id))
      .map(g => (new Date(g.graded_at) - new Date(g.submitted_at)) / 3600000)
      .filter(h => Number.isFinite(h) && h >= 0);
    const gradingMedianHrs = median(turnaroundsHrs);

    const handoffsIn = (events || []).filter(e => e.to_user_id === uid && (e.kind === 'handoff' || e.kind === 'primary_transfer')).length;
    const handoffsOut = (events || []).filter(e => e.from_user_id === uid && e.kind === 'handoff').length;

    return {
      faculty: profById.get(uid) || { id: uid, full_name: uid },
      studentsMentored: studentSet.size,
      avgPct,
      gradedCount,
      gradingMedianHrs,
      handoffsIn,
      handoffsOut,
    };
  });
}
