// Polls admin UI mounted inside admin-home.html (prefixed element ids: p2_*).
import { supabase } from './supabase.js';

const $ = (id) => document.getElementById(`p2_${id}`);

let COHORT = null;
let POLLS = [];
let COUNTS = new Map();
let ACTIVE_TAB = 'open';
let liveChannel = null;
let liveState = null;
let rowChannel = null;
let getCohortRef = () => null;
let teardownFns = [];
let toastRef = (m) => console.warn(m);
let confirmDialogRef = async () => false;

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function rel(ts) {
  if (!ts) return '—';
  const d = (Date.now() - new Date(ts).getTime()) / 1000;
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

function populateDayOptions(sel) {
  if (!sel) return;
  sel.innerHTML = '<option value="">Standalone (not tied to a day)</option>';
  for (let i = 1; i <= 30; i++) {
    const o = document.createElement('option');
    o.value = String(i);
    o.textContent = `Day ${String(i).padStart(2, '0')}`;
    sel.appendChild(o);
  }
}

function wireCreate() {
  const head = $('createHead');
  const toggle = $('createToggle');
  if (head) {
    head.addEventListener('click', (e) => {
      if (e.target.id !== 'p2_createToggle') toggleCreate();
    });
  }
  if (toggle) toggle.addEventListener('click', toggleCreate);
  $('createCancel')?.addEventListener('click', () => toggleCreate(false));
  $('f_kind')?.addEventListener('change', onKindChange);
  $('f_add_opt')?.addEventListener('click', () => addOptRow($('f_opts'), ''));
  $('createBtn')?.addEventListener('click', () => onCreate());
  onKindChange();
}

function toggleCreate(force) {
  const body = $('createBody');
  if (!body) return;
  const open = typeof force === 'boolean' ? force : body.style.display === 'none';
  body.style.display = open ? 'grid' : 'none';
  const t = $('createToggle');
  if (t) t.textContent = open ? 'Collapse' : 'Expand';
}

function onKindChange() {
  const k = $('f_kind')?.value;
  const show = k === 'single' || k === 'multi' || k === 'emoji';
  const wrap = $('f_opts_wrap');
  if (wrap) wrap.style.display = show ? '' : 'none';
  const opts = $('f_opts');
  if (show && opts && opts.children.length === 0) {
    if (k === 'emoji') ['👍', '🤔', '❤️', '😂'].forEach((e) => addOptRow(opts, e));
    else {
      addOptRow(opts, '');
      addOptRow(opts, '');
    }
  }
}

function renderOptsEditor(container, opts) {
  if (!container) return;
  container.innerHTML = '';
  (opts || []).forEach((o) => addOptRow(container, o));
}

function addOptRow(container, val) {
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'opt-row';
  row.innerHTML = `<input type="text" value="${esc(val)}" placeholder="Option…" aria-label="Option text"/><button type="button" aria-label="Remove option">×</button>`;
  row.querySelector('button').addEventListener('click', () => row.remove());
  container.appendChild(row);
}

function collectOpts(container) {
  if (!container) return [];
  return [...container.querySelectorAll('.opt-row input')].map((i) => i.value.trim()).filter(Boolean);
}

async function onCreate() {
  const msg = $('createMsg');
  if (msg) {
    msg.className = 'msg';
    msg.textContent = '';
  }
  const title = $('f_title')?.value.trim();
  const question = $('f_question')?.value.trim();
  const kind = $('f_kind')?.value;
  const dayVal = $('f_day')?.value;
  const options = kind === 'single' || kind === 'multi' || kind === 'emoji' ? collectOpts($('f_opts')) : [];
  if (!title || !question) {
    if (msg) {
      msg.className = 'msg show err';
      msg.textContent = 'Title and question are required.';
    }
    return;
  }
  if ((kind === 'single' || kind === 'multi' || kind === 'emoji') && options.length < 2) {
    if (msg) {
      msg.className = 'msg show err';
      msg.textContent = 'Add at least 2 options.';
    }
    return;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from('polls').insert({
    cohort_id: COHORT.id,
    day_number: dayVal ? parseInt(dayVal, 10) : null,
    title,
    question,
    kind,
    options,
    is_open: false,
    created_by: user.id,
  });
  if (error) {
    if (msg) {
      msg.className = 'msg show err';
      msg.textContent = error.message;
    }
    return;
  }
  if (msg) {
    msg.className = 'msg show ok';
    msg.textContent = 'Poll created.';
  }
  if ($('f_title')) $('f_title').value = '';
  if ($('f_question')) $('f_question').value = '';
  if ($('f_day')) $('f_day').value = '';
  const fo = $('f_opts');
  if (fo) fo.innerHTML = '';
  onKindChange();
  await refresh();
  setTimeout(() => {
    if (msg) {
      msg.className = 'msg';
      msg.textContent = '';
    }
    toggleCreate(false);
  }, 900);
}

async function refresh() {
  if (!COHORT) return;
  const body = $('pollsBody');
  const { data, error } = await supabase.from('polls').select('*').eq('cohort_id', COHORT.id).order('created_at', { ascending: false });
  if (error) {
    if (body) body.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:#ffa0a0">${esc(error.message)}</td></tr>`;
    return;
  }
  POLLS = data || [];
  await loadCounts();
  renderStats();
  renderList();
}

async function loadCounts() {
  COUNTS = new Map();
  if (!POLLS.length) return;
  const { data } = await supabase.from('poll_aggregates').select('poll_id,total_responses');
  if (data) {
    for (const r of data) COUNTS.set(r.poll_id, r.total_responses || 0);
    return;
  }
  const ids = POLLS.map((p) => p.id);
  const { data: rr } = await supabase.from('poll_responses').select('poll_id').in('poll_id', ids);
  for (const r of rr || []) COUNTS.set(r.poll_id, (COUNTS.get(r.poll_id) || 0) + 1);
}

function sameDay(ts) {
  if (!ts) return false;
  const a = new Date(ts);
  const b = new Date();
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function renderStats() {
  const total = POLLS.length;
  const open = POLLS.filter((p) => p.is_open).length;
  const responsesTotal = [...COUNTS.values()].reduce((a, b) => a + b, 0);
  const today = POLLS.filter((p) => sameDay(p.created_at)).length;
  const row = $('statsRow');
  if (row) {
    row.innerHTML = `
      <div class="stat-card"><div class="lbl">Open now</div><div class="val">${open}</div></div>
      <div class="stat-card"><div class="lbl">Total polls</div><div class="val">${total}</div></div>
      <div class="stat-card"><div class="lbl">Today</div><div class="val">${today}</div></div>
      <div class="stat-card"><div class="lbl">Responses</div><div class="val">${responsesTotal}</div></div>`;
  }
}

function filteredPolls() {
  if (ACTIVE_TAB === 'open') return POLLS.filter((p) => p.is_open);
  if (ACTIVE_TAB === 'today') return POLLS.filter((p) => sameDay(p.created_at));
  if (ACTIVE_TAB === 'past') return POLLS.filter((p) => !p.is_open);
  return POLLS;
}

function renderList() {
  const body = $('pollsBody');
  if (!body) return;
  const rows = filteredPolls();
  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--muted)">No polls match this filter.</td></tr>`;
    return;
  }
  body.innerHTML = rows
    .map((p) => {
      const count = COUNTS.get(p.id) || 0;
      const dayStr = p.day_number ? `Day ${String(p.day_number).padStart(2, '0')}` : 'Standalone';
      const state = p.is_open
        ? `<span class="dot-open"></span><span class="tag tag-ok">Open</span>`
        : `<span class="dot-closed"></span><span class="tag tag-cancel">Closed</span>`;
      return `<tr data-id="${esc(p.id)}">
        <td><div style="font-weight:600">${esc(p.title)}</div><div style="font-size:12px;color:var(--muted);margin-top:2px">${esc(p.question)}</div></td>
        <td><span class="kind-badge k-${esc(p.kind)}">${esc(p.kind)}</span></td>
        <td>${esc(dayStr)}</td>
        <td>${state}</td>
        <td style="font-family:'JetBrains Mono',monospace">${count}</td>
        <td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--muted)">${esc(rel(p.created_at))}</td>
        <td>
          <div class="row-actions">
            ${p.is_open ? `<button data-act="close">Close</button>` : `<button data-act="launch" class="primary">Launch</button>`}
            <button data-act="view">View live</button>
            <button data-act="edit">Edit</button>
            <button data-act="delete" class="danger">Delete</button>
          </div>
        </td>
      </tr>`;
    })
    .join('');
  body.querySelectorAll('tr').forEach((tr) => {
    tr.querySelectorAll('button[data-act]').forEach((b) => {
      b.addEventListener('click', () => onRowAction(tr.dataset.id, b.dataset.act));
    });
  });
}

async function onRowAction(id, act) {
  const poll = POLLS.find((p) => p.id === id);
  if (!poll) return;
  if (act === 'launch') {
    const { error } = await supabase
      .from('polls')
      .update({ is_open: true, opened_at: new Date().toISOString(), closed_at: null })
      .eq('id', id);
    if (error) toastRef(error.message, { error: true });
    else refresh();
  } else if (act === 'close') {
    const { error } = await supabase.from('polls').update({ is_open: false, closed_at: new Date().toISOString() }).eq('id', id);
    if (error) toastRef(error.message, { error: true });
    else refresh();
  } else if (act === 'delete') {
    const ok = await confirmDialogRef(`Delete poll "${poll.title}"? Responses will be deleted too.`, {
      title: 'Delete poll',
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;
    const { error } = await supabase.from('polls').delete().eq('id', id);
    if (error) toastRef(error.message, { error: true });
    else refresh();
  } else if (act === 'edit') {
    openEdit(poll);
  } else if (act === 'view') {
    openDrawer(poll);
  }
}

function wireTabs() {
  const tabs = $('tabs');
  if (!tabs) return;
  tabs.querySelectorAll('button').forEach((b) => {
    b.addEventListener('click', () => {
      ACTIVE_TAB = b.dataset.tab;
      tabs.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
      renderList();
    });
  });
}

let editingId = null;
function wireEdit() {
  $('e_add_opt')?.addEventListener('click', () => addOptRow($('e_opts'), ''));
  $('editCancel')?.addEventListener('click', closeEdit);
  $('editSave')?.addEventListener('click', saveEdit);
  $('editBack')?.addEventListener('click', (e) => {
    if (e.target.id === 'p2_editBack') closeEdit();
  });
}

function openEdit(poll) {
  editingId = poll.id;
  const et = $('editTitle');
  if (et) et.textContent = `Edit · ${poll.title}`;
  if ($('e_title')) $('e_title').value = poll.title || '';
  if ($('e_question')) $('e_question').value = poll.question || '';
  if ($('e_day')) $('e_day').value = poll.day_number ? String(poll.day_number) : '';
  const needsOpts = poll.kind === 'single' || poll.kind === 'multi' || poll.kind === 'emoji';
  const ow = $('e_opts_wrap');
  if (ow) ow.style.display = needsOpts ? '' : 'none';
  renderOptsEditor($('e_opts'), poll.options || []);
  const em = $('editMsg');
  if (em) {
    em.className = 'msg';
    em.textContent = '';
  }
  $('editBack')?.classList.add('show');
}

function closeEdit() {
  $('editBack')?.classList.remove('show');
  editingId = null;
}

async function saveEdit() {
  if (!editingId) return;
  const poll = POLLS.find((p) => p.id === editingId);
  if (!poll) return;
  const upd = {
    title: $('e_title')?.value.trim(),
    question: $('e_question')?.value.trim(),
    day_number: $('e_day')?.value ? parseInt($('e_day').value, 10) : null,
  };
  if (poll.kind === 'single' || poll.kind === 'multi' || poll.kind === 'emoji') {
    upd.options = collectOpts($('e_opts'));
    if (upd.options.length < 2) {
      const em = $('editMsg');
      if (em) {
        em.className = 'msg show err';
        em.textContent = 'Need at least 2 options.';
      }
      return;
    }
  }
  const { error } = await supabase.from('polls').update(upd).eq('id', editingId);
  if (error) {
    const em = $('editMsg');
    if (em) {
      em.className = 'msg show err';
      em.textContent = error.message;
    }
    return;
  }
  closeEdit();
  await refresh();
}

function wireDrawer() {
  $('drawerClose')?.addEventListener('click', closeDrawer);
  $('drawerBack')?.addEventListener('click', closeDrawer);
}

async function openDrawer(poll) {
  closeDrawer(true);
  liveState = { pollId: poll.id, kind: poll.kind, options: poll.options || [], responses: [] };
  if ($('drawerTitle')) $('drawerTitle').textContent = poll.title;
  if ($('drawerKicker')) $('drawerKicker').textContent = poll.is_open ? 'Live · open' : 'Closed';
  if ($('drawerCount')) $('drawerCount').textContent = '0 responses so far';
  if ($('drawerBody')) $('drawerBody').innerHTML = '<div class="muted" style="padding:20px 0">Loading responses…</div>';
  $('drawerBack')?.classList.add('show');
  $('drawer')?.classList.add('show');
  const { data } = await supabase.from('poll_responses').select('*').eq('poll_id', poll.id).order('created_at', { ascending: false }).limit(500);
  liveState.responses = data || [];
  renderLive();
  if (liveChannel) supabase.removeChannel(liveChannel);
  liveChannel = supabase
    .channel(`polls-live-${poll.id}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'poll_responses', filter: `poll_id=eq.${poll.id}` },
      (payload) => {
        liveState.responses.unshift(payload.new);
        renderLive();
        const cur = COUNTS.get(poll.id) || 0;
        COUNTS.set(poll.id, cur + 1);
        renderStats();
        renderList();
      },
    )
    .subscribe();
}

function closeDrawer(silent) {
  $('drawerBack')?.classList.remove('show');
  $('drawer')?.classList.remove('show');
  if (liveChannel) {
    supabase.removeChannel(liveChannel);
    liveChannel = null;
  }
  liveState = null;
  void silent;
}

function renderLive() {
  if (!liveState) return;
  const { kind, options, responses } = liveState;
  if ($('drawerCount')) $('drawerCount').textContent = `${responses.length} response${responses.length === 1 ? '' : 's'} so far`;
  const body = $('drawerBody');
  if (!body) return;
  if (kind === 'single' || kind === 'multi') {
    const counts = new Map(options.map((o) => [o, 0]));
    for (const r of responses) {
      if (kind === 'single') {
        const c = r.response?.choice;
        if (counts.has(c)) counts.set(c, counts.get(c) + 1);
      } else {
        for (const c of r.response?.choices || []) if (counts.has(c)) counts.set(c, counts.get(c) + 1);
      }
    }
    const max = Math.max(1, ...counts.values());
    const total = responses.length || 1;
    body.innerHTML = options
      .map((o) => {
        const c = counts.get(o) || 0;
        const pct = Math.round((c / total) * 100);
        const width = Math.round((c / max) * 100);
        const leader = c > 0 && c === max ? ' leader' : '';
        return `<div class="bar-row${leader}">
          <div class="bar-head"><span class="bar-label">${esc(o)}</span><span class="bar-stats">${c} · ${pct}%</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
        </div>`;
      })
      .join('');
  } else if (kind === 'emoji') {
    const counts = new Map(options.map((o) => [o, 0]));
    for (const r of responses) {
      const e = r.response?.emoji;
      if (counts.has(e)) counts.set(e, counts.get(e) + 1);
    }
    const max = Math.max(1, ...counts.values());
    body.innerHTML = options
      .map((o) => {
        const c = counts.get(o) || 0;
        const w = Math.round((c / max) * 100);
        return `<div class="emoji-row">
          <div class="emoji-big">${esc(o)}</div>
          <div class="emoji-bar"><div class="emoji-bar-fill" style="width:${w}%"></div></div>
          <div class="emoji-count">${c}</div>
        </div>`;
      })
      .join('');
  } else {
    if (!responses.length) {
      body.innerHTML = `<div class="muted" style="padding:20px 0">No responses yet.</div>`;
      return;
    }
    body.innerHTML = responses
      .map((r) => {
        const text = r.response?.text || '';
        return `<div class="q-card"><div class="q-text">${esc(text)}</div><div class="q-time">${esc(rel(r.created_at))}</div></div>`;
      })
      .join('');
  }
}

function subscribeRowLevel() {
  if (rowChannel) {
    supabase.removeChannel(rowChannel);
    rowChannel = null;
  }
  if (!COHORT) return;
  rowChannel = supabase
    .channel(`polls-row-${COHORT.id}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'polls', filter: `cohort_id=eq.${COHORT.id}` }, () => refresh())
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'poll_responses' }, (payload) => {
      const pid = payload.new?.poll_id;
      if (!pid) return;
      if (POLLS.some((p) => p.id === pid)) {
        COUNTS.set(pid, (COUNTS.get(pid) || 0) + 1);
        renderStats();
        renderList();
      }
    })
    .subscribe();
}

