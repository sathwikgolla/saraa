import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser (client-side) Supabase client.
 *
 * Uses `@supabase/ssr`'s cookie-based browser client, so the auth session it
 * writes is the SAME session the server reads through `createServerClient`
 * (see `server.ts`, used by Server Actions / route handlers). Using
 * `@supabase/supabase-js`'s localStorage client here would leave the server
 * seeing an anonymous user and would break checkout / admin authorization.
 *
 * NOTE: this module is also evaluated during the server pre-render pass of
 * Client Components. `createBrowserClient` is safe there for public reads (it
 * simply has no session cookies); auth writes only ever happen in the browser.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly instead of handing out a null client (which would surface as
  // "Cannot read properties of null (reading 'from')" much later).
  throw new Error(
    'Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local at the Next.js project root, then restart the dev server.'
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
