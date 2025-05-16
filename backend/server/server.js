import express from 'express';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import mime from 'mime-types'; // Add mime-types package

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
// Set trust proxy to fix express-rate-limit warning
app.set('trust proxy', 1);

// Increase default timeout
app.use((req, res, next) => {
  req.setTimeout(120000);
  res.setTimeout(120000);
  next();
});

// Middleware
// Set up CSP with nonce middleware
app.use((req, res, next) => {
  // Generate a random nonce for this request
  const nonce = crypto.randomBytes(16).toString('base64');
  // Store it on the request object
  req.nonce = nonce;
  next();
});

// Add request ID for better logging and debugging
app.use((req, res, next) => {
  req.id = crypto.randomBytes(8).toString('hex');
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Apply Helmet with CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "data:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.googletagmanager.com", "https://www.google-analytics.com", "data:", "blob:"],
      "script-src-elem": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.googletagmanager.com", "https://www.google-analytics.com", "data:", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "style-src-elem": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https://www.google-analytics.com", process.env.CLIENT_URL || "http://localhost:5001", "data:", "blob:"],
      frameSrc: ["'self'", "https://www.google.com", "data:"],
      fontSrc: ["'self'", "data:", "https:", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "data:", "blob:"],
      childSrc: ["'self'", "https://www.google.com", "blob:", "data:"],
      workerSrc: ["'self'", "blob:", "data:"],
      manifestSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      scriptSrcAttr: ["'self'", "'unsafe-inline'", "data:"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  // Disable X-Frame-Options as we're setting it in CSP
  frameguard: false,
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  }
}));
// Apply compression with better settings
app.use(compression({
  level: 6, // Balanced between compression ratio and CPU usage
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress responses with this header
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression filter function from the module
    return compression.filter(req, res);
  }
}));
// Use direct CORS configuration
import setupDirectCors from './middleware/directCors.js';
setupDirectCors(app);

// Log that CORS has been configured
console.log('Direct CORS middleware configured');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Configure cookie parser with secure defaults
app.use(cookieParser(process.env.COOKIE_SECRET || 'alfanio-secure-cookie-secret'));

// Configure secure session cookies
app.use((req, res, next) => {
  res.cookie('sessionId', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000, // 1 hour
    path: '/',
    signed: true
  });
  next();
});

// Generate nonce for CSP
app.use((req, res, next) => {
  req.nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = req.nonce;
  next();
});

// CSRF protection - enhanced for production
const csrfProtection = (req, res, next) => {
  // In production, implement proper CSRF protection
  if (process.env.NODE_ENV === 'production') {
    // Check for CSRF token in headers or cookies
    const csrfToken = req.headers['x-csrf-token'] || (req.cookies && req.cookies['_csrf']);

    // Get the request origin
    const origin = req.headers.origin || req.headers.referer;

    // Check if the request is coming from our allowed origins
    const allowedOrigins = ['https://alfanio.in', 'https://www.alfanio.in', 'https://alfanio.onrender.com', 'https://alfanio-frontend.onrender.com'];
    const isAllowedOrigin = !origin || allowedOrigins.some(allowed => origin.startsWith(allowed));

    // Skip CSRF check for specific conditions:
    // 1. If it's a GET request (should be idempotent)
    // 2. If it's a preflight OPTIONS request
    if (req.method === 'GET' || req.method === 'OPTIONS') {
      return next();
    }

    // Validate the token
    if (!csrfToken) {
      console.warn(`CSRF token missing in ${req.method} request to ${req.originalUrl}`);
      return res.status(403).json({
        success: false,
        message: 'CSRF token missing',
        code: 'CSRF_TOKEN_MISSING'
      });
    }

    // Check if the origin is allowed
    if (!isAllowedOrigin) {
      console.warn(`CSRF origin check failed: ${origin} not in allowed list`);
      return res.status(403).json({
        success: false,
        message: 'Invalid request origin',
        code: 'INVALID_ORIGIN'
      });
    }

    // For a more secure implementation, validate the token against a stored value
    // This is a simplified version that checks if the token is at least properly formatted
    if (!/^[a-zA-Z0-9_-]{16,64}$/.test(csrfToken)) {
      console.warn(`CSRF token format invalid: ${csrfToken.substring(0, 10)}...`);
      return res.status(403).json({
        success: false,
        message: 'Invalid CSRF token format',
        code: 'INVALID_CSRF_TOKEN'
      });
    }

    // In a real implementation, you would validate against a stored token
    // For now, we're just checking format and presence
  }

  // Always allow in development mode
  next();
};

