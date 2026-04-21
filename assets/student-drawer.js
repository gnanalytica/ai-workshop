// Shared right slide-in drawer showing a student's progress across a cohort.
// Inline grading uses prompt()/alert() — v1 interim UX per plan.
//
// Schema notes:
// - lab_progress (not day_progress). Completed = completed_at not null.
// - submissions: has no cohort_id; join assignments!inner for cohort filtering.
//   Grade column is `score` (not `grade`). Feedback column is `feedback`.
//   Status values include 'submitted', 'graded'.
// - stuck_queue: reply pattern mirrors admin-stuck.html (status='resolved',
//   resolved_at=now). There is no "response" column on stuck_queue; the
//   reply text is stored in `message` or elsewhere, so the inline-reply
//   here only resolves the item and surfaces the admin's text via prompt.
//   TODO: verify final reply column name once staging is live; extend
//   this module to persist the reply text if a column is added.
// - peer_reviews: no direct reviewee_id; join submissions!inner(user_id).

import { supabase } from './supabase.js';

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);}

export function mountDrawer() {
  if (document.getElementById('studentDrawer')) return;
  const el = document.createElement('aside');
  el.id = 'studentDrawer';
  el.innerHTML = `
    <div class="sd-back"></div>
    <div class="sd-panel">
      <header style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid var(--line)">
        <b id="sdTitle">Student</b>
        <button class="btn-sm" id="sdClose">Close</button>
      </header>
      <div id="sdBody" style="padding:16px 18px;overflow:auto;max-height:calc(100vh - 60px)"></div>
    </div>`;
  document.body.appendChild(el);
  el.querySelector('.sd-back').addEventListener('click', closeDrawer);
  el.querySelector('#sdClose').addEventListener('click', closeDrawer);
}

export function closeDrawer() {
  const el = document.getElementById('studentDrawer');
  if (el) el.classList.remove('open');
}

