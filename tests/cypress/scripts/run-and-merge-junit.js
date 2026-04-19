#!/usr/bin/env node
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const junitDir = path.resolve(__dirname, '..', '..', '..', 'reports', 'cypress', 'junit');
const finalResults = path.join(junitDir, 'results.xml');

function ensureDir() {
  fs.mkdirSync(junitDir, { recursive: true });
}

function isJunitFile(fileName) {
  return /^results(?:[.-].+)?\.xml$/.test(fileName);
}

function isIntermediateJunitFile(fileName) {
  return /^results[.-].+\.xml$/.test(fileName);
}

function cleanOldReports() {
  ensureDir();

  for (const fileName of fs.readdirSync(junitDir)) {
    if (!isJunitFile(fileName)) continue;
    fs.unlinkSync(path.join(junitDir, fileName));
  }
}

function listIntermediateXml() {
  return fs
    .readdirSync(junitDir)
    .filter((fileName) => isIntermediateJunitFile(fileName))
    .map((fileName) => path.join(junitDir, fileName))
    .sort();
}

function extractTestSuites(xml) {
  return xml.match(/<testsuite\b[\s\S]*?<\/testsuite>/g) || [];
}

function mergeJUnit() {
  const intermediateFiles = listIntermediateXml();

  if (!intermediateFiles.length) {
    process.stderr.write('WARNING: No intermediate JUnit files found for Cypress.\n');
    return false;
  }

  const suites = [];

  for (const filePath of intermediateFiles) {
    const xml = fs.readFileSync(filePath, 'utf8');
    const extractedSuites = extractTestSuites(xml);

    if (!extractedSuites.length) {
      process.stderr.write(`WARNING: No <testsuite> found in ${path.basename(filePath)}\n`);
      continue;
    }

    suites.push(...extractedSuites);
  }

  if (!suites.length) {
    process.stderr.write('WARNING: No test suites extracted from Cypress JUnit files.\n');
    return false;
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

  process.stdout.write(`Merged ${intermediateFiles.length} JUnit files into ${finalResults}\n`);
  return true;
}

async function run() {
  cleanOldReports();

  const exitCode = await new Promise((resolve) => {
    const child = spawn('npx', ['cypress', 'run'], {
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
    const merged = mergeJUnit();

    if (!merged) {
      process.stderr.write('WARNING: Cypress JUnit merge did not produce results.xml\n');
    } else if (!fs.existsSync(finalResults)) {
      process.stderr.write('WARNING: results.xml was not created\n');
    }
  } catch (err) {
    process.stderr.write(`JUnit merge failed: ${String(err?.message || err)}\n`);
  }

  process.exit(exitCode);
}

run();