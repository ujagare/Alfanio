/**
 * Enhanced Server Runner
 * This script provides improved error handling and ensures the server stays running
 */

require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ANSI color codes for better readability
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Print colored message
const print = (message, color = 'white') => {
  console.log(colors[color] + message + colors.reset);
};

// Start the server
const startServer = () => {
  print('🚀 Starting Alfanio server...', 'cyan');
  
  // Create log streams
  const serverLogStream = fs.createWriteStream(path.join(logsDir, 'server.log'), { flags: 'a' });
  const errorLogStream = fs.createWriteStream(path.join(logsDir, 'server-error.log'), { flags: 'a' });
  
  // Log startup time
  const timestamp = new Date().toISOString();
  serverLogStream.write(`\n[${timestamp}] === SERVER STARTING ===\n`);
  
  // Spawn server process
  const server = spawn('node', ['server.js'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env
  });
  
  // Handle stdout
  server.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(output);
    serverLogStream.write(`${output}\n`);
  });
  
  // Handle stderr
  server.stderr.on('data', (data) => {
    const output = data.toString().trim();
    console.error(colors.red + output + colors.reset);
    errorLogStream.write(`[${new Date().toISOString()}] ${output}\n`);
  });
  
  // Handle server exit
  server.on('exit', (code, signal) => {
    const exitTimestamp = new Date().toISOString();
    
    if (code !== 0) {
      print(`❌ Server crashed with code ${code}`, 'red');
      errorLogStream.write(`[${exitTimestamp}] Server crashed with code ${code}\n`);
      
      // Restart server after delay
      print('🔄 Restarting server in 5 seconds...', 'yellow');
      setTimeout(startServer, 5000);
    } else if (signal) {
      print(`❌ Server was killed with signal ${signal}`, 'red');
      errorLogStream.write(`[${exitTimestamp}] Server was killed with signal ${signal}\n`);
    } else {
      print('✅ Server exited cleanly', 'green');
      serverLogStream.write(`[${exitTimestamp}] Server exited cleanly\n`);
    }
  });
  
  // Handle process signals
  process.on('SIGINT', () => {
    print('\n🛑 Stopping server gracefully...', 'yellow');
    server.kill('SIGTERM');
    
    // Force exit if server doesn't respond
    setTimeout(() => {
      print('⚠️ Forcing exit after timeout', 'red');
      process.exit(1);
    }, 5000);
  });
  
  return server;
};

// Start the server
startServer();
