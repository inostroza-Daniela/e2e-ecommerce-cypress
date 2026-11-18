const { defineConfig } = require('cypress');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');
const { createEsbuildPlugin } = require('@badeball/cypress-cucumber-preprocessor/esbuild');
const { addMatchImageSnapshotPlugin } = require('@simonsmith/cypress-image-snapshot/plugin');
const registerMochawesomeReporter = require('cypress-mochawesome-reporter/plugin');
const chainPluginEvents = require('cypress-on-fix');

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/results/report',
    reportPageTitle: 'Swag Labs - E2E Report',
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },
  viewportWidth: 1280,
  viewportHeight: 800,
  defaultCommandTimeout: 6000,
  screenshotOnRunFailure: true,
  screenshotsFolder: 'cypress/results/screenshots',
  video: false,
  retries: {
    runMode: 1,
    openMode: 0,
  },
  e2e: {
    baseUrl: 'https://www.saucedemo.com',
    specPattern: 'cypress/e2e/features/**/*.feature',
    async setupNodeEvents(cypressOn, config) {
      const on = chainPluginEvents(cypressOn);

      await addCucumberPreprocessorPlugin(on, config, { omitAfterScreenshotHandler: true });
      on('file:preprocessor', createBundler({ plugins: [createEsbuildPlugin(config)] }));
      registerMochawesomeReporter(on);
      addMatchImageSnapshotPlugin(on);

      return config;
    },
  },
});
