"use server";

import { requireCapability } from "@/lib/auth/requireCapability";
import {
  getStudentDrawerSummary,
  type StudentDrawerSummary,
} from "@/lib/queries/faculty-student";
import { actionFail, actionOk, type ActionResult } from "./_helpers";

export async function fetchStudentDrawer(
  userId: string,
  cohortId: string,
): Promise<ActionResult<StudentDrawerSummary>> {
  if (!/^[0-9a-f-]{36}$/i.test(userId) || !/^[0-9a-f-]{36}$/i.test(cohortId)) {
    return actionFail("Invalid input");
  }
  await requireCapability("roster.read", cohortId);
  const data = await getStudentDrawerSummary(userId, cohortId);
  if (!data) return actionFail("Student not found");
  return actionOk(data);
}
