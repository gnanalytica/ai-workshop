// content-renderer.js — fetches markdown with optional YAML-ish frontmatter and renders to HTML.
import { marked } from 'https://esm.sh/marked@11';

marked.setOptions({ gfm: true, breaks: false, mangle: false, headerIds: true });

/**
 * Parse a YAML-ish frontmatter block.
 * Supports simple `key: value` pairs.
 * Array / object values may be written as inline JSON.
 */
function parseFrontmatter(text) {
  const meta = {};
  const lines = text.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    } else if (val.startsWith('[') || val.startsWith('{')) {
      try { val = JSON.parse(val); } catch (_) { /* leave as raw string */ }
    }
    meta[key] = val;
  }
  return meta;
}

function splitFrontmatter(markdownText) {
  let meta = {};
  let body = markdownText || '';
  const fmMatch = body.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (fmMatch) {
    meta = parseFrontmatter(fmMatch[1]);
    body = body.slice(fmMatch[0].length);
  }
  return { meta, body };
}

/**
 * renderLesson(markdownText, targetEl?)
 *   Parses optional frontmatter and returns { meta, html }.
 *   If targetEl is provided, also writes html into it.
 */
export function renderLesson(markdownText, targetEl) {
  const { meta, body } = splitFrontmatter(markdownText);
  const html = marked.parse(body);
  if (targetEl) targetEl.innerHTML = html;
  return { meta, html };
}

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function domainOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return ''; }
}

function slugify(s = '') {
  return String(s).toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60) || 'section';
}

const KIND_MATCHERS = [
  { kind: 'intro',      re: /^intro\b/i },
  { kind: 'read',       re: /^read\s*:/i },
  { kind: 'watch',      re: /^watch\s*:/i },
  { kind: 'lab',        re: /^lab\s*:/i },
  { kind: 'quiz',       re: /^quiz\b/i },
  { kind: 'assignment', re: /^assignment\b/i },
  { kind: 'discuss',    re: /^discuss\s*:/i },
];

function classifyHeading(title) {
  for (const m of KIND_MATCHERS) if (m.re.test(title)) return m.kind;
  return 'section';
}

function stripKindPrefix(title, kind) {
  if (kind === 'section' || kind === 'intro' || kind === 'quiz' || kind === 'assignment') {
    return title.replace(/^(intro|quiz|assignment)\b[\s:—-]*/i, '').trim() || title;
  }
  return title.replace(/^(read|watch|lab|discuss)\s*:\s*/i, '').trim();
}

const YT_RE = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})(?:[?&][^\s]*)?/;

function extractYouTube(body) {
  const lines = body.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(YT_RE);
    // Only treat as a standalone embed if the whole line is the URL (possibly wrapped in <>)
    if (m && (line === m[0] || line === `<${m[0]}>`)) {
      const id = m[1];
      return {
        embedUrl: `https://www.youtube.com/embed/${id}`,
        rawLine: raw,
      };
    }
  }
  return null;
}

/**
 * parseModules(markdownText)
 *   Splits the markdown body by top-level `## ` headings into modules.
 *   Returns { meta, modules: [{ id, title, kind, html, embedVideo? }], intro? }
 *   Content before the first `## ` heading is returned separately as `intro` (html only).
 */
