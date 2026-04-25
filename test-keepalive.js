#!/usr/bin/env node
/**
 * Local Keep-Alive Tester
 * 
 * Test the keep-alive functionality locally before deploying to Render
 * Run: npm run test:keepalive (from server directory)
 * 
 * This script starts the server with NODE_ENV=production to trigger keep-alive
 */

const path = require('path');
const { spawn } = require('child_process');

console.log('\n🔍 Testing Keep-Alive Service Locally\n');
console.log('This will start the server with production settings.');
console.log('You should see keep-alive health check logs every 10 minutes.\n');
console.log('Press Ctrl+C to stop.\n');

// Start server with production environment
const env = { ...process.env, NODE_ENV: 'production' };
const server = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'server'),
  env,
  stdio: 'inherit',
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`\nServer stopped with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nStopping server...');
  server.kill();
  process.exit(0);
});
