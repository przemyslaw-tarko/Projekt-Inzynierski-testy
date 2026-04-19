describe('UI - TestRail Status Checks (Cypress)', () => {
  function addFirstProductToCart() {
    cy.visit('/shop');
    cy.get('a.add_to_cart_button').first().click();
    cy.get('.woocommerce-message, a.added_to_cart').should('be.visible');
  }

  it('[PW-STATUS-UI-01] [C128] shop blocked by maintenance page', function () {
    this.skip();
  });

  it('[PW-STATUS-UI-02] [C129] checkout blocked by missing Stripe dependency', function () {
    this.skip();
  });

  it('[PW-STATUS-UI-03] [C130] add to cart count intentionally fails', () => {
    addFirstProductToCart();
    cy.visit('/cart');
    cy.get('.cart_item').should('have.length', 2);
  });

  it('[PW-STATUS-UI-04] [C131] search result forced failure', () => {
    cy.visit('/shop');
    cy.get('input[type="search"], input[name="s"]').type('zzzz-unlikely-term{enter}');
    cy.get('.products .product').first().should('be.visible');
  });

  it('[PW-STATUS-UI-05] [C132] runtime error while reading product details', () => {
    cy.visit('/shop');
    cy.get('.products .product a').first().click();
    cy.get('.product_title').should('be.visible');
    cy.then(() => {
      throw new Error('Intentional Cypress UI runtime error for TestRail status validation.');
    });
  });
});
