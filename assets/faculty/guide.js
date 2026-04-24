import { DAYS, WEEK_TITLES } from '../days.js';
import { setFacultyHash, setActiveFacultyNav, scrollToFacultySection } from './section-registry.js';

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const SETUP_ITEMS = [
  { id: 'chrome', label: 'Chrome (latest stable)', note: 'Required for web tools, Meet, and browser automation demos.' },
  { id: 'antigravity', label: 'Google Antigravity', note: 'Primary editor for vibe coding, agents, and build weeks.' },
  { id: 'cursor', label: 'Cursor (optional)', note: 'Second IDE; install only if the cohort wants both Antigravity and Cursor.' },
  { id: 'node', label: 'Node.js LTS (v20+)', note: 'Needed for npm packages, local scripts, and tooling demos.' },
  { id: 'n8n', label: 'n8n (global npm after Node)', note: 'Workflow automation; `npm i -g n8n` then n8n start + localhost:5678 per setup guide.' },
  { id: 'git', label: 'Git for Windows + setup', note: 'Install Git, set user.name/email, GitHub sign-in, smoke clone—see setup guide §7/7b.' },
  { id: 'python', label: 'Python 3.11+ + pip (transformers, huggingface_hub, langchain)', note: 'See setup guide: pip install after Python. Used in token/HF and LangChain labs.' },
  { id: 'ollama', label: 'Ollama (instructor machine at minimum)', note: 'Used in local LLM demos. Student devices optional.' },
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
      before: [
        'Read the lesson objective and in-class checkpoints in day.html.',
        'In Stream, clear or reassign any stuck items carried from the prior session.',
        'Verify lab logins, Meet, and audio; have a backup demo path if the primary demo fails.',
      ],
      during: [
        "Align in-room work to the trainer’s stated outcome; do not change the published lesson order without the trainer.",
        'After each trainer segment, run hands-on work before the next block.',
        'Triage: passwords, installs, and broken links before deep model or prompt debugging.',
      ],
      after: [
        'Update the stuck queue; route grading and policy questions to the trainer.',
        'Log repeat blockers for the next session plan.',
        'Distribute the next session prep link per cohort runbook.',
      ],
    };
  }
  if (day <= 20) {
    return {
      before: [
        'Review lab steps, rubric artifacts, and pass criteria.',
        'In Insights / Stream, list students who are behind schedule.',
        'Prepare a reduced-scope exercise if an external API or tool is unavailable.',
      ],
      during: [
        'Have students explain design choices, not only paste model output.',
        'Checkpoint on a defined artifact on a regular cadence (e.g. 15–20 min).',
        'Use peer pairing per trainer policy before instructor takeover.',
      ],
      after: [
        'Close stuck items you opened; hand grading to the trainer where policy requires.',
        'Document repeated failure classes for the trainer.',
        'Use attendance and activity for triage only; official records follow trainer process.',
      ],
    };
  }
  return {
    before: [
      'Align with the trainer on demo and rubric expectations.',
      'Draft rehearsal prompts: goals, timebox, and expected artifacts.',
      'Verify deploy and showcase links from a clean browser profile.',
    ],
    during: [
      'Give structure and time feedback; defer formal scoring to the trainer.',
      'Triage blockers that prevent demo completion first.',
      'Log open risks and dependencies per team for the trainer’s sync.',
    ],
    after: [
      'Send grading and rubric questions to the trainer.',
      'Track safety, model-use, and deployment checklist items with students per policy.',
      'Record one engineering fix or scope cut per team for the next rehearsal.',
    ],
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

  <h2>Runbook checklist</h2>
  <div class="grid">
    <div class="card"><b>Pre-session</b><ul>${pb.before.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="card"><b>In-session</b><ul>${pb.during.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="card"><b>Post-session</b><ul>${(script.post.length ? script.post : pb.after).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
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
          <div class="kicker">Lesson prep</div>
          <h2 style="margin:6px 0 0">Next five class days</h2>
        </div>
        <span class="kicker-tag">Cohort class day: ${esc(String(dayNow).padStart(2, '0'))}</span>
      </div>
      <p class="muted" style="margin:10px 0 14px;font-size:13px">Objectives, lab flow, and known failure modes for the upcoming sessions—read before live block.</p>
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
      <div class="kicker">Session runbook</div>
      <h3 style="margin:6px 0 10px">Day ${esc(String(current.n).padStart(2, '0'))} · ${esc(current.title)}</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px">
        <div style="border:1px solid var(--line);border-radius:12px;padding:12px;background:var(--input-bg)">
          <div class="kicker-tag">Pre-session</div>
          <ul style="margin:10px 0 0;padding-left:18px;font-size:13px">${pb.before.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
        <div style="border:1px solid var(--line);border-radius:12px;padding:12px;background:var(--input-bg)">
          <div class="kicker-tag">In-session</div>
          <ul style="margin:10px 0 0;padding-left:18px;font-size:13px">${pb.during.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
        <div style="border:1px solid var(--line);border-radius:12px;padding:12px;background:var(--input-bg)">
          <div class="kicker-tag">Post-session</div>
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
        <a href="#faculty-handbook" class="fac-handbook-frag" data-frag="" style="display:block;text-decoration:none;color:inherit;border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--input-bg)">
          <b>Program handbook</b>
          <div class="muted" style="font-size:12px;margin-top:4px">Full reference embedded in the <strong>Handbook</strong> section on this page.</div>
        </a>
      </div>
    </section>

    <section class="add-card" style="padding:16px">
      <div class="kicker">Handbook &amp; lab setup</div>
      <h3 style="margin:0 0 8px;font-size:16px">Jump to embedded documents</h3>
      <p class="muted" style="font-size:13px;line-height:1.6;margin:0 0 12px">Scrolls this page and moves the iframe to the right fragment (same URLs as standalone <code>faculty-guide.html</code> / <code>setup-guide.html</code>).</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <a href="#faculty-handbook" class="btn-sm fac-handbook-frag" data-frag="lifecycle" style="text-decoration:none">Teaching day</a>
        <a href="#faculty-handbook" class="btn-sm fac-handbook-frag" data-frag="triage" style="text-decoration:none">Triage flow</a>
        <a href="#faculty-handbook" class="btn-sm fac-handbook-frag" data-frag="checklist" style="text-decoration:none">Checklist</a>
        <a href="#faculty-handbook" class="btn-sm fac-handbook-frag" data-frag="artifacts" style="text-decoration:none">Artifacts</a>
        <a href="#faculty-handbook" class="btn-sm fac-handbook-frag" data-frag="debug" style="text-decoration:none">Quick fixes</a>
        <a href="#lab-setup" class="btn-sm fac-labsetup-jump" data-frag="one-time-full-setup" style="text-decoration:none">Install playbook</a>
        <a href="#lab-setup" class="btn-sm fac-labsetup-jump" data-frag="verification" style="text-decoration:none">Verification</a>
      </div>
    </section>

    <section class="add-card" style="padding:16px">
      <div class="kicker">Site</div>
      <h3 style="margin:0 0 8px;font-size:16px">Searchable setup issues</h3>
      <p class="muted" style="font-size:13px;line-height:1.6;margin:0 0 10px">If a machine issue repeats, post to the community board with tag <code>setup</code>.</p>
      <a class="btn-sm" href="board.html" style="text-decoration:none">Community board</a>
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

  const setFrameSrc = (id, base, frag) => {
    const trySet = () => {
      const fr = document.getElementById(id);
      if (fr) {
        fr.src = frag ? `${base}#${frag}` : base;
        return true;
      }
      return false;
    };
    if (trySet()) return;
    let n = 0;
    const t = setInterval(() => {
      n += 1;
      if (trySet() || n > 20) clearInterval(t);
    }, 50);
  };
  const goHandbook = (frag) => {
    setFacultyHash('faculty-handbook', { replace: false });
    setActiveFacultyNav('faculty-handbook');
    scrollToFacultySection('faculty-handbook', { behavior: 'smooth' });
    requestAnimationFrame(() => setFrameSrc('facHandbookFrame', 'faculty-guide.html', frag));
  };
  const goLab = (frag) => {
    setFacultyHash('lab-setup', { replace: false });
    setActiveFacultyNav('lab-setup');
    scrollToFacultySection('lab-setup', { behavior: 'smooth' });
    requestAnimationFrame(() => setFrameSrc('facLabSetupFrame', 'setup-guide.html', frag));
  };

  container.querySelectorAll('a.fac-handbook-frag').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      goHandbook(a.getAttribute('data-frag') || '');
    });
  });
  container.querySelectorAll('a.fac-labsetup-jump').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      goLab(a.getAttribute('data-frag') || '');
    });
  });
}

