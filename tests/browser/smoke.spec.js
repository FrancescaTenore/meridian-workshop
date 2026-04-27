const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3000';

test.describe('Navigation', () => {
  test('app loads with correct branding', async ({ page }) => {
    await page.goto(BASE + '/');
    await expect(page.locator('h1')).toContainText('Catalyst Components');
    await expect(page.locator('nav')).toBeVisible();
  });

  const routes = [
    { label: 'Inventory', path: '/inventory' },
    { label: 'Orders', path: '/orders' },
    { label: 'Finance', path: '/spending' },
    { label: 'Demand Forecast', path: '/demand' },
    { label: 'Reports', path: '/reports' },
    { label: 'Restocking', path: '/restocking' },
  ];

  for (const { label, path } of routes) {
    test(`navigates to ${label}`, async ({ page }) => {
      await page.goto(BASE + '/');
      await page.click(`nav a[href="${path}"]`);
      await expect(page).toHaveURL(BASE + path);
      await expect(page.locator('body')).not.toContainText('Cannot read');
    });
  }

  test('language switcher is visible', async ({ page }) => {
    await page.goto(BASE + '/');
    await expect(page.getByRole('button', { name: /english/i })).toBeVisible();
  });
});
