/**
 * Simple Server Starter for Alfanio Website
 * This script starts the consolidated server
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Alfanio Website Server Starter ===');

// Check if the .env file exists
const envPath = path.join(__dirname, 'server', '.env');
const envExamplePath = path.join(__dirname, 'server', '.env.updated');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log('\n⚠️ .env file not found, copying from .env.updated');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created');
}

// Start the server
console.log('\n🚀 Starting Alfanio server...');
try {
  console.log('📊 Server logs will appear below:');
  execSync('node server/consolidated-server.js', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
}
