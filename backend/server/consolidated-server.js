/**
 * Consolidated Server for Alfanio Website
 * 
 * This server combines web serving, API endpoints, and email functionality
 * in a single, robust application with proper error handling.
 */

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';
import fs from 'fs';
import nodemailer from 'nodemailer';
import winston from 'winston';
import bodyParser from 'body-parser';

// Configure environment variables
dotenv.config();

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create email logs directory
const emailLogsDir = path.join(logsDir, 'email');
if (!fs.existsSync(emailLogsDir)) {
  fs.mkdirSync(emailLogsDir, { recursive: true });
}

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'alfanio-server' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log') 
    })
  ]
});

// Create Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Apply middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: true
}));

app.use(helmet());
app.use(compression());

// Configure body parser with higher limits and timeouts
app.use(bodyParser.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(bodyParser.urlencoded({
  extended: true,
  limit: '10mb'
}));

// Handle request timeouts
app.use((req, res, next) => {
  // Set timeout to 30 seconds
  req.setTimeout(30000);
  
  // Handle request aborted
  req.on('aborted', () => {
    logger.warn('Request aborted by client');
    if (!res.headersSent) {
      res.status(408).json({
        success: false,
        message: 'Request timeout. Please try again.'
      });
    }
  });

  res.setHeader('Content-Type', 'application/json');
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Create email transporter with enhanced security
const createTransporter = () => {
  try {
    // Validate required email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email configuration missing: EMAIL_USER and EMAIL_PASS are required');
    }

    const config = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '465'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        minVersion: 'TLSv1.2',
        ciphers: 'HIGH:!aNULL:!MD5',
        rejectUnauthorized: true
      },
      connectionTimeout: 20000, // 20 seconds connection timeout
      greetingTimeout: 20000,   // 20 seconds greeting timeout
      socketTimeout: 20000,     // 20 seconds socket timeout
      debug: process.env.NODE_ENV !== 'production',
      logger: true,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5
    };

    logger.info('Creating email transporter with config:', {
      ...config,
      auth: {
        user: config.auth.user ? 'Set' : 'Not set',
        pass: config.auth.pass ? 'Set' : 'Not set'
      }
    });

    return nodemailer.createTransport(config);
  } catch (error) {
    logger.error('Error creating email transporter:', error);
    throw error;
  }
};

// Initialize email transporter
let transporter;
try {
  transporter = createTransporter();
  logger.info('Email transporter created successfully');
} catch (error) {
  logger.error('Failed to create email transporter:', error);
}

// Function to send email with retries
const sendEmailWithRetry = async (mailOptions, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      logger.info('Email sent successfully:', info);
      return info;
    } catch (error) {
      logger.error(`Email send attempt ${attempt} failed:`, error);
      if (attempt === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

// Connect to MongoDB with retry logic
async function connectToMongoDB() {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      logger.info(`Attempting to connect to MongoDB (attempt ${retries + 1}/${maxRetries})`);
      
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000, // 10 seconds timeout
        retryWrites: true
      });
      
      logger.info('Successfully connected to MongoDB Atlas');
      return true;
    } catch (error) {
      retries++;
      
      // Log detailed error information
      logger.error(`MongoDB connection failed (attempt ${retries}/${maxRetries})`, {
        error: error.message,
        stack: error.stack,
        code: error.code
      });
      
      // Check if this is an IP whitelist issue
      if (error.message.includes('IP address') || error.message.includes('whitelist') || 
          error.message.includes('network') || error.message.includes('access-list')) {
        logger.error('MongoDB connection failed due to IP whitelist restrictions', {
          message: `Your current IP address is not whitelisted in MongoDB Atlas. 
                   Please add your IP address to the Network Access list in MongoDB Atlas.`
        });
      }
      
      // Wait before retrying
      if (retries < maxRetries) {
        const waitTime = 2000 * retries; // Exponential backoff
        logger.info(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  logger.error('Failed to connect to MongoDB after multiple attempts');
  return false;
}

// Create a schema for contact form submissions
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  message: { type: String, required: true },
  type: { type: String, default: 'general' },
  createdAt: { type: Date, default: Date.now }
});

// Create a schema for brochure requests
const brochureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create models
let Contact, Brochure;
try {
  Contact = mongoose.model('Contact', contactSchema);
  Brochure = mongoose.model('Brochure', brochureSchema);
  logger.info('MongoDB models created successfully');
} catch (error) {
  logger.error('Error creating MongoDB models:', error);
}

