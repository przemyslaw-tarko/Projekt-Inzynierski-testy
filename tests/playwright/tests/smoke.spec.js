const { test, expect } = require('@playwright/test');

test('title contains "Test App" (Playwright)', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  await expect(page).toHaveTitle(/Test App/);
});
