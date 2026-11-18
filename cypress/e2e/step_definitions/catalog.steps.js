import { Given, When, Then, defineParameterType } from '@badeball/cypress-cucumber-preprocessor';
import inventoryPage from '../../pages/InventoryPage';
import productDetailPage from '../../pages/ProductDetailPage';
import { findProducts, parseAmount } from '../../support/utils';

const SORT_CRITERIA = {
  nombre: 'name',
  precio: 'price',
};

const SORT_DIRECTIONS = ['ascendente', 'descendente'];

const IMAGE_POSITIONS = {
  'arriba de': 'above',
  'a la izquierda de': 'beside',
};

defineParameterType({
  name: 'imagePosition',
  regexp: new RegExp(Object.keys(IMAGE_POSITIONS).join('|')),
  transformer: (label) => IMAGE_POSITIONS[label],
});

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

Then('veo todos los productos de la tienda con su precio', () => {
  cy.fixture('products').then((catalog) => {
    const expected = catalog.map(({ name, price }) => ({ name, price }));
    inventoryPage.elements.cards().should('have.length', expected.length);
    inventoryPage.products().should('have.deep.members', expected);
  });
});

When('ordeno los productos por {string}', (optionLabel) => {
  inventoryPage.sortBy(optionLabel);
});

Then('los productos quedan ordenados por {word} en orden {word}', (criterionLabel, direction) => {
  const criterion = SORT_CRITERIA[criterionLabel];
  if (!criterion || !SORT_DIRECTIONS.includes(direction)) {
    throw new Error(`Unsupported sort expectation: ${criterionLabel} ${direction}`);
  }

  SORTABLE_ELEMENTS[criterion]().should(($elements) => {
    const actual = Cypress._.map($elements, SORT_READERS[criterion]);
    const expected = [...actual].sort(SORT_COMPARATORS[criterion]);
    if (direction === 'descendente') {
      expected.reverse();
    }
    expect(actual).to.deep.equal(expected);
  });
});

When('abro el detalle de {string}', (productName) => {
  inventoryPage.openProduct(productName);
  cy.location('pathname').should('eq', productDetailPage.path);
  cy.wrap(productName).as('viewedProduct');
});

Then('veo el nombre y el precio que muestra el catálogo para ese producto', () => {
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

When('vuelvo a los productos', () => {
  productDetailPage.backToProducts();
});

Given('que uso una pantalla de {string}', (device) => {
  cy.fixture('devices').then((devices) => {
    const viewport = devices[device];
    if (!viewport) {
      throw new Error(`Device "${device}" is not defined in fixtures/devices.json`);
    }
    cy.viewport(viewport.width, viewport.height);
  });
});

Then('los productos se muestran en {int} columna(s)', (columns) => {
  inventoryPage.elements.cards().should(($cards) => {
    const firstRowTop = Math.round($cards[0].getBoundingClientRect().top);
    const firstRow = Cypress._.filter(
      $cards,
      (card) => Math.round(card.getBoundingClientRect().top) === firstRowTop,
    );
    expect(firstRow, 'cards in the first row').to.have.length(columns);
  });
});

Then('la imagen de cada producto queda {imagePosition} su descripción', (position) => {
  const check = IMAGE_POSITION_CHECKS[position];

  inventoryPage.elements.cards().should(($cards) => {
    Cypress._.each($cards, (card) => {
      const image = card.querySelector('[data-test$="-img-link"]').getBoundingClientRect();
      const details = card.querySelector('[data-test="inventory-item-description"]').getBoundingClientRect();
      check(image, details);
    });
  });
});
