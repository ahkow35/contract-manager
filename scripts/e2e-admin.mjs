/**
 * e2e-admin.mjs — End-to-end verification of admin + auth features.
 *
 * Run: node scripts/e2e-admin.mjs
 *
 * Prerequisites:
 *   - App already running on PORT (default 3955): npx next start -p 3955
 *   - ADMIN_EMAIL / ADMIN_PASSWORD env or hard-coded below
 *   - node_modules contains playwright
 */

import { chromium } from 'playwright';

const PORT = process.env.PORT || 3955;
const BASE = `http://localhost:${PORT}`;
const ADMIN_EMAIL = 'nyan@withkinna.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // Must be passed via env

if (!ADMIN_PASSWORD) {
  console.error('ERROR: ADMIN_PASSWORD env var is required');
  process.exit(1);
}

// ── helpers ─────────────────────────────────────────────────────────────────

function pass(step, detail = '') {
  console.log(`  PASS  ${step}${detail ? ' — ' + detail : ''}`);
}
function fail(step, detail = '') {
  console.log(`  FAIL  ${step}${detail ? ' — ' + detail : ''}`);
}
function info(msg) {
  console.log(`  INFO  ${msg}`);
}

// ── Step 1: Unauthenticated GET /api/admin/users ─────────────────────────────
async function step1_apiAuthGuard() {
  const label = 'Step 1: Unauth GET /api/admin/users → 403';
  try {
    const res = await fetch(`${BASE}/api/admin/users`);
    if (res.status === 403 || res.status === 401) {
      pass(label, `HTTP ${res.status}`);
      return true;
    } else {
      fail(label, `HTTP ${res.status} (expected 403 or 401)`);
      return false;
    }
  } catch (e) {
    fail(label, String(e));
    return false;
  }
}

// ── Step 2: Unauthenticated GET / → redirect to /login ───────────────────────
async function step2_rootRedirect() {
  const label = 'Step 2: Unauth GET / → 307 redirect to /login';
  try {
    const res = await fetch(BASE, { redirect: 'manual' });
    const loc = res.headers.get('location') || '';
    if ((res.status === 307 || res.status === 302 || res.status === 308) && loc.includes('/login')) {
      pass(label, `HTTP ${res.status} → ${loc}`);
      return true;
    } else {
      fail(label, `HTTP ${res.status}, Location: ${loc || '(none)'}`);
      return false;
    }
  } catch (e) {
    fail(label, String(e));
    return false;
  }
}

