// Stuck + in-room attendance summary (faculty hub; no admin-attendance for support-only — use lesson page check-in).

import { supabase } from '../supabase.js';

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const pad = (n) => String(n).padStart(2, '0');

/**
 * @param {object} ctx
 * @param {{ user: object, cohortId: string, role?: string }} ctx.state
 * @param {HTMLElement} ctx.container
 */
export async function renderStuckAttendance({ state, container }) {
  if (!state?.cohortId) {
    container.innerHTML = '<div class="empty-state">Pick a cohort above.</div>';
    return;
  }
  const cohortId = state.cohortId;
  const uid = state.user.id;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const [{ data: myPods }, { data: cdays }, { count: cohortStuckN }] = await Promise.all([
    supabase
      .from('pod_faculty')
      .select('pod_id,cohort_pods!inner(cohort_id)')
      .eq('faculty_user_id', uid)
      .eq('cohort_pods.cohort_id', cohortId),
    supabase.from('cohort_days').select('day_number,live_session_at,title').eq('cohort_id', cohortId).order('day_number'),
    supabase
      .from('stuck_queue')
      .select('*', { count: 'exact', head: true })
      .eq('cohort_id', cohortId)
      .neq('status', 'resolved'),
  ]);
  const podIds = (myPods || []).map((p) => p.pod_id);
  let myStudentIds = [];
  if (podIds.length) {
    const { data: members } = await supabase.from('pod_members').select('student_user_id').in('pod_id', podIds);
    myStudentIds = [...new Set((members || []).map((m) => m.student_user_id))];
  }
  let nPod = 0;
  if (myStudentIds.length) {
    const { count } = await supabase
      .from('stuck_queue')
      .select('*', { count: 'exact', head: true })
      .in('user_id', myStudentIds)
      .eq('cohort_id', cohortId)
      .neq('status', 'resolved');
    nPod = Number(count) || 0;
  }

  const cday = (cdays || []).find(
    (d) => d.live_session_at && new Date(d.live_session_at) >= todayStart && new Date(d.live_session_at) < todayEnd,
  );
  const sessAt = cday?.live_session_at ? new Date(cday.live_session_at) : null;
  const inRoom =
    cday && sessAt ? Math.abs(sessAt - now) / 3600000 <= 2 : false;

  const nCohort = Number(cohortStuckN) || 0;

  const lessonHref = cday ? `day.html?n=${cday.day_number}` : 'day.html';

  container.innerHTML = `
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;">
    <section class="add-card" style="padding:14px 16px">
      <div class="kicker" style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)">Stuck</div>
      <h3 style="margin:8px 0 4px;font-size:15px">Triage & queue</h3>
      <p class="muted" style="font-size:13px;line-height:1.5;margin:0 0 10px">
        <strong>${nPod}</strong> open in your pod scope · <strong>${nCohort}</strong> cohort-wide
      </p>
      <a class="btn-sm" href="admin-stuck.html" style="text-decoration:none;display:inline-block">Open stuck queue</a>
    </section>
    <section class="add-card" style="padding:14px 16px">
      <div class="kicker" style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)">In-room</div>
      <h3 style="margin:8px 0 4px;font-size:15px">Check-in &amp; session</h3>
      ${
        cday && sessAt
          ? `<p class="muted" style="font-size:13px;margin:0 0 6px">Today · Day ${pad(
              cday.day_number,
            )} · ${esc(sessAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }))}</p>
           <p class="muted" style="font-size:12.5px;line-height:1.5;margin:0 0 10px">
            Students use the <strong>lesson page</strong> to check in. Nudge from the room; trainers manage exports in Admin.
          </p>
           <a class="btn-pill" href="${lessonHref}" style="text-decoration:none;${!inRoom ? 'opacity:0.85' : ''}">Open today’s lesson</a>
           ${
             !inRoom
               ? '<p class="muted" style="font-size:12px;margin:10px 0 0">Check-in and attendance visibility peak within ~2h of the live session start.</p>'
               : ''
           }`
          : '<p class="muted" style="font-size:13px;line-height:1.5">No live session on the calendar for today. Use <a href="admin-schedule.html" style="color:var(--accent)">Schedule</a> to confirm the cohort plan.</p>'
      }
    </section>
  </div>`;
}
