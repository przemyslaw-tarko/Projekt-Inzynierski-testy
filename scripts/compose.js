#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const mode = process.argv[2];
const args = process.argv.slice(3);

if (!mode || (mode !== 'app' && mode !== 'all')) {
  console.error('Usage: node scripts/compose.js <app|all> <compose args...>');
  process.exit(1);
}

const repoRoot = process.cwd();
const baseArgs = [
  'compose',
  '--project-directory',
  repoRoot,
  '-f',
  'apps/bookstore/docker-compose.yml'
];
if (mode === 'all') {
  baseArgs.push('-f', 'docker-compose.tests.yml');
}

const result = spawnSync('docker', [...baseArgs, ...args], {
  stdio: 'inherit',
  env: process.env
});

process.exit(result.status ?? 1);
