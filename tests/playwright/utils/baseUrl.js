const DEFAULT_BASE_URL = 'http://wordpress';

function normalizeBaseUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return DEFAULT_BASE_URL;
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

function normalizePath(path) {
  if (!path) return '';
  return path.startsWith('/') ? path : `/${path}`;
}

function toUrl(path) {
  const base = normalizeBaseUrl(process.env.BASE_URL);
  const suffix = normalizePath(path);
  return `${base}${suffix}`;
}

module.exports = { toUrl };
