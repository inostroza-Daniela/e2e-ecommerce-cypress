import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import cartPage from '../../pages/CartPage';
import checkoutPage from '../../pages/CheckoutPage';
import { findProducts, parseAmount, roundCurrency } from '../../support/utils';

const SHIPPING_FIELDS = {
  'first name': 'firstName',
  'last name': 'lastName',
  'postal code': 'postalCode',
};

const CURRENCY_FORMAT = /\$\d+\.\d{2}$/;

const expectAmount = (label, expected) =>
  label.invoke('text').should((text) => {
    expect(text, 'currency format').to.match(CURRENCY_FORMAT);
    expect(parseAmount(text)).to.be.closeTo(expected, 0.001);
  });

When('I proceed to checkout', () => {
  cartPage.checkout();
  cy.location('pathname').should('eq', checkoutPage.paths.information);
});

When('I submit my shipping information', () => {
  cy.fixture('customer').then((customer) => {
    checkoutPage.fillInformation(customer).continue();
  });
  cy.location('pathname').should('eq', checkoutPage.paths.overview);
});

When('I submit my shipping information without the {string}', (fieldLabel) => {
  const field = SHIPPING_FIELDS[fieldLabel];
  if (!field) {
    throw new Error(`Unsupported shipping field "${fieldLabel}"`);
  }
  cy.fixture('customer').then((customer) => {
    checkoutPage.fillInformation({ ...customer, [field]: '' }).continue();
  });
});

When('I cancel the checkout', () => {
  checkoutPage.cancel();
});

When('I confirm the order', () => {
  checkoutPage.finish();
});

Then('I should see the checkout error {string}', (message) => {
  checkoutPage.elements.error().should('be.visible').and('contain.text', message);
});

Then('I should remain on the shipping information step', () => {
  cy.location('pathname').should('eq', checkoutPage.paths.information);
});

Then('the order overview should list the selected products', () => {
  cy.get('@selectedProducts').then((names) => {
    checkoutPage.elements.overviewItemNames().should('have.length', names.length);
    checkoutPage.overviewProductNames().should('have.members', names);
  });
});

Then('the order total should be the item total plus {int}% tax', (taxRate) => {
  cy.fixture('products').then((catalog) => {
    cy.get('@selectedProducts').then((names) => {
      const itemTotal = roundCurrency(findProducts(catalog, names).reduce((sum, { price }) => sum + price, 0));
      const tax = roundCurrency((itemTotal * taxRate) / 100);

      expectAmount(checkoutPage.elements.itemTotal(), itemTotal);
      expectAmount(checkoutPage.elements.tax(), tax);
      expectAmount(checkoutPage.elements.total(), roundCurrency(itemTotal + tax));
    });
  });
});

Then('I should see the order confirmation', () => {
  cy.location('pathname').should('eq', checkoutPage.paths.complete);
  checkoutPage.elements.confirmationHeader().should('have.text', 'Thank you for your order!');
  checkoutPage.elements.backHomeButton().should('be.visible');
});