function wireTeamVote() {
  const btn = $('teamVoteBtn');
  const back = $('teamVoteBack');
  if (!btn || !back) return;
  btn.addEventListener('click', () => openTeamVote());
  $('tvCancel')?.addEventListener('click', () => back.classList.remove('show'));
  back.addEventListener('click', (e) => {
    if (e.target.id === 'p2_teamVoteBack') back.classList.remove('show');
  });
  $('tvCreate')?.addEventListener('click', () => submitTeamVote());
}

async function openTeamVote() {
  if (!COHORT) {
    toastRef('Pick a cohort first.', { error: true });
    return;
  }
  const msg = $('tvMsg');
  if (msg) {
    msg.className = 'msg';
    msg.textContent = '';
  }
  if ($('tv_title')) $('tv_title').value = 'Demo day — vote for best team';
  if ($('tv_question')) $('tv_question').value = 'Which team had the best demo?';
  const optsWrap = $('tv_opts');
  if (optsWrap) optsWrap.innerHTML = '<div class="muted" style="font-size:12px">Loading teams…</div>';
  $('teamVoteBack')?.classList.add('show');
  const { data: teams, error } = await supabase.from('teams').select('id, name').eq('cohort_id', COHORT.id).order('name');
  if (error || !optsWrap) {
    if (optsWrap) optsWrap.innerHTML = `<div class="msg show err">${esc(error?.message || '')}</div>`;
    return;
  }
  if (!teams || !teams.length) {
    optsWrap.innerHTML = `<div class="msg show err">No teams in this cohort. Add teams on the Teams page first.</div>`;
    return;
  }
  optsWrap.innerHTML = '';
  teams.forEach((t) => addOptRow(optsWrap, t.name));
}

