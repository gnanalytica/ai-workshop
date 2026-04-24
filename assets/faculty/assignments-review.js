// "This week" assignments — links to lesson pages (not admin-student; faculty are support-only on this hub).

import { supabase } from '../supabase.js';

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const pad = (n) => String(n).padStart(2, '0');

function relDue(v) {
  if (!v) return '—';
  const ms = new Date(v) - new Date();
  const d = Math.round(ms / 86400000);
  if (d < 0) return `${Math.abs(d)}d overdue`;
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  return `In ${d}d`;
}

/**
 * @param {object} ctx
 * @param {{ user: object, cohortId: string }} ctx.state
 * @param {HTMLElement} ctx.container
 * @param {string[]} [ctx.memberIds] - optional; if omitted, pod/cohort resolution matches faculty hub
 */
export async function renderAssignmentStrip({ state, container, memberIds: preMemberIds }) {
  if (!state?.cohortId) {
    container.innerHTML = '<div class="empty-state">Pick a cohort above.</div>';
    return;
  }
  const cohortId = state.cohortId;
  const uid = state.user.id;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekEnd = new Date(todayStart.getTime() + 7 * 86400000);

  const { data: assignments } = await supabase
    .from('assignments')
    .select('id,day_number,title,due_at,cohort_id')
    .eq('cohort_id', cohortId)
    .order('due_at', { ascending: true });

  let memberIds = preMemberIds;
  if (!Array.isArray(memberIds)) {
    const { data: myPods } = await supabase
      .from('pod_faculty')
      .select('pod_id,cohort_pods!inner(cohort_id)')
      .eq('faculty_user_id', uid)
      .eq('cohort_pods.cohort_id', cohortId);
    const podIds = (myPods || []).map((p) => p.pod_id);
    if (podIds.length) {
      const { data: members } = await supabase.from('pod_members').select('student_user_id').in('pod_id', podIds);
      memberIds = [...new Set((members || []).map((m) => m.student_user_id))];
    } else {
      const { data: regs } = await supabase
        .from('registrations')
        .select('user_id')
        .eq('cohort_id', cohortId)
        .eq('status', 'confirmed');
      memberIds = [...new Set((regs || []).map((r) => r.user_id).filter(Boolean))];
    }
  }

  const upcoming = (assignments || []).filter((a) => {
    if (!a.due_at) return false;
    const d = new Date(a.due_at);
    return d >= todayStart && d <= weekEnd;
  });

  if (!upcoming.length) {
    container.innerHTML = `<div class="add-card" style="padding:14px 16px">
      <h3 style="margin:0 0 4px;font-size:15px">Assignments due (7 days)</h3>
      <p class="muted" style="font-size:13px;margin:0">Nothing due in the next 7 days.</p>
    </div>`;
    return;
  }

  const ids = upcoming.map((a) => a.id);
  const subQ = supabase
    .from('submissions')
    .select('assignment_id,user_id')
    .in('assignment_id', ids)
    .in('user_id', memberIds.length ? memberIds : ['00000000-0000-0000-0000-000000000000']);

  container.innerHTML = `<div class="add-card" style="padding:14px 16px">
    <h3 style="margin:0 0 4px;font-size:15px">Assignments due (7 days)</h3>
    <p class="muted" style="font-size:12px;margin:0 0 10px">Open the lesson to align with the remote trainer. Grading is handled by program trainers.</p>
    <div style="overflow-x:auto"><table>
      <thead><tr><th>Day</th><th>Title</th><th>Due</th><th>Submitted (scope)</th><th></th></tr></thead>
      <tbody id="facAsgnBody"></tbody>
    </table></div>
  </div>`;
  const tbody = container.querySelector('#facAsgnBody');
  tbody.innerHTML = upcoming
    .map(
      (a) => `<tr>
    <td style="font-family:'JetBrains Mono',monospace;font-weight:600">Day ${pad(a.day_number || 0)}</td>
    <td>${esc(a.title || '—')}</td>
    <td class="muted">${esc(relDue(a.due_at))}</td>
    <td class="progress-cell" data-asgn="${a.id}">…</td>
    <td style="text-align:right"><a class="btn-sm" href="day.html?n=${a.day_number || 1}">Open lesson</a></td>
  </tr>`,
    )
    .join('');

  const { data } = await subQ;
  const subBy = new Map();
  (data || []).forEach((s) => {
    if (!subBy.has(s.assignment_id)) subBy.set(s.assignment_id, new Set());
    subBy.get(s.assignment_id).add(s.user_id);
  });
  const total = memberIds.length || 0;
  upcoming.forEach((a) => {
    const cell = container.querySelector(`[data-asgn="${a.id}"]`);
    if (cell) {
      const n = subBy.get(a.id)?.size || 0;
      cell.textContent = total ? `${n}/${total}` : '—';
    }
  });
}
