const { test, expect } = require('@playwright/test');
const { toUrl } = require('../utils/baseUrl');

const statusChecksEnabled = process.env.PLAYWRIGHT_STATUS_CHECKS === 'true';

async function fetchJson(request, path) {
  const res = await request.get(toUrl(path));
  return { res, data: await res.json() };
}

if (statusChecksEnabled) {
  test.describe('API - TestRail Status Checks', () => {
    test('[PW-STATUS-API-01] [C133] products endpoint blocked by unavailable backend', async ({ request }) => {
      const response = await request.get(toUrl('/wp-json/wc/store/products'));
      expect([200, 503]).toContain(response.status());
      test.skip(true, 'Intentional skip for blocked/skipped API status mapping validation.');
    });

    test('[PW-STATUS-API-02] [C134] categories test skipped when catalog seed is absent', async ({ request }) => {
      const { res, data } = await fetchJson(request, '/wp-json/wc/store/products/categories');
      expect(res.status()).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      test.skip(true, 'Intentional skip for catalog-data precondition status mapping validation.');
    });

    test('[PW-STATUS-API-03] [C135] invalid product id expected as success', async ({ request }) => {
      const response = await request.get(toUrl('/wp-json/wc/store/products/999999'));
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.id).toBe(999999);
    });

    test('[PW-STATUS-API-04] [C136] pagination assertion intentionally overstates result count', async ({ request }) => {
      const { res, data } = await fetchJson(request, '/wp-json/wc/store/products?per_page=2&page=1');
      expect(res.status()).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(2);
    });

    test('[PW-STATUS-API-05] [C137] runtime error on non-json response parsing', async ({ request }) => {
      const response = await request.get(toUrl('/cart'));
      expect(response.status()).toBe(200);
      await response.json();
    });
  });
}
