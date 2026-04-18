#!/usr/bin/env node
const { spawnSync } = require('node:child_process');

const composeScript = ['scripts/compose.js', 'all'];

function runNode(args) {
  const result = spawnSync(process.execPath, args, {
    stdio: 'inherit',
    env: process.env
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

runNode([...composeScript, 'rm', '-sf', 'selenium-tests', 'selenium-chrome']);
runNode([
  ...composeScript,
  'up',
  '--abort-on-container-exit',
  '--exit-code-from',
  'selenium-tests',
  'selenium-tests'
]);