// ── Steps 3-7: Browser-based tests ───────────────────────────────────────────
async function browserTests() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  let createdUserId = null;
  let createdUserEmail = null;

  try {
    // Step 3: Login
    {
      const label = 'Step 3: Login with admin credentials';
      await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
      const title = await page.title();
      info(`Login page title: "${title}"`);

      // Fill email
      const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
      await emailInput.fill(ADMIN_EMAIL);

      // Fill password
      const pwdInput = page.locator('input[type="password"]').first();
      await pwdInput.fill(ADMIN_PASSWORD);

      // Submit
      const submitBtn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login"), button:has-text("Log in")').first();
      await submitBtn.click();

      // Wait for navigation away from /login
      try {
        await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 10000 });
        const finalUrl = page.url();
        if (!finalUrl.includes('/login')) {
          pass(label, `Landed on ${finalUrl}`);
        } else {
          // Check for error message
          const bodyText = await page.innerText('body');
          fail(label, `Still on ${finalUrl}. Page text snippet: ${bodyText.slice(0, 200)}`);
          await page.screenshot({ path: '/tmp/step3-login-fail.png' });
          return;
        }
      } catch {
        const finalUrl = page.url();
        fail(label, `Timeout or error. Final URL: ${finalUrl}`);
        await page.screenshot({ path: '/tmp/step3-login-fail.png' });
        return;
      }
    }

    // Step 4: Navigate to /admin
    {
      const label = 'Step 4: GET /admin loads (not redirected, shows "Admin")';
      await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
      const finalUrl = page.url();
      const bodyText = await page.innerText('body');
      if (!finalUrl.includes('/login') && (bodyText.toLowerCase().includes('admin') || bodyText.toLowerCase().includes('dashboard'))) {
        pass(label, `URL: ${finalUrl}, body contains expected content`);
      } else if (finalUrl.includes('/login')) {
        fail(label, `Redirected to login — admin gate may be rejecting user`);
        await page.screenshot({ path: '/tmp/step4-admin-fail.png' });
      } else {
        fail(label, `URL: ${finalUrl}, body snippet: ${bodyText.slice(0, 300)}`);
        await page.screenshot({ path: '/tmp/step4-admin-fail.png' });
      }
    }

    // Step 5: Navigate to /admin/users — table lists nyan@withkinna.com with role admin
    {
      const label = 'Step 5: /admin/users lists nyan@withkinna.com as admin';
      await page.goto(`${BASE}/admin/users`, { waitUntil: 'networkidle' });
      const finalUrl = page.url();
      const bodyText = await page.innerText('body');
      const hasEmail = bodyText.includes(ADMIN_EMAIL);
      const hasAdmin = bodyText.toLowerCase().includes('admin');
      if (!finalUrl.includes('/login') && hasEmail && hasAdmin) {
        pass(label, `Found email and "admin" role on page`);
      } else {
        const detail = `URL: ${finalUrl}, hasEmail=${hasEmail}, hasAdmin=${hasAdmin}`;
        fail(label, detail);
        await page.screenshot({ path: '/tmp/step5-users-fail.png' });
      }
    }

    // Step 6: Navigate to /admin/usage
    {
      const label = 'Step 6: /admin/usage loads without error';
      consoleErrors.length = 0; // reset
      await page.goto(`${BASE}/admin/usage`, { waitUntil: 'networkidle' });
      const finalUrl = page.url();
      const bodyText = await page.innerText('body');
      const hasError = bodyText.toLowerCase().includes('error') && !bodyText.toLowerCase().includes('usage');
      if (!finalUrl.includes('/login') && !hasError) {
        pass(label, `URL: ${finalUrl}`);
        if (consoleErrors.length > 0) {
          info(`Console errors on /admin/usage: ${consoleErrors.join('; ')}`);
        }
      } else {
        fail(label, `URL: ${finalUrl}, bodySnippet: ${bodyText.slice(0, 200)}`);
        await page.screenshot({ path: '/tmp/step6-usage-fail.png' });
      }
    }

    // Step 7: Add a test user, verify it appears, then remove it
    {
      const label = 'Step 7: Add e2e-test user, verify, remove (cleanup)';
      createdUserEmail = `e2e-test-DELETEME@example.com`;

      // Go to /admin/users
      await page.goto(`${BASE}/admin/users`, { waitUntil: 'networkidle' });

      // Look for "Add User" or similar button/form
      const addBtn = page.locator('button:has-text("Add"), button:has-text("Invite"), button:has-text("New User"), button:has-text("Create")').first();
      const addBtnCount = await addBtn.count();

      if (addBtnCount === 0) {
        // Maybe there's an inline form already visible
        info('No "Add" button found — looking for inline email input');
      } else {
        await addBtn.click();
        await page.waitForTimeout(500);
      }

      // Try to fill email field
      const emailFields = page.locator('input[type="email"], input[placeholder*="email" i]');
      const emailFieldCount = await emailFields.count();
      info(`Found ${emailFieldCount} email input(s) on /admin/users`);

      if (emailFieldCount > 1) {
        // The first is likely the add-user form (second is the login form? shouldn't be here)
        // Find the one that's not filled with admin email
        let targetField = null;
        for (let i = 0; i < emailFieldCount; i++) {
          const val = await emailFields.nth(i).inputValue();
          if (val !== ADMIN_EMAIL) {
            targetField = emailFields.nth(i);
            break;
          }
        }
        if (targetField) {
          await targetField.fill(createdUserEmail);
        } else {
          await emailFields.last().fill(createdUserEmail);
        }
      } else if (emailFieldCount === 1) {
        await emailFields.first().fill(createdUserEmail);
      } else {
        fail(label, 'No email input found on /admin/users — cannot add user');
        await page.screenshot({ path: '/tmp/step7-adduser-fail.png' });
        return;
      }

      // Select "Staff" role if there's a role selector
      const roleSelect = page.locator('select[name*="role" i], select').first();
      const roleSelectCount = await roleSelect.count();
      if (roleSelectCount > 0) {
        const options = await roleSelect.locator('option').allTextContents();
        info(`Role select options: ${options.join(', ')}`);
        if (options.some(o => o.toLowerCase().includes('staff'))) {
          await roleSelect.selectOption({ label: options.find(o => o.toLowerCase().includes('staff')) });
        }
      }

      // Submit the add-user form
      const submitAddBtn = page.locator(
        'button[type="submit"]:not([form]), form button[type="submit"], button:has-text("Add User"), button:has-text("Create User"), button:has-text("Invite")'
      ).first();
      const submitCount = await submitAddBtn.count();
      if (submitCount === 0) {
        fail(label, 'No submit button found for add-user form');
        await page.screenshot({ path: '/tmp/step7-adduser-fail.png' });
        return;
      }
      await submitAddBtn.click();
      await page.waitForTimeout(2000);

      const bodyAfterAdd = await page.innerText('body');
      const hasNewUser = bodyAfterAdd.includes(createdUserEmail);

      if (!hasNewUser) {
        // Check for error or temp password modal
        info(`Body after add (first 400 chars): ${bodyAfterAdd.slice(0, 400)}`);
        await page.screenshot({ path: '/tmp/step7-adduser-after.png' });
      }

      // Dismiss any dialog/modal showing temp password
      const closeModal = page.locator('button:has-text("Close"), button:has-text("Done"), button:has-text("OK"), button:has-text("Dismiss")').first();
      const closeCount = await closeModal.count();
      if (closeCount > 0) {
        info('Closing temp-password modal');
        await closeModal.click();
        await page.waitForTimeout(500);
      }

      // Re-check if user is in list
      const bodyCheck = await page.innerText('body');
      const userInList = bodyCheck.includes(createdUserEmail);

      if (userInList) {
        pass(`${label} — user appears in list`, createdUserEmail);

        // Try to remove/delete the user
        const removeBtn = page.locator(`tr:has-text("${createdUserEmail}") button:has-text("Remove"), tr:has-text("${createdUserEmail}") button:has-text("Delete")`).first();
        const removeBtnCount = await removeBtn.count();

        if (removeBtnCount > 0) {
          await removeBtn.click();
          await page.waitForTimeout(1000);

          // Confirm deletion dialog if present
          const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete"), button:has-text("Remove")').first();
          const confirmCount = await confirmBtn.count();
          if (confirmCount > 0) {
            await confirmBtn.click();
            await page.waitForTimeout(1000);
          }

          const bodyAfterRemove = await page.innerText('body');
          if (!bodyAfterRemove.includes(createdUserEmail)) {
            pass(`${label} — user removed from list successfully`);
            createdUserId = null; // Cleaned up via UI
            createdUserEmail = null;
          } else {
            fail(`${label} — user still visible after removal`);
            info('Will attempt API cleanup');
            await page.screenshot({ path: '/tmp/step7-remove-fail.png' });
          }
        } else {
          fail(`${label} — no Remove button found for test user`);
          info('Will attempt API cleanup');
          await page.screenshot({ path: '/tmp/step7-noremove.png' });
        }
      } else {
        fail(`${label} — new user did NOT appear in list after add`);
        await page.screenshot({ path: '/tmp/step7-adduser-notfound.png' });
      }
    }

  } finally {
    await page.screenshot({ path: '/tmp/final-state.png' });
    await browser.close();
  }

  return { createdUserEmail };
}

