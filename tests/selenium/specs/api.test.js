const assert = require('node:assert');

const baseUrl = process.env.BASE_URL || 'http://wordpress';

async function fetchJson(path) {
  const res = await fetch(`${baseUrl}${path}`);
  return { res, data: await res.json() };
}

function getFirstItem(list) {
  return Array.isArray(list) && list.length ? list[0] : null;
}

describe('API - Store (public) (Selenium)', function () {
  this.timeout(30000);

  let products = [];
  let categories = [];
  let tags = [];

  before(async () => {
    const productsRes = await fetchJson('/wp-json/wc/store/products');
    assert.strictEqual(productsRes.res.status, 200);
    products = productsRes.data;

    const categoriesRes = await fetchJson('/wp-json/wc/store/products/categories');
    assert.strictEqual(categoriesRes.res.status, 200);
    categories = categoriesRes.data;

    const tagsRes = await fetchJson('/wp-json/wc/store/products/tags');
    assert.strictEqual(tagsRes.res.status, 200);
    tags = tagsRes.data;
  });

  it('list products', () => {
    assert.ok(Array.isArray(products));
    assert.ok(products.length > 0);
  });

  it('get product by id', async function () {
    const product = getFirstItem(products);
    if (!product) this.skip();
    const { res, data } = await fetchJson(`/wp-json/wc/store/products/${product.id}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.id, product.id);
  });

  it('search products', async function () {
    const product = getFirstItem(products);
    const term = product && product.name ? product.name.split(' ').find(Boolean) : null;
    if (!term) this.skip();
    const { res, data } = await fetchJson(
      `/wp-json/wc/store/products?search=${encodeURIComponent(term)}`
    );
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(data));
    assert.ok(data.length > 0);
  });

  it('pagination respects per_page', async () => {
    const { res, data } = await fetchJson('/wp-json/wc/store/products?per_page=2&page=1');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(data));
    assert.ok(data.length <= 2);
  });

  it('categories list returns array', () => {
    assert.ok(Array.isArray(categories));
  });

  it('category by id', async function () {
    const category = getFirstItem(categories);
    if (!category) this.skip();
    const { res, data } = await fetchJson(
      `/wp-json/wc/store/products/categories/${category.id}`
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.id, category.id);
  });

  it('tags list returns array', () => {
    assert.ok(Array.isArray(tags));
  });
});
