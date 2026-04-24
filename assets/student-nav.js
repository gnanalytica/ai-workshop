// Shared top-bar nav for student-facing pages (dashboard, people, timeline,
// peer-reviews, teams, certificate, showcase, …).
//
// This is intentionally NOT used by `dashboard.html`, `day.html`, `index.html`,
// or `setup-guide.html`: those have bespoke nav structures (profile dropdown,
// day-specific mobile menu, marketing anchors, TOC) that don't fit the
// simple "brand + back-to-dashboard + theme" pattern. Migrating them would
// change the look and break tightly-coupled inline JS — see report from the
// nav-standardisation refactor for details.
//
// The module *only* renders the nav HTML and (optionally) wires the mobile
// menu and search button. Theme toggle wiring is left to each page's
// existing `wireThemeToggle()` import, and the ⌘K command palette is added
// via the page's existing `prependNavFind()` import — both of which look up
// elements by ID after this module has injected the DOM.

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  people: 'People',
  timeline: 'Timeline',
  'peer-reviews': 'Peer reviews',
  teams: 'Teams',
  certificate: 'Certificate',
  showcase: 'Showcase',
};

const DEFAULT_SKIP_TARGETS = {
  dashboard: '#dash',
  people: '#panel',
  timeline: '#main',
  'peer-reviews': '#panel',
  teams: '#panel',
  certificate: '#root',
  showcase: '#root',
};

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/**
 * Render and inject the student nav top bar.
 *
 * @param {Object} opts
 * @param {string} opts.active                Key for active-link highlighting (e.g. 'people', 'timeline').
 * @param {string} [opts.title]               Brand title suffix. Defaults to a label derived from `active`.
 * @param {string} [opts.skipTarget]          Anchor for the skip-link. Defaults from `active`.
 * @param {Array<{href:string,label:string,key?:string,muted?:boolean}>} [opts.links]
 *                                            Right-side links. Defaults to a single "← Dashboard" link.
 * @param {boolean} [opts.showSignout]        Show a hidden #signoutBtn (some pages reveal it after auth).
 * @param {HTMLElement|string} [opts.mount]   Where to inject the nav. Defaults to `#studentNav`
 *                                            placeholder if present, else prepended to <body>.
 * @param {boolean} [opts.replaceExistingNav] If true, replace the first <nav> in <body>. Default: true.
 */
export function renderStudentNav(opts = {}) {
  const active = opts.active || '';
  const titleText = opts.title || PAGE_TITLES[active] || 'AI Workshop';
  const skipTarget = opts.skipTarget || DEFAULT_SKIP_TARGETS[active] || '#main';
  const links = Array.isArray(opts.links)
    ? opts.links
    : [{ href: 'dashboard.html', label: '← Dashboard', muted: true }];

  const linksHtml = links
    .map((l) => {
      const isActive = l.key && l.key === active;
      const muted = l.muted !== false; // muted by default
      const style = `font-size:13px;color:var(--${muted && !isActive ? 'muted' : 'ink'})`;
      const cls = isActive ? ' class="active"' : (muted ? ' class="muted"' : '');
      return `<a href="${esc(l.href)}"${cls} style="${style}">${esc(l.label)}</a>`;
    })
    .join('\n      ');

  const signoutBtn = opts.showSignout
    ? `<button class="signout" id="signoutBtn" style="display:none">Sign out</button>`
    : '';

  const navHtml =
    `<a href="${esc(skipTarget)}" class="skip-link">Skip to main content</a>\n` +
    `<nav data-student-nav="1" data-student-nav-active="${esc(active)}">\n` +
    `  <div class="wrap nav-in">\n` +
    `    <div class="brand"><span class="dot"></span> Gnanalytica · ${esc(titleText)}</div>\n` +
    `    <div style="display:flex;gap:14px;align-items:center">\n` +
    `      ${linksHtml}\n` +
    `      <button class="theme-toggle" id="themeToggle" title="Toggle light/dark" aria-label="Toggle theme"></button>\n` +
    `      ${signoutBtn}\n` +
    `    </div>\n` +
    `  </div>\n` +
    `</nav>\n`;

  // Resolve mount target.
  let mount = opts.mount;
  if (typeof mount === 'string') mount = document.querySelector(mount);
  if (!mount) mount = document.getElementById('studentNav');

  const replace = opts.replaceExistingNav !== false;

  if (mount) {
    mount.innerHTML = navHtml;
  } else if (replace) {
    // Replace the first <nav> element directly inside <body> (and its
    // preceding skip-link, if any) to keep DOM order stable.
    const existing = document.querySelector('body > nav');
    if (existing) {
      // Remove a leading skip-link sibling so we don't end up with two.
      const prev = existing.previousElementSibling;
      if (prev && prev.classList?.contains('skip-link')) prev.remove();
      const tpl = document.createElement('template');
      tpl.innerHTML = navHtml;
      existing.replaceWith(...tpl.content.childNodes);
    } else {
      document.body.insertAdjacentHTML('afterbegin', navHtml);
    }
  } else {
    document.body.insertAdjacentHTML('afterbegin', navHtml);
  }

  // Wire any in-nav controls that aren't covered by the page's existing
  // wireThemeToggle()/prependNavFind() imports. Currently nothing else.
  return {
    setActive(key) {
      const root = document.querySelector('nav[data-student-nav]');
      if (!root) return;
      root.setAttribute('data-student-nav-active', key || '');
      root.querySelectorAll('a').forEach((a) => a.classList.remove('active'));
    },
  };
}
