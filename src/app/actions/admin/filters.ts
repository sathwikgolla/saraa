"use server";

import { ADMIN_MESSAGES, type AdminActionResult } from "@/lib/adminActionResult";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { saveFilter, deleteFilter } from "@/lib/supabase/admin";
import type { CategoryFilter } from "@/lib/adminTypes";

export async function adminSaveFilter(
  filter: Partial<CategoryFilter>
): Promise<AdminActionResult<CategoryFilter>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  const saved = await saveFilter(filter);
  if (!saved) {
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
  return { success: true, data: saved };
}

export async function adminDeleteFilter(id: string): Promise<AdminActionResult<undefined>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  const ok = await deleteFilter(id);
  if (!ok) {
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
  return { success: true, data: undefined };
}
