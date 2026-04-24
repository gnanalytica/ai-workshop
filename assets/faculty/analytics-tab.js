// Analytics tab: Pods vs Faculty toggle, charts + tables.

import {
  loadPodAnalytics,
  loadFacultyAnalytics,
  loadCohortExecSummary,
  loadCohortWeekTimeSeries,
  loadQuizMilestoneSummary,
} from './analytics.js';
import {
  facultyHBarChart,
  facultyVBarChart,
  facultyDoughnutChart,
  facultyLineChart,
  facultyChartColors,
} from './chart-kit.js';
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
  const canGrade = !!state.isAdmin;
  container.innerHTML = `
    <div id="execPulseHost" class="add-card" style="margin-bottom:14px;padding:16px 18px">
      <div class="empty-state" style="padding:16px 10px">Loading cohort pulse…</div>
    </div>
    <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;align-items:center">
      <span class="muted" style="font-size:12px;margin-right:8px">Drill-down</span>
      <button class="btn-sm active" data-view="pods">Pods</button>
      <button class="btn-sm" data-view="faculty">Mentor load</button>
    </div>
    <div id="analyticsBody"><div class="empty-state">Loading…</div></div>
    ${
      canGrade
        ? `<section class="add-card" id="speedGradeCard" style="margin-top:14px">
      <h3 style="margin:0 0 8px">Speed grading queue</h3>
      <div class="muted" style="font-size:12.5px;margin-bottom:10px">Quickly move through pending submissions and score inline.</div>
      <div id="speedGradeBody" class="empty-state" style="padding:20px 10px">Loading queue…</div>
    </section>`
        : `<p class="muted" style="font-size:13px;margin-top:14px;line-height:1.5">Submission scoring is handled by program trainers. Use the pulse above plus drill-down tables; triage blocked students from <a href="admin-stuck.html" style="color:var(--accent)">Stuck queue</a>.</p>`
    }`;

  async function renderExecPulse() {
    const host = container.querySelector('#execPulseHost');
    if (!host) return;
    try {
      const ex = await loadCohortExecSummary(state.cohortId);
      if (!ex.enrolled) {
        host.innerHTML = `
          <div class="muted" style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px">Cohort executive pulse</div>
          <div class="empty-state" style="padding:12px 10px">No confirmed students in this cohort yet.</div>`;
        return;
      }
      const onTrack = Math.max(0, ex.enrolled - ex.atRiskCount);
      const chk =
        ex.checkInRate != null
          ? `${Math.round(ex.checkInRate * 100)}% of recorded session check-ins`
          : '— (no attendance rows yet)';

      const [ts, ms] = await Promise.all([
        loadCohortWeekTimeSeries(state.cohortId),
        loadQuizMilestoneSummary(state.cohortId, ex.studentIds),
      ]);

      const tsBlock = ts.cohortStart
        ? `<div style="height:240px;position:relative"><canvas id="execTimeSeriesLine" aria-label="Activity by week"></canvas></div>
            <p class="muted" style="font-size:11px;margin:8px 0 0;line-height:1.45">Weeks are 7-day buckets from cohort start. Stuck = items opened that week.</p>`
        : `<div class="muted" style="font-size:12px;padding:10px 0;line-height:1.5">Set a cohort start date (<code style="font-size:11px">starts_on</code>) to see activity by week.</div>`;

      let milestoneBlock;
      if (!ms.rows.length) {
        milestoneBlock = `<div class="muted" style="font-size:12px;padding:8px 0;line-height:1.5">No quizzes on milestone days (5, 10, 15, 20, 25, 30) for this cohort.</div>`;
      } else {
        const mh = ['Day', 'Quiz', '% enrolled pass', 'Attempt pass', 'Avg score', 'Attempts'];
        const mr = ms.rows.map((r) => [
          String(r.day_number),
          esc(r.title),
          pctBar(r.enrolledPassedPct),
          r.attemptPassPct != null ? `${r.attemptPassPct.toFixed(0)}%` : '—',
          r.avgScore != null ? String(r.avgScore) : '—',
          String(r.attempts),
        ]);
        milestoneBlock = `<div style="overflow-x:auto;margin-top:6px">
          <table>
            <thead><tr>${mh.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
            <tbody>${mr.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>
        <p class="muted" style="font-size:11px;margin:10px 0 0;line-height:1.45">% enrolled pass = share of confirmed students with at least one passing attempt on that quiz (${ms.enrolledCount} enrolled).</p>`;
      }

      host.innerHTML = `
        <div class="muted" style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:14px">Cohort executive pulse</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:20px">
          <div style="background:var(--input-bg);border:1px solid var(--line);border-radius:12px;padding:12px 14px">
            <div style="font-size:22px;font-weight:700;letter-spacing:-.02em">${ex.enrolled}</div>
            <div class="muted" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;margin-top:4px">Enrolled</div>
          </div>
          <div style="background:var(--input-bg);border:1px solid var(--line);border-radius:12px;padding:12px 14px">
            <div style="font-size:22px;font-weight:700;letter-spacing:-.02em">${ex.meanLabPct.toFixed(0)}%</div>
            <div class="muted" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;margin-top:4px">Mean lab progress</div>
          </div>
          <div style="background:var(--input-bg);border:1px solid var(--line);border-radius:12px;padding:12px 14px">
            <div style="font-size:22px;font-weight:700;letter-spacing:-.02em;color:#ffb090">${ex.atRiskCount}</div>
            <div class="muted" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;margin-top:4px">At-risk (heuristic)</div>
          </div>
          <div style="background:var(--input-bg);border:1px solid var(--line);border-radius:12px;padding:12px 14px">
            <div style="font-size:22px;font-weight:700;letter-spacing:-.02em">${ex.stuckCohortOpen}</div>
            <div class="muted" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;margin-top:4px">Open stuck</div>
          </div>
          <div style="background:var(--input-bg);border:1px solid var(--line);border-radius:12px;padding:12px 14px">
            <div style="font-size:14px;font-weight:600;line-height:1.35;padding-top:4px">${esc(chk)}</div>
            <div class="muted" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;margin-top:6px">Check-ins</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;align-items:stretch">
          <div style="min-height:200px">
            <div class="muted" style="font-size:12px;margin-bottom:8px">On-track vs at-risk</div>
            <div style="height:200px;position:relative"><canvas id="execDonutRisk" aria-label="At-risk split"></canvas></div>
          </div>
          <div style="min-height:220px">
            <div class="muted" style="font-size:12px;margin-bottom:8px">Avg lab completion by pod</div>
            <div style="height:220px;position:relative"><canvas id="execPodsBar" aria-label="Pods completion"></canvas></div>
          </div>
        </div>
        <div style="margin-top:22px;padding-top:18px;border-top:1px solid var(--line)">
          <div class="muted" style="font-size:12px;margin-bottom:8px">Activity by cohort week</div>
          ${tsBlock}
        </div>
        <div style="margin-top:22px;padding-top:18px;border-top:1px solid var(--line)">
          <div class="muted" style="font-size:12px;margin-bottom:8px">Milestone quiz pass rates</div>
          ${milestoneBlock}
        </div>
        <p class="muted" style="font-size:12px;margin:16px 0 0;line-height:1.5">Same at-risk heuristic as <strong>People</strong>. Pod chart includes empty pods (0 students). 
          <a href="faculty.html#students" style="color:var(--accent)">Students →</a>
          · <a href="admin-stuck.html" style="color:var(--accent)">Stuck →</a>
          · <a href="admin-home.html" style="color:var(--accent)">Home →</a></p>`;

      const colors = facultyChartColors();
      await facultyDoughnutChart(host.querySelector('#execDonutRisk'), {
        labels: ['On track', 'At-risk'],
        values: [onTrack, ex.atRiskCount],
        colors: [`${colors.accent}cc`, `${colors.accent3}99`],
      });
      const pods = [...ex.podRows].filter((p) => p.students > 0).sort((a, b) => b.avgPct - a.avgPct);
      const pLabels = pods.length
        ? pods.map((p) => {
            const n = String(p.pod.name || 'Pod');
            return n.length > 20 ? `${n.slice(0, 18)}…` : n;
          })
        : ['—'];
      const pVals = pods.length ? pods.map((p) => Math.round(p.avgPct * 10) / 10) : [0];
      await facultyHBarChart(host.querySelector('#execPodsBar'), {
        labels: pLabels,
        values: pVals,
        label: 'Avg % labs',
      });
      if (ts.cohortStart) {
        const lineCanvas = host.querySelector('#execTimeSeriesLine');
        if (lineCanvas) {
          await facultyLineChart(lineCanvas, {
            labels: ts.labels,
            datasets: [
              { label: 'Lab completions', data: ts.labs },
              { label: 'Quiz attempts', data: ts.quizzes },
              { label: 'Submissions', data: ts.subs },
              { label: 'Stuck opened', data: ts.stuck },
            ],
          });
        }
      }
    } catch (e) {
      host.innerHTML = `<div class="empty-state" style="color:#ffa0a0;padding:16px">${esc(e.message || e)}</div>`;
    }
  }

  await renderExecPulse();

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
  if (canGrade) loadQueue();
}
