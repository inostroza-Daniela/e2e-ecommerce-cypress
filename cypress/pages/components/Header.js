class Header {
  elements = {
    title: () => cy.getByTestId('title'),
    cartLink: () => cy.getByTestId('shopping-cart-link'),
    cartBadge: () => cy.getByTestId('shopping-cart-badge'),
    menuButton: () => cy.get('#react-burger-menu-btn'),
    logoutLink: () => cy.getByTestId('logout-sidebar-link'),
  };

  openCart() {
    this.elements.cartLink().click();
  }

  logout() {
    this.elements.menuButton().click();
    this.elements.logoutLink().should('be.visible').click();
  }
}

export default new Header();
