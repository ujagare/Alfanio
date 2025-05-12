/**
 * Alfanio Server Manager
 * A robust solution to manage server processes and prevent crashes
 */

require('dotenv').config();
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// Log to file and console
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  
  // Print to console with color
  const colorMap = {
    info: 'white',
    success: 'green',
    warning: 'yellow',
    error: 'red'
  };
  
  print(logMessage, colorMap[type] || 'white');
  
  // Write to log file
  fs.appendFileSync(
    path.join(logsDir, 'server-manager.log'),
    logMessage + '\n'
  );
};

// Kill processes using a specific port
const killProcessesByPort = (port) => {
  return new Promise((resolve) => {
    log(`Checking for processes using port ${port}...`, 'info');
    
    // Windows command to find processes using the port
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (error || !stdout) {
        log(`No processes found using port ${port}`, 'success');
        return resolve(true);
      }
      
      // Extract PIDs from netstat output
      const lines = stdout.trim().split('\n');
      const pids = new Set();
      
      for (const line of lines) {
        const parts = line.trim().split(/\\s+/);
        if (parts.length >= 5) {
          const pid = parts[4];
          if (pid && pid !== '0' && pid !== process.pid.toString()) {
            pids.add(pid);
          }
        }
      }
      
      if (pids.size === 0) {
        log(`No processes found using port ${port}`, 'success');
        return resolve(true);
      }
      
      log(`Found ${pids.size} process(es) using port ${port}`, 'warning');
      
      // Kill each process
      let killedCount = 0;
      
      for (const pid of pids) {
        log(`Terminating process with PID ${pid}...`, 'warning');
        
        exec(`taskkill /F /PID ${pid}`, (killError) => {
          if (killError) {
            log(`Failed to terminate process ${pid}: ${killError.message}`, 'error');
          } else {
            log(`Process ${pid} terminated successfully`, 'success');
          }
          
          killedCount++;
          if (killedCount === pids.size) {
            log('All conflicting processes terminated', 'success');
            // Wait a moment to ensure ports are released
            setTimeout(() => resolve(true), 1000);
          }
        });
      }
    });
  });
};

// Set default environment variables
const setDefaultEnvVars = () => {
  log('Setting default environment variables...', 'info');
  
  // Core settings
  process.env.PORT = process.env.PORT || '5001';
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  
  // MongoDB settings
  if (!process.env.MONGODB_URI) {
    log('MONGODB_URI not set, using default value', 'warning');
    process.env.MONGODB_URI = 'mongodb+srv://username:password@cluster.mongodb.net/Alfanio?retryWrites=true&w=majority';
  }
  
  // Email settings
  process.env.EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
  process.env.EMAIL_PORT = process.env.EMAIL_PORT || '465';
  process.env.EMAIL_SECURE = process.env.EMAIL_SECURE || 'true';
  
  if (!process.env.EMAIL_USER) {
    log('EMAIL_USER not set, using default value', 'warning');
    process.env.EMAIL_USER = 'user@example.com';
  }
  
  if (!process.env.EMAIL_PASS) {
    log('EMAIL_PASS not set, using default value', 'warning');
    process.env.EMAIL_PASS = 'password';
  }
  
  process.env.EMAIL_FROM = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  process.env.EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Alfanio';
  process.env.EMAIL_TO = process.env.EMAIL_TO || 'contact@alfanio.com';
  
  log('Environment variables configured', 'success');
};

// Start the server
const startServer = async () => {
  log('=== ALFANIO SERVER MANAGER ===', 'info');
  log(`Time: ${new Date().toLocaleString()}`, 'info');
  log(`Node version: ${process.version}`, 'info');
  log(`Platform: ${process.platform}`, 'info');
  log('=============================', 'info');
  
  // Set default environment variables
  setDefaultEnvVars();
  
  // Get configured port
  const port = parseInt(process.env.PORT);
  log(`Server configured to use port: ${port}`, 'info');
  
  try {
    // Kill any processes using the port
    await killProcessesByPort(port);
    
    // Start the server
    log('Starting server...', 'info');
    
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
      process.stdout.write(output + '\n');
      serverLogStream.write(`${output}\n`);
    });
    
    // Handle stderr
    server.stderr.on('data', (data) => {
      const output = data.toString().trim();
      process.stderr.write(colors.red + output + colors.reset + '\n');
      errorLogStream.write(`[${new Date().toISOString()}] ${output}\n`);
    });
    
    // Handle server exit
    server.on('exit', (code, signal) => {
      const exitTimestamp = new Date().toISOString();
      
      if (code !== 0) {
        log(`Server crashed with code ${code}`, 'error');
        errorLogStream.write(`[${exitTimestamp}] Server crashed with code ${code}\n`);
        
        // Restart server after delay
        log('Restarting server in 5 seconds...', 'warning');
        setTimeout(() => startServer(), 5000);
      } else if (signal) {
        log(`Server was killed with signal ${signal}`, 'error');
        errorLogStream.write(`[${exitTimestamp}] Server was killed with signal ${signal}\n`);
      } else {
        log('Server exited cleanly', 'success');
        serverLogStream.write(`[${exitTimestamp}] Server exited cleanly\n`);
      }
    });
    
    // Handle process signals
    process.on('SIGINT', () => {
      log('\nStopping server gracefully...', 'warning');
      server.kill('SIGTERM');
      
      // Force exit if server doesn't respond
      setTimeout(() => {
        log('Forcing exit after timeout', 'error');
        process.exit(1);
      }, 5000);
    });
    
    log('Server process started', 'success');
    log('Press Ctrl+C to stop the server', 'info');
    
  } catch (error) {
    log(`Failed to start server: ${error.message}`, 'error');
    log(error.stack, 'error');
  }
};

// Set up error handlers
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`, 'error');
  log(error.stack, 'error');
});

process.on('unhandledRejection', (error) => {
  log(`Unhandled Rejection: ${error.message}`, 'error');
  log(error.stack, 'error');
});

// Start the server
startServer();
