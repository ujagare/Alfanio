/**
 * Combined Server Starter Script
 * This script builds the frontend and starts the combined server
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'production';

console.log('=== Alfanio Combined Server Starter ===');
console.log(`Environment: ${NODE_ENV}`);
console.log(`Port: ${PORT}`);

// Check if we need to build the frontend
const shouldBuild = process.argv.includes('--build') || !fs.existsSync(path.join(__dirname, 'dist', 'index.html'));

if (shouldBuild) {
  console.log('\n🔨 Building frontend...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Frontend build completed successfully');
  } catch (error) {
    console.error('❌ Frontend build failed:', error.message);
    process.exit(1);
  }
}

// Start the server using PM2
console.log('\n🚀 Starting combined server...');
try {
  // Check if PM2 is installed
  try {
    execSync('pm2 -v', { stdio: 'ignore' });
  } catch (error) {
    console.log('⚠️ PM2 not found, installing globally...');
    execSync('npm install -g pm2', { stdio: 'inherit' });
  }

  // Stop any existing instances
  try {
    execSync('pm2 delete alfanio-combined-server', { stdio: 'ignore' });
  } catch (error) {
    // Ignore errors if the process doesn't exist
  }

  // Start the server
  execSync(`pm2 start server/proxy-server.js --name alfanio-combined-server --env ${NODE_ENV}`, { stdio: 'inherit' });
  console.log(`✅ Server started successfully on port ${PORT}`);
  
  // Display the URL
  console.log(`\n🌐 Your application is running at: http://localhost:${PORT}`);
  console.log('📊 View PM2 logs with: pm2 logs alfanio-combined-server');
  console.log('🛑 Stop server with: pm2 stop alfanio-combined-server');
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
}
