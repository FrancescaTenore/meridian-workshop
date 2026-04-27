const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3000';

test.describe('Reports page (R1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/reports');
    await expect(page.getByText('Loading reports...')).toBeHidden({ timeout: 10000 });
  });

  test('page heading renders', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Performance Reports' })).toBeVisible();
  });

  test('quarterly table shows all four quarters', async ({ page }) => {
    for (const quarter of ['Q1-2025', 'Q2-2025', 'Q3-2025', 'Q4-2025']) {
      await expect(page.getByRole('cell', { name: quarter })).toBeVisible();
    }
  });

  test('quarterly table has correct columns', async ({ page }) => {
    for (const header of ['Quarter', 'Total Orders', 'Total Revenue', 'Avg Order Value', 'Fulfillment Rate']) {
      await expect(page.getByRole('columnheader', { name: header })).toBeVisible();
    }
  });

  test('monthly trend chart renders 12 month labels', async ({ page }) => {
    await expect(page.locator('.bar-label')).toHaveCount(12);
  });

  test('month-over-month table has 12 rows of data', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Month-over-Month Analysis' })).toBeVisible();
    const rows = page.locator('.reports table').nth(1).locator('tbody tr');
    await expect(rows).toHaveCount(12);
  });

  test('YTD summary cards are present', async ({ page }) => {
    await expect(page.getByText('Total Revenue (YTD)')).toBeVisible();
    await expect(page.getByText('Total Orders (YTD)')).toBeVisible();
    await expect(page.getByText('Best Performing Quarter')).toBeVisible();
  });

  test('fulfillment rate cells contain percentage values', async ({ page }) => {
    const rates = page.locator('tbody td').filter({ hasText: /\d+\.\d+%/ });
    await expect(rates.first()).toBeVisible();
  });
});
