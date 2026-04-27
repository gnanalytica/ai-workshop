# Plan 2 — Admin pods UI

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin can create pods, attach multiple faculty (with primary), assign/move students (manual + bulk + CSV), hand off pods, and is blocked from removing faculty with live pods.

**Architecture:** New `admin-pods.html` page following the same pattern as `admin-faculty.html`: module script, Supabase client, admin gate, vanilla DOM rendering. Shared helpers extracted to `assets/pods.js`.

**Tech Stack:** Static HTML + vanilla JS modules + Supabase JS SDK v2 (same as existing admin pages).

**Spec:** `docs/superpowers/specs/2026-04-21-faculty-pods-design.md` — section "Admin UI".

**Prereq:** Plan 1 applied in staging.

**Reference patterns:**
- `admin-faculty.html` — auth gate, toast, table, RPC usage, modal-free interactions.
- `assets/admin-auth.js` — `checkAdminOrFaculty`.
- `assets/admin-nav.js` — nav registration.

---

## Chunk 1: Page skeleton & cohort-scoped data load

### Task 1: Register page in admin nav

**Files:**
- Modify: `assets/admin-nav.js`

- [ ] **Step 1: Verification** — open `admin-faculty.html` in staging, confirm no "Pods" link in nav.

- [ ] **Step 2: Add entry**

In `assets/admin-nav.js`, insert in `ADMIN_PAGES` array just after the Faculty entry:

```js
{ href: 'admin-pods.html', label: 'Pods', adminOnly: true },
```

- [ ] **Step 3: Commit**

```bash
git add assets/admin-nav.js
git commit -m "feat(pods): register admin-pods.html in nav"
```

### Task 2: Create `admin-pods.html` shell

**Files:**
- Create: `admin-pods.html`

Copy the structure of `admin-faculty.html` (gate, denied, panel, toast, theme, sign-in/out). Replace the main panel body with:

```html
<main class="wrap" id="panel" style="display:none">
  <div id="adminNav"></div>
  <div style="margin:24px 0 8px">
    <div class="kicker">Platform</div>
    <h1>Pods</h1>
    <p class="muted" style="font-size:14px;margin:6px 0 0">Group students within a cohort and attach mentor faculty. Faculty get a pod-scoped landing page.</p>
  </div>

  <div class="section-head">
    <h2>Cohort</h2>
    <div style="display:flex;gap:10px;align-items:center">
      <select id="cohortSel"></select>
      <button class="btn-sm" id="csvBtn">Import CSV…</button>
      <button class="cta" id="newPodBtn">+ New pod</button>
    </div>
  </div>

  <div class="pods-grid" style="display:grid;grid-template-columns:320px 1fr;gap:16px">
    <section id="unassignedPanel" class="table-wrap"></section>
    <section id="podsPanel" style="display:grid;gap:12px"></section>
  </div>
</main>

<dialog id="csvDialog"></dialog>
<dialog id="handoffDialog"></dialog>
<dialog id="newPodDialog"></dialog>
```

- [ ] **Step 1: Verification** — file doesn't exist yet; `ls admin-pods.html` returns not-found.

- [ ] **Step 2: Write the file** using the shell above plus the exact auth/init patterns from `admin-faculty.html` (auth gate, `checkAdmin`, redirect to gate if not signed in, redirect to `denied` if not admin).

- [ ] **Step 3: Verify in browser** — load `admin-pods.html`, sign in as an admin; panel shows, cohort dropdown populates (reuse `loadCohorts()` from admin-faculty), both panels are empty. No console errors.

- [ ] **Step 4: Commit**

```bash
git add admin-pods.html
git commit -m "feat(pods): admin-pods.html shell with cohort selector"
```

### Task 3: `assets/pods.js` helper module

**Files:**
- Create: `assets/pods.js`

- [ ] **Step 1:** Define and export:

