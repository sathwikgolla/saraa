"use server";

import type { AdminActionResult } from "@/lib/adminActionResult";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createAuditLog } from "@/lib/supabase/admin";
import type { AuditLogEntry } from "@/lib/adminTypes";

export async function adminCreateAuditLog(
  log: Omit<AuditLogEntry, "id" | "timestamp">
): Promise<AdminActionResult<undefined>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;
  await createAuditLog(log);
  return { success: true, data: undefined };
}
