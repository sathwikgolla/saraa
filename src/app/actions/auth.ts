"use server";

import { getAuthenticatedUser } from "@/lib/supabase/auth-server";
import { adminSupabase } from "@/lib/supabase/admin";

/**
 * Resolve the current caller's role on the SERVER.
 *
 * Used by the login flow to decide whether to send the user to the admin panel
 * or the storefront. Reading `profiles.role` here (through the service-role
 * client, server-only) means the decision does not depend on a client-side RLS
 * read succeeding. This is a routing hint only — it is NOT the authorization
 * boundary. Every privileged operation is independently gated by
 * `requireAdmin()`.
 */
export async function getSessionRole(): Promise<string | null> {
  const user = await getAuthenticatedUser();
  if (!user) return null;

  const { data, error } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !data) return "customer";
  return data.role ?? "customer";
}
