#!/usr/bin/env node
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const junitDir = path.resolve(__dirname, '..', '..', '..', 'reports', 'cypress', 'junit');
const finalResults = path.join(junitDir, 'results.xml');

function ensureDir() {
  fs.mkdirSync(junitDir, { recursive: true });
}

function cleanOldReports() {
  ensureDir();

  for (const fileName of fs.readdirSync(junitDir)) {
    if (!/^results(\..+)?\.xml$/.test(fileName)) continue;
    fs.unlinkSync(path.join(junitDir, fileName));
  }
}

function listIntermediateXml() {
  return fs
    .readdirSync(junitDir)
    .filter((fileName) => /^results\.[^.]+\.xml$/.test(fileName))
    .map((fileName) => path.join(junitDir, fileName))
    .sort();
}

function extractTestSuites(xml) {
  return xml.match(/<testsuite[\s\S]*?<\/testsuite>/g) || [];
}

function mergeJUnit() {
  const intermediateFiles = listIntermediateXml();

  if (!intermediateFiles.length) {
    process.stderr.write('WARNING: No intermediate JUnit files found for Cypress.\n');
    return;
  }

  const suites = [];
  for (const filePath of intermediateFiles) {
    const xml = fs.readFileSync(filePath, 'utf8');
    suites.push(...extractTestSuites(xml));
  }

  const merged =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<testsuites>\n' +
    suites.map((suite) => `${suite}\n`).join('') +
    '</testsuites>\n';

  fs.writeFileSync(finalResults, merged, 'utf8');

  for (const filePath of intermediateFiles) {
    fs.unlinkSync(filePath);
  }
}

async function run() {
  cleanOldReports();

  const exitCode = await new Promise((resolve) => {
    const child = spawn('cypress', ['run'], {
      stdio: 'inherit',
      env: process.env
    });

    child.on('error', (err) => {
      process.stderr.write(`Cypress spawn failed: ${String(err?.code || err)}\n`);
      resolve(1);
    });

    child.on('close', (code) => {
      resolve(code ?? 1);
    });
  });

  try {
    mergeJUnit();
  } catch (err) {
    process.stderr.write(`JUnit merge failed: ${String(err?.message || err)}\n`);
  }

  process.exit(exitCode);
}

run();
