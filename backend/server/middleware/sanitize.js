import xssFilters from 'xss-filters';
import sanitizeHtml from 'sanitize-html';

// Sanitize middleware for request body
export const sanitizeBody = (req, res, next) => {
  if (req.body) {
    const sanitizedBody = {};
    
    // Process each field in the request body
    Object.keys(req.body).forEach(key => {
      const value = req.body[key];
      
      if (typeof value === 'string') {
        // Apply both XSS filtering and HTML sanitization
        sanitizedBody[key] = sanitizeHtml(
          xssFilters.inHTMLData(value),
          {
            allowedTags: [], // No HTML tags allowed
            allowedAttributes: {},
            disallowedTagsMode: 'recursiveEscape'
          }
        );
      } else {
        // For non-string values, keep as is
        sanitizedBody[key] = value;
      }
    });
    
    req.body = sanitizedBody;
  }
  
  next();
};

// Sanitize middleware for URL parameters
export const sanitizeParams = (req, res, next) => {
  if (req.params) {
    const sanitizedParams = {};
    
    Object.keys(req.params).forEach(key => {
      const value = req.params[key];
      
      if (typeof value === 'string') {
        sanitizedParams[key] = xssFilters.uriComponentInHTMLData(value);
      } else {
        sanitizedParams[key] = value;
      }
    });
    
    req.params = sanitizedParams;
  }
  
  next();
};

// Sanitize middleware for query parameters
export const sanitizeQuery = (req, res, next) => {
  if (req.query) {
    const sanitizedQuery = {};
    
    Object.keys(req.query).forEach(key => {
      const value = req.query[key];
      
      if (typeof value === 'string') {
        sanitizedQuery[key] = xssFilters.uriComponentInHTMLData(value);
      } else {
        sanitizedQuery[key] = value;
      }
    });
    
    req.query = sanitizedQuery;
  }
  
  next();
};

// Sanitize HTML content for specific fields that need to allow some HTML
export const sanitizeHtmlContent = (content) => {
  return sanitizeHtml(content, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    allowedAttributes: {
      'a': ['href', 'target', 'rel']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      'a': (tagName, attribs) => {
        // Force all links to open in a new window and add security attributes
        return {
          tagName,
          attribs: {
            ...attribs,
            target: '_blank',
            rel: 'noopener noreferrer'
          }
        };
      }
    }
  });
};