async function submitTeamVote() {
  const msg = $('tvMsg');
  if (msg) {
    msg.className = 'msg';
    msg.textContent = '';
  }
  const title = $('tv_title')?.value.trim();
  const question = $('tv_question')?.value.trim();
  const dayVal = $('tv_day')?.value;
  const opts = collectOpts($('tv_opts'));
  if (!title || !question) {
    if (msg) {
      msg.className = 'msg show err';
      msg.textContent = 'Title and question are required.';
    }
    return;
  }
  if (opts.length < 2) {
    if (msg) {
      msg.className = 'msg show err';
      msg.textContent = 'Need at least 2 team options.';
    }
    return;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const btn = $('tvCreate');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Creating…';
  }
  const { error } = await supabase.from('polls').insert({
    cohort_id: COHORT.id,
    day_number: dayVal ? parseInt(dayVal, 10) : null,
    title,
    question,
    kind: 'single',
    options: opts,
    is_open: true,
    opened_at: new Date().toISOString(),
    created_by: user.id,
  });
  if (btn) {
    btn.disabled = false;
    btn.textContent = 'Create + launch';
  }
  if (error) {
    if (msg) {
      msg.className = 'msg show err';
      msg.textContent = error.message;
    }
    return;
  }
  if (msg) {
    msg.className = 'msg show ok';
    msg.textContent = 'Team-vote poll launched ✓';
  }
  await refresh();
  setTimeout(() => $('teamVoteBack')?.classList.remove('show'), 700);
}

