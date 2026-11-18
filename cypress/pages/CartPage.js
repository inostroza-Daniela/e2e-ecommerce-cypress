import header from './components/Header';
import { parseAmount, toTestIdSegment } from '../support/utils';

const field = (row, testId) => row.querySelector(`[data-test="${testId}"]`).innerText.trim();

class CartPage {
  path = '/cart.html';
  header = header;

  elements = {
    list: () => cy.getByTestId('cart-list'),
    rows: () => cy.getByTestId('cart-list').find('[data-test="inventory-item"]'),
    removeButton: (name) => cy.getByTestId(`remove-${toTestIdSegment(name)}`),
    checkoutButton: () => cy.getByTestId('checkout'),
    continueShoppingButton: () => cy.getByTestId('continue-shopping'),
  };

  remove(name) {
    this.elements.removeButton(name).click();
    return this;
  }

  checkout() {
    this.elements.checkoutButton().click();
    return this;
  }

  continueShopping() {
    this.elements.continueShoppingButton().click();
    return this;
  }

  lines() {
    return this.elements.rows().then(($rows) =>
      Cypress._.map($rows, (row) => ({
        name: field(row, 'inventory-item-name'),
        quantity: Number(field(row, 'item-quantity')),
        price: parseAmount(field(row, 'inventory-item-price')),
      })),
    );
  }
}

export default new CartPage();
