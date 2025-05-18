// Simple Express server for Render deployment
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 5001; // Use consistent port 5001 for production

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS with specific origins for production
const allowedOrigins = [
  'https://alfanio.onrender.com',
  'https://alfanio-ltd.onrender.com',
  'https://alfanio.in',
  'https://www.alfanio.in',
  'http://localhost:3000',
  'http://localhost:5001',
  'http://localhost:5005',
  'http://localhost:10000'
];

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Check if the origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('alfanio')) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      // Allow all origins in development
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Add custom CORS headers to all responses for better compatibility
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Set CORS headers based on origin
  if (origin && (allowedOrigins.includes(origin) || origin.includes('alfanio') || process.env.NODE_ENV !== 'production')) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

// Add security headers to all responses
app.use((req, res, next) => {
  // Protect against XSS attacks
  res.header('X-XSS-Protection', '1; mode=block');

  // Prevent MIME type sniffing
  res.header('X-Content-Type-Options', 'nosniff');

  // Control iframe embedding
  res.header('X-Frame-Options', 'SAMEORIGIN');

  // Enable strict transport security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Set referrer policy
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Set content security policy
  res.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'");

  next();
});

// Rate limiting middleware to prevent abuse
const apiLimiter = (req, res, next) => {
  // Simple in-memory rate limiting
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  const MAX_REQUESTS_PER_IP = 100; // 100 requests per window

  // Store for request counts (in a real app, use Redis or similar)
  const requestCounts = {};

  // Get client IP
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  // Initialize or increment request count
  if (!requestCounts[ip]) {
    requestCounts[ip] = {
      count: 1,
      resetTime: Date.now() + WINDOW_MS
    };
  } else {
    // Reset count if window has passed
    if (Date.now() > requestCounts[ip].resetTime) {
      requestCounts[ip] = {
        count: 1,
        resetTime: Date.now() + WINDOW_MS
      };
    } else {
      // Increment count
      requestCounts[ip].count++;
    }
  }

  // Check if limit exceeded
  if (requestCounts[ip].count > MAX_REQUESTS_PER_IP) {
    console.log(`Rate limit exceeded for IP: ${ip}`);
    return res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.'
    });
  }

  next();
};

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: process.env.EMAIL_SECURE === 'true' || true,
  auth: {
    user: process.env.EMAIL_USER || 'alfanioindia@gmail.com',
    pass: process.env.EMAIL_PASS || 'ogwoqwpovqfcgacz' // App password from 2-step verification
  },
  from: `${process.env.EMAIL_FROM_NAME || 'Alfanio India'} <${process.env.EMAIL_USER || 'alfanioindia@gmail.com'}>`,
  to: process.env.EMAIL_TO || 'alfanioindia@gmail.com'
};

// Log email configuration at startup for verification
console.log('Email configuration loaded:');
console.log('- Host:', EMAIL_CONFIG.host);
console.log('- Port:', EMAIL_CONFIG.port);
console.log('- Secure:', EMAIL_CONFIG.secure);
console.log('- User:', EMAIL_CONFIG.auth.user);
console.log('- From:', EMAIL_CONFIG.from);
console.log('- To:', EMAIL_CONFIG.to);

