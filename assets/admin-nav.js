export const ADMIN_PAGES = [
  { href: 'admin.html',          label: 'Registrations' },
  { href: 'admin-schedule.html', label: 'Schedule' },
  { href: 'admin-orgs.html',     label: 'Orgs & codes' },
  { href: 'admin-analytics.html',label: 'Analytics' },
];

export function renderAdminNav(active) {
  const items = ADMIN_PAGES.map(p => {
    const isActive = p.href === active;
    return `<a href="${p.href}" style="padding:8px 14px;border-radius:999px;font-size:13px;${isActive ? 'background:var(--accent);color:#0b0b10;font-weight:600' : 'color:var(--muted);border:1px solid var(--line)'}">${p.label}</a>`;
  }).join('');
  return `<div style="display:flex;gap:8px;flex-wrap:wrap;margin:28px 0 8px">${items}</div>`;
}
