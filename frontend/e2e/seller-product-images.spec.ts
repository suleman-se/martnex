import path from 'path';
import { test, expect } from '@playwright/test';
import { getEmailVerificationToken } from './utils/db';

const uniqueEmail = `seller_images_${Date.now()}@example.com`;
const password = 'SecurePassword123!';
const backendUrl = 'http://localhost:9001';

async function expectOkResponse(response: Awaited<ReturnType<typeof test.info>> extends never ? never : any, label: string) {
  if (response.ok()) {
    return;
  }

  throw new Error(`${label} failed with ${response.status()}: ${await response.text()}`);
}

test.describe('Seller product image lifecycle', () => {
  test.setTimeout(120000);

  test('uploaded images render after reload and can be deleted later', async ({ page }) => {
    const fixturePath = path.resolve(process.cwd(), 'e2e/fixtures/tiny.png');
    const productTitle = `Image Lifecycle Product ${Date.now()}`;

    await page.goto('/');
    await page.click('text=Initialize Account');
    await page.waitForSelector('input[name="first_name"]', { timeout: 30000 });

    await page.fill('input[name="first_name"]', 'Seller');
    await page.fill('input[name="last_name"]', 'Images');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/login/, { timeout: 15000 });

    await page.waitForTimeout(2000);
    const token = await getEmailVerificationToken(uniqueEmail);
    expect(token).not.toBeNull();

    await page.goto(`/verify-email?token=${token}`);
    await expect(page.getByRole('heading', { name: /Verified/i })).toBeVisible({ timeout: 15000 });

    await page.goto('/login');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));
    const publishableKeyResponse = await page.request.get(`${backendUrl}/auth/publishable-key`);
    expect(publishableKeyResponse.ok()).toBeTruthy();
    const publishableKeyData = await publishableKeyResponse.json() as { publishable_key?: string };

    const sellerResponse = await page.request.post(`${backendUrl}/store/sellers`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-publishable-api-key': publishableKeyData.publishable_key || '',
      },
      data: {
        business_name: 'Image Seller Store',
        business_email: uniqueEmail,
        payout_method: 'bank_transfer',
      },
    });

    await expectOkResponse(sellerResponse, 'Seller registration');

    await page.goto('/seller/products');
    await page.reload();
    await expect(page.locator('text=No products yet')).toBeVisible({ timeout: 15000 });

    await page.click('text=Add New Product');
    await page.fill('input[id="title"]', productTitle);
    await page.fill('textarea[id="description"]', 'Product used to validate image upload and delete persistence.');

    const numericInputs = page.locator('input[type="number"]');
    await numericInputs.nth(0).fill('25');
    await numericInputs.nth(1).fill('3');

    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/store/uploads') && response.request().method() === 'POST' && response.ok()),
      page.locator('input[type="file"]').setInputFiles(fixturePath),
    ]);

    const uploadedImage = page.locator('img[alt="Product"]').first();
    await expect(uploadedImage).toBeVisible({ timeout: 15000 });

    const uploadedSrc = await uploadedImage.getAttribute('src');
    expect(uploadedSrc).toContain('/static/');

    const createProductResponsePromise = page.waitForResponse(
      (response) => response.url().endsWith('/store/sellers/me/products') && response.request().method() === 'POST'
    );
    await page.click('button:has-text("Save Product")');
    const createProductResponse = await createProductResponsePromise;
    await expectOkResponse(createProductResponse, 'Product creation');
    await expect(page).toHaveURL(/\/seller\/products$/, { timeout: 15000 });
    await expect(page.locator(`text=${productTitle}`)).toBeVisible({ timeout: 15000 });

    await page.click('button[title="Edit"]');
    await expect(page).toHaveURL(/\/seller\/products\//, { timeout: 15000 });
    await page.reload();

    const persistedImage = page.locator('img[alt="Product"]').first();
    await expect(persistedImage).toBeVisible({ timeout: 15000 });

    const persistedSrc = await persistedImage.getAttribute('src');
    expect(persistedSrc).toContain('/static/');

    const persistedImageResponse = await page.request.get(persistedSrc!);
    expect(persistedImageResponse.ok()).toBeTruthy();

    await page.locator('img[alt="Product"]').first().hover();
    await page.getByLabel('Remove image').click({ force: true });

    await expect(page.locator('img[alt="Product"]')).toHaveCount(0);

    const updateProductResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/store/sellers/me/products/') && response.request().method() === 'POST'
    );
    await page.click('button:has-text("Update Product")');
    const updateProductResponse = await updateProductResponsePromise;
    await expectOkResponse(updateProductResponse, 'Product update');
    await expect(page).toHaveURL(/\/seller\/products$/, { timeout: 15000 });

    const deletedImageResponse = await page.request.get(persistedSrc!);
    expect(deletedImageResponse.ok()).toBeFalsy();

    await page.click('button[title="Edit"]');
    await expect(page.locator('img[alt="Product"]')).toHaveCount(0);
  });
});