import { expect, test } from '@playwright/test';

test('public site renders and legal page is reachable', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  await expect(page.locator('h1').first()).toContainText(/charleroi/i);
  await expect(page.getByRole('button', { name: /^demander un devis$/i })).toBeVisible();

  const legalLink = page.locator('a[href^="/legal/"]').first();
  await expect(legalLink).toBeVisible();
  await legalLink.click();

  await expect(page).toHaveURL(/\/legal\//);
  await expect(page.getByText(/dernière mise à jour/i)).toBeVisible();
});

test('admin login reaches the dashboard', async ({ page }) => {
  await page.goto('/admin/login', { waitUntil: 'networkidle' });

  await expect(page.getByRole('heading', { name: /admin dashboard/i })).toBeVisible();
  await page.getByLabel(/username/i).fill('playwright-admin');
  await page.getByLabel(/password/i).fill('PlaywrightPassword123!');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  await expect(page.getByText(/overview of your content/i)).toBeVisible();
});
