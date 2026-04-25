import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";

export interface AnalyticsSummary {
  totalStudents: number;
  avgDaysComplete: number;
  attendanceRate: number;
  pendingGrading: number;
}

export interface DayAttendanceBucket {
  day_number: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

export interface AtRiskRow {
  user_id: string;
  full_name: string | null;
  email: string;
  days_present: number;
  labs_done: number;
}

export const getAnalyticsSummary = cache(async (cohortId: string): Promise<AnalyticsSummary> => {
  const sb = await getSupabaseServer();
  const [students, labs, attendance, grading] = await Promise.all([
    sb.from("registrations").select("user_id", { count: "exact", head: true }).eq("cohort_id", cohortId).eq("status", "confirmed"),
    sb.from("lab_progress").select("user_id, day_number, status").eq("cohort_id", cohortId).eq("status", "done"),
    sb.from("attendance").select("status").eq("cohort_id", cohortId),
    sb.from("submissions").select("id, assignments!inner(cohort_id)", { count: "exact", head: true }).eq("status", "submitted").eq("assignments.cohort_id", cohortId),
  ]);

  const totalStudents = students.count ?? 0;
  const labRows = (labs.data ?? []) as Array<{ user_id: string; day_number: number }>;
  const completedDayPerStudent = new Map<string, Set<number>>();
  for (const r of labRows) {
    const set = completedDayPerStudent.get(r.user_id) ?? new Set();
    set.add(r.day_number);
    completedDayPerStudent.set(r.user_id, set);
  }
  const totalDaysCompleted = [...completedDayPerStudent.values()].reduce((s, set) => s + set.size, 0);
  const avgDaysComplete = totalStudents > 0 ? totalDaysCompleted / totalStudents : 0;

  const attRows = (attendance.data ?? []) as Array<{ status: string }>;
  const present = attRows.filter((r) => r.status === "present").length;
  const attendanceRate = attRows.length > 0 ? present / attRows.length : 0;

  return {
    totalStudents,
    avgDaysComplete,
    attendanceRate,
    pendingGrading: grading.count ?? 0,
  };
});

export const getAttendanceByDay = cache(async (cohortId: string): Promise<DayAttendanceBucket[]> => {
  const sb = await getSupabaseServer();
  const { data } = await sb
    .from("attendance")
    .select("day_number, status")
    .eq("cohort_id", cohortId);
  const buckets = new Map<number, DayAttendanceBucket>();
  for (const r of (data ?? []) as Array<{ day_number: number; status: keyof Omit<DayAttendanceBucket, "day_number"> }>) {
    if (!buckets.has(r.day_number)) {
      buckets.set(r.day_number, { day_number: r.day_number, present: 0, absent: 0, late: 0, excused: 0 });
    }
    const b = buckets.get(r.day_number)!;
    b[r.status] = (b[r.status] ?? 0) + 1;
  }
  return [...buckets.values()].sort((a, b) => a.day_number - b.day_number);
});

export const getAtRisk = cache(async (cohortId: string, threshold = 3): Promise<AtRiskRow[]> => {
  const sb = await getSupabaseServer();
  const [regs, atts, labs] = await Promise.all([
    sb.from("registrations").select("user_id, profiles!inner(full_name, email)").eq("cohort_id", cohortId).eq("status", "confirmed"),
    sb.from("attendance").select("user_id, status").eq("cohort_id", cohortId),
    sb.from("lab_progress").select("user_id, day_number, status").eq("cohort_id", cohortId).eq("status", "done"),
  ]);
  const present = new Map<string, number>();
  for (const a of (atts.data ?? []) as Array<{ user_id: string; status: string }>) {
    if (a.status === "present") present.set(a.user_id, (present.get(a.user_id) ?? 0) + 1);
  }
  const labsBy = new Map<string, Set<number>>();
  for (const r of (labs.data ?? []) as Array<{ user_id: string; day_number: number }>) {
    const set = labsBy.get(r.user_id) ?? new Set();
    set.add(r.day_number);
    labsBy.set(r.user_id, set);
  }
  const all = ((regs.data ?? []) as unknown as Array<{
    user_id: string;
    profiles: { full_name: string | null; email: string };
  }>).map((r) => ({
    user_id: r.user_id,
    full_name: r.profiles.full_name,
    email: r.profiles.email,
    days_present: present.get(r.user_id) ?? 0,
    labs_done: labsBy.get(r.user_id)?.size ?? 0,
  }));
  return all
    .filter((s) => s.days_present < threshold || s.labs_done < threshold)
    .sort((a, b) => a.days_present + a.labs_done - (b.days_present + b.labs_done));
});
