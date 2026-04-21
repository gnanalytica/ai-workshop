# Plan 4 — Faculty: My pod + Whole cohort tabs

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan.

**Goal:** Faculty can list their pod's students with progress/signals, drill into any cohort student via a shared drawer, and grade/reply inline on any student in their cohort (writes widened by Plan 1).

**Architecture:** Two new tab modules (`my-pod.js`, `cohort.js`) that render student rows using a shared helper. A new `assets/student-drawer.js` component provides the detail drawer for both tabs.

**Tech Stack:** Same vanilla JS modules.

**Spec:** Faculty experience "My pod" and "Whole cohort" subsections.

**Prereq:** Plans 1, 3 applied.

---

## Chunk 1: Shared student signals loader

### Task 1: `assets/faculty/signals.js`

**Files:**
- Create: `assets/faculty/signals.js`

- [ ] **Step 1:**

```js
import { supabase } from '../supabase.js';

// Returns Map<user_id, {daysDone, daysTotal, subsGraded, subsPending, attended, stuckOpen, lastActive, reviewsGiven, reviewsReceived, atRisk}>
export async function loadStudentSignals(cohortId, userIds) {
  if (!userIds.length) return new Map();
  const [
    { data: progress }, { data: subs }, { data: stuck }, { data: att }, { data: reviews }, { data: lastAct }
  ] = await Promise.all([
    supabase.from('day_progress').select('user_id,day_number,completed_at').in('user_id', userIds).eq('cohort_id', cohortId),
    supabase.from('submissions').select('user_id,status').in('user_id', userIds).eq('cohort_id', cohortId),
    supabase.from('stuck_queue').select('user_id,resolved_at').in('user_id', userIds).eq('cohort_id', cohortId),
    supabase.from('attendance').select('user_id,status').in('user_id', userIds).eq('cohort_id', cohortId),
    supabase.from('peer_reviews').select('reviewer_id,reviewee_id').or(`reviewer_id.in.(${userIds.join(',')}),reviewee_id.in.(${userIds.join(',')})`),
    supabase.from('activity').select('user_id, max_at:max(created_at)').in('user_id', userIds).group('user_id'),
  ]);

  const { data: totalDaysRow } = await supabase.from('schedule').select('day_number').eq('cohort_id', cohortId);
  const daysTotal = totalDaysRow?.length || 0;

  const out = new Map();
  for (const uid of userIds) {
    const doneDays = (progress||[]).filter(p => p.user_id === uid && p.completed_at).length;
    const ss = (subs||[]).filter(s => s.user_id === uid);
    const attRows = (att||[]).filter(a => a.user_id === uid);
    const revGiven = (reviews||[]).filter(r => r.reviewer_id === uid).length;
    const revRecvd = (reviews||[]).filter(r => r.reviewee_id === uid).length;
    const stuckOpen = (stuck||[]).filter(s => s.user_id === uid && !s.resolved_at).length;
    const lastActive = (lastAct||[]).find(r => r.user_id === uid)?.max_at || null;

    const daysDone = doneDays;
    const subsGraded = ss.filter(s => s.status === 'graded').length;
    const subsPending = ss.filter(s => s.status === 'submitted' || s.status === 'pending').length;
    const attended = attRows.filter(a => a.status === 'present').length;

    // at-risk heuristic (conservative): behind on >3 days AND <50% attendance
    const daysBehind = Math.max(0, daysTotal - daysDone);
    const atRisk = daysBehind > 3 && attRows.length > 0 && attended / attRows.length < 0.5;

    out.set(uid, { daysDone, daysTotal, subsGraded, subsPending, attended, stuckOpen, lastActive, reviewsGiven: revGiven, reviewsReceived: revRecvd, atRisk });
  }
  return out;
}
```

Verify each referenced column/table name in staging and adjust. The `activity` table name is a guess — if it doesn't exist, derive `lastActive` from `greatest(submissions.created_at, stuck_queue.created_at, attendance.marked_at)`.

- [ ] **Step 2:** Log the result for a known cohort to confirm shape.

- [ ] **Step 3: Commit**

```bash
git add assets/faculty/signals.js
git commit -m "feat(faculty): shared student signals loader"
```

### Task 2: `assets/faculty/student-row.js` renderer

