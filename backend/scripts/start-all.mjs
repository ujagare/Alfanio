/**
 * Alfanio LTD - Combined Server Starter
 * This script starts all services on a single server
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'production';

console.log('=== Alfanio LTD - Combined Server Starter ===');
console.log(`Environment: ${NODE_ENV}`);
console.log(`Main Port: ${PORT}`);

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

// Start the proxy server (main entry point)
console.log('📡 Starting proxy server...');
execSync(`pm2 start server/proxy-server.js --name alfanio-proxy-server --env ${NODE_ENV}`, { stdio: 'inherit' });

// Start the email service
console.log('📧 Starting email service...');
execSync(`pm2 start server/email-service.js --name alfanio-email-service --env ${NODE_ENV}`, { stdio: 'inherit' });

// Start the main server in cluster mode
console.log('🖥️ Starting main server in cluster mode...');
execSync(`pm2 start server/main-server.js -i max --name alfanio-main-server --env ${NODE_ENV}`, { stdio: 'inherit' });

// Save the PM2 configuration
console.log('\n💾 Saving PM2 configuration...');
execSync('pm2 save', { stdio: 'inherit' });

// Display the URL and monitoring commands
console.log('\n✅ All services started successfully!');
console.log(`\n🌐 Your application is running at: http://localhost:${PORT}`);
console.log('\n📊 Monitoring commands:');
console.log('   - View all processes: pm2 list');
console.log('   - Monitor all processes: pm2 monit');
console.log('   - View logs: pm2 logs');
console.log('   - View specific logs: pm2 logs alfanio-proxy-server');
console.log('\n🛑 To stop all services: pm2 stop all');
