#!/usr/bin/env node
const dotenv = require('dotenv');
const path = require('node:path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
const verbose = process.env.VERBOSE_LOGS === 'true';
const timeoutMs = 180000;
const intervalMs = 3000;

const start = Date.now();

async function check() {
  try {
    const res = await fetch(baseUrl, { method: 'GET' });
    if (res.ok) return true;
  } catch (err) {
    return false;
  }
  return false;
}

(async () => {
  if (verbose) process.stdout.write(`Waiting for app at ${baseUrl}\n`);
  while (Date.now() - start < timeoutMs) {
    const ok = await check();
    if (ok) {
      if (verbose) process.stdout.write('App is ready.\n');
      process.exit(0);
    }
    if (verbose) process.stdout.write('.');
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  process.stdout.write('\nTimeout waiting for app.\n');
  process.exit(1);
})();
