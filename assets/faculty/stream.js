// Stream tab (formerly Today) — cohort day + pod signals + cohort stuck + needs grading.

import { supabase } from '../supabase.js';
import { facultyDoughnutChart, facultyVBarChart, facultyChartColors } from './chart-kit.js';

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function todayStartIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function todayEndIso() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

async function attachStreamDisplayNames(payload) {
  const ids = new Set();
  for (const s of payload.stuckCohort || []) if (s.user_id) ids.add(s.user_id);
  for (const s of payload.stuck || []) if (s.user_id) ids.add(s.user_id);
  for (const s of payload.ungraded || []) if (s.user_id) ids.add(s.user_id);
  for (const s of payload.subs || []) if (s.user_id) ids.add(s.user_id);
  const list = [...ids];
  const nameByUser = new Map();
  if (!list.length) return { ...payload, nameByUser };
  const { data } = await supabase.from('profiles').select('id,full_name').in('id', list);
  (data || []).forEach((p) => {
    const n = (p.full_name || '').trim();
    nameByUser.set(p.id, n || null);
  });
  return { ...payload, nameByUser };
}

function streamPersonLabel(nameByUser, uid) {
  if (!uid) return '—';
  const n = nameByUser.get(uid);
  if (n) return n;
  return uid.length > 10 ? `${uid.slice(0, 8)}…` : uid;
}

async function loadStream(cohortId, userId, isTrainer = false) {
  const startIso = todayStartIso();
  const endIso = todayEndIso();

  const { data: daysAll } = await supabase
    .from('cohort_days')
    .select('day_number,live_session_at,meet_link,title,notes')
    .eq('cohort_id', cohortId);
  const daySched =
    (daysAll || []).find((d) => {
      if (!d.live_session_at) return false;
      const t = new Date(d.live_session_at);
      return t >= new Date(startIso) && t <= new Date(endIso);
    }) || null;

  const { data: myPods } = await supabase
    .from('pod_faculty')
    .select('pod_id,cohort_pods!inner(id,name,cohort_id)')
    .eq('faculty_user_id', userId)
    .eq('cohort_pods.cohort_id', cohortId);
  const podIds = (myPods || []).map((p) => p.pod_id);

  let myStudentIds = [];
  if (podIds.length) {
    const { data: members } = await supabase.from('pod_members').select('student_user_id').in('pod_id', podIds);
    myStudentIds = [...new Set((members || []).map((m) => m.student_user_id))];
  }

  const [stuckCohortRes, ungradedRes] = await Promise.all([
    supabase
      .from('stuck_queue')
      .select('id,user_id,day_number,message,created_at,status')
      .eq('cohort_id', cohortId)
      .neq('status', 'resolved')
      .order('created_at', { ascending: false })
      .limit(5),
    daySched && isTrainer
      ? supabase
          .from('submissions')
          .select('id,user_id,status,assignments!inner(day_number,cohort_id,title)')
          .eq('assignments.cohort_id', cohortId)
          .eq('assignments.day_number', daySched.day_number)
          .neq('status', 'graded')
          .limit(8)
      : Promise.resolve({ data: [] }),
  ]);

  if (!myStudentIds.length) {
    return attachStreamDisplayNames({
      daySched,
      subs: [],
      stuck: [],
      attendance: null,
      hasPod: !!podIds.length,
      stuckCohort: stuckCohortRes.data || [],
      ungraded: ungradedRes.data || [],
    });
  }

  const [subsRes, stuckRes, attRes] = await Promise.all([
    supabase
      .from('submissions')
      .select('id,user_id,submitted_at,status,assignments!inner(day_number,cohort_id,title)')
      .in('user_id', myStudentIds)
      .eq('assignments.cohort_id', cohortId)
      .gte('submitted_at', startIso)
      .order('submitted_at', { ascending: false }),
    supabase
      .from('stuck_queue')
      .select('id,user_id,day_number,message,created_at,status')
      .in('user_id', myStudentIds)
      .eq('cohort_id', cohortId)
      .neq('status', 'resolved'),
    daySched
      ? supabase
          .from('attendance')
          .select('user_id,checked_in_at')
          .in('user_id', myStudentIds)
          .eq('cohort_id', cohortId)
          .eq('day_number', daySched.day_number)
      : Promise.resolve({ data: [] }),
  ]);

  const present = (attRes.data || []).filter((a) => a.checked_in_at).length;
  const total = myStudentIds.length;
  return attachStreamDisplayNames({
    daySched,
    subs: subsRes.data || [],
    stuck: stuckRes.data || [],
    attendance: daySched ? { present, total, unmarked: total - present } : null,
    hasPod: true,
    stuckCohort: stuckCohortRes.data || [],
    ungraded: ungradedRes.data || [],
  });
}

