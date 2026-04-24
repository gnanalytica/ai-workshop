// Staff shortcuts for the faculty hub (read-only / triage; trainers are redirected off this page).

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/**
 * @param {object} ctx
 * @param {{ cohortId: string | null, cohorts?: { id: string, name: string }[] }} ctx.state
 * @param {HTMLElement} ctx.container
 */
export function renderFacultyActionStrip({ state, container }) {
  const cname = (state.cohorts || []).find((c) => c.id === state.cohortId)?.name || 'this cohort';

  const cards = [
    {
      href: 'admin-stuck.html',
      t: 'Stuck queue',
      s: 'Triage in-room blockers. Same cohort filters apply.',
    },
    {
      href: 'admin-schedule.html',
      t: 'Cohort schedule',
      s: 'View session times, Meet links, and day order.',
    },
    {
      href: 'admin-milestones.html',
      t: 'Capstone',
      s: 'Team and student capstone view.',
    },
    { href: 'board.html', t: 'Community board', s: 'Post with tag <code>setup</code> for lab issues.' },
    { href: '#faculty-handbook', t: 'Program handbook', s: 'Embedded below—triage, contacts, checklist.' },
    { href: '#lab-setup', t: 'Lab setup guide', s: 'Embedded below—public install steps.' },
  ];

  container.innerHTML = `
  <div class="fac-action-strip" style="margin:0 0 18px">
    <div class="kicker" style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:8px">Cohort</div>
    <p class="muted" style="font-size:13px;margin:0 0 12px;line-height:1.5">Cohort: <strong>${esc(cname)}</strong>. Grading and full admin live on the admin app; use these for triage, schedule, and in-room reference.</p>
    <div class="fac-action-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">
      ${cards
        .map(
          (c) => `
        <a href="${esc(c.href)}" class="fac-action-card" style="display:block;text-decoration:none;color:inherit;border:1px solid var(--line);border-radius:12px;padding:12px 14px;background:var(--input-bg)">
          <b style="font-size:13px">${esc(c.t)}</b>
          <div class="muted" style="font-size:12px;margin-top:4px;line-height:1.4">${c.s}</div>
        </a>`,
        )
        .join('')}
    </div>
  </div>`;
}
