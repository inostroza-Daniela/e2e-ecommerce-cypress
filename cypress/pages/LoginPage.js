class LoginPage {
  path = '/';

  elements = {
    username: () => cy.getByTestId('username'),
    password: () => cy.getByTestId('password'),
    submitButton: () => cy.getByTestId('login-button'),
    error: () => cy.getByTestId('error'),
  };

  visit() {
    cy.visit(this.path);
    return this;
  }

  fillUsername(username) {
    if (username) {
      this.elements.username().type(username);
    }
    return this;
  }

  fillPassword(password) {
    if (password) {
      this.elements.password().type(password, { log: false });
    }
    return this;
  }

  submit() {
    this.elements.submitButton().click();
    return this;
  }

  loginWith(username, password) {
    return this.fillUsername(username).fillPassword(password).submit();
  }
}

export default new LoginPage();
