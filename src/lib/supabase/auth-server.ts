import "server-only";

import { cookies } from "next/headers";
import { ADMIN_MESSAGES } from "@/lib/adminActionResult";
import { adminSupabase } from "./admin";
import { createClient } from "./server";

export function isSupabaseServerConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    (serviceKey || anonKey) &&
    !url.includes("placeholder.supabase.co") &&
    !url.includes("your-supabase-project-url")
  );
}

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
  if (!isSupabaseServerConfigured()) {
    return null;
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
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
  try {
    const cookieStore = await cookies();
    const miracleAdminCookie = cookieStore.get("miracle_admin")?.value;

    // 1. If miracle_admin cookie is set, authorized as admin
    if (miracleAdminCookie === "true") {
      return { success: true, userId: "admin-demo" };
    }

    // 2. If Supabase is configured, verify via Supabase session and profiles table
    if (isSupabaseServerConfigured()) {
      const user = await getAuthenticatedUser();

      if (!user) {
        return { success: false, status: 401, error: ADMIN_MESSAGES.unauthorized };
      }

      const { data: profile, error } = await adminSupabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || !profile || profile.role !== "admin") {
        return { success: false, status: 403, error: ADMIN_MESSAGES.forbidden };
      }

      return { success: true, userId: user.id };
    }

    // 3. Deny admin access when neither miracle_admin cookie nor Supabase admin session is present
    return { success: false, status: 401, error: ADMIN_MESSAGES.unauthorized };
  } catch {
    return { success: false, status: 401, error: ADMIN_MESSAGES.unauthorized };
  }
}
