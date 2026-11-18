import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import inventoryPage from '../../pages/InventoryPage';
import productDetailPage from '../../pages/ProductDetailPage';
import { findProducts, parseAmount } from '../../support/utils';

const SORT_READERS = {
  name: (el) => el.innerText.trim(),
  price: (el) => parseAmount(el.innerText),
};

const SORT_COMPARATORS = {
  name: (a, b) => a.localeCompare(b),
  price: (a, b) => a - b,
};

const IMAGE_POSITION_CHECKS = {
  above: (image, details) => expect(image.bottom, 'image bottom edge').to.be.at.most(details.top + 1),
  beside: (image, details) => expect(image.right, 'image right edge').to.be.at.most(details.left + 1),
};

const SORTABLE_ELEMENTS = {
  name: () => inventoryPage.elements.names(),
  price: () => inventoryPage.elements.prices(),
};

Then('I should see every product in the store with its price', () => {
  cy.fixture('products').then((catalog) => {
    const expected = catalog.map(({ name, price }) => ({ name, price }));
    inventoryPage.elements.cards().should('have.length', expected.length);
    inventoryPage.products().should('have.deep.members', expected);
  });
});

When('I sort the products by {string}', (optionLabel) => {
  inventoryPage.sortBy(optionLabel);
});

Then('the products should be ordered by {word} in {word} order', (criterion, direction) => {
  if (!SORT_READERS[criterion] || !['ascending', 'descending'].includes(direction)) {
    throw new Error(`Unsupported sort expectation: ${criterion} ${direction}`);
  }

  SORTABLE_ELEMENTS[criterion]().should(($elements) => {
    const actual = Cypress._.map($elements, SORT_READERS[criterion]);
    const expected = [...actual].sort(SORT_COMPARATORS[criterion]);
    if (direction === 'descending') {
      expected.reverse();
    }
    expect(actual).to.deep.equal(expected);
  });
});

When('I open the details of {string}', (productName) => {
  inventoryPage.openProduct(productName);
  cy.location('pathname').should('eq', productDetailPage.path);
  cy.wrap(productName).as('viewedProduct');
});

Then('I should see the name and price listed in the catalog for that product', () => {
  cy.fixture('products').then((catalog) => {
    cy.get('@viewedProduct').then((productName) => {
      const [product] = findProducts(catalog, [productName]);
      productDetailPage.elements.name().should('have.text', product.name);
      productDetailPage.elements.description().invoke('text').should('not.be.empty');
      productDetailPage.elements
        .price()
        .invoke('text')
        .then(parseAmount)
        .should('equal', product.price);
    });
  });
});

When('I go back to the products', () => {
  productDetailPage.backToProducts();
});

Given('I am using a {string} screen', (device) => {
  cy.fixture('devices').then((devices) => {
    const viewport = devices[device];
    if (!viewport) {
      throw new Error(`Device "${device}" is not defined in fixtures/devices.json`);
    }
    cy.viewport(viewport.width, viewport.height);
  });
});

Then('the products should be displayed in {int} column(s)', (columns) => {
  inventoryPage.elements.cards().should(($cards) => {
    const firstRowTop = Math.round($cards[0].getBoundingClientRect().top);
    const firstRow = Cypress._.filter(
      $cards,
      (card) => Math.round(card.getBoundingClientRect().top) === firstRowTop,
    );
    expect(firstRow, 'cards in the first row').to.have.length(columns);
  });
});

Then('each product image should be placed {word} its details', (position) => {
  const check = IMAGE_POSITION_CHECKS[position];
  if (!check) {
    throw new Error(`Unsupported image position "${position}"`);
  }

  inventoryPage.elements.cards().should(($cards) => {
    Cypress._.each($cards, (card) => {
      const image = card.querySelector('img[data-test$="-img"]').getBoundingClientRect();
      const details = card.querySelector('[data-test="inventory-item-description"]').getBoundingClientRect();
      check(image, details);
    });
  });
});