```js
import { supabase } from './supabase.js';

export async function loadPodsForCohort(cohortId) {
  const { data: pods, error } = await supabase
    .from('cohort_pods')
    .select('id,name,mentor_note,created_at')
    .eq('cohort_id', cohortId)
    .order('created_at', { ascending: true });
  if (error) throw error;

  const podIds = (pods || []).map(p => p.id);
  if (!podIds.length) return [];

  const [{ data: faculty }, { data: members }] = await Promise.all([
    supabase.from('pod_faculty').select('pod_id,faculty_user_id,is_primary,contact_note').in('pod_id', podIds),
    supabase.from('pod_members').select('pod_id,student_user_id').in('pod_id', podIds),
  ]);

  const facultyByPod = new Map();
  (faculty || []).forEach(f => {
    if (!facultyByPod.has(f.pod_id)) facultyByPod.set(f.pod_id, []);
    facultyByPod.get(f.pod_id).push(f);
  });
  const membersByPod = new Map();
  (members || []).forEach(m => {
    if (!membersByPod.has(m.pod_id)) membersByPod.set(m.pod_id, []);
    membersByPod.get(m.pod_id).push(m);
  });

  return pods.map(p => ({
    ...p,
    faculty: facultyByPod.get(p.id) || [],
    members: membersByPod.get(p.id) || [],
  }));
}

export async function loadEnrolledStudents(cohortId) {
  // Assumes enrollments(user_id, cohort_id); adapt if schema differs.
  const { data, error } = await supabase
    .from('enrollments')
    .select('user_id, profiles!inner(id,full_name,college)')
    .eq('cohort_id', cohortId);
  if (error) throw error;
  return (data || []).map(r => r.profiles);
}

export async function loadCohortFaculty(cohortId) {
  const { data: fac } = await supabase.from('cohort_faculty').select('user_id,role').eq('cohort_id', cohortId);
  const ids = (fac || []).map(r => r.user_id);
  if (!ids.length) return [];
  const { data: profs } = await supabase.from('profiles').select('id,full_name,college').in('id', ids);
  const byId = new Map((profs || []).map(p => [p.id, p]));
  return (fac || []).map(f => ({ ...f, profile: byId.get(f.user_id) || {} }));
}

export async function callPodFacultyEvent(podId, kind, fromUserId, toUserId, note) {
  const { error } = await supabase.rpc('rpc_pod_faculty_event', {
    p_pod_id: podId, p_kind: kind, p_from_user_id: fromUserId, p_to_user_id: toUserId, p_note: note,
  });
  if (error) throw error;
}
```

- [ ] **Step 2:** Manual verify — in `admin-pods.html`, temporarily log `loadPodsForCohort(selectedCohort)` on cohort change. Confirm returns `[]` initially.

- [ ] **Step 3: Commit**

```bash
git add assets/pods.js
git commit -m "feat(pods): shared helpers for pod data loading"
```

---

## Chunk 2: Unassigned & pods panels (read)

### Task 4: Render unassigned students panel

**Files:**
- Modify: `admin-pods.html`

- [ ] **Step 1:** In the page's `<script type="module">`, add:

