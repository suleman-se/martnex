import { test, expect } from '@playwright/test';
import { getEmailVerificationToken } from './utils/db';

const uniqueEmail = `seller_${Date.now()}@example.com`;
const password = 'SecurePassword123!';

test.describe('Seller Product Management E2E', () => {
  // Increase timeout for the whole suite due to Next.js dev compilation
  test.setTimeout(120000);

  test('Seller can manage products: Create -> List -> Edit -> Delete', async ({ page }) => {
    // 1. Register
    // Go to home first to ensure server is ready, then click to register
    await page.goto('/');
    await page.click('text=Initialize Account');
    
    // Wait for form to be visible
    await page.waitForSelector('input[name="first_name"]', { timeout: 30000 });
    
    await page.fill('input[name="first_name"]', 'Seller');
    await page.fill('input[name="last_name"]', 'User');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for redirect to login or notification
    await page.waitForURL(/\/login/, { timeout: 15000 });
    
    // 2. Verify Email (Required by the platform)
    await page.waitForTimeout(2000); // Wait for DB sync
    const token = await getEmailVerificationToken(uniqueEmail);
    expect(token).not.toBeNull();
    await page.goto(`/verify-email?token=${token}`);
    await expect(page.getByRole('heading', { name: /Verified/i })).toBeVisible({ timeout: 15000 });

    // 3. Login
    await page.goto('/login');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    
    // Wait for Dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // 4. Become a Seller via direct API call
    const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));
    
    const response = await page.request.post('http://localhost:9001/store/sellers', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        business_name: 'My Premium Store',
        business_email: uniqueEmail,
        payout_method: 'bank_transfer'
      }
    });
    
    expect(response.ok()).toBeTruthy();

    // 5. Go to Products Page
    await page.goto('/seller/products');
    await page.reload(); // Ensure fresh state with seller role
    
    // Wait for empty state
    await expect(page.locator('text=No products yet')).toBeVisible({ timeout: 15000 });

    // 6. Create Product
    await page.click('text=Add New Product');
    await page.fill('input[id="title"]', 'Test Product');
    await page.fill('textarea[id="description"]', 'This is a test product description.');
    
    // Add an option and variant
    await page.click('text=Add Option');
    await page.fill('input[placeholder="e.g. Size, Color"]', 'Size');
    await page.fill('input[placeholder="Add value + Enter"]', 'Large');
    await page.keyboard.press('Enter');
    
    // Set price in variant matrix
    const priceInput = page.locator('input[type="number"]').first();
    await priceInput.fill('99');
    
    await page.click('button:has-text("Save Product")');

    // 7. Verify in list
    await page.waitForURL(/\/seller\/products/, { timeout: 15000 });
    await expect(page.locator('text=Test Product')).toBeVisible();
    await expect(page.locator('text=$99.00')).toBeVisible();

    // 8. Edit Product
    await page.click('button[title="Edit"]');
    await page.fill('input[id="title"]', 'Updated Test Product');
    await page.click('button:has-text("Update Product")');

    // 9. Verify update
    await page.waitForURL(/\/seller\/products/);
    await expect(page.locator('text=Updated Test Product')).toBeVisible();

    // 10. Delete Product
    page.on('dialog', dialog => dialog.accept());
    await page.click('button[title="Delete"]');
    
    // Verify deletion
    await expect(page.locator('text=No products yet')).toBeVisible({ timeout: 10000 });
  });

});
