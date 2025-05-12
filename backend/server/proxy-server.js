/**
 * API Proxy Server for Alfanio Website
 * 
 * This proxy server handles:
 * 1. Redirecting requests from port 5001 to port 5002
 * 2. Fixing duplicated API paths (/api/api/ → /api/)
 * 3. Forwarding email requests to the dedicated email service
 * 4. Logging all requests for debugging
 * 5. Serving frontend static files from the dist directory
 */

require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const axios = require('axios');
const http = require('http');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create email logs directory
const emailLogsDir = path.join(logsDir, 'email');
if (!fs.existsSync(emailLogsDir)) {
  fs.mkdirSync(emailLogsDir, { recursive: true });
}

// Log function
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  console.log(logMessage);
  
  // Log to file
  fs.appendFileSync(
    path.join(logsDir, 'proxy-server.log'),
    logMessage + '\n'
  );
  
  // Log email-related messages to email log file
  if (message.includes('email') || message.includes('mail') || type === 'email') {
    fs.appendFileSync(
      path.join(emailLogsDir, 'email-service.log'),
      logMessage + '\n'
    );
  }
  
  // Log errors to error log file
  if (type === 'error') {
    fs.appendFileSync(
      path.join(logsDir, 'error.log'),
      logMessage + '\n'
    );
  }
}

// Create proxy server
const app = express();
const PORT = 5001; // Listen on the port the frontend is trying to connect to

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Log all requests for debugging
app.use((req, res, next) => {
  log(`${req.method} ${req.url}`);
  next();
});

// Fix duplicated API paths
app.use((req, res, next) => {
  if (req.url.includes('/api/api/')) {
    // Fix the duplicated API path
    const fixedUrl = req.url.replace('/api/api/', '/api/');
    log(`Fixed duplicated API path: ${req.url} → ${fixedUrl}`);
    req.url = fixedUrl;
  }
  next();
});

// Parse JSON body for all requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from multiple possible locations
const staticPaths = [
  path.join(__dirname, '..', 'dist'),
  path.join(__dirname, '..', 'public'),
  path.join(__dirname, 'public')
];

// Find the first existing directory and serve static files from it
let staticPath = null;
for (const testPath of staticPaths) {
  if (fs.existsSync(testPath)) {
    staticPath = testPath;
    log(`Serving static files from: ${staticPath}`);
    // Add caching headers and increase timeout for static files
    app.use(express.static(staticPath, {
      maxAge: '1d', // Cache static assets for 1 day
      setHeaders: function (res, path) {
        // Add appropriate cache headers
        if (path.endsWith('.css') || path.endsWith('.js')) {
          res.setHeader('Cache-Control', 'public, max-age=86400');
        }
      }
    }));
    break;
  }
}

if (!staticPath) {
  log('Warning: No static files directory found', 'warn');
}

// Serve brochure files from multiple locations
app.use('/brochures', express.static(path.join(__dirname, 'assets')));
app.use('/brochures', express.static(path.join(__dirname, '..', 'public')));
app.use('/brochures', express.static(path.join(__dirname, '..', 'src', 'assets')));

// Direct routes for critical assets to prevent 504 errors
app.get('/assets/*.css', (req, res) => {
  // Extract the base filename without the hash
  const requestedPath = req.path;
  const baseName = path.basename(requestedPath).split('-')[0];
  log(`Direct CSS request: ${requestedPath} (base: ${baseName})`);
  
  // Try to find a matching CSS file in the assets directory
  if (staticPath) {
    const assetsDir = path.join(staticPath, 'assets');
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      const matchingCssFile = files.find(file => file.startsWith(baseName) && file.endsWith('.css'));
      
      if (matchingCssFile) {
        const fullPath = path.join(assetsDir, matchingCssFile);
        log(`Found matching CSS file: ${matchingCssFile}`);
        res.setHeader('Content-Type', 'text/css');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.sendFile(fullPath);
      }
    }
  }
  
  // Fallback to the exact path if no match found
  const cssPath = path.join(staticPath, requestedPath);
  if (fs.existsSync(cssPath)) {
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(cssPath);
  } else {
    log(`CSS file not found: ${cssPath}`, 'error');
    res.status(404).send('CSS file not found');
  }
});

