import { redirect } from "next/navigation";
import { verifyAdminRole } from "@/lib/supabase/auth-server";
import { AdminShell } from "@/components/admin/AdminShell";

/**
 * Server-side authorization gate for the entire /admin area.
 *
 * Every admin route is rendered only after the server confirms — from the SSR
 * cookie session and the `profiles.role` column — that the visitor is an admin.
 * Hiding sidebar links in the browser is NOT the security boundary; this gate
 * (together with `requireAdmin()` on every admin server action) is.
 */
export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const auth = await verifyAdminRole();

  if (!auth.success) {
    if (auth.status === 401) {
      // Not signed in: send to login and return here afterwards.
      redirect("/login?next=%2Fadmin");
    }
    // Signed in but not an admin: send them back to the customer storefront.
    redirect("/");
  }

  return <AdminShell>{children}</AdminShell>;
}
