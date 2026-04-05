#!/usr/bin/env node
const { spawn } = require('node:child_process');

const steps = [
  { name: 'selenium', cmd: ['node', 'scripts/compose.js', 'all', 'run', '--rm', 'selenium-tests'] },
  { name: 'cypress', cmd: ['node', 'scripts/compose.js', 'all', 'run', '--rm', 'cypress-tests'] },
  { name: 'playwright', cmd: ['node', 'scripts/compose.js', 'all', 'run', '--rm', 'playwright-tests'] }
];

async function runStep(step) {
  return new Promise((resolve, reject) => {
    const [command, ...args] = step.cmd;
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', (code) => {
      if (code === 0) return resolve();
      return reject(new Error(`${step.name} failed with exit code ${code}`));
    });
  });
}

async function runCommand(name, cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit' });
    child.on('close', (code) => {
      if (code === 0) return resolve();
      return reject(new Error(`${name} failed with exit code ${code}`));
    });
  });
}

(async () => {
  process.stdout.write('\n==> Starting app stack\n');
  await runCommand('app up', 'node', ['scripts/compose.js', 'app', 'up', '-d']);
  process.stdout.write('\n==> Waiting for app readiness\n');
  await runCommand('wait for app', 'node', ['scripts/wait-for-app.js']);

  try {
    for (const step of steps) {
      process.stdout.write(`\n==> Running ${step.name} tests\n`);
      await runStep(step);
    }
    process.stdout.write('\nAll test suites completed.\n');
  } finally {
    process.stdout.write('\n==> Tearing down app stack\n');
    await runCommand('app down', 'node', ['scripts/compose.js', 'all', 'down', '--remove-orphans']);
  }
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
