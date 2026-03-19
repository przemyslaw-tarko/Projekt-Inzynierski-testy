const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.BASE_URL || 'http://wordpress',
    specPattern: 'e2e/**/*.cy.js',
    video: false,
    supportFile: false
  },
  reporter: 'junit',
  reporterOptions: {
    mochaFile: '../../reports/cypress/junit/results.[hash].xml'
  }
});
