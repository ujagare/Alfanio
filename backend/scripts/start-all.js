/**
 * Alfanio LTD - Combined Server Starter
 * This script starts all services on a single server
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Configuration
const PORT = 5001; // Hardcoded to 5001 as requested
const NODE_ENV = process.env.NODE_ENV || 'production';

console.log('=== Alfanio LTD - Combined Server Starter ===');
console.log(`Environment: ${NODE_ENV}`);
console.log(`Port: ${PORT}`);

// Check if PM2 is installed
try {
  console.log('\n🔍 Checking for PM2...');
  execSync('pm2 -v', { stdio: 'ignore' });
  console.log('✅ PM2 is installed');
} catch (error) {
  console.log('⚠️ PM2 not found, installing globally...');
  execSync('npm install -g pm2', { stdio: 'inherit' });
}

// Stop any existing instances
try {
  console.log('\n🛑 Stopping any existing services...');
  execSync('pm2 delete all', { stdio: 'ignore' });
  console.log('✅ Stopped existing services');
} catch (error) {
  // Ignore errors if no processes exist
}

// Start the services
console.log('\n🚀 Starting all services...');

// Start the server
console.log('🖥️ Starting server...');
execSync(`pm2 start server/server.js --name alfanio-server --env ${NODE_ENV}`, { stdio: 'inherit' });

// Start the email service as part of the same process
console.log('📧 Starting email service...');
execSync(`pm2 start server/email-service.js --name alfanio-email-service --env ${NODE_ENV}`, { stdio: 'inherit' });

// Display running services
console.log('\n📊 Running services:');
execSync('pm2 list', { stdio: 'inherit' });

console.log(`\n✅ All services started successfully!`);
console.log(`🌐 Website is accessible at: http://localhost:${PORT}`);
console.log(`📝 API is accessible at: http://localhost:${PORT}/api`);
console.log(`\n💡 Use 'pm2 logs' to view logs`);
console.log(`💡 Use 'pm2 stop all' to stop all services`);
console.log(`💡 Use 'pm2 delete all' to remove all services`);