export async function renderStream(ctx) {
  const { state, container } = ctx;
  if (!state.cohortId) {
    container.innerHTML = '<div class="empty-state">Pick a cohort above.</div>';
    return;
  }
  container.innerHTML = '<div class="empty-state">Loading…</div>';
  const data = await loadStream(state.cohortId, state.user.id, !!state.isAdmin);
  container.innerHTML = tpl(data);
  const showCharts =
    (data.attendance && data.attendance.total > 0) || data.subs.length > 0 || data.stuck.length > 0;
  if (!showCharts) return;
  try {
    const attCanvas = container.querySelector('#facChartTodayAtt');
    if (attCanvas && data.attendance && data.attendance.total > 0) {
      const c = facultyChartColors();
      await facultyDoughnutChart(attCanvas, {
        labels: ['Checked in', 'Not yet'],
        values: [data.attendance.present, data.attendance.unmarked],
        colors: [`${c.accent}cc`, `${c.line}cc`],
      });
    }
    const actCanvas = container.querySelector('#facChartTodayAct');
    if (actCanvas) {
      await facultyVBarChart(actCanvas, {
        labels: ["Today's submissions", 'Open stuck'],
        values: [data.subs.length, data.stuck.length],
        label: 'Count',
      });
    }
  } catch (e) {
    console.warn('Stream charts', e);
  }
}

