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
