import "server-only";

import { ADMIN_MESSAGES, type AdminActionFailure } from "@/lib/adminActionResult";
import { verifyAdminRole } from "./auth-server";

export type AdminGuard =
  | { ok: true; userId: string }
  | { ok: false; failure: AdminActionFailure };

/**
 * Server-side authorization gate for privileged admin operations.
 *
 * The server independently determines who the caller is (from their session
 * cookie) and whether that user is an admin (from the `profiles` table). It
 * never trusts a role sent in the request body or a `user.role` value from the
 * client — those values are not the security boundary.
 */
export async function requireAdmin(): Promise<AdminGuard> {
  const auth = await verifyAdminRole();

  if (!auth.success) {
    return {
      ok: false,
      failure: {
        success: false,
        status: auth.status ?? 403,
        error: auth.error ?? ADMIN_MESSAGES.forbidden,
      },
    };
  }

  return { ok: true, userId: auth.userId ?? "" };
}
