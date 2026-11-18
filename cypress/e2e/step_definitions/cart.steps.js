import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import inventoryPage from '../../pages/InventoryPage';
import cartPage from '../../pages/CartPage';
import header from '../../pages/components/Header';
import { findProducts } from '../../support/utils';

const productNames = (table) => table.hashes().map((row) => row.product);

const rememberSelection = (names) => cy.wrap(names).as('selectedProducts');

When('I add the following products to the cart:', (table) => {
  const names = productNames(table);
  names.forEach((name) => inventoryPage.addToCart(name));
  rememberSelection(names);
});

When('I add {string} to the cart', (productName) => {
  inventoryPage.addToCart(productName);
  rememberSelection([productName]);
});

Given('my cart already contains:', (table) => {
  const names = productNames(table);
  cy.fixture('products').then((catalog) => {
    const ids = findProducts(catalog, names).map(({ id }) => id);
    cy.visitWithCart(inventoryPage.path, ids);
  });
  rememberSelection(names);
});

When('I open the cart', () => {
  header.openCart();
  cy.location('pathname').should('eq', cartPage.path);
});

When('I remove {string} from the cart', (productName) => {
  cartPage.remove(productName);
});

When('I continue shopping', () => {
  cartPage.continueShopping();
  cy.location('pathname').should('eq', inventoryPage.path);
});

Then('the cart counter should show {int}', (count) => {
  header.elements.cartBadge().should('have.text', String(count));
});

Then('the cart counter should not be displayed', () => {
  header.elements.cartLink().should('be.visible');
  header.elements.cartBadge().should('not.exist');
});

Then('the added products should be marked as in the cart', () => {
  cy.get('@selectedProducts').each((productName) => {
    inventoryPage.elements.removeButton(productName).should('be.visible').and('have.text', 'Remove');
  });
});

Then('the cart should list each selected product with quantity {int} and its catalog price', (quantity) => {
  cy.fixture('products').then((catalog) => {
    cy.get('@selectedProducts').then((names) => {
      const expected = findProducts(catalog, names).map(({ name, price }) => ({ name, quantity, price }));
      cartPage.elements.rows().should('have.length', expected.length);
      cartPage.lines().should('have.deep.members', expected);
    });
  });
});

Then('the cart should only contain {string}', (productName) => {
  cy.location('pathname').should('eq', cartPage.path);
  cartPage.elements.rows().should('have.length', 1);
  cartPage.lines().its('0.name').should('equal', productName);
});