// Disable CSRF protection for now to debug CORS issues
// app.use('/api/contact', csrfProtection);
// app.use('/api/contact/brochure', csrfProtection);

// Rate limiting with production-ready configuration
const apiLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'production' ? 5 * 60 * 1000 : 15 * 60 * 1000, // 5 minutes in production, 15 in dev
  max: process.env.NODE_ENV === 'production' ? 60 : 100, // Stricter limits in production
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: JSON.stringify({
    error: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }),
  keyGenerator: (req) => {
    // Use a combination of IP and user agent for better rate limiting
    const ip = req.ip || req.connection.remoteAddress;

    // In production, use IP only to avoid bypassing rate limits with different user agents
    if (process.env.NODE_ENV === 'production') {
      return ip;
    }

    // In development, use a combination for testing
    const userAgent = req.headers['user-agent'] || 'unknown';
    return `${ip}-${userAgent.substring(0, 20)}`;
  },
  skip: (req, res) => {
    // Skip rate limiting for health checks and OPTIONS requests
    return req.path === '/api/health' || req.method === 'OPTIONS';
  },
  // Add handler for when rate limit is exceeded
  handler: (req, res, next, options) => {
    console.warn(`Rate limit exceeded: ${req.ip} - ${req.method} ${req.originalUrl}`);

    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(options.windowMs / 1000)
    });
  },
  // Add draft-7 headers
  draft_polli_ratelimit_headers: true
});

// Separate limiter for contact form submissions to prevent spam
const contactFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 5 : 20, // 5 submissions per hour in production
  standardHeaders: true,
  legacyHeaders: false,
  message: JSON.stringify({
    error: 'Too many form submissions, please try again later.',
    code: 'FORM_SUBMISSION_LIMIT_EXCEEDED'
  }),
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  }
});

const staticLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 200 : 300, // 200 requests per minute in production
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  skip: (req, res) => {
    // Skip rate limiting for common static assets in production
    if (process.env.NODE_ENV === 'production') {
      const path = req.path.toLowerCase();
      return path.endsWith('.css') ||
             path.endsWith('.js') ||
             path.endsWith('.png') ||
             path.endsWith('.jpg') ||
             path.endsWith('.svg') ||
             path.endsWith('.ico');
    }
    return false;
  }
});

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Apply rate limiting
app.use('/api', apiLimiter); // Stricter limits for API endpoints
app.use('/api/contact', contactFormLimiter); // Specific limits for contact form
app.use('/api/contact/brochure', contactFormLimiter); // Specific limits for brochure requests
app.use(staticLimiter); // More lenient limits for static assets

// We'll implement a simpler response time tracking later
// For now, removing this to fix the server crash

