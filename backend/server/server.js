import express from 'express';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
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
import { sendEmail, verifyEmailTransport, initEmailService } from './emailService.js';

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
      connectSrc: [
        "'self'",
        "https://www.google-analytics.com",
        ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : (process.env.NODE_ENV === 'production' ? [] : ["http://localhost:5001"])),
        "data:",
        "blob:"
      ],
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
// Configure CORS for specific origins
// Production origins are strictly whitelisted. Dev/LAN origins are only
// added when NODE_ENV is not 'production'.
const PRODUCTION_ORIGINS = [
  'https://alfanio.com',
  'https://www.alfanio.com',
  'https://alfanio.in',
  'https://www.alfanio.in',
  'https://alfanio.onrender.com',
  'https://alfanio-ltd.onrender.com'
];

const DEVELOPMENT_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5001',
  'http://localhost:5003',
  'http://localhost:5005',
  'http://localhost:5173',
  'http://192.168.31.56:3000',
  'http://192.168.31.56:5001',
  'http://192.168.31.56:5003',
  'http://192.168.31.56:5005',
  'http://192.168.31.56:5173'
];

const isProductionEnv = process.env.NODE_ENV === 'production';

const allowedOrigins = [
  ...PRODUCTION_ORIGINS,
  ...(isProductionEnv ? [] : DEVELOPMENT_ORIGINS),
  ...[process.env.CLIENT_URL, process.env.FRONTEND_URL].filter(Boolean)
];

// CORS configuration with specific origins
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, server-to-server, etc.)
    if (!origin) return callback(null, true);

    // Check if the origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In non-production environments be permissive to ease local development.
      if (!isProductionEnv) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cache-Control'],
  exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length'],
  maxAge: 86400 // 24 hours
}));

// Handle preflight requests for all routes
app.options('*', cors());

