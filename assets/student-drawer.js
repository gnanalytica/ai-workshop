// Student detail drawer — faculty & admin shared.
// Google-Classroom-inspired layout: sticky header, KPI row, and tabbed sections
// for Overview / Classwork / Quizzes / Attendance / Stuck / Peer reviews.
//
// Schema notes:
// - lab_progress (not day_progress). Completed = completed_at not null.
// - submissions: no cohort_id; join assignments!inner for cohort filtering.
//   Grade column is `score`. Feedback column is `feedback`.
// - stuck_queue: resolve sets status='resolved', resolved_at, and optional
//   response text (schema: response column added in migration 0410).
// - peer_reviews: no direct reviewee_id; join submissions!inner(user_id).
// - quiz_attempts: joined via quizzes!inner for cohort filtering.
// - attendance: direct cohort_id, day_number, checked_in_at.

import { supabase } from './supabase.js';
import { toast } from './dialog.js';
import { DAYS } from './days.js';

const TOTAL_DAYS = DAYS.length || 30;

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);}
function initialsOf(name){
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '—';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}
function fmtDate(iso){ if (!iso) return ''; try { return new Date(iso).toLocaleDateString(undefined, { month:'short', day:'numeric' }); } catch { return ''; } }
function fmtDateTime(iso){ if (!iso) return ''; try { return new Date(iso).toLocaleString(undefined, { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' }); } catch { return ''; } }
function relTime(iso){
  if (!iso) return '';
  const d = new Date(iso); const delta = (Date.now() - d.getTime()) / 1000;
  if (delta < 60) return 'just now';
  if (delta < 3600) return `${Math.floor(delta/60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta/3600)}h ago`;
  if (delta < 86400*7) return `${Math.floor(delta/86400)}d ago`;
  return fmtDate(iso);
}

let CURRENT = null; // { userId, cohortId, data, tab }

export function mountDrawer() {
  if (document.getElementById('studentDrawer')) return;
  const el = document.createElement('aside');
  el.id = 'studentDrawer';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.innerHTML = `
    <div class="sd-back"></div>
    <div class="sd-panel" tabindex="-1">
      <div id="sdHeader"></div>
      <div id="sdTabs" class="sd-tabs"></div>
      <div id="sdBody" class="sd-body"></div>
    </div>`;
  document.body.appendChild(el);
  el.querySelector('.sd-back').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && el.classList.contains('open')) closeDrawer();
  });
}

export function closeDrawer() {
  const el = document.getElementById('studentDrawer');
  if (el) el.classList.remove('open');
}

export async function openDrawer(userId, { cohortId }) {
  mountDrawer();
  const el = document.getElementById('studentDrawer');
  el.classList.add('open');
  const header = document.getElementById('sdHeader');
  const tabs = document.getElementById('sdTabs');
  const body = document.getElementById('sdBody');
  header.innerHTML = renderHeader({ loading: true });
  tabs.innerHTML = '';
  body.innerHTML = '<div class="sd-loading">Loading student details…</div>';

  try {
    const [profRes, regRes, daysRes, assignsRes, subsRes, stuckRes, peerGivenRes, peerRecvRes, quizAttRes, attRes] = await Promise.all([
      supabase.from('profiles').select('id,full_name,college,year,phone,email,github_username').eq('id', userId).maybeSingle(),
      supabase.from('registrations').select('status,created_at,cohort_id').eq('user_id', userId).eq('cohort_id', cohortId).maybeSingle(),
      supabase.from('lab_progress').select('day_number,completed_at,notes').eq('user_id', userId).eq('cohort_id', cohortId).order('day_number'),
      supabase.from('assignments').select('id,day_number,title,points,rubric_items,due_at').eq('cohort_id', cohortId).order('day_number'),
      supabase.from('submissions')
        .select('id,status,score,feedback,submitted_at,content_url,content_text,rubric_scores,assignments!inner(id,day_number,cohort_id,title,points,rubric_items,due_at)')
        .eq('user_id', userId)
        .eq('assignments.cohort_id', cohortId)
        .order('submitted_at', { ascending: false }),
      supabase.from('stuck_queue')
        .select('id,day_number,message,status,created_at,resolved_at,response')
        .eq('user_id', userId).eq('cohort_id', cohortId).order('created_at', { ascending: false }),
      supabase.from('peer_reviews')
        .select('id,status,total_score,submitted_at,submission_id,submissions!inner(user_id,assignments!inner(day_number,title))')
        .eq('reviewer_id', userId),
      supabase.from('peer_reviews')
        .select('id,status,total_score,submitted_at,reviewer_id,submission_id,submissions!inner(user_id,assignments!inner(day_number,title))')
        .eq('submissions.user_id', userId),
      supabase.from('quiz_attempts')
        .select('id,score,passed,completed_at,quizzes!inner(day_number,cohort_id,title,passing_score)')
        .eq('user_id', userId)
        .eq('quizzes.cohort_id', cohortId)
        .order('completed_at', { ascending: false }),
      supabase.from('attendance')
        .select('day_number,checked_in_at')
        .eq('user_id', userId).eq('cohort_id', cohortId),
    ]);

    const data = {
      prof: profRes.data || { id: userId },
      reg: regRes.data || null,
      days: daysRes.data || [],
      assignments: assignsRes.data || [],
      submissions: subsRes.data || [],
      stuck: stuckRes.data || [],
      peerGiven: peerGivenRes.data || [],
      peerRecv: peerRecvRes.data || [],
      quizAttempts: quizAttRes.data || [],
      attendance: attRes.data || [],
    };

    CURRENT = { userId, cohortId, data, tab: CURRENT?.userId === userId ? (CURRENT.tab || 'overview') : 'overview' };

    header.innerHTML = renderHeader({ loading: false, data, userId });
    tabs.innerHTML = renderTabs(CURRENT.tab);
    renderBody();
    wireChrome();
  } catch (e) {
    body.innerHTML = `<div style="color:#ffa0a0;padding:18px">${esc(e?.message || String(e))}</div>`;
  }
}

function wireChrome() {
  document.getElementById('sdClose')?.addEventListener('click', closeDrawer);
  document.querySelectorAll('#sdTabs .sd-tab').forEach(b => {
    b.addEventListener('click', () => {
      CURRENT.tab = b.dataset.tab;
      document.querySelectorAll('#sdTabs .sd-tab').forEach(x => x.classList.toggle('active', x === b));
      renderBody();
    });
  });
}

function renderHeader({ loading, data, userId }) {
  if (loading) {
    return `<header class="sd-header">
      <div class="sd-ident"><div class="sd-avatar">…</div><div><b>Loading</b><div class="muted">—</div></div></div>
      <button type="button" class="btn-sm" id="sdClose">Close</button>
    </header>`;
  }
  const p = data.prof || {};
  const name = p.full_name || 'Unknown student';
  const sub = [p.college, p.year ? `Year ${p.year}` : '', data.reg?.status ? data.reg.status : ''].filter(Boolean).join(' · ');
  const kpis = computeKpis(data);
  const chips = [];
  if (p.email) chips.push(`<a class="sd-chip" href="mailto:${esc(p.email)}" title="Email">✉ ${esc(p.email)}</a>`);
  if (p.github_username) chips.push(`<a class="sd-chip" href="https://github.com/${encodeURIComponent(p.github_username)}" target="_blank" rel="noopener" title="GitHub">gh @${esc(p.github_username)}</a>`);
  if (p.phone) chips.push(`<span class="sd-chip">☎ ${esc(p.phone)}</span>`);
  chips.push(`<span class="sd-chip sd-chip-ghost" title="User id">id ${esc(String(userId).slice(0,8))}</span>`);

  return `<header class="sd-header">
    <div class="sd-ident">
      <div class="sd-avatar">${esc(initialsOf(name))}</div>
      <div class="sd-ident-text">
        <b class="sd-name">${esc(name)}</b>
        <div class="muted sd-sub">${esc(sub || '—')}</div>
        <div class="sd-chips">${chips.join('')}</div>
      </div>
    </div>
    <button type="button" class="btn-sm" id="sdClose" aria-label="Close">Close</button>
  </header>
  <div class="sd-kpis">
    ${kpiCell('Progress', `${kpis.doneDays}/${TOTAL_DAYS}`, `${kpis.progressPct}%`)}
    ${kpiCell('Avg score', kpis.avgScore != null ? kpis.avgScore.toFixed(1) : '—', kpis.gradedCount ? `${kpis.gradedCount} graded` : 'no grades')}
    ${kpiCell('Submissions', String(data.submissions.length), kpis.missingCount ? `${kpis.missingCount} missing` : 'on track')}
    ${kpiCell('Attendance', `${kpis.attendanceDays}/${TOTAL_DAYS}`, `${kpis.attendancePct}%`)}
    ${kpiCell('Stuck', String(data.stuck.length), kpis.openStuck ? `${kpis.openStuck} open` : 'all clear')}
    ${kpiCell('Peer', `${data.peerRecv.length} / ${data.peerGiven.length}`, 'received / given')}
  </div>`;
}

function kpiCell(label, value, sub) {
  return `<div class="sd-kpi"><div class="sd-kpi-v">${esc(value)}</div><div class="sd-kpi-l">${esc(label)}</div><div class="sd-kpi-s muted">${esc(sub)}</div></div>`;
}

function computeKpis(data) {
  const doneDays = data.days.filter(d => d.completed_at).length;
  const progressPct = Math.round((doneDays / TOTAL_DAYS) * 100);
  const graded = data.submissions.filter(s => s.status === 'graded' && s.score != null);
  const avgScore = graded.length ? (graded.reduce((s, x) => s + Number(x.score || 0), 0) / graded.length) : null;
  const gradedCount = graded.length;
  const submittedDays = new Set(data.submissions.map(s => s.assignments?.day_number));
  const missingCount = data.assignments.filter(a => {
    if (submittedDays.has(a.day_number)) return false;
    if (a.due_at && new Date(a.due_at) >= new Date()) return false;
    return true;
  }).length;
  const attendanceDays = data.attendance.filter(a => a.checked_in_at).length;
  const attendancePct = Math.round((attendanceDays / TOTAL_DAYS) * 100);
  const openStuck = data.stuck.filter(s => s.status !== 'resolved').length;
  return { doneDays, progressPct, avgScore, gradedCount, missingCount, attendanceDays, attendancePct, openStuck };
}

function renderTabs(active) {
  const tabs = [
    ['overview', 'Overview'],
    ['classwork', 'Classwork'],
    ['quizzes', 'Quizzes'],
    ['attendance', 'Attendance'],
    ['stuck', 'Stuck'],
    ['peer', 'Peer reviews'],
  ];
  return tabs.map(([id, label]) =>
    `<button type="button" class="sd-tab${id === active ? ' active' : ''}" data-tab="${id}">${label}</button>`
  ).join('');
}

function renderBody() {
  const body = document.getElementById('sdBody');
  if (!body || !CURRENT) return;
  const { data, tab } = CURRENT;
  if (tab === 'overview') body.innerHTML = renderOverview(data);
  else if (tab === 'classwork') body.innerHTML = renderClasswork(data);
  else if (tab === 'quizzes') body.innerHTML = renderQuizzes(data);
  else if (tab === 'attendance') body.innerHTML = renderAttendance(data);
  else if (tab === 'stuck') body.innerHTML = renderStuck(data);
  else if (tab === 'peer') body.innerHTML = renderPeer(data);
  wireBodyActions();
}

// -------- Tabs --------

function renderOverview(data) {
  const daysDone = new Map(data.days.filter(d => d.completed_at).map(d => [d.day_number, d]));
  const cells = DAYS.map(d => {
    const done = daysDone.get(d.n);
    return `<div class="sd-day${done ? ' done' : ''}" title="Day ${d.n}${d.title ? ' · ' + d.title.replace(/"/g,'') : ''}${done?.completed_at ? ' · done ' + fmtDate(done.completed_at) : ''}">
      <span class="sd-day-n">${d.n}</span>
    </div>`;
  }).join('');
  const recent = buildRecentActivity(data).slice(0, 8);
  return `
    <section class="sd-section">
      <h3>Days</h3>
      <div class="sd-days-grid">${cells}</div>
    </section>

    <section class="sd-section">
      <h3>Recent activity</h3>
      ${recent.length ? `<ul class="sd-activity">${recent.map(r => `
        <li>
          <span class="sd-act-dot sd-act-${r.kind}"></span>
          <div class="sd-act-main"><b>${esc(r.title)}</b>${r.meta ? `<span class="muted"> · ${esc(r.meta)}</span>`: ''}</div>
          <span class="muted sd-act-time">${esc(relTime(r.at))}</span>
        </li>`).join('')}</ul>` : '<div class="muted">No activity yet.</div>'}
    </section>
  `;
}

function buildRecentActivity(data) {
  const items = [];
  data.submissions.forEach(s => items.push({
    at: s.submitted_at, kind: 'sub',
    title: `Submission · Day ${s.assignments?.day_number ?? '—'}${s.assignments?.title ? ' — ' + s.assignments.title : ''}`,
    meta: s.status === 'graded' && s.score != null ? `graded ${s.score}/${s.assignments?.points ?? '—'}` : s.status,
  }));
  data.quizAttempts.forEach(q => items.push({
    at: q.completed_at, kind: 'quiz',
    title: `Quiz · Day ${q.quizzes?.day_number ?? '—'}${q.quizzes?.title ? ' — ' + q.quizzes.title : ''}`,
    meta: `${q.score ?? '—'} · ${q.passed ? 'passed' : 'not passed'}`,
  }));
  data.stuck.forEach(s => items.push({
    at: s.created_at, kind: 'stuck',
    title: `Stuck · Day ${s.day_number ?? '—'}`,
    meta: s.status,
  }));
  data.days.filter(d => d.completed_at).forEach(d => items.push({
    at: d.completed_at, kind: 'day',
    title: `Lab Day ${d.day_number} completed`,
    meta: d.notes ? `note: ${String(d.notes).slice(0,80)}` : '',
  }));
  return items.filter(x => x.at).sort((a, b) => new Date(b.at) - new Date(a.at));
}

function renderClasswork(data) {
  const subBy = new Map(data.submissions.map(s => [s.assignments?.day_number, s]));
  if (!data.assignments.length) return '<div class="muted" style="padding:24px">No assignments configured for this cohort.</div>';
  const rows = data.assignments.map(a => {
    const sub = subBy.get(a.day_number);
    const status = submissionState(a, sub);
    const pts = a.points ?? '—';
    const scoreTxt = sub?.score != null ? `${sub.score}/${pts}` : `—/${pts}`;
    const dueTxt = a.due_at ? `due ${fmtDate(a.due_at)}` : '';
    const submittedTxt = sub?.submitted_at ? `submitted ${fmtDateTime(sub.submitted_at)}` : '';
    return `<article class="sd-cw" data-day="${a.day_number}">
      <div class="sd-cw-head">
        <div class="sd-cw-day">Day ${a.day_number}</div>
        <div class="sd-cw-title"><b>${esc(a.title || '—')}</b><div class="muted sd-cw-meta">${esc([dueTxt, submittedTxt].filter(Boolean).join(' · '))}</div></div>
        <div class="sd-cw-right">
          <span class="sd-pill sd-pill-${status.tone}">${esc(status.label)}</span>
          <div class="sd-cw-score">${esc(scoreTxt)}</div>
        </div>
      </div>
      ${renderCwDetails(a, sub)}
    </article>`;
  }).join('');
  return `<section class="sd-section">${rows}</section>`;
}

function submissionState(a, sub) {
  if (!sub) {
    if (a.due_at && new Date(a.due_at) < new Date()) return { label: 'Missing', tone: 'bad' };
    return { label: 'Not turned in', tone: 'ghost' };
  }
  if (sub.status === 'graded') return { label: 'Graded', tone: 'good' };
  if (a.due_at && sub.submitted_at && new Date(sub.submitted_at) > new Date(a.due_at)) return { label: 'Late', tone: 'warn' };
  return { label: 'Submitted', tone: 'info' };
}

function renderCwDetails(a, sub) {
  if (!sub) return '';
  const rubricItems = Array.isArray(a.rubric_items) ? a.rubric_items : [];
  const rubricScores = Array.isArray(sub.rubric_scores) ? sub.rubric_scores : [];
  const rubric = rubricItems.length ? `
    <div class="sd-rubric">
      ${rubricItems.map((ri, i) => {
        const scoreVal = rubricScores[i]?.points ?? rubricScores[i]?.score ?? null;
        return `<div class="sd-rubric-row">
          <span>${esc(ri.criterion || 'Criterion ' + (i+1))}</span>
          <span class="muted">${scoreVal != null ? esc(String(scoreVal)) : '—'} / ${esc(String(ri.points ?? '—'))}</span>
        </div>`;
      }).join('')}
    </div>` : '';
  return `<div class="sd-cw-body">
    ${sub.content_url ? `<div><a class="sd-link" href="${esc(sub.content_url)}" target="_blank" rel="noopener">Open artifact ↗</a></div>` : ''}
    ${sub.content_text ? `<div class="sd-note">${esc(sub.content_text).replace(/\n/g,'<br>')}</div>` : ''}
    ${sub.feedback ? `<div class="sd-feedback"><span class="muted">Feedback:</span> ${esc(sub.feedback)}</div>` : ''}
    ${rubric}
    <div class="sd-grade-slot" data-grade-slot="${esc(sub.id)}">
      <button type="button" class="btn-sm" data-grade-open="${esc(sub.id)}" data-max="${esc(String(a.points ?? 10))}">Grade / feedback…</button>
    </div>
  </div>`;
}

function renderQuizzes(data) {
  if (!data.quizAttempts.length) return '<div class="muted" style="padding:24px">No quiz attempts yet.</div>';
  const rows = data.quizAttempts.map(q => `<tr>
    <td><b>Day ${esc(String(q.quizzes?.day_number ?? '—'))}</b><div class="muted sd-cw-meta">${esc(q.quizzes?.title || '')}</div></td>
    <td>${esc(String(q.score ?? '—'))}</td>
    <td><span class="sd-pill sd-pill-${q.passed ? 'good' : 'bad'}">${q.passed ? 'Passed' : 'Not passed'}</span></td>
    <td class="muted">${esc(fmtDateTime(q.completed_at))}</td>
  </tr>`).join('');
  return `<section class="sd-section"><table class="sd-table">
    <thead><tr><th>Quiz</th><th>Score</th><th>Result</th><th>Completed</th></tr></thead>
    <tbody>${rows}</tbody></table></section>`;
}

function renderAttendance(data) {
  const attBy = new Map(data.attendance.filter(a => a.checked_in_at).map(a => [a.day_number, a]));
  const cells = DAYS.map(d => {
    const on = attBy.get(d.n);
    return `<div class="sd-day${on ? ' done' : ' miss'}" title="Day ${d.n}${on?.checked_in_at ? ' · checked in ' + fmtDateTime(on.checked_in_at) : ' · absent'}">
      <span class="sd-day-n">${d.n}</span>
    </div>`;
  }).join('');
  return `<section class="sd-section">
    <h3>Check-ins</h3>
    <div class="sd-days-grid">${cells}</div>
    <p class="muted" style="margin-top:10px">Present ${data.attendance.filter(a=>a.checked_in_at).length} / ${TOTAL_DAYS}</p>
  </section>`;
}

function renderStuck(data) {
  if (!data.stuck.length) return '<div class="muted" style="padding:24px">No stuck-queue entries.</div>';
  return `<section class="sd-section">
    <ul class="sd-list">${data.stuck.map(s => `
      <li class="sd-li" data-stuck-li="${esc(s.id)}">
        <div class="sd-li-head">
          <b>Day ${s.day_number ?? '—'}</b>
          <span class="sd-pill sd-pill-${s.status === 'resolved' ? 'good' : 'warn'}">${esc(s.status)}</span>
          <span class="muted sd-li-time">${esc(fmtDateTime(s.created_at))}</span>
        </div>
        ${s.message ? `<div class="sd-note">${esc(s.message)}</div>` : ''}
        ${s.response ? `<div class="sd-feedback"><span class="muted">Reply:</span> ${esc(s.response)}</div>` : ''}
        ${s.status !== 'resolved' ? `<div class="sd-resolve-slot" data-resolve-slot="${esc(s.id)}"><button type="button" class="btn-sm" data-resolve-open="${esc(s.id)}">Reply & resolve…</button></div>` : ''}
      </li>`).join('')}</ul>
  </section>`;
}

function renderPeer(data) {
  const col = (items, kind) => items.length ? `<ul class="sd-list">${items.map(p => `
    <li class="sd-li">
      <div class="sd-li-head">
        <b>Day ${esc(String(p.submissions?.assignments?.day_number ?? '—'))}</b>
        <span class="muted">${esc(p.submissions?.assignments?.title || '')}</span>
        <span class="muted sd-li-time">${esc(fmtDateTime(p.submitted_at))}</span>
      </div>
      <div class="muted">${kind === 'given' ? 'reviewed' : 'received'} · score ${esc(String(p.total_score ?? '—'))} · ${esc(p.status || '')}</div>
    </li>`).join('')}</ul>` : '<div class="muted">None.</div>';
  return `<section class="sd-section sd-peer-cols">
    <div><h3>Received (${data.peerRecv.length})</h3>${col(data.peerRecv, 'recv')}</div>
    <div><h3>Given (${data.peerGiven.length})</h3>${col(data.peerGiven, 'given')}</div>
  </section>`;
}

// -------- Actions (grade / resolve) --------

function wireBodyActions() {
  document.querySelectorAll('#sdBody button[data-grade-open]').forEach(b => {
    b.addEventListener('click', () => openGradeEditor(b));
  });
  document.querySelectorAll('#sdBody button[data-resolve-open]').forEach(b => {
    b.addEventListener('click', () => openResolveEditor(b));
  });
}

function openGradeEditor(b) {
  const id = b.dataset.gradeOpen;
  const max = Number(b.dataset.max) || 10;
  const slot = document.querySelector(`[data-grade-slot="${id}"]`);
  if (!slot) return;
  slot.innerHTML = `
    <div class="sd-inline-editor">
      <label>Score (0–${max})</label>
      <input type="number" min="0" max="${max}" step="0.5" id="sdScore-${id}" />
      <label>Feedback (optional)</label>
      <textarea id="sdFb-${id}" rows="2"></textarea>
      <div class="sd-inline-actions">
        <button type="button" class="btn-sm" data-grade-cancel="${id}">Cancel</button>
        <button type="button" class="btn-sm sd-btn-primary" data-grade-save="${id}">Save grade</button>
      </div>
    </div>`;
  slot.querySelector(`[data-grade-cancel="${id}"]`).addEventListener('click', () => {
    slot.innerHTML = `<button type="button" class="btn-sm" data-grade-open="${esc(id)}" data-max="${esc(String(max))}">Grade / feedback…</button>`;
    wireBodyActions();
  });
  slot.querySelector(`[data-grade-save="${id}"]`).addEventListener('click', async () => {
    const raw = document.getElementById(`sdScore-${id}`)?.value;
    const scoreNum = Number(raw);
    if (!Number.isFinite(scoreNum)) { toast('Enter a valid number for the score.', { error: true }); return; }
    const note = (document.getElementById(`sdFb-${id}`)?.value || '').trim() || null;
    const { error } = await supabase.from('submissions')
      .update({ score: scoreNum, feedback: note, status: 'graded', graded_at: new Date().toISOString() })
      .eq('id', id);
    if (error) toast(error.message, { error: true });
    else await openDrawer(CURRENT.userId, { cohortId: CURRENT.cohortId });
  });
}

function openResolveEditor(b) {
  const id = b.dataset.resolveOpen;
  const slot = document.querySelector(`[data-resolve-slot="${id}"]`);
  if (!slot) return;
  slot.innerHTML = `
    <div class="sd-inline-editor">
      <label>Reply (optional, visible to student)</label>
      <textarea id="sdRes-${id}" rows="3"></textarea>
      <div class="sd-inline-actions">
        <button type="button" class="btn-sm" data-resolve-cancel="${id}">Cancel</button>
        <button type="button" class="btn-sm sd-btn-primary" data-resolve-save="${id}">Mark resolved</button>
      </div>
    </div>`;
  slot.querySelector(`[data-resolve-cancel="${id}"]`).addEventListener('click', () => {
    slot.innerHTML = `<button type="button" class="btn-sm" data-resolve-open="${esc(id)}">Reply & resolve…</button>`;
    wireBodyActions();
  });
  slot.querySelector(`[data-resolve-save="${id}"]`).addEventListener('click', async () => {
    const response = (document.getElementById(`sdRes-${id}`)?.value || '').trim() || null;
    const { error } = await supabase.from('stuck_queue')
      .update({ status: 'resolved', resolved_at: new Date().toISOString(), response })
      .eq('id', id);
    if (error) toast(error.message, { error: true });
    else await openDrawer(CURRENT.userId, { cohortId: CURRENT.cohortId });
  });
}
