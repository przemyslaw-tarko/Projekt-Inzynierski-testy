const { defineConfig } = require('@playwright/test');
const { getBaseUrl } = require('./utils/baseUrl');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: getBaseUrl(),
    headless: true
  },
  reporter: [
    ['html', { outputFolder: '../../reports/playwright/html', open: 'never' }],
    ['junit', { outputFile: '../../reports/playwright/junit/results.xml' }]
  ]
});
