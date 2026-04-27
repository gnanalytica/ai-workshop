# Plan 3 — Faculty landing page: Today + Handbook

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan.

**Goal:** Faculty see a dedicated `faculty.html` on sign-in with a tab shell, a contextual "Today" view, and a static "Handbook". My pod, Whole cohort, and Analytics tabs come in Plans 4 and 5 — this plan wires the tab shell so they slot in cleanly.

**Architecture:** Single-page `faculty.html` with hash-routed tabs (`#today`, `#my-pod`, `#cohort`, `#analytics`, `#handbook`). A small tab-router in `assets/faculty-tabs.js` decides which panel to mount.

**Tech Stack:** Same static HTML + vanilla JS modules as existing admin pages.

**Spec:** "Faculty experience" section of `docs/superpowers/specs/2026-04-21-faculty-pods-design.md`.

**Prereq:** Plan 1 applied. Plan 2 optional for testing (you need a pod with a student to meaningfully populate Today, but the page should degrade gracefully when empty).

---

## Chunk 1: Shell, auth, routing

### Task 1: Redirect faculty post-sign-in

**Files:**
- Modify: `index.html` (if it handles post-auth redirect) or wherever the magic-link landing is handled.

- [ ] **Step 1: Audit** — `grep -n "emailRedirectTo\|signInWithOtp\|SIGNED_IN" index.html dashboard.html admin.html`. Find where signed-in users are routed.

- [ ] **Step 2:** Add a helper in `assets/admin-auth.js`:

```js
export async function routeAfterSignIn(user) {
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  if (profile?.is_admin) return; // let existing admin flow handle it
  const { data: fac } = await supabase.from('cohort_faculty').select('cohort_id').eq('user_id', user.id).limit(1);
  if (fac?.length) window.location.href = 'faculty.html';
}
```

Call from wherever the sign-in callback lands (likely `index.html` or `dashboard.html`).

- [ ] **Step 3: Verify** — sign in as a faculty-only user → lands on `faculty.html` (which will 404 until Task 2). Sign in as admin → unchanged. Sign in as student → unchanged.

- [ ] **Step 4: Commit**

```bash
git add assets/admin-auth.js index.html dashboard.html
git commit -m "feat(faculty): post-sign-in route to faculty.html"
```

### Task 2: `faculty.html` shell with tabs

**Files:**
- Create: `faculty.html`

- [ ] **Step 1:** Copy the head + gate + denied + toast structure from `admin-faculty.html`. Replace the panel:

```html
<main class="wrap" id="panel" style="display:none">
  <div id="adminNav"></div>

  <header style="margin:24px 0 8px;display:flex;gap:14px;align-items:baseline;justify-content:space-between;flex-wrap:wrap">
    <div>
      <div class="kicker">Faculty</div>
      <h1 id="fHello">Good morning.</h1>
    </div>
    <select id="fCohortSel" style="padding:8px 12px;border-radius:10px;background:var(--input-bg);border:1px solid var(--line);color:var(--ink)"></select>
  </header>

  <nav id="fTabs" role="tablist" style="display:flex;gap:6px;border-bottom:1px solid var(--line);margin:16px 0 20px">
    <a href="#today" data-tab="today" class="f-tab">Today</a>
    <a href="#my-pod" data-tab="my-pod" class="f-tab">My pod</a>
    <a href="#cohort" data-tab="cohort" class="f-tab">Whole cohort</a>
    <a href="#analytics" data-tab="analytics" class="f-tab">Analytics</a>
    <a href="#handbook" data-tab="handbook" class="f-tab">Handbook</a>
  </nav>

  <section id="fPanel"></section>
</main>
```

Add `.f-tab` styling (pill with active state) matching the admin nav aesthetic.

- [ ] **Step 2:** Script: auth gate → if not signed in show gate; if not faculty (and not admin), show denied; else load cohort list (scoped via `faculty_cohort_ids()`) and populate `#fCohortSel`; then mount the active tab.

```js
import { supabase } from './assets/supabase.js';
import { checkAdminOrFaculty, applyFacultyBrandLabel } from './assets/admin-auth.js';
import { mountFacultyTab } from './assets/faculty-tabs.js';

const STATE = { user: null, cohortId: null, isAdmin: false, isFaculty: false };

async function init() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return show('gate');
  const { isAdmin, isFaculty, facultyCohortIds } = await checkAdminOrFaculty(session.user);
  STATE.user = session.user; STATE.isAdmin = isAdmin; STATE.isFaculty = isFaculty;
  if (!isFaculty && !isAdmin) return show('denied');
  applyFacultyBrandLabel(isAdmin, isFaculty);
  show('panel');
  await loadCohorts(facultyCohortIds);
  wireTabs();
  await mountActiveTab();
}

async function loadCohorts(ids) {
  const { data } = await supabase.from('cohorts').select('id,name,slug').in('id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']).order('starts_on', { ascending: false });
  const sel = document.getElementById('fCohortSel');
  sel.innerHTML = (data || []).map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  STATE.cohortId = data?.[0]?.id || null;
  sel.addEventListener('change', async () => { STATE.cohortId = sel.value; await mountActiveTab(); });
}

function wireTabs() {
  window.addEventListener('hashchange', mountActiveTab);
}

async function mountActiveTab() {
  const tab = (location.hash || '#today').replace('#','');
  document.querySelectorAll('.f-tab').forEach(a => a.classList.toggle('active', a.dataset.tab === tab));
  await mountFacultyTab(tab, { state: STATE, container: document.getElementById('fPanel') });
}

init();
```

