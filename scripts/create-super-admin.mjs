/**
 * Create (or repair) the dedicated Super Admin account.
 *
 * SECURITY
 * --------
 *  * Runs only on the server, with the service-role key — never in the browser.
 *  * The key is read from the environment (.env.local) and is never logged.
 *  * The password is generated at runtime and printed ONCE to stdout. It is not
 *    written to any file, not hardcoded, and not committed.
 *
 * Idempotent: if the account already exists it is located and its password is
 * reset to the newly generated one and its profile role is confirmed as admin.
 *
 * Usage:
 *   node --env-file=.env.local scripts/create-super-admin.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@saraa.com').trim();
const name = 'Super Admin';

if (!url || !serviceKey) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Run with `node --env-file=.env.local`.'
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** Strong ~24-char password with mixed classes (no ambiguous characters). */
function generatePassword() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const specials = '!@#$%^&*-_';
  const b = randomBytes(24);
  let out = '';
  for (let i = 0; i < 18; i += 1) out += letters[b[i] % letters.length];
  out += digits[b[18] % digits.length];
  out += specials[b[19] % specials.length];
  out += letters[b[20] % letters.length];
  out += specials[b[21] % specials.length];
  out += digits[b[22] % digits.length];
  out += letters[b[23] % letters.length];
  return out;
}

const password = generatePassword();
let userId;
let created = false;

const { data: createdUser, error: createErr } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { name },
});

if (!createErr && createdUser?.user) {
  userId = createdUser.user.id;
  created = true;
} else {
  // Likely already registered — find the existing account and repair it rather
  // than creating a duplicate.
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) {
    console.error('Could not look up existing users:', listErr.message);
    process.exit(1);
  }
  const existing = list.users.find(
    (u) => (u.email || '').toLowerCase() === email.toLowerCase()
  );
  if (!existing) {
    console.error('Failed to create user:', createErr?.message || 'unknown error');
    process.exit(1);
  }
  userId = existing.id;
  const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
  });
  if (updErr) {
    console.error('Failed to update existing user:', updErr.message);
    process.exit(1);
  }
}

// The DB trigger creates a 'customer' profile on signup; elevate it to admin.
// The service-role client bypasses RLS, and only this account gets this role.
const { error: profileErr } = await admin
  .from('profiles')
  .upsert({ id: userId, name, email, role: 'admin', status: 'active' }, { onConflict: 'id' });

if (profileErr) {
  console.error('Failed to set admin profile:', profileErr.message);
  process.exit(1);
}

console.log('====================================================');
console.log('SUPER ADMIN READY');
console.log('====================================================');
console.log(`Email:    ${email}`);
console.log(`Password: ${password}`);
console.log(`Role:     admin`);
console.log(`User id:  ${userId}`);
console.log(created ? 'Status:   created new account' : 'Status:   existed — password reset + role confirmed');
console.log('====================================================');
console.log('Store this password now; it will not be shown again.');
