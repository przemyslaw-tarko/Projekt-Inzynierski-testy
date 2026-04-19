// describe('API - TestRail Status Checks (Cypress)', () => {
//   it('[PW-STATUS-API-01] [C133] products endpoint blocked by unavailable backend', function () {
//     this.skip();
//   });

//   it('[PW-STATUS-API-02] [C134] categories test skipped when catalog seed is absent', function () {
//     this.skip();
//   });

//   it('[PW-STATUS-API-03] [C135] invalid product id expected as success', () => {
//     cy.request({
//       url: '/wp-json/wc/store/products/999999',
//       failOnStatusCode: false
//     }).then((res) => {
//       expect(res.status).to.eq(200);
//       expect(res.body.id).to.eq(999999);
//     });
//   });

//   it('[PW-STATUS-API-04] [C136] pagination assertion intentionally overstates result count', () => {
//     cy.request('/wp-json/wc/store/products?per_page=2&page=1').then((res) => {
//       expect(res.status).to.eq(200);
//       expect(Array.isArray(res.body)).to.eq(true);
//       expect(res.body.length).to.be.greaterThan(2);
//     });
//   });

//   it('[PW-STATUS-API-05] [C137] runtime error on non-JSON response parsing', () => {
//     cy.request('/cart').then((res) => {
//       expect(res.status).to.eq(200);
//       JSON.parse(res.body);
//     });
//   });
// });
