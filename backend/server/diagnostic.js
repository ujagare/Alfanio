/**
 * Alfanio Server Diagnostic Tool
 * This script helps identify server startup issues
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log to both console and file
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  
  console.log(logMessage);
  
  fs.appendFileSync(
    path.join(logsDir, 'diagnostic.log'),
    logMessage + '\n'
  );
};

// Check environment variables
const checkEnvironment = () => {
  log('Checking environment variables...', 'info');
  
  const criticalVars = [
    'MONGODB_URI',
    'EMAIL_USER',
    'EMAIL_PASS',
    'PORT'
  ];
  
  let allPresent = true;
  
  criticalVars.forEach(varName => {
    if (!process.env[varName]) {
      log(`Missing critical environment variable: ${varName}`, 'error');
      allPresent = false;
    } else {
      log(`Found environment variable: ${varName}`, 'success');
    }
  });
  
  // Check port configuration
  log(`Server configured to run on port: ${process.env.PORT || 5000}`, 'info');
  
  return allPresent;
};

// Test MongoDB connection
const testMongoDB = async () => {
  log('Testing MongoDB connection...', 'info');
  
  try {
    log(`Connecting to: ${process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`, 'info');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });
    
    log('MongoDB connection successful!', 'success');
    
    // Check for collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    log(`Found ${collections.length} collections in database`, 'info');
    collections.forEach(collection => {
      log(`- Collection: ${collection.name}`, 'info');
    });
    
    await mongoose.connection.close();
    log('MongoDB connection closed', 'info');
    return true;
  } catch (error) {
    log(`MongoDB connection failed: ${error.message}`, 'error');
    log(error.stack, 'error');
    return false;
  }
};

// Test email configuration
const testEmail = async () => {
  log('Testing email configuration...', 'info');
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 465,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    log('Verifying email connection...', 'info');
    await transporter.verify();
    log('Email connection successful!', 'success');
    return true;
  } catch (error) {
    log(`Email connection failed: ${error.message}`, 'error');
    log(error.stack, 'error');
    return false;
  }
};

// Check server dependencies
const checkDependencies = () => {
  log('Checking server dependencies...', 'info');
  
  const requiredModules = [
    'express',
    'cors',
    'helmet',
    'compression',
    'express-mongo-sanitize',
    'xss-clean',
    'hpp',
    'express-rate-limit',
    'winston'
  ];
  
  let allPresent = true;
  
  requiredModules.forEach(moduleName => {
    try {
      require.resolve(moduleName);
      log(`Module found: ${moduleName}`, 'success');
    } catch (error) {
      log(`Missing module: ${moduleName}`, 'error');
      allPresent = false;
    }
  });
  
  return allPresent;
};

// Check server port availability
const checkPort = async () => {
  log('Checking port availability...', 'info');
  
  const port = process.env.PORT || 5000;
  const net = require('net');
  
  return new Promise(resolve => {
    const server = net.createServer();
    
    server.once('error', error => {
      if (error.code === 'EADDRINUSE') {
        log(`Port ${port} is already in use!`, 'error');
        resolve(false);
      } else {
        log(`Error checking port: ${error.message}`, 'error');
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      log(`Port ${port} is available`, 'success');
      resolve(true);
    });
    
    server.listen(port);
  });
};

// Check file permissions
const checkFilePermissions = () => {
  log('Checking file permissions...', 'info');
  
  const criticalFiles = [
    path.join(__dirname, 'server.js'),
    path.join(__dirname, '.env'),
    logsDir
  ];
  
  let allAccessible = true;
  
  criticalFiles.forEach(filePath => {
    try {
      fs.accessSync(filePath, fs.constants.R_OK | fs.constants.W_OK);
      log(`File accessible: ${filePath}`, 'success');
    } catch (error) {
      log(`File permission issue: ${filePath} - ${error.message}`, 'error');
      allAccessible = false;
    }
  });
  
  return allAccessible;
};

// Main diagnostic function
const runDiagnostics = async () => {
  log('=== ALFANIO SERVER DIAGNOSTICS ===', 'info');
  log(`Time: ${new Date().toLocaleString()}`, 'info');
  log(`Node version: ${process.version}`, 'info');
  log(`Platform: ${process.platform}`, 'info');
  log('=================================', 'info');
  
  // Run all checks
  const envOk = checkEnvironment();
  const dependenciesOk = checkDependencies();
  const permissionsOk = checkFilePermissions();
  const portOk = await checkPort();
  const mongoOk = await testMongoDB();
  const emailOk = await testEmail();
  
  // Summary
  log('=== DIAGNOSTIC SUMMARY ===', 'info');
  log(`Environment Variables: ${envOk ? 'PASS' : 'FAIL'}`, envOk ? 'success' : 'error');
  log(`Dependencies: ${dependenciesOk ? 'PASS' : 'FAIL'}`, dependenciesOk ? 'success' : 'error');
  log(`File Permissions: ${permissionsOk ? 'PASS' : 'FAIL'}`, permissionsOk ? 'success' : 'error');
  log(`Port Availability: ${portOk ? 'PASS' : 'FAIL'}`, portOk ? 'success' : 'error');
  log(`MongoDB Connection: ${mongoOk ? 'PASS' : 'FAIL'}`, mongoOk ? 'success' : 'error');
  log(`Email Configuration: ${emailOk ? 'PASS' : 'FAIL'}`, emailOk ? 'success' : 'error');
  
  const allPassed = envOk && dependenciesOk && permissionsOk && portOk && mongoOk && emailOk;
  
  if (allPassed) {
    log('All diagnostics passed! The server should be able to start correctly.', 'success');
  } else {
    log('Some diagnostics failed. Please fix the issues before starting the server.', 'error');
  }
  
  log('Diagnostic log saved to: ' + path.join(logsDir, 'diagnostic.log'), 'info');
};

// Run diagnostics
runDiagnostics().catch(error => {
  log(`Unexpected error during diagnostics: ${error.message}`, 'error');
  log(error.stack, 'error');
});

// Create a simple diagnostic server
const express = require('express');
const app = express();
const PORT = 5003; // Use a different port to avoid conflicts

// Middleware
app.use(express.json());
app.use(require('cors')({ origin: '*' }));

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve the diagnostic HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'diagnostic.html'));
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    mongodb_uri: process.env.MONGODB_URI ? 'Configured' : 'Missing',
    email_config: process.env.EMAIL_USER ? 'Configured' : 'Missing'
  });
});

// API test endpoint
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working!' });
});

// List all static files in dist directory
app.get('/api/list-static', (req, res) => {
  const distPath = path.join(__dirname, '../dist');
  const assetsPath = path.join(__dirname, 'assets');
  
  try {
    // Check if dist directory exists
    const distExists = fs.existsSync(distPath);
    
    // Get files in dist if it exists
    const distFiles = distExists ? 
      fs.readdirSync(distPath, { withFileTypes: true })
        .map(dirent => ({ 
          name: dirent.name, 
          isDirectory: dirent.isDirectory(),
          path: `/dist/${dirent.name}`
        })) : [];
    
    // Check if assets directory exists
    const assetsExists = fs.existsSync(assetsPath);
    
    // Get files in assets if it exists
    const assetFiles = assetsExists ? 
      fs.readdirSync(assetsPath, { withFileTypes: true })
        .map(dirent => ({ 
          name: dirent.name, 
          isDirectory: dirent.isDirectory(),
          path: `/assets/${dirent.name}`
        })) : [];
    
    res.json({
      success: true,
      distDirectoryExists: distExists,
      assetsDirectoryExists: assetsExists,
      distFiles,
      assetFiles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error listing static files',
      error: error.message
    });
  }
});

// Serve static files from assets directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Start server
app.listen(PORT, () => {
  console.log(`Diagnostic server running on http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser to run diagnostics`);
});