export async function openDrawer(userId, { cohortId }) {
  mountDrawer();
  const el = document.getElementById('studentDrawer');
  el.classList.add('open');
  const body = document.getElementById('sdBody');
  body.innerHTML = '<div class="muted">Loading…</div>';

  try {
    const [profRes, daysRes, subsRes, stuckRes, peerGivenRes, peerRecvRes] = await Promise.all([
      supabase.from('profiles').select('id,full_name,college').eq('id', userId).maybeSingle(),
      supabase.from('lab_progress')
        .select('day_number,completed_at,notes')
        .eq('user_id', userId)
        .eq('cohort_id', cohortId)
        .order('day_number'),
      supabase.from('submissions')
        .select('id,status,score,feedback,submitted_at,content_url,content_text,assignments!inner(day_number,cohort_id,title,points,rubric_items)')
        .eq('user_id', userId)
        .eq('assignments.cohort_id', cohortId)
        .order('submitted_at', { ascending: false }),
      supabase.from('stuck_queue')
        .select('id,day_number,message,status,created_at,resolved_at')
        .eq('user_id', userId)
        .eq('cohort_id', cohortId)
        .order('created_at', { ascending: false }),
      supabase.from('peer_reviews')
        .select('id,status,total_score,submitted_at')
        .eq('reviewer_id', userId),
      supabase.from('peer_reviews')
        .select('id,status,total_score,submitted_at,submissions!inner(user_id)')
        .eq('submissions.user_id', userId),
    ]);

    const prof = profRes.data;
    const days = daysRes.data || [];
    const subs = subsRes.data || [];
    const stuck = stuckRes.data || [];
    const peerGiven = peerGivenRes.data || [];
    const peerRecv = peerRecvRes.data || [];

    document.getElementById('sdTitle').textContent = prof?.full_name || userId;
    body.innerHTML = `
      <div style="margin-bottom:12px" class="muted">${esc(prof?.college || '')}</div>

      <h3 style="margin:0 0 6px">Days</h3>
      <div style="display:grid;grid-template-columns:repeat(10,1fr);gap:4px;margin-bottom:16px">
        ${days.map(d => `<span title="Day ${d.day_number}${d.completed_at ? ' · done' : ''}" style="aspect-ratio:1;border-radius:6px;background:${d.completed_at ? 'var(--accent)' : 'var(--line)'}"></span>`).join('') || '<span class="muted">No lab progress yet.</span>'}
      </div>

      <h3 style="margin:16px 0 6px">Submissions (${subs.length})</h3>
      <ul style="list-style:none;padding:0;margin:0 0 12px">${subs.map(s => `
        <li style="padding:8px 0;border-bottom:1px solid var(--line)">
          <div><b>Day ${s.assignments?.day_number ?? '—'}</b>${s.assignments?.title ? ' · ' + esc(s.assignments.title) : ''} · <span class="kicker-tag">${esc(s.status || 'submitted')}</span>${s.score != null ? ` · score ${esc(String(s.score))}` : ''}</div>
          ${s.content_url ? `<div><a href="${esc(s.content_url)}" target="_blank" rel="noopener">artifact →</a></div>` : ''}
          ${s.feedback ? `<div class="muted" style="font-size:12px;margin-top:4px">↳ ${esc(s.feedback)}</div>` : ''}
          <div style="margin-top:4px"><button class="btn-sm" data-grade="${esc(s.id)}" data-max="${esc(String(s.assignments?.points ?? 10))}">Grade…</button></div>
        </li>`).join('') || '<li class="muted">None.</li>'}</ul>

      <h3 style="margin:16px 0 6px">Stuck queue (${stuck.length})</h3>
      <ul style="list-style:none;padding:0;margin:0 0 12px">${stuck.map(s => `
        <li style="padding:8px 0;border-bottom:1px solid var(--line)">
          <div>Day ${s.day_number ?? '—'} · ${new Date(s.created_at).toLocaleDateString()} · <span class="kicker-tag${s.status==='resolved' ? '' : ' warn'}">${esc(s.status)}</span></div>
          ${s.message ? `<div style="margin-top:4px">${esc(s.message)}</div>` : ''}
          ${s.status !== 'resolved' ? `<div style="margin-top:4px"><button class="btn-sm" data-resolve="${esc(s.id)}">Mark resolved…</button></div>` : ''}
        </li>`).join('') || '<li class="muted">None.</li>'}</ul>

      <h3 style="margin:16px 0 6px">Peer reviews</h3>
      <div>Given: ${peerGiven.length} · Received: ${peerRecv.length}</div>`;

    wireDrawerActions(userId, cohortId);
  } catch (e) {
    body.innerHTML = `<div style="color:#ffa0a0">${esc(e.message || String(e))}</div>`;
  }
}

function wireDrawerActions(userId, cohortId) {
  document.querySelectorAll('#sdBody button[data-grade]').forEach(b => {
    b.addEventListener('click', async () => {
      const max = b.dataset.max || '10';
      const g = prompt(`Score (0–${max}):`);
      if (g === null || g === '') return;
      const scoreNum = Number(g);
      if (!Number.isFinite(scoreNum)) return alert('Not a number.');
      const note = prompt('Feedback (optional):') || null;
      const { error } = await supabase.from('submissions')
        .update({ score: scoreNum, feedback: note, status: 'graded' })
        .eq('id', b.dataset.grade);
      if (error) alert(error.message); else openDrawer(userId, { cohortId });
    });
  });
  document.querySelectorAll('#sdBody button[data-resolve]').forEach(b => {
    b.addEventListener('click', async () => {
      if (!confirm('Mark this stuck item resolved?')) return;
      const { error } = await supabase.from('stuck_queue')
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
        .eq('id', b.dataset.resolve);
      if (error) alert(error.message); else openDrawer(userId, { cohortId });
    });
  });
}
