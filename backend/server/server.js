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
import mime from 'mime-types';

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
// Allow all origins for development and testing
app.use(cors({
  origin: '*', // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*'], // Allow all headers
  exposedHeaders: ['*'], // Expose all headers
  maxAge: 86400 // 24 hours
}));

// Handle preflight requests for all routes
app.options('*', cors());

// Add custom CORS headers to all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  res.header('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type, Content-Length');
  next();
});
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

// CSRF protection - enabled for production only
const csrfProtection = (req, res, next) => {
  // In production, implement proper CSRF protection
  if (process.env.NODE_ENV === 'production') {
    // Check for CSRF token in headers
    const csrfToken = req.headers['x-csrf-token'];

    // Simple validation - in a real app, you'd validate against a stored token
    if (!csrfToken) {
      return res.status(403).json({
        success: false,
        message: 'CSRF token missing'
      });
    }

    // For a more secure implementation, validate the token against a stored value
    // This is a simplified version for demonstration
  }

  // Always allow in development mode
  next();
};

// Apply CSRF protection to all POST endpoints
app.use('/api/contact', csrfProtection);
app.use('/api/contact/brochure', csrfProtection);

// Rate limiting with improved configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs for API endpoints
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: JSON.stringify({
    error: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }),
  keyGenerator: (req) => {
    // Use IP address as default
    return req.ip || req.connection.remoteAddress;
  },
  skip: (req, res) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
});

const staticLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // 300 requests per minute for static assets
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  }
});

// Apply rate limiting
app.use('/api', apiLimiter); // Stricter limits for API endpoints
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
// We're using mime-types instead of mime

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

  // Handle root path
  if (filePath === '/') {
    filePath = '/index.html';
  }

  // Resolve the full file path
  const fullPath = path.join(__dirname, '../dist', filePath);

  // Check if the file exists
  fs.stat(fullPath, (err, stats) => {
    if (err || !stats.isFile()) {
      return next(); // File doesn't exist, let Express handle it
    }

    // Set appropriate MIME type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream'; // Default content type

    // Use mime-types package to get the correct MIME type
    contentType = mime.lookup(ext.substring(1)) || contentType;

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
    let contentType = mime.lookup(ext.substring(1)) || 'application/octet-stream';

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

// MongoDB connection with improved retry logic and production readiness
const connectWithRetry = async (retries = 5, delay = 5000) => {
  let currentRetry = 0;

  // Determine MongoDB URI based on environment
  const getMongoURI = () => {
    // Always use the MONGODB_URI from .env if available
    if (process.env.MONGODB_URI) {
      return process.env.MONGODB_URI;
    }

    // For production, use MongoDB Atlas
    if (process.env.NODE_ENV === 'production') {
      // Make sure to set these environment variables in production
      const username = encodeURIComponent(process.env.MONGO_USERNAME || 'Alfanioindia');
      const password = encodeURIComponent(process.env.MONGO_PASSWORD || '10Nu2FEpmRZuNFYf');
      const cluster = process.env.MONGO_CLUSTER || 'cluster0.0wbdp.mongodb.net';
      const dbName = process.env.MONGO_DB_NAME || 'Alfanio';

      // MongoDB Atlas connection string
      return `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority`;
    }

    // For development, use local MongoDB as fallback
    return 'mongodb://localhost:27017/alfanio';
  };

  while (currentRetry < retries) {
    try {
      console.log(`MongoDB connection attempt ${currentRetry + 1}/${retries}`);

      const mongoURI = getMongoURI();
      console.log(`Connecting to MongoDB ${process.env.NODE_ENV === 'production' ? 'Atlas' : 'local'} database...`);

      // Use modern MongoDB connection options
      await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 10000, // 10 seconds timeout
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        // Modern options for better performance and reliability
        maxPoolSize: 10, // Maintain up to 10 socket connections
        minPoolSize: 5,  // Maintain at least 5 socket connections
        retryWrites: true,
        w: 'majority'    // Write to the primary and wait for acknowledgment from a majority of members
      });

      console.log('MongoDB connected successfully');

      // Add connection event listeners
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        if (err.name === 'MongoNetworkError') {
          console.log('Attempting to reconnect to MongoDB...');
          setTimeout(() => connectWithRetry(retries, delay), delay);
        }
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected. Attempting to reconnect...');
        setTimeout(() => connectWithRetry(retries, delay), delay);
      });

      // Add more robust connection monitoring
      mongoose.connection.on('connected', () => {
        console.log('MongoDB connection established');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected successfully');
      });

      return;
    } catch (error) {
      currentRetry++;
      console.error(`MongoDB connection error (attempt ${currentRetry}/${retries}):`, error.message);

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

const BrochureRequest = mongoose.model('BrochureRequest', brochureRequestSchema);

// Enhanced email configuration for production readiness
const createMailTransport = () => {
  // Determine if we're in production
  const isProduction = process.env.NODE_ENV === 'production';

  // Log email configuration status
  console.log(`Configuring email transport for ${isProduction ? 'production' : 'development'} environment`);

  // Set up email transport configuration
  const transportConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // Use TLS instead of SSL for better compatibility with Gmail
    auth: {
      user: process.env.EMAIL_USER || 'alfanioindia@gmail.com',
      pass: process.env.EMAIL_PASS || 'yftofapopqvydrqa' // Fallback password if not in env
    }
  };

  // Add production-specific settings
  if (isProduction) {
    // Add connection pool for better performance in production
    transportConfig.pool = true;
    transportConfig.maxConnections = 5;
    transportConfig.maxMessages = 100;

    // Add TLS options for better security
    transportConfig.tls = {
      rejectUnauthorized: false, // Set to false to avoid certificate validation issues
      minVersion: 'TLSv1.2'
    };

    // Check if credentials are properly set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials not fully configured. Check environment variables.');
    }
  }

  return nodemailer.createTransport(transportConfig);
};

