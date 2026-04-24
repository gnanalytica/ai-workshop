// Grouped sidebar nav for admin/faculty pages. Call wrapAdminMainLayout() after setting #adminNav innerHTML.

const NAV_ICONS = {
  home: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z"/></svg>',
  calendar:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  file: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
  users:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
  users2:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
  grid: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  briefcase:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M12 12v4"/></svg>',
  building:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M3 21h18M6 21V7l6-4 6 4v14M9 21v-4h6v4"/></svg>',
  clipboard:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>',
  check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>',
  alert: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>',
  chart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>',
  book: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
};

// Each page declares which roles may see it. `renderAdminNav` filters the list
// by the caller's role set. Roles: admin, trainer, tech_support, support, executive.
// Legacy `adminOnly: true` is preserved and interpreted as allowedRoles:['admin'].
export const ADMIN_PAGES = [
  { href: 'admin-home.html',         label: 'Home',            group: 'cohort',   icon: 'home',      allowedRoles: ['admin','trainer','tech_support','support','executive'] },
  { href: 'admin-schedule.html',     label: 'Schedule',        group: 'cohort',   icon: 'calendar',  allowedRoles: ['admin','trainer','tech_support','support','executive'] },
  { href: 'faculty.html',            label: 'Faculty hub',     group: 'cohort',   icon: 'users2',    allowedRoles: ['support','executive'] },
  { href: 'admin-content.html',      label: 'Content',         group: 'classwork',icon: 'file',      allowedRoles: ['admin','trainer'] },
  { href: 'admin.html',              label: 'Registrations',   group: 'people',   icon: 'users',     allowedRoles: ['admin','trainer'] },
  { href: 'admin-teams.html',        label: 'Teams',           group: 'people',   icon: 'users2',    allowedRoles: ['admin','trainer'] },
  { href: 'admin-pods.html',         label: 'Pods',            group: 'people',   icon: 'grid',      allowedRoles: ['admin','trainer'] },
  { href: 'admin-faculty.html',      label: 'Faculty',         group: 'people',   icon: 'briefcase', adminOnly: true, allowedRoles: ['admin'] },
  { href: 'admin-orgs.html',         label: 'Orgs & codes',    group: 'people',   icon: 'building',  adminOnly: true, allowedRoles: ['admin'] },
  { href: 'admin-student.html',      label: 'Student work',    group: 'work',     icon: 'clipboard', allowedRoles: ['admin','trainer','executive'] },
  { href: 'admin-milestones.html',   label: 'Capstone tracker',group: 'work',     icon: 'chart',     allowedRoles: ['admin','trainer','support','executive'] },
  { href: 'admin-attendance.html',   label: 'Attendance',      group: 'work',     icon: 'check',     allowedRoles: ['admin','trainer','support','executive'] },
  { href: 'admin-stuck.html',        label: 'Stuck queue',     group: 'work',     icon: 'alert',     allowedRoles: ['admin','trainer','tech_support','support'] },
  { href: 'board.html',              label: 'Community board', group: 'work',     icon: 'alert',     allowedRoles: ['admin','trainer','tech_support','support','executive'] },
  { href: 'admin-analytics.html',    label: 'Analytics',       group: 'insights', icon: 'chart',     allowedRoles: ['admin','trainer','executive'] },
  { href: 'faculty-guide.html',      label: 'Faculty guide',   group: 'insights', icon: 'book',      allowedRoles: ['admin','trainer','tech_support','support'] },
  { href: 'setup-guide.html',        label: 'Setup guide',     group: 'insights', icon: 'book',      allowedRoles: ['admin','trainer','tech_support','support','executive'] },
];

/** Legacy: Support faculty view — still exported for any caller that hasn't migrated to role arrays. */
export const SUPPORT_FACULTY_PAGES = ADMIN_PAGES.filter((p) => p.allowedRoles.includes('support'));

const GROUP_LABEL = {
  cohort: 'Cohort',
  classwork: 'Classwork',
  people: 'People',
  work: 'Work',
  insights: 'Insights',
};

