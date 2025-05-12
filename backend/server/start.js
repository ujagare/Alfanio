/**
 * Enhanced Server Startup Script
 * Provides improved error handling and ensures critical environment variables
 * are set with sensible defaults before starting the server
 */

require('dotenv').config();
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');

// Set default values for critical environment variables
process.env.PORT = process.env.PORT || '5001';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/Alfanio?retryWrites=true&w=majority';
process.env.EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
process.env.EMAIL_PORT = process.env.EMAIL_PORT || '465';
process.env.EMAIL_SECURE = process.env.EMAIL_SECURE || 'true';
process.env.EMAIL_USER = process.env.EMAIL_USER || 'user@example.com';
process.env.EMAIL_PASS = process.env.EMAIL_PASS || 'password';
process.env.EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@alfanio.com';
process.env.EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Alfanio';
process.env.EMAIL_TO = process.env.EMAIL_TO || 'contact@alfanio.com';

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Check if port is available
const checkPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is already in use. Will try alternative port.`);
        resolve(false);
      } else {
        console.log(`Error checking port: ${err.message}`);
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      console.log(`Port ${port} is available`);
      resolve(true);
    });
    
    server.listen(port);
  });
};

// Find available port
const findAvailablePort = async (startPort) => {
  let port = startPort;
  let maxAttempts = 10;
  
  while (maxAttempts > 0) {
    if (await checkPortAvailable(port)) {
      return port;
    }
    port++;
    maxAttempts--;
  }
  
  console.log(`Could not find available port after ${10 - maxAttempts} attempts. Using port ${port} anyway.`);
  return port;
};

// Start the server with the correct port
const startServer = async () => {
  try {
    // Find available port
    const port = await findAvailablePort(parseInt(process.env.PORT));
    process.env.PORT = port.toString();
    
    console.log(`Starting server on port ${port}...`);
    
    // Start the server
    const server = spawn('node', ['server.js'], {
      stdio: 'inherit',
      env: process.env
    });
    
    server.on('error', (err) => {
      console.error('Failed to start server:', err);
    });
    
    server.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Server exited with code ${code}`);
      }
    });
  } catch (err) {
    console.error('Error starting server:', err);
  }
};

// Start the server
startServer();
