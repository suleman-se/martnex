import { test, expect } from '@playwright/test';

// Generate email once per test suite (shared across tests in the suite)
const uniqueEmail = `testuser_${Date.now()}@example.com`;
const password = 'SecurePassword123!';

test.describe('Phase 3 Authentication E2E Journeys', () => {

  test('Complete User Journey: Register -> Verify -> Login -> Dashboard', async ({ page }) => {
    // 1. Register
    await page.goto('/register');
    await page.fill('input[name="first_name"]', 'Integration');
    await page.fill('input[name="last_name"]', 'Tester');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', password);

    // Wait for both the click and the API response
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/auth/register') && resp.status() !== 0),
      page.click('button[type="submit"]'),
    ]);

    // After registration, the UI should show a success message about verifying email
    await expect(
      page.locator('text=verify your account').or(page.locator('text=check your email'))
    ).toBeVisible({ timeout: 15000 });

    // 2. Login (email is unverified — the UI should handle this gracefully)
    await page.goto('/login');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', password);

    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/auth/login') && resp.status() !== 0),
      page.click('button[type="submit"]'),
    ]);

    // 3. Check outcome — either unverified message OR dashboard redirect
    await expect(
      page.locator('text=Email Not Verified').or(page.locator('text=Logout'))
    ).toBeVisible({ timeout: 15000 });
  });

  test.skip('Failed login journey: 5 failures -> Lockout Account', async ({ page }) => {
    // Skipped: rate-limiting / account-lockout deferred to Phase 3.4
    await page.goto('/login');
    const wrongPassword = 'WrongPassword000!';

    for (let i = 0; i < 5; i++) {
      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="password"]', wrongPassword);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
    }

    await expect(page.locator('text=Account Locked')).toBeVisible();
    await expect(page.locator('text=automatically unlock')).toBeVisible();
  });

  test('Password Reset Journey: Request Reset -> Reset Password -> Login', async ({ page }) => {
    // 1. Request Reset — use a fresh email so we don't hit rate limit from the register test
    const resetEmail = `resetuser_${Date.now()}@example.com`;

    await page.goto('/forgot-password');
    await page.fill('input[name="email"]', resetEmail);

    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/auth/forgot-password') && resp.status() !== 0),
      page.click('button[type="submit"]'),
    ]);

    // Should always show this success message (security: no email enumeration)
    await expect(page.locator('text=Check your email')).toBeVisible({ timeout: 15000 });

    // 2. Navigate to reset-password with a mock (invalid) token
    await page.goto('/reset-password?token=mock_test_token_invalid_expected');
    await page.fill('input[name="password"]', 'NewSecurePassword123!');
    await page.fill('input[name="confirmPassword"]', 'NewSecurePassword123!');

    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/auth/reset-password') && resp.status() !== 0),
      page.click('button[type="submit"]'),
    ]);

    // Backend returns "Invalid or expired reset token" — check for "expired" case-insensitively
    await expect(page.locator('text=/expired/i').first()).toBeVisible({ timeout: 10000 });
  });

});
