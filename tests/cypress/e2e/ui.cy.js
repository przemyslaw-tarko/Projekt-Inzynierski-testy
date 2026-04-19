describe('UI - Core User Flows (Cypress)', () => {
  function addFirstProductToCart() {
    cy.visit('/shop');
    cy.get('a.add_to_cart_button').first().click();
    cy.get('.woocommerce-message, a.added_to_cart').should('be.visible');
  }

  function clearCart() {
    cy.visit('/cart');
    return cy.get('body').then(($body) => {
      if ($body.find('.cart_item a.remove').length) {
        cy.get('.cart_item a.remove').first().click();
        cy.get('.woocommerce-message, .cart-empty').should('be.visible');
        return clearCart();
      }
      cy.get('.cart-empty, .woocommerce-message').first().should('be.visible');
      return undefined;
    });
  }

  it('[C46] home page loads and title contains "Test App"', () => {
    cy.visit('/');
    cy.title().should('match', /Test App/i);
  });

  it('[C47] shop page shows product list', () => {
    cy.visit('/shop');
    cy.get('.products').should('be.visible');
    cy.get('.products .product').first().should('be.visible');
    cy.get('.products .product').its('length').should('be.greaterThan', 0);
  });

  it('[C48] product page shows title and price', () => {
    cy.visit('/shop');
    cy.get('.products .product a').first().click();
    cy.get('.product_title').should('be.visible');
    cy.get('.summary .price').should('be.visible');
  });

  it('[C49] add to cart from shop and verify in cart', () => {
    addFirstProductToCart();
    cy.visit('/cart');
    cy.get('.cart_item').should('have.length.at.least', 1);
  });

  it('[C50] remove product from cart', () => {
    clearCart();
    addFirstProductToCart();
    cy.visit('/cart');
    cy.get('.cart_item a.remove').first().click();
    cy.get('.cart-empty, .woocommerce-message').first().should('be.visible');
  });

  it('[C51] cart persists after refresh', () => {
    clearCart();
    addFirstProductToCart();
    cy.visit('/cart');
    cy.reload();
    cy.get('.cart_item').should('have.length.at.least', 1);
  });

  it('[C52] checkout shows validation errors for empty required fields', () => {
    clearCart();
    addFirstProductToCart();
    cy.visit('/checkout');
    cy.get('#place_order, button[name="woocommerce_checkout_place_order"]').should('be.visible');
    cy.contains('button', 'Place order').click({ force: true });
    cy.get('body').should('contain.text', 'The card number is incomplete');
  });

  it('[C53] search for "astronomy" returns results', () => {
    cy.visit('/shop');
    cy.get('input[type="search"], input[name="s"]').type('astronomy{enter}');
    cy.location('search').should('include', 's=');
    cy.get('.products').should('be.visible');
    cy.get('.products .product').first().should('be.visible');
  });

  it('[C54] sort by price: low to high', () => {
    cy.visit('/shop');
    cy.get('select[name="orderby"]').should('be.visible').select('price');
    cy.location('search').should('include', 'orderby=price');
    cy.get('.products .product .price').first().should('be.visible');
  });

  it('[C55] product images are visible on shop', () => {
    cy.visit('/shop');
    cy.get('.products .product img').first().scrollIntoView().should('be.visible');
  });

  it('[C56] 404 page for missing route', () => {
    cy.visit('/this-page-should-not-exist', { failOnStatusCode: false });
    cy.get('body').should('contain.text', 'Oops');
  });

  it('[C57]  mobile viewport basic layout', () => {
    cy.viewport(375, 667);
    cy.visit('/');
    cy.get('#main').should('be.visible');
  });
});
