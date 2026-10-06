"use server";

import { ADMIN_MESSAGES, type AdminActionResult } from "@/lib/adminActionResult";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { updateSettings } from "@/lib/supabase/admin";
import type { AdminSettings } from "@/lib/adminTypes";

export async function adminUpdateSettings(
  settings: Partial<AdminSettings>
): Promise<AdminActionResult<undefined>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  const ok = await updateSettings(settings);
  if (!ok) {
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
  return { success: true, data: undefined };
}
