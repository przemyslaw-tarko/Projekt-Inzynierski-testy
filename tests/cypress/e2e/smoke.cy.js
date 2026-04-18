describe('Bookstore smoke (Cypress)', () => {
  it('title contains "Test App"', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
    cy.title().should('include', 'Test App');
  });
});
