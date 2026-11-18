import 'cypress-mochawesome-reporter/cucumberSupport';
import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import inventoryPage from '../../pages/InventoryPage';

const DYNAMIC_CONTENT = ['[data-test="footer-copy"]'];

Given('que inicié sesión como cliente {string}', (persona) => {
  cy.loginAs(persona);
  inventoryPage.visit();
});

Then('veo el catálogo de productos', () => {
  cy.location('pathname').should('eq', inventoryPage.path);
  inventoryPage.header.elements.title().should('have.text', 'Products');
  inventoryPage.elements.cards().should('have.length.greaterThan', 0);
});

Then('la página coincide con el diseño aprobado {string}', (snapshotName) => {
  if (Cypress.platform !== 'linux') {
    cy.log('Visual baselines are rendered on Linux; run `npm run docker:test` to compare them');
    return 'skipped';
  }

  cy.waitForPageAssets();
  cy.matchImageSnapshot(snapshotName, { blackout: DYNAMIC_CONTENT });
});