function iconHtml(key) {
  return NAV_ICONS[key] || NAV_ICONS.file;
}

/** Sync <details> open state: desktop = all open; mobile = only section with active link. */
export function syncAdminNavGroups() {
  const wide = window.matchMedia('(min-width: 961px)').matches;
  document.querySelectorAll('.admin-nav-group').forEach((det) => {
    if (wide) {
      det.setAttribute('open', '');
    } else if (det.querySelector('.admin-nav-link--active')) {
      det.setAttribute('open', '');
    } else {
      det.removeAttribute('open');
    }
  });
}

export function initAdminNavChrome() {
  const panel = document.getElementById('panel');
  if (!panel || !panel.classList.contains('admin-shell') || panel.dataset.adminNavChrome === '1') return;
  panel.dataset.adminNavChrome = '1';
  document.body.classList.add('has-admin-shell');
  document.body.classList.toggle('has-admin-shell-drawer-only', panel.classList.contains('admin-shell--drawer-only'));

  const navIn = document.querySelector('body > nav .nav-in');
  if (navIn && !navIn.querySelector('.admin-nav-burger')) {
    const burger = document.createElement('button');
    burger.type = 'button';
    burger.className = 'admin-nav-burger';
    burger.setAttribute('aria-label', 'Open admin navigation');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-controls', 'adminShellAside');
    burger.innerHTML =
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
    const brand = navIn.querySelector('.brand');
    if (brand) brand.insertAdjacentElement('beforebegin', burger);
    else navIn.prepend(burger);

    let backdrop = document.getElementById('adminNavBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'adminNavBackdrop';
      backdrop.className = 'admin-nav-backdrop';
      backdrop.tabIndex = -1;
      backdrop.setAttribute('aria-hidden', 'true');
      panel.insertAdjacentElement('beforebegin', backdrop);
    }

    const closeDrawer = () => {
      panel.classList.remove('admin-shell--drawer-open');
      burger.setAttribute('aria-expanded', 'false');
      backdrop.classList.remove('is-visible');
      document.body.style.overflow = '';
    };
    const openDrawer = () => {
      if (window.matchMedia('(min-width: 961px)').matches && !panel.classList.contains('admin-shell--drawer-only')) return;
      panel.classList.add('admin-shell--drawer-open');
      burger.setAttribute('aria-expanded', 'true');
      backdrop.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
    };

    burger.addEventListener('click', () => {
      if (panel.classList.contains('admin-shell--drawer-open')) closeDrawer();
      else openDrawer();
    });
    backdrop.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });
    panel.addEventListener('click', (e) => {
      const a = e.target.closest?.('#adminNav a.admin-nav-link, #adminNav a.admin-nav-sub-link');
      if (a && window.matchMedia('(max-width: 960px)').matches) closeDrawer();
    });

    const drawerClose = document.querySelector('.admin-nav-drawer-close');
    drawerClose?.addEventListener('click', closeDrawer);

    window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 961px)').matches) closeDrawer();
      syncAdminNavGroups();
    });
  }

  syncAdminNavGroups();
}

/** Move all siblings after #adminNav into .admin-main and mark #panel as admin-shell. */
export function wrapAdminMainLayout() {
  const panel = document.getElementById('panel');
  if (!panel || panel.dataset.adminShell === '1') return;
  const nav = document.getElementById('adminNav');
  if (!nav || nav.parentElement !== panel) return;
  nav.classList.add('admin-nav-slot');
  const wrap = document.createElement('div');
  wrap.className = 'admin-main';
  while (nav.nextSibling) {
    wrap.appendChild(nav.nextSibling);
  }
  panel.appendChild(wrap);
  panel.classList.add('admin-shell');
  panel.dataset.adminShell = '1';
  initAdminNavChrome();
}

export function setAdminNavSubActive(key) {
  document.querySelectorAll('.admin-nav-sub-link').forEach((link) => {
    link.classList.toggle('admin-nav-sub-link--active', link.dataset.adminSub === key);
  });
}