// Send email function with multiple fallback methods
const sendEmail = async (options) => {
  // Try multiple methods to send email
  const methods = [
    // Method 1: Standard SMTP
    async () => {
      console.log('Trying email method 1: Standard SMTP...');
      const transport = nodemailer.createTransport({
        host: EMAIL_CONFIG.host,
        port: EMAIL_CONFIG.port,
        secure: EMAIL_CONFIG.secure,
        auth: {
          user: EMAIL_CONFIG.auth.user,
          pass: EMAIL_CONFIG.auth.pass
        }
      });

      return await transport.sendMail({
        from: EMAIL_CONFIG.from,
        to: options.to || EMAIL_CONFIG.to,
        subject: options.subject || 'Test Email from Alfanio',
        html: options.html || '<h1>This is a test email</h1>'
      });
    },

    // Method 2: Gmail service
    async () => {
      console.log('Trying email method 2: Gmail service...');
      const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: EMAIL_CONFIG.auth.user,
          pass: EMAIL_CONFIG.auth.pass
        }
      });

      return await transport.sendMail({
        from: EMAIL_CONFIG.from,
        to: options.to || EMAIL_CONFIG.to,
        subject: options.subject || 'Test Email from Alfanio',
        html: options.html || '<h1>This is a test email</h1>'
      });
    },

    // Method 3: Gmail with TLS options
    async () => {
      console.log('Trying email method 3: Gmail with TLS options...');
      const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: EMAIL_CONFIG.auth.user,
          pass: EMAIL_CONFIG.auth.pass
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      return await transport.sendMail({
        from: EMAIL_CONFIG.from,
        to: options.to || EMAIL_CONFIG.to,
        subject: options.subject || 'Test Email from Alfanio',
        html: options.html || '<h1>This is a test email</h1>'
      });
    },

    // Method 4: Direct SMTP with port 587
    async () => {
      console.log('Trying email method 4: Direct SMTP with port 587...');
      const transport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: EMAIL_CONFIG.auth.user,
          pass: EMAIL_CONFIG.auth.pass
        },
        requireTLS: true
      });

      return await transport.sendMail({
        from: EMAIL_CONFIG.from,
        to: options.to || EMAIL_CONFIG.to,
        subject: options.subject || 'Test Email from Alfanio',
        html: options.html || '<h1>This is a test email</h1>'
      });
    }
  ];

  // Try each method until one succeeds
  let lastError = null;

  for (let i = 0; i < methods.length; i++) {
    try {
      console.log(`Attempting to send email using method ${i + 1}/${methods.length}...`);
      console.log('Sending to:', options.to || EMAIL_CONFIG.to);
      console.log('Subject:', options.subject || 'Test Email from Alfanio');

      const info = await methods[i]();

      console.log(`Email sent successfully using method ${i + 1}:`, info.messageId);

      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
        method: i + 1
      };
    } catch (error) {
      console.error(`Method ${i + 1} failed:`, error.message);
      lastError = error;
    }
  }

  // If all methods fail, return error
  console.error('All email sending methods failed');

  return {
    success: false,
    error: lastError ? lastError.message : 'Unknown error'
  };
};

// Serve static files if they exist
const staticPaths = [
  path.join(__dirname, 'dist'),
  path.join(__dirname, '../frontend/dist'),
  path.join(__dirname, '../frontend/build'),
  path.join(__dirname, 'public')
];

