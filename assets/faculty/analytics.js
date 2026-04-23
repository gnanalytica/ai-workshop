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

/** Days with milestone-style quizzes in the 30-day arc (subset of days that typically gate deliverables). */
export const MILESTONE_QUIZ_DAYS = [5, 10, 15, 20, 25, 30];

function cohortStartDate(startsOn) {
  if (!startsOn) return null;
  const d = new Date(`${String(startsOn).trim()}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** 1–6 cohort weeks from `starts_on` (week 1 = first 7 calendar days). */
export function weekIndexFromCohortStart(isoTs, cohortStart) {
  if (!cohortStart || !isoTs) return null;
  const t = new Date(isoTs).getTime();
  const s = cohortStart.getTime();
  if (Number.isNaN(t) || Number.isNaN(s) || t < s) return null;
  const dayOffset = Math.floor((t - s) / 86400000);
  return Math.min(6, Math.max(1, Math.floor(dayOffset / 7) + 1));
}

function emptyWeekBuckets() {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
}

function weekBucketsToArray(m) {
  return [1, 2, 3, 4, 5, 6].map((k) => m[k] || 0);
}

/**
 * Counts of lab completions, quiz attempts, submissions, and stuck items opened per cohort week (from cohort.starts_on).
 */
export async function loadCohortWeekTimeSeries(cohortId) {
  const { data: cohortRow } = await supabase.from('cohorts').select('starts_on').eq('id', cohortId).maybeSingle();
  const cohortStart = cohortStartDate(cohortRow?.starts_on);
  const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
  const z = () => [0, 0, 0, 0, 0, 0];
  if (!cohortStart) {
    return { labels, labs: z(), quizzes: z(), stuck: z(), subs: z(), cohortStart: null };
  }

  const labs = emptyWeekBuckets();
  const quizzes = emptyWeekBuckets();
  const stuck = emptyWeekBuckets();
  const subs = emptyWeekBuckets();

  const bump = (map, iso) => {
    const w = weekIndexFromCohortStart(iso, cohortStart);
    if (w) map[w] += 1;
  };

  const [lpRes, qaRes, stRes, subRes] = await Promise.all([
    supabase.from('lab_progress').select('completed_at').eq('cohort_id', cohortId).not('completed_at', 'is', null),
    supabase
      .from('quiz_attempts')
      .select('completed_at,quizzes!inner(cohort_id)')
      .eq('quizzes.cohort_id', cohortId)
      .not('completed_at', 'is', null),
    supabase.from('stuck_queue').select('created_at').eq('cohort_id', cohortId),
    supabase
      .from('submissions')
      .select('submitted_at,assignments!inner(cohort_id)')
      .eq('assignments.cohort_id', cohortId)
      .not('submitted_at', 'is', null),
  ]);

  (lpRes.data || []).forEach((r) => bump(labs, r.completed_at));
  (qaRes.data || []).forEach((r) => bump(quizzes, r.completed_at));
  (stRes.data || []).forEach((r) => bump(stuck, r.created_at));
  (subRes.data || []).forEach((r) => bump(subs, r.submitted_at));

  return {
    labels,
    labs: weekBucketsToArray(labs),
    quizzes: weekBucketsToArray(quizzes),
    stuck: weekBucketsToArray(stuck),
    subs: weekBucketsToArray(subs),
    cohortStart: cohortRow?.starts_on || null,
  };
}

/**
 * Pass rates for quizzes on milestone days (5,10,15,20,25,30) that exist for this cohort.
 * enrolledPassedPct = share of enrolled students with ≥1 passing attempt on that quiz.
 */
export async function loadQuizMilestoneSummary(cohortId, enrolledUserIds) {
  const enrolledSet = new Set((enrolledUserIds || []).filter(Boolean));
  const nEnrolled = enrolledSet.size;
  const { data: quizRows } = await supabase
    .from('quizzes')
    .select('id,day_number,title')
    .eq('cohort_id', cohortId)
    .in('day_number', MILESTONE_QUIZ_DAYS)
    .order('day_number');
  const quizzes = quizRows || [];
  if (!quizzes.length) return { rows: [], enrolledCount: nEnrolled };

  const qIds = quizzes.map((q) => q.id);
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('quiz_id,user_id,score,passed')
    .in('quiz_id', qIds);

  const byQuiz = new Map(quizzes.map((q) => [q.id, []]));
  (attempts || []).forEach((a) => {
    if (byQuiz.has(a.quiz_id)) byQuiz.get(a.quiz_id).push(a);
  });

  const rows = quizzes.map((q) => {
    const att = byQuiz.get(q.id) || [];
    const scores = att.map((a) => Number(a.score)).filter((x) => Number.isFinite(x));
    const avgScore = scores.length ? Math.round((scores.reduce((s, x) => s + x, 0) / scores.length) * 10) / 10 : null;
    const passedUsers = new Set(att.filter((a) => a.passed && enrolledSet.has(a.user_id)).map((a) => a.user_id));
    const enrolledPassedPct = nEnrolled ? Math.round((passedUsers.size / nEnrolled) * 1000) / 10 : 0;
    const attemptPassPct = att.length
      ? Math.round((att.filter((a) => a.passed).length / att.length) * 1000) / 10
      : null;
    return {
      day_number: q.day_number,
      title: q.title || `Day ${q.day_number}`,
      quiz_id: q.id,
      attempts: att.length,
      enrolledPassedPct,
      attemptPassPct,
      avgScore,
      passedCount: passedUsers.size,
    };
  });
  return { rows, enrolledCount: nEnrolled };
}

/** Cohort-level KPIs + pod rows for executive / Insights summary (support staff dashboards). */
export async function loadCohortExecSummary(cohortId) {
  const { data: regs } = await supabase
    .from('registrations')
    .select('user_id')
    .eq('cohort_id', cohortId)
    .eq('status', 'confirmed');
  const ids = (regs || []).map((r) => r.user_id).filter(Boolean);

  const { count: stuckCohortOpen } = await supabase
    .from('stuck_queue')
    .select('id', { count: 'exact', head: true })
    .eq('cohort_id', cohortId)
    .neq('status', 'resolved');

  const signals = await loadStudentSignals(cohortId, ids);
  let sumPct = 0;
  let atRiskCount = 0;
  let sumAtt = 0;
  let denAtt = 0;
  for (const uid of ids) {
    const s = signals.get(uid);
    if (!s) continue;
    const pct = s.daysTotal ? (s.daysDone / s.daysTotal) * 100 : 0;
    sumPct += pct;
    if (s.atRisk) atRiskCount += 1;
    sumAtt += s.attended || 0;
    denAtt += s.attMarked || 0;
  }
  const n = ids.length || 1;
  const podRows = await loadPodAnalytics(cohortId);

  return {
    enrolled: ids.length,
    meanLabPct: ids.length ? sumPct / ids.length : 0,
    atRiskCount,
    stuckCohortOpen: stuckCohortOpen ?? 0,
    checkInRate: denAtt ? sumAtt / denAtt : null,
    podRows,
    signals,
    studentIds: ids,
  };
}

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
