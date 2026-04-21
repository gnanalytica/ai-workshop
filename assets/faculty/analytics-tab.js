// Analytics tab: Pods vs Faculty toggle, simple bar tables.

import { loadPodAnalytics, loadFacultyAnalytics } from './analytics.js';

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);}

function pctBar(pct) {
  const p = Math.max(0, Math.min(100, Number(pct) || 0));
  return `<div style="display:flex;align-items:center;gap:6px;min-width:160px">
    <div style="flex:1;height:6px;border-radius:3px;background:var(--line)"><div style="height:100%;width:${p}%;background:var(--accent);border-radius:3px"></div></div>
    <span style="font-size:11.5px;color:var(--muted);min-width:40px;text-align:right">${p.toFixed(0)}%</span>
  </div>`;
}

function barTable(headers, rows) {
  return `<div class="add-card" style="padding:10px 14px"><div style="overflow-x:auto">
    <table>
      <thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c == null ? '—' : c}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${headers.length}" class="muted" style="padding:10px">No data.</td></tr>`}</tbody>
    </table></div></div>`;
}

export async function renderAnalytics({ state, container }) {
  if (!state.cohortId) { container.innerHTML = '<div class="empty-state">Pick a cohort.</div>'; return; }
  container.innerHTML = `
    <div style="display:flex;gap:6px;margin-bottom:14px">
      <button class="btn-sm active" data-view="pods">Pods</button>
      <button class="btn-sm" data-view="faculty">Faculty</button>
    </div>
    <div id="analyticsBody"><div class="empty-state">Loading…</div></div>`;

  async function showPods() {
    const rows = await loadPodAnalytics(state.cohortId);
    document.getElementById('analyticsBody').innerHTML = barTable(
      ['Pod', 'Students', 'Avg % complete', 'Avg attendance', 'At-risk', 'Graded', 'Pending'],
      rows.map(r => [
        esc(r.pod.name),
        r.students,
        pctBar(r.avgPct),
        (r.attendanceAvg || 0).toFixed(1),
        r.atRisk,
        r.subsGraded,
        r.subsPending,
      ])
    );
  }

  async function showFaculty() {
    const rows = await loadFacultyAnalytics(state.cohortId);
    document.getElementById('analyticsBody').innerHTML = barTable(
      ['Faculty', 'Mentored', 'Avg % complete', 'Students graded (sum)', 'Handoffs in/out'],
      rows.map(r => [
        esc(r.faculty.full_name || r.faculty.id),
        r.studentsMentored,
        pctBar(r.avgPct),
        r.gradedCount,
        `${r.handoffsIn} / ${r.handoffsOut}`,
      ])
    );
  }

  container.querySelectorAll('button[data-view]').forEach(b => {
    b.addEventListener('click', () => {
      container.querySelectorAll('button[data-view]').forEach(x => x.classList.toggle('active', x === b));
      if (b.dataset.view === 'pods') showPods(); else showFaculty();
    });
  });
  showPods();
}
