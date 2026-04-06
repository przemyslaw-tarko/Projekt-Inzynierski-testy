#!/usr/bin/env node
const dotenv = require('dotenv');
const path = require('node:path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const appPort = process.env.APP_PORT || '8080';
const baseUrl = process.env.BASE_URL || `http://localhost:${appPort}`;
const verbose = process.env.VERBOSE_LOGS === 'true';
const timeoutMs = 180000;
const intervalMs = 3000;
let lastStatus = null;

const start = Date.now();

async function check() {
  try {
    const res = await fetch(baseUrl, { method: 'GET' });
    lastStatus = res.status;
    if (res.status >= 200 && res.status < 400) return true;
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
  const statusInfo = lastStatus ? ` (last status: ${lastStatus})` : '';
  process.stdout.write(`\nTimeout waiting for app${statusInfo}.\n`);
  process.exit(1);
})();
