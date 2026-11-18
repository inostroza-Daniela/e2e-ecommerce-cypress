import header from './components/Header';
import { parseAmount, toTestIdSegment } from '../support/utils';

const field = (card, testId) => card.querySelector(`[data-test="${testId}"]`).innerText.trim();

class InventoryPage {
  path = '/inventory.html';
  header = header;

  elements = {
    list: () => cy.getByTestId('inventory-list'),
    cards: (options) => cy.getByTestId('inventory-item', options),
    names: () => cy.getByTestId('inventory-item-name'),
    prices: () => cy.getByTestId('inventory-item-price'),
    sortSelect: () => cy.getByTestId('product-sort-container'),
    addToCartButton: (name) => cy.getByTestId(`add-to-cart-${toTestIdSegment(name)}`),
    removeButton: (name) => cy.getByTestId(`remove-${toTestIdSegment(name)}`),
    productLink: (name) => cy.contains('[data-test="inventory-item-name"]', name),
  };

  visit(options) {
    cy.visitRoute(this.path, options);
    return this;
  }

  addToCart(name) {
    this.elements.addToCartButton(name).click();
    return this;
  }

  sortBy(optionLabel) {
    this.elements.sortSelect().select(optionLabel);
    return this;
  }

  openProduct(name) {
    this.elements.productLink(name).click();
    return this;
  }

  products() {
    return this.elements.cards().then(($cards) =>
      Cypress._.map($cards, (card) => ({
        name: field(card, 'inventory-item-name'),
        price: parseAmount(field(card, 'inventory-item-price')),
      })),
    );
  }
}

export default new InventoryPage();