// API endpoint for contact form
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message, type } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and message are required'
    });
  }

  // Set a flag to track if the request is still active
  let requestAborted = false;
  req.on('aborted', () => {
    requestAborted = true;
  });

  logger.info(`Contact form submission received from ${email}`, { type });
  
  try {
    // Send email notification with retry
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Alfanio Website'}" <${process.env.EMAIL_USER || 'alfanioindia@gmail.com'}>`,
      to: process.env.EMAIL_TO || 'info@alfanio.com',
      subject: `New Contact Form Submission: ${type || 'General Inquiry'}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Type:</strong> ${type || 'General Inquiry'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    try {
      await sendEmailWithRetry(mailOptions);
      
      // Check if request was aborted during email sending
      if (requestAborted) {
        logger.warn('Request aborted during email processing');
        return;
      }
      
      // Try to save to MongoDB if connected
      let contactSaved = false;
      if (mongoose.connection.readyState === 1) {
        try {
          const newContact = new Contact({
            name,
            email,
            phone,
            message,
            type
          });
          
          await newContact.save();
          contactSaved = true;
          logger.info(`Contact form data saved to MongoDB: ${newContact._id}`);
        } catch (dbError) {
          logger.error('Error saving contact form to MongoDB:', dbError);
        }
      } else {
        logger.warn('MongoDB not connected, skipping database save');
      }

      // Final check for aborted request
      if (requestAborted) {
        logger.warn('Request aborted before sending response');
        return;
      }

      return res.status(200).json({
        success: true,
        message: 'Your message has been sent successfully!',
        saved: contactSaved
      });
    } catch (emailError) {
      // Check if request was aborted
      if (requestAborted) {
        logger.warn('Request aborted during error handling');
        return;
      }

      logger.error('Error sending email:', emailError);
      
      // Store failed email for retry
      const failedEmailPath = storeFailedEmail(mailOptions, emailError);
      logger.info(`Failed email stored for retry: ${failedEmailPath}`);

      return res.status(500).json({
        success: false,
        message: 'Failed to send email. Your message has been saved and will be processed later.'
      });
    }
  } catch (error) {
    // Final check for aborted request
    if (requestAborted) {
      logger.warn('Request aborted during error handling');
      return;
    }

    logger.error('Unexpected error in contact form endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
});

// API endpoint for brochure requests
app.post('/api/contact/brochure', async (req, res) => {
  const { name, email } = req.body;
  
  logger.info(`Brochure request received from ${email}`);
  
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Name and email are required'
    });
  }
  
  try {
    // Save to MongoDB
    let brochureSaved = false;
    
    if (mongoose.connection.readyState === 1) {
      try {
        const newBrochure = new Brochure({
          name,
          email
        });
        
        await newBrochure.save();
        brochureSaved = true;
        logger.info(`Brochure request saved to MongoDB: ${newBrochure._id}`);
      } catch (dbError) {
        logger.error('Error saving brochure request to MongoDB:', dbError);
      }
    } else {
      logger.warn('MongoDB not connected, skipping database save');
    }
    
    // Check if we have the brochure file
    const brochurePaths = [
      path.join(__dirname, 'assets', 'Alfanio.pdf'),
      path.join(__dirname, 'assets', 'brochure.pdf'),
      path.join(__dirname, 'assets', 'Alfanio brochure - 1.pdf'),
      path.join(__dirname, '..', 'public', 'Alfanio.pdf'),
      path.join(__dirname, '..', 'src', 'assets', 'Alfanio.pdf')
    ];
    
    let brochurePath = null;
    for (const testPath of brochurePaths) {
      if (fs.existsSync(testPath)) {
        brochurePath = testPath;
        break;
      }
    }
    
    // Send email with brochure
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Alfanio Website'}" <${process.env.EMAIL_USER || 'alfanioindia@gmail.com'}>`,
      to: email,
      subject: 'Alfanio - Your Requested Brochure',
      html: `
        <h2>Thank you for your interest in Alfanio!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for requesting our brochure. Please find it attached to this email.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>The Alfanio Team</p>
      `,
      attachments: brochurePath ? [
        {
          filename: 'Alfanio-Brochure.pdf',
          path: brochurePath
        }
      ] : []
    };
    
    // Also send notification to admin
    const adminMailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Alfanio Website'}" <${process.env.EMAIL_USER || 'alfanioindia@gmail.com'}>`,
      to: process.env.EMAIL_TO || 'info@alfanio.com',
      subject: 'New Brochure Request',
      html: `
        <h2>New Brochure Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      `
    };
    
    try {
      // Send brochure to user
      if (brochurePath) {
        await sendEmailWithRetry(mailOptions);
        logger.info(`Brochure email sent to ${email}`);
      } else {
        logger.warn('Brochure file not found, email not sent');
      }
      
      // Send notification to admin
      await sendEmailWithRetry(adminMailOptions);
      logger.info('Admin notification for brochure request sent');
      
      return res.status(200).json({
        success: true,
        message: brochurePath 
          ? 'Thank you for your interest! The brochure has been sent to your email.'
          : 'Thank you for your interest! Our team will contact you shortly.',
        saved: brochureSaved,
        downloadUrl: brochurePath ? '/brochures/download' : null
      });
    } catch (emailError) {
      logger.error('Error sending brochure email:', emailError);
      
      // Store failed emails for retry
      if (brochurePath) {
        const failedEmailPath = storeFailedEmail(mailOptions, emailError);
        logger.info(`Failed email stored for retry: ${failedEmailPath}`);
      }
      const failedAdminEmailPath = storeFailedEmail(adminMailOptions, emailError);
      logger.info(`Failed admin email stored for retry: ${failedAdminEmailPath}`);
      
      // If we saved to the database or have the brochure file, return partial success
      if (brochureSaved || brochurePath) {
        return res.status(200).json({
          success: true,
          message: 'Your request has been received, but there was an issue sending the email. You can download the brochure directly.',
          downloadUrl: '/brochures/download'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'There was an issue processing your request. Please try again later.'
      });
    }
  } catch (error) {
    logger.error('Unexpected error in brochure endpoint:', error);
    
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
});

