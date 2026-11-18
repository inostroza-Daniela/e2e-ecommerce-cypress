import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import cartPage from '../../pages/CartPage';
import checkoutPage from '../../pages/CheckoutPage';
import { findProducts, parseAmount, roundCurrency } from '../../support/utils';

const SHIPPING_FIELDS = {
  nombre: 'firstName',
  apellido: 'lastName',
  'código postal': 'postalCode',
};

const CURRENCY_FORMAT = /\$\d+\.\d{2}$/;

const expectAmount = (label, expected) =>
  label.invoke('text').should((text) => {
    expect(text, 'currency format').to.match(CURRENCY_FORMAT);
    expect(parseAmount(text)).to.be.closeTo(expected, 0.001);
  });

When('paso al checkout', () => {
  cartPage.checkout();
  cy.location('pathname').should('eq', checkoutPage.paths.information);
});

When('envío mis datos de despacho', () => {
  cy.fixture('customer').then((customer) => {
    checkoutPage.fillInformation(customer).continue();
  });
  cy.location('pathname').should('eq', checkoutPage.paths.overview);
});

When('envío mis datos de despacho sin el {string}', (fieldLabel) => {
  const field = SHIPPING_FIELDS[fieldLabel];
  if (!field) {
    throw new Error(`Unsupported shipping field "${fieldLabel}"`);
  }
  cy.fixture('customer').then((customer) => {
    checkoutPage.fillInformation({ ...customer, [field]: '' }).continue();
  });
});

When('cancelo el checkout', () => {
  checkoutPage.cancel();
});

When('confirmo el pedido', () => {
  checkoutPage.finish();
});

Then('veo el error de checkout {string}', (message) => {
  checkoutPage.elements.error().should('be.visible').and('contain.text', message);
});

Then('sigo en el paso de datos de despacho', () => {
  cy.location('pathname').should('eq', checkoutPage.paths.information);
});

Then('el resumen del pedido muestra los productos elegidos', () => {
  cy.get('@selectedProducts').then((names) => {
    checkoutPage.elements.overviewItemNames().should('have.length', names.length);
    checkoutPage.overviewProductNames().should('have.members', names);
  });
});

Then('el total del pedido es el subtotal más {int}% de impuesto', (taxRate) => {
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

Then('veo la confirmación del pedido', () => {
  cy.location('pathname').should('eq', checkoutPage.paths.complete);
  checkoutPage.elements.confirmationHeader().should('have.text', 'Thank you for your order!');
  checkoutPage.elements.backHomeButton().should('be.visible');
});
