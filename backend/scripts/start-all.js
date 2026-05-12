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

  // console.log('=== Alfanio LTD - Combined Server Starter ===');  // [removed by fix script]
  // console.log(`Environment: ${NODE_ENV}`);  // [removed by fix script]
  // console.log(`Port: ${PORT}`);  // [removed by fix script]

// Check if PM2 is installed
try {
  // console.log('\n🔍 Checking for PM2...');  // [removed by fix script]
  execSync('pm2 -v', { stdio: 'ignore' });
  // console.log('✅ PM2 is installed');  // [removed by fix script]
} catch (error) {
  // console.log('⚠️ PM2 not found, installing globally...');  // [removed by fix script]
  execSync('npm install -g pm2', { stdio: 'inherit' });
}

// Stop any existing instances
try {
  // console.log('\n🛑 Stopping any existing services...');  // [removed by fix script]
  execSync('pm2 delete all', { stdio: 'ignore' });
  // console.log('✅ Stopped existing services');  // [removed by fix script]
} catch (error) {
  // Ignore errors if no processes exist
}

// Start the services
  // console.log('\n🚀 Starting all services...');  // [removed by fix script]

// Start the server
  // console.log('🖥️ Starting server...');  // [removed by fix script]
execSync(`pm2 start server/server.js --name alfanio-server --env ${NODE_ENV}`, { stdio: 'inherit' });

// Start the email service as part of the same process
  // console.log('📧 Starting email service...');  // [removed by fix script]
execSync(`pm2 start server/email-service.js --name alfanio-email-service --env ${NODE_ENV}`, { stdio: 'inherit' });

// Display running services
  // console.log('\n📊 Running services:');  // [removed by fix script]
execSync('pm2 list', { stdio: 'inherit' });

  // console.log(`\n✅ All services started successfully!`);  // [removed by fix script]
  // console.log(`🌐 Website is accessible at: http://localhost:${PORT}`);  // [removed by fix script]
  // console.log(`📝 API is accessible at: http://localhost:${PORT}/api`);  // [removed by fix script]
  // console.log(`\n💡 Use 'pm2 logs' to view logs`);  // [removed by fix script]
  // console.log(`💡 Use 'pm2 stop all' to stop all services`);  // [removed by fix script]
  // console.log(`💡 Use 'pm2 delete all' to remove all services`);  // [removed by fix script]
