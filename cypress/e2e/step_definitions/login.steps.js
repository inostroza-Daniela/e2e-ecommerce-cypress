import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import loginPage from '../../pages/LoginPage';
import inventoryPage from '../../pages/InventoryPage';
import header from '../../pages/components/Header';

const CREDENTIAL_FIELDS = ['username', 'password'];

const withPersona = (persona, callback) =>
  cy.fixture('users').then((users) => {
    const user = users[persona];
    if (!user) {
      throw new Error(`Persona "${persona}" is not defined in fixtures/users.json`);
    }
    cy.wrap(user, { log: false }).as('loginAttempt');
    callback(user);
  });

Given('I am on the login page', () => {
  loginPage.visit();
});

When('I log in as a/an {string} customer', (persona) => {
  withPersona(persona, ({ username, password }) => {
    loginPage.loginWith(username, password);
  });
});

When('I try to log in as a/an {string} customer without a/an {word}', (persona, missingField) => {
  if (!CREDENTIAL_FIELDS.includes(missingField)) {
    throw new Error(`Unsupported credential field "${missingField}"`);
  }
  withPersona(persona, (user) => {
    const credentials = { ...user, [missingField]: '' };
    loginPage.loginWith(credentials.username, credentials.password);
  });
});

When('I log out', () => {
  header.logout();
});

Then('I should see the product catalog within {int} seconds', (seconds) => {
  const timeout = seconds * 1000;
  cy.location('pathname', { timeout }).should('eq', inventoryPage.path);
  inventoryPage.elements.cards({ timeout }).should('have.length.greaterThan', 0);
});

Then('I should see the login error {string}', (message) => {
  loginPage.elements.error().should('be.visible').and('contain.text', message);
});

Then('I should be/remain on the login page', () => {
  cy.location('pathname').should('eq', loginPage.path);
  loginPage.elements.submitButton().should('be.visible');
});

Then('the failed attempt should be reported to error monitoring without exposing the password', () => {
  cy.get('@loginAttempt').then(({ username, password }) => {
    cy.wait('@errorReport')
      .its('request.body')
      .then((body) => {
        const payload = typeof body === 'string' ? body : JSON.stringify(body);
        expect(payload.includes(username), 'report identifies the username').to.equal(true);
        expect(payload.includes(password), 'report contains the password').to.equal(false);
      });
  });
});

Then('I should not be able to open the catalog without logging in again', () => {
  cy.getCookie('session-username').should('be.null');
  inventoryPage.visit();
  cy.location('pathname').should('eq', loginPage.path);
  loginPage.elements
    .error()
    .should('contain.text', `You can only access '${inventoryPage.path}' when you are logged in.`);
});