**Files:**
- Create: `assets/faculty/student-row.js`

- [ ] **Step 1:**

```js
export function renderStudentRow(profile, signals, { tagMine=false } = {}) {
  const s = signals || {};
  const pct = s.daysTotal ? Math.round((s.daysDone / s.daysTotal) * 100) : 0;
  return `
    <tr data-uid="${profile.id}">
      <td>
        <b>${escape(profile.full_name || '—')}</b>
        ${tagMine ? '<span class="kicker-tag" style="margin-left:6px">mine</span>' : ''}
        <div class="muted" style="font-size:11.5px">${escape(profile.college||'')}</div>
      </td>
      <td style="min-width:160px">
        <div style="height:6px;border-radius:3px;background:var(--line);overflow:hidden">
          <div style="height:100%;width:${pct}%;background:var(--accent)"></div>
        </div>
        <div class="muted" style="font-size:11px">${s.daysDone||0}/${s.daysTotal||0} days · ${pct}%</div>
      </td>
      <td>${chip('sub', `${s.subsGraded||0}✓ / ${s.subsPending||0}…`)}</td>
      <td>${chip('att', `${s.attended||0} days`)}</td>
      <td>${s.stuckOpen ? chip('stuck', `${s.stuckOpen} open`, 'warn') : '<span class="muted">—</span>'}</td>
      <td>${chip('peer', `${s.reviewsGiven||0}→ / ${s.reviewsReceived||0}←`)}</td>
      <td class="muted" style="font-size:12px">${s.lastActive ? new Date(s.lastActive).toLocaleDateString() : '—'}</td>
      <td>${s.atRisk ? '<span class="kicker-tag" style="background:rgba(255,107,107,.14);color:#ffa0a0;border-color:rgba(255,107,107,.3)">at-risk</span>' : ''}</td>
      <td style="text-align:right"><button class="btn-sm" data-open-drawer="${profile.id}">Open →</button></td>
    </tr>`;
}
function chip(cls, text, tone='') {
  return `<span class="kicker-tag ${tone}">${text}</span>`;
}
function escape(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);}
```

- [ ] **Step 2: Commit**

```bash
git add assets/faculty/student-row.js
git commit -m "feat(faculty): student row renderer"
```

---

## Chunk 2: Student detail drawer

### Task 3: `assets/student-drawer.js`

**Files:**
- Create: `assets/student-drawer.js`

- [ ] **Step 1:** Right slide-in drawer mounted once on the page.