/**
 * Resolve the effective role set for nav filtering. Accepts either:
 *   - opts.roles: ['admin','trainer','tech_support','support','executive'] (preferred)
 *   - legacy opts.role: 'admin' | 'faculty' (expands to a reasonable set)
 * Falls back to window.__ROLES__ if set by checkAdminOrFaculty.
 */
function resolveRoleSet(opts) {
  if (Array.isArray(opts.roles) && opts.roles.length) return new Set(opts.roles);
  // Prefer the navRoles set stashed by checkAdminOrFaculty — it's the union
  // of staff + college roles the current user holds, which is what the
  // allowlist filter needs.
  const fromWindow = window.__ROLES__;
  if (fromWindow?.navRoles instanceof Set && fromWindow.navRoles.size > 0) {
    return new Set(fromWindow.navRoles);
  }
  if (opts.role === 'admin') return new Set(['admin','trainer']);
  if (opts.role === 'faculty') return new Set(['support']);
  return new Set(['admin','trainer']);
}

export function renderAdminNav(active, opts = {}) {
  const { subnav = null } = opts;
  const role = typeof opts.role === 'string' ? opts.role : null;
  const roles = resolveRoleSet(opts);
  const alsoFaculty =
    typeof opts.alsoFaculty === 'boolean'
      ? opts.alsoFaculty
      : Array.isArray(window.facultyCohortIds) && window.facultyCohortIds.length > 0;
  const pages = ADMIN_PAGES.filter((p) => {
    const allowed = p.allowedRoles || (p.adminOnly ? ['admin'] : ['admin','trainer']);
    return allowed.some((r) => roles.has(r));
  });

  const byGroup = {};
  pages.forEach((p) => {
    const g = p.group || 'cohort';
    if (!byGroup[g]) byGroup[g] = [];
    byGroup[g].push(p);
  });

  const groupOrder = ['cohort', 'classwork', 'people', 'work', 'insights'];
  const navBlocks = groupOrder
    .filter((g) => byGroup[g]?.length)
    .map((g) => {
      const hasActive = byGroup[g].some((p) => p.href === active);
      const links = byGroup[g]
        .map((p) => {
          const isActive = p.href === active;
          const ic = iconHtml(p.icon || 'file');
          return `<a href="${p.href}" class="admin-nav-link${isActive ? ' admin-nav-link--active' : ''}"><span class="admin-nav-link__ic">${ic}</span><span class="admin-nav-link__txt">${p.label}</span></a>`;
        })
        .join('');
      const openAttr = hasActive ? ' open' : '';
      return `<details class="admin-nav-group"${openAttr}>
        <summary class="admin-nav-group__label"><span>${GROUP_LABEL[g] || g}</span></summary>
        <div class="admin-nav-group__links">${links}</div>
      </details>`;
    })
    .join('');

  const subnavHtml =
    subnav && Array.isArray(subnav.links) && subnav.links.length
      ? `<div class="admin-nav-sub" role="navigation" aria-label="${subnav.ariaLabel || 'Page sections'}">
          <div class="admin-nav-sub__label">${subnav.label || 'On this page'}</div>
          <div class="admin-nav-sub__links">
            ${subnav.links
              .map(
                ({ href, label, key }) =>
                  `<a href="${href}" class="admin-nav-sub-link" data-admin-sub="${key || ''}">${label}</a>`,
              )
              .join('')}
          </div>
        </div>`
      : '';

  const badge = role === 'faculty' ? `<span class="admin-nav-badge">Faculty</span>` : '';
  const switcher =
    role === 'admin' && alsoFaculty
      ? `<a href="faculty.html" class="admin-nav-switch">Faculty view →</a>`
      : '';

  return `<aside class="admin-nav-aside" id="adminShellAside" aria-label="Admin navigation">
    <div class="admin-nav-aside__head">
      <span class="admin-nav-aside__title">Menu</span>
      <button type="button" class="admin-nav-drawer-close" aria-label="Close navigation">×</button>
    </div>
    <div class="admin-nav-aside__scroll">
      ${navBlocks}
      ${subnavHtml}
      <div class="admin-nav-footer">${badge}${switcher}</div>
    </div>
  </aside>`;
}
