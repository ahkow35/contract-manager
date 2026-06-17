// Verifies admin-initiated password reset end-to-end against a running server.
// login as admin → create throwaway user → admin-reset its password → confirm new password logs in → delete.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:3960';
const ADMIN_EMAIL = 'nyan@withkinna.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TEST_EMAIL = 'e2e-reset-deleteme@example.com';

// read Supabase url + anon key from .env.local
const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, 'm')) || [])[1]?.trim();
const SUPA_URL = get('NEXT_PUBLIC_SUPABASE_URL');
const ANON = get('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const log = (s) => console.log(s);
let ok = true;
const browser = await chromium.launch();
const page = await browser.newPage();

try {
  // login
  await page.goto(`${BASE}/login`);
  await page.fill('input[type=email]', ADMIN_EMAIL);
  await page.fill('input[type=password]', ADMIN_PASSWORD);
  await page.click('button[type=submit]');
  await page.waitForURL(`${BASE}/`, { timeout: 15000 });
  log('PASS  admin login');

  // create throwaway user (page.request carries auth cookies)
  let r = await page.request.post(`${BASE}/api/admin/users`, { data: { email: TEST_EMAIL, role: 'staff' } });
  let j = await r.json();
  const id = j.user?.id;
  if (!r.ok() || !id) throw new Error('create failed: ' + JSON.stringify(j));
  log(`PASS  created test user (${id.slice(0, 8)}…), initial temp pw len ${j.tempPassword?.length}`);

  // admin-reset its password
  r = await page.request.post(`${BASE}/api/admin/users/${id}/reset-password`);
  j = await r.json();
  const newPw = j.tempPassword;
  if (!r.ok() || !newPw) throw new Error('reset failed: ' + JSON.stringify(j));
  log(`PASS  admin reset returned new temp pw (len ${newPw.length})`);

  // confirm the NEW password actually logs in (Supabase token endpoint)
  const tok = await page.request.post(`${SUPA_URL}/auth/v1/token?grant_type=password`, {
    headers: { apikey: ANON, 'content-type': 'application/json' },
    data: { email: TEST_EMAIL, password: newPw },
  });
  const tj = await tok.json();
  if (tok.ok() && tj.access_token) log('PASS  new password logs in (token issued)');
  else { ok = false; log('FAIL  new password did NOT log in: ' + JSON.stringify(tj).slice(0, 200)); }

  // cleanup
  r = await page.request.delete(`${BASE}/api/admin/users/${id}`);
  log(r.ok() ? 'PASS  cleanup: test user deleted' : 'WARN  cleanup delete failed');
} catch (e) {
  ok = false;
  log('FAIL  ' + (e?.message || e));
} finally {
  await browser.close();
}
console.log(ok ? 'RESULT: PASS' : 'RESULT: FAIL');
process.exit(ok ? 0 : 1);
