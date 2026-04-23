// Analytics tab: Pods vs Faculty toggle, charts + tables.

import { loadPodAnalytics, loadFacultyAnalytics } from './analytics.js';
import { facultyHBarChart, facultyVBarChart } from './chart-kit.js';
import { supabase } from '../supabase.js';

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
    <div id="analyticsBody"><div class="empty-state">Loading…</div></div>
    <section class="add-card" id="speedGradeCard" style="margin-top:14px">
      <h3 style="margin:0 0 8px">Speed grading queue</h3>
      <div class="muted" style="font-size:12.5px;margin-bottom:10px">Quickly move through pending submissions and score inline.</div>
      <div id="speedGradeBody" class="empty-state" style="padding:20px 10px">Loading queue…</div>
    </section>`;

  const qState = { rows: [], idx: 0 };

  async function loadQueue() {
    const { data, error } = await supabase
      .from('submissions')
      .select('id,user_id,status,submitted_at,feedback,score,content_url,content_text,assignments!inner(id,title,points,day_number,cohort_id,due_at)')
      .eq('assignments.cohort_id', state.cohortId)
      .neq('status', 'graded')
      .order('submitted_at', { ascending: true })
      .limit(80);
    if (error) {
      document.getElementById('speedGradeBody').innerHTML = `<div class="empty-state" style="color:#ffa0a0">${esc(error.message)}</div>`;
      return;
    }
    qState.rows = data || [];
    qState.idx = 0;
    renderQueue();
  }

  function queueItem() {
    if (!qState.rows.length) return null;
    if (qState.idx < 0) qState.idx = 0;
    if (qState.idx >= qState.rows.length) qState.idx = qState.rows.length - 1;
    return qState.rows[qState.idx];
  }

  function renderQueue() {
    const host = document.getElementById('speedGradeBody');
    const item = queueItem();
    if (!item) {
      host.innerHTML = `<div class="empty-state" style="padding:10px 0">No pending submissions for this cohort.</div>`;
      return;
    }
    const maxPoints = Number(item.assignments?.points || 10);
    host.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
        <div style="font-size:13px"><b>${qState.idx + 1}</b> / ${qState.rows.length} pending</div>
        <div style="display:flex;gap:8px">
          <button class="btn-sm" id="sgPrev" ${qState.idx === 0 ? 'disabled' : ''}>← Previous</button>
          <button class="btn-sm" id="sgNext" ${qState.idx >= qState.rows.length - 1 ? 'disabled' : ''}>Next →</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr;gap:10px">
        <div style="padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--bg-soft)">
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);letter-spacing:.1em">DAY ${esc(String(item.assignments?.day_number ?? '—'))}</div>
          <div style="font-size:14px;font-weight:600;margin-top:4px">${esc(item.assignments?.title || 'Assignment')}</div>
          <div class="muted" style="font-size:12px;margin-top:4px">Student: ${esc(item.user_id?.slice(0, 8) || 'unknown')} · submitted ${item.submitted_at ? esc(new Date(item.submitted_at).toLocaleString()) : '—'}</div>
          <div style="margin-top:8px;display:flex;gap:10px;flex-wrap:wrap">
            ${item.content_url ? `<a href="${esc(item.content_url)}" target="_blank" rel="noopener" class="btn-sm">Open submission link</a>` : ''}
            <a href="admin-student.html?u=${esc(item.user_id)}" class="btn-sm">Open student profile</a>
          </div>
          ${item.content_text ? `<pre style="margin:10px 0 0;padding:10px;border:1px solid var(--line);border-radius:8px;white-space:pre-wrap;max-height:160px;overflow:auto;font-size:12.5px;background:var(--card)">${esc(item.content_text)}</pre>` : ''}
        </div>
        <div style="padding:10px;border:1px solid var(--line);border-radius:10px">
          <label style="display:block;font-size:12px;color:var(--muted);margin-bottom:6px">Score (0-${maxPoints})</label>
          <input id="sgScore" type="number" min="0" max="${maxPoints}" step="0.5" value="${item.score ?? ''}" style="width:140px;background:var(--input-bg);border:1px solid var(--line);border-radius:8px;padding:8px 10px;color:var(--ink);font:inherit" />
          <label style="display:block;font-size:12px;color:var(--muted);margin:10px 0 6px">Feedback</label>
          <textarea id="sgFeedback" rows="3" style="width:100%;background:var(--input-bg);border:1px solid var(--line);border-radius:8px;padding:8px 10px;color:var(--ink);font:inherit">${esc(item.feedback || '')}</textarea>
          <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn-sm active" id="sgSave">Save grade</button>
            <button class="btn-sm" id="sgSkip">Skip for now</button>
          </div>
        </div>
      </div>`;

    host.querySelector('#sgPrev')?.addEventListener('click', () => { qState.idx -= 1; renderQueue(); });
    host.querySelector('#sgNext')?.addEventListener('click', () => { qState.idx += 1; renderQueue(); });
    host.querySelector('#sgSkip')?.addEventListener('click', () => {
      qState.idx = Math.min(qState.rows.length - 1, qState.idx + 1);
      renderQueue();
    });
    host.querySelector('#sgSave')?.addEventListener('click', async () => {
      const raw = document.getElementById('sgScore')?.value;
      const scoreNum = Number(raw);
      if (!Number.isFinite(scoreNum)) { alert('Enter a valid score.'); return; }
      const feedback = (document.getElementById('sgFeedback')?.value || '').trim() || null;
      const { error } = await supabase
        .from('submissions')
        .update({ score: scoreNum, feedback, status: 'graded', graded_at: new Date().toISOString() })
        .eq('id', item.id);
      if (error) { alert(error.message); return; }
      qState.rows.splice(qState.idx, 1);
      if (qState.idx >= qState.rows.length) qState.idx = Math.max(0, qState.rows.length - 1);
      renderQueue();
    });
  }

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
  loadQueue();
}
