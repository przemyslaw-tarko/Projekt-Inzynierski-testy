describe('API - Store (public) (Cypress)', () => {
  let products = [];
  let categories = [];
  let tags = [];

  before(() => {
    cy.request('/wp-json/wc/store/products').then((res) => {
      expect(res.status).to.eq(200);
      products = res.body;
    });

    cy.request('/wp-json/wc/store/products/categories').then((res) => {
      expect(res.status).to.eq(200);
      categories = res.body;
    });

    cy.request('/wp-json/wc/store/products/tags').then((res) => {
      expect(res.status).to.eq(200);
      tags = res.body;
    });
  });

  it('[C58] list products', () => {
    expect(Array.isArray(products)).to.eq(true);
    expect(products.length).to.be.greaterThan(0);
  });

  it('[C59] get product by id', function () {
    const product = Array.isArray(products) && products.length ? products[0] : null;
    if (!product) this.skip();
    cy.request(`/wp-json/wc/store/products/${product.id}`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.id).to.eq(product.id);
    });
  });

  it('[C60] search products', function () {
    const product = Array.isArray(products) && products.length ? products[0] : null;
    const term = product && product.name ? product.name.split(' ').find(Boolean) : null;
    if (!term) this.skip();
    cy.request(`/wp-json/wc/store/products?search=${encodeURIComponent(term)}`).then((res) => {
      expect(res.status).to.eq(200);
      expect(Array.isArray(res.body)).to.eq(true);
      expect(res.body.length).to.be.greaterThan(0);
    });
  });

  it('[C61] pagination respects per_page', () => {
    cy.request('/wp-json/wc/store/products?per_page=2&page=1').then((res) => {
      expect(res.status).to.eq(200);
      expect(Array.isArray(res.body)).to.eq(true);
      expect(res.body.length).to.be.lte(2);
    });
  });

  it('[C62] categories list returns array', () => {
    expect(Array.isArray(categories)).to.eq(true);
  });

  it('[C63] category by id', function () {
    const category = Array.isArray(categories) && categories.length ? categories[0] : null;
    if (!category) this.skip();
    cy.request(`/wp-json/wc/store/products/categories/${category.id}`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.id).to.eq(category.id);
    });
  });

  it('[C64] tags list returns array', () => {
    expect(Array.isArray(tags)).to.eq(true);
  });
});