staticPaths.forEach(staticPath => {
  if (fs.existsSync(staticPath)) {
    console.log('Serving static files from:', staticPath);
    app.use(express.static(staticPath));
  }
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'API is running',
    endpoints: {
      test: '/api/test',
      sendEmail: '/api/send-email',
      brochure: '/api/contact/brochure',
      download: '/api/brochure/download'
    }
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

// Contact form endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    console.log('Received email request:', req.body);

    // Save to database if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      try {
        const contact = new Contact({
          name: name || 'Not provided',
          email: email || 'Not provided',
          phone: phone || 'Not provided',
          message: message || 'Not provided'
        });

        await contact.save();
        console.log('Contact form saved to database');
      } catch (dbError) {
        console.error('Error saving contact form to database:', dbError.message);
        // Continue with email sending even if database save fails
      }
    } else {
      console.log('MongoDB not connected, skipping database save');
    }

    // Send email
    const emailResult = await sendEmail({
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name || 'Not provided'}</p>
        <p><strong>Email:</strong> ${email || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Message:</strong> ${message || 'Not provided'}</p>
      `
    });

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Email sent successfully',
        emailId: emailResult.messageId,
        savedToDatabase: mongoose.connection.readyState === 1
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: emailResult.error,
        savedToDatabase: mongoose.connection.readyState === 1
      });
    }
  } catch (error) {
    console.error('API error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Brochure request endpoint
app.post('/api/contact/brochure', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    console.log('Received brochure request:', req.body);

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Save to database if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      try {
        const brochureRequest = new BrochureRequest({
          name: name || 'Not provided',
          email: email || 'Not provided',
          phone: phone || 'Not provided',
          message: message || 'Not provided',
          type: 'brochure'
        });

        await brochureRequest.save();
        console.log('Brochure request saved to database');
      } catch (dbError) {
        console.error('Error saving brochure request to database:', dbError.message);
        // Continue with email sending even if database save fails
      }
    } else {
      console.log('MongoDB not connected, skipping database save');
    }

    // Send email
    const emailResult = await sendEmail({
      subject: 'New Brochure Request',
      html: `
        <h2>New Brochure Request</h2>
        <p><strong>Name:</strong> ${name || 'Not provided'}</p>
        <p><strong>Email:</strong> ${email || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Message:</strong> ${message || 'Not provided'}</p>
      `
    });

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Brochure request received and email sent successfully',
        emailId: emailResult.messageId,
        savedToDatabase: mongoose.connection.readyState === 1
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: emailResult.error,
        savedToDatabase: mongoose.connection.readyState === 1
      });
    }
  } catch (error) {
    console.error('API error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Brochure download endpoint
app.get('/api/brochure/download', (req, res) => {
  // Log brochure download request
  console.log('Brochure download requested from:', req.ip, 'User-Agent:', req.headers['user-agent']);

  // Try multiple locations for the brochure file
  const possiblePaths = [
    path.join(__dirname, 'assets/brochure.pdf'),
    path.join(__dirname, 'assets/Alfanio.pdf'),
    path.join(__dirname, '../public/brochure.pdf'),
    path.join(__dirname, '../dist/brochure.pdf'),
    path.join(__dirname, 'server/assets/brochure.pdf'),
    path.join(__dirname, 'server/assets/Alfanio.pdf'),
    path.join(__dirname, 'public/brochure.pdf'),
    path.join(__dirname, 'public/Alfanio.pdf'),
    path.join(__dirname, 'dist/brochure.pdf'),
    path.join(__dirname, 'dist/Alfanio.pdf')
  ];

  console.log('Searching for brochure in the following locations:');
  possiblePaths.forEach(p => console.log(`- ${p}`));

  // Find the first existing file
  const brochurePath = possiblePaths.find(p => {
    try {
      return fs.existsSync(p);
    } catch (error) {
      console.error(`Error checking path ${p}:`, error);
      return false;
    }
  });

  if (!brochurePath) {
    console.error('Brochure file not found in any location');

    // If no brochure file is found, return a simple HTML response
    return res.send(`
      <html>
        <head>
          <title>Brochure Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            h1 { color: #FECC00; }
            .message { background: #f5f5f5; padding: 20px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Brochure Not Available</h1>
          <div class="message">
            <p>We're sorry, but the brochure is currently not available for download.</p>
            <p>Please contact us at alfanioindia@gmail.com for more information.</p>
          </div>
        </body>
      </html>
    `);
  }

  // Set appropriate headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="Alfanio-Brochure.pdf"');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

  try {
    // Get file stats for Content-Length header
    const stat = fs.statSync(brochurePath);
    res.setHeader('Content-Length', stat.size);

    console.log('Serving brochure from:', brochurePath);

    // Create a read stream and pipe it to the response
    const fileStream = fs.createReadStream(brochurePath);

    // Handle file stream errors
    fileStream.on('error', (error) => {
      console.error('Error streaming brochure file:', error);
      if (!res.headersSent) {
        res.status(500).send('Error streaming brochure file');
      }
    });

    // Handle successful download
    fileStream.on('end', () => {
      console.log('Brochure download completed successfully');

      // Save download record to MongoDB if connected
      if (mongoose.connection.readyState === 1) {
        try {
          // Create a simple schema for brochure downloads if it doesn't exist
          const BrochureDownload = mongoose.models.BrochureDownload ||
            mongoose.model('BrochureDownload', new mongoose.Schema({
              ip: String,
              userAgent: String,
              timestamp: { type: Date, default: Date.now }
            }));

          // Save download record
          new BrochureDownload({
            ip: req.ip,
            userAgent: req.headers['user-agent']
          }).save().then(() => {
            console.log('Brochure download record saved to database');
          }).catch(err => {
            console.error('Error saving brochure download record:', err);
          });
        } catch (dbError) {
          console.error('Error saving brochure download to database:', dbError);
        }
      }
    });

    // Pipe the file to the response
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error serving brochure file:', error);
    res.status(500).send('Error serving brochure file');
  }
});

// Root endpoint - serve website
app.get('/', (req, res) => {
  // Check multiple possible locations for index.html
  const possiblePaths = [
    path.join(__dirname, 'dist/index.html'),
    path.join(__dirname, '../frontend/dist/index.html'),
    path.join(__dirname, '../frontend/build/index.html'),
    path.join(__dirname, 'public/index.html')
  ];

  // Find the first existing file
  const indexPath = possiblePaths.find(p => {
    try {
      return fs.existsSync(p);
    } catch (error) {
      console.error(`Error checking path ${p}:`, error);
      return false;
    }
  });

  if (indexPath) {
    console.log('Serving frontend from:', indexPath);
    return res.sendFile(indexPath);
  }

  // If no index.html is found, serve a simple HTML page
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Alfanio India</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        h1 {
          color: #FECC00;
          border-bottom: 2px solid #FECC00;
          padding-bottom: 10px;
        }
        .card {
          background: #f5f5f5;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .btn {
          display: inline-block;
          background: #FECC00;
          color: #000;
          padding: 10px 20px;
          border-radius: 4px;
          text-decoration: none;
          font-weight: bold;
          margin-top: 10px;
        }
        .btn:hover {
          background: #e5b800;
        }
      </style>
    </head>
    <body>
      <h1>Welcome to Alfanio India</h1>

      <div class="card">
        <h2>About Us</h2>
        <p>Alfanio India is a leading manufacturer of high-quality industrial products. We specialize in providing innovative solutions for various industries.</p>
      </div>

      <div class="card">
        <h2>Our Products</h2>
        <p>We offer a wide range of products designed to meet the highest standards of quality and performance.</p>
        <a href="/api/brochure/download" class="btn">Download Brochure</a>
      </div>

      <div class="card">
        <h2>Contact Us</h2>
        <p>For more information about our products and services, please contact us:</p>
        <p>Email: alfanioindia@gmail.com</p>
        <p>Phone: +91 XXXXXXXXXX</p>
      </div>

      <footer>
        <p>&copy; 2025 Alfanio India. All rights reserved.</p>
      </footer>
    </body>
    </html>
  `);
});

// Catch-all route for other paths
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  // Redirect to root
  res.redirect('/');
});