app.get('/assets/*.js', (req, res) => {
  // Extract the base filename without the hash
  const requestedPath = req.path;
  const baseName = path.basename(requestedPath).split('-')[0];
  log(`Direct JS request: ${requestedPath} (base: ${baseName})`);
  
  // Try to find a matching JS file in the assets directory
  if (staticPath) {
    const assetsDir = path.join(staticPath, 'assets');
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      const matchingJsFile = files.find(file => file.startsWith(baseName) && file.endsWith('.js'));
      
      if (matchingJsFile) {
        const fullPath = path.join(assetsDir, matchingJsFile);
        log(`Found matching JS file: ${matchingJsFile}`);
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.sendFile(fullPath);
      }
    }
  }
  
  // Fallback to the exact path if no match found
  const jsPath = path.join(staticPath, requestedPath);
  if (fs.existsSync(jsPath)) {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(jsPath);
  } else {
    log(`JS file not found: ${jsPath}`, 'error');
    res.status(404).send('JS file not found');
  }
});

app.get('/assets/*.(png|jpg|jpeg|webp|svg|gif)', (req, res) => {
  // Extract the base filename without the hash
  const requestedPath = req.path;
  const baseName = path.basename(requestedPath).split('-')[0];
  const extension = path.extname(requestedPath).toLowerCase();
  log(`Direct image request: ${requestedPath} (base: ${baseName}, ext: ${extension})`);
  
  // Try to find a matching image file in the assets directory
  if (staticPath) {
    const assetsDir = path.join(staticPath, 'assets');
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      // Look for files with the same base name and same extension
      const matchingImageFiles = files.filter(file => 
        file.startsWith(baseName) && 
        path.extname(file).toLowerCase() === extension
      );
      
      if (matchingImageFiles.length > 0) {
        const fullPath = path.join(assetsDir, matchingImageFiles[0]);
        log(`Found matching image file: ${matchingImageFiles[0]}`);
        
        // Set appropriate content type based on extension
        const contentTypes = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
          '.gif': 'image/gif'
        };
        
        res.setHeader('Content-Type', contentTypes[extension] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.sendFile(fullPath);
      }
    }
  }
  
  // If no match found by base name, try to find any file with the same name (without hash)
  if (staticPath) {
    // Check in multiple possible locations
    const possibleDirs = [
      path.join(staticPath, 'assets'),
      path.join(staticPath),
      path.join(__dirname, '..', 'src', 'assets'),
      path.join(__dirname, '..', 'public')
    ];
    
    for (const dir of possibleDirs) {
      if (fs.existsSync(dir)) {
        try {
          const files = fs.readdirSync(dir);
          // Look for any file that contains the base name (without the hash)
          const matchingFile = files.find(file => 
            file.includes(baseName) && 
            path.extname(file).toLowerCase() === extension
          );
          
          if (matchingFile) {
            const fullPath = path.join(dir, matchingFile);
            log(`Found alternative image file: ${matchingFile} in ${dir}`);
            
            // Set appropriate content type based on extension
            const contentTypes = {
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.webp': 'image/webp',
              '.svg': 'image/svg+xml',
              '.gif': 'image/gif'
            };
            
            res.setHeader('Content-Type', contentTypes[extension] || 'application/octet-stream');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.sendFile(fullPath);
          }
        } catch (err) {
          log(`Error reading directory ${dir}: ${err.message}`, 'error');
        }
      }
    }
  }
  
  // Fallback to the exact path if no match found
  const imagePath = path.join(staticPath, requestedPath);
  if (fs.existsSync(imagePath)) {
    // Set appropriate content type based on extension
    const contentTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.gif': 'image/gif'
    };
    
    res.setHeader('Content-Type', contentTypes[extension] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(imagePath);
  } else {
    log(`Image file not found: ${imagePath}`, 'error');
    res.status(404).send('Image file not found');
  }
});

