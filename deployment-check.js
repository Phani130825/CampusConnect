#!/usr/bin/env node
/**
 * Deployment Helper Script
 * 
 * This script helps verify your local setup is ready for deployment
 * Run: node deployment-check.js
 */

const fs = require('fs');
const path = require('path');

const CHECKS = [];
let passed = 0;
let failed = 0;

function checkMark() {
  return '\x1b[32m✓\x1b[0m'; // Green checkmark
}

function crossMark() {
  return '\x1b[31m✗\x1b[0m'; // Red X
}

function warning() {
  return '\x1b[33m⚠\x1b[0m'; // Yellow warning
}

function check(name, condition, message = '') {
  const result = condition ? checkMark() : crossMark();
  console.log(`${result} ${name}`);
  if (message) console.log(`  └─ ${message}`);
  condition ? passed++ : failed++;
}

console.log('\n🚀 Connectors Deployment Readiness Check\n');

// 1. Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].slice(1));
check(
  'Node.js Version',
  majorVersion >= 14,
  `Current: ${nodeVersion} (Required: v14+)`
);

// 2. Check Root package.json
const rootPackageExists = fs.existsSync(path.join(__dirname, 'package.json'));
check(
  'Root package.json',
  rootPackageExists,
  rootPackageExists ? 'Found' : 'Missing - Required for monorepo'
);

// 3. Check Server setup
const serverPackageExists = fs.existsSync(path.join(__dirname, 'server', 'package.json'));
const serverDotenvExists = fs.existsSync(path.join(__dirname, 'server', '.env'));
const serverServerExists = fs.existsSync(path.join(__dirname, 'server', 'server.js'));

check(
  'Server package.json',
  serverPackageExists,
  serverPackageExists ? 'Found' : 'Missing'
);

check(
  'Server .env file',
  serverDotenvExists,
  serverDotenvExists ? 'Found' : 'Create from .env.example'
);

check(
  'Server server.js',
  serverServerExists,
  serverServerExists ? 'Found' : 'Missing'
);

// 4. Check keep-alive utility
const keepAliveExists = fs.existsSync(path.join(__dirname, 'server', 'utils', 'keepAlive.js'));
check(
  'Keep-Alive Utility',
  keepAliveExists,
  keepAliveExists ? 'Found (Critical for 24/7 uptime)' : 'Missing'
);

// 5. Check Client setup
const clientPackageExists = fs.existsSync(path.join(__dirname, 'client', 'package.json'));
const clientViteExists = fs.existsSync(path.join(__dirname, 'client', 'vite.config.js'));
const clientVercelExists = fs.existsSync(path.join(__dirname, 'client', 'vercel.json'));

check(
  'Client package.json',
  clientPackageExists,
  clientPackageExists ? 'Found' : 'Missing'
);

check(
  'Client vite.config.js',
  clientViteExists,
  clientViteExists ? 'Found' : 'Missing'
);

check(
  'Client vercel.json',
  clientVercelExists,
  clientVercelExists ? 'Found (Required for Vercel)' : 'Missing'
);

// 6. Check deployment configs
const renderYamlExists = fs.existsSync(path.join(__dirname, 'render.yaml'));
const deploymentGuideExists = fs.existsSync(path.join(__dirname, 'DEPLOYMENT.md'));

check(
  'Render Configuration (render.yaml)',
  renderYamlExists,
  renderYamlExists ? 'Found' : 'Missing'
);

check(
  'Deployment Guide (DEPLOYMENT.md)',
  deploymentGuideExists,
  deploymentGuideExists ? 'Found' : 'Missing'
);

// 7. Check Docker setup (optional but good to have)
const serverDockerExists = fs.existsSync(path.join(__dirname, 'server', 'Dockerfile'));
const clientDockerExists = fs.existsSync(path.join(__dirname, 'client', 'Dockerfile'));
const dockerComposeExists = fs.existsSync(path.join(__dirname, 'docker-compose.yml'));

check(
  'Server Dockerfile',
  serverDockerExists,
  serverDockerExists ? 'Found (Good for local testing)' : 'Optional'
);

check(
  'Client Dockerfile',
  clientDockerExists,
  clientDockerExists ? 'Found' : 'Optional'
);

check(
  'docker-compose.yml',
  dockerComposeExists,
  dockerComposeExists ? 'Found (Good for local testing)' : 'Optional'
);

// 8. Check scripts in package.json
if (serverPackageExists) {
  try {
    const serverPkg = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'server', 'package.json'), 'utf-8')
    );
    const hasStart = serverPkg.scripts && serverPkg.scripts.start;
    check(
      'Server Start Script',
      hasStart,
      hasStart ? 'Found: ' + serverPkg.scripts.start : 'Missing'
    );
  } catch (e) {
    console.log(`${crossMark()} Server package.json is invalid`);
    failed++;
  }
}

if (clientPackageExists) {
  try {
    const clientPkg = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'client', 'package.json'), 'utf-8')
    );
    const hasBuild = clientPkg.scripts && clientPkg.scripts.build;
    check(
      'Client Build Script',
      hasBuild,
      hasBuild ? 'Found: ' + clientPkg.scripts.build : 'Missing'
    );
  } catch (e) {
    console.log(`${crossMark()} Client package.json is invalid`);
    failed++;
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log('🎉 All checks passed! Ready for deployment.\n');
  console.log('📖 Next steps:');
  console.log('   1. Read DEPLOYMENT.md for step-by-step instructions');
  console.log('   2. Set up MongoDB Atlas account');
  console.log('   3. Create Vercel and Render accounts');
  console.log('   4. Deploy backend to Render first');
  console.log('   5. Deploy frontend to Vercel');
  console.log('   6. Keep-alive is automatic - verify in Render logs\n');
} else {
  console.log('⚠️  Please fix the issues above before deploying.\n');
  console.log('💡 Help:');
  console.log('   - Ensure server/.env exists (copy from .env.example)');
  console.log('   - Ensure all npm dependencies are installed');
  console.log('   - Run from project root directory\n');
  process.exit(1);
}
