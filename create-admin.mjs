// Bootstrap an admin account without going through the /register form.
// Reads config from frontend/.env (URL) + root .env (service-role key + admin details).
//
// Usage:
//   1. Put SUPABASE_SERVICE_ROLE_KEY in a root .env file (DO NOT COMMIT).
//      Get it from Supabase Dashboard -> Settings -> API -> service_role (secret).
//   2. (Optional) Override admin details via env vars below.
//   3. Run: node create-admin.mjs
//
// The script:
//   - creates an auth.users row via the admin API (no email confirmation needed)
//   - the handle_new_user trigger creates a profiles row
//   - then we set role = 'admin' on that profile
// If the email already exists, we just promote the existing profile to admin.

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile(path) {
    if (!existsSync(path)) return {};
    const out = {};
    for (const raw of readFileSync(path, 'utf8').split('\n')) {
        const line = raw.trim();
        if (!line || line.startsWith('#')) continue;
        const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
        if (!m) continue;
        out[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
    return out;
}

const env = {
    ...loadEnvFile(join(__dirname, 'frontend', '.env')),
    ...loadEnvFile(join(__dirname, '.env')),
    ...process.env,
};

const SUPABASE_URL  = env.VITE_SUPABASE_URL;
const SERVICE_KEY   = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌  Missing required env vars.');
    console.error('   Need: VITE_SUPABASE_URL (already in frontend/.env)');
    console.error('   Need: SUPABASE_SERVICE_ROLE_KEY (add to root .env)');
    console.error('');
    console.error('   Get the service-role key from:');
    console.error('   Supabase Dashboard -> Project Settings -> API -> service_role (secret).');
    process.exit(1);
}

const ADMIN_EMAIL    = env.ADMIN_EMAIL    || 'admin@cityag.local';
const ADMIN_PASSWORD = env.ADMIN_PASSWORD || 'ChangeMe!2026';
const ADMIN_FIRST    = env.ADMIN_FIRST_NAME || 'CityAG';
const ADMIN_LAST     = env.ADMIN_LAST_NAME  || 'Admin';
const ADMIN_MINISTRY = env.ADMIN_MINISTRY   || 'Administration';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});

console.log(`Bootstrapping admin: ${ADMIN_EMAIL}`);

let userId;
const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email:          ADMIN_EMAIL,
    password:       ADMIN_PASSWORD,
    email_confirm:  true,
    user_metadata: {
        first_name: ADMIN_FIRST,
        last_name:  ADMIN_LAST,
        ministry:   ADMIN_MINISTRY,
    },
});

if (createErr) {
    const msg = createErr.message || String(createErr);
    if (/already (been )?registered|already exists/i.test(msg)) {
        console.log(`ℹ️   ${ADMIN_EMAIL} already exists — promoting existing profile to admin.`);
        const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
        if (listErr) { console.error('❌  Could not look up existing user:', listErr.message); process.exit(1); }
        const existing = list.users.find(u => u.email === ADMIN_EMAIL);
        if (!existing) { console.error('❌  Lookup succeeded but user not found.'); process.exit(1); }
        userId = existing.id;
    } else {
        console.error('❌  Could not create user:', msg);
        process.exit(1);
    }
} else {
    userId = created.user.id;
    console.log(`✓  Auth user created (id: ${userId})`);
}

// Promote to admin. The handle_new_user trigger should already have created
// the profile row; we just flip the role.
const { error: roleErr } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId);

if (roleErr) {
    console.error('❌  User exists but failed to set admin role:', roleErr.message);
    console.error('   Run this SQL manually in Supabase SQL Editor:');
    console.error(`   UPDATE public.profiles SET role = 'admin' WHERE id = '${userId}';`);
    process.exit(1);
}

console.log(`✓  Promoted to admin`);
console.log('');
console.log('Done. Log in at /login with:');
console.log(`   Email:    ${ADMIN_EMAIL}`);
console.log(`   Password: ${ADMIN_PASSWORD}`);
console.log('');
console.log('Change the password from Settings after first login.');