export function parseModules(markdownText) {
  const { meta, body } = splitFrontmatter(markdownText);

  // Split on lines that start with `## ` (avoid matching deeper headings).
  // We'll walk line-by-line to build sections, keeping the heading line as the split marker.
  const lines = body.split(/\r?\n/);
  const sections = [];
  let pre = [];
  let current = null;

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) {
      if (current) sections.push(current);
      else if (pre.length) {
        // preamble collected
      }
      let title = h2[1].trim();
      // Optional {#id} annotation
      let explicitId = null;
      const idMatch = title.match(/\{#([A-Za-z0-9_-]+)\}\s*$/);
      if (idMatch) {
        explicitId = idMatch[1];
        title = title.slice(0, idMatch.index).trim();
      }
      current = { rawTitle: title, explicitId, lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else {
      pre.push(line);
    }
  }
  if (current) sections.push(current);

  const intro = pre.join('\n').trim();
  const introHtml = intro ? marked.parse(intro) : '';

  // Skip the first H1 (title) from the intro preamble rendering if it's just "# Title"
  // (we'll leave rendering decision to consumer — include as-is).

  const usedIds = new Set();
  const modules = sections.map((s) => {
    const kind = classifyHeading(s.rawTitle);
    const cleanTitle = stripKindPrefix(s.rawTitle, kind) || s.rawTitle;

    // ID
    let id = s.explicitId || slugify(`${kind}-${cleanTitle}`);
    let baseId = id; let i = 2;
    while (usedIds.has(id)) { id = `${baseId}-${i++}`; }
    usedIds.add(id);

    let sectionBody = s.lines.join('\n').trim();

    // Extract YouTube if the body contains a single URL line
    let embedVideo = null;
    if (kind === 'watch') {
      const yt = extractYouTube(sectionBody);
      if (yt) {
        embedVideo = yt.embedUrl;
        sectionBody = sectionBody.split(/\r?\n/).filter(l => l.trim() !== yt.rawLine.trim() && l.trim() !== `<${yt.rawLine.trim()}>`).join('\n').trim();
      }
    }

    const html = sectionBody ? marked.parse(sectionBody) : '';
    return { id, title: cleanTitle, kind, html, embedVideo };
  });

  return { meta, intro: introHtml, modules };
}

/**
 * renderFrontmatterHeader(meta) — full header strip (reading time + tags + video + lab + resources)
 */
export function renderFrontmatterHeader(meta = {}) {
  const parts = [];

  const metaBits = [];
  if (meta.reading_time) {
    metaBits.push(`<span class="lm-read">⏱ ${escapeHtml(meta.reading_time)}</span>`);
  }
  if (Array.isArray(meta.tags) && meta.tags.length) {
    metaBits.push(
      `<span class="lm-tags">${meta.tags.map(t => `<span class="tag tag-pend">${escapeHtml(t)}</span>`).join(' ')}</span>`
    );
  }
  if (metaBits.length) {
    parts.push(`<div class="lm-row">${metaBits.join('')}</div>`);
  }

  if (meta.video) {
    parts.push(`
      <div class="lm-video">
        <iframe src="${escapeHtml(meta.video)}" title="Lesson video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
      </div>`);
  }

  if (meta.lab && typeof meta.lab === 'object' && meta.lab.url) {
    parts.push(`
      <a class="lm-lab" href="${escapeHtml(meta.lab.url)}" target="_blank" rel="noopener">
        <div class="lm-lab-kicker">Today's lab →</div>
        <div class="lm-lab-title">${escapeHtml(meta.lab.title || 'Open lab')}</div>
        <div class="lm-lab-host muted">${escapeHtml(domainOf(meta.lab.url))}</div>
      </a>`);
  }

  if (Array.isArray(meta.resources) && meta.resources.length) {
    const items = meta.resources.map(r => {
      const url = r?.url || '#';
      const title = r?.title || url;
      return `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener">
        <span>${escapeHtml(title)}</span>
        <span class="lm-host muted">${escapeHtml(domainOf(url))}</span>
      </a></li>`;
    }).join('');
    parts.push(`
      <div class="lm-resources">
        <div class="lm-sec-h">Resources</div>
        <ul>${items}</ul>
      </div>`);
  }

  return parts.join('\n');
}

/**
 * renderMetaStrip(meta) — compact version with only reading-time + tags.
 */
export function renderMetaStrip(meta = {}) {
  const bits = [];
  if (meta.reading_time) {
    bits.push(`<span class="lm-read">⏱ ${escapeHtml(meta.reading_time)}</span>`);
  }
  if (Array.isArray(meta.tags) && meta.tags.length) {
    bits.push(
      `<span class="lm-tags">${meta.tags.map(t => `<span class="tag tag-pend">${escapeHtml(t)}</span>`).join(' ')}</span>`
    );
  }
  if (!bits.length) return '';
  return `<div class="lm-row">${bits.join('')}</div>`;
}

/**
 * renderResourcesBlock(meta) — just the resources list block, for rendering separately.
 */
export function renderResourcesBlock(meta = {}) {
  if (!Array.isArray(meta.resources) || !meta.resources.length) return '';
  const items = meta.resources.map(r => {
    const url = r?.url || '#';
    const title = r?.title || url;
    return `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener">
      <span>${escapeHtml(title)}</span>
      <span class="lm-host muted">${escapeHtml(domainOf(url))}</span>
    </a></li>`;
  }).join('');
  return `
    <div class="lm-resources">
      <div class="lm-sec-h">Resources</div>
      <ul>${items}</ul>
    </div>`;
}

export { escapeHtml, domainOf };