// Direct route for the Alfanio logo
app.get('/logo.png', (req, res) => {
  log('Direct logo request received');
  
  // Check multiple possible locations for the logo
  const logoPaths = [
    path.join(staticPath, 'assets', 'Alfanio-DVjpnezX.png'),
    path.join(staticPath, 'assets', 'logo-DkozwPqM.png'),
    path.join(staticPath, 'logo.png'),
    path.join(__dirname, '..', 'src', 'assets', 'Alfanio.png'),
    path.join(__dirname, '..', 'src', 'assets', 'logo.png'),
    path.join(__dirname, '..', 'public', 'logo.png'),
    path.join(__dirname, 'assets', 'logo.png')
  ];
  
  // Find the first existing logo file
  for (const logoPath of logoPaths) {
    if (fs.existsSync(logoPath)) {
      log(`Serving logo from ${logoPath}`);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(logoPath);
    }
  }
  
  log('Logo file not found', 'error');
  res.status(404).send('Logo not found');
});

// Forward brochure requests to the email service
app.post('/api/contact/brochure', (req, res) => {
  log('Forwarding brochure request to email service', 'email');
  
  // Create a copy of the request body to avoid modification issues
  const requestData = { ...req.body };
  
  // Log the request data for debugging
  log(`Brochure request data: ${JSON.stringify(requestData)}`, 'debug');
  
  // Set up a timeout for the request
  const timeoutMs = 15000; // 15 seconds
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timed out')), timeoutMs)
  );
  
  // Forward the request to the email service
  const requestPromise = axios.post(`http://localhost:5002/contact/brochure`, requestData, {
    timeout: timeoutMs,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  // Race the request against the timeout
  Promise.race([requestPromise, timeoutPromise])
    .then(response => {
      log('Brochure request forwarded successfully', 'email');
      res.status(response.status).json(response.data);
    })
    .catch(error => {
      // If we have a response from the email service
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
      
      // If it's a timeout error, try to download the brochure directly
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        log('Email service request timed out, falling back to direct download', 'warn');
        
        // Try to save the request data locally for later processing
        try {
          const { saveFallbackData } = require('./config/database');
          saveFallbackData('brochure-requests', {
            ...requestData,
            timestamp: new Date(),
            error: 'Proxy timeout'
          });
          log('Saved brochure request to local fallback storage', 'info');
        } catch (saveError) {
          log(`Failed to save to fallback storage: ${saveError.message}`, 'error');
        }
        
        return res.status(200).json({
          success: true,
          message: 'Request processed, but email delivery may be delayed. You can download the brochure directly.',
          downloadUrl: `${process.env.CLIENT_URL || 'http://localhost:5001'}/download-brochure`
        });
      }
      
      // If email service is down, try to serve the brochure directly
      if (error.code === 'ECONNREFUSED') {
        log('Email service is unavailable, falling back to direct download', 'warn');
        
        // Check if we have the brochure file
        const brochurePaths = [
          path.join(__dirname, 'assets', 'Alfanio.pdf'),
          path.join(__dirname, 'assets', 'brochure.pdf'),
          path.join(__dirname, 'assets', 'Alfanio brochure - 1.pdf')
        ];
        
        let brochurePath = null;
        for (const testPath of brochurePaths) {
          if (fs.existsSync(testPath)) {
            brochurePath = testPath;
            break;
          }
        }
        
        if (brochurePath) {
          log(`Serving brochure directly from ${brochurePath}`, 'info');
          return res.status(200).json({
            success: true,
            message: 'Email service is unavailable, but you can download the brochure directly.',
            downloadUrl: `${process.env.CLIENT_URL || 'http://localhost:5001'}/download-brochure`
          });
        }
      }
      
      // Generic error
      res.status(500).json({
        success: false,
        message: 'Failed to process your request. Please try again later.'
      });
    });
});

