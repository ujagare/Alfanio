/**
 * Direct CORS middleware for Alfanio
 * This is a very direct approach to CORS that should work in all environments
 */

// Simple logger function
const log = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({ timestamp, level, message, ...data }));
};

/**
 * Setup direct CORS middleware for Express app
 */
const setupDirectCors = (app) => {
  log('info', 'Setting up direct CORS middleware');
  
  // Add CORS headers directly to all responses
  app.use((req, res, next) => {
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Log request details for debugging
    log('info', 'CORS request received', {
      origin: req.headers.origin || 'No origin',
      method: req.method,
      path: req.path,
      headers: {
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent']
      }
    });
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      log('info', 'Handling OPTIONS request', { 
        origin: req.headers.origin,
        path: req.path
      });
      
      // Set additional headers for preflight
      res.header('Access-Control-Max-Age', '86400'); // 24 hours
      
      // Respond to preflight request
      return res.status(204).end();
    }
    
    next();
  });
  
  log('info', 'Direct CORS middleware setup complete');
};

export default setupDirectCors;
