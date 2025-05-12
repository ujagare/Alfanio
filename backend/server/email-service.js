/**
 * Standalone Email Service for Alfanio Website
 * 
 * This script provides a dedicated email service that handles:
 * 1. Brochure requests
 * 2. Contact form submissions
 * 3. Comprehensive logging and error handling
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const winston = require('winston');
const mongoose = require('mongoose');

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
  defaultMeta: { service: 'email-service' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: path.join(emailLogsDir, 'email-errors.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(emailLogsDir, 'email-service.log') 
    })
  ]
});

// Print environment variables (without sensitive info)
logger.info('Environment variables loaded', {
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_SECURE: process.env.EMAIL_SECURE,
  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
  EMAIL_TO: process.env.EMAIL_TO,
  EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
  EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set'
});

// Fix the EMAIL_TO address - use a valid email address
const adminEmail = process.env.EMAIL_USER || 'alfanioindia@gmail.com'; // Fallback to sender email

// Create email transporter with enhanced security
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'alfanioindia@gmail.com',
    pass: process.env.EMAIL_PASS || 'yftofapopqvydrqa'
  },
  tls: {
    minVersion: 'TLSv1.2',
    ciphers: 'HIGH:!aNULL:!MD5',
    rejectUnauthorized: true
  },
  connectionTimeout: 60000, // Increased to 60 seconds connection timeout
  greetingTimeout: 30000,   // Increased to 30 seconds greeting timeout
  socketTimeout: 60000,     // Increased to 60 seconds socket timeout
  debug: true,              // Enable debug output
  logger: true,             // Log information to the console
  pool: true,               // Use connection pooling
  maxConnections: 5,        // Maximum number of connections
  maxMessages: 100,         // Maximum number of messages per connection
  rateDelta: 1000,          // Define the time window in milliseconds
  rateLimit: 5              // Max number of messages in the time window
});

// Verify email configuration on startup
(async () => {
  try {
    // Log all environment variables for debugging (without sensitive info)
    logger.info('Environment variables for email service:', {
      EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
      EMAIL_PORT: process.env.EMAIL_PORT || '465',
      EMAIL_SECURE: process.env.EMAIL_SECURE || 'true',
      EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
      EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set',
      CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5001'
    });
    
    // Verify email configuration
    await transporter.verify();
    logger.info('Email server is ready to send messages');
  } catch (error) {
    logger.error('Email configuration error', { error: error.message, stack: error.stack });
    
    // Try with hardcoded credentials as a fallback
    try {
      logger.info('Trying with fallback email configuration');
      const fallbackTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'alfanioindia@gmail.com',
          pass: 'yftofapopqvydrqa'
        },
        tls: {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: true
        },
        connectionTimeout: 60000, // Increased to 60 seconds connection timeout
        greetingTimeout: 30000,   // Increased to 30 seconds greeting timeout
        socketTimeout: 60000,     // Increased to 60 seconds socket timeout
        debug: true,              // Enable debug output
        logger: true,             // Log information to the console
        pool: true,               // Use connection pooling
        maxConnections: 5,        // Maximum number of connections
        maxMessages: 100,         // Maximum number of messages per connection
        rateDelta: 1000,          // Define the time window in milliseconds
        rateLimit: 5              // Max number of messages in the time window
      });
      
      await fallbackTransporter.verify();
      logger.info('Fallback email configuration is working');
      
      // Replace the global transporter with the working one
      global.transporter = fallbackTransporter;
    } catch (fallbackError) {
      logger.error('Fallback email configuration also failed', { 
        error: fallbackError.message, 
        stack: fallbackError.stack 
      });
    }
  }
})();

// Connect to MongoDB with retry logic
async function connectToMongoDB() {
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      logger.info(`Attempting to connect to MongoDB (attempt ${retries + 1}/${maxRetries})`);
      
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // 5 seconds timeout
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
        
        // Save the failed request to a local file for later processing
        const { saveFallbackData } = require('./config/database');
        saveFallbackData('mongodb-connection-errors', {
          timestamp: new Date(),
          error: error.message
        });
        
        return false;
      }
      
      // Wait before retrying
      if (retries < maxRetries) {
        const waitTime = 2000 * retries; // Exponential backoff
        logger.info(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  logger.error(`Failed to connect to MongoDB after ${maxRetries} attempts`);
  return false;
}

// Initialize MongoDB connection
(async () => {
  try {
    // Log MongoDB URI (without sensitive parts)
    const uriParts = (process.env.MONGODB_URI || '').split('@');
    if (uriParts.length > 1) {
      const sanitizedUri = `mongodb+srv://****:****@${uriParts[1]}`;
      logger.info(`MongoDB URI: ${sanitizedUri}`);
    }
    
    const connected = await connectToMongoDB();
    if (!connected) {
      logger.warn('Using local fallback storage for database operations');
    }
  } catch (error) {
    logger.error('Error during MongoDB initialization', {
      error: error.message,
      stack: error.stack
    });
  }
})();

// Create Express app
const app = express();
// Set default port
const PORT = process.env.EMAIL_SERVICE_PORT || 5002;

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Parse JSON body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'email-service'
  });
});

// Direct brochure download endpoint
app.get('/download-brochure', (req, res) => {
  logger.info('Direct brochure download requested');
  
  // Check both possible brochure file paths
  const pdfPaths = [
    path.join(__dirname, 'assets/Alfanio.pdf'),
    path.join(__dirname, 'assets/Alfanio brochure - 1.pdf')
  ];
  
  let pdfPath = null;
  
  // Find the first existing PDF file
  for (const testPath of pdfPaths) {
    if (fs.existsSync(testPath)) {
      pdfPath = testPath;
      logger.info(`Brochure file found at ${pdfPath}`);
      break;
    }
  }
  
  if (!pdfPath) {
    logger.error('No brochure file found for direct download');
    return res.status(404).send('Brochure file not found');
  }
  
  // Set headers for file download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="Alfanio_Brochure.pdf"');
  
  // Stream the file to the response
  const fileStream = fs.createReadStream(pdfPath);
  fileStream.pipe(res);
  
  logger.info('Brochure download started');
});

// Email sending function with fire-and-forget approach
async function sendEmail(mailOptions) {
  const maxRetries = 5;
  let retryCount = 0;
  let lastError = null;

  // Create a copy of the mail options to avoid reference issues
  const mailOptionsCopy = { ...mailOptions };
  
  // Add from field if not present
  if (!mailOptionsCopy.from) {
    mailOptionsCopy.from = `"${process.env.EMAIL_FROM_NAME || 'Alfanio India'}" <${process.env.EMAIL_USER || 'alfanioindia@gmail.com'}>`;
  }
  
  logger.info(`Attempting to send email to ${mailOptionsCopy.to}`);
  
  // Try to send the email with retries
  while (retryCount < maxRetries) {
    try {
      // Send the email
      const info = await transporter.sendMail(mailOptionsCopy);
      
      logger.info(`Email sent successfully to ${mailOptionsCopy.to}`, {
        messageId: info.messageId,
        response: info.response
      });
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      retryCount++;
      lastError = error;
      
      logger.error(`Failed to send email (attempt ${retryCount}/${maxRetries})`, {
        error: error.message,
        to: mailOptionsCopy.to,
        subject: mailOptionsCopy.subject
      });
      
      // If we've reached max retries, break out
      if (retryCount >= maxRetries) {
        break;
      }
      
      // Exponential backoff
      const backoffTime = Math.pow(2, retryCount) * 1000;
      logger.info(`Waiting ${backoffTime}ms before retry ${retryCount + 1}...`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
  
  // If we get here, all retries failed
  logger.error(`All ${maxRetries} attempts to send email failed`, {
    to: mailOptionsCopy.to,
    subject: mailOptionsCopy.subject,
    lastError: lastError ? lastError.message : 'Unknown error'
  });
  
  // Store the failed email for later retry
  await storeFailedEmail(mailOptionsCopy);
  
  // Try with fallback configuration
  try {
    logger.info(`Attempting with fallback email configuration for ${mailOptionsCopy.to}`);
    
    // Create fallback transporter
    const fallbackTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'alfanioindia@gmail.com',
        pass: 'yftofapopqvydrqa'
      },
      tls: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      },
      connectionTimeout: 60000, // Increased to 60 seconds connection timeout
      greetingTimeout: 30000,   // Increased to 30 seconds greeting timeout
      socketTimeout: 60000,     // Increased to 60 seconds socket timeout
      debug: true,              // Enable debug output
      logger: true,             // Log information to the console
      pool: true,               // Use connection pooling
      maxConnections: 5,        // Maximum number of connections
      maxMessages: 100,         // Maximum number of messages per connection
      rateDelta: 1000,          // Define the time window in milliseconds
      rateLimit: 5              // Max number of messages in the time window
    });
    
    // Send with fallback
    const fallbackInfo = await fallbackTransporter.sendMail(mailOptionsCopy);
    
    logger.info(`Email sent successfully using fallback configuration to ${mailOptionsCopy.to}`, {
      messageId: fallbackInfo.messageId,
      response: fallbackInfo.response
    });
    
    return { success: true, messageId: fallbackInfo.messageId, fallback: true };
  } catch (fallbackError) {
    logger.error(`Fallback email configuration also failed for ${mailOptionsCopy.to}`, {
      error: fallbackError.message
    });
    
    return { success: false, error: lastError ? lastError.message : 'Unknown error' };
  }
}

// Email sending function with attachments
async function sendEmailWithAttachment(mailOptions) {
  const maxRetries = 5;
  let retryCount = 0;
  let lastError = null;

  // Create a copy of the mail options to avoid reference issues
  const mailOptionsCopy = { ...mailOptions };
  
  // Add from field if not present
  if (!mailOptionsCopy.from) {
    mailOptionsCopy.from = `"${process.env.EMAIL_FROM_NAME || 'Alfanio India'}" <${process.env.EMAIL_USER || 'alfanioindia@gmail.com'}>`;
  }
  
  logger.info(`Attempting to send email with attachment to ${mailOptionsCopy.to}`);
  
  // Verify attachments exist
  if (mailOptionsCopy.attachments && mailOptionsCopy.attachments.length > 0) {
    for (const attachment of mailOptionsCopy.attachments) {
      try {
        if (attachment.path) {
          await fs.promises.access(attachment.path);
          logger.info(`Attachment verified: ${attachment.path}`);
        }
      } catch (error) {
        logger.error(`Attachment not found: ${attachment.path}`, { error: error.message });
        return { success: false, error: `Attachment not found: ${attachment.path}` };
      }
    }
  }
  
  // Try to send the email with retries
  while (retryCount < maxRetries) {
    try {
      // Send the email with attachment
      const info = await transporter.sendMail(mailOptionsCopy);
      
      logger.info(`Email with attachment sent successfully to ${mailOptionsCopy.to}`, {
        messageId: info.messageId,
        response: info.response
      });
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      retryCount++;
      lastError = error;
      
      logger.error(`Failed to send email with attachment (attempt ${retryCount}/${maxRetries})`, {
        error: error.message,
        to: mailOptionsCopy.to,
        subject: mailOptionsCopy.subject
      });
      
      // If we've reached max retries, break out
      if (retryCount >= maxRetries) {
        break;
      }
      
      // Exponential backoff with longer waits for attachments
      const backoffTime = Math.pow(2, retryCount) * 2000; // Double the wait time for attachments
      logger.info(`Waiting ${backoffTime}ms before retry ${retryCount + 1}...`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
  
  // If we get here, all retries failed
  logger.error(`All ${maxRetries} attempts to send email with attachment failed`, {
    to: mailOptionsCopy.to,
    subject: mailOptionsCopy.subject,
    lastError: lastError ? lastError.message : 'Unknown error'
  });
  
  // Store the failed email for later retry
  await storeFailedEmail(mailOptionsCopy);
  
  // Try with fallback configuration
  try {
    logger.info(`Attempting with fallback email configuration for attachment email to ${mailOptionsCopy.to}`);
    
    // Create fallback transporter with higher timeouts for attachments
    const fallbackTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'alfanioindia@gmail.com',
        pass: 'yftofapopqvydrqa'
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 120000, // 2 minutes for attachments
      greetingTimeout: 60000,    // 1 minute
      socketTimeout: 120000      // 2 minutes
    });
    
    // Send with fallback
    const fallbackInfo = await fallbackTransporter.sendMail(mailOptionsCopy);
    
    logger.info(`Email with attachment sent successfully using fallback configuration to ${mailOptionsCopy.to}`, {
      messageId: fallbackInfo.messageId,
      response: fallbackInfo.response
    });
    
    return { success: true, messageId: fallbackInfo.messageId, fallback: true };
  } catch (fallbackError) {
    logger.error(`Fallback email configuration also failed for attachment email to ${mailOptionsCopy.to}`, {
      error: fallbackError.message
    });
    
    return { success: false, error: lastError ? lastError.message : 'Unknown error' };
  }
}

// Store failed emails for retry
async function storeFailedEmail(mailOptions) {
  try {
    // Create directory if it doesn't exist
    const failedEmailsDir = path.join(__dirname, 'logs', 'failed-emails');
    if (!fs.existsSync(failedEmailsDir)) {
      fs.mkdirSync(failedEmailsDir, { recursive: true });
    }
    
    // Path to failed emails file
    const failedEmailsPath = path.join(failedEmailsDir, 'failed-emails.json');
    
    // Current failed emails
    let failedEmails = [];
    
    // Read existing failed emails if file exists
    if (fs.existsSync(failedEmailsPath)) {
      try {
        const data = fs.readFileSync(failedEmailsPath, 'utf8');
        failedEmails = JSON.parse(data);
      } catch (error) {
        logger.error('Error reading failed emails file', { error: error.message });
        // If file is corrupted, create a new one
        failedEmails = [];
      }
    }
    
    // Add the failed email with timestamp and retry count
    failedEmails.push({
      timestamp: new Date().toISOString(),
      retryCount: 0,
      lastRetry: null,
      mailOptions: {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        text: mailOptions.text,
        html: mailOptions.html,
        attachments: mailOptions.attachments
      }
    });
    
    // Save the updated list
    fs.writeFileSync(failedEmailsPath, JSON.stringify(failedEmails, null, 2));
    
    logger.info('Failed email stored for retry', { to: mailOptions.to, subject: mailOptions.subject });
    
    // Schedule retry process if not already running
    scheduleFailedEmailRetry();
  } catch (error) {
    logger.error('Error storing failed email', { error: error.message, stack: error.stack });
  }
}

// Schedule retry for failed emails
let retryProcessRunning = false;
async function scheduleFailedEmailRetry() {
  if (retryProcessRunning) {
    return;
  }
  
  retryProcessRunning = true;
  
  try {
    // Path to failed emails file
    const failedEmailsDir = path.join(__dirname, 'logs', 'failed-emails');
    const failedEmailsPath = path.join(failedEmailsDir, 'failed-emails.json');
    
    // Check if file exists
    if (!fs.existsSync(failedEmailsPath)) {
      retryProcessRunning = false;
      return;
    }
    
    // Read failed emails
    const data = fs.readFileSync(failedEmailsPath, 'utf8');
    let failedEmails = JSON.parse(data);
    
    if (failedEmails.length === 0) {
      retryProcessRunning = false;
      return;
    }
    
    logger.info(`Found ${failedEmails.length} failed emails to retry`);
    
    // Process each failed email
    const now = new Date();
    const updatedFailedEmails = [];
    
    for (const failedEmail of failedEmails) {
      // Skip if retried too recently (wait at least 5 minutes between retries)
      if (failedEmail.lastRetry) {
        const lastRetryTime = new Date(failedEmail.lastRetry);
        const timeSinceLastRetry = now - lastRetryTime;
        
        if (timeSinceLastRetry < 5 * 60 * 1000) { // 5 minutes
          updatedFailedEmails.push(failedEmail);
          continue;
        }
      }
      
      // Skip if max retries reached (10 retries)
      if (failedEmail.retryCount >= 10) {
        logger.warn('Max retry count reached for email', { 
          to: failedEmail.mailOptions.to, 
          subject: failedEmail.mailOptions.subject 
        });
        continue; // Don't add to updated list - effectively removing it
      }
      
      try {
        // Try to send the email
        logger.info(`Retrying failed email to ${failedEmail.mailOptions.to}`, { 
          retryCount: failedEmail.retryCount + 1 
        });
        
        await transporter.sendMail(failedEmail.mailOptions);
        
        logger.info(`Successfully resent email to ${failedEmail.mailOptions.to}`);
        // Don't add to updated list - effectively removing it
      } catch (error) {
        logger.error(`Failed to resend email to ${failedEmail.mailOptions.to}`, { 
          error: error.message 
        });
        
        // Update retry count and last retry time
        failedEmail.retryCount += 1;
        failedEmail.lastRetry = now.toISOString();
        updatedFailedEmails.push(failedEmail);
      }
    }
    
    // Save the updated list
    fs.writeFileSync(failedEmailsPath, JSON.stringify(updatedFailedEmails, null, 2));
    
    logger.info(`Retry process completed. ${failedEmails.length - updatedFailedEmails.length} emails sent successfully, ${updatedFailedEmails.length} still pending`);
  } catch (error) {
    logger.error('Error in retry process', { error: error.message, stack: error.stack });
  } finally {
    retryProcessRunning = false;
    
    // Schedule next retry in 5 minutes if there are still failed emails
    setTimeout(scheduleFailedEmailRetry, 5 * 60 * 1000);
  }
}

// Function to send brochure email
async function sendBrochureEmail(name, email) {
  try {
    // Check all possible brochure file paths
    const pdfPaths = [
      path.join(__dirname, 'assets', 'Alfanio.pdf'),
      path.join(__dirname, 'assets', 'brochure.pdf'),
      path.join(__dirname, 'assets', 'Alfanio brochure - 1.pdf'),
      path.join(__dirname, 'public', 'Alfanio.pdf'),
      path.join(__dirname, '..', 'public', 'Alfanio.pdf'),
      path.join(__dirname, '..', 'public', 'brochure.pdf'),
      path.join(__dirname, '..', 'src', 'assets', 'Alfanio.pdf'),
      path.join(__dirname, '..', 'src', 'assets', 'Alfanio brochure - 1.pdf')
    ];
    
    let brochurePath = null;
    
    // Find the first existing PDF file
    for (const testPath of pdfPaths) {
      if (fs.existsSync(testPath)) {
        brochurePath = testPath;
        logger.info(`Using brochure file at ${brochurePath}`);
        break;
      }
    }
    
    if (!brochurePath) {
      logger.error('No brochure file found for email attachment');
      throw new Error('Brochure file not found');
    }
  
    // Email options
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Alfanio Website'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Alfanio - Your Requested Brochure',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://alfanio.com/logo.png" alt="Alfanio Logo" style="max-width: 150px;">
          </div>
          
          <h2 style="color: #333; text-align: center;">Your Requested Brochure</h2>
          
          <p>Hello ${name},</p>
          
          <p>Thank you for your interest in Alfanio. As requested, please find our company brochure attached to this email.</p>
          
          <p>If you have any questions or would like to learn more about our services, please don't hesitate to contact us.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5001'}/download-brochure" 
               style="background-color: #FECC00; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Download Brochure
            </a>
          </div>
          
          <p>Best Regards,<br>The Alfanio Team</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #777; text-align: center;">
            <p> 2023 Alfanio. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'alfanio-brochure.pdf',
          path: brochurePath
        }
      ]
    };
    
    // Send email using the global transporter
    const info = await sendEmailWithAttachment(mailOptions);
    logger.info(`Brochure email sent successfully to ${email}`, { messageId: info.messageId });
    return info;
  } catch (error) {
    logger.error('Failed to send brochure email', { 
      error: error.message,
      stack: error.stack,
      recipient: email
    });
    throw error;
  }
}

// Brochure request endpoint
app.post('/contact/brochure', async (req, res) => {
  logger.info('Brochure request received');
  
  try {
    const { name, email, phone, message } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      logger.warn('Brochure request missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Name and email are required' 
      });
    }
    
    logger.info(`Processing brochure request for ${email}`);
    
    // Save to database (with fallback if MongoDB is unavailable)
    let dbSuccess = false;
    try {
      // Check if mongoose is connected
      if (mongoose.connection.readyState === 1) {
        logger.info('MongoDB is connected, saving brochure request');
        
        // Define the schema if it doesn't exist
        let BrochureRequest;
        try {
          BrochureRequest = mongoose.model('BrochureRequest');
        } catch (e) {
          // Model doesn't exist, create it
          const brochureSchema = new mongoose.Schema({
            name: String,
            email: String,
            phone: String,
            message: String,
            timestamp: { type: Date, default: Date.now }
          });
          
          // Add indexes for better performance
          brochureSchema.index({ email: 1 });
          brochureSchema.index({ timestamp: -1 });
          
          BrochureRequest = mongoose.model('BrochureRequest', brochureSchema);
        }
        
        await new BrochureRequest({
          name,
          email,
          phone,
          message
        }).save();
        
        logger.info(`Brochure request saved to MongoDB for ${email}`);
        dbSuccess = true;
      } else {
        throw new Error('MongoDB not connected');
      }
    } catch (dbError) {
      // If MongoDB save fails, save to local fallback
      logger.error('Failed to save brochure request to MongoDB', { 
        error: dbError.message,
        stack: dbError.stack 
      });
      
      // Import the database module for fallback storage
      try {
        const { saveFallbackData } = require('./config/database');
        saveFallbackData('brochure-requests', {
          name,
          email,
          phone,
          message,
          timestamp: new Date()
        });
        
        logger.info(`Brochure request saved to local fallback for ${email}`);
      } catch (fallbackError) {
        logger.error('Failed to save to fallback storage', {
          error: fallbackError.message,
          stack: fallbackError.stack
        });
      }
    }
    
    // Return success immediately - we'll handle email sending asynchronously
    res.status(200).json({ 
      success: true, 
      message: 'Brochure request received. You will receive an email shortly.',
      downloadUrl: `${process.env.CLIENT_URL || 'http://localhost:5001'}/download-brochure`
    });
    
    // Send email with brochure asynchronously (don't wait for it)
    try {
      logger.info(`Attempting to send brochure email to ${email}`);
      const info = await sendBrochureEmail(name, email);
      logger.info(`Brochure email sent successfully to ${email}`, { messageId: info.messageId });
    } catch (emailError) {
      logger.error('Failed to send brochure email', { 
        error: emailError.message,
        stack: emailError.stack,
        recipient: email
      });
      
      // Save failed email to retry queue
      try {
        const { saveFallbackData } = require('./config/database');
        saveFallbackData('email-retry-queue', {
          type: 'brochure',
          recipient: email,
          name,
          timestamp: new Date(),
          error: emailError.message
        });
        
        logger.info(`Added brochure email to retry queue for ${email}`);
      } catch (retryError) {
        logger.error('Failed to add email to retry queue', {
          error: retryError.message,
          stack: retryError.stack
        });
      }
    }
  } catch (error) {
    logger.error('Error processing brochure request', { 
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request.',
      downloadUrl: `${process.env.CLIENT_URL || 'http://localhost:5001'}/download-brochure`
    });
  }
});

// Contact form endpoint
app.post('/contact', async (req, res) => {
  const { name, email, phone, message, type } = req.body;
  
  logger.info(`Contact form submission received from ${email}`, { type });
  
  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and message are required fields'
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }
  
  try {
    // Process the contact form submission asynchronously
    // Respond to the client immediately while processing continues in the background
    res.status(200).json({
      success: true,
      message: 'Your message has been received. We will contact you shortly.'
    });
    
    // Continue processing in the background
    processContactForm(name, email, phone, message, type).catch(error => {
      logger.error('Background processing of contact form failed', { 
        error: error.message, 
        stack: error.stack 
      });
    });
  } catch (error) {
    // This should rarely happen since we're using the fire-and-forget pattern
    logger.error('Error in contact form endpoint', { 
      error: error.message, 
      stack: error.stack 
    });
    
    // If we haven't sent a response yet, send one
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to process your request. Please try again later.'
      });
    }
  }
});

// Function to process contact form in the background
async function processContactForm(name, email, phone, message, type) {
  try {
    // Get admin email from environment or use default
    const adminEmail = process.env.ADMIN_EMAIL || 'alfanioindia@gmail.com';
    
    logger.info(`Attempting to send contact form notification to admin`);
    
    // Send email to admin
    const info = await sendEmail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Alfanio Website'}" <${process.env.EMAIL_USER || 'alfanioindia@gmail.com'}>`,
      to: adminEmail,
      subject: `New Contact Form Submission - ${type || 'General'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <p><strong>Type:</strong> ${type || 'General'}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          <h3 style="color: #555;">Message:</h3>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="margin-top: 20px; color: #777; font-size: 12px;">
            This email was sent from the contact form on the Alfanio website.
          </p>
        </div>
      `
    });
    
    logger.info('Admin notification sent successfully', { 
      messageId: info.messageId 
    });
    
    // Also send confirmation email to the customer
    const confirmationInfo = await sendEmail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Alfanio Website'}" <${process.env.EMAIL_USER || 'alfanioindia@gmail.com'}>`,
      to: email,
      subject: 'Thank you for contacting Alfanio',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank You for Contacting Us</h2>
          <p>Dear ${name},</p>
          <p>Thank you for reaching out to Alfanio. We have received your message and will get back to you shortly.</p>
          <p>For your reference, here's a copy of your message:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p>If you have any urgent matters, please feel free to call us at ${process.env.COMPANY_PHONE || '+91 12345 67890'}.</p>
          <p>Best regards,<br>The Alfanio Team</p>
        </div>
      `
    });
    
    logger.info('Customer confirmation email sent successfully', { 
      messageId: confirmationInfo.messageId 
    });
    
    return { success: true };
  } catch (error) {
    logger.error('Error processing contact form', { 
      error: error.message, 
      stack: error.stack 
    });
    
    // Store the failed contact form for retry
    storeFailedContactForm(name, email, phone, message, type);
    
    throw error;
  }
}

// Store failed contact form submissions for retry
function storeFailedContactForm(name, email, phone, message, type) {
  try {
    const failedFormsPath = path.join(__dirname, 'data', 'failed-contact-forms.json');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(path.join(__dirname, 'data'))) {
      fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
    }
    
    // Read existing failed forms
    let failedForms = [];
    if (fs.existsSync(failedFormsPath)) {
      const fileContent = fs.readFileSync(failedFormsPath, 'utf8');
      failedForms = JSON.parse(fileContent);
    }
    
    // Add the new failed form
    failedForms.push({
      name,
      email,
      phone,
      message,
      type,
      timestamp: new Date().toISOString(),
      retries: 0
    });
    
    // Save the updated list
    fs.writeFileSync(failedFormsPath, JSON.stringify(failedForms, null, 2));
    
    logger.info('Failed contact form stored for retry');
  } catch (error) {
    logger.error('Error storing failed contact form', { error: error.message });
  }
}

// Start the server
app.listen(PORT, () => {
  logger.info(`Email service running on http://localhost:${PORT}`);
});

// Export the email functions for use in other files
module.exports = {
  sendEmail,
  sendEmailWithAttachment,
  sendBrochureEmail,
  processContactForm
};