// Add custom CORS headers to all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Echo back origin only if it is on the whitelist (or we are not in production)
  if (origin && (allowedOrigins.includes(origin) || !isProductionEnv)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  res.header('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type, Content-Length');
  res.header('Access-Control-Allow-Credentials', 'true');
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

// Contact and brochure endpoints are public lead-capture forms.
// They are protected with CORS, validation and rate limits instead of CSRF tokens,
// because the frontend does not maintain an authenticated CSRF session.

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
      const username = process.env.MONGO_USERNAME;
      const password = process.env.MONGO_PASSWORD;
      const cluster = process.env.MONGO_CLUSTER || 'cluster0.0wbdp.mongodb.net';
      const dbName = process.env.MONGO_DB_NAME || 'Alfanio';

      if (!username || !password) {
        throw new Error('MongoDB credentials missing. Set MONGODB_URI or MONGO_USERNAME/MONGO_PASSWORD.');
      }

      // MongoDB Atlas connection string
      return `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${cluster}/${dbName}?retryWrites=true&w=majority`;
    }

    // For development, use local MongoDB as fallback
    return 'mongodb://localhost:27017/alfanio';
  };

  while (currentRetry < retries) {
    try {
  // console.log(`MongoDB connection attempt ${currentRetry + 1}/${retries}`);  // [removed by fix script]

      const mongoURI = getMongoURI();
  // console.log(`Connecting to MongoDB ${process.env.NODE_ENV === 'production' ? 'Atlas' : 'local'} database...`);  // [removed by fix script]

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

  // console.log('MongoDB connected successfully');  // [removed by fix script]

      // Add connection event listeners
      mongoose.connection.on('error', (err) => {
  // console.error('MongoDB connection error:', err);  // [removed by fix script]
        if (err.name === 'MongoNetworkError') {
  // console.log('Attempting to reconnect to MongoDB...');  // [removed by fix script]
          setTimeout(() => connectWithRetry(retries, delay), delay);
        }
      });

      mongoose.connection.on('disconnected', () => {
  // console.log('MongoDB disconnected. Attempting to reconnect...');  // [removed by fix script]
        setTimeout(() => connectWithRetry(retries, delay), delay);
      });

      // Add more robust connection monitoring
      mongoose.connection.on('connected', () => {
  // console.log('MongoDB connection established');  // [removed by fix script]
      });

      mongoose.connection.on('reconnected', () => {
  // console.log('MongoDB reconnected successfully');  // [removed by fix script]
      });

      return;
    } catch (error) {
      currentRetry++;
  // console.error(`MongoDB connection error (attempt ${currentRetry}/${retries}):`, error.message);  // [removed by fix script]

      if (currentRetry >= retries) {
  // console.error('Maximum MongoDB connection retries reached. Exiting retry loop.');  // [removed by fix script]
        // Don't exit the process, just log the error
        return;
      }

      // Wait before next retry with exponential backoff
      const waitTime = delay * Math.pow(1.5, currentRetry);
  // console.log(`Waiting ${waitTime}ms before next connection attempt...`);  // [removed by fix script]
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

// MongoDB is intentionally disabled for Render deployment. Lead capture now
// delivers email through Resend without blocking on database availability.

// Contact schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, default: '' },
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
const getEmailSettings = () => ({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '465', 10),
  secure: String(process.env.EMAIL_SECURE ?? 'true') === 'true',
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
  fromName: process.env.EMAIL_FROM_NAME || 'Alfanio India',
  to: process.env.EMAIL_TO || process.env.EMAIL_USER
});

const getResendSettings = () => ({
  apiKey: process.env.RESEND_API_KEY,
  from: process.env.RESEND_FROM || `"${escapeHtml(process.env.EMAIL_FROM_NAME || 'Alfanio India')}" <onboarding@resend.dev>`,
  to: process.env.EMAIL_TO || process.env.EMAIL_USER || 'alfanioindia@gmail.com'
});

const sendLeadEmail = async ({ subject, html, replyTo }) => {
  const settings = getResendSettings();

  if (!settings.apiKey || !settings.to) {
    const missing = [
      !settings.apiKey && 'RESEND_API_KEY',
      !settings.to && 'EMAIL_TO'
    ].filter(Boolean);

    const error = new Error(`Resend email service is not configured. Missing: ${missing.join(', ')}`);
    error.code = 'EMAIL_CONFIG_MISSING';
    error.missing = missing;
    throw error;
  }

  const resend = new Resend(settings.apiKey);
  const { data, error } = await resend.emails.send({
    from: settings.from,
    to: [settings.to],
    subject,
    html,
    replyTo
  });

  if (error) {
    const resendError = new Error(error.message || 'Resend email delivery failed');
    resendError.code = 'RESEND_DELIVERY_FAILED';
    resendError.details = error;
    throw resendError;
  }

  return data;
};

const createMailTransport = () => {
  // Determine if we're in production
  const isProduction = process.env.NODE_ENV === 'production';

  // Log email configuration status
  // console.log(`Configuring email transport for ${isProduction ? 'production' : 'development'} environment`);  // [removed by fix script]

  // Set up email transport configuration
  const emailSettings = getEmailSettings();

  if (!emailSettings.user || !emailSettings.pass) {
  // console.warn('Email credentials missing. Set EMAIL_USER and EMAIL_PASS to enable email delivery.');  // [removed by fix script]
    return null;
  }

  const transportConfig = {
    host: emailSettings.host,
    port: emailSettings.port,
    secure: emailSettings.secure,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    auth: {
      user: emailSettings.user,
      pass: emailSettings.pass
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
    transportConfig.debug = false;
    transportConfig.logger = false;
  }

  return nodemailer.createTransport(transportConfig);
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getMailDefaults = () => {
  const settings = getEmailSettings();
  return {
    from: `"${escapeHtml(settings.fromName)}" <${settings.user || 'no-reply@alfanio.in'}>`,
    to: settings.to || settings.user
  };
};

const getMissingEmailConfig = () => {
  const settings = getEmailSettings();
  return [
    !settings.user && 'EMAIL_USER',
    !settings.pass && 'EMAIL_PASS',
    !settings.to && 'EMAIL_TO'
  ].filter(Boolean);
};

const sendEmailConfigError = (res) => {
  const missing = getMissingEmailConfig();
  return res.status(503).json({
    success: false,
    code: 'EMAIL_CONFIG_MISSING',
    message: `Email service is not configured. Missing: ${missing.join(', ')}`,
    missing
  });
};

const sendAcceptedWithoutEmail = (res, message, extra = {}) =>
  res.json({
    success: true,
    message,
    emailSent: false,
    ...extra
  });

const sendEmailDeliveryError = (res, error, extra = {}) =>
  res.status(502).json({
    success: false,
    code: 'EMAIL_DELIVERY_FAILED',
    message: 'Message was received, but email delivery failed. Please check Resend settings.',
    emailSent: false,
    error: error.message,
    ...extra
  });

// SMTP verification is disabled because Render free instances block outbound
// SMTP ports. Email delivery uses the Resend HTTPS API instead.

// API routes
app.get('/api/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    mongoConnection: 'disabled',
    emailService: getResendSettings().apiKey ? 'connected' : 'disconnected',
    emailProvider: 'resend'
  };

  try {
    res.status(200).json(healthcheck);
  } catch (error) {
  // console.error('Health check failed', error.message);  // [removed by fix script]
    healthcheck.message = error;
    res.status(503).json(healthcheck);
  }
});

// Health check endpoint for Render
app.get('/healthz', (req, res) => {
  const healthcheck = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  };

  try {
    res.status(200).json(healthcheck);
  } catch (error) {
  // console.error('Health check failed', error.message);  // [removed by fix script]
    res.status(503).json({
      status: 'error',
      message: error.message
    });
  }
});

