#!/usr/bin/env node
const http = require('node:http');
const https = require('node:https');

const baseUrl = process.env.BASE_URL || 'http://wordpress';
const verbose = process.env.VERBOSE_LOGS === 'true';
const timeoutMs = Number(process.env.WAIT_FOR_URL_TIMEOUT_MS) || 300000;
const intervalMs = 3000;

function requestOnce(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, (res) => {
      res.resume();
      resolve(res.statusCode);
    });
    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

(async () => {
  const start = Date.now();
  if (verbose) process.stdout.write(`Waiting for ${baseUrl}\n`);
  while (Date.now() - start < timeoutMs) {
    const status = await requestOnce(baseUrl);
    if (status && (status >= 200 && status < 400)) {
      if (verbose) process.stdout.write('Ready.\n');
      process.exit(0);
    }
    if (verbose) process.stdout.write('.');
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  process.stdout.write('\nTimeout waiting for app.\n');
  process.exit(1);
})();
