const assert = require('node:assert');
const { By, until, Key } = require('selenium-webdriver');
const fs = require('node:fs');
const path = require('node:path');
const { buildDriverWithRetry, quitDriver, withTimeout } = require('../support/driver');

const baseUrl = process.env.BASE_URL || 'http://wordpress';

async function waitForBody(driver) {
  const body = await driver.wait(until.elementLocated(By.css('body')), 15000);
  await driver.wait(until.elementIsVisible(body), 15000);
}

async function safeGet(driver, url) {
  await driver.get(url);
  await waitForBody(driver);
}

async function clickElement(driver, element) {
  await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', element);
  try {
    await element.click();
  } catch (err) {
    await driver.executeScript('arguments[0].click();', element);
  }
}

async function clickByCss(driver, selector) {
  let element = await driver.wait(until.elementLocated(By.css(selector)), 15000);
  await driver.wait(until.elementIsVisible(element), 15000);

  try {
    await clickElement(driver, element);
  } catch (err) {
    if (!/stale/i.test(String(err))) throw err;
    element = await driver.wait(until.elementLocated(By.css(selector)), 15000);
    await driver.wait(until.elementIsVisible(element), 15000);
    await clickElement(driver, element);
  }
}

async function addFirstProductToCart(driver) {
  await safeGet(driver, `${baseUrl}/shop`);
  const addToCart = await driver.findElement(By.css('a.add_to_cart_button'));
  await clickElement(driver, addToCart);
  const confirmation = await driver.wait(
    until.elementLocated(By.css('.woocommerce-message, a.added_to_cart')),
    15000
  );
  await driver.wait(until.elementIsVisible(confirmation), 15000);
}

async function clearCart(driver) {
  await safeGet(driver, `${baseUrl}/cart`);
  for (let i = 0; i < 10; i += 1) {
    const removeButtons = await driver.findElements(By.css('.cart_item a.remove'));
    if (!removeButtons.length) break;
    const firstRemove = removeButtons[0];
    const itemsBefore = await driver.findElements(By.css('.cart_item'));
    await clickElement(driver, firstRemove);
    await driver.wait(async () => {
      const empty = await driver.findElements(By.css('.cart-empty'));
      if (empty.length) return true;
      const itemsAfter = await driver.findElements(By.css('.cart_item'));
      return itemsAfter.length < itemsBefore.length;
    }, 20000);
  }
  await driver.wait(async () => {
    const items = await driver.findElements(By.css('.cart_item'));
    const empty = await driver.findElements(By.css('.cart-empty'));
    return items.length === 0 || empty.length > 0;
  }, 20000);
}

