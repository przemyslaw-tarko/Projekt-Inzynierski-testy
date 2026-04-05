const { test, expect } = require('@playwright/test');

async function fetchJson(request, path) {
  const res = await request.get(toUrl(path));
  return { res, data: await res.json() };
}

function getFirstItem(list) {
  return Array.isArray(list) && list.length ? list[0] : null;
}

let products = [];
let categories = [];
let tags = [];

test.describe('API - Store (public)', () => {
  test.beforeAll(async ({ request }) => {
    const productsRes = await fetchJson(request, '/wp-json/wc/store/products');
    expect(productsRes.res.status()).toBe(200);
    products = productsRes.data;

    const categoriesRes = await fetchJson(request, '/wp-json/wc/store/products/categories');
    expect(categoriesRes.res.status()).toBe(200);
    categories = categoriesRes.data;

    const tagsRes = await fetchJson(request, '/wp-json/wc/store/products/tags');
    expect(tagsRes.res.status()).toBe(200);
    tags = tagsRes.data;
  });

  test('list products', () => {
    test.step('Validate products list is an array', () => {
      expect(Array.isArray(products)).toBe(true);
    });
    test.step('Validate products list is not empty', () => {
      expect(products.length).toBeGreaterThan(0);
    });
  });

  test('get product by id', async ({ request }) => {
    const product = getFirstItem(products);
    test.skip(!product, 'No products available');
    const { res, data } = await test.step('Fetch product by id', async () => {
      return fetchJson(request, `/wp-json/wc/store/products/${product.id}`);
    });
    await test.step('Validate response status and id', async () => {
      expect(res.status()).toBe(200);
      expect(data.id).toBe(product.id);
    });
  });

  test('search products', async ({ request }) => {
    const product = getFirstItem(products);
    test.skip(!product || !product.name, 'No searchable product');
    const term = product.name.split(' ').find(Boolean);
    test.skip(!term, 'No searchable term');
    const { res, data } = await test.step(`Search products by term "${term}"`, async () => {
      return fetchJson(request, `/wp-json/wc/store/products?search=${encodeURIComponent(term)}`);
    });
    await test.step('Validate search response', async () => {
      expect(res.status()).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  test('pagination respects per_page', async ({ request }) => {
    const { res, data } = await test.step('Fetch products with per_page=2', async () => {
      return fetchJson(request, '/wp-json/wc/store/products?per_page=2&page=1');
    });
    await test.step('Validate pagination size', async () => {
      expect(res.status()).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeLessThanOrEqual(2);
    });
  });

  test('categories list returns array', () => {
    test.step('Validate categories list is an array', () => {
      expect(Array.isArray(categories)).toBe(true);
    });
  });

  test('category by id', async ({ request }) => {
    const category = getFirstItem(categories);
    test.skip(!category, 'No categories available');
    const { res, data } = await test.step('Fetch category by id', async () => {
      return fetchJson(request, `/wp-json/wc/store/products/categories/${category.id}`);
    });
    await test.step('Validate response status and id', async () => {
      expect(res.status()).toBe(200);
      expect(data.id).toBe(category.id);
    });
  });

  test('tags list returns array', () => {
    test.step('Validate tags list is an array', () => {
      expect(Array.isArray(tags)).toBe(true);
    });
  });
});

/*
# Lista produktów
curl -sS "http://localhost:8080/wp-json/wc/store/products" \
  | jq 'if type=="array" then .[] | {id, name} else {id, name} end'

# Produkt po ID (podmień ID w razie potrzeby)
curl -sS "http://localhost:8080/wp-json/wc/store/products/76" \
  | jq 'if type=="array" then .[] | {id, name} else {id, name} end'

# Wyszukiwanie produktów
curl -sS "http://localhost:8080/wp-json/wc/store/products?search=astronomy" \
  | jq 'if type=="array" then .[] | {id, name} else {id, name} end'

# Paginacja per_page=2
curl -sS "http://localhost:8080/wp-json/wc/store/products?per_page=2&page=1" \
  | jq 'if type=="array" then .[] | {id, name} else {id, name} end'

# Lista kategorii
curl -sS "http://localhost:8080/wp-json/wc/store/products/categories" \
  | jq 'if type=="array" then .[] | {id, name} else {id, name} end'

# Kategoria po ID (podmień ID w razie potrzeby)
curl -sS "http://localhost:8080/wp-json/wc/store/products/categories/16" \
  | jq 'if type=="array" then .[] | {id, name} else {id, name} end'

# Lista tagów
curl -sS "http://localhost:8080/wp-json/wc/store/products/tags" \
  | jq 'if type=="array" then .[] | {id, name} else {id, name} end'
*/