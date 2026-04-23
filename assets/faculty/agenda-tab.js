import { supabase } from '../supabase.js';

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmtDT(v) {
  if (!v) return 'TBD';
  return new Date(v).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function dayStart(v) {
  const d = new Date(v);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export async function renderAgenda({ state, container }) {
  if (!state.cohortId) {
    container.innerHTML = '<div class="empty-state">Pick a cohort.</div>';
    return;
  }
  container.innerHTML = '<div class="empty-state">Loading…</div>';
  const [daysRes, asgRes] = await Promise.all([
    supabase
      .from('cohort_days')
      .select('day_number,title,live_session_at,meet_link,is_unlocked')
      .eq('cohort_id', state.cohortId)
      .order('day_number'),
    supabase
      .from('assignments')
      .select('id,day_number,title,due_at,points')
      .eq('cohort_id', state.cohortId)
      .order('day_number'),
  ]);
  const days = daysRes.data || [];
  const assignments = asgRes.data || [];
  const byDay = new Map();
  assignments.forEach((a) => {
    if (!byDay.has(a.day_number)) byDay.set(a.day_number, []);
    byDay.get(a.day_number).push(a);
  });

  const now = Date.now();
  const nextLive = days
    .filter((d) => d.live_session_at && new Date(d.live_session_at).getTime() >= now)
    .sort((a, b) => new Date(a.live_session_at) - new Date(b.live_session_at))[0];
  const nextDeadlines = assignments
    .filter((a) => a.due_at && new Date(a.due_at).getTime() >= now)
    .sort((a, b) => new Date(a.due_at) - new Date(b.due_at))
    .slice(0, 6);

  container.innerHTML = `
    <section class="add-card" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">
      <div>
        <div class="muted" style="font-size:11px;letter-spacing:.12em;text-transform:uppercase">Next live session</div>
        <div style="margin-top:6px;font-size:14px">${nextLive ? `Day ${esc(nextLive.day_number)} · ${esc(nextLive.title || 'Session')}` : 'None scheduled'}</div>
        <div class="muted" style="font-size:12px;margin-top:4px">${nextLive ? esc(fmtDT(nextLive.live_session_at)) : '—'}</div>
      </div>
      <div>
        <div class="muted" style="font-size:11px;letter-spacing:.12em;text-transform:uppercase">Upcoming deadlines</div>
        <div style="margin-top:6px;font-size:22px;font-weight:700">${nextDeadlines.length}</div>
        <div class="muted" style="font-size:12px;margin-top:4px">Next 6 assignment due dates</div>
      </div>
    </section>
    <section class="add-card" style="padding:0;overflow:hidden">
      <div style="padding:14px 16px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap">
        <h3 style="margin:0;font-size:15px">Weekly agenda timeline</h3>
        <a href="admin-schedule.html" style="color:var(--accent);font-size:13px">Open schedule editor →</a>
      </div>
      <div style="display:flex;flex-direction:column">
        ${days.map((d) => {
          const liveTs = d.live_session_at ? new Date(d.live_session_at).getTime() : 0;
          const liveSoon = liveTs && Math.abs(liveTs - now) < 12 * 3600 * 1000;
          const dayAssignments = byDay.get(d.day_number) || [];
          const hasDueToday = dayAssignments.some((a) => a.due_at && dayStart(a.due_at) === dayStart(now));
          return `<article style="padding:14px 16px;border-bottom:1px solid var(--line)">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap">
              <div>
                <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);letter-spacing:.12em">DAY ${String(d.day_number).padStart(2, '0')}</div>
                <div style="font-size:14px;font-weight:600;margin-top:2px">${esc(d.title || 'Lesson')}</div>
              </div>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                <span class="kicker-tag ${d.is_unlocked ? '' : 'warn'}">${d.is_unlocked ? 'Unlocked' : 'Locked'}</span>
                ${liveSoon ? '<span class="kicker-tag ta">Live soon</span>' : ''}
                ${hasDueToday ? '<span class="kicker-tag lead">Due today</span>' : ''}
              </div>
            </div>
            <div class="muted" style="font-size:12.5px;margin-top:6px">Live: ${esc(fmtDT(d.live_session_at))}</div>
            ${dayAssignments.length
              ? `<ul style="margin:8px 0 0;padding-left:18px;font-size:13px">${dayAssignments
                  .map((a) => `<li>${esc(a.title || 'Assignment')} · due ${esc(fmtDT(a.due_at))}</li>`)
                  .join('')}</ul>`
              : '<div class="muted" style="font-size:12.5px;margin-top:8px">No assignment mapped.</div>'}
            <div style="margin-top:8px;display:flex;gap:10px;flex-wrap:wrap">
              <a href="day.html?n=${d.day_number}" style="font-size:13px;color:var(--accent)">Open lesson →</a>
              ${d.meet_link ? `<a href="${esc(d.meet_link)}" target="_blank" rel="noopener" style="font-size:13px;color:var(--accent)">Join session →</a>` : ''}
            </div>
          </article>`;
        }).join('')}
      </div>
    </section>`;
}
