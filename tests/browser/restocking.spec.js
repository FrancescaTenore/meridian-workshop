const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3000';

test.describe('Restocking page (R2)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/restocking');
    await expect(page.getByText('Loading restocking recommendations...')).toBeHidden({ timeout: 10000 });
  });

  test('page heading renders', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Restocking Recommendations', level: 2 })).toBeVisible();
  });

  test('budget ceiling input is visible and pre-filled', async ({ page }) => {
    const input = page.getByRole('spinbutton', { name: 'Budget Ceiling' });
    await expect(input).toBeVisible();
    await expect(input).toHaveValue('50000');
  });

  test('stats cards show items-to-restock count', async ({ page }) => {
    await expect(page.getByText('Items to Restock')).toBeVisible();
    const statValue = page.locator('.stat-card').filter({ hasText: 'Items to Restock' }).locator('.stat-value');
    await expect(statValue).toHaveText('4');
  });

  test('over-budget badge appears on the correct row', async ({ page }) => {
    const row = page.getByRole('row', { name: /SRV-302/ });
    await expect(row.getByText('Over Budget', { exact: true })).toBeVisible();
  });

  test('recommendations table has required columns', async ({ page }) => {
    for (const col of ['SKU', 'Item Name', 'Warehouse', 'Recommended Qty', 'Est. Cost', 'Priority']) {
      await expect(page.getByRole('columnheader', { name: col })).toBeVisible();
    }
  });

  test('raising budget ceiling clears over-budget count', async ({ page }) => {
    const input = page.getByRole('spinbutton', { name: 'Budget Ceiling' });
    await input.fill('1000000');
    await input.press('Tab');
    const overBudgetStat = page.locator('.stat-card').filter({ hasText: 'Items Over Budget' }).locator('.stat-value');
    await expect(overBudgetStat).toHaveText('0');
  });

  test('lowering budget ceiling flags all items over budget', async ({ page }) => {
    const input = page.getByRole('spinbutton', { name: 'Budget Ceiling' });
    await input.fill('1000');
    await input.press('Tab');
    const overBudgetStat = page.locator('.stat-card').filter({ hasText: 'Items Over Budget' }).locator('.stat-value');
    await expect(overBudgetStat).toHaveText('4');
  });

  test('priority badges are shown for all rows', async ({ page }) => {
    const priorityBadges = page.locator('tbody td').filter({ hasText: /^(High|Medium|Low)$/ });
    const count = await priorityBadges.count();
    expect(count).toBeGreaterThan(0);
  });
});
