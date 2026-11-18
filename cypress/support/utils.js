export const parseAmount = (text) => Number(String(text).replace(/[^0-9.]/g, ''));

export const toTestIdSegment = (name) => name.replace(/\s+/g, '-').toLowerCase();

export const roundCurrency = (amount) => Math.round(amount * 100) / 100;

export const findProducts = (catalog, names) =>
  names.map((name) => {
    const product = catalog.find((item) => item.name === name);
    if (!product) {
      throw new Error(`"${name}" is not listed in fixtures/products.json`);
    }
    return product;
  });
