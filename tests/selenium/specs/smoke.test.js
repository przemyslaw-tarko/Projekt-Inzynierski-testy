const assert = require('node:assert');
const { Builder, By, until } = require('selenium-webdriver');

const baseUrl = process.env.BASE_URL || 'http://wordpress';
const seleniumRemoteUrl = process.env.SELENIUM_REMOTE_URL || 'http://selenium-chrome:4444/wd/hub';

describe('Bookstore smoke (Selenium)', function () {
  this.timeout(60000);

  let driver;

  before(async () => {
    driver = await new Builder().usingServer(seleniumRemoteUrl).forBrowser('chrome').build();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('title contains "Test App"', async () => {
    await driver.get(baseUrl);
    await driver.wait(until.elementLocated(By.css('body')), 10000);
    const title = await driver.getTitle();
    assert.ok(title.includes('Test App'));
  });
});

// test s 1