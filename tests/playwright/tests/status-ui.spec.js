const { test, expect } = require('@playwright/test');
const { toUrl } = require('../utils/baseUrl');

async function addFirstProductToCart(page) {
  await page.goto(toUrl('/shop'));
  const addToCart = page.locator('a.add_to_cart_button').first();
  await expect(addToCart).toBeVisible();
  await addToCart.click();
}

test.describe('UI - TestRail Status Checks', () => {
  test('[PW-STATUS-UI-01] [C128] shop blocked by maintenance page', async ({ page }) => {
    test.skip(true, 'Intentional skip for blocked/skipped status mapping validation.');
    const response = await page.goto(toUrl('/shop'));
    expect(response).not.toBeNull();
    expect([200, 503]).toContain(response.status());
  });

  test('[PW-STATUS-UI-02] [C129] checkout blocked by missing Stripe dependency', async ({ page }) => {
    test.skip(true, 'Intentional skip for dependency-blocked checkout status mapping validation.');
    await addFirstProductToCart(page);
    const response = await page.goto(toUrl('/checkout'));
    expect(response).not.toBeNull();
    expect([200, 503]).toContain(response.status());
  });

  test('[PW-STATUS-UI-03] [C130] add to cart count intentionally fails', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto(toUrl('/cart'));
    const cartRows = page.locator('.cart_item');
    await expect(cartRows.first()).toBeVisible();
    await expect(cartRows).toHaveCount(2);
  });

  test('[PW-STATUS-UI-04] [C131] search result forced failure', async ({ page }) => {
    await page.goto(toUrl('/shop'));
    await page.locator('input[type="search"], input[name="s"]').fill('zzzz-unlikely-term');
    await page.keyboard.press('Enter');
    await expect(page.locator('.products .product').first()).toBeVisible();
  });

  test('[PW-STATUS-UI-05] [C132] runtime error while reading product details', async ({ page }) => {
    await page.goto(toUrl('/shop'));
    await page.locator('.products .product a').first().click();
    await expect(page.locator('.product_title')).toBeVisible();
    throw new Error('Intentional Playwright UI runtime error for TestRail status validation.');
  });
});