- [ ] **Step 3: Verify** — load `faculty.html` as faculty. Tabs render; clicking a tab updates hash; default is Today (panel empty until Task 4).

- [ ] **Step 4: Commit**

```bash
git add faculty.html
git commit -m "feat(faculty): faculty.html shell with hash-routed tabs"
```

### Task 3: `assets/faculty-tabs.js` router

**Files:**
- Create: `assets/faculty-tabs.js`

- [ ] **Step 1:**

```js
import { renderToday } from './faculty/today.js';
import { renderHandbook } from './faculty/handbook.js';

const NOT_READY = (name) => (ctx) => {
  ctx.container.innerHTML = `<div class="empty-state" style="padding:40px;text-align:center;color:var(--muted)">“${name}” ships in a later plan.</div>`;
};

const TABS = {
  'today': renderToday,
  'my-pod': NOT_READY('My pod'),
  'cohort': NOT_READY('Whole cohort'),
  'analytics': NOT_READY('Analytics'),
  'handbook': renderHandbook,
};

export async function mountFacultyTab(tab, ctx) {
  const fn = TABS[tab] || TABS['today'];
  await fn(ctx);
}
```

- [ ] **Step 2:** Create `assets/faculty/` dir with empty `today.js` and `handbook.js` exporting placeholder functions — page loads without errors.

- [ ] **Step 3: Commit**

```bash
git add assets/faculty-tabs.js assets/faculty/today.js assets/faculty/handbook.js
git commit -m "feat(faculty): tab router + placeholder tab modules"
```

---

## Chunk 2: Today tab

### Task 4: Today data fetch

**Files:**
- Modify: `assets/faculty/today.js`

- [ ] **Step 1:** Implement:

```js
import { supabase } from '../supabase.js';

async function loadToday(cohortId, userId) {
  // Today's schedule row
  const today = new Date().toISOString().slice(0,10);
  const { data: daySched } = await supabase
    .from('schedule').select('day_number,day_title,session_time,meet_link,unlocked_on')
    .eq('cohort_id', cohortId).eq('unlocked_on', today).maybeSingle();

  // My pods + member ids
  const { data: myPods } = await supabase.from('pod_faculty')
    .select('pod_id,cohort_pods!inner(id,name,cohort_id)')
    .eq('faculty_user_id', userId).eq('cohort_pods.cohort_id', cohortId);
  const podIds = (myPods || []).map(p => p.pod_id);
  const { data: members } = podIds.length
    ? await supabase.from('pod_members').select('student_user_id').in('pod_id', podIds)
    : { data: [] };
  const myStudentIds = [...new Set((members||[]).map(m => m.student_user_id))];

  if (!myStudentIds.length) return { daySched, subs: [], stuck: [], attendance: null };

  // Today's submissions from my pod
  const [{ data: subs }, { data: stuck }, { data: att }] = await Promise.all([
    supabase.from('submissions').select('id,user_id,day_number,status,created_at')
      .in('user_id', myStudentIds).gte('created_at', today).order('created_at', { ascending: false }),
    supabase.from('stuck_queue').select('id,user_id,day_number,created_at,resolved_at')
      .in('user_id', myStudentIds).is('resolved_at', null),
    supabase.from('attendance').select('user_id,status')
      .in('user_id', myStudentIds).eq('on_date', today),
  ]);
  const present = (att||[]).filter(a => a.status === 'present').length;
  const absent  = (att||[]).filter(a => a.status === 'absent').length;
  return { daySched, subs: subs||[], stuck: stuck||[], attendance: { present, absent, total: myStudentIds.length } };
}

export async function renderToday(ctx) {
  const { state, container } = ctx;
  if (!state.cohortId) { container.innerHTML = '<div class="empty-state">Pick a cohort above.</div>'; return; }
  container.innerHTML = '<div class="empty-state">Loading…</div>';
  const data = await loadToday(state.cohortId, state.user.id);
  container.innerHTML = tpl(data);
}

function tpl({ daySched, subs, stuck, attendance }) {
  const day = daySched
    ? `<div><b>Day ${daySched.day_number}</b> · ${daySched.day_title || ''} · ${daySched.session_time || 'time TBD'} · ${daySched.meet_link ? `<a href="${daySched.meet_link}">Meet link</a>` : 'no Meet link yet'}</div>`
    : `<div class="muted">No day unlocked for today.</div>`;

  const att = attendance
    ? `<div>Attendance: <b>${attendance.present}</b> present · <b>${attendance.absent}</b> absent · ${attendance.total - attendance.present - attendance.absent} unmarked</div>`
    : '';

  return `
    <section class="add-card">${day}${att}</section>

    <section class="add-card" style="margin-top:12px">
      <h3>Before class</h3>
      <ul><li>Skim today's lesson content</li><li>Review at-risk students in your pod</li><li>Queue today's polls from the agenda</li></ul>
      <h3>During class</h3>
      <ul><li>Monitor the stuck queue (${stuck.length} open for your pod)</li><li>Launch polls at the marked moments</li><li>Run breakouts / pairs</li></ul>
      <h3>After class</h3>
      <ul><li>Reply to open stuck items</li><li>Grade pending submissions</li><li>Post a recap for your pod (optional)</li></ul>
    </section>

    <section class="add-card" style="margin-top:12px">
      <h3>Today's submissions from your pod (${subs.length})</h3>
      ${subs.length ? `<ul>${subs.map(s => `<li>${s.user_id} · day ${s.day_number} · ${s.status}</li>`).join('')}</ul>` : '<div class="muted">None yet.</div>'}
      <h3 style="margin-top:14px">Open stuck items (${stuck.length})</h3>
      ${stuck.length ? `<ul>${stuck.map(s => `<li>${s.user_id} · day ${s.day_number} · ${new Date(s.created_at).toLocaleTimeString()}</li>`).join('')}</ul>` : '<div class="muted">Clear.</div>'}
    </section>`;
}
```

