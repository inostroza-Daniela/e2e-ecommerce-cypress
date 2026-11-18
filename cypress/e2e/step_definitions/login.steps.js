import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import loginPage from '../../pages/LoginPage';
import inventoryPage from '../../pages/InventoryPage';
import header from '../../pages/components/Header';

const CREDENTIAL_FIELDS = {
  usuario: 'username',
  contraseña: 'password',
};

const withPersona = (persona, callback) =>
  cy.fixture('users').then((users) => {
    const user = users[persona];
    if (!user) {
      throw new Error(`Persona "${persona}" is not defined in fixtures/users.json`);
    }
    cy.wrap(user, { log: false }).as('loginAttempt');
    callback(user);
  });

Given('que estoy en la página de inicio de sesión', () => {
  loginPage.visit();
});

When('inicio sesión como cliente {string}', (persona) => {
  withPersona(persona, ({ username, password }) => {
    loginPage.loginWith(username, password);
  });
});

When('intento iniciar sesión como cliente {string} sin {word}', (persona, fieldLabel) => {
  const missingField = CREDENTIAL_FIELDS[fieldLabel];
  if (!missingField) {
    throw new Error(`Unsupported credential field "${fieldLabel}"`);
  }
  withPersona(persona, (user) => {
    const credentials = { ...user, [missingField]: '' };
    loginPage.loginWith(credentials.username, credentials.password);
  });
});

When('cierro sesión', () => {
  header.logout();
});

Then('veo el catálogo de productos en menos de {int} segundos', (seconds) => {
  const timeout = seconds * 1000;
  cy.location('pathname', { timeout }).should('eq', inventoryPage.path);
  inventoryPage.elements.cards({ timeout }).should('have.length.greaterThan', 0);
});

Then('veo el error de inicio de sesión {string}', (message) => {
  loginPage.elements.error().should('be.visible').and('contain.text', message);
});

Then('estoy/sigo en la página de inicio de sesión', () => {
  cy.location('pathname').should('eq', loginPage.path);
  loginPage.elements.submitButton().should('be.visible');
});

Then('el intento fallido se reporta al servicio de monitoreo sin exponer la contraseña', () => {
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

Then('no puedo entrar al catálogo sin volver a iniciar sesión', () => {
  cy.getCookie('session-username').should('be.null');
  inventoryPage.visit();
  cy.location('pathname').should('eq', loginPage.path);
  loginPage.elements
    .error()
    .should('contain.text', `You can only access '${inventoryPage.path}' when you are logged in.`);
});
