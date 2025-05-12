#!/usr/bin/env node

/**
 * Alfanio Website Deployment Script
 * 
 * This script automates the deployment process for the Alfanio website.
 * It performs the following tasks:
 * 1. Builds the frontend
 * 2. Copies the build files to the backend/dist directory
 * 3. Starts the server using PM2
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  frontendDir: './frontend',
  backendDir: './backend',
  distDir: './backend/dist',
  logDir: './logs',
  pm2LogDir: './logs/pm2',
  nodeEnv: process.env.NODE_ENV || 'production'
};

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

// Create necessary directories
function createDirectories() {
  print('Creating necessary directories...', 'blue');
  
  const dirs = [
    config.distDir,
    config.logDir,
    config.pm2LogDir
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      print(`Creating directory: ${dir}`, 'yellow');
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Build the frontend
function buildFrontend() {
  print('Building frontend...', 'blue');
  
  // Navigate to frontend directory and install dependencies
  process.chdir(config.frontendDir);
  execute('npm install');
  
  // Build the frontend
  execute('npm run build');
  
  // Return to root directory
  process.chdir('..');
}

// Copy frontend build to backend/dist
function copyBuildToBackend() {
  print('Copying frontend build to backend/dist...', 'blue');
  
  // Ensure the dist directory exists
  if (!fs.existsSync(config.distDir)) {
    fs.mkdirSync(config.distDir, { recursive: true });
  }
  
  // Copy all files from frontend/dist to backend/dist
  execute(`powershell -Command "Copy-Item -Path ${config.frontendDir}/dist/* -Destination ${config.distDir} -Recurse -Force"`);
}

// Install backend dependencies
function setupBackend() {
  print('Setting up backend...', 'blue');
  
  // Navigate to backend directory and install dependencies
  process.chdir(config.backendDir);
  execute('npm install');
  
  // Return to root directory
  process.chdir('..');
}

// Start the server using PM2
function startServer() {
  print('Starting server with PM2...', 'blue');
  
  // Check if PM2 is installed
  try {
    execSync('pm2 --version', { stdio: 'ignore' });
  } catch (error) {
    print('PM2 is not installed. Installing PM2...', 'yellow');
    execute('npm install -g pm2');
  }
  
  // Stop any existing instances
  try {
    execute('pm2 delete all', { stdio: 'ignore' });
  } catch (error) {
    // Ignore errors if no processes are running
  }
  
  // Start the server using ecosystem.config.js
  execute(`pm2 start ecosystem.config.js --env ${config.nodeEnv}`);
  
  // Save PM2 process list
  execute('pm2 save');
  
  // Display running processes
  execute('pm2 list');
}

// Main function
async function main() {
  try {
    print('=== Alfanio Website Deployment ===', 'magenta');
    print(`Deploying in ${config.nodeEnv} mode`, 'yellow');
    
    // Create necessary directories
    createDirectories();
    
    // Build frontend
    buildFrontend();
    
    // Copy build to backend
    copyBuildToBackend();
    
    // Setup backend
    setupBackend();
    
    // Start server
    startServer();
    
    print('=== Deployment Completed Successfully ===', 'green');
    print('The Alfanio website is now running!', 'green');
    print(`You can access it at: http://localhost:5001`, 'cyan');
    
  } catch (error) {
    print('=== Deployment Failed ===', 'red');
    print(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the main function
main();
