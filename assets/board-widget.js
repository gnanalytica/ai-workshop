// Recent board posts widget. Drop-in: mountBoardRecent(container, opts).
// opts.limit  — number of posts (default 5)
// opts.filter — 'unanswered' | 'recent' (default 'recent')
// opts.title  — header text (default 'Community board')
// No framework. Reads board_posts, links each row to board.html?post=<id>.
import { supabase } from './supabase.js';

export async function mountBoardRecent(container, opts = {}) {
  if (!container) return;
  const limit = opts.limit ?? 5;
  const filter = opts.filter ?? 'recent';
  const title = opts.title ?? 'Community board';

  container.innerHTML = `
    <div class="card" style="padding:18px">
      <h3 style="margin:0 0 6px;display:flex;justify-content:space-between;align-items:baseline;gap:10px">
        <span>${esc(title)}</span>
        <a class="more" href="board.html" style="font-size:12.5px;color:var(--accent);text-decoration:none">Open board →</a>
      </h3>
      <div class="sub muted" style="font-size:12.5px;margin:0 0 12px">${filter === 'unanswered' ? 'Open questions — jump in' : 'Recent questions across the community'}</div>
      <div id="bwList"><div class="muted" style="font-size:12.5px;padding:8px 0">Loading…</div></div>
    </div>
  `;

  let q = supabase.from('board_posts')
    .select('id,title,tags,status,created_at,pinned_at,author_id')
    .order('pinned_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (filter === 'unanswered') q = q.eq('status', 'open');

  const { data, error } = await q;
  const list = container.querySelector('#bwList');
  if (error) { list.innerHTML = `<div class="muted" style="font-size:12.5px;padding:8px 0">Failed to load: ${esc(error.message)}</div>`; return; }
  if (!data || data.length === 0) {
    list.innerHTML = `<div class="muted" style="font-size:12.5px;padding:8px 0">No posts yet. <a href="board.html" style="color:var(--accent)">Ask the first question →</a></div>`;
    return;
  }

  // Resolve author names for the visible set.
  const authorIds = [...new Set(data.map(p => p.author_id))];
  const { data: profs } = await supabase.from('profiles').select('id,full_name').in('id', authorIds);
  const nameById = new Map((profs || []).map(p => [p.id, p.full_name || '']));

  list.innerHTML = data.map(p => {
    const name = nameById.get(p.author_id) || '—';
    const tags = (p.tags || []).slice(0, 3).map(t => `<span class="pill" style="font-size:10.5px;padding:2px 7px;margin-right:4px">${esc(t)}</span>`).join('');
    const status = p.status === 'answered' ? '<span style="color:var(--accent);font-size:11px;margin-left:6px">✓ answered</span>' : '';
    return `<a href="board.html?post=${esc(p.id)}" style="display:block;text-decoration:none;color:inherit;padding:10px 0;border-top:1px solid var(--line)">
      <div style="font-size:13.5px;font-weight:600;line-height:1.35">${esc(p.title)}${status}</div>
      <div style="font-size:11.5px;color:var(--muted);margin-top:3px">${tags}· ${esc(name)} · ${relTime(p.created_at)}</div>
    </a>`;
  }).join('');
}

function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function relTime(iso) {
  const d = new Date(iso); const ms = Date.now() - d.getTime(); const s = Math.floor(ms/1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s/60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60); if (h < 24) return `${h}h ago`;
  const dd = Math.floor(h/24); if (dd < 7) return `${dd}d ago`;
  return d.toLocaleDateString();
}