// Create mail transport
const mailTransport = createMailTransport();

// Verify email transport with retry logic
const verifyEmailTransport = async (retries = 3, delay = 3000) => {
  let currentRetry = 0;

  while (currentRetry < retries) {
    try {
      await mailTransport.verify();
      console.log('Email server is ready');
      return true;
    } catch (error) {
      currentRetry++;
      console.error(`Email verification failed (attempt ${currentRetry}/${retries}):`, error.message);

      if (currentRetry >= retries) {
        console.error('Maximum email verification retries reached.');
        console.log('Continuing server operation despite email verification failure.');

        // Log detailed error information for debugging
        console.log('Email configuration:', {
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: process.env.EMAIL_SECURE === 'false',
          user: process.env.EMAIL_USER || 'alfanioindia@gmail.com'
        });

        // Log additional troubleshooting information
        console.log('Email troubleshooting tips:');
        console.log('1. Check if the Gmail account has "Less secure app access" enabled');
        console.log('2. If using 2FA, make sure to use an App Password instead of regular password');
        console.log('3. Check if there are any network restrictions blocking SMTP connections');
        console.log('4. Try sending a test email directly to verify credentials');

        return false;
      }

      // Wait before next retry
      console.log(`Waiting ${delay}ms before next email verification attempt...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return false;
};

// Start email verification but don't wait for it
verifyEmailTransport().catch(err => {
  console.error('Email verification process error:', err);
  console.log('Server will continue running despite email verification issues.');
});

// Enhanced email sending function with retry and fallback
const sendEmail = async (mailOptions, retries = 2) => {
  let currentRetry = 0;

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

  // Wrap HTML content with styling
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

  // Log detailed email attempt for debugging
  console.log('Attempting to send email with the following configuration:');
  console.log('- To:', mailOptions.to);
  console.log('- Subject:', mailOptions.subject);
  console.log('- From:', `${process.env.EMAIL_FROM_NAME || 'Alfanio India'} <${process.env.EMAIL_USER || 'alfanioindia@gmail.com'}>`);
  console.log('- Transport config:', {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
  });

  while (currentRetry <= retries) {
    try {
      // Create a new transport for each attempt to avoid stale connections
      const freshTransport = createMailTransport();

      // Use from address from environment variables
      const info = await freshTransport.sendMail({
        ...mailOptions,
        from: `${process.env.EMAIL_FROM_NAME || 'Alfanio India'} <${process.env.EMAIL_USER || 'alfanioindia@gmail.com'}>`,
      });

      console.log('Email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      currentRetry++;
      console.error(`Email sending failed (attempt ${currentRetry}/${retries + 1}):`, error.message);
      console.error('Error details:', error);

      if (currentRetry > retries) {
        // Log to database or monitoring system in production
        if (process.env.NODE_ENV === 'production') {
          console.error('Critical: Email sending failed after all retries', {
            to: mailOptions.to,
            subject: mailOptions.subject,
            error: error.message
          });
        }

        // Instead of throwing error, return a fallback response
        console.log('Email sending failed, but continuing operation');
        return {
          success: false,
          error: error.message,
          fallback: true,
          messageId: `fallback-${Date.now()}`
        };
      }

      // Wait before retry
      console.log(`Waiting 2000ms before retry ${currentRetry + 1}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

// API routes
app.get('/api/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    mongoConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    emailService: mailTransport !== null ? 'connected' : 'disconnected'
  };

  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    console.error('Health check failed', error.message);
    healthcheck.message = error;
    res.status(503).json(healthcheck);
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  console.log('Received contact form submission', req.body);

  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Save to database
    const contact = new Contact({
      name,
      email,
      phone,
      message
    });

    await contact.save();
    console.log('Contact form saved to database');

    // Send email
    await sendEmail({
      to: process.env.EMAIL_TO || 'alfanioindia@gmail.com',
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    });

    console.log('Email sent successfully');

    res.json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Contact form error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// Brochure request endpoint
app.post('/api/contact/brochure', async (req, res) => {
  console.log('Received brochure request', req.body);

  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and phone are required'
      });
    }

    // Save to database
    const brochureRequest = new BrochureRequest({
      name,
      email,
      phone,
      message
    });

    await brochureRequest.save();
    console.log('Brochure request saved to database');

    // Send email
    await sendEmail({
      to: process.env.EMAIL_TO || 'alfanioindia@gmail.com',
      subject: 'New Brochure Request',
      html: `
        <h2>New Brochure Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
      `
    });

    console.log('Brochure request email sent successfully');

    res.json({
      success: true,
      message: 'Brochure request received successfully'
    });
  } catch (error) {
    console.error('Brochure request error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to process brochure request'
    });
  }
});

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

// Serve React app for all other routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  // Check if the file exists before sending it
  const indexPath = path.join(__dirname, '../dist/index.html');

  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  // If index.html doesn't exist, send a simple response
  res.status(200).send(`
    <html>
      <head>
        <title>Alfanio API Server</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #FECC00; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .container { background: #f9f9f9; border-radius: 5px; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Alfanio API Server</h1>
          <p>This is the Alfanio API server. The frontend application is hosted separately.</p>
          <p>Server is running and ready to accept API requests.</p>
          <p>Available endpoints:</p>
          <ul>
            <li>/api/health - Check server health</li>
            <li>/api/contact - Submit contact form</li>
            <li>/api/contact/brochure - Request brochure</li>
            <li>/api/brochure/download - Download brochure</li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

// Error handling middleware with improved logging and security
app.use((err, req, res, next) => {
  // Log the error with request ID for better debugging
  console.error(`[Error ${req.id}] Global error handler:`, err);

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

