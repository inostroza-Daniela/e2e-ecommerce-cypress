import header from './components/Header';

class CheckoutPage {
  paths = {
    information: '/checkout-step-one.html',
    overview: '/checkout-step-two.html',
    complete: '/checkout-complete.html',
  };

  header = header;

  elements = {
    firstName: () => cy.getByTestId('firstName'),
    lastName: () => cy.getByTestId('lastName'),
    postalCode: () => cy.getByTestId('postalCode'),
    continueButton: () => cy.getByTestId('continue'),
    cancelButton: () => cy.getByTestId('cancel'),
    error: () => cy.getByTestId('error'),
    overviewItemNames: () =>
      cy.getByTestId('checkout-summary-container').find('[data-test="inventory-item-name"]'),
    itemTotal: () => cy.getByTestId('subtotal-label'),
    tax: () => cy.getByTestId('tax-label'),
    total: () => cy.getByTestId('total-label'),
    finishButton: () => cy.getByTestId('finish'),
    confirmationHeader: () => cy.getByTestId('complete-header'),
    confirmationText: () => cy.getByTestId('complete-text'),
    backHomeButton: () => cy.getByTestId('back-to-products'),
  };

  fillInformation({ firstName, lastName, postalCode }) {
    const values = { firstName, lastName, postalCode };

    Object.entries(values)
      .filter(([, value]) => Boolean(value))
      .forEach(([name, value]) => this.elements[name]().type(value));

    return this;
  }

  continue() {
    this.elements.continueButton().click();
    return this;
  }

  cancel() {
    this.elements.cancelButton().click();
    return this;
  }

  finish() {
    this.elements.finishButton().click();
    return this;
  }

  overviewProductNames() {
    return this.elements
      .overviewItemNames()
      .then(($names) => Cypress._.map($names, (el) => el.innerText.trim()));
  }
}

export default new CheckoutPage();
