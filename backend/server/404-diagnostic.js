/**
 * 404 Error Diagnostic Server
 * This script helps identify which resources are causing 404 errors
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Create a simple diagnostic server
const app = express();
const PORT = 5003; // Use a different port to avoid conflicts

// Middleware
app.use(express.json());
app.use(cors({ origin: '*' }));

// Log all requests to console for debugging
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
