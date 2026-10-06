import "server-only";

import { ADMIN_MESSAGES } from "@/lib/adminActionResult";
import { adminSupabase } from "./admin";
import { createClient } from "./server";

/**
 * Server-side authentication helpers.
 *
 * Authentication uses the normal Supabase SSR session (anon key + the caller's
 * cookies), read through the single shared server client in `./server`.
 * Authorization — "is this user an admin?" — is resolved independently from
 * the `profiles` table through the service-role client. The client is never
 * trusted to declare its own role.
 */

export async function getAuthenticatedUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export interface AdminAuthResult {
  success: boolean;
  /** HTTP-equivalent status: 401 unauthenticated, 403 not an admin. */
  status?: number;
  error?: string;
  userId?: string;
}

/**
 * Determine whether the current session belongs to an admin.
 *
 * Returns 401 (not authenticated) or 403 (authenticated but not an admin) with
 * messages that never reveal database details.
 */
export async function verifyAdminRole(): Promise<AdminAuthResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false, status: 401, error: ADMIN_MESSAGES.unauthorized };
  }

  const { data: profile, error } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // A missing profile or a lookup error is treated as "not authorized" so we
  // never leak internal database state to the caller.
  if (error || !profile || profile.role !== "admin") {
    return { success: false, status: 403, error: ADMIN_MESSAGES.forbidden };
  }

  return { success: true, userId: user.id };
}
