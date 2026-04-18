const assert = require('node:assert');
const { By, until } = require('selenium-webdriver');
const { buildDriverWithRetry, quitDriver } = require('../support/driver');

const baseUrl = process.env.BASE_URL || 'http://wordpress';

describe('Bookstore smoke (Selenium)', function () {
  this.timeout(60000);

  let driver;

  before(async () => {
    driver = await buildDriverWithRetry();
  });

  after(async () => {
    await quitDriver(driver);
  });

  it('title contains "Test App"', async () => {
    await driver.get(baseUrl);
    await driver.wait(until.elementLocated(By.css('body')), 10000);
    const title = await driver.getTitle();
    assert.ok(title.includes('Test App'));
  });
});
