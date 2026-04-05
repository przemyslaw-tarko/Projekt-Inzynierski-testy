const { test, expect } = require('@playwright/test');

async function addFirstProductToCart(page) {
  await page.goto(toUrl('/shop'));
  const addToCart = page.locator('a.add_to_cart_button').first();
  await addToCart.click();
  await expect(page.locator('.woocommerce-message, a.added_to_cart')).toBeVisible();
}

async function clearCart(page) {
  await page.goto(toUrl('/cart'));
  while (await page.locator('.cart_item a.remove').count()) {
    await page.locator('.cart_item a.remove').first().click();
  }
  await expect(page.locator('.cart-empty, .woocommerce-message').first()).toBeVisible();
}

test.describe('UI - Core User Flows', () => {
  test('home page loads and title contains "Test App"', async ({ page }) => {
    await page.goto(toUrl('/'));
    await expect(page).toHaveTitle(/Test App/i);
  });

  test('shop page shows product list', async ({ page }) => {
    await page.goto(toUrl('/shop'));
    const products = page.locator('.products .product');
    await expect(products.first()).toBeVisible();
    expect(await products.count()).toBeGreaterThan(0);
  });

  test('product page shows title and price', async ({ page }) => {
    await page.goto(toUrl('/shop'));
    await page.locator('.products .product a').first().click();
    await expect(page.locator('.product_title')).toBeVisible();
    await expect(page.locator('.summary .price')).toBeVisible();
  });

  test('add to cart from shop and verify in cart', async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto(toUrl('/cart'));
    await expect(page.locator('.cart_item').first()).toBeVisible();
  });

  test('remove product from cart', async ({ page }) => {
    await clearCart(page);
    await addFirstProductToCart(page);
    await page.goto(toUrl('/cart'));
    await page.locator('.cart_item a.remove').first().click();
    await expect(page.locator('.cart-empty, .woocommerce-message').first()).toBeVisible();
  });

  test('cart persists after refresh', async ({ page }) => {
    await clearCart(page);
    await addFirstProductToCart(page);
    await page.goto(toUrl('/cart'));
    await page.reload();
    await expect(page.locator('.cart_item').first()).toBeVisible();
  });

  test('checkout shows validation errors for empty required fields', async ({ page }) => {
    await clearCart(page);
    await addFirstProductToCart(page);
    await page.goto(toUrl('/checkout'));
    const placeOrder = page.locator('#place_order, button[name="woocommerce_checkout_place_order"]');
    await expect(placeOrder).toBeVisible();
    await placeOrder.click();
    const stripeErrorBox = page.locator('.stripe-source-errors[role="alert"]');
    const invalidStripe = page.locator('.StripeElement--invalid');

    await expect.poll(async () => {
      const alertCount = await stripeErrorBox.count();
      const invalidCount = await invalidStripe.count();
      return alertCount + invalidCount;
    }).toBeGreaterThan(0);
  });

  test('search for "astronomy" returns results', async ({ page }) => {
    await page.goto(toUrl('/shop'));
    await page.locator('input[type="search"], input[name="s"]').fill('astronomy');
    await page.keyboard.press('Enter');
    await expect(page.locator('.products .product').first()).toBeVisible();
  });

  test('sort by price: low to high', async ({ page }) => {
    await page.goto(toUrl('/shop'));
    await page.locator('select[name="orderby"]').selectOption({ value: 'price' });
    await expect(page.locator('.products .product .price').first()).toBeVisible();
  });

  test('product images are visible on shop', async ({ page }) => {
    await page.goto(toUrl('/shop'));
    await expect(page.locator('.products .product img').first()).toBeVisible();
  });

  test('404 page for missing route', async ({ page }) => {
    await page.goto(toUrl('/this-page-should-not-exist'));
    await expect(page.getByRole('heading', { name: 'Oops! That page can’t be' })).toBeVisible();
  });

  test('mobile viewport basic layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(toUrl('/'));
    await expect(page.getByRole('banner', { name: 'Site' })).toBeVisible();
    await expect(page.locator('#main')).toBeVisible();
  });
});