// Also support the duplicated API path that's causing the 504 error
app.post('/api/api/contact/brochure', (req, res) => {
  log('Fixing duplicated API path for brochure request', 'email');
  
  // Forward the request to the email service
  const emailServiceUrl = `http://localhost:5002/contact/brochure`;
  
  axios.post(emailServiceUrl, req.body)
    .then(response => {
      res.status(response.status).json(response.data);
    })
    .catch(error => {
      // If email service is down, still provide download URL
      if (!error.response) {
        return res.status(200).json({
          success: true,
          message: 'Download available',
          downloadUrl: '/brochures/download'
        });
      }
      
      // Otherwise forward the error response
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({
          success: false,
          message: 'Error forwarding request to email service',
          downloadUrl: '/brochures/download' // Still provide download URL as fallback
        });
      }
    });
});

// Direct brochure download endpoint
app.get('/brochures/download', (req, res) => {
  log('Direct brochure download requested', 'email');
  
  // Check all possible brochure file paths
  const pdfPaths = [
    path.join(__dirname, 'assets', 'Alfanio.pdf'),
    path.join(__dirname, 'assets', 'brochure.pdf'),
    path.join(__dirname, 'assets', 'Alfanio brochure - 1.pdf'),
    path.join(__dirname, 'public', 'Alfanio.pdf'),
    path.join(__dirname, '..', 'public', 'Alfanio.pdf'),
    path.join(__dirname, '..', 'public', 'brochure.pdf'),
    path.join(__dirname, '..', 'src', 'assets', 'Alfanio.pdf'),
    path.join(__dirname, '..', 'src', 'assets', 'Alfanio brochure - 1.pdf')
  ];
  
  // Find the first existing PDF file
  let brochurePath = null;
  for (const testPath of pdfPaths) {
    if (fs.existsSync(testPath)) {
      brochurePath = testPath;
      log(`Brochure file found at ${brochurePath}`, 'email');
      break;
    }
  }
  
  // Check if file exists
  if (!brochurePath) {
    log('No brochure file found for download', 'error');
    return res.status(404).send('Brochure file not found');
  }
  
  // Set headers for file download
  res.setHeader('Content-Disposition', 'attachment; filename="alfanio-brochure.pdf"');
  res.setHeader('Content-Type', 'application/pdf');
  
  // Stream the file directly to the client
  const fileStream = fs.createReadStream(brochurePath);
  fileStream.pipe(res);
  
  log('Brochure download started', 'email');
});

// Support the old download path as well for backward compatibility
app.get('/download-brochure', (req, res) => {
  console.log('Redirecting from old download path to new path');
  res.redirect('/brochures/download');
});

// API endpoint for brochure download
app.get('/api/brochures/download', (req, res) => {
  log('API brochure download requested', 'email');
  // Redirect to the direct download endpoint
  res.redirect('/brochures/download');
});

// Legacy API endpoint for backward compatibility
app.get('/api/download-brochure', (req, res) => {
  log('Legacy API brochure download requested', 'email');
  // Redirect to the new endpoint
  res.redirect('/brochures/download');
});