// MongoDB connection with retry logic
const connectToMongoDB = async (retries = 5, delay = 5000) => {
  // Skip MongoDB connection if SKIP_MONGODB is set
  if (process.env.SKIP_MONGODB === 'true') {
    console.log('MongoDB connection skipped due to SKIP_MONGODB=true');
    return false;
  }

  let currentRetry = 0;

  // Get MongoDB URI from environment variables
  const getMongoURI = () => {
    if (process.env.MONGODB_URI) {
      return process.env.MONGODB_URI;
    }

    // Construct URI from individual parts if MONGODB_URI is not provided
    const username = encodeURIComponent(process.env.MONGO_USERNAME || 'Alfanioindia');
    const password = encodeURIComponent(process.env.MONGO_PASSWORD || '10Nu2FEpmRZuNFYf'); // Updated password from server/.env.fixed
    const cluster = process.env.MONGO_CLUSTER || 'cluster0.0wbdp.mongodb.net';
    const dbName = process.env.MONGO_DB_NAME || 'Alfanio';

    return `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority`;
  };

  while (currentRetry < retries) {
    try {
      console.log(`MongoDB connection attempt ${currentRetry + 1}/${retries}`);

      const mongoURI = getMongoURI();
      console.log(`Connecting to MongoDB Atlas...`);

      // Connect to MongoDB with modern options
      await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 5,
        retryWrites: true,
        w: 'majority'
      });

      console.log('MongoDB connected successfully');

      // Set up connection event listeners
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        if (err.name === 'MongoNetworkError') {
          console.log('Attempting to reconnect to MongoDB...');
          setTimeout(() => connectToMongoDB(retries, delay), delay);
        }
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected. Attempting to reconnect...');
        setTimeout(() => connectToMongoDB(retries, delay), delay);
      });

      return true;
    } catch (error) {
      currentRetry++;
      console.error(`MongoDB connection error (attempt ${currentRetry}/${retries}):`, error.message);

      if (currentRetry >= retries) {
        console.error('Maximum MongoDB connection retries reached.');
        return false;
      }

      // Wait before next retry with exponential backoff
      const waitTime = delay * Math.pow(1.5, currentRetry);
      console.log(`Waiting ${waitTime}ms before next connection attempt...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  return false;
};

// Define MongoDB schemas
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const brochureRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  message: String,
  type: { type: String, default: 'brochure' },
  createdAt: { type: Date, default: Date.now }
});

// Create models
const Contact = mongoose.model('Contact', contactSchema);
const BrochureRequest = mongoose.model('BrochureRequest', brochureRequestSchema);

// Start server
const startServer = async () => {
  // Connect to MongoDB
  let isMongoConnected = false;
  if (process.env.SKIP_MONGODB !== 'true') {
    isMongoConnected = await connectToMongoDB();
    console.log(`MongoDB connection status: ${isMongoConnected ? 'Connected' : 'Failed to connect'}`);
  } else {
    console.log('MongoDB connection skipped');
  }

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Server URL: http://localhost:${PORT}`);
    console.log(`API URL: http://localhost:${PORT}/api`);
    console.log(`MongoDB: ${isMongoConnected ? 'Connected' : 'Not connected'}`);

    // Log email configuration
    console.log('Email configuration:');
    console.log('- Host:', EMAIL_CONFIG.host);
    console.log('- Port:', EMAIL_CONFIG.port);
    console.log('- Secure:', EMAIL_CONFIG.secure);
    console.log('- User:', EMAIL_CONFIG.auth.user);
    console.log('- From:', EMAIL_CONFIG.from);
    console.log('- To:', EMAIL_CONFIG.to);
  });
};

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Don't expose error details in production
  const errorMessage = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message;

  res.status(500).json({
    success: false,
    message: errorMessage,
    error: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  // Log to file or monitoring service in production

  // Give the server a chance to finish current requests
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
  // Log to file or monitoring service in production
});

// Start the server
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
