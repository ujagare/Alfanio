/**
 * Simple CORS middleware for Alfanio
 * This is a simplified version of the CORS middleware that allows all origins
 */

// Simple logger function
const log = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({ timestamp, level, message, ...data }));
};

/**
 * Apply CORS headers to all responses
 */
export const applyCors = (req, res, next) => {
  // Allow all origins
  res.header('Access-Control-Allow-Origin', '*');
  
  // Allow common methods
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Allow common headers
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Log CORS headers for debugging
  log('info', 'Applied CORS headers', {
    origin: req.headers.origin,
    method: req.method,
    path: req.path
  });
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    log('info', 'Handling OPTIONS request', { origin: req.headers.origin });
    return res.status(204).end();
  }
  
  next();
};

/**
 * Setup CORS middleware for Express app
 */
export const setupSimpleCors = (app) => {
  log('info', 'Setting up simple CORS middleware');
  
  // Apply CORS headers to all responses
  app.use(applyCors);
  
  // Handle OPTIONS requests for all routes
  app.options('*', (req, res) => {
    log('info', 'Handling global OPTIONS request', { origin: req.headers.origin });
    
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    
    res.status(204).end();
  });
  
  log('info', 'Simple CORS middleware setup complete');
};

export default setupSimpleCors;
