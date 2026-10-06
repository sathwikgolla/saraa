"use server";

import { ADMIN_MESSAGES, type AdminActionResult } from "@/lib/adminActionResult";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { addStaff, deleteStaff } from "@/lib/supabase/admin";
import type { StaffMember } from "@/lib/adminTypes";

export async function adminAddStaff(
  member: Omit<StaffMember, "id" | "createdAt" | "updatedAt">
): Promise<AdminActionResult<StaffMember>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  const created = await addStaff(member);
  if (!created) {
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
  return { success: true, data: created };
}

export async function adminDeleteStaff(id: string): Promise<AdminActionResult<undefined>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  const ok = await deleteStaff(id);
  if (!ok) {
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
  return { success: true, data: undefined };
}