// Serve brochure files from multiple locations with caching
app.use('/brochures', express.static(path.join(__dirname, 'assets'), {
  maxAge: '1d', // Cache for 1 day
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

app.use('/public', express.static(path.join(__dirname, '../public'), {
  maxAge: '1d', // Cache for 1 day
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  maxAge: '1d', // Cache for 1 day
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

// Serve static files with proper MIME types and caching
app.use('/js', express.static(path.join(__dirname, '../public/js'), {
  maxAge: '1d', // Cache for 1 day
  setHeaders: (res, path) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

app.use('/assets/vendor/lenis', express.static(path.join(__dirname, '../public/assets/vendor/lenis'), {
  maxAge: '1d', // Cache for 1 day
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

app.use('/icons', express.static(path.join(__dirname, '../public/icons'), {
  maxAge: '7d', // Cache for 7 days
  setHeaders: (res, path) => {
    if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
    res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days
  }
}));

app.use('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
  res.sendFile(path.join(__dirname, '../public/manifest.json'));
});

// Configure proper MIME types with enhanced handling for JavaScript modules
// Add JSX to the list of extensions for JavaScript
// mime.define('application/javascript', ['js', 'mjs', 'jsx']);

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.jsx': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  // Handle data URLs and base64 content
  'data:text/jsx;base64': 'application/javascript',
  'data:text/javascript;base64': 'application/javascript',
  'data:module': 'application/javascript'
};

// Special middleware to handle module scripts and data URLs
app.use((req, res, next) => {
  const url = req.url;

  // Handle data URLs
  if (url.includes('data:text/jsx;base64') ||
      url.includes('data:text/javascript;base64') ||
      url.includes('data:module')) {
    res.setHeader('Content-Type', 'application/javascript');
    return next();
  }

  // Handle JavaScript module requests
  if (url.endsWith('.js') || url.endsWith('.mjs') || url.endsWith('.jsx')) {
    res.setHeader('Content-Type', 'application/javascript');
  }

  // Handle query parameters that might contain data URLs
  if (req.query && Object.keys(req.query).some(key =>
    typeof req.query[key] === 'string' &&
    (req.query[key].includes('data:text/jsx;base64') ||
     req.query[key].includes('data:text/javascript;base64') ||
     req.query[key].includes('data:module'))
  )) {
    res.setHeader('Content-Type', 'application/javascript');
  }

  next();
});

// Custom middleware for serving static files with proper MIME types
app.use((req, res, next) => {
  // Only handle GET requests for static files
  if (req.method !== 'GET') {
    return next();
  }

  // Get the file path
  let filePath = req.path;

  // Skip API routes
  if (filePath.startsWith('/api/')) {
    return next();
  }

  // On Render, redirect to frontend service
  const isRender = process.env.RENDER === 'true' ||
                  process.env.RENDER_EXTERNAL_URL ||
                  process.env.RENDER_SERVICE_ID;

  if (isRender) {
    console.log(`Static file request on Render, redirecting: ${filePath}`);
    return res.redirect(`https://alfanio.onrender.com${filePath}`);
  }

  // For local development, continue with static file serving
  console.log(`Attempting to serve static file: ${filePath}`);

  // Handle root path
  if (filePath === '/') {
    filePath = '/index.html';
  }

  // Try multiple possible paths for static files
  const possiblePaths = [
    path.join(__dirname, '../dist', filePath),
    path.join(__dirname, '../../frontend/dist', filePath),
    path.join(__dirname, '../../../frontend/dist', filePath),
    path.join(__dirname, '../../../../frontend/dist', filePath)
  ];

  // Find the first existing file
  let fullPath = null;
  for (const p of possiblePaths) {
    try {
      const stats = fs.statSync(p);
      if (stats.isFile()) {
        fullPath = p;
        break;
      }
    } catch (err) {
      // File doesn't exist, try next path
    }
  }

  // Check if any file was found
  if (!fullPath) {
    return next(); // No file found, let Express handle it
  }

  // File exists, serve it with proper MIME type

    // Set appropriate MIME type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream'; // Default content type

    // Use mime-types package to get the correct MIME type
    contentType = mime.lookup(ext) || contentType;

    // Special handling for JavaScript files
    if (filePath.endsWith('.js') || filePath.endsWith('.mjs') || filePath.endsWith('.jsx')) {
      contentType = 'application/javascript';
    }

    // Special handling for data URLs in query parameters
    if (req.url.includes('data:text/jsx;base64')) {
      contentType = 'application/javascript';
    }

    // Set cache headers based on file type
    let cacheControl = 'public, max-age=86400'; // Default: 1 day

    if (filePath.endsWith('.html')) {
      // Don't cache HTML files
      cacheControl = 'no-cache, no-store, must-revalidate';
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (filePath.endsWith('.js') || filePath.endsWith('.mjs') || filePath.endsWith('.jsx') || filePath.endsWith('.css')) {
      // Cache JS and CSS files for 1 day with validation
      cacheControl = 'public, max-age=86400, must-revalidate';
    } else if (filePath.match(/\.(jpg|jpeg|png|gif|ico|svg|webp)$/)) {
      // Cache images for 7 days
      cacheControl = 'public, max-age=604800, immutable';
    } else if (filePath.match(/\.(woff|woff2|ttf|otf|eot)$/)) {
      // Cache fonts for 30 days
      cacheControl = 'public, max-age=2592000, immutable';
    } else if (filePath.endsWith('.json')) {
      // Cache JSON files for 1 hour
      cacheControl = 'public, max-age=3600, must-revalidate';
    }

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', cacheControl);
    res.setHeader('Vary', 'Accept-Encoding');

    // Stream the file
    const stream = fs.createReadStream(fullPath);
    stream.pipe(res);
  });

// Fallback to standard static file serving
app.use(express.static(path.join(__dirname, '../dist'), {
  maxAge: '1d', // Default cache for 1 day
  etag: true, // Enable ETag for better caching
  lastModified: true, // Enable Last-Modified for better caching
  setHeaders: (res, filePath) => {
    // This is a fallback, most files should be handled by the custom middleware above
    const ext = path.extname(filePath).toLowerCase();

    // Use mime-types package to get the correct MIME type
    let contentType = mime.lookup(ext) || 'application/octet-stream';

    // Special handling for JavaScript files
    if (filePath.endsWith('.js') || filePath.endsWith('.mjs') || filePath.endsWith('.jsx')) {
      contentType = 'application/javascript';
    }

    res.setHeader('Content-Type', contentType);

    // Set appropriate cache headers based on file type
    if (filePath.endsWith('.html')) {
      // Don't cache HTML files
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (filePath.endsWith('.js') || filePath.endsWith('.mjs') || filePath.endsWith('.jsx') || filePath.endsWith('.css')) {
      // Cache JS and CSS files for 1 day with validation
      res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate');
    } else if (filePath.match(/\.(jpg|jpeg|png|gif|ico|svg|webp)$/)) {
      // Cache images for 7 days
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    } else if (filePath.match(/\.(woff|woff2|ttf|otf|eot)$/)) {
      // Cache fonts for 30 days
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    } else if (filePath.endsWith('.json')) {
      // Cache JSON files for 1 hour
      res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
    } else {
      // Default cache for 1 day
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }

    // Add Vary header for proper caching with compression
    res.setHeader('Vary', 'Accept-Encoding');
  }
}));

// API routes are defined elsewhere in this file

// Serve static files from the frontend/dist directory
app.use(express.static(path.resolve(__dirname, '../../frontend/dist')));

// For any routes that don't match an API route or static file, serve the index.html
app.get('*', (req, res) => {
  // Check if the request is for an API endpoint
  if (req.originalUrl.startsWith('/api')) {
    // Return 404 for unknown API endpoints
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
  }

  // On Render, redirect to frontend service
  const isRender = process.env.RENDER === 'true' ||
                  process.env.RENDER_EXTERNAL_URL ||
                  process.env.RENDER_SERVICE_ID;

  if (isRender) {
    console.log(`Non-API request on Render, redirecting: ${req.originalUrl}`);
    return res.redirect(`https://alfanio.onrender.com${req.originalUrl}`);
  }

  // For local development, serve the frontend index.html file
  // This enables client-side routing
  console.log(`Serving frontend index.html for: ${req.originalUrl}`);
  res.sendFile(path.resolve(__dirname, '../../frontend/dist/index.html'));
});

// MongoDB connection with improved retry logic and production readiness
const connectWithRetry = async (retries = 5, delay = 5000) => {
  let currentRetry = 0;

  // Determine MongoDB URI based on environment
  const getMongoURI = () => {
    // For production, use MongoDB Atlas
    if (process.env.NODE_ENV === 'production') {
      // First check if a complete MONGODB_URI is provided
      if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb+srv://')) {
        console.log('Using complete MongoDB URI from environment variables');
        return process.env.MONGODB_URI;
      }

      // Otherwise, construct from individual components
      const username = encodeURIComponent(process.env.MONGO_USERNAME || '');
      const password = encodeURIComponent(process.env.MONGO_PASSWORD || '');
      const cluster = process.env.MONGO_CLUSTER || '';
      const dbName = process.env.MONGO_DB_NAME || 'alfanio';

      if (!username || !password || !cluster) {
        console.warn('MongoDB Atlas credentials not fully configured. Check environment variables.');
      }

      // MongoDB Atlas connection string
      const uri = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority`;
      console.log(`Constructed MongoDB URI: ${uri.replace(password, '********')}`);
      return uri;
    }

    // For development, use local MongoDB or specified URI
    const devUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/alfanio';
    console.log(`Using development MongoDB URI: ${devUri.includes('mongodb+srv://') ? devUri.replace(/mongodb\+srv:\/\/.*?@/, 'mongodb+srv://******@') : devUri}`);
    return devUri;
  };

  while (currentRetry < retries) {
    try {
      console.log(`MongoDB connection attempt ${currentRetry + 1}/${retries}`);

      const mongoURI = getMongoURI();
      console.log(`Connecting to MongoDB ${process.env.NODE_ENV === 'production' ? 'Atlas' : 'local'} database...`);

      // Connect with no options - this is the most compatible approach
      console.log('Connecting to MongoDB with no options (most compatible approach)...');
      await mongoose.connect(mongoURI);

      console.log('MongoDB connected successfully');

      // Add connection event listeners with improved error handling
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);

        // Handle specific error types
        if (err.name === 'MongoNetworkError' ||
            err.name === 'MongoServerSelectionError' ||
            err.message.includes('topology was destroyed')) {
          console.log('Attempting to reconnect to MongoDB due to network or server selection error...');
          setTimeout(() => connectWithRetry(retries, delay), delay);
        } else {
          // Log other errors but don't automatically reconnect to avoid infinite loops
          console.error('MongoDB error (not automatically reconnecting):', err.message);
        }
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected. Attempting to reconnect...');
        setTimeout(() => connectWithRetry(retries, delay), delay);
      });

      // Add more robust connection monitoring
      mongoose.connection.on('connected', () => {
        console.log('MongoDB connection established');

        // Log connection details in development
        if (process.env.NODE_ENV !== 'production') {
          console.log(`Connected to: ${mongoose.connection.host}/${mongoose.connection.name}`);
        }
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected successfully');
      });

      // Add graceful shutdown handling
      process.on('SIGINT', async () => {
        try {
          await mongoose.connection.close();
          console.log('MongoDB connection closed due to application termination');
          process.exit(0);
        } catch (err) {
          console.error('Error during MongoDB connection close:', err);
          process.exit(1);
        }
      });

      return;
    } catch (error) {
      currentRetry++;

      // Log detailed error information
      console.error(`MongoDB connection error (attempt ${currentRetry}/${retries}):`);
      console.error(`- Error message: ${error.message}`);
      console.error(`- Error name: ${error.name}`);
      console.error(`- Error code: ${error.code || 'N/A'}`);

      // Check for specific error types and provide more helpful messages
      if (error.name === 'MongoParseError') {
        console.error('This appears to be an issue with the MongoDB connection string format.');
        console.error('Please check your MONGODB_URI environment variable.');
      } else if (error.name === 'MongoServerSelectionError') {
        console.error('Unable to connect to any MongoDB server in the cluster.');
        console.error('Please check your network connection and MongoDB Atlas status.');
      } else if (error.message.includes('option') && error.message.includes('not supported')) {
        console.error('Using an unsupported MongoDB driver option. Please check your connection options.');
        // Log the specific option that's causing the problem
        const optionMatch = error.message.match(/option (\w+) is not supported/);
        if (optionMatch && optionMatch[1]) {
          console.error(`The problematic option is: ${optionMatch[1]}`);
        }
      }

      if (currentRetry >= retries) {
        console.error('Maximum MongoDB connection retries reached. Exiting retry loop.');
        // Don't exit the process, just log the error
        return;
      }

      // Wait before next retry with exponential backoff
      const waitTime = delay * Math.pow(1.5, currentRetry);
      console.log(`Waiting ${waitTime}ms before next connection attempt...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

// Start the connection process
connectWithRetry();

// Contact schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Add phone number validation for international numbers
contactSchema.path('phone').validate(function(v) {
  return /^[+]?[0-9\s\-()]{8,20}$/.test(v);
}, 'Please enter a valid phone number');

const Contact = mongoose.model('Contact', contactSchema);

// Brochure request schema
const brochureRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: String,
  type: { type: String, default: 'brochure' },
  createdAt: { type: Date, default: Date.now }
});

// Add phone number validation for international numbers
brochureRequestSchema.path('phone').validate(function(v) {
  return /^[+]?[0-9\s\-()]{8,20}$/.test(v);
}, 'Please enter a valid phone number');

const BrochureRequest = mongoose.model('BrochureRequest', brochureRequestSchema);

// Use the enhanced email service
import emailService from './services/emailService.js';

// Initialize email service
(async () => {
  try {
    await emailService.initialize();
    console.log('Email service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize email service:', error);
  }
})();

// Simplified email sending function that uses the email service
const sendEmail = async (mailOptions) => {
  try {
    // Skip email sending if configured
    if (process.env.SKIP_EMAIL_SENDING === 'true') {
      console.log('Skipping email sending as configured by SKIP_EMAIL_SENDING');
      console.log('Email would have been sent to:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      return { messageId: 'dummy-id-' + Date.now(), skipped: true };
    }

    // Add default email template styling
    const defaultStyle = `
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        h2 { color: #FECC00; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .footer { margin-top: 30px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 10px; }
      </style>
    `;

    // Add company info to all emails
    const companyInfo = `
      <div class="footer">
        <p>Alfanio LTD</p>
        <p>This is an automated message, please do not reply directly to this email.</p>
      </div>
    `;

    // Wrap HTML content with styling if it exists
    if (mailOptions.html) {
      mailOptions.html = `
        <html>
          <head>${defaultStyle}</head>
          <body>
            <div class="container">
              ${mailOptions.html}
              ${companyInfo}
            </div>
          </body>
        </html>
      `;
    }

    // Send email using the email service
    const result = await emailService.sendEmail(mailOptions);

    return result;
  } catch (error) {
    console.error('Error in sendEmail wrapper:', error);
    return {
      messageId: 'error-' + Date.now(),
      error: error.message,
      failed: true
    };
  }
};

// API routes
app.get('/api/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    mongoConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    emailService: emailService.isInitialized ? 'connected' : 'disconnected'
  };

  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    console.error('Health check failed', error.message);
    healthcheck.message = error;
    res.status(503).json(healthcheck);
  }
});

// Import routes
import simpleContactRoutes from './routes/simpleContact.js';
import brochureRoutes from './routes/brochureRoutes.js';

// Use contact routes for both /api/contact and direct /contact endpoints
app.use('/api/contact', simpleContactRoutes);
app.use('/contact', simpleContactRoutes); // Add direct /contact endpoint for compatibility

// Use brochure routes
app.use('/api/brochure', brochureRoutes);
app.use('/brochure', brochureRoutes); // Add direct /brochure endpoint for compatibility

// Brochure request endpoint is now handled by simpleContactRoutes

// Brochure download endpoint
app.get('/api/brochure/download', (req, res) => {
  // Try multiple locations for the brochure file
  const possiblePaths = [
    path.join(__dirname, 'assets/brochure.pdf'),
    path.join(__dirname, 'assets/Alfanio.pdf'),
    path.join(__dirname, '../public/brochure.pdf'),
    path.join(__dirname, '../dist/brochure.pdf')
  ];

  // Find the first existing file
  const brochurePath = possiblePaths.find(path => fs.existsSync(path));

  if (!brochurePath) {
    console.error('Brochure file not found in any location', possiblePaths);
    return res.status(404).send('Brochure file not found');
  }

  // Set appropriate headers for better mobile compatibility
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="Alfanio-Brochure.pdf"');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

  // Get file stats for Content-Length header
  const stat = fs.statSync(brochurePath);
  res.setHeader('Content-Length', stat.size);

  console.log('Serving brochure from:', brochurePath);

  // Create a read stream and pipe it to the response
  const fileStream = fs.createReadStream(brochurePath);

  fileStream.on('error', (err) => {
    console.error('Brochure download stream error:', err);
    if (!res.headersSent) {
      res.status(500).send('Error downloading brochure');
    }
  });

  // Pipe the file to the response
  fileStream.pipe(res);
});

// Handle API 404 errors
app.use('/api/*', (req, res) => {
  console.log(`API endpoint not found: ${req.originalUrl}`);
  return res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// For all other routes, return a simple message
// This is a backend-only server on Render
app.get('*', (req, res) => {
  console.log(`Non-API request received: ${req.originalUrl}`);

  // Just return a simple message
  res.status(200).send(`
    <html>
      <head>
        <title>Alfanio Backend API</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #FECC00; }
          a { color: #FECC00; }
        </style>
      </head>
      <body>
        <h1>Alfanio Backend API Server</h1>
        <p>This is the backend API server for Alfanio. The frontend website is available at:</p>
        <p><a href="https://alfanio.onrender.com">https://alfanio.onrender.com</a></p>
        <p>You will be redirected to the frontend website in 5 seconds...</p>
        <script>
          setTimeout(function() {
            window.location.href = "https://alfanio.onrender.com";
          }, 5000);
        </script>
      </body>
    </html>
  `);
});

// Error handling middleware with improved logging and security
app.use((err, req, res, next) => {
  // Log the error with request ID for better debugging
  console.error(`[Error ${req.id}] Global error handler:`, err);

  // Check if this is a "file not found" error for frontend files
  if (err.code === 'ENOENT' && err.path && err.path.includes('/frontend/dist/')) {
    console.log('Frontend file not found error - redirecting to frontend service');
    return res.redirect('https://alfanio.onrender.com');
  }

  // Don't expose error details in production
  const isProduction = process.env.NODE_ENV === 'production';

  // Create a sanitized error response
  const errorResponse = {
    success: false,
    message: 'Internal server error',
    requestId: req.id, // Include request ID for support reference
    timestamp: new Date().toISOString()
  };

  // Only include error details in non-production environments
  if (!isProduction) {
    errorResponse.error = err.message;
    errorResponse.stack = err.stack;
  }

  // Set appropriate status code
  const statusCode = err.statusCode || 500;

  // Send error response
  res.status(statusCode).json(errorResponse);
});

const PORT = process.env.PORT || 5001;
const HOST = '0.0.0.0'; // Listen on all network interfaces

// Create server with timeout
const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`For local access: http://localhost:${PORT}`);

  // Provide a helpful message for mobile access
  console.log('To access from mobile devices, connect to the same WiFi network and use your computer\'s IP address');
  console.log('For example: http://<your-computer-ip>:5001');
  console.log('You can find your IP address by running "ipconfig" in Command Prompt');
});

// Set server timeouts
server.timeout = 120000;
server.keepAliveTimeout = 120000;

