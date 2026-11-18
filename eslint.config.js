const js = require('@eslint/js');
const cypress = require('eslint-plugin-cypress');
const globals = require('globals');

module.exports = [
  {
    ignores: ['node_modules/', 'cypress/results/', 'cypress/videos/', 'cypress/downloads/'],
  },
  js.configs.recommended,
  {
    files: ['*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
  },
  {
    files: ['cypress/**/*.js'],
    ...cypress.configs.recommended,
    languageOptions: {
      ...cypress.configs.recommended.languageOptions,
      sourceType: 'module',
    },
    rules: {
      ...cypress.configs.recommended.rules,
      'cypress/no-unnecessary-waiting': 'error',
      'cypress/no-force': 'error',
      'cypress/no-pause': 'error',
    },
  },
];
