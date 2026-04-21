// "Whole cohort" tab — all confirmed students in the cohort with signals.

import { supabase } from '../supabase.js';
import { loadEnrolledStudents } from '../pods.js';
import { loadStudentSignals } from './signals.js';
import { renderStudentRow } from './student-row.js';
import { openDrawer } from '../student-drawer.js';
import { facultyDoughnutChart, facultyVBarChart, facultyChartColors } from './chart-kit.js';

export async function renderCohort({ state, container }) {
  if (!state.cohortId) { container.innerHTML = '<div class="empty-state">Pick a cohort.</div>'; return; }
  container.innerHTML = '<div class="empty-state">Loading…</div>';

  const profs = await loadEnrolledStudents(state.cohortId);
  const ids = profs.map((p) => p.id);

  // Which of these are in the viewing faculty's pods?
  const { data: myPods } = await supabase.from('pod_faculty')
    .select('pod_id,cohort_pods!inner(cohort_id)')
    .eq('faculty_user_id', state.user.id)
    .eq('cohort_pods.cohort_id', state.cohortId);
  const myPodIds = (myPods || []).map(p => p.pod_id);
  let mineSet = new Set();
  if (myPodIds.length) {
    const { data: myMembers } = await supabase.from('pod_members')
      .select('student_user_id').in('pod_id', myPodIds);
    mineSet = new Set((myMembers || []).map(m => m.student_user_id));
  }

  const signals = await loadStudentSignals(state.cohortId, ids);

  const buckets = [0, 0, 0, 0, 0];
  let atRisk = 0;
  let ok = 0;
  for (const p of profs) {
    const s = signals.get(p.id);
    const pct = s && s.daysTotal ? (s.daysDone / s.daysTotal) * 100 : 0;
    const bi = Math.min(4, Math.floor(pct / 20));
    buckets[bi]++;
    if (s?.atRisk) atRisk++;
    else ok++;
  }

  const findBar =
    profs.length > 0
      ? `<div class="add-card" style="padding:10px 14px;margin-bottom:12px">
      <label class="sr-only" for="cohortStudentFind">Filter students</label>
      <input type="search" id="cohortStudentFind" placeholder="Filter students by name, college, or id…" autocomplete="off"
        style="width:100%;max-width:420px;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:var(--input-bg);color:var(--ink);font-family:inherit;font-size:13px;outline:none" />
    </div>`
      : '';

  const snapshot =
    profs.length > 0
      ? `<div class="add-card" style="padding:14px 16px;margin-bottom:14px">
      <h3 style="margin:0 0 12px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)">Cohort snapshot</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px">
        <div>
          <div class="muted" style="font-size:12px;margin-bottom:6px">Lab completion (approx. % of days)</div>
          <div style="height:220px;position:relative"><canvas id="facChartCohortPct" aria-label="Completion distribution"></canvas></div>
        </div>
        <div>
          <div class="muted" style="font-size:12px;margin-bottom:6px">At-risk heuristic</div>
          <div style="height:220px;position:relative"><canvas id="facChartCohortRisk" aria-label="At-risk vs on track"></canvas></div>
        </div>
      </div>
    </div>`
      : '';

  container.innerHTML = `
    ${findBar}
    ${snapshot}
    <div class="add-card" style="padding:10px 14px">
      <div style="overflow-x:auto">
        <table>
          <thead><tr><th>Name</th><th>Progress</th><th>Subs</th><th>Att</th><th>Stuck</th><th>Peer</th><th>Last</th><th>Risk</th><th></th></tr></thead>
          <tbody>${profs.map(p => renderStudentRow(p, signals.get(p.id), { tagMine: mineSet.has(p.id) })).join('') || '<tr><td colspan="9" class="muted" style="padding:10px">No enrolled students.</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;

  const findIn = container.querySelector('#cohortStudentFind');
  if (findIn) {
    findIn.addEventListener('input', () => {
      const q = findIn.value.trim().toLowerCase();
      container.querySelectorAll('tbody tr[data-find]').forEach((tr) => {
        tr.style.display = !q || (tr.dataset.find || '').includes(q) ? '' : 'none';
      });
    });
  }

  if (profs.length) {
    try {
      const pctLabels = ['0–20%', '20–40%', '40–60%', '60–80%', '80–100%'];
      await facultyVBarChart(container.querySelector('#facChartCohortPct'), {
        labels: pctLabels,
        values: buckets,
        label: 'Students',
      });
      const c = facultyChartColors();
      await facultyDoughnutChart(container.querySelector('#facChartCohortRisk'), {
        labels: ['On track', 'Flagged at-risk'],
        values: [ok, atRisk],
        colors: [`${c.accent4}cc`, `${c.accent3}cc`],
      });
    } catch (e) {
      console.warn('Cohort charts', e);
    }
  }

  container.querySelectorAll('button[data-open-drawer]').forEach(b => {
    b.addEventListener('click', () => openDrawer(b.dataset.openDrawer, { cohortId: state.cohortId }));
  });
}
