// Analytics tab: Pods vs Faculty toggle, charts + tables.

import { loadPodAnalytics, loadFacultyAnalytics } from './analytics.js';
import { facultyHBarChart, facultyVBarChart } from './chart-kit.js';

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
    const body = document.getElementById('analyticsBody');
    const chartsBlock =
      rows.length > 0
        ? `<div class="add-card" style="padding:14px 16px;margin-bottom:14px">
        <h3 style="margin:0 0 12px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)">Visual overview</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px">
          <div>
            <div class="muted" style="font-size:12px;margin-bottom:6px">Avg % complete by pod</div>
            <div style="height:220px;position:relative"><canvas id="facChartPodAvg" aria-label="Average completion by pod"></canvas></div>
          </div>
          <div>
            <div class="muted" style="font-size:12px;margin-bottom:6px">At-risk count by pod</div>
            <div style="height:220px;position:relative"><canvas id="facChartPodRisk" aria-label="At-risk students by pod"></canvas></div>
          </div>
        </div>
      </div>`
        : '';
    body.innerHTML =
      chartsBlock +
      barTable(
        ['Pod', 'Students', 'Avg % complete', 'Avg attendance', 'At-risk', 'Graded', 'Pending'],
        rows.map((r) => [
          esc(r.pod.name),
          r.students,
          pctBar(r.avgPct),
          (r.attendanceAvg || 0).toFixed(1),
          r.atRisk,
          r.subsGraded,
          r.subsPending,
        ]),
      );
    if (rows.length) {
      try {
        await facultyHBarChart(body.querySelector('#facChartPodAvg'), {
          labels: rows.map((r) => r.pod.name),
          values: rows.map((r) => Math.round(r.avgPct * 10) / 10),
          label: 'Avg % complete',
        });
        await facultyVBarChart(body.querySelector('#facChartPodRisk'), {
          labels: rows.map((r) => r.pod.name),
          values: rows.map((r) => r.atRisk),
          label: 'At-risk',
        });
      } catch (e) {
        console.warn('Faculty pod charts', e);
      }
    }
  }

  async function showFaculty() {
    const rows = await loadFacultyAnalytics(state.cohortId);
    const body = document.getElementById('analyticsBody');
    const chartsBlock =
      rows.length > 0
        ? `<div class="add-card" style="padding:14px 16px;margin-bottom:14px">
        <h3 style="margin:0 0 12px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)">Visual overview</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px">
          <div>
            <div class="muted" style="font-size:12px;margin-bottom:6px">Students mentored (by faculty)</div>
            <div style="height:240px;position:relative"><canvas id="facChartFacMentor" aria-label="Students mentored"></canvas></div>
          </div>
          <div>
            <div class="muted" style="font-size:12px;margin-bottom:6px">Graded submissions (mentee pool)</div>
            <div style="height:240px;position:relative"><canvas id="facChartFacGraded" aria-label="Graded count"></canvas></div>
          </div>
        </div>
      </div>`
        : '';
    body.innerHTML =
      chartsBlock +
      barTable(
        ['Faculty', 'Mentored', 'Avg % complete', 'Graded', 'Median turnaround (h)', 'Handoffs in/out'],
        rows.map((r) => [
          esc(r.faculty.full_name || r.faculty.id),
          r.studentsMentored,
          pctBar(r.avgPct),
          r.gradedCount,
          r.gradingMedianHrs != null ? r.gradingMedianHrs.toFixed(1) : '—',
          `${r.handoffsIn} / ${r.handoffsOut}`,
        ]),
      );
    if (rows.length) {
      try {
        const names = rows.map((r) => {
          const n = r.faculty.full_name || r.faculty.id;
          return n.length > 22 ? `${n.slice(0, 20)}…` : n;
        });
        await facultyHBarChart(body.querySelector('#facChartFacMentor'), {
          labels: names,
          values: rows.map((r) => r.studentsMentored),
          label: 'Mentored',
        });
        await facultyVBarChart(body.querySelector('#facChartFacGraded'), {
          labels: names,
          values: rows.map((r) => r.gradedCount),
          label: 'Graded',
        });
      } catch (e) {
        console.warn('Faculty charts', e);
      }
    }
  }

  container.querySelectorAll('button[data-view]').forEach(b => {
    b.addEventListener('click', () => {
      container.querySelectorAll('button[data-view]').forEach(x => x.classList.toggle('active', x === b));
      if (b.dataset.view === 'pods') showPods(); else showFaculty();
    });
  });
  showPods();
}