```js
import { loadPodsForCohort, loadEnrolledStudents, loadCohortFaculty, callPodFacultyEvent } from './assets/pods.js';

let STATE = { cohortId: null, pods: [], students: [], faculty: [], selectedUnassigned: new Set(), selectedByPod: new Map() };

async function refresh() {
  if (!STATE.cohortId) return;
  const [pods, students, faculty] = await Promise.all([
    loadPodsForCohort(STATE.cohortId),
    loadEnrolledStudents(STATE.cohortId),
    loadCohortFaculty(STATE.cohortId),
  ]);
  STATE.pods = pods; STATE.students = students; STATE.faculty = faculty;
  renderUnassigned();
  renderPods();
}

function renderUnassigned() {
  const assigned = new Set(STATE.pods.flatMap(p => p.members.map(m => m.student_user_id)));
  const unassigned = STATE.students.filter(s => !assigned.has(s.id));
  const html = `
    <div style="padding:14px 16px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center">
      <b>Unassigned <span class="muted" style="font-weight:400">(${unassigned.length})</span></b>
      <div style="display:flex;gap:6px">
        <button class="btn-sm" id="selAllU">All</button>
        <button class="btn-sm" id="selNoneU">None</button>
      </div>
    </div>
    <div style="padding:10px 14px">
      <input id="uSearch" placeholder="Search…" style="width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--input-bg);color:var(--ink)" />
    </div>
    <ul id="uList" style="list-style:none;padding:0 8px 10px;margin:0;max-height:60vh;overflow:auto">
      ${unassigned.map(s => `
        <li style="display:flex;gap:8px;align-items:center;padding:6px 8px;border-radius:8px">
          <input type="checkbox" data-uid="${s.id}" ${STATE.selectedUnassigned.has(s.id)?'checked':''} />
          <div><b>${escapeHtml(s.full_name||'—')}</b><div class="muted" style="font-size:11.5px">${escapeHtml(s.college||'')}</div></div>
        </li>`).join('')}
    </ul>
    ${unassigned.length ? `
      <div style="padding:10px 14px;border-top:1px solid var(--line);display:flex;gap:8px;align-items:center">
        <select id="uAssignTo"><option value="">Assign selected to…</option>${STATE.pods.map(p=>`<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}</select>
        <button class="cta" id="uAssignBtn">Assign</button>
      </div>` : ''}`;
  document.getElementById('unassignedPanel').innerHTML = html;
  wireUnassigned();
}
```

Define `escapeHtml` (reuse the `esc` helper pattern from admin-faculty).

- [ ] **Step 2: Verify** — load page, select a cohort with enrolled students and no pods. Unassigned list shows all students.

- [ ] **Step 3: Commit**

```bash
git add admin-pods.html
git commit -m "feat(pods): render unassigned students panel"
```

### Task 5: Render pods panel with faculty chips + member list

**Files:**
- Modify: `admin-pods.html`

- [ ] **Step 1:** Add `renderPods()`:

```js
function renderPods() {
  if (!STATE.pods.length) {
    document.getElementById('podsPanel').innerHTML = `<div class="empty-state" style="padding:30px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:12px">No pods yet — click "+ New pod".</div>`;
    return;
  }
  const profById = new Map(STATE.students.map(s => [s.id, s]));
  const facById = new Map(STATE.faculty.map(f => [f.user_id, f.profile]));

  document.getElementById('podsPanel').innerHTML = STATE.pods.map(pod => {
    const primary = pod.faculty.find(f => f.is_primary);
    const others = pod.faculty.filter(f => !f.is_primary);
    const chips = pod.faculty.map(f => {
      const prof = facById.get(f.faculty_user_id) || {};
      const star = f.is_primary ? '★' : '☆';
      return `<span class="chip" data-fid="${f.faculty_user_id}" title="${f.is_primary?'primary':'click star to promote'}">
        <button class="star" data-promote="${f.faculty_user_id}" data-pod="${pod.id}">${star}</button>
        ${escapeHtml(prof.full_name || f.faculty_user_id)}
        <button class="x" data-remove-fac="${f.faculty_user_id}" data-pod="${pod.id}">×</button>
      </span>`;
    }).join('');

    const members = pod.members.map(m => {
      const p = profById.get(m.student_user_id) || {};
      return `<li style="display:flex;gap:8px;align-items:center;padding:6px 0">
        <input type="checkbox" data-pid="${pod.id}" data-uid="${m.student_user_id}" />
        <b>${escapeHtml(p.full_name || m.student_user_id)}</b>
        <span class="muted" style="font-size:11.5px">${escapeHtml(p.college||'')}</span>
        <button class="btn-sm danger" style="margin-left:auto" data-unassign-one="${m.student_user_id}" data-pod="${pod.id}">×</button>
      </li>`;
    }).join('');

    const availableFac = STATE.faculty.filter(f => !pod.faculty.some(pf => pf.faculty_user_id === f.user_id));

    return `
      <article class="add-card" data-pod="${pod.id}">
        <div style="display:flex;gap:10px;align-items:center;justify-content:space-between">
          <input class="pod-name" data-pod="${pod.id}" value="${escapeHtml(pod.name)}" style="font-weight:700;font-size:15px;border:none;background:transparent;color:var(--ink);outline:none;width:50%" />
          <div style="display:flex;gap:6px">
            <button class="btn-sm" data-handoff="${pod.id}">Handoff…</button>
            <button class="btn-sm" data-clear="${pod.id}">Clear members</button>
            <button class="btn-sm danger" data-delete-pod="${pod.id}">Delete</button>
          </div>
        </div>
        <div style="margin-top:8px;display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          ${chips}
          ${availableFac.length ? `<select data-add-fac="${pod.id}"><option value="">+ add faculty</option>${availableFac.map(f=>`<option value="${f.user_id}">${escapeHtml(f.profile.full_name||f.user_id)}</option>`).join('')}</select>` : ''}
        </div>
        <ul style="list-style:none;padding:0;margin:10px 0 0">${members || '<li class="muted" style="padding:6px 0">No students.</li>'}</ul>
        ${pod.members.length ? `
          <div style="display:flex;gap:8px;margin-top:8px">
            <select data-move="${pod.id}"><option value="">Move selected to…</option>${STATE.pods.filter(p=>p.id!==pod.id).map(p=>`<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}</select>
            <button class="btn-sm" data-bulk-move="${pod.id}">Move</button>
            <button class="btn-sm danger" data-bulk-unassign="${pod.id}">Unassign selected</button>
          </div>` : ''}
      </article>`;
  }).join('');
  wirePods();
}
```

Add chip / star / × CSS inline or in the `<style>` block at the top of the page.

- [ ] **Step 2: Verify** — insert a pod directly via SQL (from Plan 1 verification) and reload. The card renders with faculty chips and members.

- [ ] **Step 3: Commit**

```bash
git add admin-pods.html
git commit -m "feat(pods): render pods panel with faculty chips and members"
```

---

## Chunk 3: Mutations

### Task 6: New pod dialog

- [ ] **Step 1:** Wire `#newPodBtn` to a `<dialog>` containing: name input + primary faculty dropdown (from cohort_faculty). On submit:

```js
const { data: pod, error } = await supabase.from('cohort_pods').insert({
  cohort_id: STATE.cohortId, name, created_by: (await supabase.auth.getUser()).data.user.id
}).select('id').single();
if (error) return toast(error.message, 'err');
await callPodFacultyEvent(pod.id, 'added', null, primaryFacultyId, null);
await callPodFacultyEvent(pod.id, 'primary_transfer', null, primaryFacultyId, null);
await refresh();
```

- [ ] **Step 2: Verify** — create a pod named "Pod A". It appears with the chosen primary faculty.

- [ ] **Step 3: Commit**

```bash
git add admin-pods.html
git commit -m "feat(pods): new-pod dialog"
```

### Task 7: Inline mutations (assign, move, unassign, edit name, add/remove faculty, promote primary, clear, delete)

- [ ] **Step 1:** In `wireUnassigned()` and `wirePods()`, wire each control:

```js
// assign selected unassigned to a pod:
const { error } = await supabase.from('pod_members')
  .insert(Array.from(STATE.selectedUnassigned).map(uid => ({ pod_id: targetPodId, student_user_id: uid, assigned_by: me })));

// unassign one:
await supabase.from('pod_members').delete().eq('pod_id', podId).eq('student_user_id', uid);

// bulk move:
await supabase.from('pod_members').update({ pod_id: targetPodId })
  .eq('pod_id', sourcePodId).in('student_user_id', Array.from(selected));

// rename pod:
await supabase.from('cohort_pods').update({ name }).eq('id', podId);

// add faculty:
await callPodFacultyEvent(podId, 'added', null, facultyId, null);

// remove faculty:
await callPodFacultyEvent(podId, 'removed', facultyId, null, null);

// promote primary:
await callPodFacultyEvent(podId, 'primary_transfer', null, facultyId, null);

// clear pod members:
await supabase.from('pod_members').delete().eq('pod_id', podId);

// delete pod (members cascade via pod_members.pod_id FK):
await supabase.from('cohort_pods').delete().eq('id', podId);
```

Each mutation is followed by `await refresh()` and a toast. Errors show `toast(error.message, 'err')`.

- [ ] **Step 2: Verify each** in the browser: assign 3, move 2 between pods, unassign 1, rename a pod, promote a non-primary to primary, remove a non-primary faculty, delete an empty pod.

- [ ] **Step 3: Commit**

```bash
git add admin-pods.html assets/pods.js
git commit -m "feat(pods): inline pod + member mutations"
```

### Task 8: Handoff dialog

- [ ] **Step 1:** `#handoffDialog` fields: new primary faculty dropdown (cohort faculty minus current primary), optional note, optional "remove me after handoff" checkbox (only for faculty-initiated; in admin UI this just means "remove old primary").

```js
await callPodFacultyEvent(podId, 'handoff', oldPrimaryUid, newPrimaryUid, note || null);
```

- [ ] **Step 2: Verify** — run a handoff; audit row appears in `pod_faculty_events` with `kind='handoff'`.

- [ ] **Step 3: Commit**

```bash
git add admin-pods.html
git commit -m "feat(pods): handoff dialog"
```

---

## Chunk 4: CSV import & faculty removal guardrail

### Task 9: CSV import with preview diff

- [ ] **Step 1:** `#csvBtn` opens `#csvDialog` with a file input. Parse client-side (no dep — use `text.split('\n').map(r => r.split(','))`):

```js
function parseCsv(text) {
  const rows = text.trim().split(/\r?\n/).map(r => r.split(',').map(c => c.trim()));
  const [header, ...data] = rows;
  const emailIdx = header.indexOf('student_email');
  const podIdx = header.indexOf('pod_name');
  if (emailIdx < 0 || podIdx < 0) throw new Error('CSV needs student_email,pod_name columns');
  return data.filter(r => r[emailIdx] && r[podIdx]).map(r => ({ email: r[emailIdx], pod: r[podIdx] }));
}
```

- [ ] **Step 2:** Build preview:

```js
// Map emails → user_id via existing admin_find_user_by_email RPC.
// For each row, classify: 'ok' | 'unknown_email' | 'already_in_pod' | 'new_pod_needed'.
// Show diff as a table; admin checks rows to commit.
```

- [ ] **Step 3:** On commit: create missing pods (no faculty), insert `pod_members` rows for classified-ok rows. Faculty must be attached manually afterward.

- [ ] **Step 4: Verify** — upload a CSV with 10 rows (2 unknown, 1 duplicate). Preview flags correctly; commit moves the 7 valid rows into pods.

- [ ] **Step 5: Commit**

```bash
git add admin-pods.html assets/pods.js
git commit -m "feat(pods): CSV import with preview diff"
```

### Task 10: Guardrail on `admin-faculty.html`

**Files:**
- Modify: `admin-faculty.html`

- [ ] **Step 1:** In the remove-handler, before `delete from cohort_faculty`, check:

```js
const { data: ownedPods } = await supabase
  .from('pod_faculty').select('pod_id,cohort_pods!inner(name,cohort_id)')
  .eq('faculty_user_id', r.user_id).eq('cohort_pods.cohort_id', r.cohort_id);
if (ownedPods?.length) {
  toast(`Cannot remove — still on pods: ${ownedPods.map(o=>o.cohort_pods.name).join(', ')}. Handoff first.`, 'err');
  return;
}
```

- [ ] **Step 2: Verify** — try to remove a faculty who owns a pod → blocked with clear toast. Remove their pod → removal succeeds.

- [ ] **Step 3: Commit**

```bash
git add admin-faculty.html
git commit -m "feat(pods): block faculty removal while they own pods"
```
