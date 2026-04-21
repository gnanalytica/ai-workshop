# Plan 5 — Analytics tab + student mentor card

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan.

**Goal:** Ship pod-vs-pod and faculty-vs-faculty analytics on the faculty page, and reveal the mentor to the student on `dashboard.html`.

**Architecture:** Analytics is a single tab with a toggle between "Pods" and "Faculty" views. Both views compute metrics client-side from signals already loadable. Student card uses the `my_pod()` RPC from Plan 1.

**Tech Stack:** Vanilla JS + minimal inline SVG bar charts (no chart lib dependency, consistent with the rest of the repo).

**Spec:** Faculty experience "Analytics" + "Student-facing mentor card".

**Prereq:** Plans 1–4 applied.

---

## Chunk 1: Analytics tab

### Task 1: Metrics loader

**Files:**
- Create: `assets/faculty/analytics.js`

- [ ] **Step 1:**

```js
import { supabase } from '../supabase.js';
import { loadStudentSignals } from './signals.js';

export async function loadPodAnalytics(cohortId) {
  const { data: pods } = await supabase.from('cohort_pods').select('id,name').eq('cohort_id', cohortId);
  const { data: members } = await supabase.from('pod_members').select('pod_id,student_user_id').eq('cohort_id', cohortId);
  const byPod = new Map(pods.map(p => [p.id, { ...p, uids: [] }]));
  (members||[]).forEach(m => { if (byPod.has(m.pod_id)) byPod.get(m.pod_id).uids.push(m.student_user_id); });

  const allIds = [...new Set((members||[]).map(m => m.student_user_id))];
  const signals = await loadStudentSignals(cohortId, allIds);

  return Array.from(byPod.values()).map(p => {
    const sigs = p.uids.map(u => signals.get(u)).filter(Boolean);
    const n = sigs.length || 1;
    const avgPct = sigs.reduce((s,x)=> s + (x.daysTotal?x.daysDone/x.daysTotal:0), 0) / n * 100;
    const attendancePct = sigs.reduce((s,x)=> s + (x.attended||0), 0) / n;
    const atRisk = sigs.filter(x => x.atRisk).length;
    const subsGraded = sigs.reduce((s,x)=>s+(x.subsGraded||0),0);
    const subsPending = sigs.reduce((s,x)=>s+(x.subsPending||0),0);
    return { pod: p, avgPct, attendanceAvg: attendancePct, atRisk, subsGraded, subsPending, students: p.uids.length };
  });
}

export async function loadFacultyAnalytics(cohortId) {
  const { data: fac } = await supabase.from('cohort_faculty').select('user_id').eq('cohort_id', cohortId);
  const ids = (fac||[]).map(f => f.user_id);
  const { data: profs } = ids.length ? await supabase.from('profiles').select('id,full_name').in('id', ids) : { data: [] };
  const profById = new Map((profs||[]).map(p => [p.id, p]));

  const { data: podFac } = await supabase.from('pod_faculty').select('pod_id,faculty_user_id,cohort_pods!inner(cohort_id)').eq('cohort_pods.cohort_id', cohortId);
  const { data: members } = await supabase.from('pod_members').select('pod_id,student_user_id').eq('cohort_id', cohortId);
  const { data: events } = await supabase.from('pod_faculty_events').select('pod_id,from_user_id,to_user_id,kind,cohort_pods:cohort_pods!inner(cohort_id)').eq('cohort_pods.cohort_id', cohortId);

  const membersByPod = new Map();
  (members||[]).forEach(m => { if(!membersByPod.has(m.pod_id)) membersByPod.set(m.pod_id, new Set()); membersByPod.get(m.pod_id).add(m.student_user_id); });

  const allStudentIds = [...new Set((members||[]).map(m => m.student_user_id))];
  const signals = await loadStudentSignals(cohortId, allStudentIds);

  // Grading stats: count graded + median turnaround
  const { data: gradedSubs } = allStudentIds.length
    ? await supabase.from('submissions').select('user_id,submitted_at,graded_at,graded_by').in('user_id', allStudentIds).eq('cohort_id', cohortId).not('graded_at','is',null)
    : { data: [] };

  return ids.map(uid => {
    const podsOwned = (podFac||[]).filter(pf => pf.faculty_user_id === uid).map(pf => pf.pod_id);
    const studentSet = new Set();
    podsOwned.forEach(pid => (membersByPod.get(pid) || new Set()).forEach(sid => studentSet.add(sid)));
    const sigs = [...studentSet].map(u => signals.get(u)).filter(Boolean);
    const n = sigs.length || 1;
    const avgPct = sigs.reduce((s,x)=> s + (x.daysTotal?x.daysDone/x.daysTotal:0), 0) / n * 100;

    const myGrades = (gradedSubs||[]).filter(s => s.graded_by === uid);
    const turnarounds = myGrades.map(s => (new Date(s.graded_at) - new Date(s.submitted_at))/3600000).filter(Number.isFinite).sort((a,b)=>a-b);
    const medianHrs = turnarounds.length ? turnarounds[Math.floor(turnarounds.length/2)] : null;

    const handoffsIn = (events||[]).filter(e => e.to_user_id === uid && (e.kind==='handoff' || e.kind==='primary_transfer')).length;
    const handoffsOut = (events||[]).filter(e => e.from_user_id === uid && e.kind==='handoff').length;

    return {
      faculty: profById.get(uid) || { id: uid, full_name: uid },
      studentsMentored: studentSet.size,
      avgPct,
      gradedCount: myGrades.length,
      gradingMedianHrs: medianHrs,
      handoffsIn,
      handoffsOut,
    };
  });
}
```

