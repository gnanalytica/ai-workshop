// Nav search pill + global command palette (⌘/Ctrl+K).

import { DAYS, WEEK_TITLES } from './days.js';

const CACHE_KEY = 'lesson_search_cache_v1';

const SHORTCUTS = [
  { href: 'dashboard.html', label: 'Dashboard', hint: 'Your home' },
  { href: 'dashboard.html#lessons', label: 'Lessons', hint: 'All days' },
  { href: 'dashboard.html#capstone', label: 'Capstone', hint: 'Milestones & team' },
  { href: 'people.html', label: 'People', hint: 'Cohort, teams, Hall of Fame' },
  { href: 'timeline.html', label: 'Timeline', hint: '30-day schedule' },
  { href: 'peer-reviews.html', label: 'Peer reviews', hint: 'Assigned reviews' },
  { href: 'certificate.html', label: 'Certificate', hint: 'After 30/30' },
  { href: 'teams.html', label: 'Teams', hint: 'Capstone teams' },
  { href: 'index.html', label: 'Home', hint: 'Landing' },
  { href: 'admin-home.html', label: 'Admin home', hint: 'Staff' },
  { href: 'faculty.html', label: 'Faculty', hint: 'Stream & roster' },
];

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function stripMarkdown(raw) {
  let t = raw.replace(/^---[\s\S]*?---\s*/m, '');
  t = t.replace(/```[\s\S]*?```/g, ' ');
  t = t.replace(/`[^`]*`/g, ' ');
  t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');
  t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  t = t.replace(/^#+\s+/gm, '');
  t = t.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1');
  t = t.replace(/^>\s?/gm, '');
  t = t.replace(/\|/g, ' ');
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

function snippet(text, query) {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query);
  if (idx < 0) return '';
  const start = Math.max(0, idx - 90);
  const end = Math.min(text.length, idx + query.length + 160);
  const prefix = start > 0 ? '… ' : '';
  const suffix = end < text.length ? ' …' : '';
  return prefix + esc(text.slice(start, end)) + suffix;
}

async function buildLessonIndex() {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length === DAYS.length) return parsed;
    }
  } catch {}
  const results = await Promise.all(
    DAYS.map(async (d) => {
      const nn = String(d.n).padStart(2, '0');
      try {
        const res = await fetch(`content/day-${nn}.md`);
        if (!res.ok) return { n: d.n, w: d.w, title: d.title, text: '' };
        const raw = await res.text();
        return { n: d.n, w: d.w, title: d.title, text: stripMarkdown(raw) };
      } catch {
        return { n: d.n, w: d.w, title: d.title, text: '' };
      }
    }),
  );
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(results));
  } catch {}
  return results;
}

let paletteIndex = null;
let paletteDebounce = null;

function ensurePaletteDom() {
  if (document.getElementById('gnCmdPalette')) return;
  document.body.insertAdjacentHTML(
    'beforeend',
    `<div id="gnCmdPalette" class="gn-cmd-palette" aria-hidden="true">
      <div class="gn-cmd-palette__backdrop" data-close-palette="1"></div>
      <div class="gn-cmd-palette__panel" role="dialog" aria-label="Command palette" aria-modal="true">
        <div class="gn-cmd-palette__head">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.6"/><path d="m14 14 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          <input type="search" id="gnCmdPaletteQ" class="gn-cmd-palette__input" placeholder="Search lessons, pages…" autocomplete="off" enterkeyhint="search" />
          <kbd class="gn-cmd-palette__esc">Esc</kbd>
        </div>
        <div id="gnCmdPaletteBody" class="gn-cmd-palette__body"></div>
      </div>
    </div>`,
  );
  const root = document.getElementById('gnCmdPalette');
  root.querySelector('[data-close-palette]')?.addEventListener('click', () => closeCommandPalette());
  root.querySelector('.gn-cmd-palette__esc')?.addEventListener('click', () => closeCommandPalette());
  document.getElementById('gnCmdPaletteQ')?.addEventListener('input', () => {
    clearTimeout(paletteDebounce);
    paletteDebounce = setTimeout(() => runPaletteQuery(), 120);
  });
  document.getElementById('gnCmdPaletteQ')?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeCommandPalette();
    }
  });
}

export function closeCommandPalette() {
  const root = document.getElementById('gnCmdPalette');
  if (!root) return;
  root.classList.remove('gn-cmd-palette--open');
  root.setAttribute('aria-hidden', 'true');
  const p = location.pathname || '';
  if (p.endsWith('/find.html') || p.endsWith('find.html') || p.endsWith('/search.html') || p.endsWith('search.html')) {
    window.location.href = 'index.html';
  }
}

async function runPaletteQuery() {
  const inp = document.getElementById('gnCmdPaletteQ');
  const body = document.getElementById('gnCmdPaletteBody');
  if (!inp || !body) return;
  const q = (inp.value || '').trim().toLowerCase();
  const chunks = [];

  const sc = SHORTCUTS.filter((s) => {
    if (!q) return true;
    return `${s.label} ${s.hint}`.toLowerCase().includes(q);
  }).slice(0, 12);
  if (sc.length) {
    chunks.push(
      `<div class="gn-cmd-sec"><div class="gn-cmd-sec__t">Shortcuts</div>${sc
        .map(
          (s) =>
            `<a class="gn-cmd-row" href="${esc(s.href)}"><span class="gn-cmd-row__t">${esc(s.label)}</span><span class="gn-cmd-row__h">${esc(s.hint)}</span></a>`,
        )
        .join('')}</div>`,
    );
  }

  const titleHits = DAYS.filter((d) => {
    if (!q) return false;
    const blob = `${d.n} ${d.title} ${WEEK_TITLES[d.w] || ''} week ${d.w}`.toLowerCase();
    return blob.includes(q);
  });
  if (titleHits.length) {
    chunks.push(
      `<div class="gn-cmd-sec"><div class="gn-cmd-sec__t">Lesson titles</div>${titleHits
        .map(
          (d) =>
            `<a class="gn-cmd-row" href="day.html?n=${d.n}"><span class="gn-cmd-row__tag">Day ${String(d.n).padStart(2, '0')}</span><span class="gn-cmd-row__t">${esc(d.title)}</span></a>`,
        )
        .join('')}</div>`,
    );
  }

  if (q.length >= 2) {
    if (!paletteIndex) paletteIndex = await buildLessonIndex();
    const ftHits = [];
    for (const row of paletteIndex) {
      const hay = `${row.title} ${row.text}`.toLowerCase();
      if (!hay.includes(q)) continue;
      const sn = row.text ? snippet(row.text, q) : '';
      ftHits.push({ row, sn });
      if (ftHits.length >= 20) break;
    }
    if (ftHits.length) {
      chunks.push(
        `<div class="gn-cmd-sec"><div class="gn-cmd-sec__t">Lesson content</div>${ftHits
          .map(
            ({ row, sn }) =>
              `<a class="gn-cmd-row gn-cmd-row--ft" href="day.html?n=${row.n}"><span class="gn-cmd-row__tag">Day ${String(row.n).padStart(2, '0')}</span><span class="gn-cmd-row__t">${esc(row.title)}</span>${sn ? `<span class="gn-cmd-row__snip">${sn}</span>` : ''}</a>`,
          )
          .join('')}</div>`,
      );
    }
  }

  if (!chunks.length) {
    body.innerHTML = `<div class="gn-cmd-empty">${q ? 'No matches.' : 'Type to search lessons, or pick a shortcut.'}</div>`;
    return;
  }
  body.innerHTML = chunks.join('');
  body.querySelectorAll('a.gn-cmd-row').forEach((a) => {
    a.addEventListener('click', () => closeCommandPalette());
  });
}

export function openCommandPalette(initialQuery = '') {
  ensurePaletteDom();
  const root = document.getElementById('gnCmdPalette');
  const inp = document.getElementById('gnCmdPaletteQ');
  inp.value = initialQuery || '';
  root.classList.add('gn-cmd-palette--open');
  root.setAttribute('aria-hidden', 'false');
  inp.focus();
  if (typeof inp.select === 'function') inp.select();
  paletteIndex = null;
  runPaletteQuery();
}

function bindGlobalFindShortcut() {
  if (window.__gnNavFindShortcut) return;
  window.__gnNavFindShortcut = true;
  document.addEventListener(
    'keydown',
    (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      if (e.key.toLowerCase() !== 'k') return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      e.preventDefault();
      openCommandPalette('');
    },
    true,
  );
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const root = document.getElementById('gnCmdPalette');
    if (root?.classList.contains('gn-cmd-palette--open')) closeCommandPalette();
  });
}

export function prependNavFind(root = document) {
  const navIn = root.querySelector('nav .nav-in');
  if (!navIn || navIn.querySelector(':scope > .site-search--nav')) return;
  const brand = navIn.querySelector(':scope > .brand');
  if (!brand) return;
  const isMac = /Mac|iPhone|iPad/i.test(navigator.userAgent || '');
  const kbd = isMac ? '⌘K' : 'Ctrl+K';
  brand.insertAdjacentHTML(
    'afterend',
    `<form class="site-search site-search--nav" action="#" method="get" role="search" title="Open command palette. ${kbd} anywhere.">
      <span class="site-search__icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.6"/><path d="m14 14 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </span>
      <label class="sr-only" for="siteNavFindQ">Search workshop</label>
      <input class="site-search__input" type="search" id="siteNavFindQ" name="q" placeholder="Search…" autocomplete="off" maxlength="200" enterkeyhint="search" />
      <kbd class="site-search__kbd" aria-hidden="true">${kbd}</kbd>
    </form>`,
  );
  const form = navIn.querySelector('.site-search--nav');
  const inp = document.getElementById('siteNavFindQ');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    openCommandPalette(inp.value);
  });
  bindGlobalFindShortcut();
}
