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
    reportTitle: 'Suite E2E · Swag Labs',
    reportPageTitle: 'Reporte E2E · Swag Labs',
    charts: true,
    embeddedScreenshots: false,
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

      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family !== 'chromium' || browser.name === 'electron') {
          return launchOptions;
        }

        Object.assign(launchOptions.preferences.default, {
          credentials_enable_service: false,
          'profile.password_manager_enabled': false,
          'profile.password_manager_leak_detection': false,
        });
        launchOptions.args.push('--disable-features=PasswordLeakDetection');

        if (browser.isHeadless) {
          launchOptions.args.push('--window-size=1600,1200', '--force-device-scale-factor=1');
        }
        return launchOptions;
      });

      return config;
    },
  },
});
