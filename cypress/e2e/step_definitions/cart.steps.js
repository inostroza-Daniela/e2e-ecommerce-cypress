import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import inventoryPage from '../../pages/InventoryPage';
import cartPage from '../../pages/CartPage';
import header from '../../pages/components/Header';
import { findProducts } from '../../support/utils';

const PRODUCT_COLUMN = 'producto';

const productNames = (table) => table.hashes().map((row) => row[PRODUCT_COLUMN]);

const rememberSelection = (names) => cy.wrap(names).as('selectedProducts');

When('agrego los siguientes productos al carro:', (table) => {
  const names = productNames(table);
  names.forEach((name) => inventoryPage.addToCart(name));
  rememberSelection(names);
});

When('agrego {string} al carro', (productName) => {
  inventoryPage.addToCart(productName);
  rememberSelection([productName]);
});

Given('que mi carro ya contiene:', (table) => {
  const names = productNames(table);
  cy.fixture('products').then((catalog) => {
    const ids = findProducts(catalog, names).map(({ id }) => id);
    cy.visitWithCart(inventoryPage.path, ids);
  });
  rememberSelection(names);
});

When('abro el carro', () => {
  header.openCart();
  cy.location('pathname').should('eq', cartPage.path);
});

When('quito {string} del carro', (productName) => {
  cartPage.remove(productName);
});

When('sigo comprando', () => {
  cartPage.continueShopping();
  cy.location('pathname').should('eq', inventoryPage.path);
});

Then('el contador del carro muestra {int}', (count) => {
  header.elements.cartBadge().should('have.text', String(count));
});

Then('no se muestra el contador del carro', () => {
  header.elements.cartLink().should('be.visible');
  header.elements.cartBadge().should('not.exist');
});

Then('los productos agregados aparecen marcados como en el carro', () => {
  cy.get('@selectedProducts').each((productName) => {
    inventoryPage.elements.removeButton(productName).should('be.visible').and('have.text', 'Remove');
  });
});

Then('el carro muestra cada producto elegido con cantidad {int} y su precio de catálogo', (quantity) => {
  cy.fixture('products').then((catalog) => {
    cy.get('@selectedProducts').then((names) => {
      const expected = findProducts(catalog, names).map(({ name, price }) => ({ name, quantity, price }));
      cartPage.elements.rows().should('have.length', expected.length);
      cartPage.lines().should('have.deep.members', expected);
    });
  });
});

Then('el carro solo contiene {string}', (productName) => {
  cy.location('pathname').should('eq', cartPage.path);
  cartPage.elements.rows().should('have.length', 1);
  cartPage.lines().its('0.name').should('equal', productName);
});
