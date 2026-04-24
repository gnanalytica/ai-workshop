/**
 * board.js — Community Q&A board Supabase CRUD module.
 * Export: mountBoard(container, state)
 * state = { user, canModerate, supabase }
 */

import { marked } from 'https://esm.sh/marked@11';
import { toast } from './dialog.js';

marked.setOptions({ gfm: true, breaks: false });

// -- TODO: pagination if list grows --
const LIST_LIMIT = 100;

const TAGS = ['tech', 'concept', 'setup', 'platform', 'lab', 'general'];

const TAG_COLORS = {
  tech:     { bg: 'rgba(56,189,248,.12)',    color: '#7dd5ff',  border: 'rgba(56,189,248,.3)'    },
  concept:  { bg: 'rgba(139,92,246,.12)',    color: '#c9b8ff',  border: 'rgba(139,92,246,.3)'    },
  setup:    { bg: 'rgba(255,184,64,.12)',    color: '#ffc87a',  border: 'rgba(255,184,64,.3)'     },
  platform: { bg: 'rgba(195,255,54,.1)',     color: '#c9f76a',  border: 'rgba(195,255,54,.28)'   },
  lab:      { bg: 'rgba(255,107,107,.1)',    color: '#ffa0a0',  border: 'rgba(255,107,107,.28)'  },
  general:  { bg: 'rgba(138,138,154,.12)',   color: '#b0b0c0',  border: 'rgba(138,138,154,.3)'   },
};

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

function relTime(ts) {
  if (!ts) return '';
  const d = (Date.now() - new Date(ts).getTime()) / 1000;
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  if (d < 86400 * 7) return `${Math.floor(d / 86400)}d ago`;
  return new Date(ts).toLocaleDateString();
}

function renderTagPill(tag, active = false, clickable = false) {
  const c = TAG_COLORS[tag] || TAG_COLORS.general;
  const style = `background:${c.bg};color:${c.color};border:1px solid ${c.border};`;
  const cls = `tag-chip${active ? ' active' : ''}${clickable ? ' clickable' : ''}`;
  return `<span class="${cls}" data-tag="${esc(tag)}" style="${style}">${esc(tag)}</span>`;
}

function renderStatusBadge(status) {
  const map = {
    open:     { label: 'Open',     style: 'background:rgba(195,255,54,.1);color:#c9f76a;border:1px solid rgba(195,255,54,.28)' },
    answered: { label: 'Answered', style: 'background:rgba(56,189,248,.1);color:#7dd5ff;border:1px solid rgba(56,189,248,.28)' },
    closed:   { label: 'Closed',   style: 'background:rgba(138,138,154,.12);color:#8a8a9a;border:1px solid rgba(138,138,154,.3)' },
  };
  const m = map[status] || map.open;
  return `<span style="padding:2px 8px;border-radius:6px;font-size:10.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;${m.style}">${m.label}</span>`;
}

