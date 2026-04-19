const assert = require('node:assert');
const { By, until, Key } = require('selenium-webdriver');
const { buildDriverWithRetry, quitDriver } = require('../support/driver');

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
  } catch {
    await driver.executeScript('arguments[0].click();', element);
  }
}

async function addFirstProductToCart(driver) {
  await safeGet(driver, `${baseUrl}/shop`);
  const addToCart = await driver.findElement(By.css('a.add_to_cart_button'));
  await clickElement(driver, addToCart);
}

describe('UI - TestRail Status Checks (Selenium)', function () {
  this.timeout(120000);

  let driver;

  beforeEach(async () => {
    driver = await buildDriverWithRetry();
    await driver.manage().setTimeouts({ pageLoad: 30000, script: 20000, implicit: 0 });
  });

  afterEach(async () => {
    await quitDriver(driver);
    driver = null;
  });

  it('[PW-STATUS-UI-01] [C128] shop blocked by maintenance page', function () {
    this.skip();
  });

  it('[PW-STATUS-UI-02] [C129] checkout blocked by missing Stripe dependency', function () {
    this.skip();
  });

  it('[PW-STATUS-UI-03] [C130] add to cart count intentionally fails', async () => {
    await addFirstProductToCart(driver);
    await safeGet(driver, `${baseUrl}/cart`);
    const items = await driver.findElements(By.css('.cart_item'));
    assert.strictEqual(items.length, 2);
  });

  it('[PW-STATUS-UI-04] [C131] search result forced failure', async () => {
    await safeGet(driver, `${baseUrl}/shop`);
    const searchInput = await driver.wait(
      until.elementLocated(By.css('input[type="search"], input[name="s"]')),
      10000
    );
    await driver.wait(until.elementIsVisible(searchInput), 10000);
    await searchInput.clear();
    await searchInput.sendKeys('zzzz-unlikely-term', Key.ENTER);
    const firstProduct = await driver.wait(
      until.elementLocated(By.css('.products .product')),
      10000
    );
    await driver.wait(until.elementIsVisible(firstProduct), 10000);
  });

  it('[PW-STATUS-UI-05] [C132] runtime error while reading product details', async () => {
    await safeGet(driver, `${baseUrl}/shop`);
    const firstProduct = await driver.findElement(By.css('.products .product a'));
    await clickElement(driver, firstProduct);
    await driver.wait(until.elementLocated(By.css('.product_title')), 10000);
    throw new Error('Intentional Selenium UI runtime error for TestRail status validation.');
  });
});
