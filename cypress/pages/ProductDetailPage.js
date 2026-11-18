class ProductDetailPage {
  path = '/inventory-item.html';

  elements = {
    name: () => cy.getByTestId('inventory-item-name'),
    description: () => cy.getByTestId('inventory-item-desc'),
    price: () => cy.getByTestId('inventory-item-price'),
    addToCartButton: () => cy.getByTestId('add-to-cart'),
    backButton: () => cy.getByTestId('back-to-products'),
  };

  backToProducts() {
    this.elements.backButton().click();
    return this;
  }
}

export default new ProductDetailPage();
