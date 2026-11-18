import 'cypress-mochawesome-reporter/cucumberSupport';
import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import inventoryPage from '../../pages/InventoryPage';

const DYNAMIC_CONTENT = ['[data-test="footer-copy"]'];

Given('I am logged in as a/an {string} customer', (persona) => {
  cy.loginAs(persona);
  inventoryPage.visit();
});

Then('I should see the product catalog', () => {
  cy.location('pathname').should('eq', inventoryPage.path);
  inventoryPage.header.elements.title().should('have.text', 'Products');
  inventoryPage.elements.cards().should('have.length.greaterThan', 0);
});

Then('the page should match the approved {string} design', (snapshotName) => {
  cy.waitForPageAssets();
  cy.matchImageSnapshot(snapshotName, { blackout: DYNAMIC_CONTENT });
});
