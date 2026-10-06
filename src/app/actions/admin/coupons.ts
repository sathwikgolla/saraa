"use server";

import { ADMIN_MESSAGES, type AdminActionResult } from "@/lib/adminActionResult";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { createCoupon, updateCoupon, deleteCoupon } from "@/lib/supabase/admin";
import type { AdminCoupon } from "@/lib/adminTypes";

export async function adminCreateCoupon(
  coupon: Omit<AdminCoupon, "id" | "usedCount" | "createdAt" | "updatedAt">
): Promise<AdminActionResult<AdminCoupon>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  const created = await createCoupon(coupon);
  if (!created) {
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
  return { success: true, data: created };
}

export async function adminUpdateCoupon(
  id: string,
  coupon: Partial<AdminCoupon>
): Promise<AdminActionResult<undefined>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  const ok = await updateCoupon(id, coupon);
  if (!ok) {
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
  return { success: true, data: undefined };
}

export async function adminDeleteCoupon(id: string): Promise<AdminActionResult<undefined>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  const ok = await deleteCoupon(id);
  if (!ok) {
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
  return { success: true, data: undefined };
}