describe('UI - Core User Flows (Selenium)', function () {
  this.timeout(120000);

  let driver;

  beforeEach(async () => {
    driver = await buildDriverWithRetry();
    await driver.manage().setTimeouts({ pageLoad: 30000, script: 20000, implicit: 0 });
  });

  afterEach(async function () {
    try {
      if (driver && this.currentTest?.state === 'failed') {
        const safeTitle = this.currentTest.title.replace(/[^\w.-]+/g, '_');
        const outDir = '/work/reports/selenium/debug';
        try {
          fs.mkdirSync(outDir, { recursive: true });
        } catch {}
        try {
          const screenshot = await withTimeout(driver.takeScreenshot(), 10000);
          fs.writeFileSync(path.join(outDir, `${safeTitle}.png`), screenshot, 'base64');
        } catch {}
        try {
          const html = await withTimeout(driver.getPageSource(), 10000);
          fs.writeFileSync(path.join(outDir, `${safeTitle}.html`), html, 'utf8');
        } catch {}
        try {
          const url = await withTimeout(driver.getCurrentUrl(), 5000);
          process.stdout.write(`FAILED URL: ${url}\n`);
        } catch {}
      }
    } finally {
      try {
        await quitDriver(driver);
      } catch (err) {}
      driver = null;
    }
  });

  it('[C46] home page loads and title contains "Test App"', async () => {
    await safeGet(driver, `${baseUrl}/`);
    const title = await driver.getTitle();
    assert.match(title, /Test App/i);
  });

  it('[C47] shop page shows product list', async () => {
    await safeGet(driver, `${baseUrl}/shop`);
    const products = await driver.findElements(By.css('.products .product'));
    assert.ok(products.length > 0);
  });

  it('[C48] product page shows title and price', async () => {
    await safeGet(driver, `${baseUrl}/shop`);
    const firstProduct = await driver.findElement(By.css('.products .product a'));
    await clickElement(driver, firstProduct);
    await driver.wait(until.elementLocated(By.css('.product_title')), 10000);
    await driver.wait(until.elementLocated(By.css('.summary .price')), 10000);
  });

  it('[C49] add to cart from shop and verify in cart', async () => {
    await addFirstProductToCart(driver);
    await safeGet(driver, `${baseUrl}/cart`);
    const items = await driver.findElements(By.css('.cart_item'));
    assert.ok(items.length > 0);
  });

  it('[C50] remove product from cart', async () => {
    await clearCart(driver);
    await addFirstProductToCart(driver);
    await safeGet(driver, `${baseUrl}/cart`);
    const cartRow = await driver.findElement(By.css('.cart_item'));
    const removeButton = await cartRow.findElement(By.css('a.remove'));
    await clickElement(driver, removeButton);
    await driver.wait(async () => {
      const empty = await driver.findElements(By.css('.cart-empty'));
      const notices = await driver.findElements(By.css('.woocommerce-message'));
      if (empty.length || notices.length) return true;
      try {
        return await cartRow.getTagName().then(() => false, () => true);
      } catch {
        return true;
      }
    }, 20000);
  });

  it('[C51] cart persists after refresh', async () => {
    await clearCart(driver);
    await addFirstProductToCart(driver);
    await safeGet(driver, `${baseUrl}/cart`);
    await driver.wait(async () => {
      const items = await driver.findElements(By.css('.cart_item'));
      return items.length > 0;
    }, 20000);
    await safeGet(driver, `${baseUrl}/cart`);
    await driver.wait(async () => {
      const items = await driver.findElements(By.css('.cart_item'));
      return items.length > 0;
    }, 20000);
  });

  it('[C52] checkout shows validation errors for empty required fields', async () => {
    await clearCart(driver);
    await addFirstProductToCart(driver);
    await safeGet(driver, `${baseUrl}/checkout`);
    await driver.wait(until.elementLocated(By.css('form.checkout')), 15000);
    const checkoutForm = await driver.findElement(By.css('form.checkout'));
    await driver.wait(until.elementIsVisible(checkoutForm), 15000);
    const placeOrderButton = await driver.wait(
      until.elementLocated(By.css('#place_order, button[name="woocommerce_checkout_place_order"]')),
      15000
    );
    await driver.wait(until.elementIsVisible(placeOrderButton), 15000);
    await driver.wait(until.elementIsEnabled(placeOrderButton), 15000);
    await clickByCss(driver, '#place_order, button[name="woocommerce_checkout_place_order"]');
    await driver.wait(async () => {
      const bodyText = await driver.findElement(By.css('body')).getText();
      const hasTextError =
        bodyText.includes('required field') ||
        bodyText.includes('is a required field') ||
        bodyText.includes('card number is incomplete') ||
        bodyText.includes('The card number is incomplete');
      const woocommerceErrors = await driver.findElements(By.css('.woocommerce-error li, .woocommerce-error'));
      const stripeErrors = await driver.findElements(By.css('.stripe-source-errors[role="alert"], .StripeElement--invalid'));
      return hasTextError || woocommerceErrors.length > 0 || stripeErrors.length > 0;
    }, 30000);
  });

  it('[C53] search for "astronomy" returns results', async () => {
    await safeGet(driver, `${baseUrl}/shop`);
    const searchInput = await driver.wait(
      until.elementLocated(By.css('input[type="search"], input[name="s"]')),
      10000
    );
    await driver.wait(until.elementIsVisible(searchInput), 10000);
    await searchInput.clear();
    await searchInput.sendKeys('astronomy', Key.ENTER);
    await driver.wait(async () => {
      const currentUrl = await driver.getCurrentUrl();
      return currentUrl.includes('astronomy') || currentUrl.includes('s=astronomy');
    }, 10000);
    await driver.wait(async () => {
      const products = await driver.findElements(By.css('.products .product'));
      return products.length > 0;
    }, 10000);
  });

  it('[C54] sort by price: low to high', async () => {
    await safeGet(driver, `${baseUrl}/shop`);
    const sortSelect = await driver.findElement(By.css('select[name="orderby"]'));
    await driver.executeScript(
      "arguments[0].value='price'; arguments[0].dispatchEvent(new Event('change', { bubbles: true }));",
      sortSelect
    );
    await driver.wait(async () => {
      const currentUrl = await driver.getCurrentUrl();
      return currentUrl.includes('orderby=price');
    }, 10000);
    await driver.wait(until.elementLocated(By.css('.products .product .price')), 10000);
  });

  it('[C55] product images are visible on shop', async () => {
    await safeGet(driver, `${baseUrl}/shop`);
    await driver.wait(until.elementLocated(By.css('.products .product img')), 10000);
  });

  it('[C56] 404 page for missing route', async () => {
    await safeGet(driver, `${baseUrl}/this-page-should-not-exist`);
    const bodyText = await driver.findElement(By.css('body')).getText();
    assert.match(bodyText, /Oops/i);
  });

  it('[C57] mobile viewport basic layout', async () => {
    await driver.manage().window().setRect({ width: 375, height: 667 });
    await safeGet(driver, `${baseUrl}/`);
    const main = await driver.findElement(By.css('#main'));
    assert.ok(await main.isDisplayed());
  });
});
