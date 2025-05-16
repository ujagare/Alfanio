/**
 * Enhanced CORS middleware for Alfanio
 * This middleware provides robust CORS configuration for both development and production
 */

const cors = require('cors');

/**
 * Configure CORS middleware with appropriate settings
 * @param {Object} app - Express app instance
 */
const setupCors = (app) => {
  // Determine allowed origins based on environment
  const allowedOrigins = [
    'http://localhost:5001',
    'http://localhost:5173',
    'https://alfanio.onrender.com',
    'https://alfanio-frontend.onrender.com',
    'https://alfanio.in',
    'https://www.alfanio.in'
  ];

  // Use environment variable if set, otherwise use the array
  const corsOrigin = process.env.CORS_ORIGIN === '*' 
    ? '*' 
    : (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, etc)
        if (!origin) {
          return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
          callback(null, true);
        } else {
          console.warn(`CORS blocked request from origin: ${origin}`);
          callback(new Error(`Origin ${origin} not allowed by CORS policy`));
        }
      };

  // Apply CORS middleware with appropriate configuration
  app.use(cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin', 
      'X-Requested-With', 
      'Content-Type', 
      'Accept', 
      'Authorization', 
      'Cache-Control', 
      'X-CSRF-Token'
    ],
    exposedHeaders: [
      'Content-Disposition', 
      'Content-Type', 
      'Content-Length', 
      'X-Request-ID'
    ],
    maxAge: 86400 // 24 hours
  }));

  // Log CORS configuration
  console.log(`CORS configured with origin: ${process.env.CORS_ORIGIN || 'dynamic origins'}`);

  // Add additional CORS headers to all responses
  app.use((req, res, next) => {
    // For preflight requests, respond immediately
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', '86400'); // 24 hours
      
      console.log(`Handling OPTIONS request from origin: ${req.headers.origin}`);
      return res.status(204).end();
    }
    
    next();
  });

  // Handle preflight requests for all routes
  app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-CSRF-Token');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    
    console.log(`Handling global OPTIONS request from origin: ${req.headers.origin}`);
    res.status(204).end();
  });
};

module.exports = setupCors;
