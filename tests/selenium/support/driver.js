const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const seleniumRemoteUrl = process.env.SELENIUM_REMOTE_URL || 'http://selenium-chrome:4444';
const buildTimeoutMs = 45000;
const totalRetryWindowMs = 120000;
const retryIntervalMs = 2000;

function withTimeout(promise, ms, message = 'Timeout') {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

function createBuilder() {
  const options = new chrome.Options();
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.setPageLoadStrategy('eager');

  return new Builder().usingServer(seleniumRemoteUrl).forBrowser('chrome').setChromeOptions(options);
}

async function buildDriverWithRetry() {
  const start = Date.now();
  let lastError;

  while (Date.now() - start < totalRetryWindowMs) {
    try {
      return await withTimeout(
        createBuilder().build(),
        buildTimeoutMs,
        'driver build timeout'
      );
    } catch (err) {
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
    }
  }

  throw lastError;
}

async function quitDriver(driver) {
  if (!driver) return;
  await withTimeout(driver.quit(), 10000, 'driver quit timeout');
}

module.exports = {
  buildDriverWithRetry,
  quitDriver,
  withTimeout
};