Adjust column names (`graded_by`, `submitted_at`) after inspecting schema.

- [ ] **Step 2: Commit**

```bash
git add assets/faculty/analytics.js
git commit -m "feat(faculty): pod + faculty analytics loaders"
```

### Task 2: Render the Analytics tab

**Files:**
- Create/Modify: `assets/faculty/analytics-tab.js`
- Modify: `assets/faculty-tabs.js`

- [ ] **Step 1:**

```js
import { loadPodAnalytics, loadFacultyAnalytics } from './analytics.js';

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
      rows.map(r => [r.pod.name, r.students, pctBar(r.avgPct), r.attendanceAvg.toFixed(1), r.atRisk, r.subsGraded, r.subsPending])
    );
  }
  async function showFaculty() {
    const rows = await loadFacultyAnalytics(state.cohortId);
    document.getElementById('analyticsBody').innerHTML = barTable(
      ['Faculty', 'Mentored', 'Avg % complete', 'Graded', 'Median turnaround (h)', 'Handoffs in/out'],
      rows.map(r => [r.faculty.full_name, r.studentsMentored, pctBar(r.avgPct), r.gradedCount, r.gradingMedianHrs!=null?r.gradingMedianHrs.toFixed(1):'—', `${r.handoffsIn} / ${r.handoffsOut}`])
    );
  }

  container.querySelectorAll('button[data-view]').forEach(b => {
    b.addEventListener('click', () => {
      container.querySelectorAll('button[data-view]').forEach(x => x.classList.toggle('active', x===b));
      b.dataset.view === 'pods' ? showPods() : showFaculty();
    });
  });
  showPods();
}

function pctBar(pct) {
  const p = Math.max(0, Math.min(100, pct||0));
  return `<div style="display:flex;align-items:center;gap:6px"><div style="flex:1;height:6px;border-radius:3px;background:var(--line)"><div style="height:100%;width:${p}%;background:var(--accent);border-radius:3px"></div></div><span style="font-size:11.5px;color:var(--muted)">${p.toFixed(0)}%</span></div>`;
}

function barTable(headers, rows) {
  return `<table style="width:100%"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