// Root endpoint to redirect to frontend
app.get('/', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://www.alfanio.com';
  // console.log('Root endpoint accessed, redirecting to frontend URL:', frontendUrl);  // [removed by fix script]
  res.redirect(302, frontendUrl);
});

// Contact form endpoint - both with and without /api prefix
app.post(['/api/contact', '/contact'], async (req, res) => {
  // console.log('Received contact form submission', req.body);  // [removed by fix script]
  // console.log('Request origin:', req.headers.origin);  // [removed by fix script]

  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim();
    const phone = String(req.body.phone || '').trim();
    const message = String(req.body.message || '').trim();

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and phone are required'
      });
    }

    try {
      const info = await sendLeadEmail({
        subject: 'New Contact Form Submission',
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Message:</strong> ${escapeHtml(message || 'Not provided')}</p>
        `,
        replyTo: email
      });

      return res.json({
        success: true,
        message: 'Message sent successfully',
        emailId: info?.id,
        savedToDatabase: false,
        emailProvider: 'resend'
      });
    } catch (emailError) {
      return sendEmailDeliveryError(res, emailError, { savedToDatabase: false, emailProvider: 'resend' });
    }
  } catch (error) {
  // console.error('Contact form error:', error);  // [removed by fix script]

    res.status(500).json({
      success: false,
      message: 'Failed to process contact form',
      error: error.message
    });
  }
});

// Brochure request endpoint - both with and without /api prefix
app.post(['/api/contact/brochure', '/contact/brochure'], async (req, res) => {
  // console.log('Received brochure request', req.body);  // [removed by fix script]
  // console.log('Request origin:', req.headers.origin);  // [removed by fix script]

  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim();
    const phone = String(req.body.phone || '').trim();
    const message = String(req.body.message || '').trim();

    // Extract phone number with or without country code
    const phoneNumber = phone || '';

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    try {
      const info = await sendLeadEmail({
        subject: 'New Brochure Request',
        html: `
          <h2>New Brochure Request</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phoneNumber)}</p>
          ${message ? `<p><strong>Message:</strong> ${escapeHtml(message)}</p>` : ''}
        `,
        replyTo: email
      });

      return res.json({
        success: true,
        message: 'Brochure request received and email sent successfully',
        emailId: info?.id,
        emailProvider: 'resend'
      });
    } catch (emailError) {
      return sendEmailDeliveryError(res, emailError, { emailProvider: 'resend' });
    }
  } catch (error) {
  // console.error('Brochure request error:', error);  // [removed by fix script]

    res.status(500).json({
      success: false,
      message: 'Failed to process brochure request',
      error: error.message
    });
  }
});

// Brochure download endpoint - both with and without /api prefix
app.get(['/api/brochure/download', '/brochure/download'], (_, res) => {
  // Try multiple locations for the brochure file
  const possiblePaths = [
    path.join(__dirname, 'assets/brochure.pdf'),
    path.join(__dirname, 'assets/Alfanio.pdf'),
    path.join(__dirname, '../public/brochure.pdf'),
    path.join(__dirname, '../dist/brochure.pdf'),
    path.join(__dirname, 'server/assets/brochure.pdf'),
    path.join(__dirname, 'server/assets/Alfanio.pdf'),
    path.join(__dirname, '../assets/brochure.pdf'),
    path.join(__dirname, '../assets/Alfanio.pdf')
  ];

  // console.log('Searching for brochure in the following locations:');  // [removed by fix script]
  // possiblePaths.forEach(p => console.log(`- ${p}`));  // [removed by fix script]

  // Find the first existing file
  const brochurePath = possiblePaths.find(p => fs.existsSync(p));

  if (!brochurePath) {
  // console.error('Brochure file not found in any location', possiblePaths);  // [removed by fix script]
    return res.status(404).json({
      success: false,
      message: 'Brochure file not found',
      searchedPaths: possiblePaths
    });
  }

  // Set appropriate headers for better mobile compatibility
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="Alfanio-Brochure.pdf"');
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'https://www.alfanio.com');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

  try {
    // Get file stats for Content-Length header
    const stat = fs.statSync(brochurePath);
    res.setHeader('Content-Length', stat.size);

  // console.log('Serving brochure from:', brochurePath);  // [removed by fix script]

    // Create a read stream and pipe it to the response
    const fileStream = fs.createReadStream(brochurePath);

    fileStream.on('error', (err) => {
  // console.error('Brochure download stream error:', err);  // [removed by fix script]
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error downloading brochure',
          error: err.message
        });
      }
    });

    // Pipe the file to the response
    fileStream.pipe(res);
  } catch (error) {
  // console.error('Error serving brochure file:', error);  // [removed by fix script]
    res.status(500).json({
      success: false,
      message: 'Error serving brochure file',
      error: error.message
    });
  }
});

// Serve static files from multiple possible locations
const staticPaths = [
  path.join(__dirname, '../dist'),
  path.join(__dirname, '../../frontend/dist'),
  path.join(__dirname, '../../frontend/build'),
  path.join(__dirname, '../public'),
  // Add Render-specific paths
  '/opt/render/project/src/frontend/dist',
  '/opt/render/project/src/frontend/build',
  '/opt/render/project/src/dist'
];

// Find existing directories and serve static files from them
staticPaths.forEach(staticPath => {
  if (fs.existsSync(staticPath)) {
  // console.log('Serving static files from:', staticPath);  // [removed by fix script]
    app.use(express.static(staticPath, {
      maxAge: '1d', // Cache for 1 day
      etag: true,
      lastModified: true
    }));
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  // Check multiple possible locations for index.html
  const possiblePaths = [
    path.join(__dirname, '../dist/index.html'),
    path.join(__dirname, '../../frontend/dist/index.html'),
    path.join(__dirname, '../../frontend/build/index.html'),
    path.join(__dirname, '../public/index.html'),
    // Add Render-specific paths
    '/opt/render/project/src/frontend/dist/index.html',
    '/opt/render/project/src/frontend/build/index.html',
    '/opt/render/project/src/dist/index.html'
  ];

  // Find the first existing file
  const indexPath = possiblePaths.find(p => fs.existsSync(p));

  if (indexPath) {
  // console.log('Serving frontend from:', indexPath);  // [removed by fix script]
    return res.sendFile(indexPath);
  }

  // If index.html doesn't exist, redirect to the frontend URL
  // console.log('Frontend files not found, redirecting to frontend URL');  // [removed by fix script]

  // Get the frontend URL from environment or use default
  const frontendUrl = process.env.FRONTEND_URL || 'https://alfanio.onrender.com';

  // Perform a direct 302 redirect to the frontend URL
  res.redirect(302, frontendUrl);
});

// Error handling middleware with improved logging and security
app.use((err, req, res, _next) => {
  // Log the error with request ID for better debugging
  // console.error(`[Error ${req.id || 'unknown'}] Global error handler:`, err);  // [removed by fix script]

  // Don't expose error details in production
  const isProduction = process.env.NODE_ENV === 'production';

  // Create a sanitized error response
  const errorResponse = {
    success: false,
    message: 'Internal server error',
    requestId: req.id || crypto.randomBytes(8).toString('hex'), // Include request ID for support reference
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

const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 10000 : 5005);
const HOST = '0.0.0.0'; // Listen on all network interfaces

// Create server with timeout
const server = app.listen(PORT, HOST, () => {
  // console.log(`Server running on http://${HOST}:${PORT}`);  // [removed by fix script]
  // console.log(`For local access: http://localhost:${PORT}`);  // [removed by fix script]

  // Provide a helpful message for mobile access
  // console.log('To access from mobile devices, connect to the same WiFi network and use your computer\'s IP address');  // [removed by fix script]
  // console.log('For example: http://<your-computer-ip>:5001');  // [removed by fix script]
  // console.log('You can find your IP address by running "ipconfig" in Command Prompt');  // [removed by fix script]
});

// Set server timeouts
server.timeout = 120000;
server.keepAliveTimeout = 120000;

