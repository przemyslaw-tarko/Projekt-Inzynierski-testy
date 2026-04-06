const defaultBaseUrl = 'http://wordpress';

function normalizeBaseUrl(value) {
  if (!value) return defaultBaseUrl;
  return value.replace(/\/+$/, '');
}

function toUrl(pathname = '/') {
  const baseUrl = normalizeBaseUrl(process.env.BASE_URL);
  if (!pathname) return baseUrl;
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${baseUrl}${normalizedPath}`;
}

module.exports = {
  toUrl
};