function renderMarkdown(md) {
  if (!md) return '';
  try { return marked.parse(String(md)); } catch (_) { return esc(md); }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main mount function
// ─────────────────────────────────────────────────────────────────────────────

export async function mountBoard(container, state) {
  const { user, canModerate, supabase } = state;

  // ── local state ──────────────────────────────────────────────────────────
  let posts = [];
  let activePostId = null;
  let filterTag = null;
  let filterStatus = 'all';   // 'all' | 'open' | 'answered'
  let filterSort = 'recent';  // 'recent' | 'mine'
  let voteSet = new Set();    // post/reply ids this user has upvoted

  // ── render skeleton ───────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="board-layout">
      <aside class="board-sidebar">
        <div class="board-filter-section">
          <div class="board-filter-label">Filter by tag</div>
          <div class="board-tag-chips" id="bdTagChips">
            <span class="tag-chip clickable${!filterTag ? ' active' : ''}" data-tag="" style="background:rgba(138,138,154,.12);color:#b0b0c0;border:1px solid rgba(138,138,154,.3)">All</span>
            ${TAGS.map(t => renderTagPill(t, false, true)).join('')}
          </div>
        </div>
        <div class="board-filter-section" style="margin-top:16px">
          <div class="board-filter-label">Status</div>
          <div class="board-pill-group" id="bdStatusGroup">
            <button class="bd-pill active" data-val="all">All</button>
            <button class="bd-pill" data-val="open">Open</button>
            <button class="bd-pill" data-val="answered">Answered</button>
          </div>
        </div>
        <div class="board-filter-section" style="margin-top:16px">
          <div class="board-filter-label">Sort</div>
          <div class="board-pill-group" id="bdSortGroup">
            <button class="bd-pill active" data-val="recent">Recent</button>
            <button class="bd-pill${user ? '' : ' disabled'}" data-val="mine" ${user ? '' : 'disabled'}>My posts</button>
          </div>
        </div>
        <div class="board-filter-section" style="margin-top:20px">
          <div id="bdPostList" class="bd-post-list">
            <div class="bd-empty">Loading…</div>
          </div>
        </div>
      </aside>

      <main class="board-main" id="bdMain">
        <div class="bd-detail-placeholder">
          <div style="text-align:center;padding:60px 20px;color:var(--muted)">
            <div style="font-size:48px;margin-bottom:12px">💬</div>
            <div style="font-size:15px;font-weight:500;margin-bottom:6px">Community Q&amp;A</div>
            <div style="font-size:13px">Select a post to read, or ask a new question.</div>
          </div>
        </div>
      </main>
    </div>

    <!-- Floating ask button -->
    ${user ? `<button class="bd-ask-btn" id="bdAskBtn" title="Ask a question">+ Ask a question</button>` : ''}

    <!-- New post modal -->
    <div class="bd-modal-back" id="bdNewPostModal" style="display:none" role="dialog" aria-modal="true" aria-label="Ask a question">
      <div class="bd-modal">
        <div class="bd-modal-head">
          <div class="kicker" style="margin-bottom:4px">Community board</div>
          <h2 style="font-size:20px;margin:0">Ask a question</h2>
        </div>
        <div class="field">
          <label>Title <span class="muted" style="text-transform:none;letter-spacing:0;font-size:11px">(3–140 characters)</span></label>
          <input type="text" id="bdNewTitle" maxlength="140" placeholder="What would you like to know?" />
          <div class="bd-char-count" id="bdTitleCount" style="font-size:11px;color:var(--muted);margin-top:3px;text-align:right">0 / 140</div>
        </div>
        <div class="field">
          <label>Body <span class="muted" style="text-transform:none;letter-spacing:0;font-size:11px">(markdown supported)</span></label>
          <textarea id="bdNewBody" rows="6" placeholder="Describe your question in detail…"></textarea>
        </div>
        <div class="field">
          <label>Tags</label>
          <div class="board-tag-chips" id="bdNewTagChips" style="flex-wrap:wrap;gap:6px">
            ${TAGS.map(t => renderTagPill(t, false, true)).join('')}
          </div>
          <input type="hidden" id="bdNewTagsVal" />
        </div>
        <div class="bd-modal-actions">
          <button type="button" class="cta ghost" id="bdNewCancel">Cancel</button>
          <button type="button" class="cta" id="bdNewPost">Post question →</button>
        </div>
        <div class="msg" id="bdNewMsg"></div>
      </div>
    </div>
  `;

  // ── CSS injection ─────────────────────────────────────────────────────────
  if (!document.getElementById('board-styles')) {
    const style = document.createElement('style');
    style.id = 'board-styles';
    style.textContent = `
      .board-layout{display:grid;grid-template-columns:280px 1fr;gap:20px;align-items:start;min-height:60vh}
      @media(max-width:760px){.board-layout{grid-template-columns:1fr}}
      .board-sidebar{position:sticky;top:80px;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;max-height:calc(100vh - 100px);overflow-y:auto}
      @media(max-width:760px){.board-sidebar{position:static;max-height:none}}
      .board-main{min-width:0}
      .board-filter-label{font-size:10.5px;text-transform:uppercase;letter-spacing:.16em;color:var(--muted);font-weight:600;margin-bottom:8px}
      .board-filter-section{}
      .board-tag-chips{display:flex;flex-wrap:wrap;gap:5px}
      .tag-chip{padding:3px 10px;border-radius:999px;font-size:11.5px;font-weight:600;cursor:default}
      .tag-chip.clickable{cursor:pointer;transition:opacity .12s}
      .tag-chip.clickable:hover{opacity:.8}
      .tag-chip.active{box-shadow:0 0 0 2px var(--accent)}
      .board-pill-group{display:flex;gap:4px;flex-wrap:wrap}
      .bd-pill{padding:5px 12px;border-radius:999px;border:1px solid var(--line);background:transparent;color:var(--muted);font-size:12px;font-family:inherit;cursor:pointer;font-weight:500;transition:all .12s}
      .bd-pill:hover:not(:disabled){border-color:var(--accent);color:var(--accent)}
      .bd-pill.active{background:var(--accent);border-color:var(--accent);color:var(--cta-ink);font-weight:600}
      .bd-pill.disabled{opacity:.4;cursor:not-allowed}
      .bd-post-list{display:flex;flex-direction:column;gap:8px}
      .bd-post-item{padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--input-bg);cursor:pointer;transition:border-color .12s}
      .bd-post-item:hover{border-color:var(--accent)}
      .bd-post-item.active{border-color:var(--accent);background:rgba(195,255,54,.05)}
      .bd-post-item-title{font-size:13.5px;font-weight:600;color:var(--ink);margin-bottom:4px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      .bd-post-item-meta{display:flex;flex-wrap:wrap;gap:4px;align-items:center}
      .bd-post-item-sub{font-size:11px;color:var(--muted)}
      .bd-pinned{display:inline-block;padding:1px 6px;background:rgba(195,255,54,.1);color:#c9f76a;border:1px solid rgba(195,255,54,.28);border-radius:5px;font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-right:4px}
      .bd-empty{padding:30px;text-align:center;color:var(--muted);font-size:13px}
      .bd-detail{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:26px}
      .bd-detail-header{margin-bottom:20px}
      .bd-detail-title{font-size:22px;font-weight:700;letter-spacing:-.02em;margin:8px 0 10px;line-height:1.25}
      .bd-detail-meta{display:flex;flex-wrap:wrap;gap:8px;align-items:center;color:var(--muted);font-size:12.5px;margin-bottom:14px}
      .bd-body-md{font-size:14px;line-height:1.7;color:#d0d0da}
      .bd-body-md pre{background:var(--bg-soft);border:1px solid var(--line);border-radius:10px;padding:14px;overflow-x:auto;font-size:12.5px}
      .bd-body-md code{background:var(--bg-soft);border:1px solid var(--line);border-radius:5px;padding:1px 5px;font-size:12.5px;font-family:'JetBrains Mono',monospace}
      .bd-body-md pre code{background:none;border:none;padding:0}
      .bd-body-md a{color:var(--accent)}
      .bd-body-md blockquote{border-left:3px solid var(--line);margin:0;padding:4px 16px;color:var(--muted)}
      .bd-upvote-row{display:flex;align-items:center;gap:10px;margin-top:16px;padding-top:16px;border-top:1px solid var(--line)}
      .bd-upvote-btn{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:8px;border:1px solid var(--line);background:transparent;color:var(--muted);font-family:inherit;font-size:12.5px;cursor:pointer;transition:all .12s}
      .bd-upvote-btn:hover{border-color:var(--accent);color:var(--accent)}
      .bd-upvote-btn.voted{border-color:var(--accent);color:var(--accent);background:rgba(195,255,54,.07)}
      .bd-actions-row{display:flex;flex-wrap:wrap;gap:6px;margin-left:auto}
      .bd-act-btn{padding:5px 12px;border-radius:8px;border:1px solid var(--line);background:transparent;color:var(--muted);font-family:inherit;font-size:12px;cursor:pointer;transition:all .12s}
      .bd-act-btn:hover{border-color:var(--accent);color:var(--ink)}
      .bd-act-btn.danger:hover{border-color:#ff6b6b;color:#ffa0a0}
      .bd-act-btn.primary{background:var(--accent);border-color:var(--accent);color:var(--cta-ink);font-weight:600}
      .bd-replies-section{margin-top:28px;border-top:1px solid var(--line);padding-top:22px}
      .bd-replies-head{font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);margin-bottom:16px}
      .bd-reply-item{padding:16px;border-radius:12px;border:1px solid var(--line);background:var(--input-bg);margin-bottom:12px;position:relative}
      .bd-reply-item.accepted{border-color:rgba(195,255,54,.4);background:rgba(195,255,54,.04)}
      .bd-accepted-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;background:rgba(195,255,54,.1);color:#c9f76a;border:1px solid rgba(195,255,54,.28);border-radius:6px;font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px}
      .bd-reply-meta{font-size:12px;color:var(--muted);margin-bottom:8px}
      .bd-reply-form{margin-top:24px;border-top:1px solid var(--line);padding-top:20px}
      .bd-reply-form textarea{width:100%;background:var(--input-bg);border:1px solid var(--line);border-radius:10px;padding:12px 14px;color:var(--ink);font-family:inherit;font-size:13.5px;outline:none;resize:vertical;min-height:90px}
      .bd-reply-form textarea:focus{border-color:var(--accent)}
      .bd-reply-form-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:8px}
      .bd-ask-btn{position:fixed;bottom:32px;right:32px;padding:13px 22px;border-radius:999px;background:var(--accent);color:var(--cta-ink);font-weight:700;font-size:14px;border:none;cursor:pointer;box-shadow:0 6px 28px rgba(195,255,54,.3);z-index:40;font-family:inherit;transition:transform .15s,box-shadow .15s}
      .bd-ask-btn:hover{transform:translateY(-2px);box-shadow:0 10px 36px rgba(195,255,54,.4)}
      .bd-modal-back{position:fixed;inset:0;background:rgba(0,0,0,.62);backdrop-filter:blur(4px);z-index:200;display:grid;place-items:center;padding:20px}
      .bd-modal{background:var(--bg);border:1px solid var(--line);border-radius:18px;max-width:580px;width:100%;padding:28px;max-height:90vh;overflow-y:auto}
      .bd-modal-head{margin-bottom:20px}
      .bd-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
      .bd-char-count{}
      .bd-mod-section{margin-top:16px;padding:12px 14px;background:rgba(255,107,107,.06);border:1px solid rgba(255,107,107,.2);border-radius:10px}
      .bd-mod-label{font-size:10.5px;text-transform:uppercase;letter-spacing:.14em;color:#ffa0a0;margin-bottom:8px;font-weight:600}
    `;
    document.head.appendChild(style);
  }

  // ── helpers ───────────────────────────────────────────────────────────────

  async function loadVotes() {
    if (!user) return;
    const { data } = await supabase
      .from('board_votes')
      .select('post_id, reply_id')
      .eq('user_id', user.id);
    voteSet = new Set((data || []).map(v => v.post_id || v.reply_id));
  }

  async function loadPosts() {
    let q = supabase
      .from('board_posts')
      .select('id, title, tags, status, pinned_at, created_at, author_id, cohort_id')
      .is('deleted_at', null)
      .order('pinned_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(LIST_LIMIT);

    if (filterStatus !== 'all') q = q.eq('status', filterStatus);
    if (filterTag) q = q.contains('tags', [filterTag]);
    if (filterSort === 'mine' && user) q = q.eq('author_id', user.id);

    const { data, error } = await q;
    if (error) { toast(error.message, { error: true }); return; }
    posts = data || [];
    renderList();
  }

  function renderList() {
    const host = document.getElementById('bdPostList');
    if (!host) return;
    if (!posts.length) {
      host.innerHTML = `<div class="bd-empty">No posts yet — be the first to ask!</div>`;
      return;
    }
    host.innerHTML = posts.map(p => {
      const pinTag = p.pinned_at ? `<span class="bd-pinned">Pinned</span>` : '';
      const tags = (p.tags || []).map(t => renderTagPill(t)).join('');
      const isActive = p.id === activePostId;
      return `
        <div class="bd-post-item${isActive ? ' active' : ''}" data-id="${esc(p.id)}" tabindex="0" role="button">
          <div class="bd-post-item-title">${pinTag}${esc(p.title)}</div>
          <div class="bd-post-item-meta">
            ${renderStatusBadge(p.status)}
            ${tags}
            <span class="bd-post-item-sub">${relTime(p.created_at)}</span>
          </div>
        </div>
      `;
    }).join('');

    host.querySelectorAll('.bd-post-item').forEach(el => {
      el.addEventListener('click', () => openPost(el.dataset.id));
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openPost(el.dataset.id); });
    });

    // Restore URL routing
    const urlId = new URLSearchParams(location.search).get('post');
    if (urlId && posts.find(p => p.id === urlId) && activePostId !== urlId) {
      openPost(urlId);
    }
  }

  async function openPost(postId) {
    activePostId = postId;
    // Highlight in sidebar
    document.querySelectorAll('.bd-post-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === postId);
    });
    // Update URL without reload
    const url = new URL(location.href);
    url.searchParams.set('post', postId);
    history.replaceState(null, '', url.toString());

    const main = document.getElementById('bdMain');
    main.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted)">Loading…</div>';

    // Fetch post + replies + vote counts in parallel
    const [postRes, repliesRes, postVotesRes, replyVotesRes] = await Promise.all([
      supabase.from('board_posts').select('*').eq('id', postId).is('deleted_at', null).maybeSingle(),
      supabase.from('board_replies').select('*').eq('post_id', postId).is('deleted_at', null).order('created_at', { ascending: true }),
      supabase.from('board_votes').select('user_id').eq('post_id', postId).is('reply_id', null),
      supabase.from('board_votes').select('reply_id, user_id').eq('post_id', postId),
    ]);

    if (postRes.error || !postRes.data) {
      main.innerHTML = `<div class="bd-empty">Post not found or was deleted.</div>`;
      return;
    }

    const post = postRes.data;
    const replies = repliesRes.data || [];
    const postVoteCount = (postVotesRes.data || []).length;
    // Build reply vote counts map: replyId -> count
    const replyVoteMap = new Map();
    (replyVotesRes.data || []).forEach(v => {
      if (v.reply_id) replyVoteMap.set(v.reply_id, (replyVoteMap.get(v.reply_id) || 0) + 1);
    });

    // Fetch author profiles
    const authorIds = [...new Set([post.author_id, ...replies.map(r => r.author_id)].filter(Boolean))];
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, email').in('id', authorIds);
    const profMap = new Map((profiles || []).map(p => [p.id, p]));
    const getAuthorName = id => {
      const p = profMap.get(id);
      return p?.full_name || p?.email || 'Unknown';
    };

    const isAuthor = user && post.author_id === user.id;
    const postVoted = voteSet.has(post.id);
    const tags = (post.tags || []).map(t => renderTagPill(t)).join('');

    let modHtml = '';
    if (canModerate) {
      const pinLabel = post.pinned_at ? 'Unpin' : 'Pin';
      modHtml = `
        <div class="bd-mod-section">
          <div class="bd-mod-label">Moderation</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            <button class="bd-act-btn" data-mod="pin">${esc(pinLabel)}</button>
            ${post.status !== 'closed' ? `<button class="bd-act-btn" data-mod="close">Close</button>` : `<button class="bd-act-btn" data-mod="reopen">Reopen</button>`}
            <button class="bd-act-btn danger" data-mod="delete">Delete</button>
          </div>
        </div>
      `;
    }

    const repliesHtml = replies.map(r => {
      const rVoteCount = replyVoteMap.get(r.id) || 0;
      const rVoted = voteSet.has(r.id);
      const acceptBtn = (isAuthor && !r.is_accepted_answer && post.status !== 'closed')
        ? `<button class="bd-act-btn primary" data-accept="${esc(r.id)}">✓ Mark as answer</button>` : '';
      const unacceptBtn = (isAuthor && r.is_accepted_answer)
        ? `<button class="bd-act-btn" data-unaccept="${esc(r.id)}">Unmark answer</button>` : '';
      const modReplyHtml = canModerate
        ? `<button class="bd-act-btn danger" data-mod-reply-delete="${esc(r.id)}">Delete reply</button>` : '';

      return `
        <div class="bd-reply-item${r.is_accepted_answer ? ' accepted' : ''}" id="reply-${esc(r.id)}">
          ${r.is_accepted_answer ? `<div class="bd-accepted-badge">✓ Accepted answer</div>` : ''}
          <div class="bd-reply-meta">
            <b>${esc(getAuthorName(r.author_id))}</b> · ${relTime(r.created_at)}
          </div>
          <div class="bd-body-md">${renderMarkdown(r.body_md)}</div>
          <div class="bd-upvote-row">
            <button class="bd-upvote-btn${rVoted ? ' voted' : ''}" data-vote-reply="${esc(r.id)}" ${!user ? 'disabled title="Sign in to vote"' : ''}>
              ▲ ${rVoteCount}
            </button>
            <div class="bd-actions-row">
              ${acceptBtn}${unacceptBtn}${modReplyHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const replyFormHtml = user ? `
      <div class="bd-reply-form">
        <div class="board-filter-label" style="margin-bottom:8px">Your reply <span style="text-transform:none;letter-spacing:0;font-size:11px;color:var(--muted)">(markdown supported)</span></div>
        <textarea id="bdReplyBody" placeholder="Share your answer or thoughts…"></textarea>
        <div class="bd-reply-form-actions">
          <button type="button" class="cta" id="bdReplySubmit">Post reply →</button>
        </div>
        <div class="msg" id="bdReplyMsg"></div>
      </div>
    ` : `<div class="bd-empty" style="margin-top:16px">Sign in to post a reply.</div>`;

    main.innerHTML = `
      <div class="bd-detail">
        <div class="bd-detail-header">
          <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:8px">
            ${renderStatusBadge(post.status)}
            ${post.pinned_at ? `<span class="bd-pinned">Pinned</span>` : ''}
            ${tags}
          </div>
          <h2 class="bd-detail-title">${esc(post.title)}</h2>
          <div class="bd-detail-meta">
            <span>Posted by <b>${esc(getAuthorName(post.author_id))}</b></span>
            <span>·</span>
            <span>${relTime(post.created_at)}</span>
            ${post.updated_at && post.updated_at !== post.created_at ? `<span>· edited ${relTime(post.updated_at)}</span>` : ''}
          </div>
        </div>

        <div class="bd-body-md">${renderMarkdown(post.body_md)}</div>

        <div class="bd-upvote-row">
          <button class="bd-upvote-btn${postVoted ? ' voted' : ''}" id="bdPostVoteBtn" ${!user ? 'disabled title="Sign in to vote"' : ''}>
            ▲ ${postVoteCount}
          </button>
          ${modHtml}
        </div>

        <div class="bd-replies-section">
          <div class="bd-replies-head">${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}</div>
          <div id="bdRepliesList">${repliesHtml || `<div class="bd-empty">No replies yet. Be the first to help!</div>`}</div>
          ${replyFormHtml}
        </div>
      </div>
    `;

    // ── wire events in detail panel ────────────────────────────────────────

    // Upvote post
    document.getElementById('bdPostVoteBtn')?.addEventListener('click', () => toggleVote(post.id, null));

    // Upvote replies
    main.querySelectorAll('[data-vote-reply]').forEach(btn => {
      btn.addEventListener('click', () => toggleVote(null, btn.dataset.voteReply));
    });

    // Accept / unaccept answer
    main.querySelectorAll('[data-accept]').forEach(btn => {
      btn.addEventListener('click', () => markAccepted(btn.dataset.accept, true));
    });
    main.querySelectorAll('[data-unaccept]').forEach(btn => {
      btn.addEventListener('click', () => markAccepted(btn.dataset.unaccept, false));
    });

    // Moderation actions on post
    main.querySelectorAll('[data-mod]').forEach(btn => {
      btn.addEventListener('click', () => moderatePost(post, btn.dataset.mod));
    });

    // Moderation: delete reply
    main.querySelectorAll('[data-mod-reply-delete]').forEach(btn => {
      btn.addEventListener('click', () => moderateReply(btn.dataset.modReplyDelete));
    });

    // Reply form
    document.getElementById('bdReplySubmit')?.addEventListener('click', () => submitReply(post.id));
  }

  // ── toggle vote ────────────────────────────────────────────────────────────
  async function toggleVote(postId, replyId) {
    if (!user) { toast('Sign in to vote.', { error: true }); return; }
    const targetId = postId || replyId;
    const voted = voteSet.has(targetId);

    if (voted) {
      let q = supabase.from('board_votes').delete().eq('user_id', user.id);
      q = postId ? q.eq('post_id', postId).is('reply_id', null) : q.eq('reply_id', replyId);
      const { error } = await q;
      if (error) { toast(error.message, { error: true }); return; }
      voteSet.delete(targetId);
    } else {
      const row = { user_id: user.id, post_id: postId || null, reply_id: replyId || null };
      const { error } = await supabase.from('board_votes').insert(row);
      if (error) { toast(error.message, { error: true }); return; }
      voteSet.add(targetId);
    }
    // Refresh detail without full reload
    openPost(activePostId);
  }

  // ── mark accepted answer ───────────────────────────────────────────────────
  async function markAccepted(replyId, accept) {
    // If accepting, first clear any existing accepted answer on this post
    if (accept) {
      await supabase.from('board_replies').update({ is_accepted_answer: false }).eq('post_id', activePostId);
    }
    const { error } = await supabase
      .from('board_replies')
      .update({ is_accepted_answer: accept })
      .eq('id', replyId);
    if (error) { toast(error.message, { error: true }); return; }

    // If marking accepted, also update post status to answered
    if (accept) {
      await supabase.from('board_posts').update({ status: 'answered' }).eq('id', activePostId);
    } else {
      // If unaccepting, check if any other answers exist; if not revert to open
      const { data: others } = await supabase
        .from('board_replies')
        .select('id')
        .eq('post_id', activePostId)
        .eq('is_accepted_answer', true);
      if (!others?.length) {
        await supabase.from('board_posts').update({ status: 'open' }).eq('id', activePostId);
      }
    }

    toast(accept ? 'Marked as accepted answer.' : 'Answer unmarked.');
    await loadPosts();
    openPost(activePostId);
  }

  // ── moderation: post ───────────────────────────────────────────────────────
  async function moderatePost(post, action) {
    if (action === 'pin') {
      const val = post.pinned_at ? null : new Date().toISOString();
      const { error } = await supabase.from('board_posts').update({ pinned_at: val }).eq('id', post.id);
      if (error) { toast(error.message, { error: true }); return; }
      toast(val ? 'Post pinned.' : 'Post unpinned.');
    } else if (action === 'close') {
      const { error } = await supabase.from('board_posts').update({ status: 'closed' }).eq('id', post.id);
      if (error) { toast(error.message, { error: true }); return; }
      toast('Post closed.');
    } else if (action === 'reopen') {
      const { error } = await supabase.from('board_posts').update({ status: 'open' }).eq('id', post.id);
      if (error) { toast(error.message, { error: true }); return; }
      toast('Post reopened.');
    } else if (action === 'delete') {
      const ok = window.confirm('Soft-delete this post? It will no longer be visible.');
      if (!ok) return;
      const { error } = await supabase
        .from('board_posts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', post.id);
      if (error) { toast(error.message, { error: true }); return; }
      toast('Post deleted.');
      activePostId = null;
      document.getElementById('bdMain').innerHTML = `<div class="bd-empty">Post deleted.</div>`;
      history.replaceState(null, '', location.pathname);
    }
    await loadPosts();
    if (activePostId) openPost(activePostId);
  }

  // ── moderation: reply ─────────────────────────────────────────────────────
  async function moderateReply(replyId) {
    const ok = window.confirm('Soft-delete this reply?');
    if (!ok) return;
    const { error } = await supabase
      .from('board_replies')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', replyId);
    if (error) { toast(error.message, { error: true }); return; }
    toast('Reply deleted.');
    openPost(activePostId);
  }

  // ── submit reply ───────────────────────────────────────────────────────────
  async function submitReply(postId) {
    const body = document.getElementById('bdReplyBody')?.value?.trim();
    const msg = document.getElementById('bdReplyMsg');
    const btn = document.getElementById('bdReplySubmit');
    if (!body) {
      if (msg) { msg.className = 'msg show err'; msg.textContent = 'Reply cannot be empty.'; }
      return;
    }
    if (btn) { btn.disabled = true; btn.textContent = 'Posting…'; }
    if (msg) { msg.className = 'msg'; }

    const { error } = await supabase.from('board_replies').insert({
      post_id: postId,
      author_id: user.id,
      body_md: body,
    });

    if (btn) { btn.disabled = false; btn.textContent = 'Post reply →'; }
    if (error) {
      if (msg) { msg.className = 'msg show err'; msg.textContent = error.message; }
      return;
    }
    toast('Reply posted!');
    await loadPosts();
    openPost(postId);
  }

  // ── new post modal ────────────────────────────────────────────────────────
  let selectedNewTags = new Set();

  document.getElementById('bdAskBtn')?.addEventListener('click', () => {
    selectedNewTags.clear();
    document.getElementById('bdNewTitle').value = '';
    document.getElementById('bdNewBody').value = '';
    document.getElementById('bdTitleCount').textContent = '0 / 140';
    document.getElementById('bdNewTagChips').querySelectorAll('.tag-chip').forEach(el => el.classList.remove('active'));
    document.getElementById('bdNewMsg').className = 'msg';
    document.getElementById('bdNewPostModal').style.display = 'grid';
    document.getElementById('bdNewTitle').focus();
  });

  document.getElementById('bdNewCancel')?.addEventListener('click', () => {
    document.getElementById('bdNewPostModal').style.display = 'none';
  });

  document.getElementById('bdNewPostModal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
  });

  document.getElementById('bdNewTitle')?.addEventListener('input', e => {
    document.getElementById('bdTitleCount').textContent = `${e.target.value.length} / 140`;
  });

  document.getElementById('bdNewTagChips')?.querySelectorAll('.tag-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const tag = chip.dataset.tag;
      if (selectedNewTags.has(tag)) { selectedNewTags.delete(tag); chip.classList.remove('active'); }
      else { selectedNewTags.add(tag); chip.classList.add('active'); }
    });
  });

  document.getElementById('bdNewPost')?.addEventListener('click', async () => {
    const title = document.getElementById('bdNewTitle')?.value?.trim();
    const body = document.getElementById('bdNewBody')?.value?.trim();
    const msg = document.getElementById('bdNewMsg');
    const btn = document.getElementById('bdNewPost');

    if (!title || title.length < 3) {
      msg.className = 'msg show err'; msg.textContent = 'Title must be 3–140 characters.'; return;
    }
    if (!body) {
      msg.className = 'msg show err'; msg.textContent = 'Body is required.'; return;
    }

    btn.disabled = true; btn.textContent = 'Posting…';
    msg.className = 'msg';

    const { data, error } = await supabase.from('board_posts').insert({
      author_id: user.id,
      title,
      body_md: body,
      tags: [...selectedNewTags],
      status: 'open',
    }).select('id').maybeSingle();

    btn.disabled = false; btn.textContent = 'Post question →';

    if (error) {
      msg.className = 'msg show err'; msg.textContent = error.message; return;
    }
    toast('Question posted!');
    document.getElementById('bdNewPostModal').style.display = 'none';
    await loadPosts();
    if (data?.id) openPost(data.id);
  });

  // ── filter wiring ─────────────────────────────────────────────────────────

  document.getElementById('bdTagChips')?.querySelectorAll('.tag-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      filterTag = chip.dataset.tag || null;
      document.querySelectorAll('#bdTagChips .tag-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      loadPosts();
    });
  });

  document.getElementById('bdStatusGroup')?.querySelectorAll('.bd-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      filterStatus = btn.dataset.val;
      document.querySelectorAll('#bdStatusGroup .bd-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadPosts();
    });
  });

  document.getElementById('bdSortGroup')?.querySelectorAll('.bd-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      filterSort = btn.dataset.val;
      document.querySelectorAll('#bdSortGroup .bd-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadPosts();
    });
  });

  // ── init ──────────────────────────────────────────────────────────────────
  await Promise.all([loadPosts(), loadVotes()]);

  // Handle ?post=<uuid> on page load
  const urlId = new URLSearchParams(location.search).get('post');
  if (urlId) openPost(urlId);
}
