const { test, expect } = require('@playwright/test');
const { toUrl } = require('../utils/baseUrl');

test('smoke: app responds', async ({ page }) => {
  await page.goto(toUrl('/'));
  await expect(page).toHaveTitle(/Test App/i);
});
