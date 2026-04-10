import { expect, test } from '@playwright/test';

async function loginAsAdmin(page) {
  await page.goto('/admin/login', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: /admin dashboard/i })).toBeVisible();
  await page.getByLabel(/username/i).fill('playwright-admin');
  await page.getByLabel(/password/i).fill('PlaywrightPassword123!');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
}

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
  await loginAsAdmin(page);
  await expect(page.getByText(/overview of your content/i)).toBeVisible();
});

test('public contact submissions appear in admin contacts', async ({ page }) => {
  const uniqueId = Date.now();
  const contactName = `Playwright Lead ${uniqueId}`;
  const contactEmail = `playwright-lead-${uniqueId}@example.com`;

  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('#contact').scrollIntoViewIfNeeded();

  await page.getByLabel(/nom complet/i).fill(contactName);
  await page.getByLabel(/téléphone/i).fill('0470123456');
  await page.getByLabel(/^email/i).fill(contactEmail);
  await page.locator('#contact-service').selectOption({ index: 1 });
  await page.getByLabel(/message/i).fill('Demande de devis de test depuis Playwright.');

  await page.evaluate(() => {
    const realNow = Date.now;
    Date.now = () => realNow() + 5000;
  });

  await page.getByRole('button', { name: /envoyer ma demande/i }).click();
  await expect(page.getByRole('heading', { name: /message envoyé/i })).toBeVisible();

  await loginAsAdmin(page);
  await page.goto('/admin/contacts', { waitUntil: 'networkidle' });

  const searchInput = page.getByPlaceholder(/rechercher par nom, email, téléphone/i);
  await searchInput.fill(contactEmail);

  const contactRow = page.locator('tbody tr').filter({ hasText: contactEmail }).first();
  await expect(contactRow).toBeVisible();
  await expect(contactRow).toContainText(contactName);

  page.once('dialog', (dialog) => dialog.accept());
  await contactRow.getByTitle(/supprimer/i).click();
  await expect(contactRow).not.toBeVisible();
});
