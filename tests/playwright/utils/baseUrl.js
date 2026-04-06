const fs = require('fs');

const isDocker = fs.existsSync('/.dockerenv') || process.env.DOCKER === 'true';
const defaultBaseUrl = isDocker ? 'http://wordpress' : 'http://localhost:8080';
const baseUrl = process.env.BASE_URL || defaultBaseUrl;

function toUrl(path) {
  if (!path) return baseUrl;
  if (/^https?:\/\//i.test(path)) return path;
  return `${baseUrl.replace(/\/$/, '')}${path}`;
}

module.exports = { toUrl, baseUrl };
