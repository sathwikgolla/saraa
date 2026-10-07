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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder_anon_key';

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes('placeholder.supabase.co') &&
    !url.includes('your-supabase-project-url')
  );
}
