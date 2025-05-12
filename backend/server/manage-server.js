/**
 * Alfanio Server Manager
 * This script helps manage the server process (start, stop, restart)
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

// Find and kill existing server processes
const killExistingServers = async () => {
  return new Promise((resolve) => {
    print('🔍 Checking for existing server processes...', 'cyan');
    
    // Find processes using the server port
    const port = process.env.PORT || 5001;
    
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (error || !stdout) {
        print(`✅ No processes found using port ${port}`, 'green');
        return resolve(true);
      }
      
      // Extract PIDs from netstat output
      const lines = stdout.trim().split('\n');
      const pids = new Set();
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const pid = parts[4];
          pids.add(pid);
        }
      }
      
      if (pids.size === 0) {
        print(`✅ No processes found using port ${port}`, 'green');
        return resolve(true);
      }
      
      print(`🛑 Found ${pids.size} process(es) using port ${port}:`, 'yellow');
      
      // Kill each process
      let killedCount = 0;
      
      for (const pid of pids) {
        print(`   Terminating process with PID ${pid}...`, 'yellow');
        
        exec(`taskkill /F /PID ${pid}`, (killError) => {
          if (killError) {
            print(`   ❌ Failed to terminate process ${pid}: ${killError.message}`, 'red');
          } else {
            print(`   ✅ Process ${pid} terminated successfully`, 'green');
            killedCount++;
          }
          
          if (killedCount === pids.size) {
            print('✅ All conflicting processes terminated', 'green');
            // Wait a moment to ensure ports are released
            setTimeout(() => resolve(true), 1000);
          }
        });
      }
    });
  });
};

// Start the server
const startServer = async () => {
  // Kill any existing server processes first
  await killExistingServers();
  
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
    env: process.env,
    detached: false
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

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Print header
const printHeader = () => {
  console.log('\n');
  print('╔════════════════════════════════════════════════════════════╗', 'cyan');
  print('║                 ALFANIO SERVER MANAGER                     ║', 'cyan');
  print('╚════════════════════════════════════════════════════════════╝', 'cyan');
  console.log('\n');
};

// Main function
const main = async () => {
  printHeader();
  
  // Load environment variables
  require('dotenv').config();
  
  print(`Server configured to run on port: ${process.env.PORT || 5001}`, 'cyan');
  print('Starting server with automatic restart on failure...', 'cyan');
  console.log('\n');
  
  // Start the server
  await startServer();
  
  print('\n✅ Server is running. Press Ctrl+C to stop.', 'green');
};

// Run the main function
main().catch(error => {
  print(`❌ An unexpected error occurred: ${error.message}`, 'red');
  process.exit(1);
});