```

- [ ] **Step 2:** In `assets/faculty-tabs.js`, import and route `'analytics'` to `renderAnalytics`.

- [ ] **Step 3: Verify** — on a staged cohort with ≥2 pods and ≥2 faculty: Pods view ranks pods; Faculty view lists each faculty with metrics. Handoffs count reflects `pod_faculty_events`.

- [ ] **Step 4: Commit**

```bash
git add assets/faculty/analytics-tab.js assets/faculty-tabs.js
git commit -m "feat(faculty): Analytics tab with Pods/Faculty toggle"
```

---

## Chunk 2: Student mentor card

### Task 3: Add "Your mentor" card to `dashboard.html`

**Files:**
- Modify: `dashboard.html`

- [ ] **Step 1: Audit** — open `dashboard.html`, locate where cohort-scoped widgets render (e.g., after the main header). Confirm current cohort id is available in page state (look for an existing `cohort_id` or `cohort.id` reference).

- [ ] **Step 2:** Add markup:

```html
<section id="mentorCard" class="add-card" style="display:none;margin:16px 0">
  <div class="kicker">Your mentor</div>
  <div id="mentorBody"></div>
</section>
```

- [ ] **Step 3:** Add script:

```js
import { supabase } from './assets/supabase.js';

async function renderMentor(cohortId) {
  const { data, error } = await supabase.rpc('my_pod', { p_cohort: cohortId });
  if (error || !data || !data.length) return; // card hidden
  const pod = data[0];
  const primary = (pod.faculty || []).find(f => f.is_primary);
  const others = (pod.faculty || []).filter(f => !f.is_primary);
  if (!primary) return;

  document.getElementById('mentorBody').innerHTML = `
    <div style="display:flex;gap:12px;align-items:center">
      ${primary.avatar_url ? `<img src="${primary.avatar_url}" alt="" style="width:48px;height:48px;border-radius:50%;object-fit:cover" />` : ''}
      <div>
        <b>${escape(primary.full_name || 'Mentor')}</b>
        <div class="muted" style="font-size:12px">${escape(primary.college || '')}</div>
      </div>
    </div>
    ${pod.mentor_note ? `<p style="margin:10px 0 0">${escape(pod.mentor_note)}</p>` : ''}
    ${primary.contact_note ? `<p class="muted" style="margin:6px 0 0;font-size:12.5px">${escape(primary.contact_note)}</p>` : ''}
    ${others.length ? `<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">${others.map(f => `<span class="kicker-tag">${escape(f.full_name || 'Co-faculty')}</span>`).join('')}</div>` : ''}`;
  document.getElementById('mentorCard').style.display = 'block';
}
function escape(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);}

// call renderMentor(activeCohortId) wherever the dashboard knows the cohort.
```

Hook this into the existing cohort-load path.

- [ ] **Step 4: Verify** — as a student assigned to a pod, the card appears with primary faculty name + college + any note. As a student with no pod, the card stays hidden. As a student in a pod with no co-faculty, only the primary appears.

- [ ] **Step 5: Commit**

```bash
git add dashboard.html
git commit -m "feat(student): mentor card on dashboard via my_pod RPC"
```

---

## Chunk 3: End-to-end verification

### Task 4: Full dry-run against staging

- [ ] **Step 1:** Using a staging cohort with ≥3 faculty, ≥2 pods, ≥10 students:
  - [ ] Admin → `admin-pods.html`: create pods, bulk-assign, CSV import, handoff one pod.
  - [ ] Faculty A → `faculty.html`: Today shows contextual data; My pod lists their students; Whole cohort shows all with mine tagged; open drawer on non-pod student, grade a submission; Analytics Pods view highlights their pod visually (optional v1: just lists); Analytics Faculty view reflects grading + handoffs.
  - [ ] Faculty B (recipient of handoff): sees the transferred pod in My pod.
  - [ ] Student in the pod → `dashboard.html`: sees mentor card with correct primary and any co-faculty.
  - [ ] Student not in a pod: no mentor card.
  - [ ] Admin tries to remove Faculty A from `cohort_faculty` while they still own a pod → blocked with toast; after transferring all pods, removal succeeds.

- [ ] **Step 2:** No commit — verification gate. Capture any regressions as follow-up issues.

---

## After all five plans

- Update `CLAUDE.md` with a short note pointing to `faculty.html` and the pod model.
- Update `RUNBOOK.md` to mention `admin-pods.html` as the place to assign pods after adding faculty.
- Announce the rollout to existing faculty with a short email (outside this plan).
