import 'cypress-mochawesome-reporter/register';
import { addMatchImageSnapshotCommand } from '@simonsmith/cypress-image-snapshot/command';
import './commands';

addMatchImageSnapshotCommand({
  e2eSpecDir: 'cypress/e2e/features/',
  customSnapshotsDir: 'cypress/snapshots',
  customDiffDir: 'cypress/results/snapshot-diffs',
  failureThreshold: 0.01,
  failureThresholdType: 'percent',
  capture: 'viewport',
});

beforeEach(() => {
  cy.intercept({ hostname: /backtrace\.io$/ }, { statusCode: 200, body: {} });
  cy.intercept(
    { method: 'POST', hostname: /^(?!events\.)[\w.-]*backtrace\.io$/ },
    { statusCode: 200, body: { response: 'ok' } },
  ).as('errorReport');
});