// Direct download endpoint for brochure
app.get('/brochures/download', (req, res) => {
  logger.info('Direct brochure download requested');
  
  // Check all possible brochure file paths
  const pdfPaths = [
    path.join(__dirname, 'assets', 'Alfanio.pdf'),
    path.join(__dirname, 'assets', 'brochure.pdf'),
    path.join(__dirname, 'assets', 'Alfanio brochure - 1.pdf'),
    path.join(__dirname, '..', 'public', 'Alfanio.pdf'),
    path.join(__dirname, '..', 'src', 'assets', 'Alfanio.pdf')
  ];
  
  for (const pdfPath of pdfPaths) {
    if (fs.existsSync(pdfPath)) {
      logger.info(`Serving brochure from: ${pdfPath}`);
      return res.download(pdfPath, 'Alfanio-Brochure.pdf');
    }
  }
  
  logger.error('Brochure file not found for direct download');
  return res.status(404).json({
    success: false,
    message: 'Brochure file not found. Please contact us directly for assistance.'
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working!',
    time: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    email: !!transporter ? 'configured' : 'not configured'
  });
});

// Serve static files from multiple possible locations with caching
const staticOptions = {
  etag: true,
  lastModified: true,
  maxAge: '1d'
};

// Try to find the static files directory
const staticPaths = [
  path.join(__dirname, '..', 'dist'),
  path.join(__dirname, '..', 'public'),
  path.join(__dirname, 'public')
];

let staticPath = null;
for (const testPath of staticPaths) {
  if (fs.existsSync(testPath)) {
    staticPath = testPath;
    logger.info(`Serving static files from: ${staticPath}`);
    app.use(express.static(testPath, staticOptions));
    break;
  }
}

// Serve brochure files from multiple locations
app.use('/brochures', express.static(path.join(__dirname, 'assets')));
app.use('/brochures', express.static(path.join(__dirname, '..', 'public')));
app.use('/brochures', express.static(path.join(__dirname, '..', 'src', 'assets')));

// For any other GET request, serve the React app
app.get('*', (req, res) => {
  if (staticPath && fs.existsSync(path.join(staticPath, 'index.html'))) {
    res.sendFile(path.join(staticPath, 'index.html'));
  } else {
    res.status(404).send('Frontend files not found. Please build the frontend first.');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  
  // Don't expose internal error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(500).json({
    success: false,
    message
  });
});

// Start the server
async function startServer() {
  try {
    // Try to connect to MongoDB first
    await connectToMongoDB();
    
    // Start the server
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      logger.info(`Server accessible at http://localhost:${PORT}`);
    });
    
    // Verify email configuration
    if (transporter) {
      try {
        await transporter.verify();
        logger.info('Email configuration verified successfully');
      } catch (error) {
        logger.error('Email verification failed:', error);
      }
    }
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
});

// Start the server
startServer();

// Function to store failed email in local storage for retry
function storeFailedEmail(mailOptions, error) {
  try {
    const failedEmailsDir = path.join(emailLogsDir, 'failed');
    if (!fs.existsSync(failedEmailsDir)) {
      fs.mkdirSync(failedEmailsDir, { recursive: true });
    }
    
    const failedEmail = {
      mailOptions,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    
    const filename = path.join(
      failedEmailsDir, 
      `failed-email-${Date.now()}.json`
    );
    
    fs.writeFileSync(filename, JSON.stringify(failedEmail, null, 2));
    logger.info(`Failed email stored for retry: ${filename}`);
    
    return filename;
  } catch (storeError) {
    logger.error('Error storing failed email:', storeError);
    return null;
  }
}
