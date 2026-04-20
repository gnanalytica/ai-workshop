// Live polls widget for day.html
// Usage: mountPollsWidget(el, { user, cohort, dayNumber })
import { supabase } from './supabase.js';

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function rel(ts) {
  if (!ts) return '';
  const d = (Date.now() - new Date(ts).getTime()) / 1000;
  if (d < 60) return 'just now';
  if (d < 3600) return Math.floor(d/60) + 'm ago';
  if (d < 86400) return Math.floor(d/3600) + 'h ago';
  return Math.floor(d/86400) + 'd ago';
}

export function mountPollsWidget(root, ctx) {
  const { user, cohort, dayNumber } = ctx;
  if (!root || !user || !cohort) return;

  root.innerHTML = `<div class="polls-mount" id="pollsMount"></div>`;
  const mount = root.querySelector('#pollsMount');

  const activeCards = new Map(); // poll_id -> card element controller

  async function loadInitial() {
    // polls for this day OR standalone (day_number is null)
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('cohort_id', cohort.id)
      .or(`day_number.eq.${dayNumber},day_number.is.null`)
      .order('created_at', { ascending: false });
    if (error) return;
    for (const p of (data || [])) upsertPoll(p);
  }

  function shouldShow(p) {
    return p.cohort_id === cohort.id &&
           (p.day_number === dayNumber || p.day_number === null);
  }

  function upsertPoll(p) {
    if (!shouldShow(p)) {
      if (activeCards.has(p.id)) { activeCards.get(p.id).destroy(); activeCards.delete(p.id); }
      return;
    }
    if (activeCards.has(p.id)) {
      activeCards.get(p.id).update(p);
    } else {
      const ctl = buildCard(p);
      activeCards.set(p.id, ctl);
      mount.prepend(ctl.el);
    }
  }

  function buildCard(poll) {
    const el = document.createElement('div');
    el.className = 'poll-card poll-in';
    el.dataset.pollId = poll.id;

    let state = { poll, submitted: false, responses: [], myId: null };
    let channel = null;

    function render() {
      const p = state.poll;
      const openBadge = p.is_open
        ? `<span class="poll-badge poll-badge-open"><span class="poll-dot"></span>Live</span>`
        : `<span class="poll-badge poll-badge-closed">Poll closed</span>`;
      const waitingFor = !p.is_open
        ? `<div class="poll-waiting">Waiting for instructor to launch</div>` : '';
      const kindLabel = { single: 'Single choice', multi: 'Multiple choice', text: 'Share your thoughts', questions: 'Drop a question — the instructor will address it.', emoji: 'React' }[p.kind] || '';
      el.innerHTML = `
        <div class="poll-head">
          <div class="poll-kicker">Live poll · ${esc(kindLabel)}</div>
          ${openBadge}
        </div>
        <div class="poll-title">${esc(p.title)}</div>
        <div class="poll-q">${esc(p.question)}</div>
        <div class="poll-form" id="pf-${esc(p.id)}"></div>
        <div class="poll-results" id="pr-${esc(p.id)}"></div>
        ${waitingFor}
      `;
      renderForm();
      renderResults();
    }

    function renderForm() {
      const p = state.poll;
      const wrap = el.querySelector('.poll-form');
      if (!wrap) return;
      if (!p.is_open) { wrap.innerHTML = ''; return; }
      if (state.submitted && (p.kind === 'single' || p.kind === 'multi' || p.kind === 'emoji')) {
        wrap.innerHTML = `<div class="poll-thanks">Thanks! Here's what the class said so far.</div>`;
        return;
      }
      if (p.kind === 'single') {
        wrap.innerHTML = `
          <div class="poll-opts">
            ${(p.options || []).map((o, i) => `
              <label class="poll-opt">
                <input type="radio" name="poll-${esc(p.id)}" value="${esc(o)}" />
                <span>${esc(o)}</span>
              </label>`).join('')}
          </div>
          <button class="poll-submit" data-act="submit-single">Submit</button>
          <div class="poll-msg"></div>
        `;
      } else if (p.kind === 'multi') {
        wrap.innerHTML = `
          <div class="poll-opts">
            ${(p.options || []).map(o => `
              <label class="poll-opt">
                <input type="checkbox" value="${esc(o)}" />
                <span>${esc(o)}</span>
              </label>`).join('')}
          </div>
          <button class="poll-submit" data-act="submit-multi">Submit</button>
          <div class="poll-msg"></div>
        `;
      } else if (p.kind === 'emoji') {
        wrap.innerHTML = `
          <div class="poll-emojis">
            ${(p.options || []).map(e => `<button class="poll-emoji" data-act="submit-emoji" data-emoji="${esc(e)}" aria-label="${esc(e)}">${esc(e)}</button>`).join('')}
          </div>
          <div class="poll-msg"></div>
        `;
      } else if (p.kind === 'text') {
        wrap.innerHTML = `
          <textarea class="poll-textarea" placeholder="Type your answer…" rows="3" aria-label="Your answer"></textarea>
          <button class="poll-submit" data-act="submit-text">Submit</button>
          <div class="poll-msg"></div>
        `;
      } else if (p.kind === 'questions') {
        wrap.innerHTML = `
          <textarea class="poll-textarea" placeholder="Drop a question — the instructor will address it." rows="3" aria-label="Your question"></textarea>
          <button class="poll-submit" data-act="submit-question">Send question</button>
          <div class="poll-msg poll-msg-sub">Questions are shared anonymously with other students.</div>
        `;
      }
      wrap.querySelectorAll('[data-act]').forEach(btn => {
        btn.addEventListener('click', (ev) => {
          ev.preventDefault();
          onSubmit(btn.dataset.act, btn);
        });
      });
    }

    async function onSubmit(act, btn) {
      const p = state.poll;
      const msg = el.querySelector('.poll-msg');
      if (!p.is_open) return;
      let payload = null;
      if (act === 'submit-single') {
        const v = el.querySelector(`input[name="poll-${p.id}"]:checked`);
        if (!v) { if (msg) { msg.textContent = 'Pick an option.'; msg.className = 'poll-msg err'; } return; }
        payload = { choice: v.value };
      } else if (act === 'submit-multi') {
        const boxes = [...el.querySelectorAll('.poll-form input[type=checkbox]:checked')].map(i => i.value);
        if (!boxes.length) { if (msg) { msg.textContent = 'Pick at least one option.'; msg.className = 'poll-msg err'; } return; }
        payload = { choices: boxes };
      } else if (act === 'submit-emoji') {
        payload = { emoji: btn.dataset.emoji };
      } else if (act === 'submit-text') {
        const ta = el.querySelector('.poll-textarea');
        const txt = (ta?.value || '').trim();
        if (!txt) { if (msg) { msg.textContent = 'Write something first.'; msg.className = 'poll-msg err'; } return; }
        payload = { text: txt };
      } else if (act === 'submit-question') {
        const ta = el.querySelector('.poll-textarea');
        const txt = (ta?.value || '').trim();
        if (!txt) { if (msg) { msg.textContent = 'Write a question first.'; msg.className = 'poll-msg err'; } return; }
        payload = { text: txt };
      }
      if (btn) btn.disabled = true;
      const { error } = await supabase.from('poll_responses').insert({
        poll_id: p.id, user_id: user.id, response: payload,
      });
      if (btn) btn.disabled = false;
      if (error) {
        if (msg) { msg.textContent = error.message; msg.className = 'poll-msg err'; }
        return;
      }
      if (p.kind === 'text' || p.kind === 'questions') {
        const ta = el.querySelector('.poll-textarea');
        if (ta) ta.value = '';
        if (msg) { msg.textContent = 'Sent ✓'; msg.className = 'poll-msg ok'; }
      } else {
        state.submitted = true;
        renderForm();
      }
    }

    function renderResults() {
      const p = state.poll;
      const box = el.querySelector('.poll-results');
      if (!box) return;
      // Aggregate views only visible after submission for single/multi/emoji,
      // always visible for text/questions (it's a wall)
      const showAgg = (p.kind === 'text' || p.kind === 'questions') || state.submitted || !p.is_open;
      if (!showAgg) { box.innerHTML = ''; return; }
      const total = state.responses.length;
      if (p.kind === 'single' || p.kind === 'multi') {
        const counts = new Map((p.options || []).map(o => [o, 0]));
        for (const r of state.responses) {
          if (p.kind === 'single') {
            const c = r.response?.choice; if (counts.has(c)) counts.set(c, counts.get(c)+1);
          } else {
            for (const c of (r.response?.choices || [])) if (counts.has(c)) counts.set(c, counts.get(c)+1);
          }
        }
        const max = Math.max(1, ...counts.values());
        const denom = total || 1;
        box.innerHTML = `
          <div class="poll-count">${total} response${total===1?'':'s'}</div>
          ${(p.options || []).map(o => {
            const c = counts.get(o) || 0;
            const width = Math.round((c / max) * 100);
            const pct = Math.round((c / denom) * 100);
            const leader = c > 0 && c === max ? ' leader' : '';
            return `<div class="poll-bar-row${leader}">
              <div class="poll-bar-head"><span>${esc(o)}</span><span class="poll-bar-stats">${c} · ${pct}%</span></div>
              <div class="poll-bar-track"><div class="poll-bar-fill" style="width:${width}%"></div></div>
            </div>`;
          }).join('')}
        `;
      } else if (p.kind === 'emoji') {
        const counts = new Map((p.options || []).map(o => [o, 0]));
        for (const r of state.responses) {
          const e = r.response?.emoji; if (counts.has(e)) counts.set(e, counts.get(e)+1);
        }
        const max = Math.max(1, ...counts.values());
        box.innerHTML = `
          <div class="poll-count">${total} reaction${total===1?'':'s'}</div>
          <div class="poll-emoji-results">
            ${(p.options || []).map(o => {
              const c = counts.get(o) || 0;
              const w = Math.round((c / max) * 100);
              return `<div class="poll-emoji-result">
                <div class="poll-emoji-big">${esc(o)}</div>
                <div class="poll-emoji-bar"><div class="poll-emoji-bar-fill" style="width:${w}%"></div></div>
                <div class="poll-emoji-n">${c}</div>
              </div>`;
            }).join('')}
          </div>
        `;
      } else if (p.kind === 'questions') {
        if (!state.responses.length) {
          box.innerHTML = `<div class="poll-count">No questions yet — be the first.</div>`;
          return;
        }
        box.innerHTML = `
          <div class="poll-count">${total} question${total===1?'':'s'}</div>
          <div class="poll-qwall">
            ${state.responses.map(r => `
              <div class="poll-q-card">
                <div class="poll-q-text">${esc(r.response?.text || '')}</div>
                <div class="poll-q-time">${esc(rel(r.created_at))}</div>
              </div>
            `).join('')}
          </div>
        `;
      } else if (p.kind === 'text') {
        // own text: just show my submissions + count, not peers (privacy)
        const mine = state.responses.filter(r => r.user_id === user.id);
        box.innerHTML = `
          <div class="poll-count">${total} response${total===1?'':'s'} total</div>
          ${mine.length ? `<div class="poll-qwall">${mine.map(r => `
            <div class="poll-q-card"><div class="poll-q-text">${esc(r.response?.text || '')}</div>
            <div class="poll-q-time">You · ${esc(rel(r.created_at))}</div></div>`).join('')}</div>` : ''}
        `;
      }
    }

    async function loadResponses() {
      const p = state.poll;
      // For text polls, students can only see their own rows (RLS self-read),
      // but count still works when we aggregate via all visible. For question
      // walls, RLS must allow peers to read; we still try broadly.
      const { data } = await supabase
        .from('poll_responses')
        .select('*')
        .eq('poll_id', p.id)
        .order('created_at', { ascending: false })
        .limit(500);
      state.responses = data || [];
      // Detect prior submission
      if (state.responses.some(r => r.user_id === user.id)) state.submitted = true;
      renderForm();
      renderResults();
    }

    function subscribe() {
      if (channel) { supabase.removeChannel(channel); channel = null; }
      channel = supabase.channel(`poll-${state.poll.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'poll_responses', filter: `poll_id=eq.${state.poll.id}` }, (payload) => {
          state.responses.unshift(payload.new);
          renderResults();
        })
        .subscribe();
    }

    function update(p) {
      const wasOpen = state.poll.is_open;
      state.poll = p;
      render();
      if (p.is_open && !wasOpen) {
        el.classList.add('poll-just-launched');
        setTimeout(() => el.classList.remove('poll-just-launched'), 1500);
      }
      loadResponses();
    }

    function destroy() {
      if (channel) { supabase.removeChannel(channel); channel = null; }
      el.remove();
    }

    // Initial render
    render();
    loadResponses();
    subscribe();

    return { el, update, destroy };
  }

  // Subscribe to polls changes for this cohort (launch/close/create/delete)
  const pollsChannel = supabase.channel(`polls-day-${cohort.id}-${dayNumber}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'polls', filter: `cohort_id=eq.${cohort.id}` }, (payload) => {
      upsertPoll(payload.new);
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'polls', filter: `cohort_id=eq.${cohort.id}` }, (payload) => {
      upsertPoll(payload.new);
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'polls', filter: `cohort_id=eq.${cohort.id}` }, (payload) => {
      const id = payload.old?.id;
      if (id && activeCards.has(id)) { activeCards.get(id).destroy(); activeCards.delete(id); }
    })
    .subscribe();

  loadInitial();

  return () => {
    supabase.removeChannel(pollsChannel);
    for (const ctl of activeCards.values()) ctl.destroy();
    activeCards.clear();
  };
}
