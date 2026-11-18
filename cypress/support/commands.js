import loginPage from '../pages/LoginPage';
import inventoryPage from '../pages/InventoryPage';

const SESSION_COOKIE = 'session-username';
const CART_STORAGE_KEY = 'cart-contents';

Cypress.Commands.add('visitRoute', (route, options) => cy.visit(`/?${route}`, options));

Cypress.Commands.add('getByTestId', (testId, options) => cy.get(`[data-test="${testId}"]`, options));

Cypress.Commands.add('login', (username, password) => {
  cy.session(
    ['ui-login', username],
    () => {
      loginPage.visit().loginWith(username, password);
      cy.location('pathname', { timeout: 15000 }).should('eq', inventoryPage.path);
    },
    {
      cacheAcrossSpecs: true,
      validate() {
        cy.getCookie(SESSION_COOKIE).its('value').should('eq', username);
      },
    },
  );
});

Cypress.Commands.add('loginAs', (persona) => {
  cy.fixture('users').then((users) => {
    const user = users[persona];
    if (!user) {
      throw new Error(`Persona "${persona}" is not defined in fixtures/users.json`);
    }
    cy.login(user.username, user.password);
  });
});

Cypress.Commands.add('visitWithCart', (path, productIds) => {
  cy.visitRoute(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(productIds));
    },
  });
});

Cypress.Commands.add('waitForPageAssets', () => {
  cy.document().its('fonts.status').should('eq', 'loaded');
  cy.window().should((win) => {
    Array.from(win.document.images).forEach((img) => {
      expect(img.complete && img.naturalWidth > 0, `image loaded: ${img.currentSrc || img.src}`).to.equal(true);
    });
  });
});
