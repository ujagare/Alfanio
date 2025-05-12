import logger from './logger.js';

export const errorHandler = {
  // Log errors without exposing internals
  logError: (err, req) => {
    logger.error('Error details:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
  },

  // Handle API errors
  handleApiError: (err, req, res) => {
    errorHandler.logError(err, req);
    
    // Don't expose error details in production
    const message = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message;

    res.status(err.status || 500).json({
      success: false,
      message
    });
  },

  // Handle 404 errors
  handle404: (req, res) => {
    logger.warn(`404 Not Found: ${req.method} ${req.path}`);
    res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  },

  // Handle validation errors
  handleValidationError: (err, req, res) => {
    logger.warn('Validation error:', err);
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }
};

export default errorHandler;
