// Shared admin/faculty auth helper.
// Exposes checkAdminOrFaculty(user, supabase) -> { isAdmin, isFaculty, facultyCohortIds }
// and scopeCohortsQuery(query, state) to restrict cohorts for faculty.

import { supabase } from './supabase.js';

export async function checkAdminOrFaculty(user) {
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  const { data: facRows } = await supabase.from('cohort_faculty').select('cohort_id').eq('user_id', user.id);
  const isAdmin = !!profile?.is_admin;
  const facultyCohortIds = (facRows || []).map(r => r.cohort_id);
  const isFaculty = facultyCohortIds.length > 0;
  window.isAdmin = isAdmin;
  window.facultyCohortIds = facultyCohortIds;
  return { isAdmin, isFaculty, facultyCohortIds };
}

export function applyFacultyBrandLabel(isAdmin, isFaculty) {
  if (!isAdmin && isFaculty) {
    const brand = document.querySelector('.brand');
    if (brand && brand.lastChild) brand.lastChild.textContent = ' Gnanalytica · Faculty';
  }
}

// Returns the "no cohort" HTML message.
export const NO_COHORT_MSG = `<div style="padding:40px;text-align:center;color:var(--muted)">You're not assigned to any cohort yet — ask an admin.</div>`;

// Renders a small view-switcher pill for users who are BOTH admin and faculty.
// currentView is 'admin' (on any admin-*.html page) or 'faculty' (on faculty.html).
// Returns '' for users who only have one role.
export function renderViewSwitcher(isAdmin, isFaculty, currentView) {
  if (!(isAdmin && isFaculty)) return '';
  const target = currentView === 'admin' ? 'faculty.html' : 'admin-home.html';
  const label = currentView === 'admin' ? 'Faculty view →' : 'Admin view →';
  return `<a href="${target}" class="view-switch" style="padding:6px 12px;border-radius:999px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;background:rgba(120,170,255,.12);color:#7aa7ff;border:1px solid rgba(120,170,255,.3);text-decoration:none;font-weight:600">${label}</a>`;
}

// Post-sign-in router: send faculty-only users to faculty.html.
// Admins and students are left alone so existing flows (admin index, dashboard)
// keep their current behavior. Returns true if a redirect was initiated.
export async function routeAfterSignIn(user) {
  if (!user) return false;
  try {
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
    if (profile?.is_admin) return false;
    const { data: fac } = await supabase.from('cohort_faculty').select('cohort_id').eq('user_id', user.id).limit(1);
    if (fac && fac.length) {
      // Avoid redirect loop if we're already on faculty.html.
      if (!/faculty\.html(\?|#|$)/.test(window.location.pathname + window.location.search + window.location.hash)) {
        window.location.href = 'faculty.html';
        return true;
      }
    }
  } catch (_) { /* non-critical */ }
  return false;
}
