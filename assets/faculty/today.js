// Today tab — cohort_days context + live pod signals.
// Schema notes:
// - cohort_days(cohort_id, day_number, live_session_at, meet_link, title, is_unlocked)
//   "today" = date(live_session_at) == current_date. The column for title
//   may be `title` — adjusted if staging uses a different name.
// - submissions has no direct cohort_id; join via assignments.
// - attendance: presence = checked_in_at is not null; no `status` column.
// - stuck_queue status 'pending' | 'helping' | 'resolved' (open = not resolved).

import { supabase } from '../supabase.js';
import { facultyDoughnutChart, facultyVBarChart, facultyChartColors } from './chart-kit.js';

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);}

function todayStartIso() {
  const d = new Date(); d.setHours(0,0,0,0); return d.toISOString();
}
function todayEndIso() {
  const d = new Date(); d.setHours(23,59,59,999); return d.toISOString();
}

async function loadToday(cohortId, userId) {
  const startIso = todayStartIso();
  const endIso = todayEndIso();

  // Today's cohort_day (match by calendar date of live_session_at).
  const { data: daysAll } = await supabase
    .from('cohort_days')
    .select('day_number,live_session_at,meet_link,title,notes')
    .eq('cohort_id', cohortId);
  const daySched = (daysAll || []).find(d => {
    if (!d.live_session_at) return false;
    const t = new Date(d.live_session_at);
    return t >= new Date(startIso) && t <= new Date(endIso);
  }) || null;

  // My pods + student ids in this cohort.
  const { data: myPods } = await supabase.from('pod_faculty')
    .select('pod_id,cohort_pods!inner(id,name,cohort_id)')
    .eq('faculty_user_id', userId)
    .eq('cohort_pods.cohort_id', cohortId);
  const podIds = (myPods || []).map(p => p.pod_id);

  let myStudentIds = [];
  if (podIds.length) {
    const { data: members } = await supabase.from('pod_members')
      .select('student_user_id').in('pod_id', podIds);
    myStudentIds = [...new Set((members || []).map(m => m.student_user_id))];
  }

  if (!myStudentIds.length) {
    return { daySched, subs: [], stuck: [], attendance: null, hasPod: !!podIds.length };
  }

  // Today's submissions from my pod (join assignments for cohort_id).
  const [subsRes, stuckRes, attRes] = await Promise.all([
    supabase.from('submissions')
      .select('id,user_id,submitted_at,status,assignments!inner(day_number,cohort_id,title)')
      .in('user_id', myStudentIds)
      .eq('assignments.cohort_id', cohortId)
      .gte('submitted_at', startIso)
      .order('submitted_at', { ascending: false }),
    supabase.from('stuck_queue')
      .select('id,user_id,day_number,message,created_at,status')
      .in('user_id', myStudentIds)
      .eq('cohort_id', cohortId)
      .neq('status', 'resolved'),
    daySched ? supabase.from('attendance')
      .select('user_id,checked_in_at')
      .in('user_id', myStudentIds)
      .eq('cohort_id', cohortId)
      .eq('day_number', daySched.day_number) : Promise.resolve({ data: [] }),
  ]);

  const present = (attRes.data || []).filter(a => a.checked_in_at).length;
  const total = myStudentIds.length;
  return {
    daySched,
    subs: subsRes.data || [],
    stuck: stuckRes.data || [],
    attendance: daySched ? { present, total, unmarked: total - present } : null,
    hasPod: true,
  };
}

export async function renderToday(ctx) {
  const { state, container } = ctx;
  if (!state.cohortId) { container.innerHTML = '<div class="empty-state">Pick a cohort above.</div>'; return; }
  container.innerHTML = '<div class="empty-state">Loading…</div>';
  const data = await loadToday(state.cohortId, state.user.id);
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
    console.warn('Today charts', e);
  }
}

function tpl({ daySched, subs, stuck, attendance, hasPod }) {
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

  const day = daySched
    ? `<div><b>Day ${esc(String(daySched.day_number))}</b>${daySched.title ? ' · ' + esc(daySched.title) : ''} · ${daySched.live_session_at ? esc(new Date(daySched.live_session_at).toLocaleTimeString([], { hour:'numeric', minute:'2-digit' })) : 'time TBD'} · ${daySched.meet_link ? `<a href="${esc(daySched.meet_link)}" target="_blank" rel="noopener">Meet link →</a>` : '<span class="muted">no Meet link</span>'}</div>`
    : `<div class="muted">No day scheduled for today.</div>`;

  const att = attendance
    ? `<div style="margin-top:8px">Attendance: <b>${attendance.present}</b> present · <b>${attendance.unmarked}</b> unmarked · ${attendance.total} total in your pod</div>`
    : '';

  const noPodNote = hasPod ? '' : `<div class="muted" style="margin-top:8px;font-size:12.5px">You're not assigned as faculty on any pod in this cohort yet.</div>`;

  return `
    ${glance}
    <section class="add-card">${day}${att}${noPodNote}</section>

    <section class="add-card">
      <h3 style="margin:0 0 8px">Before class</h3>
      <ul style="margin:0 0 12px"><li>Skim today's lesson content.</li><li>Review at-risk students in your pod.</li><li>Queue today's polls from the agenda.</li></ul>
      <h3 style="margin:0 0 8px">During class</h3>
      <ul style="margin:0 0 12px"><li>Monitor the stuck queue (${stuck.length} open from your pod).</li><li>Launch polls at the marked moments.</li><li>Run breakouts / pairs.</li></ul>
      <h3 style="margin:0 0 8px">After class</h3>
      <ul style="margin:0"><li>Reply to open stuck items.</li><li>Grade pending submissions.</li><li>Post a recap for your pod (optional).</li></ul>
    </section>

    <section class="add-card">
      <h3 style="margin:0 0 8px">Today's submissions from your pod (${subs.length})</h3>
      ${subs.length ? `<ul style="margin:0">${subs.map(s => `<li>${esc(s.user_id.slice(0,8))} · day ${s.assignments?.day_number ?? '—'} · ${esc(s.status || 'submitted')} · ${new Date(s.submitted_at).toLocaleTimeString()}</li>`).join('')}</ul>` : '<div class="muted">None yet.</div>'}

      <h3 style="margin:14px 0 8px">Open stuck items (${stuck.length})</h3>
      ${stuck.length ? `<ul style="margin:0">${stuck.map(s => `<li>${esc(s.user_id.slice(0,8))} · day ${s.day_number ?? '—'} · ${new Date(s.created_at).toLocaleTimeString()} · ${esc(s.status)}${s.message ? ' — ' + esc(String(s.message).slice(0,80)) : ''}</li>`).join('')}</ul>` : '<div class="muted">Clear.</div>'}
    </section>`;
}
