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
    // Strip optional wrapping quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    } else if (val.startsWith('[') || val.startsWith('{')) {
      try { val = JSON.parse(val); } catch (_) { /* leave as raw string */ }
    }
    meta[key] = val;
  }
  return meta;
}

/**
 * renderLesson(markdownText, targetEl?)
 *   Parses optional frontmatter and returns { meta, html }.
 *   If targetEl is provided, also writes html into it.
 */
export function renderLesson(markdownText, targetEl) {
  let meta = {};
  let body = markdownText || '';

  const fmMatch = body.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (fmMatch) {
    meta = parseFrontmatter(fmMatch[1]);
    body = body.slice(fmMatch[0].length);
  }

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

/**
 * renderFrontmatterHeader(meta)
 *   Returns HTML string for a metadata strip above the body.
 */
export function renderFrontmatterHeader(meta = {}) {
  const parts = [];

  // Meta row: reading time + tags
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

  // Video
  if (meta.video) {
    parts.push(`
      <div class="lm-video">
        <iframe src="${escapeHtml(meta.video)}" title="Lesson video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
      </div>`);
  }

  // Lab card
  if (meta.lab && typeof meta.lab === 'object' && meta.lab.url) {
    parts.push(`
      <a class="lm-lab" href="${escapeHtml(meta.lab.url)}" target="_blank" rel="noopener">
        <div class="lm-lab-kicker">Today's lab →</div>
        <div class="lm-lab-title">${escapeHtml(meta.lab.title || 'Open lab')}</div>
        <div class="lm-lab-host muted">${escapeHtml(domainOf(meta.lab.url))}</div>
      </a>`);
  }

  // Resources
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
