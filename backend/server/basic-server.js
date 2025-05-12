/**
 * Basic Server for Alfanio Website
 * 
 * This is a minimal server that doesn't require MongoDB or email
 * Just to get the website up and running
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = 5001;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Create logs directory for storing form submissions
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Simple in-memory storage for form submissions
const contactSubmissions = [];
const brochureRequests = [];

// API endpoint for contact form
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, phone, message, type } = req.body;
    
    console.log(`Contact form submission received from ${email}`);
    
    // Store in memory
    const submission = {
      name,
      email,
      phone,
      message,
      type: type || 'general',
      timestamp: new Date().toISOString()
    };
    
    contactSubmissions.push(submission);
    
    // Also log to file for persistence
    const logFile = path.join(logsDir, 'contact-submissions.json');
    let existingData = [];
    
    if (fs.existsSync(logFile)) {
      try {
        existingData = JSON.parse(fs.readFileSync(logFile, 'utf8'));
      } catch (err) {
        console.error('Error reading contact log file:', err);
      }
    }
    
    existingData.push(submission);
    fs.writeFileSync(logFile, JSON.stringify(existingData, null, 2));
    
    console.log(`Saved contact form from ${email} to log file`);
    
    return res.status(200).json({
      success: true,
      message: 'Your message has been received! We will contact you soon.',
    });
  } catch (error) {
    console.error('Error in contact form endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'There was an issue processing your request. Please try again later.'
    });
  }
});

// Add direct /contact endpoint to match frontend request
app.post('/contact', (req, res) => {
  try {
    const { name, email, phone, message, type } = req.body;
    
    console.log(`Contact form submission received from ${email} via /contact endpoint`);
    
    // Store in memory
    const submission = {
      name,
      email,
      phone,
      message,
      type: type || 'general',
      timestamp: new Date().toISOString()
    };
    
    contactSubmissions.push(submission);
    
    // Also log to file for persistence
    const logFile = path.join(logsDir, 'contact-submissions.json');
    let existingData = [];
    
    if (fs.existsSync(logFile)) {
      try {
        existingData = JSON.parse(fs.readFileSync(logFile, 'utf8'));
      } catch (err) {
        console.error('Error reading contact log file:', err);
      }
    }
    
    existingData.push(submission);
    fs.writeFileSync(logFile, JSON.stringify(existingData, null, 2));
    
    console.log(`Saved contact form from ${email} to log file`);
    
    return res.status(200).json({
      success: true,
      message: 'Your message has been received! We will contact you soon.',
    });
  } catch (error) {
    console.error('Error in contact form endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'There was an issue processing your request. Please try again later.'
    });
  }
});

// API endpoint for brochure requests
app.post('/api/contact/brochure', (req, res) => {
  try {
    const { name, email } = req.body;
    
    console.log(`Brochure request received from ${email}`);
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }
    
    // Store in memory
    const request = {
      name,
      email,
      timestamp: new Date().toISOString()
    };
    
    brochureRequests.push(request);
    
    // Also log to file for persistence
    const logFile = path.join(logsDir, 'brochure-requests.json');
    let existingData = [];
    
    if (fs.existsSync(logFile)) {
      try {
        existingData = JSON.parse(fs.readFileSync(logFile, 'utf8'));
      } catch (err) {
        console.error('Error reading brochure log file:', err);
      }
    }
    
    existingData.push(request);
    fs.writeFileSync(logFile, JSON.stringify(existingData, null, 2));
    
    console.log(`Saved brochure request from ${email} to log file`);
    
    // Check if we have the brochure file
    const brochurePaths = [
      path.join(__dirname, 'assets', 'Alfanio.pdf'),
      path.join(__dirname, 'assets', 'brochure.pdf'),
      path.join(__dirname, 'assets', 'Alfanio brochure - 1.pdf'),
      path.join(__dirname, '..', 'public', 'Alfanio.pdf'),
      path.join(__dirname, '..', 'src', 'assets', 'Alfanio.pdf')
    ];
    
    let brochureFound = false;
    for (const testPath of brochurePaths) {
      if (fs.existsSync(testPath)) {
        brochureFound = true;
        break;
      }
    }
    
    return res.status(200).json({
      success: true,
      message: brochureFound 
        ? 'Thank you for your interest! You can download the brochure from the link below.'
        : 'Thank you for your interest! Our team will contact you shortly.',
      downloadUrl: brochureFound ? '/brochures/download' : null
    });
  } catch (error) {
    console.error('Error in brochure endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'There was an issue processing your request. Please try again later.'
    });
  }
});

// Direct download endpoint for brochure
app.get('/brochures/download', (req, res) => {
  console.log('Direct brochure download requested');
  
  // Check all possible brochure file paths
  const pdfPaths = [
    path.join(__dirname, 'assets', 'Alfanio.pdf'),
    path.join(__dirname, 'assets', 'brochure.pdf'),
    path.join(__dirname, 'assets', 'Alfanio brochure - 1.pdf'),
    path.join(__dirname, '..', 'public', 'Alfanio.pdf'),
    path.join(__dirname, '..', 'src', 'assets', 'Alfanio.pdf')
  ];
  
  for (const pdfPath of pdfPaths) {
    if (fs.existsSync(pdfPath)) {
      console.log(`Serving brochure from: ${pdfPath}`);
      return res.download(pdfPath, 'Alfanio-Brochure.pdf');
    }
  }
  
  console.error('Brochure file not found for direct download');
  return res.status(404).json({
    success: false,
    message: 'Brochure file not found. Please contact us directly for assistance.'
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working!',
    time: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    contactSubmissions: contactSubmissions.length,
    brochureRequests: brochureRequests.length
  });
});

// Serve static files from multiple possible locations
const staticPaths = [
  path.join(__dirname, '..', 'dist'),
  path.join(__dirname, '..', 'public'),
  path.join(__dirname, 'public')
];

let staticPath = null;
for (const testPath of staticPaths) {
  if (fs.existsSync(testPath)) {
    staticPath = testPath;
    console.log(`Serving static files from: ${staticPath}`);
    app.use(express.static(testPath));
    break;
  }
}

// Serve brochure files from multiple locations
app.use('/brochures', express.static(path.join(__dirname, 'assets')));
app.use('/brochures', express.static(path.join(__dirname, '..', 'public')));
app.use('/brochures', express.static(path.join(__dirname, '..', 'src', 'assets')));

// For any other GET request, serve the React app
app.get('*', (req, res) => {
  if (staticPath && fs.existsSync(path.join(staticPath, 'index.html'))) {
    res.sendFile(path.join(staticPath, 'index.html'));
  } else {
    res.status(200).send(`
      <html>
        <head>
          <title>Alfanio Server</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              line-height: 1.6;
            }
            h1 { color: #333; }
            .card {
              border: 1px solid #ddd;
              padding: 20px;
              border-radius: 5px;
              margin-bottom: 20px;
              background-color: #f9f9f9;
            }
            .success { color: green; }
            .error { color: red; }
            code {
              background: #f4f4f4;
              padding: 2px 5px;
              border-radius: 3px;
            }
          </style>
        </head>
        <body>
          <h1>Alfanio Server is Running</h1>
          <div class="card">
            <h2>Server Status</h2>
            <p class="success">✅ Server is online and ready to accept requests</p>
            <p>Started at: ${new Date().toLocaleString()}</p>
            <p>Running on port: ${PORT}</p>
          </div>
          
          <div class="card">
            <h2>Available Endpoints</h2>
            <ul>
              <li><code>POST /api/contact</code> - Submit contact form</li>
              <li><code>POST /api/contact/brochure</code> - Request brochure</li>
              <li><code>GET /brochures/download</code> - Download brochure</li>
              <li><code>GET /api/test</code> - Test API connection</li>
              <li><code>GET /api/health</code> - Server health check</li>
            </ul>
          </div>
          
          <div class="card">
            <h2>Troubleshooting</h2>
            <p>If you're experiencing issues with the server:</p>
            <ol>
              <li>Check that your frontend is making requests to the correct URL</li>
              <li>Verify that CORS is properly configured for your domain</li>
              <li>Check the server logs for detailed error information</li>
            </ol>
          </div>
        </body>
      </html>
    `);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server accessible at http://localhost:${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
