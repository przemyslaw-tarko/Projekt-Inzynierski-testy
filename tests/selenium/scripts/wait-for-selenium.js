#!/usr/bin/env node
const http = require('node:http');
const https = require('node:https');

const remoteUrl = process.env.SELENIUM_REMOTE_URL || 'http://selenium-chrome:4444';
const verbose = process.env.VERBOSE_LOGS === 'true';
const timeoutMs = 120000;
const intervalMs = 3000;

function toStatusUrl(url) {
  return `${url.replace(/\/+$/, '')}/status`;
}

function requestJson(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ statusCode: res.statusCode, body: null });
        }
      });
    });
    req.on('error', () => resolve({ statusCode: null, body: null }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ statusCode: null, body: null });
    });
  });
}

function describeBusyGrid(body) {
  const sessions = body?.value?.nodes
    ?.flatMap((node) => node.slots || [])
    .filter((slot) => slot.session?.sessionId)
    .map((slot) => slot.session.sessionId);

  if (!sessions?.length) return null;
  return `busy sessions: ${sessions.join(', ')}`;
}

(async () => {
  const statusUrl = toStatusUrl(remoteUrl);
  const start = Date.now();
  let lastMessage = null;

  if (verbose) process.stdout.write(`Waiting for Selenium at ${statusUrl}\n`);

  while (Date.now() - start < timeoutMs) {
    const { statusCode, body } = await requestJson(statusUrl);
    const ready = statusCode === 200 && body?.value?.ready === true;
    if (ready) {
      if (verbose) process.stdout.write('Selenium ready.\n');
      process.exit(0);
    }
    lastMessage =
      body?.value?.message ||
      describeBusyGrid(body) ||
      (statusCode ? `status ${statusCode}` : 'no response');
    if (verbose) process.stdout.write('.');
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  process.stdout.write(`\nTimeout waiting for Selenium. Last status: ${lastMessage || 'unknown'}.\n`);
  process.exit(1);
})();