```js
import { supabase } from './supabase.js';

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
  // inline styles omitted — add to app.css
}

export function closeDrawer() {
  const el = document.getElementById('studentDrawer');
  if (el) el.classList.remove('open');
}

export async function openDrawer(userId, { cohortId }) {
  mountDrawer();
  const el = document.getElementById('studentDrawer');
  el.classList.add('open');
  document.getElementById('sdBody').innerHTML = '<div class="muted">Loading…</div>';

  const [{ data: prof }, { data: days }, { data: subs }, { data: stuck }, { data: peer }] = await Promise.all([
    supabase.from('profiles').select('id,full_name,college').eq('id', userId).maybeSingle(),
    supabase.from('day_progress').select('day_number,completed_at').eq('user_id', userId).eq('cohort_id', cohortId).order('day_number'),
    supabase.from('submissions').select('id,day_number,status,grade,submitted_at,graded_at,artifact_url').eq('user_id', userId).eq('cohort_id', cohortId).order('day_number'),
    supabase.from('stuck_queue').select('id,day_number,message,created_at,resolved_at,response').eq('user_id', userId).eq('cohort_id', cohortId).order('created_at', { ascending: false }),
    supabase.from('peer_reviews').select('day_number,reviewer_id,reviewee_id,rating,created_at').or(`reviewer_id.eq.${userId},reviewee_id.eq.${userId}`).eq('cohort_id', cohortId),
  ]);

  document.getElementById('sdTitle').textContent = prof?.full_name || userId;
  document.getElementById('sdBody').innerHTML = `
    <h3>Days</h3>
    <div style="display:grid;grid-template-columns:repeat(10,1fr);gap:4px">${(days||[]).map(d=>`<span title="day ${d.day_number}" style="aspect-ratio:1;border-radius:6px;background:${d.completed_at?'var(--accent)':'var(--line)'}"></span>`).join('')}</div>

    <h3>Submissions</h3>
    <ul>${(subs||[]).map(s=>`<li>Day ${s.day_number} · ${s.status} ${s.grade!=null?`· grade ${s.grade}`:''} ${s.artifact_url?`· <a href="${s.artifact_url}" target="_blank">open</a>`:''} <button class="btn-sm" data-grade="${s.id}">Grade…</button></li>`).join('') || '<li class="muted">None.</li>'}</ul>

    <h3>Stuck queue</h3>
    <ul>${(stuck||[]).map(s=>`<li>Day ${s.day_number} · ${new Date(s.created_at).toLocaleDateString()} · ${s.resolved_at?'resolved':'open'}<div>${s.message||''}</div>${s.resolved_at?`<div class="muted">↳ ${s.response||''}</div>`:`<button class="btn-sm" data-reply="${s.id}">Reply…</button>`}</li>`).join('') || '<li class="muted">None.</li>'}</ul>

    <h3>Peer reviews</h3>
    <div>Given: ${(peer||[]).filter(p=>p.reviewer_id===userId).length} · Received: ${(peer||[]).filter(p=>p.reviewee_id===userId).length}</div>`;

  wireDrawerActions(userId, cohortId);
}

function wireDrawerActions(userId, cohortId) {
  document.querySelectorAll('#sdBody button[data-grade]').forEach(b => {
    b.addEventListener('click', async () => {
      const g = prompt('Grade (0–4):'); if (g==null) return;
      const note = prompt('Note (optional):') || null;
      const { error } = await supabase.from('submissions').update({ grade: Number(g), feedback: note, graded_at: new Date().toISOString() }).eq('id', b.dataset.grade);
      if (error) alert(error.message); else openDrawer(userId, { cohortId });
    });
  });
  document.querySelectorAll('#sdBody button[data-reply]').forEach(b => {
    b.addEventListener('click', async () => {
      const resp = prompt('Reply:'); if (!resp) return;
      const { error } = await supabase.from('stuck_queue').update({ response: resp, resolved_at: new Date().toISOString() }).eq('id', b.dataset.reply);
      if (error) alert(error.message); else openDrawer(userId, { cohortId });
    });
  });
}
```

Adjust column names to actual schema during implementation. The prompt-based grade/reply UX is interim — OK for v1; a proper modal can replace it later.

Add drawer CSS to `assets/app.css` (slide-in right, backdrop, max-width 560px).

- [ ] **Step 2: Verify** — mount drawer, call `openDrawer(<student-uid>, { cohortId })` from the console. Drawer opens with data.

- [ ] **Step 3: Commit**

```bash
git add assets/student-drawer.js assets/app.css
git commit -m "feat(faculty): shared student detail drawer"
```

---

## Chunk 3: My pod + Whole cohort tabs

### Task 4: My pod tab

**Files:**
- Modify: `assets/faculty/my-pod.js` (create if placeholder)
- Modify: `assets/faculty-tabs.js` to route `my-pod` to it.

- [ ] **Step 1:**

