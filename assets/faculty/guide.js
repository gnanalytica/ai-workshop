import { DAYS, WEEK_TITLES } from '../days.js';

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const SETUP_ITEMS = [
  { id: 'chrome', label: 'Chrome (latest stable)', note: 'Required for web tools, Meet, and browser automation demos.' },
  { id: 'vscode', label: 'VS Code (or Cursor)', note: 'Editor for day 16+ build and agent sessions.' },
  { id: 'node', label: 'Node.js LTS (v20+)', note: 'Needed for npm packages, local scripts, and tooling demos.' },
  { id: 'git', label: 'Git', note: 'Required for GitHub workflows from Day 16 onward.' },
  { id: 'python', label: 'Python 3.11+', note: 'Needed for selected AI libs and browser-use demos.' },
  { id: 'ollama', label: 'Ollama (instructor machine at minimum)', note: 'Used in local LLM demos. Student devices optional.' },
  { id: 'docker', label: 'Docker Desktop (optional)', note: 'Helpful for local stacks / self-hosting workflows.' },
];

function setupKey(cohortId) {
  return `faculty_setup_${cohortId || 'default'}`;
}

function getSetupState(cohortId) {
  try {
    const raw = localStorage.getItem(setupKey(cohortId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setSetupState(cohortId, state) {
  localStorage.setItem(setupKey(cohortId), JSON.stringify(state));
}

function inferCohortDay(cohort) {
  if (!cohort?.starts_on) return 1;
  const start = new Date(`${cohort.starts_on}T00:00:00`);
  if (Number.isNaN(start.getTime())) return 1;
  const diff = Math.floor((Date.now() - start.getTime()) / 86400000) + 1;
  return Math.max(1, Math.min(30, diff));
}

function playbookByDay(day) {
  if (day <= 10) {
    return {
      before: ['Read objective + in-class checkpoints once.', 'Open Stream and clear yesterday’s stuck items if any.', 'Confirm lab login, Meet/audio, and one fallback example if the trainer’s demo fails.'],
      during: ['Reinforce the trainer’s outcome; don’t fork the lesson plan.', 'After each trainer demo, get students hands-on before moving on.', 'Circulate: fix passwords, installs, and links before debugging “why won’t my prompt work”.'],
      after: ['Sweep the stuck queue; escalate grading or policy questions to the trainer.', 'Note repeat blockers for the trainer’s next session plan.', 'Optional: one-line pod nudge on tomorrow’s prep.'],
    };
  }
  if (day <= 20) {
    return {
      before: ['Skim lab steps and expected artifacts.', 'Open Insights / Stream and note who is behind.', 'Have a fallback exercise if an API or tool is down.'],
      during: ['Ask students to explain choices, not paste outputs.', 'Checkpoint every 15–20 minutes with a concrete artifact.', 'Pair students before you step in; avoid doing the task for them.'],
      after: ['Close stuck items you started; hand off grading to the trainer.', 'Tag repeated failure patterns for the trainer.', 'Skim attendance / activity only to nudge, not to change records.'],
    };
  }
  return {
    before: ['Review demo/rubric expectations with the trainer if needed.', 'Prepare coaching prompts for rehearsal (clarity, pacing, ask).', 'Spot-check deploy/showcase links from a fresh browser.'],
    during: ['Coach delivery and nerves; defer scoring to the trainer.', 'Prioritize blockers that block demo day.', 'Capture one win and one risk per team for the trainer.'],
    after: ['Send grading and rubric questions to the trainer.', 'Follow up on safety, model, and deployment checklists with students.', 'Help teams set one fix target for the next rehearsal.'],
  };
}

function quickLearnDays(dayNow) {
  const start = Math.min(30, dayNow + 1);
  const end = Math.min(30, dayNow + 5);
  const out = [];
  for (let n = start; n <= end; n += 1) {
    const d = DAYS.find((x) => x.n === n);
    if (d) out.push(d);
  }
  return out;
}

function getSectionBlock(md, headingTitle) {
  const lines = String(md || '').split(/\r?\n/);
  const wanted = `### ${headingTitle}`.toLowerCase();
  let start = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].trim().toLowerCase() === wanted) {
      start = i + 1;
      break;
    }
  }
  if (start === -1) return '';
  const out = [];
  for (let i = start; i < lines.length; i += 1) {
    if (/^###\s+/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join('\n').trim();
}

function parseBullets(block, max = 6) {
  const lines = String(block || '').split(/\r?\n/);
  const out = [];
  for (const ln of lines) {
    const m = ln.match(/^\s*[-*]\s+(.*)$/);
    if (!m) continue;
    out.push(m[1].trim());
    if (out.length >= max) break;
  }
  return out;
}

function parseAgendaRows(block, max = 5) {
  const lines = String(block || '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  const out = [];
  for (const ln of lines) {
    if (!ln.startsWith('|') || /\|---/.test(ln)) continue;
    const cols = ln.split('|').map((x) => x.trim()).filter(Boolean);
    if (cols.length < 3) continue;
    if (cols[0].toLowerCase() === 'block') continue;
    out.push({ block: cols[0], time: cols[1], what: cols[2] });
    if (out.length >= max) break;
  }
  return out;
}

function parseNumberedActions(block, max = 5) {
  const lines = String(block || '').split(/\r?\n/);
  const out = [];
  for (const ln of lines) {
    const m = ln.match(/^\s*\d+\.\s+(.*)$/);
    if (!m) continue;
    out.push(m[1].trim());
    if (out.length >= max) break;
  }
  return out;
}

async function buildInstructorScript(dayNumber) {
  const pad = String(dayNumber).padStart(2, '0');
  try {
    const res = await fetch(`content/day-${pad}.md`, { cache: 'no-cache' });
    if (!res.ok) throw new Error('lesson not found');
    const md = await res.text();
    const agenda = parseAgendaRows(getSectionBlock(md, 'Agenda'));
    let checkpointsBlock = getSectionBlock(md, 'In-class checkpoints');
    if (!checkpointsBlock) checkpointsBlock = getSectionBlock(md, 'In-class moments (minute-by-minute)');
    const moments = parseBullets(checkpointsBlock, 6);
    const post = parseNumberedActions(getSectionBlock(md, '1. Immediate action (~40 min)'), 4);
    const fallbackPost = post.length ? post : parseNumberedActions(getSectionBlock(md, 'Post-class · ~2 hour focused block'), 5);
    return { agenda, moments, post: fallbackPost };
  } catch {
    return { agenda: [], moments: [], post: [] };
  }
}

function renderSetupChecklist(cohortId) {
  const state = getSetupState(cohortId);
  const done = SETUP_ITEMS.filter((i) => state[i.id]).length;
  return `
  <section class="add-card" style="padding:16px">
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap">
      <h3 style="margin:0">Computer Setup Checklist</h3>
      <span class="kicker-tag">${done}/${SETUP_ITEMS.length} complete</span>
    </div>
    <p class="muted" style="margin:8px 0 12px;font-size:13px">Use this before each new cohort batch. Keep lab systems pre-installed and validated.</p>
    <div id="facSetupList" style="display:flex;flex-direction:column;gap:8px">
      ${SETUP_ITEMS.map((i) => `
        <label style="display:flex;gap:10px;align-items:flex-start;padding:8px 10px;border:1px solid var(--line);border-radius:10px;background:var(--input-bg)">
          <input type="checkbox" data-setup="${esc(i.id)}" ${state[i.id] ? 'checked' : ''} style="margin-top:2px" />
          <span>
            <b style="font-size:13px">${esc(i.label)}</b>
            <div class="muted" style="font-size:12px">${esc(i.note)}</div>
          </span>
        </label>
      `).join('')}
    </div>
  </section>`;
}

function teacherSheetHtml({ current, script, pb }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Teacher Sheet · Day ${esc(String(current.n).padStart(2, '0'))}</title>
  <style>
    body{font-family:Inter,Arial,sans-serif;color:#111;max-width:900px;margin:24px auto;padding:0 16px;line-height:1.45}
    h1{margin:0 0 4px;font-size:24px}
    h2{margin:18px 0 8px;font-size:16px}
    .muted{color:#555;font-size:12px}
    .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
    .card{border:1px solid #ddd;border-radius:8px;padding:10px}
    ul{margin:8px 0 0;padding-left:18px}
    li{margin:4px 0;font-size:13px}
    @media print{body{margin:0;padding:0 4mm}.no-print{display:none}}
  </style>
</head>
<body>
  <button class="no-print" onclick="window.print()" style="margin-bottom:12px">Print</button>
  <h1>Day ${esc(String(current.n).padStart(2, '0'))} · ${esc(current.title)}</h1>
  <div class="muted">${esc(WEEK_TITLES[current.w] || '')}</div>

  <h2>Agenda</h2>
  ${script.agenda.length
    ? `<ul>${script.agenda.map((r) => `<li><b>${esc(r.time)}</b> · ${esc(r.block)} — ${esc(r.what)}</li>`).join('')}</ul>`
    : '<div class="muted">No agenda parsed. Use lesson page.</div>'}

  <h2>In-class checkpoints</h2>
  ${script.moments.length
    ? `<ul>${script.moments.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
    : '<div class="muted">No in-class checkpoints parsed.</div>'}

  <h2>Facilitation Checklist</h2>
  <div class="grid">
    <div class="card"><b>Before class</b><ul>${pb.before.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="card"><b>During class</b><ul>${pb.during.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="card"><b>After class</b><ul>${(script.post.length ? script.post : pb.after).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
  </div>
</body>
</html>`;
}

export async function renderGuide({ state, container }) {
  const cohort = (state.cohorts || []).find((c) => c.id === state.cohortId) || null;
  const dayNow = inferCohortDay(cohort);
  const upcoming = quickLearnDays(dayNow);
  const current = DAYS.find((d) => d.n === dayNow) || DAYS[0];
  const pb = playbookByDay(dayNow);
  const script = await buildInstructorScript(current.n);

  container.innerHTML = `
    <section class="add-card" style="padding:16px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap">
        <div>
          <div class="kicker">Quick Learn Dashboard</div>
          <h2 style="margin:6px 0 0">Prepare 1 week ahead</h2>
        </div>
        <span class="kicker-tag">Current class day: ${esc(String(dayNow).padStart(2, '0'))}</span>
      </div>
      <p class="muted" style="margin:10px 0 14px;font-size:13px">Use this panel to prepare the next 5 sessions before students arrive. Read objective + lab flow + likely blockers in advance.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">
        ${upcoming.map((d) => `
          <a href="day.html?n=${d.n}" style="display:block;text-decoration:none;color:inherit;border:1px solid var(--line);background:var(--input-bg);border-radius:12px;padding:12px">
            <div style="font-size:11px;color:var(--muted);letter-spacing:.12em">WEEK ${String(d.w).padStart(2, '0')} · DAY ${String(d.n).padStart(2, '0')}</div>
            <div style="margin-top:6px;font-size:13.5px;font-weight:600;line-height:1.35">${esc(d.title)}</div>
          </a>
        `).join('')}
      </div>
    </section>

    ${renderSetupChecklist(state.cohortId)}

    <section class="add-card" style="padding:16px">
      <div class="kicker">Day-by-day facilitation guide</div>
      <h3 style="margin:6px 0 10px">How to run Day ${esc(String(current.n).padStart(2, '0'))} · ${esc(current.title)}</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px">
        <div style="border:1px solid var(--line);border-radius:12px;padding:12px;background:var(--input-bg)">
          <div class="kicker-tag">Before class</div>
          <ul style="margin:10px 0 0;padding-left:18px;font-size:13px">${pb.before.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
        <div style="border:1px solid var(--line);border-radius:12px;padding:12px;background:var(--input-bg)">
          <div class="kicker-tag">During class</div>
          <ul style="margin:10px 0 0;padding-left:18px;font-size:13px">${pb.during.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
        <div style="border:1px solid var(--line);border-radius:12px;padding:12px;background:var(--input-bg)">
          <div class="kicker-tag">After class / study hours</div>
          <ul style="margin:10px 0 0;padding-left:18px;font-size:13px">${pb.after.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
      </div>
      <div style="margin-top:12px;font-size:13px">
        <a href="day.html?n=${current.n}" style="color:var(--accent)">Open lesson flow →</a>
        <span class="muted"> · ${esc(WEEK_TITLES[current.w] || '')}</span>
      </div>
    </section>

    <section class="add-card" style="padding:16px">
      <div class="kicker">Instructor script (auto from lesson content)</div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
        <h3 style="margin:6px 0 10px">In-class checkpoints · Day ${esc(String(current.n).padStart(2, '0'))}</h3>
        <button type="button" id="facPrintTeacherSheet" class="btn-sm" style="margin-bottom:8px">Print teacher sheet</button>
      </div>
      <div style="display:grid;grid-template-columns:1.1fr 1fr 1fr;gap:10px">
        <div style="border:1px solid var(--line);border-radius:12px;padding:12px;background:var(--input-bg)">
          <b style="font-size:13px">Class agenda</b>
          ${script.agenda.length
            ? `<ul style="margin:10px 0 0;padding-left:18px;font-size:12.5px">${script.agenda.map((r) => `<li><b>${esc(r.time)}</b> · ${esc(r.block)} — ${esc(r.what)}</li>`).join('')}</ul>`
            : '<div class="muted" style="margin-top:8px;font-size:12px">No structured agenda detected. Use the lesson "Agenda" section manually.</div>'}
        </div>
        <div style="border:1px solid var(--line);border-radius:12px;padding:12px;background:var(--input-bg)">
          <b style="font-size:13px">In-class checkpoints</b>
          ${script.moments.length
            ? `<ul style="margin:10px 0 0;padding-left:18px;font-size:12.5px">${script.moments.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
            : '<div class="muted" style="margin-top:8px;font-size:12px">No checkpoint bullets detected in lesson content.</div>'}
        </div>
        <div style="border:1px solid var(--line);border-radius:12px;padding:12px;background:var(--input-bg)">
          <b style="font-size:13px">Post-class follow-up script</b>
          ${script.post.length
            ? `<ul style="margin:10px 0 0;padding-left:18px;font-size:12.5px">${script.post.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
            : `<ul style="margin:10px 0 0;padding-left:18px;font-size:12.5px">${pb.after.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`}
        </div>
      </div>
      <p class="muted" style="font-size:12px;margin:10px 0 0">This is parsed from the day lesson markdown. If a section is missing, fallback guidance is used.</p>
    </section>

    <section class="add-card" style="padding:16px">
      <h3 style="margin:0 0 10px">Operational shortcuts (tracking, grading, scoring)</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">
        <a href="#today" style="display:block;text-decoration:none;color:inherit;border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--input-bg)">
          <b>Live class operations</b>
          <div class="muted" style="font-size:12px;margin-top:4px">Stuck queue, needs grading, session readiness.</div>
        </a>
        <a href="#students" style="display:block;text-decoration:none;color:inherit;border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--input-bg)">
          <b>Student support view</b>
          <div class="muted" style="font-size:12px;margin-top:4px">My pod / whole cohort with signals.</div>
        </a>
        <a href="#review" style="display:block;text-decoration:none;color:inherit;border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--input-bg)">
          <b>Progress analytics</b>
          <div class="muted" style="font-size:12px;margin-top:4px">Completion, at-risk, grading throughput.</div>
        </a>
        <a href="admin-student.html" style="display:block;text-decoration:none;color:inherit;border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--input-bg)">
          <b>Grade submissions</b>
          <div class="muted" style="font-size:12px;margin-top:4px">Review assignment submissions and score.</div>
        </a>
        <a href="admin-content.html" style="display:block;text-decoration:none;color:inherit;border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--input-bg)">
          <b>Rubrics and quiz setup</b>
          <div class="muted" style="font-size:12px;margin-top:4px">Criteria, max points, question bank updates.</div>
        </a>
        <a href="admin-analytics.html" style="display:block;text-decoration:none;color:inherit;border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--input-bg)">
          <b>Cohort tracking</b>
          <div class="muted" style="font-size:12px;margin-top:4px">Attendance, velocity, trends.</div>
        </a>
        <a href="faculty-guide.html" style="display:block;text-decoration:none;color:inherit;border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--input-bg)">
          <b>Support faculty handbook</b>
          <div class="muted" style="font-size:12px;margin-top:4px">Role, triage flowchart, debugging recipes, pre-session checklist.</div>
        </a>
      </div>
    </section>
  `;

  const setupState = getSetupState(state.cohortId);
  container.querySelectorAll('[data-setup]').forEach((el) => {
    el.addEventListener('change', () => {
      setupState[el.getAttribute('data-setup')] = !!el.checked;
      setSetupState(state.cohortId, setupState);
      renderGuide({ state, container });
    });
  });
  container.querySelector('#facPrintTeacherSheet')?.addEventListener('click', () => {
    const w = window.open('', '_blank', 'noopener,noreferrer,width=980,height=900');
    if (!w) return;
    w.document.open();
    w.document.write(teacherSheetHtml({ current, script, pb }));
    w.document.close();
  });
}