// Forward contact form requests to the email service
app.post('/api/contact', async (req, res) => {
  log('Forwarding contact form request to email service', 'email');
  
  // Create a copy of the request body to avoid modification issues
  const requestData = { ...req.body };
  
  // Log the request data for debugging (excluding sensitive info)
  const { email, phone, ...loggableData } = requestData;
  log(`Contact form data: ${JSON.stringify({
    ...loggableData,
    email: email ? 'REDACTED' : undefined,
    phone: phone ? 'REDACTED' : undefined,
  })}`, 'debug');
  
  // Set up a timeout for the request
  const timeoutMs = 15000; // 15 seconds
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timed out')), timeoutMs)
  );
  
  // Forward the request to the email service
  const requestPromise = axios.post(`http://localhost:5001/contact`, requestData, {
    timeout: timeoutMs,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  try {
    // Race the request against the timeout
    const response = await Promise.race([requestPromise, timeoutPromise]);
    log('Email service responded successfully', 'email');
    res.status(response.status).json(response.data);
  } catch (error) {
    log(`Error forwarding to email service: ${error.message}`, 'error');
    
    // If we have a response from the email service, use it
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    // If it's a timeout error, save the request locally and return a friendly message
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      log('Email service request timed out', 'warn');
      
      // Try to save the request data locally for later processing
      try {
        const { saveFallbackData } = require('./config/database');
        saveFallbackData('contact-forms', {
          ...requestData,
          timestamp: new Date(),
          error: 'Proxy timeout'
        });
        log('Saved contact form to local fallback storage', 'info');
        
        return res.status(200).json({
          success: true,
          message: 'Your message has been received. We will contact you shortly.'
        });
      } catch (saveError) {
        log(`Failed to save to fallback storage: ${saveError.message}`, 'error');
      }
    }
    
    // If email service is down, provide a clear error
    if (error.code === 'ECONNREFUSED') {
      // Try to save the request data locally for later processing
      try {
        const { saveFallbackData } = require('./config/database');
        saveFallbackData('contact-forms', {
          ...requestData,
          timestamp: new Date(),
          error: 'Service unavailable'
        });
        log('Saved contact form to local fallback storage due to service unavailability', 'info');
        
        return res.status(200).json({
          success: true,
          message: 'Your message has been received. We will contact you shortly.'
        });
      } catch (saveError) {
        log(`Failed to save to fallback storage: ${saveError.message}`, 'error');
        
        return res.status(503).json({
          success: false,
          message: 'Our messaging service is temporarily unavailable. Please try again later or contact us directly at info@alfanio.com.'
        });
      }
    }
    
    // Generic error
    res.status(500).json({
      success: false,
      message: 'Failed to process your request. Please try again later or contact us directly at info@alfanio.com.'
    });
  }
});

// Proxy all other requests to the actual server
app.use('/', createProxyMiddleware({
  target: `http://localhost:5001`,
  changeOrigin: true,
  logLevel: 'debug',
  pathRewrite: {
    '^/api/api/': '/api/' // Additional path rewriting
  },
  // Add timeout configuration
  proxyTimeout: 60000, // 60 seconds timeout
  timeout: 60000,      // 60 seconds timeout
  onProxyReq: (proxyReq, req, res) => {
    log(`Proxying request: ${req.method} ${req.url} → http://localhost:5001${req.url}`);
  },
  onError: (err, req, res) => {
    log(`Proxy error: ${err.message}`, 'error');
    
    // If this is a static asset request and we're getting a timeout, serve from dist directly
    if (req.url.endsWith('.css') || req.url.endsWith('.js') || req.url.includes('/assets/')) {
      const assetPath = path.join(staticPath, req.url);
      if (fs.existsSync(assetPath)) {
        log(`Serving static asset directly: ${req.url}`);
        return res.sendFile(assetPath);
      }
    }
    
    res.status(500).send('Proxy Error: ' + err.message);
  }
}));

// For any other GET request, serve the React app
app.get('*', (req, res) => {
  if (fs.existsSync(path.join(staticPath, 'index.html'))) {
    res.sendFile(path.join(staticPath, 'index.html'));
    log(`Serving React app for path: ${req.url}`);
  } else {
    res.status(404).send('Not found');
    log(`404: ${req.url} - React app not found`, 'error');
  }
});

// Start the proxy server
app.listen(PORT, () => {
  log(`Proxy server running on http://localhost:${PORT}`);
  log(`Redirecting requests to http://localhost:${PORT}`);
  log(`Forwarding email requests to http://localhost:${PORT}`);
  log(`Fixing duplicated API paths (/api/api/ → /api/)`);
});