```js
import { supabase } from '../supabase.js';
import { loadStudentSignals } from './signals.js';
import { renderStudentRow } from './student-row.js';
import { openDrawer } from '../student-drawer.js';

export async function renderMyPod({ state, container }) {
  if (!state.cohortId) { container.innerHTML = '<div class="empty-state">Pick a cohort.</div>'; return; }
  container.innerHTML = '<div class="empty-state">Loading…</div>';

  const { data: pods } = await supabase.from('pod_faculty')
    .select('pod_id, cohort_pods!inner(id,name,cohort_id)')
    .eq('faculty_user_id', state.user.id).eq('cohort_pods.cohort_id', state.cohortId);
  const podIds = (pods||[]).map(p => p.pod_id);

  if (!podIds.length) { container.innerHTML = '<div class="empty-state">You don\'t own any pods in this cohort.</div>'; return; }

  const { data: members } = await supabase.from('pod_members').select('pod_id,student_user_id').in('pod_id', podIds);
  const byPod = new Map();
  podIds.forEach(id => byPod.set(id, []));
  (members||[]).forEach(m => byPod.get(m.pod_id).push(m.student_user_id));

  const allIds = [...new Set((members||[]).map(m => m.student_user_id))];
  const { data: profs } = allIds.length ? await supabase.from('profiles').select('id,full_name,college').in('id', allIds) : { data: [] };
  const profById = new Map((profs||[]).map(p => [p.id, p]));
  const signals = await loadStudentSignals(state.cohortId, allIds);

  container.innerHTML = pods.map(p => {
    const uids = byPod.get(p.pod_id);
    const rows = uids.map(uid => renderStudentRow(profById.get(uid) || { id: uid }, signals.get(uid), { tagMine: true })).join('');
    return `
      <details open class="add-card" style="padding:12px 14px">
        <summary><b>${p.cohort_pods.name}</b> <span class="muted">(${uids.length})</span></summary>
        <table style="width:100%;margin-top:10px">
          <thead><tr><th>Name</th><th>Progress</th><th>Subs</th><th>Att</th><th>Stuck</th><th>Peer</th><th>Last</th><th></th><th></th></tr></thead>
          <tbody>${rows || `<tr><td colspan="9" class="muted" style="padding:10px">Empty pod.</td></tr>`}</tbody>
        </table>
      </details>`;
  }).join('');

  container.querySelectorAll('button[data-open-drawer]').forEach(b => {
    b.addEventListener('click', () => openDrawer(b.dataset.openDrawer, { cohortId: state.cohortId }));
  });
}
```

- [ ] **Step 2:** In `assets/faculty-tabs.js`, replace the `'my-pod'` placeholder with `renderMyPod` from this module.

- [ ] **Step 3: Verify** — as a faculty with a populated pod, My pod lists students with signals and opens drawer on click.

- [ ] **Step 4: Commit**

```bash
git add assets/faculty/my-pod.js assets/faculty-tabs.js
git commit -m "feat(faculty): My pod tab"
```

### Task 5: Whole cohort tab

**Files:**
- Create: `assets/faculty/cohort.js`
- Modify: `assets/faculty-tabs.js`

- [ ] **Step 1:**

```js
import { supabase } from '../supabase.js';
import { loadStudentSignals } from './signals.js';
import { renderStudentRow } from './student-row.js';
import { openDrawer } from '../student-drawer.js';

export async function renderCohort({ state, container }) {
  if (!state.cohortId) { container.innerHTML = '<div class="empty-state">Pick a cohort.</div>'; return; }
  container.innerHTML = '<div class="empty-state">Loading…</div>';

  const { data: enr } = await supabase.from('enrollments')
    .select('user_id, profiles!inner(id,full_name,college)')
    .eq('cohort_id', state.cohortId);
  const profs = (enr||[]).map(r => r.profiles);
  const ids = profs.map(p => p.id);

  const { data: myMembers } = await supabase.from('pod_members').select('student_user_id,pod_id,cohort_pods!inner(id)')
    .eq('cohort_id', state.cohortId)
    .in('pod_id', (await supabase.from('pod_faculty').select('pod_id').eq('faculty_user_id', state.user.id)).data?.map(r=>r.pod_id)||[]);
  const mineSet = new Set((myMembers||[]).map(m => m.student_user_id));

  const signals = await loadStudentSignals(state.cohortId, ids);
  container.innerHTML = `
    <table style="width:100%">
      <thead><tr><th>Name</th><th>Progress</th><th>Subs</th><th>Att</th><th>Stuck</th><th>Peer</th><th>Last</th><th></th><th></th></tr></thead>
      <tbody>${profs.map(p => renderStudentRow(p, signals.get(p.id), { tagMine: mineSet.has(p.id) })).join('')}</tbody>
    </table>`;
  container.querySelectorAll('button[data-open-drawer]').forEach(b => {
    b.addEventListener('click', () => openDrawer(b.dataset.openDrawer, { cohortId: state.cohortId }));
  });
}
```

- [ ] **Step 2:** Route `'cohort'` to `renderCohort`.

- [ ] **Step 3: Verify** — shows full cohort; my-pod rows tagged; drawer opens on any student.

- [ ] **Step 4: Commit**

```bash
git add assets/faculty/cohort.js assets/faculty-tabs.js
git commit -m "feat(faculty): Whole cohort tab with mine-tagging"
```
