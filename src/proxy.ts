import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every navigation.
 *
 * The browser session is cookie-based (`@supabase/ssr`). Access tokens expire,
 * and only the browser client can silently rotate them — so without this a
 * Server Component / Server Action could read an expired session and treat a
 * signed-in user (including the Super Admin) as anonymous. This is the
 * documented Supabase Next.js pattern and is what makes the server-side
 * `/admin` gate and `requireAdmin()` reliably see the real user.
 *
 * It performs NO authorization itself: /admin protection stays in
 * `src/app/admin/layout.tsx` + `requireAdmin()`, both of which re-check
 * `profiles.role` server-side.
 *
 * NOTE: Next.js 16 renamed the `middleware.ts` convention to `proxy.ts`.
 * Both a named `proxy` export and a default export are provided.
 */
export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Never take the whole app down over a missing env var — the pages and
  // client modules already fail loudly at their point of use.
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: this call refreshes the session token when needed. Do not
  // replace it with getSession(), which does not reliably revalidate the token.
  // Fail open: a transient Supabase/network outage must not 500 every route.
  try {
    await supabase.auth.getUser();
  } catch {
    return NextResponse.next({ request });
  }

  return response;
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Run on all routes except Next.js internals and static assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|woff|woff2|ttf)$).*)",
  ],
};