function tpl({ daySched, subs, stuck, attendance, hasPod, stuckCohort, ungraded, nameByUser }) {
  const nm = nameByUser || new Map();
  const who = (uid) => esc(streamPersonLabel(nm, uid));
  const showCharts =
    (attendance && attendance.total > 0) || subs.length > 0 || stuck.length > 0;
  const glance = showCharts
    ? `<section class="add-card" style="padding:14px 16px;margin-bottom:14px">
      <h3 style="margin:0 0 10px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)">Today at a glance</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;align-items:stretch">
        <div style="min-height:190px;position:relative">
          ${
            attendance && attendance.total > 0
              ? '<canvas id="facChartTodayAtt" aria-label="Attendance split"></canvas>'
              : '<div class="muted" style="padding:28px 10px;font-size:12.5px;line-height:1.45">No attendance snapshot today (no scheduled day or empty pod roster).</div>'
          }
        </div>
        <div style="height:190px;position:relative"><canvas id="facChartTodayAct" aria-label="Submissions and stuck"></canvas></div>
      </div>
    </section>`
    : '';

  const stuckCohortBlock =
    stuckCohort && stuckCohort.length
      ? `<section class="add-card" style="padding:14px 16px;margin-bottom:14px">
      <h3 style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)">Stuck now (cohort)</h3>
      <ul style="margin:0;padding:0;list-style:none;font-size:13px">
        ${stuckCohort
          .map(
            (s) =>
              `<li style="margin-bottom:8px"><b>${who(s.user_id)}</b> · day ${esc(String(s.day_number ?? '—'))} · ${esc(s.status)} · ${new Date(s.created_at).toLocaleTimeString()}${s.message ? ` — ${esc(String(s.message).slice(0, 72))}` : ''}</li>`,
          )
          .join('')}
      </ul>
      <a href="admin-stuck.html" style="color:var(--accent);font-size:13px">Open stuck queue →</a>
    </section>`
      : '';

  const ungradedBlock =
    ungraded && ungraded.length && daySched
      ? `<section class="add-card" style="padding:14px 16px;margin-bottom:14px">
      <h3 style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)">Needs grading · Day ${esc(String(daySched.day_number))}</h3>
      <ul style="margin:0;padding:0;list-style:none;font-size:13px">
        ${ungraded
          .map(
            (s) =>
              `<li style="margin-bottom:8px"><a href="admin-student.html?u=${esc(s.user_id)}" style="color:var(--accent)">${who(s.user_id)}</a> · ${esc(s.status || '—')} · ${esc(s.assignments?.title || '')}</li>`,
          )
          .join('')}
      </ul>
      <a href="admin-student.html" style="color:var(--accent);font-size:13px">Student work →</a>
    </section>`
      : daySched
        ? `<section class="add-card" style="padding:14px 16px;margin-bottom:14px"><span class="muted">No ungraded submissions for today's assignment.</span> <a href="admin-student.html" style="color:var(--accent);font-size:13px">Student work →</a></section>`
        : '';

  const day = daySched
    ? `<div><b>Day ${esc(String(daySched.day_number))}</b>${daySched.title ? ' · ' + esc(daySched.title) : ''} · ${daySched.live_session_at ? esc(new Date(daySched.live_session_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })) : 'time TBD'} · ${daySched.meet_link ? `<a href="${esc(daySched.meet_link)}" target="_blank" rel="noopener">Meet link →</a>` : '<span class="muted">no Meet link</span>'}</div>`
    : `<div class="muted">No day scheduled for today.</div>`;

  const att = attendance
    ? `<div style="margin-top:8px">Attendance: <b>${attendance.present}</b> present · <b>${attendance.unmarked}</b> unmarked · ${attendance.total} total in your pod</div>`
    : '';

  const noPodNote = hasPod
    ? ''
    : `<div class="muted" style="margin-top:8px;font-size:12.5px">You're not assigned as faculty on any pod in this cohort yet.</div>`;

  return `
    ${stuckCohortBlock}
    ${ungradedBlock}
    ${glance}
    <section class="add-card">${day}${att}${noPodNote}</section>

    <section class="add-card">
      <h3 style="margin:0 0 8px">Before class</h3>
      <ul style="margin:0 0 12px"><li>Skim today's lesson content (student-facing day page).</li><li>Preview the <a href="faculty.html#schedule" style="color:var(--accent)">Schedule</a> and Today for stuck signals.</li><li>Confirm lab machines/projector/audio with venue staff.</li></ul>
      <h3 style="margin:0 0 8px">During class</h3>
      <ul style="margin:0 0 12px"><li>Keep students aligned with the remote trainer's objective.</li><li>Monitor the stuck queue (${stuck.length} open from your pod) and <a href="admin-stuck.html" style="color:var(--accent)">triage</a>.</li><li>Unblock setup and access issues first; escalate concept gaps to the trainer.</li></ul>
      <h3 style="margin:0 0 8px">After class</h3>
      <ul style="margin:0"><li>Close the loop on stuck items you own.</li><li>Flag grading or rubric questions to the program trainer.</li><li>Optional: nudge your pod on prep for the next session.</li></ul>
    </section>

    <section class="add-card">
      <h3 style="margin:0 0 8px">Today's submissions from your pod (${subs.length})</h3>
      ${subs.length ? `<ul style="margin:0">${subs.map((s) => `<li>${who(s.user_id)} · day ${s.assignments?.day_number ?? '—'} · ${esc(s.status || 'submitted')} · ${new Date(s.submitted_at).toLocaleTimeString()}</li>`).join('')}</ul>` : '<div class="muted">None yet.</div>'}

      <h3 style="margin:14px 0 8px">Open stuck items — your pod (${stuck.length})</h3>
      ${stuck.length ? `<ul style="margin:0">${stuck.map((s) => `<li>${who(s.user_id)} · day ${s.day_number ?? '—'} · ${new Date(s.created_at).toLocaleTimeString()} · ${esc(s.status)}${s.message ? ' — ' + esc(String(s.message).slice(0, 80)) : ''}</li>`).join('')}</ul>` : '<div class="muted">Clear.</div>'}
    </section>`;
}
