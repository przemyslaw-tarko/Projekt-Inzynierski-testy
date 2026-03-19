#!/usr/bin/env node
const { spawn } = require('node:child_process');

const baseComposeArgs = [
  'compose',
  '--project-directory',
  process.cwd(),
  '-f',
  'apps/bookstore/docker-compose.yml',
  '-f',
  'docker-compose.tests.yml'
];

const steps = [
  { name: 'selenium', cmd: ['docker', ...baseComposeArgs, 'run', '--rm', 'selenium-tests'] },
  { name: 'cypress', cmd: ['docker', ...baseComposeArgs, 'run', '--rm', 'cypress-tests'] },
  { name: 'playwright', cmd: ['docker', ...baseComposeArgs, 'run', '--rm', 'playwright-tests'] }
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

(async () => {
  for (const step of steps) {
    process.stdout.write(`\n==> Running ${step.name} tests\n`);
    await runStep(step);
  }
  process.stdout.write('\nAll test suites completed.\n');
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
