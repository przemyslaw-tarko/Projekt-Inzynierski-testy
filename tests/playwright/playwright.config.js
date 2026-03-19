const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: process.env.BASE_URL || 'http://wordpress',
    headless: true
  },
  reporter: [
    ['html', { outputFolder: '../../reports/playwright/html', open: 'never' }],
    ['junit', { outputFile: '../../reports/playwright/junit/results.xml' }]
  ]
});
