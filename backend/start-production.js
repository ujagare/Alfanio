#!/usr/bin/env node

/**
 * Alfanio Website Production Starter
 * 
 * This script starts the Alfanio website in production mode.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper function to print colored messages
function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to execute shell commands
function execute(command, options = {}) {
  try {
    print(`Executing: ${command}`, 'cyan');
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    print(`Error executing command: ${command}`, 'red');
    print(error.message, 'red');
    throw error;
  }
}

// Main function
async function main() {
  try {
    print('=== Starting Alfanio Website in Production Mode ===', 'magenta');
    
    // Ensure we're in production mode
    process.env.NODE_ENV = 'production';
    
    // Check if backend/.env exists
    if (!fs.existsSync('./backend/.env')) {
      print('Error: backend/.env file not found!', 'red');
      print('Please create the .env file with the required environment variables.', 'yellow');
      process.exit(1);
    }
    
    // Check if MongoDB connection works
    print('Testing MongoDB connection...', 'blue');
    try {
      execute('node test-mongodb-connection.js');
      print('MongoDB connection test successful!', 'green');
    } catch (error) {
      print('MongoDB connection test failed!', 'red');
      print('Please check your MongoDB connection settings in backend/.env', 'yellow');
      process.exit(1);
    }
    
    // Start the server
    print('Starting the server...', 'blue');
    execute('cd backend && node server/server.js');
    
  } catch (error) {
    print('=== Error Starting Server ===', 'red');
    print(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the main function
main();