/** @param {{ getCohort: () => any, toast: Function, confirmDialog: Function, onCohortChange: (fn: () => void) => void }} opts */
export async function mountAdminPollsTab(opts) {
  const { getCohort, toast, confirmDialog, onCohortChange } = opts;
  getCohortRef = getCohort;
  teardownFns = [];
  toastRef = typeof toast === 'function' ? toast : toastRef;
  confirmDialogRef = typeof confirmDialog === 'function' ? confirmDialog : confirmDialogRef;

  async function syncCohort() {
    COHORT = getCohortRef();
    if (!COHORT) return;
    await refresh();
    subscribeRowLevel();
  }

  populateDayOptions($('f_day'));
  populateDayOptions($('e_day'));
  renderOptsEditor($('f_opts'), []);
  wireCreate();
  wireEdit();
  wireTabs();
  wireDrawer();
  wireTeamVote();

  onCohortChange(() => {
    syncCohort();
  });

  await syncCohort();

  teardownFns.push(() => {
    closeDrawer(true);
    if (rowChannel) {
      supabase.removeChannel(rowChannel);
      rowChannel = null;
    }
  });

  return {
    teardown: () => {
      teardownFns.forEach((f) => f());
      teardownFns = [];
    },
    refresh: syncCohort,
  };
}