Note: column names (`unlocked_on`, `session_time`, `meet_link`, `on_date`, etc.) are best guesses — verify in staging and adjust. If the schedule table is named differently, adapt.

- [ ] **Step 2: Verify** — as faculty on a cohort with a pod and a student who submitted today, Today shows the submission. With no submissions, empty states show.

- [ ] **Step 3: Commit**

```bash
git add assets/faculty/today.js
git commit -m "feat(faculty): Today tab with day context + live pod signals"
```

---

## Chunk 3: Handbook tab

### Task 5: Static handbook content

**Files:**
- Modify: `assets/faculty/handbook.js`

- [ ] **Step 1:**

```js
export async function renderHandbook(ctx) {
  ctx.container.innerHTML = `
  <section class="add-card">
    <details open><summary><b>What you can track</b></summary>
      <p>Submissions, attendance, stuck-queue items, peer-review activity, and day-by-day progress for every student in your cohort. Drill into any student from the My pod or Whole cohort tabs.</p>
    </details>
    <details><summary><b>Before class</b></summary>
      <ul><li>Skim today's lesson content page.</li><li>Open the Today tab and review at-risk students in your pod.</li><li>Queue the day's polls from the admin polls page (ask an admin if you don't have access).</li></ul>
    </details>
    <details><summary><b>During class</b></summary>
      <ul><li>Watch the stuck queue badge; respond in real time or hand items to a TA.</li><li>Launch polls at the marked moments.</li><li>Run breakouts if in Meet; otherwise pair students in chat.</li></ul>
    </details>
    <details><summary><b>After class</b></summary>
      <ul><li>Close any open stuck items from your pod.</li><li>Grade pending submissions. Use the rubric drawer on the student row.</li><li>Optional: post a pod note for tomorrow.</li></ul>
    </details>
    <details><summary><b>Grading rubric summary</b></summary>
      <p>Milestones use a 4-point rubric: concept clarity, build quality, reflection depth, peer engagement. Inline notes are visible to the student once submitted.</p>
    </details>
    <details><summary><b>Escalation</b></summary>
      <p>For scheduling changes, enrollment issues, or anything a student needs admin action on, post in the faculty Slack channel or email your cohort lead.</p>
    </details>
    <details><summary><b>FAQ</b></summary>
      <p><b>Can I see students in other pods?</b> Yes — use the Whole cohort tab. You can grade and reply to any student in your cohort.</p>
      <p><b>Can I transfer my pod to another faculty?</b> Yes — use the Handoff button on your pod.</p>
      <p><b>Where do I find my pod's Meet link?</b> Today tab, top card.</p>
    </details>
  </section>`;
}
```

- [ ] **Step 2: Verify** — navigate to `#handbook`, content renders, details expand/collapse.

- [ ] **Step 3: Commit**

```bash
git add assets/faculty/handbook.js
git commit -m "feat(faculty): Handbook tab with collapsible sections"
```