// ── API cleanup: delete leftover test user via service-role key ───────────────
async function cleanupTestUser(email) {
  if (!email) return;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = 'https://wxwgvjcqbljrktrfikif.supabase.co';
  if (!serviceKey) {
    info('SUPABASE_SERVICE_ROLE_KEY not set — cannot do API cleanup');
    return;
  }
  info(`Attempting API cleanup: listing users to find ${email}`);
  try {
    const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?per_page=1000`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    if (!listRes.ok) {
      info(`List users failed: HTTP ${listRes.status}`);
      return;
    }
    const listData = await listRes.json();
    const users = listData.users || [];
    const testUser = users.find(u => u.email === email);
    if (!testUser) {
      info(`Test user ${email} not found in Supabase — already cleaned up`);
      return;
    }
    const delRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${testUser.id}`, {
      method: 'DELETE',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    if (delRes.ok || delRes.status === 204) {
      pass(`API cleanup: deleted test user ${email} (id: ${testUser.id})`);
    } else {
      fail(`API cleanup: DELETE returned HTTP ${delRes.status}`);
    }
  } catch (e) {
    fail(`API cleanup error: ${String(e)}`);
  }
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n=== Contract Manager E2E Admin Tests — ${BASE} ===\n`);

  await step1_apiAuthGuard();
  await step2_rootRedirect();

  const result = await browserTests();

  // Cleanup any lingering test user
  if (result?.createdUserEmail) {
    console.log('\n--- Cleanup ---');
    await cleanupTestUser(result.createdUserEmail);
  }

  console.log('\n=== Done ===\n');
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
